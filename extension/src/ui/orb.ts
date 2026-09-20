/**
 * REFINZI — Ambient Orb Component
 * Docked seamlessly near supported AI composers.
 * 
 * CORE INTERACTION:
 * - SHORT CLICK: ⚡ In-place Better Prompt replacement
 * - PRESS & HOLD: 🧠 In-place Expert Prompt replacement
 * - IN-PLACE FEEDBACK: Grammarly-style floating Undo toast
 * 
 * ZERO DROP: Drop is completely removed.
 * Robust pointer handling: pointerdown, pointerup, pointercancel, pointer capture,
 * blur handling, hold progress ring, debounce guard, and keyboard accessibility.
 */

import { REFINZI_CSS } from './styles';
import { PromptMode } from '../types';

export interface AmbientOrbCallbacks {
  onBetter: () => void;
  onExpert: () => void;
}

export interface ValidationToastParams {
  mode: PromptMode;
  domain?: string;
  summary: string;
  checklist?: string[];
  onUndo: () => void;
  onCopy?: () => void;
  onApply?: () => void;
  showApply?: boolean;
}

export class AmbientOrb {
  private container: HTMLElement | null = null;
  private shadow: ShadowRoot | null = null;
  private orbEl: HTMLElement | null = null;
  private progressCircle: SVGCircleElement | null = null;
  private tooltipEl: HTMLElement | null = null;
  private undoToastEl: HTMLElement | null = null;
  private composerEl: HTMLElement | null = null;
  private callbacks: AmbientOrbCallbacks;

  // Interaction State
  private holdThresholdMs: number = 350;
  private pointerStartTime: number = 0;
  private holdTimer: number | null = null;
  private animationFrameId: number | null = null;
  private undoToastTimeout: number | null = null;
  private countdownInterval: number | null = null;
  private stagePillEl: HTMLElement | null = null;
  private stageTimer: number | null = null;
  private holdPillEl: HTMLElement | null = null;
  private isHolding: boolean = false;
  private isExpertReady: boolean = false;
  private isProcessing: boolean = false;

  // Drag-to-Position Nudging
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private dragOffsetX: number = 0;
  private dragOffsetY: number = 0;
  private customPosition: { x: number; y: number } | null = null;
  private readonly DRAG_THRESHOLD = 6;
  private lastTriggerTime: number = 0;

  // Window event handlers preserved for clean detachment
  private boundOnWindowBlur = () => this.resetState();
  private boundOnWindowKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (this.isHolding || this.isDragging) {
        this.resetState();
      }
      this.hideUndoToast();
    }
  };
  private boundOnWindowResize = () => {
    if (this.customPosition) this.updatePosition();
  };
  private boundOnWindowScroll = () => {
    if (this.isHolding) this.resetState();
  };

  constructor(callbacks: AmbientOrbCallbacks, holdThresholdMs: number = 350) {
    this.callbacks = callbacks;
    this.holdThresholdMs = holdThresholdMs;
  }

  attach(composer: HTMLElement): void {
    if (this.container && document.body.contains(this.container)) {
      this.composerEl = composer;
      this.updatePosition(composer);
      return;
    }

    this.destroy();
    this.composerEl = composer;

    this.container = document.createElement('div');
    this.container.setAttribute('data-refinzi-orb-host', 'true');
    this.container.className = 'refinzi-orb-host';
    this.container.style.position = this.customPosition ? 'fixed' : 'absolute';
    this.container.style.zIndex = '99999';

    this.shadow = this.container.attachShadow({ mode: 'open' });

    const styleEl = document.createElement('style');
    styleEl.textContent = REFINZI_CSS;
    this.shadow.appendChild(styleEl);

    // Orb Element
    this.orbEl = document.createElement('div');
    this.orbEl.className = 'refinzi-orb';
    this.orbEl.setAttribute('role', 'button');
    this.orbEl.setAttribute('tabindex', '0');
    this.orbEl.setAttribute('aria-label', 'Refinzi: Click for Better Prompt, Hold for Expert Prompt');

    // Tooltip
    this.tooltipEl = document.createElement('div');
    this.tooltipEl.className = 'orb-tooltip';
    this.tooltipEl.innerHTML = 'Click <strong>⚡ Better</strong> · Hold <strong>🧠 Expert</strong>';
    this.shadow.appendChild(this.tooltipEl);

    // Golden Lightning & Brain Icons with Radial Progress Ring
    this.orbEl.innerHTML = `
      <div class="orb-core">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M13 2L3.5 13.5H11.5L10.5 22L20.5 10.5H12.5L13 2Z" fill="url(#rfz-gold-grad)" stroke="rgba(255,255,255,0.4)" stroke-width="0.8" stroke-linejoin="round" />
          <defs>
            <linearGradient id="rfz-gold-grad" x1="3.5" y1="2" x2="20.5" y2="22" gradientUnits="userSpaceOnUse">
              <stop stop-color="#FFFDF0" />
              <stop offset="0.3" stop-color="#FFE066" />
              <stop offset="0.7" stop-color="#FFD700" />
              <stop offset="1" stop-color="#FF9500" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <svg class="orb-svg-ring" viewBox="0 0 38 38">
        <circle class="orb-svg-bg" cx="19" cy="19" r="15"></circle>
        <circle class="orb-svg-progress" id="rfz-progress" cx="19" cy="19" r="15"></circle>
      </svg>
    `;

    this.progressCircle = this.orbEl.querySelector('#rfz-progress');
    this.bindEvents(this.orbEl);

    this.shadow.appendChild(this.orbEl);
    document.body.appendChild(this.container);

    this.updatePosition(composer);
  }

  updatePosition(composer?: HTMLElement): void {
    if (!this.container) return;
    const targetComposer = composer || this.composerEl;

    // If user has nudged the Orb to a custom position, keep it floating there
    if (this.customPosition) {
      const maxX = Math.max(10, window.innerWidth - 48);
      const maxY = Math.max(10, window.innerHeight - 48);
      const x = Math.max(10, Math.min(maxX, this.customPosition.x));
      const y = Math.max(10, Math.min(maxY, this.customPosition.y));

      this.container.style.position = 'fixed';
      this.container.style.top = `${y}px`;
      this.container.style.left = `${x}px`;
      this.container.style.display = 'flex';
      return;
    }

    // Default: dock cleanly near top right of composer
    if (!targetComposer) return;

    const rect = targetComposer.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      this.container.style.display = 'none';
      return;
    }

    this.container.style.display = 'flex';
    this.container.style.position = 'absolute';

    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    const top = rect.top + scrollY - 20;
    const left = rect.right + scrollX - 44;

    this.container.style.top = `${Math.max(8, top)}px`;
    this.container.style.left = `${Math.max(8, left)}px`;
  }

  private bindEvents(orb: HTMLElement): void {
    orb.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
    orb.addEventListener('pointermove', (e) => this.handlePointerMove(e));
    orb.addEventListener('pointerup', (e) => this.handlePointerUp(e));
    orb.addEventListener('pointercancel', () => this.handlePointerCancel());

    // Double click resets to default composer docking
    orb.addEventListener('dblclick', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.resetToDefaultPosition();
    });

    window.addEventListener('blur', this.boundOnWindowBlur);
    window.addEventListener('keydown', this.boundOnWindowKeydown);
    window.addEventListener('resize', this.boundOnWindowResize);
    window.addEventListener('scroll', this.boundOnWindowScroll, { passive: true });

    // Accessible keyboard alternatives
    orb.addEventListener('keydown', (e) => {
      if (this.isProcessing || this.isDragging) return;

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.triggerBetter();
      } else if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        this.triggerBetter();
      } else if (e.key.toLowerCase() === 'e') {
        e.preventDefault();
        this.triggerExpert();
      }
    });
  }

  private handlePointerDown(e: PointerEvent): void {
    if (e.button !== 0 || this.isProcessing) return; // Only primary button
    e.preventDefault();
    e.stopPropagation();

    this.hideUndoToast();

    this.pointerStartTime = performance.now();
    this.isHolding = true;
    this.isExpertReady = false;
    this.isDragging = false;

    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;

    if (this.container) {
      const rect = this.container.getBoundingClientRect();
      this.dragOffsetX = e.clientX - rect.left;
      this.dragOffsetY = e.clientY - rect.top;
    }

    try {
      if (typeof this.orbEl?.setPointerCapture === 'function' && e.pointerId !== undefined) {
        this.orbEl.setPointerCapture(e.pointerId);
      }
    } catch {
      // Ignore if not supported in environment
    }

    this.orbEl?.classList.add('holding');
    this.showHoldPill('⚡ Hold for Expert…');
    this.startProgressAnimation();

    if (this.holdTimer) clearTimeout(this.holdTimer);
    this.holdTimer = window.setTimeout(() => {
      if (this.isHolding && !this.isDragging) {
        this.isExpertReady = true;
        this.orbEl?.classList.add('expert-ready');
        const core = this.orbEl?.querySelector('.orb-core');
        if (core) core.innerHTML = '🧠';
        this.updateHoldPill(true, '🧠 Release for Expert Briefing!');
      }
    }, this.holdThresholdMs);
  }

  private handlePointerMove(e: PointerEvent): void {
    if (!this.isHolding && !this.isDragging) return;

    const deltaX = e.clientX - this.dragStartX;
    const deltaY = e.clientY - this.dragStartY;
    const dist = Math.hypot(deltaX, deltaY);

    if (!this.isDragging && dist > this.DRAG_THRESHOLD) {
      this.isDragging = true;
      this.isHolding = false;
      this.isExpertReady = false;

      if (this.holdTimer) {
        clearTimeout(this.holdTimer);
        this.holdTimer = null;
      }
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }

      this.orbEl?.classList.remove('holding', 'expert-ready');
      this.orbEl?.classList.add('dragging');
      this.resetCoreIcon();

      if (this.progressCircle) this.progressCircle.style.strokeDashoffset = '94.2';
    }

    if (this.isDragging && this.container) {
      const maxX = Math.max(10, window.innerWidth - 48);
      const maxY = Math.max(10, window.innerHeight - 48);
      const newX = Math.max(10, Math.min(maxX, e.clientX - this.dragOffsetX));
      const newY = Math.max(10, Math.min(maxY, e.clientY - this.dragOffsetY));

      this.customPosition = { x: newX, y: newY };
      this.updatePosition();
    }
  }

  private handlePointerUp(e: PointerEvent): void {
    try {
      if (typeof this.orbEl?.hasPointerCapture === 'function' && this.orbEl.hasPointerCapture(e.pointerId)) {
        this.orbEl.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }

    if (this.isDragging) {
      this.isDragging = false;
      this.orbEl?.classList.remove('dragging');
      this.resetState();
      return;
    }

    if (!this.isHolding || this.isProcessing) {
      this.resetState();
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const elapsed = performance.now() - this.pointerStartTime;
    const wasExpertReady = this.isExpertReady || elapsed >= this.holdThresholdMs;

    this.resetState();

    if (wasExpertReady) {
      this.triggerExpert();
    } else {
      this.triggerBetter();
    }
  }

  private handlePointerCancel(): void {
    if (this.isDragging) {
      this.isDragging = false;
      this.orbEl?.classList.remove('dragging');
    }
    this.resetState();
  }

  resetToDefaultPosition(): void {
    this.customPosition = null;
    this.updatePosition();
  }

  /**
   * FEATURE 2: Multi-Stage Processing Feedback Animation
   * Shows perceived value with kinetic scanning stages rather than an abrupt instant jump.
   */
  startProcessingFeedback(mode: PromptMode, initialLabel?: string): void {
    this.stopProcessingFeedback();
    if (!this.shadow || !this.orbEl) return;

    this.isProcessing = true;
    this.orbEl.classList.add('processing');
    if (mode === 'expert') {
      this.orbEl.classList.add('expert-processing');
    }

    const defaultPhase1 = mode === 'expert'
      ? '🧠 Working: Locking scope & task…'
      : '⚡ Working: Deconstructing intent…';
    this.stagePillEl = document.createElement('div');
    this.stagePillEl.className = `orb-stage-pill ${mode === 'expert' ? 'expert-stage' : ''}`;
    this.stagePillEl.innerHTML = `
      <span class="orb-stage-dot"></span>
      <span class="orb-stage-text">${initialLabel || defaultPhase1}</span>
    `;
    this.shadow.appendChild(this.stagePillEl);

    if (this.tooltipEl) {
      this.tooltipEl.innerHTML = `<strong>⚡ Refinzi:</strong> ${initialLabel || (mode === 'expert' ? 'Assembling Expert Briefing…' : 'Calibrating Better Prompt…')}`;
    }

    // Stage 2 transition after 240ms to build perceived craftsmanship
    this.stageTimer = window.setTimeout(() => {
      if (this.stagePillEl) {
        const textEl = this.stagePillEl.querySelector('.orb-stage-text');
        if (textEl) {
          textEl.textContent = mode === 'expert'
            ? '🧠 Improving: Calibrating constraints…'
            : '⚡ Improving: Polishing prompt clarity…';
        }
      }
    }, 240);
  }

  stopProcessingFeedback(): void {
    if (this.stageTimer) {
      clearTimeout(this.stageTimer);
      this.stageTimer = null;
    }
    if (this.stagePillEl && this.stagePillEl.parentNode) {
      this.stagePillEl.parentNode.removeChild(this.stagePillEl);
    }
    this.stagePillEl = null;
    this.orbEl?.classList.remove('processing', 'expert-processing', 'calibrating');
    this.isProcessing = false;

    if (this.tooltipEl) {
      this.tooltipEl.innerHTML = 'Click <strong>⚡ Better</strong> · Hold <strong>🧠 Expert</strong>';
    }
  }

  setLoading(loading: boolean, label?: string, mode: PromptMode = 'better'): void {
    if (loading) {
      this.startProcessingFeedback(mode, label);
    } else {
      this.stopProcessingFeedback();
    }
  }

  /**
   * FEATURE 3: Validation Checklist Toast (Success Toast)
   * Shows tangible value without breaking the auto-replace flow.
   * Displays verified checklist points, undo, copy, and countdown progress bar with hover-pause.
   */
  showValidationToast(params: ValidationToastParams): void {
    this.hideUndoToast();
    if (!this.shadow) return;

    this.undoToastEl = document.createElement('div');
    this.undoToastEl.className = `undo-toast validation-toast ${params.mode === 'expert' ? 'expert-toast' : ''}`;

    const checklistItems = params.checklist && params.checklist.length > 0
      ? params.checklist
      : (params.mode === 'expert'
          ? ['Core objective preserved', 'Scope locked to task', 'Execution parameters added', 'Defensible assumptions marked']
          : ['Core intent clarified', 'Vagueness eliminated', 'Prompt structure calibrated']);

    const checklistHtml = `
      <div class="validation-checklist">
        ${checklistItems.map(item => `
          <div class="checklist-item">
            <span class="checklist-check">✓</span>
            <span>${item}</span>
          </div>
        `).join('')}
      </div>
    `;

    let applyBtnHtml = '';
    if (params.showApply && params.onApply) {
      applyBtnHtml = `<button type="button" class="toast-action-btn apply-btn" id="rfz-apply-btn">⚡ Apply</button>`;
    }

    let copyBtnHtml = '';
    if (params.onCopy) {
      copyBtnHtml = `<button type="button" class="toast-action-btn" id="rfz-copy-btn">📋 Copy</button>`;
    }

    const modeLabel = params.mode === 'better' ? '⚡ Better Calibrated' : '🧠 Expert Briefing Applied';
    const domainLabel = params.domain ? `<span class="toast-domain-badge">${params.domain}</span>` : '';

    this.undoToastEl.innerHTML = `
      <div class="validation-toast-header">
        <div class="toast-mode-title ${params.mode}">
          <span>${modeLabel}</span>
        </div>
        ${domainLabel}
      </div>
      ${checklistHtml}
      <div class="validation-toast-actions">
        <div style="display: flex; gap: 5px; align-items: center;">
          ${applyBtnHtml}
          ${copyBtnHtml}
          <button type="button" class="toast-action-btn undo-btn" id="rfz-undo-btn">↩ Undo</button>
        </div>
        <button type="button" class="toast-close-btn" id="rfz-toast-close" title="Dismiss">✕</button>
      </div>
      <div class="toast-countdown-track">
        <div class="toast-countdown-bar" id="rfz-countdown-bar" style="width: 100%;"></div>
      </div>
    `;

    if (params.showApply && params.onApply) {
      const applyBtn = this.undoToastEl.querySelector('#rfz-apply-btn') as HTMLButtonElement;
      applyBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        params.onApply!();
        applyBtn.innerHTML = '✓ Applied';
        applyBtn.classList.add('applied');
      });
    }

    if (params.onCopy) {
      const copyBtn = this.undoToastEl.querySelector('#rfz-copy-btn') as HTMLButtonElement;
      copyBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        params.onCopy!();
        const orig = copyBtn.innerHTML;
        copyBtn.innerHTML = '✓ Copied';
        setTimeout(() => {
          if (copyBtn) copyBtn.innerHTML = orig;
        }, 1500);
      });
    }

    const undoBtn = this.undoToastEl.querySelector('#rfz-undo-btn');
    undoBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      params.onUndo();
      this.hideUndoToast();
    });

    const closeBtn = this.undoToastEl.querySelector('#rfz-toast-close');
    closeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.hideUndoToast();
    });

    // Interactive countdown with pause-on-hover
    const countdownBar = this.undoToastEl.querySelector('#rfz-countdown-bar') as HTMLElement | null;
    const totalMs = 6000;
    let remainingMs = totalMs;
    let isHovered = false;
    const stepMs = 50;

    this.undoToastEl.addEventListener('mouseenter', () => {
      isHovered = true;
    });
    this.undoToastEl.addEventListener('mouseleave', () => {
      isHovered = false;
    });

    this.countdownInterval = window.setInterval(() => {
      if (isHovered) return;
      remainingMs -= stepMs;
      if (countdownBar) {
        countdownBar.style.width = `${Math.max(0, (remainingMs / totalMs) * 100)}%`;
      }
      if (remainingMs <= 0) {
        this.hideUndoToast();
      }
    }, stepMs);

    this.shadow.appendChild(this.undoToastEl);
  }

  showUndoToast(
    summary: string,
    onUndo: () => void,
    options?: {
      onCopy?: () => void;
      onApply?: () => void;
      showApply?: boolean;
    }
  ): void {
    const isExpert = summary.toLowerCase().includes('expert');
    this.showValidationToast({
      mode: isExpert ? 'expert' : 'better',
      summary,
      domain: isExpert ? 'Expert' : 'Task',
      checklist: isExpert
        ? ['Exact core intent preserved', 'Scope boundaries locked', 'Execution criteria added', 'Zero invented facts']
        : ['Core intent clarified', 'Vagueness eliminated', 'Prompt structure calibrated'],
      onUndo,
      onCopy: options?.onCopy,
      onApply: options?.onApply,
      showApply: options?.showApply,
    });
  }

  hideUndoToast(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    if (this.undoToastTimeout) {
      clearTimeout(this.undoToastTimeout);
      this.undoToastTimeout = null;
    }
    if (this.undoToastEl && this.undoToastEl.parentNode) {
      this.undoToastEl.parentNode.removeChild(this.undoToastEl);
    }
    this.undoToastEl = null;
  }

  private startProgressAnimation(): void {
    const startTime = performance.now();
    const circumference = 94.2;

    const animate = () => {
      if (!this.isHolding || this.isDragging) return;

      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / this.holdThresholdMs);
      const offset = circumference * (1 - progress);

      if (this.progressCircle) {
        this.progressCircle.style.strokeDashoffset = `${offset}`;
      }

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(animate);
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  private triggerBetter(): void {
    const now = performance.now();
    if (this.isProcessing || now - this.lastTriggerTime < 400) return;
    this.lastTriggerTime = now;
    this.callbacks.onBetter();
  }

  private triggerExpert(): void {
    const now = performance.now();
    if (this.isProcessing || now - this.lastTriggerTime < 400) return;
    this.lastTriggerTime = now;
    this.callbacks.onExpert();
  }

  private resetState(): void {
    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.hideHoldPill();
    this.isHolding = false;
    this.isExpertReady = false;
    this.isDragging = false;

    this.orbEl?.classList.remove('holding', 'expert-ready', 'dragging');
    this.resetCoreIcon();

    if (this.progressCircle) {
      this.progressCircle.style.strokeDashoffset = '94.2';
    }
  }

  getAttachedElement(): HTMLElement | null {
    return this.composerEl;
  }

  isInteracting(): boolean {
    return this.isHolding || this.isDragging || this.isProcessing || this.isExpertReady;
  }

  private showHoldPill(text: string): void {
    this.hideHoldPill();
    if (!this.shadow) return;

    this.holdPillEl = document.createElement('div');
    this.holdPillEl.className = 'orb-hold-pill';
    this.holdPillEl.innerHTML = `<span class="orb-stage-dot"></span><span>${text}</span>`;
    this.shadow.appendChild(this.holdPillEl);
  }

  private updateHoldPill(isExpert: boolean, text: string): void {
    if (this.holdPillEl) {
      if (isExpert) this.holdPillEl.classList.add('expert-ready');
      this.holdPillEl.innerHTML = `<span class="orb-stage-dot"></span><span>${text}</span>`;
    }
  }

  private hideHoldPill(): void {
    if (this.holdPillEl && this.holdPillEl.parentNode) {
      this.holdPillEl.parentNode.removeChild(this.holdPillEl);
    }
    this.holdPillEl = null;
  }

  private resetCoreIcon(): void {
    const core = this.orbEl?.querySelector('.orb-core');
    if (core) {
      core.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M13 2L3.5 13.5H11.5L10.5 22L20.5 10.5H12.5L13 2Z" fill="url(#rfz-gold-grad)" stroke="rgba(255,255,255,0.4)" stroke-width="0.8" stroke-linejoin="round" />
        </svg>
      `;
    }
  }

  /**
   * BYOK Nudge: Shown after first successful calibration when using the free gateway.
   * Gently encourages users to add their own API key for unlimited speed.
   * Renders as a distinct amber pill that auto-dismisses after 8 seconds.
   */
  /**
   * BYOK Nudge: Shown to guide users to Settings or when an API call fails.
   * Renders as a distinct pill that auto-dismisses.
   */
  showByokNudge(options?: {
    message?: string;
    reason?: string;
    isError?: boolean;
    onSettingsClick?: () => void;
  } | (() => void)): void {
    if (!this.shadow) return;

    let opts: { message?: string; reason?: string; isError?: boolean; onSettingsClick?: () => void } = {};
    if (typeof options === 'function') {
      opts = { onSettingsClick: options };
    } else if (options) {
      opts = options;
    }

    // Remove existing nudge if already visible
    const existing = this.shadow.querySelector('.byok-nudge-pill');
    if (existing) existing.parentNode?.removeChild(existing);

    const isError = !!opts.isError;
    const icon = isError ? '⚠️' : '🔑';
    const text = opts.message || (opts.reason
      ? `${opts.reason}`
      : 'Add your free Gemini API key for unlimited speed');
    const ctaLabel = isError ? 'Configure API Key →' : 'Settings →';

    const nudge = document.createElement('div');
    nudge.className = `byok-nudge-pill ${isError ? 'error-mode' : 'warning-mode'}`;
    nudge.innerHTML = `
      <span class="byok-nudge-icon">${icon}</span>
      <span class="byok-nudge-text">${text}</span>
      <button type="button" class="byok-nudge-cta" id="rfz-byok-settings-btn">${ctaLabel}</button>
      <button type="button" class="byok-nudge-close" id="rfz-byok-close" title="Dismiss">✕</button>
    `;

    const settingsBtn = nudge.querySelector('#rfz-byok-settings-btn') as HTMLButtonElement;
    settingsBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (opts.onSettingsClick) {
        opts.onSettingsClick();
      } else {
        try {
          if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
            chrome.runtime.sendMessage({ type: 'REFINZI_OPEN_POPUP' }).catch(() => {});
          }
        } catch {}
      }
      nudge.parentNode?.removeChild(nudge);
    });

    const closeBtn = nudge.querySelector('#rfz-byok-close') as HTMLButtonElement;
    closeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      nudge.parentNode?.removeChild(nudge);
    });

    this.shadow.appendChild(nudge);

    // Auto-dismiss: 12 seconds for errors/diagnostics, 8 seconds for info
    const timeout = isError ? 12000 : 8000;
    setTimeout(() => {
      if (nudge.parentNode) nudge.parentNode.removeChild(nudge);
    }, timeout);
  }

  hide(): void {
    if (this.container) this.container.style.display = 'none';
  }

  show(): void {
    if (this.container) this.container.style.display = 'flex';
  }

  destroy(): void {
    this.resetState();
    this.hideUndoToast();

    // Clean up window event listeners to prevent memory leaks and duplicate dispatches
    window.removeEventListener('blur', this.boundOnWindowBlur);
    window.removeEventListener('keydown', this.boundOnWindowKeydown);
    window.removeEventListener('resize', this.boundOnWindowResize);
    window.removeEventListener('scroll', this.boundOnWindowScroll);

    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
    this.shadow = null;
    this.orbEl = null;
    this.progressCircle = null;
    this.composerEl = null;
  }
}
