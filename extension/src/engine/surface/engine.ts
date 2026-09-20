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
  private discoveryTimeout: number | null = null;
  private mutationObserver: MutationObserver | null = null;
  private geometryRafId: number | null = null;
  private geometryPending: boolean = false;

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

    // Hook SPA navigation (history.pushState / history.replaceState) so dynamic route
    // changes (e.g. login/OAuth transitions on ChatGPT/Claude) are detected immediately.
    this.hookHistoryState();

    // Use capturing phase for focus events to catch all inputs across frameworks
    document.addEventListener('focusin', this.boundOnFocusIn, true);
    document.addEventListener('focusout', this.boundOnFocusOut, true);
    document.addEventListener('pointerdown', this.boundOnPointerDown, true);
    document.addEventListener('pointerover', this.boundOnPointerOver, { passive: true });

    // Passive geometry listeners
    window.addEventListener('scroll', this.boundOnScroll, { passive: true, capture: true });
    window.addEventListener('resize', this.boundOnResize, { passive: true });
    window.addEventListener('popstate', this.boundOnPopState, { passive: true });

    // Observe dynamic DOM removals and additions to handle SPA transitions
    this.startDOMObserver();

    // Check if an editable element or composer is already present upon init
    this.checkCurrentActiveElement();
    if (!this.activeSurface) {
      this.discoverInitialSurface();
    }
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
    // Coalesce high-frequency scroll/resize/mutation callbacks into a single
    // requestAnimationFrame flush so orb repositioning never triggers layout
    // thrash on long pages or during smooth scrolling.
    if (this.geometryPending) return;
    this.geometryPending = true;
    this.geometryRafId = requestAnimationFrame(() => {
      this.geometryRafId = null;
      this.geometryPending = false;
      if (this.activeSurface && this.activeSurface.detect()) {
        this.callbacks.onPositionUpdate(this.activeSurface);
      }
    });
  }

  private handleNavigationChange(): void {
    this.scheduleSurfaceDiscovery();
  }

  private hookHistoryState(): void {
    if (typeof window === 'undefined' || !window.history) return;
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    if (originalPushState && !(originalPushState as any).__refinziHooked__) {
      window.history.pushState = (...args: Parameters<History['pushState']>) => {
        const ret = originalPushState.apply(window.history, args);
        this.handleNavigationChange();
        return ret;
      };
      (window.history.pushState as any).__refinziHooked__ = true;
    }

    if (originalReplaceState && !(originalReplaceState as any).__refinziHooked__) {
      window.history.replaceState = (...args: Parameters<History['replaceState']>) => {
        const ret = originalReplaceState.apply(window.history, args);
        this.handleNavigationChange();
        return ret;
      };
      (window.history.replaceState as any).__refinziHooked__ = true;
    }
  }

  public scheduleSurfaceDiscovery(): void {
    if (this.discoveryTimeout) return;
    this.discoveryTimeout = window.setTimeout(() => {
      this.discoveryTimeout = null;
      if (this.activeSurface && this.activeSurface.element.isConnected) return;
      this.checkCurrentActiveElement();
      if (!this.activeSurface) {
        this.discoverInitialSurface();
      }
    }, 150);
  }

  public discoverInitialSurface(): void {
    if (this.activeSurface && this.activeSurface.element.isConnected) return;

    const active = document.activeElement;
    if (active instanceof HTMLElement && isSafeEditableElement(active)) {
      this.tryActivateElement(active);
      return;
    }

    const selectors = [
      '#prompt-textarea',
      'div[id="prompt-textarea"][contenteditable="true"]',
      'div[contenteditable="true"].ProseMirror',
      'div[contenteditable="true"][data-placeholder]',
      'div[contenteditable="true"].ql-editor',
      'textarea[data-id="root"]',
      'textarea:not([disabled]):not([readonly])',
      '[contenteditable="true"]:not([contenteditable="false"])',
    ];

    for (const sel of selectors) {
      try {
        const els = document.querySelectorAll<HTMLElement>(sel);
        for (const el of Array.from(els)) {
          if (isSafeEditableElement(el)) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 40 && rect.height > 20) {
              this.tryActivateElement(el);
              return;
            }
          }
        }
      } catch {
        // Ignore selector errors
      }
    }
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
      // If there is no active surface yet (e.g. user just completed login),
      // scan for newly mounted composers when elements are added to the DOM.
      if (!this.activeSurface) {
        let hasNewElements = false;
        for (const m of mutations) {
          if (m.type === 'childList' && m.addedNodes.length > 0) {
            hasNewElements = true;
            break;
          }
        }
        if (hasNewElements) {
          this.scheduleSurfaceDiscovery();
        }
        return;
      }

      // If active surface's element was detached from the DOM, deactivate and scan
      if (!this.activeSurface.element.isConnected) {
        this.deactivateCurrentSurface();
        this.scheduleSurfaceDiscovery();
        return;
      }

      // Ignore mutations Refinzi itself caused (orb host / toast / undo churn)
      // so calibration feedback never triggers a reposition loop.
      let needsReposition = false;
      for (const m of mutations) {
        const target = m.target;
        if (target instanceof HTMLElement) {
          if (
            target.hasAttribute?.('data-refinzi-orb-host') ||
            target.closest?.('[data-refinzi-orb-host], .refinzi-orb-host, .undo-toast')
          ) {
            continue;
          }
        }
        if (m.type === 'childList' || m.type === 'attributes') {
          needsReposition = true;
          break;
        }
      }
      if (needsReposition) this.handleGeometryChange();
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

    if (this.discoveryTimeout) {
      clearTimeout(this.discoveryTimeout);
      this.discoveryTimeout = null;
    }

    if (this.geometryRafId !== null) {
      cancelAnimationFrame(this.geometryRafId);
      this.geometryRafId = null;
    }
    this.geometryPending = false;

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
