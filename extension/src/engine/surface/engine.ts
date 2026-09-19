/**
 * REFINZI — Universal Text Surface Engine
 * 
 * Manages the single active-surface lifecycle across any webpage:
 * - Listens for focus and interaction events globally via event delegation
 * - Ensures exactly ONE active TextSurface and exactly ONE docked Orb
 * - Eliminates duplicate Orbs and duplicate generations
 * - Enforces safety exclusions (no passwords, sensitive fields, etc.)
 * - Handles window resize, scrolling, SPA page route transitions, and dynamic editors
 */

import { TextSurface } from './types';
import { SurfaceFactory } from './factory';
import { isSafeEditableElement } from './safety';

export interface UniversalEngineCallbacks {
  onSurfaceActivated: (surface: TextSurface) => void;
  onSurfaceDeactivated: (surface: TextSurface) => void;
  onPositionUpdate: (surface: TextSurface) => void;
}

export class UniversalTextEngine {
  private activeSurface: TextSurface | null = null;
  private callbacks: UniversalEngineCallbacks;
  private isRunning: boolean = false;
  private blurTimeout: number | null = null;
  private mutationObserver: MutationObserver | null = null;

  // Bound event listeners for clean destruction
  private boundOnFocusIn = (e: FocusEvent) => this.handleFocusIn(e);
  private boundOnFocusOut = (e: FocusEvent) => this.handleFocusOut(e);
  private boundOnPointerDown = (e: PointerEvent) => this.handlePointerDown(e);
  private boundOnPointerOver = (e: PointerEvent) => this.handlePointerOver(e);
  private boundOnScroll = () => this.handleGeometryChange();
  private boundOnResize = () => this.handleGeometryChange();
  private boundOnPopState = () => this.handleNavigationChange();

  constructor(callbacks: UniversalEngineCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * Starts universal text surface tracking across the webpage.
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Use capturing phase for focus events to catch all inputs across frameworks
    document.addEventListener('focusin', this.boundOnFocusIn, true);
    document.addEventListener('focusout', this.boundOnFocusOut, true);
    document.addEventListener('pointerdown', this.boundOnPointerDown, true);
    document.addEventListener('pointerover', this.boundOnPointerOver, { passive: true });

    // Passive geometry listeners
    window.addEventListener('scroll', this.boundOnScroll, { passive: true, capture: true });
    window.addEventListener('resize', this.boundOnResize, { passive: true });
    window.addEventListener('popstate', this.boundOnPopState, { passive: true });

    // Observe dynamic DOM removals to clean up surface if removed by SPA
    this.startDOMObserver();

    // If an editable element is already focused upon init, activate it immediately
    this.checkCurrentActiveElement();
  }

  /**
   * Gets the currently active TextSurface, if any.
   */
  getActiveSurface(): TextSurface | null {
    if (this.activeSurface && this.activeSurface.detect()) {
      return this.activeSurface;
    }
    return null;
  }

  private handleFocusIn(e: FocusEvent): void {
    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
      this.blurTimeout = null;
    }

    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    this.tryActivateElement(target);
  }

  private handlePointerDown(e: PointerEvent): void {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    // If clicking directly into the Orb host or undo toast, do not deactivate
    if (
      target.hasAttribute('data-refinzi-orb-host') ||
      target.closest('[data-refinzi-orb-host], .refinzi-orb-host, .undo-toast')
    ) {
      if (this.blurTimeout) {
        clearTimeout(this.blurTimeout);
        this.blurTimeout = null;
      }
      return;
    }

    // Try activating target if it's an editable surface
    if (isSafeEditableElement(target)) {
      this.tryActivateElement(target);
    }
  }

  private handleFocusOut(e: FocusEvent): void {
    // Check where focus moved
    const related = e.relatedTarget;
    if (related instanceof HTMLElement) {
      // If focus moved to Refinzi's own Orb or toast, maintain active surface!
      if (
        related.hasAttribute('data-refinzi-orb-host') ||
        related.closest('[data-refinzi-orb-host], .refinzi-orb-host, .undo-toast')
      ) {
        return;
      }

      // If focus moved to another editable surface, focusin will handle the switch
      if (isSafeEditableElement(related)) {
        return;
      }
    }

    // Grace period to prevent flicker during fast clicks or focus shifts
    if (this.blurTimeout) clearTimeout(this.blurTimeout);
    this.blurTimeout = window.setTimeout(() => {
      // If activeElement is still the active surface or inside Orb, don't deactivate
      const currentActive = document.activeElement;
      if (
        this.activeSurface &&
        currentActive &&
        (currentActive === this.activeSurface.element ||
          this.activeSurface.element.contains(currentActive) ||
          currentActive.closest?.('[data-refinzi-orb-host]'))
      ) {
        return;
      }

      // If the surface element still exists in DOM and has text, retain it so clicking the Orb works!
      if (this.activeSurface && this.activeSurface.element && this.activeSurface.element.isConnected) {
        const val = this.activeSurface.getValue().trim();
        if (val.length > 0) {
          // Keep active surface docked and available for click/hold
          return;
        }
      }

      this.deactivateCurrentSurface();
    }, 1500);
  }

  private handlePointerOver(e: PointerEvent): void {
    if (this.activeSurface) return;
    const target = e.target;
    if (target instanceof HTMLElement && isSafeEditableElement(target)) {
      this.tryActivateElement(target);
    }
  }

  private handleGeometryChange(): void {
    if (this.activeSurface && this.activeSurface.detect()) {
      this.callbacks.onPositionUpdate(this.activeSurface);
    }
  }

  private handleNavigationChange(): void {
    setTimeout(() => {
      this.checkCurrentActiveElement();
    }, 150);
  }

  private tryActivateElement(element: HTMLElement): void {
    if (!isSafeEditableElement(element)) {
      return;
    }

    // If already active on this exact element, just update geometry
    if (this.activeSurface && this.activeSurface.element === element) {
      this.callbacks.onPositionUpdate(this.activeSurface);
      return;
    }

    // Create new surface abstraction
    const newSurface = SurfaceFactory.createSurface(element);
    if (!newSurface) {
      return;
    }

    // Clean up previous active surface
    this.deactivateCurrentSurface();

    // Activate new surface
    this.activeSurface = newSurface;
    this.callbacks.onSurfaceActivated(newSurface);
  }

  private deactivateCurrentSurface(): void {
    if (!this.activeSurface) return;

    const oldSurface = this.activeSurface;
    this.activeSurface = null;
    oldSurface.cleanup();
    this.callbacks.onSurfaceDeactivated(oldSurface);
  }

  private checkCurrentActiveElement(): void {
    const active = document.activeElement;
    if (active instanceof HTMLElement && isSafeEditableElement(active)) {
      this.tryActivateElement(active);
    }
  }

  private startDOMObserver(): void {
    this.mutationObserver = new MutationObserver((mutations) => {
      if (!this.activeSurface) return;

      // If active surface's element was detached from the DOM, deactivate
      if (!this.activeSurface.element.isConnected) {
        this.deactivateCurrentSurface();
        return;
      }

      // Check if mutations affected active surface geometry
      for (const m of mutations) {
        if (m.type === 'childList' || m.type === 'attributes') {
          this.handleGeometryChange();
          break;
        }
      }
    });

    this.mutationObserver.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden'],
    });
  }

  /**
   * Shuts down engine and cleans up all event listeners and active surfaces.
   */
  destroy(): void {
    this.isRunning = false;

    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
      this.blurTimeout = null;
    }

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    document.removeEventListener('focusin', this.boundOnFocusIn, true);
    document.removeEventListener('focusout', this.boundOnFocusOut, true);
    document.removeEventListener('pointerdown', this.boundOnPointerDown, true);
    document.removeEventListener('pointerover', this.boundOnPointerOver);

    window.removeEventListener('scroll', this.boundOnScroll, true);
    window.removeEventListener('resize', this.boundOnResize);
    window.removeEventListener('popstate', this.boundOnPopState);

    this.deactivateCurrentSurface();
  }
}
