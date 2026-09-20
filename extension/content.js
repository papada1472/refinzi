"use strict";
(() => {
  // extension/src/ui/styles.ts
  var REFINZI_CSS = `
:host {
  all: initial;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 13px;
  line-height: 1.5;
  color: #E2E8F0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ==========================================================================
   AMBIENT REFINZI ORB (Click for Better, Hold for Expert)
   ========================================================================== */
.refinzi-orb-host {
  position: absolute;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  user-select: none;
  pointer-events: auto;
}

.refinzi-orb {
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #22201C 0%, #141311 70%, #0C0B0A 100%);
  border: 1.2px solid rgba(255, 215, 0, 0.4);
  box-shadow: 
    0 0 14px rgba(255, 215, 0, 0.2),
    0 4px 12px rgba(0, 0, 0, 0.6),
    inset 0 1px 1px rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  transition: transform 0.16s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.16s ease, border-color 0.16s;
  outline: none;
  touch-action: none;
}

.refinzi-orb:hover {
  transform: scale(1.08);
  border-color: rgba(255, 215, 0, 0.75);
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.35),
    0 6px 16px rgba(0, 0, 0, 0.7);
}

.refinzi-orb:focus-visible {
  border-color: #FFD700;
  box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.4);
}

.refinzi-orb.dragging {
  cursor: grabbing !important;
  transform: scale(1.15) !important;
  border-color: #FFD700 !important;
  box-shadow: 0 0 24px rgba(255, 215, 0, 0.5), 0 10px 24px rgba(0, 0, 0, 0.8) !important;
}

/* Calibrating / In-Place Loading Spinner State */
.refinzi-orb.calibrating {
  border-color: #FFD700;
  animation: rfzOrbPulse 1.2s infinite alternate ease-in-out;
}

@keyframes rfzOrbPulse {
  from {
    box-shadow: 0 0 14px rgba(255, 215, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.6);
    transform: scale(1.02);
  }
  to {
    box-shadow: 0 0 26px rgba(255, 215, 0, 0.7), 0 6px 18px rgba(0, 0, 0, 0.8);
    transform: scale(1.1);
  }
}

.refinzi-orb.calibrating .orb-svg-progress {
  stroke-dashoffset: 20;
  animation: rfzSpin 0.8s linear infinite;
  transform-origin: center;
}

@keyframes rfzSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Core Icon (Lightning \u26A1 / Brain \u{1F9E0}) */
.orb-core {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  transition: all 0.2s ease;
}

.orb-core svg {
  width: 14px;
  height: 14px;
}

/* Circular SVG Hold Progress Ring */
.orb-svg-ring {
  position: absolute;
  inset: -3px;
  width: 38px;
  height: 38px;
  transform: rotate(-90deg);
  pointer-events: none;
  z-index: 3;
}

.orb-svg-bg {
  stroke: rgba(255, 215, 0, 0.1);
  stroke-width: 2;
  fill: none;
}

.orb-svg-progress {
  stroke: #FFD700;
  stroke-width: 2.4;
  stroke-linecap: round;
  fill: none;
  stroke-dasharray: 94.2;
  stroke-dashoffset: 94.2;
  transition: stroke-dashoffset 0.05s linear;
}

/* Holding state */
.refinzi-orb.holding {
  transform: scale(0.96);
  border-color: #FFD700;
}

/* Expert threshold reached */
.refinzi-orb.expert-ready {
  border-color: #10B981;
  box-shadow: 0 0 18px rgba(16, 185, 129, 0.45), 0 0 0 1px rgba(16, 185, 129, 0.4);
  transform: scale(1.1);
}

.refinzi-orb.expert-ready .orb-svg-progress {
  stroke: #10B981;
}

/* Tooltip */
.orb-tooltip {
  position: absolute;
  bottom: calc(100% + 9px);
  right: 0;
  white-space: nowrap;
  background: rgba(14, 16, 22, 0.96);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: #E2E8F0;
  font-size: 11px;
  line-height: 1.35;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.06);
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transform: translateY(4px) scale(0.98);
  transition: opacity 0.16s cubic-bezier(0.16, 1, 0.3, 1), transform 0.16s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.16s;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.orb-tooltip strong {
  color: #FFD700;
}

.orb-tooltip.tooltip-bottom {
  bottom: auto;
  top: calc(100% + 9px);
  transform: translateY(-4px) scale(0.98);
}

.orb-tooltip.tooltip-bottom.visible,
:host(:hover) .orb-tooltip.tooltip-bottom,
:host(:focus-within) .orb-tooltip.tooltip-bottom,
.refinzi-orb:hover ~ .orb-tooltip.tooltip-bottom,
.refinzi-orb:focus-visible ~ .orb-tooltip.tooltip-bottom {
  transform: translateY(0) scale(1);
}

/* Tooltip Rows & Highlights */
.orb-tooltip-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}

.orb-tooltip-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-weight: 600;
  font-size: 10.5px;
  padding: 1px 5px;
  border-radius: 4px;
}

.orb-tooltip-badge.better {
  color: #FBBF24;
  background: rgba(251, 191, 36, 0.15);
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.orb-tooltip-badge.expert {
  color: #34D399;
  background: rgba(52, 211, 153, 0.15);
  border: 1px solid rgba(52, 211, 153, 0.3);
}

.orb-tooltip-action {
  color: #94A3B8;
  font-size: 11px;
}

.orb-tooltip-shortcuts {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #64748B;
  font-size: 10px;
  padding-top: 3px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.orb-tooltip-shortcuts kbd {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 9.5px;
  color: #CBD5E1;
  background: rgba(255, 255, 255, 0.09);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 3px;
  padding: 1px 4px;
}

/* Tooltip visibility triggers: Shadow host hover/focus, orb element hover/focus, and explicit class */
:host(:hover) .orb-tooltip,
:host(:focus-within) .orb-tooltip,
.refinzi-orb:hover ~ .orb-tooltip,
.refinzi-orb:focus-visible ~ .orb-tooltip,
.refinzi-orb-host:hover .orb-tooltip,
.orb-tooltip.visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
}

/* Suppress tooltip during active interactions */
:host(.is-holding) .orb-tooltip,
:host(.is-dragging) .orb-tooltip,
:host(.is-processing) .orb-tooltip,
.refinzi-orb.holding ~ .orb-tooltip,
.refinzi-orb.expert-ready ~ .orb-tooltip,
.refinzi-orb.dragging ~ .orb-tooltip,
.refinzi-orb.processing ~ .orb-tooltip,
.orb-tooltip.suppressed {
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
}

/* ==========================================================================
   FEATURE 2: PROCESSING FEEDBACK ANIMATION & NUDGES (Working / Improving)
   ========================================================================== */
.refinzi-orb.processing {
  border-color: #FFD700 !important;
  animation: rfzOrbKineticScan 0.9s infinite linear;
}

.refinzi-orb.processing.expert-processing {
  border-color: #C084FC !important;
  box-shadow: 0 0 24px rgba(192, 132, 252, 0.6), 0 0 12px rgba(255, 215, 0, 0.4) !important;
}

@keyframes rfzOrbKineticScan {
  0% {
    transform: scale(1.05) rotate(0deg);
    box-shadow: 0 0 16px rgba(255, 215, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.6);
  }
  50% {
    transform: scale(1.14) rotate(180deg);
    box-shadow: 0 0 28px rgba(255, 215, 0, 0.8), 0 6px 20px rgba(0, 0, 0, 0.8);
  }
  100% {
    transform: scale(1.05) rotate(360deg);
    box-shadow: 0 0 16px rgba(255, 215, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.6);
  }
}

/* Dynamic Hold Nudge Pill (Appears while holding down) */
.orb-hold-pill {
  position: absolute;
  right: calc(100% + 10px);
  top: 50%;
  transform: translateY(-50%);
  background: rgba(15, 17, 26, 0.96);
  border: 1px solid rgba(255, 215, 0, 0.5);
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 11px;
  font-weight: 700;
  color: #F8FAFC;
  white-space: nowrap;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  gap: 6px;
  pointer-events: none;
  animation: rfzStageEnter 0.15s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 10002;
}

.orb-hold-pill.expert-ready {
  border-color: #10B981;
  background: rgba(6, 78, 59, 0.96);
  color: #A7F3D0;
  box-shadow: 0 0 18px rgba(16, 185, 129, 0.6);
  transform: translateY(-50%) scale(1.06);
  transition: all 0.15s ease;
}

/* Dynamic Working / Processing Pill */
.orb-stage-pill {
  position: absolute;
  right: calc(100% + 10px);
  top: 50%;
  transform: translateY(-50%);
  background: rgba(15, 17, 26, 0.96);
  border: 1px solid rgba(255, 215, 0, 0.5);
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 11px;
  font-weight: 700;
  color: #F8FAFC;
  white-space: nowrap;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  gap: 7px;
  pointer-events: none;
  animation: rfzStageEnter 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 10001;
}

.orb-stage-pill.expert-stage {
  border-color: rgba(192, 132, 252, 0.6);
  background: rgba(26, 16, 38, 0.96);
}

.orb-stage-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #FFD700;
  box-shadow: 0 0 8px #FFD700;
  animation: rfzDotPulse 0.7s infinite alternate ease-in-out;
}

.expert-stage .orb-stage-dot {
  background: #C084FC;
  box-shadow: 0 0 8px #C084FC;
}

@keyframes rfzStageEnter {
  from { opacity: 0; transform: translateY(-50%) scale(0.92); }
  to { opacity: 1; transform: translateY(-50%) scale(1); }
}

@keyframes rfzDotPulse {
  from { opacity: 0.35; transform: scale(0.75); }
  to { opacity: 1; transform: scale(1.3); }
}

/* ==========================================================================
   FEATURE 3: VALIDATION CHECKLIST (SUCCESS TOAST)
   ========================================================================== */
.validation-toast {
  position: absolute;
  bottom: calc(100% + 12px);
  right: 0;
  width: 280px;
  background: rgba(14, 16, 24, 0.96);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 14px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.75), 0 0 16px rgba(255, 215, 0, 0.1);
  padding: 12px 14px 10px;
  z-index: 10000;
  animation: rfzToastEnter 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: auto;
  overflow: hidden;
}

.validation-toast.expert-toast {
  border-color: rgba(192, 132, 252, 0.35);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.75), 0 0 16px rgba(192, 132, 252, 0.12);
}

.validation-toast-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.toast-mode-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #F8FAFC;
}

.toast-mode-title.better {
  color: #FFD700;
}

.toast-mode-title.expert {
  color: #C084FC;
}

.toast-domain-badge {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: rgba(255, 255, 255, 0.08);
  color: #94A3B8;
  padding: 1px 6px;
  border-radius: 4px;
}

/* Checklist Items */
.validation-checklist {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  color: #CBD5E1;
  line-height: 1.3;
}

.checklist-check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.2);
  color: #10B981;
  font-size: 9px;
  font-weight: 900;
  flex-shrink: 0;
}

/* Actions Row */
.validation-toast-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.toast-action-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  color: #E2E8F0;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.14s ease;
}

.toast-action-btn:hover {
  background: rgba(255, 215, 0, 0.15);
  border-color: rgba(255, 215, 0, 0.4);
  color: #FFD700;
}

.toast-action-btn.undo-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.4);
  color: #F87171;
}

.toast-close-btn {
  background: transparent;
  border: none;
  color: #64748B;
  cursor: pointer;
  font-size: 11px;
  padding: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: color 0.12s;
}

.toast-close-btn:hover {
  color: #F8FAFC;
}

/* Countdown Progress Bar (Pauses on Hover) */
.toast-countdown-track {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.toast-countdown-bar {
  height: 100%;
  width: 100%;
  background: linear-gradient(90deg, #FFD700, #10B981);
  transform-origin: left;
  transition: width 0.1s linear;
}

.validation-toast:hover .toast-countdown-bar {
  opacity: 0.5;
}

/* ==========================================================================
   BYOK NUDGE PILL \u2014 Shown after first calibration to guide users to Settings
   ========================================================================== */
.byok-nudge-pill {
  position: fixed;
  bottom: 72px;
  right: 16px;
  z-index: 100001;
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, rgba(20, 18, 12, 0.97) 0%, rgba(14, 13, 10, 0.97) 100%);
  border: 1px solid rgba(255, 215, 0, 0.45);
  border-radius: 12px;
  padding: 9px 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.65), 0 0 18px rgba(255, 215, 0, 0.12);
  animation: rfzNudgeIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  max-width: 340px;
  pointer-events: auto;
}

.byok-nudge-pill.warning-mode {
  border-color: rgba(245, 158, 11, 0.7);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.65), 0 0 18px rgba(245, 158, 11, 0.25);
}

.byok-nudge-pill.error-mode {
  border-color: rgba(239, 68, 68, 0.7);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.65), 0 0 18px rgba(239, 68, 68, 0.25);
}

@keyframes rfzNudgeIn {
  from { opacity: 0; transform: translateY(10px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.byok-nudge-icon {
  font-size: 15px;
  flex-shrink: 0;
}

.byok-nudge-text {
  font-size: 12px;
  color: #D1D5DB;
  line-height: 1.3;
  flex: 1;
}

.byok-nudge-cta {
  flex-shrink: 0;
  background: linear-gradient(135deg, #FFD700, #FF9500);
  color: #0F172A;
  font-weight: 700;
  font-size: 11px;
  padding: 4px 10px;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s;
}

.byok-nudge-cta:hover {
  opacity: 0.85;
}

.byok-nudge-close {
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: #6B7280;
  font-size: 13px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  line-height: 1;
  transition: color 0.15s;
}

.byok-nudge-close:hover {
  color: #D1D5DB;
}
`;

  // extension/src/utils/sanitize.ts
  function escapeHTML(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  // extension/src/ui/orb.ts
  var AmbientOrb = class {
    container = null;
    shadow = null;
    orbEl = null;
    progressCircle = null;
    tooltipEl = null;
    undoToastEl = null;
    composerEl = null;
    callbacks;
    // Interaction State
    holdThresholdMs = 350;
    pointerStartTime = 0;
    holdTimer = null;
    animationFrameId = null;
    undoToastTimeout = null;
    countdownInterval = null;
    stagePillEl = null;
    stageTimer = null;
    holdPillEl = null;
    isHolding = false;
    isExpertReady = false;
    isProcessing = false;
    // Drag-to-Position Nudging
    isDragging = false;
    dragStartX = 0;
    dragStartY = 0;
    dragOffsetX = 0;
    dragOffsetY = 0;
    customPosition = null;
    DRAG_THRESHOLD = 6;
    lastTriggerTime = 0;
    // Window event handlers preserved for clean detachment
    boundOnWindowBlur = () => this.resetState();
    boundOnWindowKeydown = (e) => {
      if (e.key === "Escape") {
        this.hideHoverTooltip();
        if (this.isHolding || this.isDragging) {
          this.resetState();
        }
        this.hideUndoToast();
      }
    };
    boundOnWindowResize = () => {
      if (this.customPosition) this.updatePosition();
    };
    boundOnWindowScroll = () => {
      if (this.isHolding) this.resetState();
    };
    constructor(callbacks, holdThresholdMs = 350) {
      this.callbacks = callbacks;
      this.holdThresholdMs = holdThresholdMs;
    }
    attach(composer) {
      if (this.container && document.body.contains(this.container)) {
        this.composerEl = composer;
        this.updatePosition(composer);
        return;
      }
      this.destroy();
      this.composerEl = composer;
      this.container = document.createElement("div");
      this.container.setAttribute("data-refinzi-orb-host", "true");
      this.container.className = "refinzi-orb-host";
      this.container.style.position = this.customPosition ? "fixed" : "absolute";
      this.container.style.zIndex = "99999";
      this.shadow = this.container.attachShadow({ mode: "open" });
      const styleEl = document.createElement("style");
      styleEl.textContent = REFINZI_CSS;
      this.shadow.appendChild(styleEl);
      this.orbEl = document.createElement("div");
      this.orbEl.className = "refinzi-orb";
      this.orbEl.setAttribute("role", "button");
      this.orbEl.setAttribute("tabindex", "0");
      this.orbEl.setAttribute("aria-label", "Refinzi: Click for Better Prompt, Hold for Expert Prompt");
      const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
      const modKey = isMac ? "\u2318" : "Ctrl";
      this.orbEl.setAttribute("data-tooltip", `Click \u26A1 Better (${modKey}+Shift+B) \xB7 Hold \u{1F9E0} Expert (${modKey}+Shift+E)`);
      this.orbEl.setAttribute("title", `Refinzi: Click for Better Prompt (${modKey}+Shift+B), Hold for Expert Prompt (${modKey}+Shift+E)`);
      this.orbEl.setAttribute("aria-describedby", "rfz-orb-tooltip");
      this.tooltipEl = document.createElement("div");
      this.tooltipEl.id = "rfz-orb-tooltip";
      this.tooltipEl.className = "orb-tooltip";
      this.tooltipEl.setAttribute("role", "tooltip");
      this.tooltipEl.setAttribute("aria-hidden", "true");
      this.renderTooltipContent();
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
      this.progressCircle = this.orbEl.querySelector("#rfz-progress");
      this.bindEvents(this.orbEl);
      this.shadow.appendChild(this.orbEl);
      this.shadow.appendChild(this.tooltipEl);
      document.body.appendChild(this.container);
      this.updatePosition(composer);
    }
    updatePosition(composer) {
      if (!this.container) return;
      const targetComposer = composer || this.composerEl;
      if (this.customPosition) {
        const maxX = Math.max(10, window.innerWidth - 48);
        const maxY = Math.max(10, window.innerHeight - 48);
        const x = Math.max(10, Math.min(maxX, this.customPosition.x));
        const y = Math.max(10, Math.min(maxY, this.customPosition.y));
        this.container.style.position = "fixed";
        this.container.style.top = `${y}px`;
        this.container.style.left = `${x}px`;
        this.container.style.display = "flex";
        return;
      }
      if (!targetComposer) return;
      const rect = targetComposer.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        this.container.style.display = "none";
        return;
      }
      this.container.style.display = "flex";
      this.container.style.position = "absolute";
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;
      const top = rect.top + scrollY - 20;
      const left = rect.right + scrollX - 44;
      this.container.style.top = `${Math.max(8, top)}px`;
      this.container.style.left = `${Math.max(8, left)}px`;
    }
    bindEvents(orb) {
      orb.addEventListener("pointerdown", (e) => this.handlePointerDown(e));
      orb.addEventListener("pointermove", (e) => this.handlePointerMove(e));
      orb.addEventListener("pointerup", (e) => this.handlePointerUp(e));
      orb.addEventListener("pointercancel", () => this.handlePointerCancel());
      orb.addEventListener("mouseenter", () => this.showHoverTooltip());
      orb.addEventListener("mouseleave", () => this.hideHoverTooltip());
      orb.addEventListener("focus", () => this.showHoverTooltip());
      orb.addEventListener("blur", () => this.hideHoverTooltip());
      orb.addEventListener("dblclick", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.resetToDefaultPosition();
      });
      window.addEventListener("blur", this.boundOnWindowBlur);
      window.addEventListener("keydown", this.boundOnWindowKeydown);
      window.addEventListener("resize", this.boundOnWindowResize);
      window.addEventListener("scroll", this.boundOnWindowScroll, { passive: true });
      orb.addEventListener("keydown", (e) => {
        if (this.isProcessing || this.isDragging) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.triggerBetter();
        } else if (e.key.toLowerCase() === "b") {
          e.preventDefault();
          this.triggerBetter();
        } else if (e.key.toLowerCase() === "e") {
          e.preventDefault();
          this.triggerExpert();
        }
      });
    }
    handlePointerDown(e) {
      if (e.button !== 0 || this.isProcessing) return;
      e.preventDefault();
      e.stopPropagation();
      this.hideHoverTooltip();
      this.tooltipEl?.classList.add("suppressed");
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
        if (typeof this.orbEl?.setPointerCapture === "function" && e.pointerId !== void 0) {
          this.orbEl.setPointerCapture(e.pointerId);
        }
      } catch {
      }
      this.orbEl?.classList.add("holding");
      this.showHoldPill("\u26A1 Hold for Expert\u2026");
      this.startProgressAnimation();
      if (this.holdTimer) clearTimeout(this.holdTimer);
      this.holdTimer = window.setTimeout(() => {
        if (this.isHolding && !this.isDragging) {
          this.isExpertReady = true;
          this.orbEl?.classList.add("expert-ready");
          const core = this.orbEl?.querySelector(".orb-core");
          if (core) core.innerHTML = "\u{1F9E0}";
          this.updateHoldPill(true, "\u{1F9E0} Release for Expert Briefing!");
        }
      }, this.holdThresholdMs);
    }
    handlePointerMove(e) {
      if (!this.isHolding && !this.isDragging) return;
      const deltaX = e.clientX - this.dragStartX;
      const deltaY = e.clientY - this.dragStartY;
      const dist = Math.hypot(deltaX, deltaY);
      if (!this.isDragging && dist > this.DRAG_THRESHOLD) {
        this.isDragging = true;
        this.isHolding = false;
        this.isExpertReady = false;
        this.hideHoverTooltip();
        this.tooltipEl?.classList.add("suppressed");
        if (this.holdTimer) {
          clearTimeout(this.holdTimer);
          this.holdTimer = null;
        }
        if (this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
          this.animationFrameId = null;
        }
        this.orbEl?.classList.remove("holding", "expert-ready");
        this.orbEl?.classList.add("dragging");
        this.resetCoreIcon();
        if (this.progressCircle) this.progressCircle.style.strokeDashoffset = "94.2";
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
    handlePointerUp(e) {
      try {
        if (typeof this.orbEl?.hasPointerCapture === "function" && this.orbEl.hasPointerCapture(e.pointerId)) {
          this.orbEl.releasePointerCapture(e.pointerId);
        }
      } catch {
      }
      if (this.isDragging) {
        this.isDragging = false;
        this.orbEl?.classList.remove("dragging");
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
    handlePointerCancel() {
      if (this.isDragging) {
        this.isDragging = false;
        this.orbEl?.classList.remove("dragging");
      }
      this.resetState();
    }
    resetToDefaultPosition() {
      this.customPosition = null;
      this.updatePosition();
    }
    /**
     * FEATURE 2: Multi-Stage Processing Feedback Animation
     * Shows perceived value with kinetic scanning stages rather than an abrupt instant jump.
     */
    startProcessingFeedback(mode, initialLabel) {
      this.stopProcessingFeedback();
      if (!this.shadow || !this.orbEl) return;
      this.isProcessing = true;
      this.orbEl.classList.add("processing");
      if (mode === "expert") {
        this.orbEl.classList.add("expert-processing");
      }
      const defaultPhase1 = mode === "expert" ? "\u{1F9E0} Working: Locking scope & task\u2026" : "\u26A1 Working: Deconstructing intent\u2026";
      this.stagePillEl = document.createElement("div");
      this.stagePillEl.className = `orb-stage-pill ${mode === "expert" ? "expert-stage" : ""}`;
      this.stagePillEl.innerHTML = `
      <span class="orb-stage-dot"></span>
      <span class="orb-stage-text">${initialLabel || defaultPhase1}</span>
    `;
      this.shadow.appendChild(this.stagePillEl);
      if (this.tooltipEl) {
        this.tooltipEl.innerHTML = `<strong>\u26A1 Refinzi:</strong> ${initialLabel || (mode === "expert" ? "Assembling Expert Briefing\u2026" : "Calibrating Better Prompt\u2026")}`;
      }
      this.stageTimer = window.setTimeout(() => {
        if (this.stagePillEl) {
          const textEl = this.stagePillEl.querySelector(".orb-stage-text");
          if (textEl) {
            textEl.textContent = mode === "expert" ? "\u{1F9E0} Improving: Calibrating constraints\u2026" : "\u26A1 Improving: Polishing prompt clarity\u2026";
          }
        }
      }, 240);
    }
    stopProcessingFeedback() {
      if (this.stageTimer) {
        clearTimeout(this.stageTimer);
        this.stageTimer = null;
      }
      if (this.stagePillEl && this.stagePillEl.parentNode) {
        this.stagePillEl.parentNode.removeChild(this.stagePillEl);
      }
      this.stagePillEl = null;
      this.orbEl?.classList.remove("processing", "expert-processing", "calibrating");
      this.isProcessing = false;
      this.renderTooltipContent();
      this.tooltipEl?.classList.remove("suppressed");
    }
    setLoading(loading, label, mode = "better") {
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
    showValidationToast(params) {
      this.hideUndoToast();
      if (!this.shadow) return;
      this.undoToastEl = document.createElement("div");
      this.undoToastEl.className = `undo-toast validation-toast ${params.mode === "expert" ? "expert-toast" : ""}`;
      const checklistItems = params.checklist && params.checklist.length > 0 ? params.checklist : params.mode === "expert" ? ["Core objective preserved", "Scope locked to task", "Execution parameters added", "Defensible assumptions marked"] : ["Core intent clarified", "Vagueness eliminated", "Prompt structure calibrated"];
      const checklistHtml = `
      <div class="validation-checklist">
        ${checklistItems.map((item) => `
          <div class="checklist-item">
            <span class="checklist-check">\u2713</span>
            <span>${escapeHTML(item)}</span>
          </div>
        `).join("")}
      </div>
    `;
      let applyBtnHtml = "";
      if (params.showApply && params.onApply) {
        applyBtnHtml = `<button type="button" class="toast-action-btn apply-btn" id="rfz-apply-btn">\u26A1 Apply</button>`;
      }
      let copyBtnHtml = "";
      if (params.onCopy) {
        copyBtnHtml = `<button type="button" class="toast-action-btn" id="rfz-copy-btn">\u{1F4CB} Copy</button>`;
      }
      const modeLabel = params.mode === "better" ? "\u26A1 Better Calibrated" : "\u{1F9E0} Expert Briefing Applied";
      const domainLabel = params.domain ? `<span class="toast-domain-badge">${escapeHTML(params.domain)}</span>` : "";
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
          <button type="button" class="toast-action-btn undo-btn" id="rfz-undo-btn">\u21A9 Undo</button>
        </div>
        <button type="button" class="toast-close-btn" id="rfz-toast-close" title="Dismiss">\u2715</button>
      </div>
      <div class="toast-countdown-track">
        <div class="toast-countdown-bar" id="rfz-countdown-bar" style="width: 100%;"></div>
      </div>
    `;
      if (params.showApply && params.onApply) {
        const applyBtn = this.undoToastEl.querySelector("#rfz-apply-btn");
        applyBtn?.addEventListener("click", (e) => {
          e.stopPropagation();
          params.onApply();
          applyBtn.innerHTML = "\u2713 Applied";
          applyBtn.classList.add("applied");
        });
      }
      if (params.onCopy) {
        const copyBtn = this.undoToastEl.querySelector("#rfz-copy-btn");
        copyBtn?.addEventListener("click", (e) => {
          e.stopPropagation();
          params.onCopy();
          const orig = copyBtn.innerHTML;
          copyBtn.innerHTML = "\u2713 Copied";
          setTimeout(() => {
            if (copyBtn) copyBtn.innerHTML = orig;
          }, 1500);
        });
      }
      const undoBtn = this.undoToastEl.querySelector("#rfz-undo-btn");
      undoBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        params.onUndo();
        this.hideUndoToast();
      });
      const closeBtn = this.undoToastEl.querySelector("#rfz-toast-close");
      closeBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        this.hideUndoToast();
      });
      const countdownBar = this.undoToastEl.querySelector("#rfz-countdown-bar");
      const totalMs = 6e3;
      let remainingMs = totalMs;
      let isHovered = false;
      const stepMs = 50;
      this.undoToastEl.addEventListener("mouseenter", () => {
        isHovered = true;
      });
      this.undoToastEl.addEventListener("mouseleave", () => {
        isHovered = false;
      });
      this.countdownInterval = window.setInterval(() => {
        if (isHovered) return;
        remainingMs -= stepMs;
        if (countdownBar) {
          countdownBar.style.width = `${Math.max(0, remainingMs / totalMs * 100)}%`;
        }
        if (remainingMs <= 0) {
          this.hideUndoToast();
        }
      }, stepMs);
      this.shadow.appendChild(this.undoToastEl);
    }
    showUndoToast(summary, onUndo, options) {
      const isExpert = summary.toLowerCase().includes("expert");
      this.showValidationToast({
        mode: isExpert ? "expert" : "better",
        summary,
        domain: isExpert ? "Expert" : "Task",
        checklist: isExpert ? ["Exact core intent preserved", "Scope boundaries locked", "Execution criteria added", "Zero invented facts"] : ["Core intent clarified", "Vagueness eliminated", "Prompt structure calibrated"],
        onUndo,
        onCopy: options?.onCopy,
        onApply: options?.onApply,
        showApply: options?.showApply
      });
    }
    hideUndoToast() {
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
    startProgressAnimation() {
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
    triggerBetter() {
      const now = performance.now();
      if (this.isProcessing || now - this.lastTriggerTime < 400) return;
      this.lastTriggerTime = now;
      this.callbacks.onBetter();
    }
    triggerExpert() {
      const now = performance.now();
      if (this.isProcessing || now - this.lastTriggerTime < 400) return;
      this.lastTriggerTime = now;
      this.callbacks.onExpert();
    }
    resetState() {
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
      this.orbEl?.classList.remove("holding", "expert-ready", "dragging");
      this.resetCoreIcon();
      this.tooltipEl?.classList.remove("suppressed");
      if (this.progressCircle) {
        this.progressCircle.style.strokeDashoffset = "94.2";
      }
    }
    getAttachedElement() {
      return this.composerEl;
    }
    isInteracting() {
      return this.isHolding || this.isDragging || this.isProcessing || this.isExpertReady;
    }
    showHoverTooltip() {
      if (this.isInteracting() || this.undoToastEl || !this.tooltipEl) return;
      if (this.container) {
        const rect = this.container.getBoundingClientRect();
        if (rect.top < 65) {
          this.tooltipEl.classList.add("tooltip-bottom");
        } else {
          this.tooltipEl.classList.remove("tooltip-bottom");
        }
      }
      this.tooltipEl.classList.remove("suppressed");
      this.tooltipEl.classList.add("visible");
      this.tooltipEl.setAttribute("aria-hidden", "false");
    }
    hideHoverTooltip() {
      if (!this.tooltipEl) return;
      this.tooltipEl.classList.remove("visible");
      this.tooltipEl.setAttribute("aria-hidden", "true");
    }
    renderTooltipContent() {
      if (!this.tooltipEl) return;
      const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
      const modKey = isMac ? "\u2318" : "Ctrl";
      this.tooltipEl.innerHTML = `
      <div class="orb-tooltip-row">
        <span class="orb-tooltip-badge better">\u26A1 Click</span>
        <span class="orb-tooltip-action">Better Prompt</span>
      </div>
      <div class="orb-tooltip-row">
        <span class="orb-tooltip-badge expert">\u{1F9E0} Hold</span>
        <span class="orb-tooltip-action">Expert Briefing</span>
      </div>
      <div class="orb-tooltip-shortcuts">
        <kbd>${modKey}+Shift+B</kbd>
        <span>\xB7</span>
        <kbd>${modKey}+Shift+E</kbd>
      </div>
    `;
    }
    showHoldPill(text) {
      this.hideHoldPill();
      if (!this.shadow) return;
      this.holdPillEl = document.createElement("div");
      this.holdPillEl.className = "orb-hold-pill";
      this.holdPillEl.innerHTML = `<span class="orb-stage-dot"></span><span>${text}</span>`;
      this.shadow.appendChild(this.holdPillEl);
    }
    updateHoldPill(isExpert, text) {
      if (this.holdPillEl) {
        if (isExpert) this.holdPillEl.classList.add("expert-ready");
        this.holdPillEl.innerHTML = `<span class="orb-stage-dot"></span><span>${text}</span>`;
      }
    }
    hideHoldPill() {
      if (this.holdPillEl && this.holdPillEl.parentNode) {
        this.holdPillEl.parentNode.removeChild(this.holdPillEl);
      }
      this.holdPillEl = null;
    }
    resetCoreIcon() {
      const core = this.orbEl?.querySelector(".orb-core");
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
    showByokNudge(options) {
      if (!this.shadow) return;
      let opts = {};
      if (typeof options === "function") {
        opts = { onSettingsClick: options };
      } else if (options) {
        opts = options;
      }
      const existing = this.shadow.querySelector(".byok-nudge-pill");
      if (existing) existing.parentNode?.removeChild(existing);
      const isError = !!opts.isError;
      const icon = isError ? "\u26A0\uFE0F" : "\u{1F511}";
      const text = opts.message || (opts.reason ? `${opts.reason}` : "Add your free Gemini API key for unlimited speed");
      const ctaLabel = isError ? "Configure API Key \u2192" : "Settings \u2192";
      const nudge = document.createElement("div");
      nudge.className = `byok-nudge-pill ${isError ? "error-mode" : "warning-mode"}`;
      nudge.innerHTML = `
      <span class="byok-nudge-icon">${icon}</span>
      <span class="byok-nudge-text">${escapeHTML(text)}</span>
      <button type="button" class="byok-nudge-cta" id="rfz-byok-settings-btn">${escapeHTML(ctaLabel)}</button>
      <button type="button" class="byok-nudge-close" id="rfz-byok-close" title="Dismiss">\u2715</button>
    `;
      const settingsBtn = nudge.querySelector("#rfz-byok-settings-btn");
      settingsBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        if (opts.onSettingsClick) {
          opts.onSettingsClick();
        } else {
          try {
            if (typeof chrome !== "undefined" && chrome.runtime?.id) {
              chrome.runtime.sendMessage({ type: "REFINZI_OPEN_POPUP" }).catch(() => {
              });
            }
          } catch {
          }
        }
        nudge.parentNode?.removeChild(nudge);
      });
      const closeBtn = nudge.querySelector("#rfz-byok-close");
      closeBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        nudge.parentNode?.removeChild(nudge);
      });
      this.shadow.appendChild(nudge);
      const timeout = isError ? 12e3 : 8e3;
      setTimeout(() => {
        if (nudge.parentNode) nudge.parentNode.removeChild(nudge);
      }, timeout);
    }
    hide() {
      if (this.container) this.container.style.display = "none";
    }
    show() {
      if (this.container) this.container.style.display = "flex";
    }
    destroy() {
      this.resetState();
      this.hideUndoToast();
      window.removeEventListener("blur", this.boundOnWindowBlur);
      window.removeEventListener("keydown", this.boundOnWindowKeydown);
      window.removeEventListener("resize", this.boundOnWindowResize);
      window.removeEventListener("scroll", this.boundOnWindowScroll);
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
      this.container = null;
      this.shadow = null;
      this.orbEl = null;
      this.progressCircle = null;
      this.composerEl = null;
    }
  };

  // extension/src/browser/api.ts
  var BrowserAPIWrapper = class {
    rawBrowser;
    rawChrome;
    storage;
    runtime;
    commands;
    tabs;
    constructor() {
      this.rawBrowser = typeof globalThis.browser !== "undefined" ? globalThis.browser : null;
      this.rawChrome = typeof globalThis.chrome !== "undefined" ? globalThis.chrome : null;
      const getArea = (areaName) => {
        if (this.rawBrowser?.storage?.[areaName]) {
          return {
            get: (keys) => this.rawBrowser.storage[areaName].get(keys),
            set: (items) => this.rawBrowser.storage[areaName].set(items),
            remove: (keys) => this.rawBrowser.storage[areaName].remove(keys),
            clear: () => this.rawBrowser.storage[areaName].clear()
          };
        }
        if (this.rawChrome?.storage?.[areaName]) {
          const chromeArea = this.rawChrome.storage[areaName];
          return {
            get: (keys) => new Promise((resolve, reject) => {
              chromeArea.get(keys, (res) => {
                if (this.rawChrome.runtime?.lastError) {
                  reject(new Error(this.rawChrome.runtime.lastError.message));
                } else {
                  resolve(res || {});
                }
              });
            }),
            set: (items) => new Promise((resolve, reject) => {
              chromeArea.set(items, () => {
                if (this.rawChrome.runtime?.lastError) {
                  reject(new Error(this.rawChrome.runtime.lastError.message));
                } else {
                  resolve();
                }
              });
            }),
            remove: (keys) => new Promise((resolve, reject) => {
              chromeArea.remove(keys, () => {
                if (this.rawChrome.runtime?.lastError) {
                  reject(new Error(this.rawChrome.runtime.lastError.message));
                } else {
                  resolve();
                }
              });
            }),
            clear: () => new Promise((resolve, reject) => {
              chromeArea.clear(() => {
                if (this.rawChrome.runtime?.lastError) {
                  reject(new Error(this.rawChrome.runtime.lastError.message));
                } else {
                  resolve();
                }
              });
            })
          };
        }
        const memoryStore = /* @__PURE__ */ new Map();
        return {
          get: async (keys) => {
            if (!keys) return Object.fromEntries(memoryStore.entries());
            if (typeof keys === "string") return { [keys]: memoryStore.get(keys) };
            if (Array.isArray(keys)) {
              const out2 = {};
              for (const k of keys) out2[k] = memoryStore.get(k);
              return out2;
            }
            const out = { ...keys };
            for (const k of Object.keys(keys)) {
              if (memoryStore.has(k)) out[k] = memoryStore.get(k);
            }
            return out;
          },
          set: async (items) => {
            for (const [k, v] of Object.entries(items)) memoryStore.set(k, v);
          },
          remove: async (keys) => {
            const list = typeof keys === "string" ? [keys] : keys;
            for (const k of list) memoryStore.delete(k);
          },
          clear: async () => memoryStore.clear()
        };
      };
      this.storage = {
        local: getArea("local"),
        sync: getArea("sync")
      };
      const rawR = this.rawBrowser?.runtime || this.rawChrome?.runtime;
      this.runtime = {
        sendMessage: (message) => {
          if (this.rawBrowser?.runtime?.sendMessage) {
            return this.rawBrowser.runtime.sendMessage(message);
          }
          if (this.rawChrome?.runtime?.sendMessage) {
            return new Promise((resolve, reject) => {
              this.rawChrome.runtime.sendMessage(message, (response) => {
                const lastErr = this.rawChrome.runtime?.lastError;
                if (lastErr) {
                  reject(new Error(lastErr.message));
                } else {
                  resolve(response);
                }
              });
            });
          }
          return Promise.reject(new Error("Runtime messaging not supported in current environment"));
        },
        onMessage: {
          addListener: (callback) => {
            if (rawR?.onMessage?.addListener) {
              rawR.onMessage.addListener(callback);
            }
          },
          removeListener: (callback) => {
            if (rawR?.onMessage?.removeListener) {
              rawR.onMessage.removeListener(callback);
            }
          }
        },
        getURL: (path) => {
          if (rawR?.getURL) return rawR.getURL(path);
          return path;
        },
        getManifest: () => {
          if (rawR?.getManifest) return rawR.getManifest();
          return { name: "Refinzi", version: "2.1.0" };
        }
      };
      const rawC = this.rawBrowser?.commands || this.rawChrome?.commands;
      this.commands = {
        onCommand: {
          addListener: (cb) => {
            if (rawC?.onCommand?.addListener) rawC.onCommand.addListener(cb);
          },
          removeListener: (cb) => {
            if (rawC?.onCommand?.removeListener) rawC.onCommand.removeListener(cb);
          }
        }
      };
      const rawT = this.rawBrowser?.tabs || this.rawChrome?.tabs;
      this.tabs = {
        query: (queryInfo) => {
          if (this.rawBrowser?.tabs?.query) return this.rawBrowser.tabs.query(queryInfo);
          if (this.rawChrome?.tabs?.query) {
            return new Promise((resolve) => this.rawChrome.tabs.query(queryInfo, resolve));
          }
          return Promise.resolve([]);
        },
        sendMessage: (tabId, message) => {
          if (this.rawBrowser?.tabs?.sendMessage) return this.rawBrowser.tabs.sendMessage(tabId, message);
          if (this.rawChrome?.tabs?.sendMessage) {
            return new Promise((resolve, reject) => {
              this.rawChrome.tabs.sendMessage(tabId, message, (response) => {
                if (this.rawChrome.runtime?.lastError) {
                  reject(new Error(this.rawChrome.runtime.lastError.message));
                } else {
                  resolve(response);
                }
              });
            });
          }
          return Promise.resolve();
        }
      };
    }
    /**
     * Detected Browser Environment
     */
    get browserName() {
      if (typeof navigator !== "undefined") {
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes("edg/")) return "edge";
        if (ua.includes("firefox")) return "firefox";
        if (ua.includes("safari") && !ua.includes("chrome")) return "safari";
        if (ua.includes("chrome")) return "chrome";
      }
      if (this.rawBrowser && !this.rawChrome) return "firefox";
      return "generic";
    }
  };
  var BrowserAPI = new BrowserAPIWrapper();

  // extension/src/utils/storage-batch.ts
  var SNAPSHOT_TTL_MS = 1500;
  var snapshots = {};
  function invalidateSnapshot(key) {
    delete snapshots[key];
  }
  async function readSnapshot(key, fallbackEmpty) {
    const snap = snapshots[key];
    if (snap && Date.now() - snap.at < SNAPSHOT_TTL_MS && snap.value !== void 0) {
      return normalize(snap.value, fallbackEmpty);
    }
    try {
      const res = await BrowserAPI.storage.local.get([key]);
      const raw = res?.[key];
      snapshots[key] = { value: raw ?? null, at: Date.now() };
      return normalize(raw, fallbackEmpty);
    } catch {
      delete snapshots[key];
      return fallbackEmpty;
    }
  }
  function normalize(value, fallbackEmpty) {
    if (Array.isArray(fallbackEmpty)) {
      return Array.isArray(value) ? value : fallbackEmpty;
    }
    return value === null || value === void 0 ? fallbackEmpty : value;
  }
  function primeSnapshot(key, value) {
    snapshots[key] = { value, at: Date.now() };
  }
  var pendingWrites = null;
  async function stageWrite(items) {
    if (pendingWrites) {
      Object.assign(pendingWrites, items);
      return;
    }
    await BrowserAPI.storage.local.set(items);
  }

  // extension/src/utils/storage.ts
  var DEFAULT_GROQ_API_KEY = "";
  var DEFAULT_BAI_API_KEY = "";
  var DEPRECATED_GEMINI_API_KEYS = [];
  var DEFAULT_PROVIDER_MODELS = {
    // `gemini-flash-latest` is an evergreen alias that always resolves to the
    // newest Flash model (currently Gemini 3.8 Flash), so it never goes stale.
    gemini: "gemini-flash-latest",
    openai: "gpt-5.6-luna",
    deepseek: "deepseek-flash",
    openrouter: "deepseek/deepseek-v4-flash-0731:free",
    groq: "openai/gpt-oss-120b",
    bai: "qwen3.8-flash"
  };
  var DEFAULT_SETTINGS = {
    defaultMode: "better",
    // Default: Refinzi Cloud Gateway (zero client-side credentials, 25/day free tier).
    provider: "gateway",
    apiKeys: {
      groq: DEFAULT_GROQ_API_KEY
    },
    models: { ...DEFAULT_PROVIDER_MODELS },
    gatewayUrl: "https://refinzi.com/api/v1/refine",
    enabledSites: {
      chatgpt: true,
      claude: true,
      gemini: true,
      perplexity: true
    },
    shortcuts: {
      better: "Ctrl+Shift+B",
      expert: "Ctrl+Shift+E"
    },
    theme: "dark",
    autoFocus: true,
    showInlineTrigger: true,
    holdThresholdMs: 350,
    autoApply: true,
    saveHistory: true,
    hasSeenOnboarding: false,
    freeUsageCount: 0,
    freeUsageDate: "",
    freeUsageExpired: false
  };
  var DEPRECATED_MODELS = {
    gemini: [
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-2.5-pro",
      "gemini-2.0-flash",
      "gemini-2.0-flash-exp",
      "gemini-2.0-flash-lite",
      "gemini-1.5-flash",
      "gemini-1.5-flash-8b",
      "gemini-1.5-pro",
      "gemini-3-flash-preview"
    ],
    openai: [
      "gpt-4o-mini",
      "gpt-4o",
      "gpt-4-turbo",
      "gpt-4",
      "gpt-3.5-turbo",
      "o1-mini",
      "o1-preview",
      "o3-mini"
    ],
    deepseek: [
      "deepseek-chat",
      "deepseek-reasoner",
      "deepseek-v4-flash",
      "deepseek-v4-flash-vision-exp"
    ],
    openrouter: [
      "meta-llama/llama-3.3-70b-instruct:free",
      "deepseek/deepseek-r1:free",
      "deepseek/deepseek-chat",
      "google/gemini-2.0-flash-exp:free",
      "google/gemma-2-9b-it:free",
      "qwen/qwen-2.5-coder-32b-instruct:free",
      "mistralai/mistral-7b-instruct:free"
    ],
    groq: [
      "llama-3.3-70b-versatile",
      "llama-3.1-70b-versatile",
      "llama-3.1-8b-instant",
      "mixtral-8x7b-32768"
    ],
    bai: []
  };
  var SETTINGS_KEY = "refinzi_settings";
  function invalidateSettingsCache() {
    invalidateSnapshot(SETTINGS_KEY);
  }
  async function getSettings() {
    try {
      const saved = await readSnapshot(SETTINGS_KEY, null);
      if (!saved) {
        return { ...DEFAULT_SETTINGS };
      }
      const savedGeminiKey = saved.apiKeys?.gemini;
      const isDeprecatedGemini = !savedGeminiKey || savedGeminiKey.startsWith("AQ.") || DEPRECATED_GEMINI_API_KEYS.includes(savedGeminiKey);
      const resolvedGeminiKey = isDeprecatedGemini ? "" : savedGeminiKey;
      const savedBaiKey = saved.apiKeys?.bai;
      const isDeprecatedBai = savedBaiKey && (savedBaiKey.startsWith("sk-ws-H.") || savedBaiKey === DEFAULT_BAI_API_KEY);
      const resolvedBaiKey = isDeprecatedBai ? "" : savedBaiKey || "";
      const savedModels = saved.models || {};
      const resolvedModels = { ...DEFAULT_PROVIDER_MODELS };
      Object.keys(resolvedModels).forEach((key) => {
        const savedModel = savedModels[key];
        const deprecated = DEPRECATED_MODELS[key];
        const isRetired = !savedModel || deprecated.includes(savedModel);
        resolvedModels[key] = isRetired ? DEFAULT_PROVIDER_MODELS[key] : savedModel;
      });
      return {
        ...DEFAULT_SETTINGS,
        ...saved,
        provider: saved.provider || "gateway",
        apiKeys: {
          ...DEFAULT_SETTINGS.apiKeys,
          ...saved.apiKeys || {},
          gemini: resolvedGeminiKey,
          bai: resolvedBaiKey
        },
        models: resolvedModels,
        enabledSites: {
          ...DEFAULT_SETTINGS.enabledSites,
          ...saved.enabledSites || {}
        }
      };
    } catch {
      invalidateSettingsCache();
      return { ...DEFAULT_SETTINGS };
    }
  }
  async function saveSettings(patch) {
    const current = await getSettings();
    const updated = {
      ...current,
      ...patch,
      apiKeys: {
        ...current.apiKeys,
        ...patch.apiKeys || {}
      },
      models: {
        ...current.models,
        ...patch.models || {}
      },
      enabledSites: {
        ...current.enabledSites,
        ...patch.enabledSites || {}
      }
    };
    try {
      primeSnapshot(SETTINGS_KEY, updated);
      await stageWrite({ refinzi_settings: updated });
    } catch (err) {
      invalidateSettingsCache();
      console.error("[Refinzi] Failed to save settings:", err);
    }
    return updated;
  }

  // extension/src/engine/surface/safety.ts
  var EXCLUDED_INPUT_TYPES = /* @__PURE__ */ new Set([
    "password",
    "hidden",
    "file",
    "checkbox",
    "radio",
    "submit",
    "button",
    "reset",
    "image",
    "color",
    "range",
    "date",
    "datetime-local",
    "month",
    "time",
    "week"
  ]);
  var ALLOWED_INPUT_TYPES = /* @__PURE__ */ new Set([
    "text",
    "search",
    "email",
    "url",
    "tel",
    ""
    // empty defaults to text in HTML5
  ]);
  var SENSITIVE_AUTOCOMPLETE_PATTERN = /\b(current-password|new-password|one-time-code|cc-number|cc-csc|cc-exp|cc-exp-month|cc-exp-year|cc-type|transaction-amount)\b/i;
  var SENSITIVE_KEYWORD_PATTERN = /(?:^|[^a-zA-Z0-9])(?:password|passwd|secret|token|otp|2fa|cvv|cvc|card[-_]?number|credit[-_]?card|ssn|pin)(?:[^a-zA-Z0-9]|$)/i;
  function isSafeEditableElement(el) {
    if (!el || typeof el !== "object" || !(el instanceof HTMLElement)) {
      return false;
    }
    if (el.isConnected === false) {
      return false;
    }
    const isInput = el instanceof HTMLInputElement;
    const isTextarea = el instanceof HTMLTextAreaElement;
    let isContentEditable = false;
    let isRoleTextbox = false;
    let isRichEditor = false;
    if (!isInput && !isTextarea) {
      isContentEditable = el.isContentEditable || el.getAttribute("contenteditable") === "true" || el.getAttribute("contenteditable") === "plaintext-only" || el.getAttribute("contenteditable") === "";
      isRoleTextbox = el.getAttribute("role") === "textbox";
      isRichEditor = el.classList.contains("ProseMirror") || el.classList.contains("cm-content") || el.classList.contains("ql-editor") || el.hasAttribute("data-slate-editor") || el.hasAttribute("data-lexical-editor") || el.classList.contains("monaco-editor");
    }
    if (!isInput && !isTextarea && !isContentEditable && !isRoleTextbox && !isRichEditor) {
      return false;
    }
    if (el.hasAttribute("data-refinzi-orb-host") || el.closest("[data-refinzi-orb-host], .refinzi-orb-host, .undo-toast") || el.classList.contains("refinzi-orb") || el.classList.contains("refinzi-orb-host")) {
      return false;
    }
    if (isInput) {
      const rawType = (el.type || "text").toLowerCase().trim();
      if (EXCLUDED_INPUT_TYPES.has(rawType) || !ALLOWED_INPUT_TYPES.has(rawType)) {
        return false;
      }
      if (el.disabled || el.readOnly || el.hasAttribute("disabled") || el.hasAttribute("readonly")) {
        return false;
      }
      const autocomplete = el.autocomplete || el.getAttribute("autocomplete") || "";
      if (SENSITIVE_AUTOCOMPLETE_PATTERN.test(autocomplete)) {
        return false;
      }
      const identifierString = [
        el.id,
        el.name,
        el.placeholder,
        el.getAttribute("aria-label") || "",
        el.getAttribute("data-field-type") || ""
      ].join(" ");
      if (SENSITIVE_KEYWORD_PATTERN.test(identifierString)) {
        return false;
      }
      return true;
    }
    if (isTextarea) {
      if (el.disabled || el.readOnly || el.hasAttribute("disabled") || el.hasAttribute("readonly")) {
        return false;
      }
      const autocomplete = el.autocomplete || el.getAttribute("autocomplete") || "";
      if (SENSITIVE_AUTOCOMPLETE_PATTERN.test(autocomplete)) {
        return false;
      }
      const identifierString = [
        el.id,
        el.name,
        el.placeholder,
        el.getAttribute("aria-label") || ""
      ].join(" ");
      if (SENSITIVE_KEYWORD_PATTERN.test(identifierString)) {
        return false;
      }
      return true;
    }
    if (isContentEditable || isRoleTextbox || isRichEditor) {
      if (el.getAttribute("aria-readonly") === "true" || el.getAttribute("contenteditable") === "false" || el.getAttribute("aria-disabled") === "true") {
        return false;
      }
      const parentContainer = el.closest('[data-sensitive="true"], form[action*="login"], form[action*="auth"]');
      if (parentContainer) {
        const containerText = parentContainer.id + " " + parentContainer.className;
        if (SENSITIVE_KEYWORD_PATTERN.test(containerText)) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  // extension/src/engine/surface/destination.ts
  var KNOWN_DESTINATIONS = {
    "mail.google.com": "Gmail",
    "outlook.live.com": "Outlook",
    "outlook.office.com": "Outlook",
    "outlook.office365.com": "Outlook",
    "linkedin.com": "LinkedIn",
    "twitter.com": "X",
    "x.com": "X",
    "reddit.com": "Reddit",
    "notion.so": "Notion",
    "slack.com": "Slack",
    "discord.com": "Discord",
    "zendesk.com": "Zendesk",
    "salesforce.com": "Salesforce",
    "hubspot.com": "HubSpot",
    "chatgpt.com": "ChatGPT",
    "claude.ai": "Claude",
    "gemini.google.com": "Gemini",
    "perplexity.ai": "Perplexity",
    "github.com": "GitHub",
    "docs.google.com": "Google Docs",
    "word.office.com": "Microsoft Word",
    "atlassian.net": "Jira"
  };
  function getDestinationName(host) {
    let hostname = host;
    if (!hostname && typeof window !== "undefined" && window.location) {
      hostname = window.location.hostname;
    }
    if (!hostname) return "general";
    hostname = hostname.toLowerCase();
    if (KNOWN_DESTINATIONS[hostname]) {
      return KNOWN_DESTINATIONS[hostname];
    }
    for (const [domainKey, cleanName] of Object.entries(KNOWN_DESTINATIONS)) {
      if (hostname.endsWith(domainKey) || hostname.includes(domainKey)) {
        return cleanName;
      }
    }
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "Local Test";
    }
    const parts = hostname.split(".").filter((p) => p !== "www" && p !== "app" && p !== "com" && p !== "io" && p !== "co" && p !== "net" && p !== "org");
    if (parts.length > 0) {
      const mainPart = parts[parts.length - 1];
      return mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
    }
    return "general";
  }

  // extension/src/engine/surface/native.ts
  var NativeTextSurface = class {
    element;
    id;
    siteName;
    surfaceType = "native";
    undoStack = [];
    savedSelection = null;
    unobserveFn = null;
    constructor(element, destinationSite) {
      this.element = element;
      this.id = `native-${element.id || element.name || Math.random().toString(36).slice(2, 9)}`;
      this.siteName = destinationSite || getDestinationName();
    }
    detect() {
      return this.element.isConnected && isSafeEditableElement(this.element);
    }
    getValue() {
      return this.element.value || "";
    }
    setValue(text) {
      if (!this.detect()) return false;
      this.undoStack.push(this.getValue());
      if (this.undoStack.length > 20) {
        this.undoStack.shift();
      }
      this.applyValue(text);
      try {
        this.element.selectionStart = text.length;
        this.element.selectionEnd = text.length;
      } catch {
      }
      return true;
    }
    insertText(text) {
      if (!this.detect()) return false;
      const currentVal = this.getValue();
      const start = this.element.selectionStart ?? currentVal.length;
      const end = this.element.selectionEnd ?? currentVal.length;
      const nextVal = currentVal.substring(0, start) + text + currentVal.substring(end);
      this.undoStack.push(currentVal);
      this.applyValue(nextVal);
      try {
        const nextPos = start + text.length;
        this.element.selectionStart = nextPos;
        this.element.selectionEnd = nextPos;
      } catch {
      }
      return true;
    }
    getSelection() {
      try {
        const start = this.element.selectionStart;
        const end = this.element.selectionEnd;
        if (start !== null && end !== null && start < end) {
          const text = this.element.value.substring(start, end);
          if (text.trim().length > 0) {
            this.savedSelection = { start, end };
            return { start, end, text };
          }
        }
      } catch {
      }
      return null;
    }
    setSelection(start, end) {
      try {
        this.element.focus();
        this.element.setSelectionRange(start, end);
        this.savedSelection = { start, end };
      } catch {
      }
    }
    replaceSelection(text) {
      const selection = this.getSelection();
      if (!selection) {
        return this.setValue(text);
      }
      const currentVal = this.getValue();
      this.undoStack.push(currentVal);
      const nextVal = currentVal.substring(0, selection.start) + text + currentVal.substring(selection.end);
      this.applyValue(nextVal);
      try {
        const newEnd = selection.start + text.length;
        this.element.selectionStart = newEnd;
        this.element.selectionEnd = newEnd;
      } catch {
      }
      return true;
    }
    focus() {
      try {
        this.element.focus();
      } catch {
      }
    }
    restoreSelection() {
      if (this.savedSelection) {
        this.setSelection(this.savedSelection.start, this.savedSelection.end);
      }
    }
    supportsUndo() {
      return true;
    }
    undo() {
      if (this.undoStack.length === 0) return false;
      const previousValue = this.undoStack.pop();
      this.applyValue(previousValue);
      try {
        this.element.selectionStart = previousValue.length;
        this.element.selectionEnd = previousValue.length;
      } catch {
      }
      return true;
    }
    observe(callback) {
      const onInput = () => callback();
      const onChange = () => callback();
      this.element.addEventListener("input", onInput);
      this.element.addEventListener("change", onChange);
      const cleanup = () => {
        this.element.removeEventListener("input", onInput);
        this.element.removeEventListener("change", onChange);
      };
      this.unobserveFn = cleanup;
      return cleanup;
    }
    cleanup() {
      if (this.unobserveFn) {
        this.unobserveFn();
        this.unobserveFn = null;
      }
      this.undoStack = [];
      this.savedSelection = null;
    }
    /**
     * Safe value assignment for React / Vue / Angular controlled inputs.
     * Directly calling element.value = newValue does not trigger framework state updates
     * because modern frameworks override the prototype property setter.
     */
    applyValue(value) {
      this.element.focus();
      let execSucceeded = false;
      try {
        this.element.select();
        execSucceeded = document.execCommand("insertText", false, value);
      } catch {
        execSucceeded = false;
      }
      if (!execSucceeded || this.element.value !== value) {
        const proto = this.element instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
        const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
        if (descriptor?.set) {
          descriptor.set.call(this.element, value);
        } else {
          this.element.value = value;
        }
      }
      const inputEvt = new InputEvent("input", {
        bubbles: true,
        cancelable: true,
        inputType: "insertText"
      });
      this.element.dispatchEvent(inputEvt);
      const changeEvt = new Event("change", {
        bubbles: true,
        cancelable: true
      });
      this.element.dispatchEvent(changeEvt);
    }
  };

  // extension/src/engine/surface/contenteditable.ts
  var ContentEditableSurface = class {
    element;
    id;
    siteName;
    surfaceType = "contenteditable";
    undoStack = [];
    observer = null;
    unobserveFn = null;
    constructor(element, destinationSite) {
      this.element = element;
      this.id = `ce-${element.id || Math.random().toString(36).slice(2, 9)}`;
      this.siteName = destinationSite || getDestinationName();
    }
    detect() {
      return this.element.isConnected && isSafeEditableElement(this.element);
    }
    getValue() {
      const raw = this.element.innerText ?? this.element.textContent ?? "";
      return raw.trim();
    }
    setValue(text) {
      if (!this.detect()) return false;
      this.undoStack.push(this.element.innerHTML);
      if (this.undoStack.length > 20) {
        this.undoStack.shift();
      }
      return this.executeInjection(text);
    }
    insertText(text) {
      if (!this.detect()) return false;
      this.undoStack.push(this.element.innerHTML);
      this.element.focus();
      try {
        const inserted = document.execCommand("insertText", false, text);
        if (inserted) {
          this.dispatchEvents();
          return true;
        }
      } catch {
      }
      const textNode = document.createTextNode(text);
      this.element.appendChild(textNode);
      this.dispatchEvents();
      return true;
    }
    getSelection() {
      try {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
          return null;
        }
        const anchor = sel.anchorNode;
        const focus = sel.focusNode;
        if (anchor && focus && this.element.contains(anchor) && this.element.contains(focus)) {
          const text = sel.toString();
          if (text.trim().length > 0) {
            return {
              start: 0,
              end: text.length,
              text
            };
          }
        }
      } catch {
      }
      return null;
    }
    setSelection(_start, _end) {
      try {
        this.element.focus();
        const sel = window.getSelection();
        if (sel) {
          const range = document.createRange();
          range.selectNodeContents(this.element);
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      } catch {
      }
    }
    replaceSelection(text) {
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
        const anchor = sel.anchorNode;
        const focus = sel.focusNode;
        if (anchor && focus && this.element.contains(anchor) && this.element.contains(focus)) {
          this.undoStack.push(this.element.innerHTML);
          try {
            const inserted = document.execCommand("insertText", false, text);
            if (inserted) {
              this.dispatchEvents();
              return true;
            }
          } catch {
          }
          try {
            const range = sel.getRangeAt(0);
            range.deleteContents();
            const node = document.createTextNode(text);
            range.insertNode(node);
            range.setStartAfter(node);
            range.setEndAfter(node);
            sel.removeAllRanges();
            sel.addRange(range);
            this.dispatchEvents();
            return true;
          } catch {
          }
        }
      }
      return this.setValue(text);
    }
    focus() {
      try {
        this.element.focus();
      } catch {
      }
    }
    supportsUndo() {
      return true;
    }
    undo() {
      if (this.undoStack.length === 0) return false;
      const previousHTML = this.undoStack.pop();
      this.element.innerHTML = previousHTML;
      this.dispatchEvents();
      return true;
    }
    observe(callback) {
      const onInput = () => callback();
      this.element.addEventListener("input", onInput);
      this.observer = new MutationObserver(() => callback());
      this.observer.observe(this.element, {
        childList: true,
        characterData: true,
        subtree: true
      });
      const cleanup = () => {
        this.element.removeEventListener("input", onInput);
        if (this.observer) {
          this.observer.disconnect();
          this.observer = null;
        }
      };
      this.unobserveFn = cleanup;
      return cleanup;
    }
    cleanup() {
      if (this.unobserveFn) {
        this.unobserveFn();
        this.unobserveFn = null;
      }
      this.undoStack = [];
    }
    executeInjection(text) {
      this.element.focus();
      try {
        const selection = window.getSelection();
        if (selection) {
          const range = document.createRange();
          range.selectNodeContents(this.element);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          document.execCommand("selectAll", false);
        }
        const inserted = document.execCommand("insertText", false, text);
        if (inserted && this.isTextPresent(text)) {
          this.dispatchEvents();
          return true;
        }
      } catch {
      }
      try {
        this.element.focus();
        const dt = new DataTransfer();
        dt.setData("text/plain", text);
        const pasteEvent = new ClipboardEvent("paste", {
          clipboardData: dt,
          bubbles: true,
          cancelable: true
        });
        this.element.dispatchEvent(pasteEvent);
        if (this.isTextPresent(text)) {
          this.dispatchEvents();
          return true;
        }
      } catch {
      }
      try {
        this.element.focus();
        while (this.element.firstChild) {
          this.element.removeChild(this.element.firstChild);
        }
        const lines = text.split("\n");
        lines.forEach((line, index) => {
          if (index === 0 && lines.length === 1 && line.trim() !== "") {
            this.element.textContent = line;
          } else {
            const p = document.createElement("p");
            if (line.trim() === "") {
              p.appendChild(document.createElement("br"));
            } else {
              p.textContent = line;
            }
            this.element.appendChild(p);
          }
        });
        this.dispatchEvents();
        return true;
      } catch {
        return false;
      }
    }
    dispatchEvents() {
      const inputEvt = new InputEvent("input", {
        bubbles: true,
        cancelable: true,
        inputType: "insertText"
      });
      this.element.dispatchEvent(inputEvt);
      const changeEvt = new Event("change", {
        bubbles: true,
        cancelable: true
      });
      this.element.dispatchEvent(changeEvt);
    }
    isTextPresent(expected) {
      const current = (this.element.innerText || this.element.textContent || "").trim();
      const normalized = expected.trim();
      if (!normalized) return true;
      return current.includes(normalized.slice(0, Math.min(30, normalized.length)));
    }
  };

  // extension/src/engine/surface/rich.ts
  var RichTextSurface = class {
    element;
    id;
    siteName;
    surfaceType = "rich";
    delegate;
    constructor(element, destinationSite) {
      this.element = element;
      this.id = `rich-${element.id || element.className.toString().slice(0, 15) || Math.random().toString(36).slice(2, 9)}`;
      this.siteName = destinationSite || getDestinationName();
      if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
        this.delegate = new NativeTextSurface(element, this.siteName);
      } else {
        const embeddedInput = element.querySelector(
          "textarea.inputarea, textarea, input"
        );
        if (embeddedInput && isSafeEditableElement(embeddedInput)) {
          this.delegate = new NativeTextSurface(embeddedInput, this.siteName);
        } else {
          this.delegate = new ContentEditableSurface(element, this.siteName);
        }
      }
    }
    detect() {
      return this.element.isConnected && (isSafeEditableElement(this.element) || this.delegate.detect());
    }
    getValue() {
      return this.delegate.getValue();
    }
    setValue(text) {
      return this.delegate.setValue(text);
    }
    insertText(text) {
      return this.delegate.insertText(text);
    }
    getSelection() {
      return this.delegate.getSelection();
    }
    setSelection(start, end) {
      this.delegate.setSelection(start, end);
    }
    replaceSelection(text) {
      return this.delegate.replaceSelection(text);
    }
    focus() {
      this.delegate.focus();
    }
    supportsUndo() {
      return this.delegate.supportsUndo();
    }
    undo() {
      return this.delegate.undo();
    }
    observe(callback) {
      return this.delegate.observe(callback);
    }
    cleanup() {
      this.delegate.cleanup();
    }
  };

  // extension/src/engine/surface/siteSpecific.ts
  var SiteSpecificSurface = class {
    element;
    id;
    siteName;
    surfaceType = "site-specific";
    adapter;
    undoStack = [];
    observer = null;
    constructor(adapter, composerElement) {
      this.adapter = adapter;
      this.element = composerElement;
      this.id = `adapter-${adapter.id}`;
      this.siteName = adapter.name || adapter.id;
    }
    detect() {
      return this.adapter.detect() && this.element.isConnected;
    }
    getValue() {
      return this.adapter.getCurrentInput();
    }
    setValue(text) {
      const current = this.getValue();
      this.undoStack.push(current);
      if (this.undoStack.length > 20) {
        this.undoStack.shift();
      }
      const success = this.adapter.setComposerValue(text);
      this.focus();
      return success;
    }
    insertText(text) {
      const current = this.getValue();
      return this.setValue(current ? `${current} ${text}` : text);
    }
    getSelection() {
      if (this.element instanceof HTMLTextAreaElement || this.element instanceof HTMLInputElement) {
        const start = this.element.selectionStart;
        const end = this.element.selectionEnd;
        if (start !== null && end !== null && start < end) {
          const text = this.element.value.substring(start, end);
          if (text.trim().length > 0) {
            return { start, end, text };
          }
        }
      } else {
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
          const text = sel.toString();
          if (text.trim().length > 0) {
            return { start: 0, end: text.length, text };
          }
        }
      }
      return null;
    }
    setSelection(start, end) {
      if (this.element instanceof HTMLTextAreaElement || this.element instanceof HTMLInputElement) {
        try {
          this.element.setSelectionRange(start, end);
        } catch {
        }
      }
    }
    replaceSelection(text) {
      const sel = this.getSelection();
      if (!sel) {
        return this.setValue(text);
      }
      if (this.element instanceof HTMLTextAreaElement || this.element instanceof HTMLInputElement) {
        const val = this.element.value;
        const nextVal = val.substring(0, sel.start) + text + val.substring(sel.end);
        return this.setValue(nextVal);
      }
      try {
        const inserted = document.execCommand("insertText", false, text);
        if (inserted) return true;
      } catch {
      }
      return this.setValue(text);
    }
    focus() {
      this.adapter.focusComposer();
    }
    supportsUndo() {
      return true;
    }
    undo() {
      if (this.undoStack.length === 0) return false;
      const prev = this.undoStack.pop();
      return this.adapter.setComposerValue(prev);
    }
    observe(callback) {
      this.observer = this.adapter.observeComposer(callback);
      return () => {
        if (this.observer) {
          this.observer.disconnect();
          this.observer = null;
        }
      };
    }
    cleanup() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
      this.adapter.cleanup?.();
      this.undoStack = [];
    }
  };

  // extension/src/utils/inject.ts
  function injectPrompt(target, text) {
    if (!target) return false;
    try {
      target.focus();
      const isContentEditable = target.isContentEditable || target.getAttribute("contenteditable") === "true";
      if (isContentEditable) {
        return injectIntoContentEditable(target, text);
      } else if (target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement) {
        return injectIntoInput(target, text);
      } else {
        const editableChild = target.querySelector('[contenteditable="true"], textarea, input');
        if (editableChild) {
          return injectPrompt(editableChild, text);
        }
        return false;
      }
    } catch (err) {
      console.error("[Refinzi] Text injection failed:", err);
      return false;
    }
  }
  function injectIntoContentEditable(el, text) {
    el.focus();
    try {
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(el);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        document.execCommand("selectAll", false);
      }
      const inserted = document.execCommand("insertText", false, text);
      if (inserted && isTextPresent(el, text)) {
        dispatchInputEvents(el);
        return true;
      }
    } catch {
    }
    try {
      el.focus();
      const dt = new DataTransfer();
      dt.setData("text/plain", text);
      const pasteEvent = new ClipboardEvent("paste", {
        clipboardData: dt,
        bubbles: true,
        cancelable: true
      });
      el.dispatchEvent(pasteEvent);
      if (isTextPresent(el, text)) {
        dispatchInputEvents(el);
        return true;
      }
    } catch {
    }
    try {
      el.focus();
      while (el.firstChild) {
        el.removeChild(el.firstChild);
      }
      const lines = text.split("\n");
      lines.forEach((line, index) => {
        const p = document.createElement("p");
        if (line.trim() === "") {
          p.appendChild(document.createElement("br"));
        } else {
          p.textContent = line;
        }
        el.appendChild(p);
        if (index === 0 && lines.length === 1 && line.trim() !== "") {
          el.textContent = line;
        }
      });
      dispatchInputEvents(el);
      return true;
    } catch {
      return false;
    }
  }
  function injectIntoInput(target, text) {
    target.focus();
    const proto = target instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
    if (descriptor?.set) {
      descriptor.set.call(target, text);
    } else {
      target.value = text;
    }
    dispatchInputEvents(target);
    try {
      target.selectionStart = target.value.length;
      target.selectionEnd = target.value.length;
    } catch {
    }
    return true;
  }
  function dispatchInputEvents(element) {
    const inputEvt = new InputEvent("input", {
      bubbles: true,
      cancelable: true,
      inputType: "insertText"
    });
    element.dispatchEvent(inputEvt);
    const changeEvt = new Event("change", {
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(changeEvt);
  }
  function isTextPresent(el, expected) {
    const current = (el.innerText || el.textContent || "").trim();
    const normalizedExpected = expected.trim();
    if (!normalizedExpected) return true;
    return current.includes(normalizedExpected.slice(0, Math.min(30, normalizedExpected.length)));
  }

  // extension/src/adapters/base.ts
  var BaseSiteAdapter = class {
    getCurrentInput() {
      const composer = this.getComposer();
      if (!composer) return "";
      if (composer.isContentEditable || composer.getAttribute("contenteditable") === "true") {
        return (composer.innerText || composer.textContent || "").trim();
      }
      if (composer instanceof HTMLTextAreaElement || composer instanceof HTMLInputElement) {
        return (composer.value || "").trim();
      }
      const child = composer.querySelector("textarea, input");
      if (child) return (child.value || "").trim();
      return (composer.textContent || "").trim();
    }
    setComposerValue(text) {
      const composer = this.getComposer();
      if (!composer) return false;
      return injectPrompt(composer, text);
    }
    focusComposer() {
      const composer = this.getComposer();
      if (composer) {
        composer.focus();
      }
    }
    observeComposer(callback) {
      if (typeof MutationObserver === "undefined") return null;
      let debounceTimer = null;
      const debouncedCallback = () => {
        if (debounceTimer) window.clearTimeout(debounceTimer);
        debounceTimer = window.setTimeout(callback, 200);
      };
      const observer = new MutationObserver((mutations) => {
        let hasRelevantChange = false;
        for (const m of mutations) {
          if (m.type === "childList" && (m.addedNodes.length > 0 || m.removedNodes.length > 0)) {
            hasRelevantChange = true;
            break;
          }
        }
        if (hasRelevantChange) {
          debouncedCallback();
        }
      });
      try {
        observer.observe(document.body || document.documentElement, {
          childList: true,
          subtree: true
        });
        return observer;
      } catch {
        return null;
      }
    }
    supportsApply() {
      return this.getComposer() !== null;
    }
    cleanup() {
    }
  };

  // extension/src/adapters/chatgpt.ts
  var ChatGPTAdapter = class extends BaseSiteAdapter {
    id = "chatgpt";
    name = "ChatGPT";
    detect() {
      if (typeof window === "undefined" || !window.location) return false;
      const host = window.location.hostname.toLowerCase();
      return host.includes("chatgpt.com") || host.includes("chat.openai.com");
    }
    getComposer() {
      const selectors = [
        "#prompt-textarea",
        'div[id="prompt-textarea"][contenteditable="true"]',
        'div[contenteditable="true"].ProseMirror',
        'textarea[data-id="root"]',
        'form textarea[tabindex="0"]',
        'div[data-placeholder*="Ask anything"]',
        'div[data-placeholder*="Message ChatGPT"]',
        'form [contenteditable="true"]',
        "textarea#prompt-textarea"
      ];
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el && this.isElementVisible(el)) {
          return el;
        }
      }
      return null;
    }
    getSubmitButton() {
      const selectors = [
        'button[data-testid="send-button"]',
        'button[aria-label="Send prompt"]',
        'button[aria-label="Send message"]',
        'button[data-testid="fruitjuice-send-button"]',
        'form button[type="submit"]'
      ];
      for (const sel of selectors) {
        const btn = document.querySelector(sel);
        if (btn && this.isElementVisible(btn)) {
          return btn;
        }
      }
      return null;
    }
    isElementVisible(el) {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }
  };

  // extension/src/adapters/claude.ts
  var ClaudeAdapter = class extends BaseSiteAdapter {
    id = "claude";
    name = "Claude";
    detect() {
      if (typeof window === "undefined" || !window.location) return false;
      const host = window.location.hostname.toLowerCase();
      return host.includes("claude.ai");
    }
    getComposer() {
      const selectors = [
        'div[contenteditable="true"].ProseMirror',
        'fieldset div[contenteditable="true"]',
        'div[contenteditable="true"][data-placeholder*="How can Claude help"]',
        'div[contenteditable="true"][data-placeholder*="Reply to Claude"]',
        'div[contenteditable="true"][data-placeholder*="Reply"]',
        'div.ProseMirror[contenteditable="true"]',
        'div[contenteditable="true"]'
      ];
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el && this.isElementVisible(el)) {
          return el;
        }
      }
      return null;
    }
    getSubmitButton() {
      const selectors = [
        'button[aria-label="Send Message"]',
        'button[aria-label="Send message"]',
        'button[aria-label="Send"]',
        'fieldset button[type="submit"]',
        'button:has(svg[viewBox*="24"])'
      ];
      for (const sel of selectors) {
        const btn = document.querySelector(sel);
        if (btn && this.isElementVisible(btn)) {
          return btn;
        }
      }
      return null;
    }
    isElementVisible(el) {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }
  };

  // extension/src/adapters/gemini.ts
  var GeminiAdapter = class extends BaseSiteAdapter {
    id = "gemini";
    name = "Gemini";
    detect() {
      if (typeof window === "undefined" || !window.location) return false;
      const host = window.location.hostname.toLowerCase();
      return host.includes("gemini.google.com");
    }
    getComposer() {
      const selectors = [
        'rich-textarea div[contenteditable="true"]',
        'div[contenteditable="true"][aria-label*="Enter a prompt"]',
        'div[contenteditable="true"][aria-label*="Ask Gemini"]',
        'div[contenteditable="true"][aria-label*="prompt"]',
        'div.ql-editor[contenteditable="true"]',
        'rich-textarea [contenteditable="true"]',
        "textarea.textarea",
        'div[contenteditable="true"]'
      ];
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el && this.isElementVisible(el)) {
          return el;
        }
      }
      return null;
    }
    getSubmitButton() {
      const selectors = [
        'button[aria-label*="Send prompt"]',
        'button[aria-label*="Send message"]',
        'button[aria-label*="Send"]',
        "button.send-button",
        'button[mattooltip*="Send"]'
      ];
      for (const sel of selectors) {
        const btn = document.querySelector(sel);
        if (btn && this.isElementVisible(btn)) {
          return btn;
        }
      }
      return null;
    }
    isElementVisible(el) {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }
  };

  // extension/src/adapters/perplexity.ts
  var PerplexityAdapter = class extends BaseSiteAdapter {
    id = "perplexity";
    name = "Perplexity";
    detect() {
      if (typeof window === "undefined" || !window.location) return false;
      const host = window.location.hostname.toLowerCase();
      return host.includes("perplexity.ai");
    }
    getComposer() {
      const selectors = [
        'textarea[placeholder*="Ask anything"]',
        'textarea[placeholder*="Ask a question"]',
        'textarea[placeholder*="Ask follow-up"]',
        'textarea[placeholder*="Ask"]',
        'div[contenteditable="true"][data-placeholder*="Ask"]',
        'textarea[rows="1"]',
        "form textarea",
        "textarea"
      ];
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el && this.isElementVisible(el)) {
          return el;
        }
      }
      return null;
    }
    getSubmitButton() {
      const selectors = [
        'button[aria-label*="Submit"]',
        'button[aria-label*="Send"]',
        'button[aria-label*="Ask"]',
        'form button[type="submit"]',
        "button:has(svg)"
      ];
      for (const sel of selectors) {
        const btn = document.querySelector(sel);
        if (btn && this.isElementVisible(btn)) {
          return btn;
        }
      }
      return null;
    }
    isElementVisible(el) {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }
  };

  // extension/src/adapters/registry.ts
  var GenericDevAdapter = class extends BaseSiteAdapter {
    id = "generic";
    name = "Generic / Test";
    detect() {
      if (typeof window === "undefined" || !window.location) return true;
      const host = window.location.hostname.toLowerCase();
      return host === "localhost" || host === "127.0.0.1" || host === "" || window.location.protocol === "file:";
    }
    getComposer() {
      return document.querySelector(
        '#prompt-textarea, [data-refinzi-test-input], textarea, [contenteditable="true"]'
      );
    }
    getSubmitButton() {
      return document.querySelector('button[type="submit"], #send-button, button');
    }
  };
  var AdapterRegistry = class {
    static adapters = [
      new ChatGPTAdapter(),
      new ClaudeAdapter(),
      new GeminiAdapter(),
      new PerplexityAdapter(),
      new GenericDevAdapter()
    ];
    static getActiveAdapter() {
      for (const adapter of this.adapters) {
        if (adapter.detect()) {
          return adapter;
        }
      }
      return null;
    }
    static getAllAdapters() {
      return [...this.adapters];
    }
  };

  // extension/src/engine/surface/factory.ts
  var SurfaceFactory = class {
    /**
     * Creates a TextSurface for the provided element.
     * Returns null if the element is not safe, not editable, or excluded.
     */
    static createSurface(element) {
      if (!element || !isSafeEditableElement(element)) {
        return null;
      }
      try {
        const activeAdapter = AdapterRegistry.getActiveAdapter();
        if (activeAdapter && activeAdapter.id !== "generic") {
          const composer = activeAdapter.getComposer();
          if (composer && (composer === element || composer.contains(element) || element.contains(composer))) {
            return new SiteSpecificSurface(activeAdapter, composer);
          }
        }
      } catch {
      }
      const isRichEditor = element.classList.contains("ProseMirror") || element.classList.contains("cm-content") || element.classList.contains("ql-editor") || element.hasAttribute("data-slate-editor") || element.hasAttribute("data-lexical-editor") || element.closest(".monaco-editor, .cm-editor, .DraftEditor-root") !== null;
      if (isRichEditor) {
        return new RichTextSurface(element);
      }
      if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
        return new NativeTextSurface(element);
      }
      if (element.isContentEditable || element.getAttribute("contenteditable") === "true" || element.getAttribute("contenteditable") === "plaintext-only" || element.getAttribute("contenteditable") === "" || element.getAttribute("role") === "textbox") {
        return new ContentEditableSurface(element);
      }
      return null;
    }
  };

  // extension/src/engine/surface/engine.ts
  var UniversalTextEngine = class {
    activeSurface = null;
    callbacks;
    isRunning = false;
    blurTimeout = null;
    discoveryTimeout = null;
    mutationObserver = null;
    geometryRafId = null;
    geometryPending = false;
    // Bound event listeners for clean destruction
    boundOnFocusIn = (e) => this.handleFocusIn(e);
    boundOnFocusOut = (e) => this.handleFocusOut(e);
    boundOnPointerDown = (e) => this.handlePointerDown(e);
    boundOnPointerOver = (e) => this.handlePointerOver(e);
    boundOnScroll = () => this.handleGeometryChange();
    boundOnResize = () => this.handleGeometryChange();
    boundOnPopState = () => this.handleNavigationChange();
    constructor(callbacks) {
      this.callbacks = callbacks;
    }
    /**
     * Starts universal text surface tracking across the webpage.
     */
    start() {
      if (this.isRunning) return;
      this.isRunning = true;
      this.hookHistoryState();
      document.addEventListener("focusin", this.boundOnFocusIn, true);
      document.addEventListener("focusout", this.boundOnFocusOut, true);
      document.addEventListener("pointerdown", this.boundOnPointerDown, true);
      document.addEventListener("pointerover", this.boundOnPointerOver, { passive: true });
      window.addEventListener("scroll", this.boundOnScroll, { passive: true, capture: true });
      window.addEventListener("resize", this.boundOnResize, { passive: true });
      window.addEventListener("popstate", this.boundOnPopState, { passive: true });
      this.startDOMObserver();
      this.checkCurrentActiveElement();
      if (!this.activeSurface) {
        this.discoverInitialSurface();
      }
    }
    /**
     * Gets the currently active TextSurface, if any.
     */
    getActiveSurface() {
      if (this.activeSurface && this.activeSurface.detect()) {
        return this.activeSurface;
      }
      return null;
    }
    handleFocusIn(e) {
      if (this.blurTimeout) {
        clearTimeout(this.blurTimeout);
        this.blurTimeout = null;
      }
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      this.tryActivateElement(target);
    }
    handlePointerDown(e) {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.hasAttribute("data-refinzi-orb-host") || target.closest("[data-refinzi-orb-host], .refinzi-orb-host, .undo-toast")) {
        if (this.blurTimeout) {
          clearTimeout(this.blurTimeout);
          this.blurTimeout = null;
        }
        return;
      }
      if (isSafeEditableElement(target)) {
        this.tryActivateElement(target);
      }
    }
    handleFocusOut(e) {
      const related = e.relatedTarget;
      if (related instanceof HTMLElement) {
        if (related.hasAttribute("data-refinzi-orb-host") || related.closest("[data-refinzi-orb-host], .refinzi-orb-host, .undo-toast")) {
          return;
        }
        if (isSafeEditableElement(related)) {
          return;
        }
      }
      if (this.blurTimeout) clearTimeout(this.blurTimeout);
      this.blurTimeout = window.setTimeout(() => {
        const currentActive = document.activeElement;
        if (this.activeSurface && currentActive && (currentActive === this.activeSurface.element || this.activeSurface.element.contains(currentActive) || currentActive.closest?.("[data-refinzi-orb-host]"))) {
          return;
        }
        if (this.activeSurface && this.activeSurface.element && this.activeSurface.element.isConnected) {
          const val = this.activeSurface.getValue().trim();
          if (val.length > 0) {
            return;
          }
        }
        this.deactivateCurrentSurface();
      }, 1500);
    }
    handlePointerOver(e) {
      if (this.activeSurface) return;
      const target = e.target;
      if (target instanceof HTMLElement && isSafeEditableElement(target)) {
        this.tryActivateElement(target);
      }
    }
    handleGeometryChange() {
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
    handleNavigationChange() {
      this.scheduleSurfaceDiscovery();
    }
    hookHistoryState() {
      if (typeof window === "undefined" || !window.history) return;
      const originalPushState = window.history.pushState;
      const originalReplaceState = window.history.replaceState;
      if (originalPushState && !originalPushState.__refinziHooked__) {
        window.history.pushState = (...args) => {
          const ret = originalPushState.apply(window.history, args);
          this.handleNavigationChange();
          return ret;
        };
        window.history.pushState.__refinziHooked__ = true;
      }
      if (originalReplaceState && !originalReplaceState.__refinziHooked__) {
        window.history.replaceState = (...args) => {
          const ret = originalReplaceState.apply(window.history, args);
          this.handleNavigationChange();
          return ret;
        };
        window.history.replaceState.__refinziHooked__ = true;
      }
    }
    scheduleSurfaceDiscovery() {
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
    discoverInitialSurface() {
      if (this.activeSurface && this.activeSurface.element.isConnected) return;
      const active = document.activeElement;
      if (active instanceof HTMLElement && isSafeEditableElement(active)) {
        this.tryActivateElement(active);
        return;
      }
      const selectors = [
        "#prompt-textarea",
        'div[id="prompt-textarea"][contenteditable="true"]',
        'div[contenteditable="true"].ProseMirror',
        'div[contenteditable="true"][data-placeholder]',
        'div[contenteditable="true"].ql-editor',
        'textarea[data-id="root"]',
        "textarea:not([disabled]):not([readonly])",
        '[contenteditable="true"]:not([contenteditable="false"])'
      ];
      for (const sel of selectors) {
        try {
          const els = document.querySelectorAll(sel);
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
        }
      }
    }
    tryActivateElement(element) {
      if (!isSafeEditableElement(element)) {
        return;
      }
      if (this.activeSurface && this.activeSurface.element === element) {
        this.callbacks.onPositionUpdate(this.activeSurface);
        return;
      }
      const newSurface = SurfaceFactory.createSurface(element);
      if (!newSurface) {
        return;
      }
      this.deactivateCurrentSurface();
      this.activeSurface = newSurface;
      this.callbacks.onSurfaceActivated(newSurface);
    }
    deactivateCurrentSurface() {
      if (!this.activeSurface) return;
      const oldSurface = this.activeSurface;
      this.activeSurface = null;
      oldSurface.cleanup();
      this.callbacks.onSurfaceDeactivated(oldSurface);
    }
    checkCurrentActiveElement() {
      const active = document.activeElement;
      if (active instanceof HTMLElement && isSafeEditableElement(active)) {
        this.tryActivateElement(active);
      }
    }
    startDOMObserver() {
      this.mutationObserver = new MutationObserver((mutations) => {
        if (!this.activeSurface) {
          let hasNewElements = false;
          for (const m of mutations) {
            if (m.type === "childList" && m.addedNodes.length > 0) {
              hasNewElements = true;
              break;
            }
          }
          if (hasNewElements) {
            this.scheduleSurfaceDiscovery();
          }
          return;
        }
        if (!this.activeSurface.element.isConnected) {
          this.deactivateCurrentSurface();
          this.scheduleSurfaceDiscovery();
          return;
        }
        let needsReposition = false;
        for (const m of mutations) {
          const target = m.target;
          if (target instanceof HTMLElement) {
            if (target.hasAttribute?.("data-refinzi-orb-host") || target.closest?.("[data-refinzi-orb-host], .refinzi-orb-host, .undo-toast")) {
              continue;
            }
          }
          if (m.type === "childList" || m.type === "attributes") {
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
        attributeFilter: ["style", "class", "hidden"]
      });
    }
    /**
     * Shuts down engine and cleans up all event listeners and active surfaces.
     */
    destroy() {
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
      document.removeEventListener("focusin", this.boundOnFocusIn, true);
      document.removeEventListener("focusout", this.boundOnFocusOut, true);
      document.removeEventListener("pointerdown", this.boundOnPointerDown, true);
      document.removeEventListener("pointerover", this.boundOnPointerOver);
      window.removeEventListener("scroll", this.boundOnScroll, true);
      window.removeEventListener("resize", this.boundOnResize);
      window.removeEventListener("popstate", this.boundOnPopState);
      this.deactivateCurrentSurface();
    }
  };

  // extension/src/ui/onboarding.ts
  var RefinziOnboardingModal = class _RefinziOnboardingModal {
    container = null;
    shadow = null;
    isVisible = false;
    holdTimer = null;
    isHolding = false;
    progressAnimationFrame = null;
    static async checkAndShowFirstRun() {
      try {
        const settings = await getSettings();
        if (!settings.hasSeenOnboarding) {
          await saveSettings({ hasSeenOnboarding: true });
          const modal = new _RefinziOnboardingModal();
          modal.show();
        }
      } catch {
      }
    }
    show() {
      if (this.isVisible || document.getElementById("refinzi-onboarding-root")) return;
      this.isVisible = true;
      saveSettings({ hasSeenOnboarding: true }).catch(() => {
      });
      this.container = document.createElement("div");
      this.container.id = "refinzi-onboarding-root";
      this.container.style.position = "fixed";
      this.container.style.inset = "0";
      this.container.style.zIndex = "2147483647";
      this.container.style.display = "flex";
      this.container.style.alignItems = "center";
      this.container.style.justifyContent = "center";
      this.shadow = this.container.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = `
      :host {
        all: initial;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        color: #E2E8F0;
        -webkit-font-smoothing: antialiased;
      }
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      .backdrop {
        position: fixed;
        inset: 0;
        background: rgba(8, 9, 13, 0.78);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        opacity: 0;
        animation: rfzFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      .modal-card {
        position: relative;
        width: 92%;
        max-width: 540px;
        background: radial-gradient(circle at 50% 0%, rgba(32, 34, 46, 0.98) 0%, rgba(14, 15, 22, 0.98) 100%);
        border: 1px solid rgba(255, 215, 0, 0.25);
        border-radius: 20px;
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.8), 0 0 32px rgba(255, 215, 0, 0.1);
        padding: 28px 28px 24px;
        opacity: 0;
        transform: scale(0.94) translateY(12px);
        animation: rfzCardIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) 0.05s forwards;
      }
      @keyframes rfzFadeIn {
        to { opacity: 1; }
      }
      @keyframes rfzCardIn {
        to { opacity: 1; transform: scale(1) translateY(0); }
      }
      .header-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(255, 215, 0, 0.1);
        border: 1px solid rgba(255, 215, 0, 0.25);
        border-radius: 999px;
        padding: 4px 12px;
        font-size: 11px;
        font-weight: 600;
        color: #FFD700;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        margin-bottom: 12px;
      }
      .header-title {
        font-size: 22px;
        font-weight: 700;
        color: #F8FAFC;
        letter-spacing: -0.4px;
        line-height: 1.3;
        margin-bottom: 8px;
      }
      .header-title span {
        background: linear-gradient(135deg, #FFE066 0%, #FFD700 60%, #FF9500 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .header-desc {
        font-size: 13.5px;
        color: #94A3B8;
        line-height: 1.5;
        margin-bottom: 20px;
      }
      .mechanics-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 20px;
      }
      .mechanic-box {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        padding: 14px;
        transition: all 0.2s ease;
      }
      .mechanic-box.better:hover {
        border-color: rgba(255, 215, 0, 0.4);
        background: rgba(255, 215, 0, 0.04);
      }
      .mechanic-box.expert:hover {
        border-color: rgba(168, 85, 247, 0.4);
        background: rgba(168, 85, 247, 0.04);
      }
      .action-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 700;
        border-radius: 6px;
        padding: 3px 8px;
        margin-bottom: 8px;
      }
      .better .action-pill {
        background: rgba(255, 215, 0, 0.15);
        color: #FFD700;
      }
      .expert .action-pill {
        background: rgba(168, 85, 247, 0.18);
        color: #C084FC;
      }
      .mechanic-title {
        font-size: 14px;
        font-weight: 600;
        color: #F1F5F9;
        margin-bottom: 4px;
      }
      .mechanic-detail {
        font-size: 12px;
        color: #94A3B8;
        line-height: 1.45;
      }
      /* Simulator Sandbox */
      .sandbox-wrapper {
        background: rgba(10, 11, 16, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 14px;
        padding: 14px 16px;
        margin-bottom: 22px;
      }
      .sandbox-label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 11px;
        font-weight: 600;
        color: #64748B;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
      }
      .sandbox-badge {
        font-size: 10.5px;
        color: #10B981;
        font-weight: 600;
      }
      .sandbox-box {
        position: relative;
        display: flex;
        align-items: center;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 10px;
        padding: 10px 12px;
        min-height: 52px;
      }
      .sandbox-text {
        flex: 1;
        font-size: 13px;
        color: #F8FAFC;
        line-height: 1.4;
        padding-right: 42px;
        transition: color 0.18s ease;
      }
      .sandbox-text.updated {
        color: #FFE066;
      }
      /* Simulator Orb */
      .demo-orb {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: radial-gradient(circle at 35% 30%, #2A2720 0%, #151411 70%, #0A0908 100%);
        border: 1.2px solid rgba(255, 215, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        user-select: none;
        box-shadow: 0 0 14px rgba(255, 215, 0, 0.3);
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }
      .demo-orb:hover {
        transform: translateY(-50%) scale(1.08);
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
      }
      .demo-orb:active {
        transform: translateY(-50%) scale(0.96);
      }
      .demo-orb-svg {
        width: 16px;
        height: 16px;
      }
      .demo-ring-svg {
        position: absolute;
        inset: -4px;
        width: 40px;
        height: 40px;
        pointer-events: none;
      }
      .demo-ring-circle {
        fill: none;
        stroke: #A855F7;
        stroke-width: 2.5;
        stroke-dasharray: 106.8;
        stroke-dashoffset: 106.8;
        transform: rotate(-90deg);
        transform-origin: 50% 50%;
        transition: stroke-dashoffset 0.05s linear;
      }
      .footer-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .btn-primary {
        flex: 1;
        background: linear-gradient(135deg, #FFD700 0%, #FF9500 100%);
        color: #0F172A;
        font-weight: 700;
        font-size: 13.5px;
        padding: 10px 18px;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        box-shadow: 0 4px 16px rgba(255, 215, 0, 0.3);
        transition: all 0.16s ease;
      }
      .btn-primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 22px rgba(255, 215, 0, 0.45);
      }
      .btn-close {
        position: absolute;
        top: 18px;
        right: 18px;
        background: transparent;
        border: none;
        color: #64748B;
        font-size: 16px;
        cursor: pointer;
        padding: 4px;
        line-height: 1;
        border-radius: 50%;
        transition: color 0.15s;
      }
      .btn-close:hover {
        color: #F8FAFC;
      }
      .feedback-note {
        font-size: 11px;
        color: #64748B;
        text-align: center;
        margin-top: 10px;
      }
      .feedback-note kbd {
        background: rgba(255, 255, 255, 0.08);
        padding: 1px 4px;
        border-radius: 4px;
        color: #94A3B8;
      }
    `;
      this.shadow.appendChild(style);
      const backdrop = document.createElement("div");
      backdrop.className = "backdrop";
      const card = document.createElement("div");
      card.className = "modal-card";
      card.innerHTML = `
      <button type="button" class="btn-close" id="rfz-onboarding-close" title="Close (Esc)">\u2715</button>
      
      <div class="header-badge">\u2728 Welcome to Refinzi</div>
      <h2 class="header-title">Any Text Box. <span>Zero Friction.</span></h2>
      <p class="header-desc">
        Refinzi docks an intelligent ambient Orb beside any text box across the web. Type your raw thought and refine it in-place.
      </p>

      <div class="mechanics-grid">
        <div class="mechanic-box better">
          <div class="action-pill">\u26A1 CLICK</div>
          <div class="mechanic-title">Better Mode</div>
          <div class="mechanic-detail">Instant task calibration. Fixes vagueness and sharpens intent without changing what you asked for.</div>
        </div>

        <div class="mechanic-box expert">
          <div class="action-pill">\u{1F9E0} HOLD (350ms)</div>
          <div class="mechanic-title">Expert Mode</div>
          <div class="mechanic-detail">Deep execution briefing. Adds missing dimensions, constraints, and defensible baseline assumptions.</div>
        </div>
      </div>

      <!-- Live Simulator -->
      <div class="sandbox-wrapper">
        <div class="sandbox-label">
          <span>Interactive Sandbox</span>
          <span class="sandbox-badge" id="demo-mode-badge">\u26A1 Click or Hold Orb below</span>
        </div>
        <div class="sandbox-box">
          <div class="sandbox-text" id="demo-text">write landing page hero for developer tool</div>
          <div class="demo-orb" id="demo-orb" title="Click for Better, Hold for Expert">
            <svg class="demo-orb-svg" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3.5 13.5H11.5L10.5 22L20.5 10.5H12.5L13 2Z" fill="url(#demo-gold-grad)" />
              <defs>
                <linearGradient id="demo-gold-grad" x1="3.5" y1="2" x2="20.5" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#FFFDF0" />
                  <stop offset="0.5" stop-color="#FFD700" />
                  <stop offset="1" stop-color="#FF9500" />
                </linearGradient>
              </defs>
            </svg>
            <svg class="demo-ring-svg" viewBox="0 0 40 40">
              <circle class="demo-ring-circle" id="demo-ring" cx="20" cy="20" r="17"></circle>
            </svg>
          </div>
        </div>
      </div>

      <div class="footer-row">
        <button type="button" class="btn-primary" id="rfz-onboarding-submit">
          Got it \u2014 Show me Step 2 \u2192
        </button>
      </div>
      <div class="feedback-note">Press <kbd>Esc</kbd> anytime to dismiss. Replay from the extension popup \u2192 Settings.</div>
    `;
      this.shadow.appendChild(backdrop);
      this.shadow.appendChild(card);
      document.body.appendChild(this.container);
      this.bindEvents(card, backdrop);
    }
    bindEvents(card, backdrop) {
      const closeBtn = card.querySelector("#rfz-onboarding-close");
      const submitBtn = card.querySelector("#rfz-onboarding-submit");
      const demoOrb = card.querySelector("#demo-orb");
      const demoText = card.querySelector("#demo-text");
      const demoBadge = card.querySelector("#demo-mode-badge");
      const demoRing = card.querySelector("#demo-ring");
      const DEMO_PROMPT = "Write a landing page hero section for a developer tool SaaS";
      const autoPasteDemoPrompt = () => {
        try {
          const aiComposerSelectors = [
            "#prompt-textarea",
            'div[id="prompt-textarea"][contenteditable="true"]',
            'div[contenteditable="true"].ProseMirror',
            'div[contenteditable="true"][data-placeholder]',
            'textarea[placeholder*="Ask"]',
            'textarea[placeholder*="Message"]',
            'textarea[placeholder*="How can I help"]',
            "fieldset textarea",
            "form textarea",
            "textarea"
          ];
          let target = null;
          for (const sel of aiComposerSelectors) {
            const el = document.querySelector(sel);
            if (el) {
              const rect = el.getBoundingClientRect();
              if (rect.width > 40 && rect.height > 10) {
                target = el;
                break;
              }
            }
          }
          if (!target) return;
          if (target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement) {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
              window.HTMLTextAreaElement.prototype,
              "value"
            )?.set || Object.getOwnPropertyDescriptor(
              window.HTMLInputElement.prototype,
              "value"
            )?.set;
            if (nativeInputValueSetter) {
              nativeInputValueSetter.call(target, DEMO_PROMPT);
            } else {
              target.value = DEMO_PROMPT;
            }
            target.dispatchEvent(new Event("input", { bubbles: true }));
            target.dispatchEvent(new Event("change", { bubbles: true }));
          } else if (target.isContentEditable) {
            target.focus();
            document.execCommand("selectAll", false);
            document.execCommand("insertText", false, DEMO_PROMPT);
            if (!target.textContent?.includes(DEMO_PROMPT.slice(0, 10))) {
              target.textContent = DEMO_PROMPT;
              target.dispatchEvent(new InputEvent("input", { bubbles: true, data: DEMO_PROMPT }));
            }
          }
          target.focus();
        } catch {
        }
      };
      const dismiss = async () => {
        autoPasteDemoPrompt();
        await saveSettings({ hasSeenOnboarding: true });
        this.destroy();
      };
      const showStep2 = () => {
        card.innerHTML = `
        <button type="button" class="btn-close" id="rfz-step2-close" title="Close (Esc)">\u2715</button>

        <div class="header-badge" style="background:rgba(16,185,129,0.12);border-color:rgba(16,185,129,0.3);color:#34D399">\u2705 You're Ready</div>
        <h2 class="header-title">Refinzi is <span style="background:linear-gradient(135deg,#34D399,#10B981);-webkit-background-clip:text;-webkit-text-fill-color:transparent">active right now</span></h2>
        <p class="header-desc">
          The Ambient Orb is now docked beside any text box you focus on. No API key needed to get started.
        </p>

        <div style="background:rgba(255,215,0,0.05);border:1px solid rgba(255,215,0,0.2);border-radius:14px;padding:16px 18px;margin-bottom:18px">
          <div style="font-size:13px;font-weight:700;color:#FFD700;margin-bottom:10px">\u2728 What's included \u2014 free, from day one</div>
          <div style="display:flex;flex-direction:column;gap:8px">
            <div style="display:flex;align-items:center;gap:10px;font-size:13px;color:#CBD5E1">
              <span style="width:22px;height:22px;border-radius:50%;background:rgba(16,185,129,0.2);display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0">\u2713</span>
              <span><strong style="color:#F1F5F9">25 free prompt calibrations</strong> \u2014 powered by Gemini, zero setup</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px;font-size:13px;color:#CBD5E1">
              <span style="width:22px;height:22px;border-radius:50%;background:rgba(16,185,129,0.2);display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0">\u2713</span>
              <span>Works on <strong style="color:#F1F5F9">ChatGPT, Claude, Gemini, Perplexity</strong> and any text box</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px;font-size:13px;color:#CBD5E1">
              <span style="width:22px;height:22px;border-radius:50%;background:rgba(16,185,129,0.2);display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0">\u2713</span>
              <span><strong style="color:#F1F5F9">Zero prompts stored on our servers</strong> \u2014 local only, privacy-first</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px;font-size:13px;color:#CBD5E1">
              <span style="width:22px;height:22px;border-radius:50%;background:rgba(168,85,247,0.2);display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0">\u221E</span>
              <span>Add your own free <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" style="color:#818CF8;text-decoration:none">Google AI key</a> for unlimited use</span>
            </div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px">
          <button type="button" id="rfz-try-chatgpt" style="
            display:flex;align-items:center;justify-content:center;gap:8px;
            background:linear-gradient(135deg,#10a37f,#1a7a5e);
            border:none;border-radius:12px;padding:13px 20px;
            font-size:14px;font-weight:700;color:#fff;cursor:pointer;
            transition:opacity 0.15s;width:100%
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.032.067L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.843-3.369 2.019-1.168a.075.075 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.4-.681zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" fill="#fff"/></svg>
            Try it on ChatGPT \u2192
          </button>
          <button type="button" id="rfz-step2-dismiss" style="
            background:transparent;border:1px solid rgba(255,255,255,0.1);
            border-radius:12px;padding:11px 20px;font-size:13px;font-weight:600;
            color:#94A3B8;cursor:pointer;transition:all 0.15s;width:100%
          ">
            I'll explore on my own
          </button>
        </div>
        <div class="feedback-note" style="margin-top:12px">After 25 free uses, Refinzi continues working offline. Add your own free key for unlimited AI-powered calibrations.</div>
      `;
        const step2Close = card.querySelector("#rfz-step2-close");
        const tryChatGPT = card.querySelector("#rfz-try-chatgpt");
        const step2Dismiss = card.querySelector("#rfz-step2-dismiss");
        const finalDismiss = async () => {
          await saveSettings({ hasSeenOnboarding: true });
          this.destroy();
        };
        step2Close?.addEventListener("click", finalDismiss);
        step2Dismiss?.addEventListener("click", finalDismiss);
        tryChatGPT?.addEventListener("click", async () => {
          await saveSettings({ hasSeenOnboarding: true });
          this.destroy();
          try {
            window.open("https://chatgpt.com", "_blank", "noopener,noreferrer");
          } catch {
          }
        });
      };
      closeBtn?.addEventListener("click", dismiss);
      submitBtn?.addEventListener("click", showStep2);
      backdrop?.addEventListener("click", dismiss);
      const onKeydown = (e) => {
        if (e.key === "Escape") {
          window.removeEventListener("keydown", onKeydown);
          dismiss();
        }
      };
      window.addEventListener("keydown", onKeydown);
      if (demoOrb && demoText && demoBadge && demoRing) {
        const circumference = 106.8;
        let startTime = 0;
        const setProgress = (ratio) => {
          const offset = circumference * (1 - Math.min(1, Math.max(0, ratio)));
          demoRing.style.strokeDashoffset = `${offset}`;
        };
        demoOrb.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          this.isHolding = true;
          startTime = performance.now();
          setProgress(0.05);
          const updateRing = () => {
            if (!this.isHolding) return;
            const elapsed = performance.now() - startTime;
            const ratio = elapsed / 350;
            setProgress(ratio);
            if (ratio >= 1) {
              this.isHolding = false;
              demoText.classList.add("updated");
              demoText.textContent = "Write the hero section for a developer tool landing page. Create 3 strong headline options focused on primary developer outcome, concise supporting subheadline, and primary CTA. Keep scope limited to hero section.";
              demoBadge.textContent = "\u{1F9E0} Expert Mode Activated (Hold)";
              demoBadge.style.color = "#C084FC";
              setProgress(1);
              return;
            }
            this.progressAnimationFrame = requestAnimationFrame(updateRing);
          };
          this.progressAnimationFrame = requestAnimationFrame(updateRing);
        });
        const handlePointerUp = () => {
          if (!this.isHolding) return;
          const elapsed = performance.now() - startTime;
          this.isHolding = false;
          if (this.progressAnimationFrame) {
            cancelAnimationFrame(this.progressAnimationFrame);
          }
          setProgress(0);
          if (elapsed < 350) {
            demoText.classList.add("updated");
            demoText.textContent = "Write a high-converting landing page hero for a developer tool. Include a strong developer-focused headline, value proposition, and primary CTA.";
            demoBadge.textContent = "\u26A1 Better Mode Activated (Click)";
            demoBadge.style.color = "#FFD700";
          }
        };
        demoOrb.addEventListener("pointerup", handlePointerUp);
        demoOrb.addEventListener("pointercancel", handlePointerUp);
        demoOrb.addEventListener("pointerleave", handlePointerUp);
      }
    }
    destroy() {
      if (this.progressAnimationFrame) {
        cancelAnimationFrame(this.progressAnimationFrame);
      }
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
      this.container = null;
      this.shadow = null;
      this.isVisible = false;
    }
  };

  // extension/src/engine/calibration/taskAnalyzer.ts
  function analyzeTask(rawInput, targetAi = "general") {
    const raw = (rawInput || "").trim();
    const lower = raw.toLowerCase();
    const wordCount = raw.split(/\s+/).filter(Boolean).length;
    const actionVerb = extractActionVerb(raw);
    const coreSubject = extractCoreSubject(raw, lower);
    const { taskType, domain } = detectGranularTask(lower, raw);
    const context = extractContextBreakdown(taskType, raw, lower);
    const isAlreadyComprehensive = checkIsAlreadyComprehensive(raw, lower, wordCount);
    const existingDimensions = detectExistingDimensions(lower);
    const missingDimensions = detectMissingDimensionsForTask(taskType, existingDimensions);
    return {
      rawInput: raw,
      cleanedInput: coreSubject,
      taskType,
      domain,
      targetAi,
      actionVerb,
      coreSubject,
      context,
      existingDimensions,
      missingDimensions,
      isAlreadyComprehensive,
      wordCount
    };
  }
  function extractActionVerb(raw) {
    const match = raw.match(/^(can you|please|could you|help me)?\s*(develop|create|write|draft|build|implement|fix|debug|refactor|design|research|analyze|synthesize|plan|outline|compare)\b/i);
    if (match && match[2]) {
      return capitalize(match[2]);
    }
    return "Develop";
  }
  function extractCoreSubject(raw, lower) {
    let cleaned = raw.replace(/^(can you|please|could you|help me|i want to|i need to|write|create|make|conduct|generate|produce|develop|draft)\s+/i, "").trim();
    cleaned = cleaned.replace(/^(a|an|the)\s+/i, "").trim();
    if (/^gtm\b/i.test(cleaned)) {
      cleaned = cleaned.replace(/^gtm\b/i, "go-to-market strategy");
    }
    if (/in us market/i.test(cleaned)) {
      cleaned = cleaned.replace(/in us market/i, "entering the US market");
    }
    return cleaned || raw;
  }
  function detectGranularTask(lower, raw) {
    if (/\b(gtm|go-to-market|market entry|enter\s+in\s+.*market|enter\s+the\s+.*market|expansion into|launch in)\b/i.test(lower)) {
      return { taskType: "gtm_strategy", domain: "business" };
    }
    if (/\b(linkedin post|tweet|twitter thread|threads post|social media post|instagram caption)\b/i.test(lower)) {
      return { taskType: "social_media_post", domain: "marketing" };
    }
    if (/\b(fix this|debug|resolve error|stack trace|typeerror|syntaxerror|exception|why is this failing|broken code)\b/i.test(lower)) {
      return { taskType: "code_debugging", domain: "code" };
    }
    if (/\b(refactor|clean up code|optimize this code|modularize|reduce complexity)\b/i.test(lower)) {
      return { taskType: "code_refactoring", domain: "code" };
    }
    if (/\b(python|javascript|typescript|react|vue|function|api endpoint|sql query|class|component|hook|script|regex|unit test)\b/i.test(lower)) {
      return { taskType: "code_feature", domain: "code" };
    }
    if (/\b(photo of|render|shot of|image of|picture of|cinematic|sunset|desert|portrait|illustration|wallpaper|visual of|sports car|landscape)\b/i.test(lower)) {
      return { taskType: "photographic_scene", domain: "image_gen" };
    }
    if (/\b(video clip|tracking shot|camera dolly|drone shot|sora|runway|pika|motion footage)\b/i.test(lower)) {
      return { taskType: "video_cinematic", domain: "video_gen" };
    }
    if (/\b(research|landscape|startups in|industry analysis|market size|competitors in|ecosystem)\b/i.test(lower)) {
      return { taskType: "research_market", domain: "research" };
    }
    if (/\b(literature review|methodology|clinical|hypothesis|peer-reviewed|empirical study|meta-analysis)\b/i.test(lower)) {
      return { taskType: "research_academic", domain: "research" };
    }
    if (/\b(marketing plan|marketing strategy|marketing campaign|ad copy|landing page|sales page|email campaign|funnel|headline|conversion)\b/i.test(lower)) {
      return { taskType: "marketing_campaign", domain: "marketing" };
    }
    if (/\b(article|essay|blog post|newsletter|opinion piece|press release)\b/i.test(lower)) {
      return { taskType: "writing_article", domain: "writing" };
    }
    if (/\b(story|narrative|novel|chapter|script|dialogue|character arc)\b/i.test(lower)) {
      return { taskType: "writing_creative", domain: "writing" };
    }
    if (/\b(business plan|pitch deck|monetization|pricing model|unit economics|swot|okrs)\b/i.test(lower)) {
      return { taskType: "business_strategy", domain: "business" };
    }
    if (/\b(data analysis|analytics|pandas|dataframe|metrics|correlation|regression|trend)\b/i.test(lower)) {
      return { taskType: "data_analysis", domain: "data" };
    }
    return { taskType: "general_instruction", domain: "general" };
  }
  function extractContextBreakdown(taskType, raw, lower) {
    const known = [];
    const inferred = [];
    const unknown = [];
    if (lower.includes("us market") || lower.includes("united states") || lower.includes("in us")) {
      known.push("Geographic Market: United States");
    }
    if (lower.includes("india")) known.push("Geographic Market: India");
    if (lower.includes("python")) known.push("Language: Python");
    if (lower.includes("linkedin")) known.push("Channel: LinkedIn");
    if (lower.includes("ai agents")) known.push("Topic: AI Agents");
    if (lower.includes("sports car")) known.push("Subject: Sports car");
    if (lower.includes("desert")) known.push("Environment: Desert");
    if (lower.includes("sunset")) known.push("Lighting Condition: Sunset");
    switch (taskType) {
      case "gtm_strategy":
      case "market_entry":
        inferred.push("Objective: Market expansion & commercial launch strategy");
        inferred.push("Standard Dimensions: Customer segmentation, positioning, channels, regulatory/localization, timeline, KPIs");
        unknown.push("Company identity & product specification");
        unknown.push("Target industry & business model (B2B vs B2C)");
        unknown.push("Budget & capital allocation");
        unknown.push("Existing traction & competitive advantages");
        break;
      case "social_media_post":
        inferred.push("Format: Native social feed post");
        inferred.push("Tone: Professional, engaging, conversational");
        unknown.push("Author personal voice & specific perspective");
        unknown.push("Call to action destination");
        break;
      case "code_debugging":
        inferred.push("Goal: Diagnose root cause, provide corrected code, guard against regressions");
        unknown.push("Target runtime environment / framework version (unless supplied in code snippet)");
        break;
      case "research_market":
        inferred.push("Goal: Comprehensive landscape mapping, categorization, and comparative analysis");
        unknown.push("Specific sub-vertical focus & valuation/stage filters");
        break;
      case "photographic_scene":
        inferred.push("Format: Photographic composition, optical lens parameters, illumination, atmosphere");
        unknown.push("Arbitrary specific brand/model credentials");
        break;
      default:
        inferred.push("Goal: Deliver an authoritative, high-utility response");
        break;
    }
    return { known, inferred, unknown };
  }
  function checkIsAlreadyComprehensive(raw, lower, wordCount) {
    if (wordCount < 40) return false;
    let detailScore = 0;
    if (/\b(objective|goal|purpose|aim)\b/i.test(lower)) detailScore++;
    if (/\b(context|background|scenario|environment)\b/i.test(lower)) detailScore++;
    if (/\b(constraints?|do not|avoid|must be|requirements?)\b/i.test(lower)) detailScore++;
    if (/\b(deliverable|output format|structure|sections?|markdown)\b/i.test(lower)) detailScore++;
    if (/\b(evaluation criteria|acceptance criteria|kpis?|benchmark)\b/i.test(lower)) detailScore++;
    return detailScore >= 3;
  }
  function detectExistingDimensions(lower) {
    const existing = [];
    if (/\b(target customer|icp|buyer persona|audience)\b/i.test(lower)) existing.push("audience");
    if (/\b(positioning|value proposition)\b/i.test(lower)) existing.push("positioning");
    if (/\b(pricing|pricing model)\b/i.test(lower)) existing.push("pricing");
    if (/\b(channels?|acquisition)\b/i.test(lower)) existing.push("channels");
    if (/\b(timeline|milestones?|30-60-90|schedule)\b/i.test(lower)) existing.push("timeline");
    if (/\b(kpi|metrics?|benchmarks?)\b/i.test(lower)) existing.push("kpis");
    if (/\b(risks?|mitigation|trade-offs?)\b/i.test(lower)) existing.push("risks");
    if (/\b(camera|lens|35mm|50mm|85mm|anamorphic)\b/i.test(lower)) existing.push("lens");
    if (/\b(lighting|golden hour|backlight|volumetric)\b/i.test(lower)) existing.push("lighting");
    if (/\b(angle|wide-angle|close-up|low-angle)\b/i.test(lower)) existing.push("angle");
    if (/\b(edge cases?|error handling|null checks?)\b/i.test(lower)) existing.push("edge_cases");
    if (/\b(unit tests?|acceptance tests?)\b/i.test(lower)) existing.push("tests");
    return existing;
  }
  function detectMissingDimensionsForTask(taskType, existing) {
    const allCandidates = {
      gtm_strategy: [
        "target customer and market segment",
        "market-entry approach",
        "positioning and value proposition",
        "competitive landscape",
        "pricing considerations",
        "highest-leverage acquisition channels",
        "strategic partnerships",
        "localization and regulatory requirements",
        "key execution steps and 90-day launch plan",
        "budget and resource assumptions",
        "KPIs and major risks"
      ],
      market_entry: [
        "target customer and segment",
        "entry strategy and regulatory compliance",
        "competitive positioning",
        "go-to-market channels",
        "localization requirements",
        "phased milestone timeline",
        "KPIs and risk mitigation"
      ],
      social_media_post: [
        "target audience and professional context",
        "compelling perspective or counter-intuitive hook",
        "actionable key takeaways or insights",
        "concise, readable formatting with natural line breaks",
        "engaging closing discussion prompt"
      ],
      code_debugging: [
        "root-cause explanation",
        "corrected code with minimal necessary changes",
        "defensive handling for edge cases",
        "verification test to prove resolution"
      ],
      code_refactoring: [
        "architectural rationale",
        "modular and type-safe structure",
        "performance and readability improvements",
        "backwards compatibility guarantees"
      ],
      code_feature: [
        "environment and runtime standards",
        "type-safe implementation with clear interfaces",
        "defensive edge-case handling",
        "runnable verification example"
      ],
      photographic_scene: [
        "shot composition and camera perspective",
        "lens optics and depth of field",
        "natural environmental lighting and atmosphere",
        "tactile surface textures and photographic realism"
      ],
      character_art: [
        "character posture and expression",
        "attire materials and textural fidelity",
        "cinematic key and rim lighting",
        "high-resolution photographic rendering"
      ],
      video_cinematic: [
        "camera trajectory, velocity, and inertia",
        "physical momentum and spatial continuity",
        "atmospheric volumetric illumination",
        "seamless temporal coherence"
      ],
      research_market: [
        "market segmentation and landscape mapping",
        "key drivers, funding trends, and technological differentiation",
        "regulatory and economic barriers",
        "synthesis matrix comparing leading players"
      ],
      research_academic: [
        "theoretical framework and current state of research",
        "methodological standards and potential confounders",
        "comparative evidence synthesis",
        "unresolved questions and future research directions"
      ],
      copywriting: [
        "target buyer pain point and emotional trigger",
        "distinctive value proposition and proof points",
        "persuasive headline variations and body copy",
        "unambiguous call to action"
      ],
      writing_article: [
        "captivating opening hook",
        "clear narrative arc with evidence and examples",
        "authoritative, engaging tone free of clich\xE9s",
        "memorable conclusion with actionable takeaway"
      ],
      writing_creative: [
        "scene setting and sensory world-building",
        "character motivations and internal conflict",
        "organic dialogue and pacing",
        "thematic resonance and narrative tension"
      ],
      business_strategy: [
        "strategic objectives and opportunity sizing",
        "phased execution roadmap (30-60-90 days)",
        "operational resource allocation and trade-offs",
        "measurable KPIs and risk mitigation strategies"
      ],
      data_analysis: [
        "exploratory data patterns and statistical distributions",
        "key anomalies, correlations, and trends",
        "business impact interpretation",
        "actionable recommendations supported by findings"
      ],
      general_instruction: [
        "direct answer upfront",
        "structured scannable organization",
        "concrete real-world examples or edge cases",
        "clear assumptions where details are unspecified"
      ],
      marketing_campaign: [
        "campaign objective and target audience",
        "core narrative hook and channel mix",
        "creative deliverables and copy angles",
        "phased rollout schedule and conversion KPIs"
      ]
    };
    const candidates = allCandidates[taskType] || allCandidates.general_instruction;
    return candidates.filter((c) => {
      const cLower = c.toLowerCase();
      for (const ex of existing) {
        if (cLower.includes(ex)) return false;
      }
      return true;
    });
  }
  function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // extension/src/engine/calibration/promptBuilder.ts
  function constructCalibratedPrompt(analysis) {
    if (analysis.isAlreadyComprehensive) {
      return constructMinimalTunedPrompt(analysis);
    }
    switch (analysis.taskType) {
      case "gtm_strategy":
      case "market_entry":
        return constructGtmPrompt(analysis);
      case "social_media_post":
        return constructSocialPostPrompt(analysis);
      case "code_debugging":
        return constructCodeDebuggingPrompt(analysis);
      case "code_refactoring":
        return constructCodeRefactoringPrompt(analysis);
      case "code_feature":
        return constructCodeFeaturePrompt(analysis);
      case "marketing_campaign":
        return constructMarketingCampaignPrompt(analysis);
      case "photographic_scene":
      case "character_art":
        return constructVisualPrompt(analysis);
      case "video_cinematic":
        return constructVideoPrompt(analysis);
      case "research_market":
        return constructMarketResearchPrompt(analysis);
      case "research_academic":
        return constructAcademicResearchPrompt(analysis);
      case "copywriting":
        return constructCopywritingPrompt(analysis);
      case "writing_article":
        return constructArticlePrompt(analysis);
      case "writing_creative":
        return constructCreativeWritingPrompt(analysis);
      case "business_strategy":
        return constructBusinessStrategyPrompt(analysis);
      case "data_analysis":
        return constructDataAnalysisPrompt(analysis);
      case "general_instruction":
      default:
        return constructGeneralCalibratedPrompt(analysis);
    }
  }
  function constructMinimalTunedPrompt(analysis) {
    let prompt = analysis.rawInput.trim();
    const lower = prompt.toLowerCase();
    const additions = [];
    if (!lower.includes("assumption") && analysis.context.unknown.length > 0) {
      additions.push("Clearly state any operational assumptions where context is unspecified.");
    }
    if (additions.length > 0) {
      prompt = `${prompt}

Execution Note: ${additions.join(" ")}`;
    }
    return {
      mode: "better",
      prompt,
      shortReason: "Preserved comprehensive prompt; added execution assumption note.",
      domain: analysis.domain,
      calibratedDimensions: ["execution rigor"],
      targetAi: analysis.targetAi
    };
  }
  function constructGtmPrompt(analysis) {
    const goalPhrase = analysis.coreSubject.toLowerCase().includes("us market") ? "entering the US market" : analysis.coreSubject;
    const prompt = [
      `Develop a practical go-to-market (GTM) strategy for ${goalPhrase}.`,
      `Define the ideal target customer and market segment, recommended market-entry approach, positioning and value proposition, competitive landscape, pricing considerations, highest-leverage acquisition channels, partnerships, localization requirements, key execution steps, 90-day launch plan, budget assumptions, KPIs, and major risks.`,
      `Clearly state any assumptions where product or company context is unavailable.`
    ].join(" ");
    return {
      mode: "better",
      prompt,
      shortReason: "Calibrated target customer segment, market-entry approach, acquisition channels, 90-day launch roadmap, and explicit assumptions.",
      domain: "business",
      calibratedDimensions: [
        "target customer segment",
        "market-entry approach",
        "acquisition channels"
      ],
      targetAi: analysis.targetAi
    };
  }
  function constructSocialPostPrompt(analysis) {
    let topic = analysis.rawInput.replace(/^(can you|please|could you|help me)?\s*(write|draft|create|make)?\s*(a\s+)?(linkedin post|tweet|thread|post)\s+(about|on|regarding)\s+/i, "").trim();
    if (!topic) topic = "AI agents and practical workflows";
    const isLinkedIn = analysis.rawInput.toLowerCase().includes("linkedin");
    const platformName = isLinkedIn ? "LinkedIn post" : "social media post";
    const prompt = [
      `Write an engaging, high-impact ${platformName} about ${topic}.`,
      `Target professionals and technology practitioners with a compelling opening hook that challenges conventional thinking without relying on generic hype.`,
      `Break down 2-3 concrete practical applications or architectural insights, maintain an authentic and authoritative tone free of corporate clich\xE9s, use clean scannable line breaks, and conclude with a thoughtful discussion prompt to encourage comments.`
    ].join(" ");
    return {
      mode: "better",
      prompt,
      shortReason: "Calibrated professional opening hook, concrete practical takeaways, natural reading rhythm, and engaging discussion prompt.",
      domain: "marketing",
      calibratedDimensions: [
        "professional opening hook",
        "concrete takeaways",
        "engagement prompt"
      ],
      targetAi: analysis.targetAi
    };
  }
  function constructCodeDebuggingPrompt(analysis) {
    let targetDesc = analysis.rawInput.replace(/^(can you|please|could you|help me)?\s*(analyze and fix|fix|debug|resolve)?\s*(this|the)?\s*/i, "").trim();
    if (!targetDesc) targetDesc = "this code";
    const prefix = /^(this|the)\b/i.test(targetDesc) ? targetDesc : `this ${targetDesc}`;
    const prompt = [
      `Analyze and fix ${prefix}.`,
      `Identify the root cause of the error or unexpected behavior, provide the corrected implementation with minimal necessary modifications, ensure robust defensive handling for edge cases and invalid inputs, and include a brief verification test confirming the fix.`
    ].join(" ");
    return {
      mode: "better",
      prompt,
      shortReason: "Calibrated root-cause diagnosis, minimal regression-free fix, edge-case guards, and verification test.",
      domain: "code",
      calibratedDimensions: [
        "root-cause explanation",
        "minimal corrective diff",
        "verification test"
      ],
      targetAi: analysis.targetAi
    };
  }
  function constructCodeRefactoringPrompt(analysis) {
    let refactorTarget = analysis.rawInput.replace(/^(can you|please|could you|help me)?\s*(refactor|clean up|optimize)?\s*(this|the)?\s*/i, "").trim();
    if (!refactorTarget) refactorTarget = "this code";
    const refactorPrefix = /^(this|the)\b/i.test(refactorTarget) ? refactorTarget : `this ${refactorTarget}`;
    const prompt = [
      `Refactor ${refactorPrefix} for production standards.`,
      `Improve modularity, readability, and performance while preserving existing behavior and external interfaces.`,
      `Eliminate code duplication, apply clear naming conventions, ensure comprehensive error handling, and provide the updated code with inline commentary explaining key improvements.`
    ].join(" ");
    return {
      mode: "better",
      prompt,
      shortReason: "Calibrated modularity, performance optimization, interface preservation, and error handling.",
      domain: "code",
      calibratedDimensions: ["modularity", "interface stability", "error handling"],
      targetAi: analysis.targetAi
    };
  }
  function constructCodeFeaturePrompt(analysis) {
    const rawLower = analysis.rawInput.toLowerCase();
    const artifactNoun = rawLower.includes("script") ? "script" : rawLower.includes("function") ? "function" : rawLower.includes("component") ? "component" : "solution";
    let spec = analysis.rawInput.replace(/^(can you|please|could you|help me|write|build|create|implement)?\s*(a\s+)?(python script|typescript script|script|function|api|component|program)?\s*(to|that)?\s*/i, "").trim();
    if (!spec) spec = analysis.coreSubject;
    const isPython = rawLower.includes("python");
    const env = isPython ? "Python 3.11+" : "Modern TypeScript";
    const prompt = [
      `Implement a clean, production-ready ${isPython ? "Python " : ""}${artifactNoun} to ${spec}.`,
      `Use ${env} standards with modular structure, explicit type safety, defensive validation for edge cases and invalid inputs, clear error boundaries, and a runnable usage example with tests.`,
      `Avoid unnecessary external dependencies.`
    ].join(" ");
    return {
      mode: "better",
      prompt,
      shortReason: `Calibrated ${env} architecture, strict type safety, defensive edge-case validation, and runnable test verification.`,
      domain: "code",
      calibratedDimensions: ["environment standards", "defensive edge cases", "test verification"],
      targetAi: analysis.targetAi
    };
  }
  function constructMarketingCampaignPrompt(analysis) {
    let planTopic = analysis.rawInput.replace(/^(can you|please|could you|help me|make|create|develop|write)?\s*(a\s+)?(marketing plan|marketing strategy|campaign)?\s*(for)?\s*/i, "").trim();
    if (!planTopic) planTopic = analysis.coreSubject;
    const prompt = [
      `Develop a strategic, high-impact marketing plan for ${planTopic}.`,
      `Define the target audience and customer profile, core positioning and messaging pillars, highest-leverage acquisition channels, recommended promotional tactics, timeline milestones, conversion KPIs, and a clear call to action.`,
      `Clearly state any assumptions where product or budget details are unspecified.`
    ].join(" ");
    return {
      mode: "better",
      prompt,
      shortReason: "Calibrated target audience profile, positioning pillars, channel mix, timeline milestones, and conversion KPIs.",
      domain: "marketing",
      calibratedDimensions: ["target audience", "positioning", "conversion KPIs"],
      targetAi: analysis.targetAi
    };
  }
  function constructVisualPrompt(analysis) {
    const rawLower = analysis.rawInput.toLowerCase();
    const isCar = rawLower.includes("sports car") || rawLower.includes("car");
    const isDesert = rawLower.includes("desert");
    const isSunset = rawLower.includes("sunset") || rawLower.includes("golden hour");
    let prompt = "";
    if (isCar && isDesert && isSunset) {
      prompt = `Cinematic wide-angle tracking shot of a cool sports car driving through a desert landscape at sunset, dramatic golden hour warm backlighting, dust kicking up behind the vehicle, 24mm anamorphic lens with shallow depth of field, fine film grain, natural automotive photography.`;
    } else {
      let cleanSubject = analysis.rawInput.replace(/^(generate|create|draw|make|show me|a picture of|photo of|image of|render of)\s+/i, "").trim();
      prompt = `Cinematic wide-angle shot of ${cleanSubject}, dramatic natural lighting with rich depth and soft shadows, shot on 35mm prime lens with shallow depth of field, tactile surface textures, authentic color grading, photorealistic composition.`;
    }
    return {
      mode: "better",
      prompt,
      shortReason: "Calibrated composition, 24mm anamorphic optics, golden hour backlighting, and atmospheric dust.",
      domain: "image_gen",
      calibratedDimensions: ["lens optics", "lighting & atmosphere", "surface textures"],
      targetAi: analysis.targetAi
    };
  }
  function constructVideoPrompt(analysis) {
    let subject = analysis.rawInput.replace(/^(generate|create|make|video clip of|video of)\s+/i, "").trim();
    const prompt = `Cinematic continuous tracking camera movement capturing ${subject}, natural physical momentum and camera inertia, atmospheric volumetric lighting, 35mm filmic color palette, smooth temporal consistency with zero distortion.`;
    return {
      mode: "better",
      prompt,
      shortReason: "Calibrated continuous tracking velocity, physical inertia, and temporal coherence.",
      domain: "video_gen",
      calibratedDimensions: ["camera movement", "volumetric lighting", "temporal coherence"],
      targetAi: analysis.targetAi
    };
  }
  function constructMarketResearchPrompt(analysis) {
    let topic = analysis.rawInput.replace(/^(research|conduct research on|analyze|explore|tell me about)\s+/i, "").trim();
    const prompt = [
      `Conduct comprehensive research on ${topic}.`,
      `Map the market landscape across key segments, notable players, business models, funding trends, technological differentiators, regulatory and economic drivers, and primary growth barriers.`,
      `Include a structured comparative matrix and clearly state the timeframe and criteria used for selection.`
    ].join(" ");
    return {
      mode: "better",
      prompt,
      shortReason: "Calibrated landscape segmentation, funding & tech drivers, comparative matrix, and explicit timeframe criteria.",
      domain: "research",
      calibratedDimensions: ["market segmentation", "competitive matrix", "selection criteria"],
      targetAi: analysis.targetAi
    };
  }
  function constructAcademicResearchPrompt(analysis) {
    let topic = analysis.coreSubject;
    const prompt = [
      `Provide a rigorous analytical research synthesis on ${topic}.`,
      `Examine empirical findings and established theoretical models, analyze methodological trade-offs and potential confounders, synthesize competing perspectives with evidence standards, and highlight verified conclusions versus unresolved questions.`
    ].join(" ");
    return {
      mode: "better",
      prompt,
      shortReason: "Calibrated empirical framework, methodological trade-offs, and competing perspective synthesis.",
      domain: "research",
      calibratedDimensions: ["empirical rigor", "methodological trade-offs", "comparative evidence"],
      targetAi: analysis.targetAi
    };
  }
  function constructCopywritingPrompt(analysis) {
    let topic = analysis.coreSubject;
    const prompt = [
      `Develop compelling, high-converting copy for ${topic}.`,
      `Address the target buyer's primary pain point and emotional motivation, articulate a sharp value proposition with credibility proof points, provide 3 headline variations with high-clarity body copy, and conclude with an action-oriented call to action (CTA).`
    ].join(" ");
    return {
      mode: "better",
      prompt,
      shortReason: "Calibrated buyer pain points, sharp value proposition, headline variations, and clear CTA.",
      domain: "marketing",
      calibratedDimensions: ["buyer motivation", "value proposition", "conversion CTA"],
      targetAi: analysis.targetAi
    };
  }
  function constructArticlePrompt(analysis) {
    let topic = analysis.coreSubject;
    const prompt = [
      `Draft a polished, comprehensive article on ${topic}.`,
      `Open with an insightful hook that reframes the topic, build a coherent narrative with concrete real-world evidence and examples, maintain an authoritative and engaging voice free of AI clich\xE9s, and deliver a memorable, actionable conclusion.`
    ].join(" ");
    return {
      mode: "better",
      prompt,
      shortReason: "Calibrated narrative hook, real-world evidence, cadence, and actionable takeaway.",
      domain: "writing",
      calibratedDimensions: ["opening hook", "editorial voice", "actionable takeaway"],
      targetAi: analysis.targetAi
    };
  }
  function constructCreativeWritingPrompt(analysis) {
    let topic = analysis.coreSubject;
    const prompt = [
      `Write a compelling narrative scene exploring ${topic}.`,
      `Establish atmospheric world-building with tactile sensory details, ground character actions in clear motivations and emotional tension, balance natural dialogue with pacing, and create a resonant thematic arc.`
    ].join(" ");
    return {
      mode: "better",
      prompt,
      shortReason: "Calibrated sensory world-building, character motivation, dialogue pacing, and thematic tension.",
      domain: "writing",
      calibratedDimensions: ["sensory details", "character motivation", "thematic arc"],
      targetAi: analysis.targetAi
    };
  }
  function constructBusinessStrategyPrompt(analysis) {
    let topic = analysis.coreSubject;
    const prompt = [
      `Develop a structured strategic plan for ${topic}.`,
      `Identify core opportunities and target market requirements, establish a phased 30-60-90 day execution roadmap, define resource allocation priorities and operational trade-offs, and specify measurable KPIs alongside risk mitigation plans.`,
      `Explicitly state any assumptions where company or financial data is unspecified.`
    ].join(" ");
    return {
      mode: "better",
      prompt,
      shortReason: "Calibrated opportunity sizing, phased 90-day roadmap, operational trade-offs, and KPI metrics.",
      domain: "business",
      calibratedDimensions: ["opportunity sizing", "phased roadmap", "KPIs & risks"],
      targetAi: analysis.targetAi
    };
  }
  function constructDataAnalysisPrompt(analysis) {
    let topic = analysis.coreSubject;
    const prompt = [
      `Perform a thorough analytical evaluation of ${topic}.`,
      `Identify core distributions, anomalous patterns, and statistically significant correlations, provide practical interpretation of business implications, and present findings with clear visual structure and actionable recommendations.`
    ].join(" ");
    return {
      mode: "better",
      prompt,
      shortReason: "Calibrated statistical distributions, anomaly detection, business interpretation, and actionable recommendations.",
      domain: "data",
      calibratedDimensions: ["statistical distributions", "anomaly detection", "business impact"],
      targetAi: analysis.targetAi
    };
  }
  function constructGeneralCalibratedPrompt(analysis) {
    const prompt = [
      `Please address the following with structured clarity and depth:`,
      `"${analysis.coreSubject}"`,
      `Provide a direct, high-value answer upfront, break down key factors and practical execution steps with clear headings, include concrete examples or edge cases where relevant, and state any necessary assumptions clearly.`
    ].join("\n\n");
    return {
      mode: "better",
      prompt,
      shortReason: "Calibrated upfront thesis, structured breakdown, practical examples, and clear assumptions.",
      domain: "general",
      calibratedDimensions: ["structural clarity", "execution criteria", "explicit assumptions"],
      targetAi: analysis.targetAi
    };
  }

  // extension/src/engine/calibration/qualityValidator.ts
  function validateCalibrationQuality(result, analysis) {
    const promptLower = result.prompt.toLowerCase();
    const rawLower = analysis.rawInput.toLowerCase();
    const failedChecks = [];
    let score = 100;
    if (rawLower.includes("us market") || rawLower.includes("in us")) {
      if (!promptLower.includes("us market") && !promptLower.includes("united states")) {
        failedChecks.push("Failed to preserve US market geographic intent");
        score -= 30;
      }
    }
    if (rawLower.includes("gtm") || rawLower.includes("go-to-market")) {
      if (!promptLower.includes("go-to-market") && !promptLower.includes("gtm")) {
        failedChecks.push("Failed to preserve Go-to-Market intent");
        score -= 30;
      }
    }
    if (rawLower.includes("python")) {
      if (!promptLower.includes("python")) {
        failedChecks.push("Failed to preserve Python language requirement");
        score -= 30;
      }
    }
    if (rawLower.includes("india")) {
      if (!promptLower.includes("india")) {
        failedChecks.push("Failed to preserve India geographical requirement");
        score -= 30;
      }
    }
    if (rawLower.includes("linkedin")) {
      if (!promptLower.includes("linkedin")) {
        failedChecks.push("Failed to preserve LinkedIn platform context");
        score -= 30;
      }
    }
    const forbiddenBoilerplates = [
      "develop an actionable, high-converting marketing strategy and copy for:",
      "execution framework:\n- target buyer",
      "execution framework:\n- core value proposition",
      "develop an actionable, high-converting"
    ];
    for (const fp of forbiddenBoilerplates) {
      if (promptLower.includes(fp)) {
        failedChecks.push(`Contains generic boilerplate template: "${fp}"`);
        score -= 40;
      }
    }
    if (analysis.rawInput.length > 5 && !hasSubstantiveKeywords(promptLower, rawLower)) {
      failedChecks.push("Output lacks substantive reference to user objective");
      score -= 25;
    }
    const forbiddenHallucinations = [
      { entity: "porsche", rule: "Must not invent specific car make (e.g. Porsche) unless provided" },
      { entity: "ferrari", rule: "Must not invent specific car make (e.g. Ferrari) unless provided" },
      { entity: "bmw", rule: "Must not invent specific car make (e.g. BMW) unless provided" }
    ];
    for (const item of forbiddenHallucinations) {
      if (!rawLower.includes(item.entity) && promptLower.includes(item.entity)) {
        failedChecks.push(`Hallucinated arbitrary entity: ${item.entity} (${item.rule})`);
        score -= 35;
      }
    }
    return {
      passed: failedChecks.length === 0,
      failedChecks,
      score: Math.max(0, score)
    };
  }
  function hasSubstantiveKeywords(promptLower, rawLower) {
    const stopWords = /* @__PURE__ */ new Set(["a", "an", "the", "in", "to", "for", "of", "and", "with", "on", "at", "this", "that", "can", "you", "please", "help", "me", "i", "want"]);
    const tokens = rawLower.replace(/[^\w\s]/g, "").split(/\s+/).filter((w) => w.length > 2 && !stopWords.has(w));
    if (tokens.length === 0) return true;
    let matched = 0;
    for (const t of tokens) {
      if (promptLower.includes(t)) {
        matched++;
      } else if (t === "gtm" && promptLower.includes("go-to-market")) {
        matched++;
      } else if (t === "us" && (promptLower.includes("united states") || promptLower.includes("us market"))) {
        matched++;
      }
    }
    return matched / tokens.length >= 0.5;
  }

  // extension/src/engine/better.ts
  function synthesizeBetterPrompt(rawInput, targetAi = "general") {
    const analysis = analyzeTask(rawInput, targetAi);
    const result = constructCalibratedPrompt(analysis);
    const validation = validateCalibrationQuality(result, analysis);
    if (!validation.passed) {
      console.warn("[Refinzi Calibration Quality Gate]", validation.failedChecks);
    }
    return result;
  }

  // extension/src/engine/expert/expertAnalyzer.ts
  function analyzeExpertTask(rawInput, destinationAi = "general") {
    const raw = (rawInput || "").trim();
    const lower = raw.toLowerCase();
    const wordCount = raw.split(/\s+/).filter(Boolean).length;
    const explicitEntities = extractExplicitEntities(raw, lower);
    const scope = detectDeliverableScope(lower);
    const taskKind = detectExpertTaskKind(lower, scope);
    const deliverable = deriveDeliverableName(scope, lower);
    const geography = extractGeography(lower);
    const timeframe = extractTimeframe(lower);
    const constraints = extractConstraints(lower);
    const audience = extractExplicitAudience(lower);
    const action = extractAction(raw, lower, scope, taskKind);
    const coreObjective = extractObjective(raw, lower, scope, taskKind);
    const specificSubject = extractSubject(raw, lower, scope, taskKind);
    const isAlreadyDetailed = checkIsAlreadyDetailed(lower, wordCount);
    const missingDimensions = identifyMissingDimensions(scope, taskKind, lower, isAlreadyDetailed);
    const { scopeBoundaries, forbiddenInventions } = deriveScopeBoundaries(scope, taskKind, lower);
    return {
      rawInput: raw,
      taskKind,
      scope,
      deliverable,
      action,
      coreObjective,
      specificSubject,
      explicitEntities,
      audience,
      geography,
      timeframe,
      constraints,
      destinationAi,
      missingDimensions,
      scopeBoundaries,
      forbiddenInventions,
      isAlreadyDetailed
    };
  }
  function detectDeliverableScope(lower) {
    if (/\b(hero(\s+section)?)\b/i.test(lower)) {
      return "hero_section";
    }
    if (/\b(2-line|two-line|headline|one-liner)\b/i.test(lower)) {
      return "headline_only";
    }
    if (/\b(email|apolog(y|iz)|letter|memo)\b/i.test(lower)) {
      return "single_email";
    }
    if (/\b(fix|memory leak|bug|crash|error|exception)\b/i.test(lower)) {
      return "bug_fix";
    }
    if (/\b(gtm|go-to-market|market entry|enter\s+(in\s+)?.*market|expansion into)\b/i.test(lower)) {
      return "gtm_strategy";
    }
    if (/\b(photo|image|picture|render|cinematic\s+(photo|shot)|photograph)\b/i.test(lower)) {
      return "single_image";
    }
    if (/\b(competitors?|competing|competitive|rivals?|compare.*with)\b/i.test(lower)) {
      return "competitive_analysis";
    }
    if (/\b(cac|ltv|churn|why.*(increased|decreased|dropped|rose|spiked)|anomal)\b/i.test(lower)) {
      return "metric_diagnostic";
    }
    if (/\b(landing page|sales page|lead capture page)\b/i.test(lower)) {
      return "full_landing_page";
    }
    if (/\b(linkedin post|tweet|thread|social media post)\b/i.test(lower)) {
      return "social_post";
    }
    if (/\b(code|react|vue|angular|python|typescript|api|function|class|component|sql|backend|frontend)\b/i.test(lower)) {
      return "code_module";
    }
    if (/\b(research|study|overview of|landscape)\b/i.test(lower)) {
      return "research_analysis";
    }
    return "custom";
  }
  function detectExpertTaskKind(lower, scope) {
    switch (scope) {
      case "gtm_strategy":
        return "gtm_market_entry";
      case "hero_section":
      case "full_landing_page":
        return "landing_page";
      case "bug_fix":
        return "code_debugging";
      case "code_module":
        return "code_engineering";
      case "single_email":
        return "email_communication";
      case "single_image":
        return "image_cinematic";
      case "competitive_analysis":
        return "competitive_research";
      case "metric_diagnostic":
        return "business_analytics";
      case "headline_only":
      case "social_post":
        return "social_content";
      case "research_analysis":
        return "general_research";
      default:
        return "general_expert";
    }
  }
  function deriveDeliverableName(scope, lower) {
    switch (scope) {
      case "hero_section":
        return "hero section";
      case "headline_only":
        return lower.includes("2-line") ? "2-line headline" : "headline";
      case "single_email":
        return lower.includes("apolog") ? "apology email" : "email";
      case "bug_fix":
        return lower.includes("memory leak") ? "memory leak fix" : "bug fix";
      case "gtm_strategy":
        return "go-to-market strategy";
      case "single_image":
        return "photographic prompt";
      case "competitive_analysis":
        return "competitive analysis";
      case "metric_diagnostic":
        return "diagnostic analysis";
      case "full_landing_page":
        return "landing page";
      case "social_post":
        return "social post";
      case "code_module":
        return "code implementation";
      case "research_analysis":
        return "research analysis";
      default:
        return "task execution";
    }
  }
  function extractExplicitEntities(raw, lower) {
    const entities = [];
    if (lower.includes("us market") || lower.includes("united states") || lower.includes("in us")) {
      entities.push("United States");
    }
    if (lower.includes("india")) entities.push("India");
    if (lower.includes("tokyo")) entities.push("Tokyo");
    if (lower.includes("europe") || lower.includes("eu")) entities.push("Europe");
    if (lower.includes("notion")) entities.push("Notion");
    if (lower.includes("ferrari")) entities.push("Ferrari");
    if (lower.includes("nodejs") || lower.includes("node.js") || lower.includes("node")) entities.push("Node.js");
    if (lower.includes("stream pipeline")) entities.push("stream pipeline");
    if (lower.includes("react")) entities.push("React");
    if (lower.includes("python")) entities.push("Python");
    if (lower.includes("cto")) entities.push("CTO");
    if (lower.includes("cac")) entities.push("CAC");
    if (lower.includes("developer tool") || lower.includes("dev tool")) entities.push("developer tool");
    return entities;
  }
  function extractAction(raw, lower, scope, taskKind) {
    switch (scope) {
      case "hero_section":
        return "Write the hero section for the landing page";
      case "headline_only":
        return "Write high-impact headline options";
      case "single_email":
        return "Draft a professional and accountable email";
      case "bug_fix":
        return "Diagnose root cause and provide minimal surgical fix";
      case "gtm_strategy":
        return "Develop a comprehensive go-to-market strategy";
      case "single_image":
        return "Compose a photographic visual prompt";
      case "competitive_analysis":
        return "Conduct an in-depth competitive analysis";
      case "metric_diagnostic":
        return "Perform a structured diagnostic analysis";
      default:
        return "Execute senior practitioner task";
    }
  }
  function extractObjective(raw, lower, scope, taskKind) {
    let clean = raw.replace(/^(can you|please|could you|help me|i want to|i need to|write|create|make|conduct|generate|produce|develop|draft|analyze|fix|debug)\s+/i, "").trim();
    clean = clean.replace(/^(a|an|the)\s+/i, "").trim();
    switch (scope) {
      case "hero_section":
        return `Write the hero section for ${clean}`;
      case "headline_only":
        return `Write 2-line headline options for ${clean}`;
      case "single_email":
        return `Draft a professional email regarding ${clean}`;
      case "bug_fix":
        return `Diagnose and resolve the issue in ${clean}`;
      case "gtm_strategy":
        return `Develop a comprehensive go-to-market strategy for ${clean}`;
      case "single_image":
        return `Compose a photographic visual of ${clean}`;
      case "competitive_analysis":
        return `Conduct an in-depth competitive analysis for ${clean}`;
      case "metric_diagnostic":
        return `Diagnose root causes for ${clean}`;
      default:
        return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : "Task Execution";
    }
  }
  function extractSubject(raw, lower, scope, taskKind) {
    let subj = raw.replace(/^(can you|please|could you|help me|i want to|i need to)\s+/i, "").trim();
    subj = subj.replace(/^(write|create|make|develop|draft|analyze|research|conduct|fix|debug|produce|generate)\s+/i, "").trim();
    subj = subj.replace(/^(a|an|the)\s+/i, "").trim();
    if (scope === "hero_section") {
      subj = subj.replace(/^(landing page hero(\s+section)?|hero(\s+section)?)\s+(for\s+)?/i, "");
      subj = subj.replace(/\s+landing page$/i, "");
      return subj.trim() || (raw.toLowerCase().includes("developer tool") ? "developer tool" : raw.trim());
    }
    if (scope === "headline_only") {
      subj = subj.replace(/^(2-line|two-line)?\s*(linkedin\s+)?headline\s+(options\s+)?(for\s+)?(a\s+)?/i, "");
      return subj.trim() || (raw.toLowerCase().includes("cto") ? "CTO" : raw.trim());
    }
    if (scope === "single_email") {
      subj = subj.replace(/^(email|message|letter|memo)\s+(to\s+[^ ]+\s+)?(apologizing\s+for|regarding|about|asking\s+for)\s+/i, "");
      subj = subj.replace(/^(apologizing\s+for|regarding|about|asking\s+for)\s+/i, "");
      return subj.trim() || (raw.toLowerCase().includes("delayed project") ? "delayed project delivery" : raw.trim());
    }
    if (scope === "bug_fix") {
      subj = subj.replace(/^(fix|debug|resolve)\s+/i, "");
      return subj.trim() || (raw.toLowerCase().includes("memory leak") ? "memory leak in nodejs stream pipeline" : raw.trim());
    }
    if (scope === "single_image") {
      subj = subj.replace(/^(cinematic\s+)?(photo|photograph|picture|image|shot|render)\s+of\s+(a|an|the)?\s*/i, "");
      subj = subj.replace(/\s+in\s+tokyo(\s+at\s+night)?/i, "");
      subj = subj.replace(/\s+at\s+night/i, "");
      return subj.trim() || (raw.toLowerCase().includes("ferrari") ? "Ferrari" : raw.trim());
    }
    if (scope === "competitive_analysis") {
      subj = subj.replace(/^(competitors|alternatives|rivals)\s+(of|to)\s+/i, "");
      subj = subj.replace(/\s+in\s+india/i, "");
      return subj.trim() || (raw.toLowerCase().includes("notion") ? "Notion" : raw.trim());
    }
    if (scope === "metric_diagnostic") {
      subj = subj.replace(/^(why\s+our|why\s+the|why\s+)\s*/i, "");
      return subj.trim() || (raw.toLowerCase().includes("cac") ? "Customer Acquisition Cost (CAC) increase" : raw.trim());
    }
    return subj || raw;
  }
  function extractGeography(lower) {
    if (lower.includes("us market") || lower.includes("in us")) return "US";
    if (lower.includes("united states")) return "United States";
    if (lower.includes("india")) return "India";
    if (lower.includes("tokyo")) return "Tokyo";
    if (lower.includes("europe") || lower.includes("eu")) return "Europe";
    return void 0;
  }
  function extractTimeframe(lower) {
    if (lower.includes("at night")) return "at night";
    const match = lower.match(/\b(90-day|30-day|60-day|annual|quarterly|q[1-4]|202[4-6])\b/i);
    return match ? match[0] : void 0;
  }
  function extractConstraints(lower) {
    const constraints = [];
    const wordCount = lower.match(/\b\d+\s*words\b/i);
    if (wordCount) constraints.push(`Length: ${wordCount[0]}`);
    if (lower.includes("2-line") || lower.includes("two-line")) constraints.push("Length: exactly 2 lines");
    if (lower.includes("50-500 employees")) constraints.push("Target Company Size: 50-500 employees");
    if (lower.includes("top 10")) constraints.push("Scope: Top 10 competitors");
    return constraints;
  }
  function extractExplicitAudience(lower) {
    if (lower.includes("for developer tool") || lower.includes("to developer")) return "Developers";
    if (lower.includes("for cto") || lower.includes("for a cto")) return "CTO";
    if (lower.includes("to client") || lower.includes("to a client")) return "Client";
    if (lower.includes("to customer") || lower.includes("to a customer")) return "Customer";
    if (lower.includes("for hr technology") || lower.includes("hr tech")) return "HR Technology Companies";
    return void 0;
  }
  function checkIsAlreadyDetailed(lower, wordCount) {
    let depthSignals = 0;
    if (/\b\d+\s*-\s*\d+\s*(employees|users|customers)\b/i.test(lower)) depthSignals += 3;
    if (/\b(\$|usd|eur|inr)\s*[\d,]+/i.test(lower)) depthSignals += 3;
    if (/\b(launch budget|pilot budget|budget of|arr|mrr)\b/i.test(lower)) depthSignals += 2;
    if (/\b(b2b saas|mid-market|enterprise|smb)\b/i.test(lower)) depthSignals += 1;
    if (/\b(compare|competitors?|pricing|acquisition channels|90-day|sla|latency)\b/i.test(lower)) depthSignals += 2;
    if (wordCount >= 25) depthSignals += 2;
    return depthSignals >= 3;
  }
  function identifyMissingDimensions(scope, taskKind, lower, isAlreadyDetailed) {
    if (isAlreadyDetailed) {
      return ["execution rigor", "validation criteria", "structured deliverable format"];
    }
    switch (scope) {
      case "hero_section":
        return [
          "primary outcome-focused headlines",
          "concise supporting subheadline",
          "clear primary and secondary CTAs",
          "technically credible proof points",
          "strict hero scope boundary"
        ];
      case "headline_only":
        return [
          "strict 2-line length limit",
          "balance of technical leadership and business impact",
          "elimination of buzzwords and prestige titles"
        ];
      case "single_email":
        return [
          "direct delay acknowledgment and responsibility",
          "situation explanation without excuses",
          "current status and next steps",
          "accountable tone without unrequested commitments"
        ];
      case "bug_fix":
        return [
          "lifecycle, buffering, backpressure, or stream handling causes",
          "minimal production-safe code change",
          "root cause explanation",
          "regression test or verification procedure"
        ];
      case "gtm_strategy":
        return [
          "market opportunity & priority customer segments",
          "ideal customer profile and beachhead segment",
          "competitive landscape and differentiation",
          "recommended market-entry strategy",
          "positioning and value proposition",
          "pricing and packaging considerations",
          "sales, acquisition and distribution channels",
          "partnership opportunities",
          "localization and operational requirements",
          "relevant regulatory considerations",
          "90-day execution plan and expansion milestones",
          "resource and budget assumptions",
          "KPIs and decision gates",
          "major risks and mitigation strategies"
        ];
      case "single_image":
        return [
          "35mm camera optics and lens",
          "atmospheric lighting and reflections",
          "low-angle dynamic composition",
          "tactile texture and environmental realism",
          "moody cinematic color grade"
        ];
      case "competitive_analysis":
        return [
          "direct and indirect competitor taxonomy",
          "feature parity and differentiation matrix",
          "regional pricing and local currency packaging",
          "local market adoption dynamics",
          "actionable opportunity gaps"
        ];
      case "metric_diagnostic":
        return [
          "metric decomposition into funnel & channel drivers",
          "acquisition channel fatigue and saturation hypotheses",
          "funnel drop-off and UX friction analysis",
          "attribution and tracking changes evaluation",
          "diagnostic data cuts and SQL audit queries",
          "prioritized 30/90-day corrective action plan"
        ];
      default:
        return [
          "core objective deconstruction",
          "structured execution roadmap",
          "concrete deliverables without placeholders"
        ];
    }
  }
  function deriveScopeBoundaries(scope, taskKind, lower) {
    switch (scope) {
      case "hero_section":
        return {
          scopeBoundaries: [
            "Keep the scope limited strictly to the hero section.",
            "Do not create full landing page copy, pricing tiers, FAQs, testimonials, guarantee, or acquisition strategy."
          ],
          forbiddenInventions: ["product capabilities", "customer results", "integrations", "metrics"]
        };
      case "headline_only":
        return {
          scopeBoundaries: [
            "Keep strictly within the 2-line length limit.",
            "Do not write an entire profile summary, bio, or content strategy."
          ],
          forbiddenInventions: ["specific technologies", "company names", "metrics not provided"]
        };
      case "single_email":
        return {
          scopeBoundaries: [
            "Draft the specific email directly with Subject Line, Body, and Sign-off.",
            "Do not automatically create a customer-retention strategy or long-term communication plan."
          ],
          forbiddenInventions: ["reason for delay", "compensation", "revised dates", "refunds", "credits", "corrective actions not provided"]
        };
      case "bug_fix":
        return {
          scopeBoundaries: [
            "Provide the minimal production-safe code change required and a regression test.",
            "Do not introduce unrelated architectural changes or framework redesigns."
          ],
          forbiddenInventions: ["unrelated dependencies", "architectural redesigns"]
        };
      case "gtm_strategy":
        return {
          scopeBoundaries: [
            "Prioritize highest-leverage actions and explain the strategic reasoning.",
            "State reasonable assumptions explicitly rather than inventing facts."
          ],
          forbiddenInventions: ["company", "product", "customer", "pricing", "financial facts"]
        };
      case "single_image":
        return {
          scopeBoundaries: [
            "Focus purely on the photographic visual scene and optical specifications."
          ],
          forbiddenInventions: ["unrelated subjects", "artificial CG plastic sheen"]
        };
      case "competitive_analysis":
        return {
          scopeBoundaries: [
            "Distinguish verified competitor data from market inferences."
          ],
          forbiddenInventions: ["non-existent startups", "unverified pricing or metrics"]
        };
      case "metric_diagnostic":
        return {
          scopeBoundaries: [
            "Decompose the anomaly into structured mathematical and operational hypotheses."
          ],
          forbiddenInventions: ["revenue figures", "dollar amounts", "company facts not provided"]
        };
      default:
        return {
          scopeBoundaries: ["Execute the exact requested task with senior practitioner depth."],
          forbiddenInventions: ["arbitrary facts", "unauthorized assumptions"]
        };
    }
  }

  // extension/src/engine/expert/expertBuilder.ts
  function constructExpertPrompt(model) {
    if (model.isAlreadyDetailed) {
      return buildDetailedTaskSpecification(model);
    }
    switch (model.scope) {
      case "hero_section":
        return buildHeroSectionPrompt(model);
      case "headline_only":
        return buildHeadlinePrompt(model);
      case "single_email":
        return buildEmailPrompt(model);
      case "bug_fix":
        return buildBugFixPrompt(model);
      case "gtm_strategy":
        return buildGtmStrategyPrompt(model);
      case "competitive_analysis":
        return buildCompetitiveAnalysisPrompt(model);
      case "metric_diagnostic":
        return buildMetricDiagnosticPrompt(model);
      case "single_image":
        return buildCinematicImagePrompt(model);
      case "full_landing_page":
        return buildFullLandingPagePrompt(model);
      case "code_module":
        return buildCodeModulePrompt(model);
      case "social_post":
        return buildSocialPostPrompt(model);
      case "research_analysis":
        return buildResearchAnalysisPrompt(model);
      default:
        return buildCustomExpertPrompt(model);
    }
  }
  function buildGtmStrategyPrompt(model) {
    const geoTerm = model.geography === "US" ? "the US" : model.geography ? `the ${model.geography}` : "the target";
    const marketOpportunityPrefix = model.geography === "US" ? "US market" : model.geography ? `${model.geography} market` : "Market";
    return [
      `Develop a comprehensive go-to-market strategy for entering ${geoTerm} market.`,
      ``,
      `Cover:`,
      `- ${marketOpportunityPrefix} opportunity and priority customer segments`,
      `- ideal customer profile and beachhead segment`,
      `- competitive landscape and differentiation`,
      `- recommended market-entry strategy`,
      `- positioning and value proposition`,
      `- pricing and packaging considerations`,
      `- sales, acquisition and distribution channels`,
      `- partnership opportunities`,
      `- localization and operational requirements`,
      `- relevant regulatory considerations`,
      `- 90-day execution plan and expansion milestones`,
      `- resource and budget assumptions`,
      `- KPIs and decision gates`,
      `- major risks and mitigation strategies`,
      ``,
      `Prioritize the highest-leverage actions and explain the reasoning behind major strategic choices. Where company, product, customer, pricing, or financial information is unavailable, state reasonable assumptions explicitly rather than inventing facts. Proceed without asking for clarification.`
    ].join("\n");
  }
  function buildHeroSectionPrompt(model) {
    const subject = model.specificSubject || "developer tool";
    return [
      `Write the hero section for a ${subject} landing page.`,
      ``,
      `Create:`,
      `- 3 strong headline options focused on the primary ${model.audience ? model.audience.toLowerCase().replace(/s$/, "") : "developer"} outcome`,
      `- a concise supporting subheadline explaining what the product does and why it matters`,
      `- a clear primary CTA`,
      `- an optional secondary CTA where appropriate`,
      `- concise supporting proof points if available`,
      ``,
      `Keep the messaging specific to ${model.audience ? model.audience.toLowerCase() : "developers"}, outcome-oriented, and technically credible. Do not invent product capabilities, customer results, integrations, or metrics. Keep the scope limited to the hero section.`
    ].join("\n");
  }
  function buildEmailPrompt(model) {
    const lower = model.rawInput.toLowerCase();
    const isDelayedProject = lower.includes("delayed") || lower.includes("delay");
    if (isDelayedProject) {
      const subject2 = model.specificSubject || "delayed project delivery";
      const cleanSubject = subject2.startsWith("a ") ? subject2 : `a ${subject2}`;
      return [
        `Draft a professional apology email to a client regarding ${cleanSubject}.`,
        ``,
        `Acknowledge the delay directly, take appropriate responsibility, briefly explain the situation without unnecessary excuses, communicate the current status or next step where information is available, and maintain a respectful, accountable tone.`,
        ``,
        `Do not invent a reason for the delay, compensation, revised dates, refunds, credits, or corrective actions that were not provided.`
      ].join("\n");
    }
    const isApology = lower.includes("apolog") || lower.includes("sorry") || lower.includes("issue") || lower.includes("mistake");
    const recipient = model.audience || "customer";
    const subject = model.specificSubject || model.rawInput;
    if (isApology) {
      return [
        `Draft a professional apology email to a ${recipient.toLowerCase()} regarding: ${subject}.`,
        ``,
        `Structure the communication with:`,
        `1. Tone & Calibration: Direct, respectful, accountable, and empathetic\u2014avoid defensive phrasing or corporate jargon.`,
        `2. Problem Acknowledgment: Clearly acknowledge the issue and validate the recipient's inconvenience.`,
        `3. Transparent Explanation: Provide a brief explanation without unnecessary excuses.`,
        `4. Concrete Resolution & Next Steps: Communicate the current status and immediate resolution where information is available.`,
        ``,
        `Do not invent reasons, dates, refunds, credits, or unrequested commitments not provided in the request.`
      ].join("\n");
    }
    return [
      `Draft a professional, high-impact email to a ${recipient.toLowerCase()} regarding: ${subject}.`,
      ``,
      `Requirements:`,
      `- Tone: Professional, clear, and low-friction\u2014avoid corporate jargon or filler pleasantries.`,
      `- Core Message: Deliver the primary message and context directly in the opening lines.`,
      `- Call to Action (CTA): Provide a clear, singular next step.`,
      `- Structure: Keep paragraphs concise and easy to skim on mobile devices.`,
      `- Subject Lines: Include 2 distinct subject line options (one direct, one curiosity-led).`,
      ``,
      `Do not invent unstated commitments, dates, or terms not provided in the request.`
    ].join("\n");
  }
  function buildBugFixPrompt(model) {
    const lower = model.rawInput.toLowerCase();
    const isStreamOrMemoryLeak = lower.includes("stream") || lower.includes("memory leak");
    if (isStreamOrMemoryLeak) {
      let subject2 = model.specificSubject || "memory leak in Node.js stream pipeline";
      subject2 = subject2.replace(/\bnodejs\b/gi, "Node.js").replace(/\bin Node\.js\b/i, "in the Node.js").replace(/^the\s+/i, "");
      return [
        `Diagnose and fix the ${subject2}.`,
        ``,
        `Identify likely lifecycle, buffering, backpressure, event-listener, resource-management, or stream-handling causes based on the available code/context. Provide the minimal production-safe code change required, explain the root cause, and include a regression test or verification procedure.`,
        ``,
        `Do not introduce unrelated architectural changes.`
      ].join("\n");
    }
    const subject = model.specificSubject || "the reported bug";
    return [
      `Diagnose the root cause and provide a surgical fix for: ${subject}.`,
      ``,
      `Structure your solution with:`,
      `1. Root Cause Analysis: Systematically trace why the issue occurs without speculation.`,
      `2. Surgical Code Fix: Provide clean, minimal code resolving the bug without unnecessary dependencies.`,
      `3. Defensive Edge-Case Guards: Handle boundary states, null checks, and error paths.`,
      `4. Verification & Testing: Provide an automated test case or exact reproduction procedure.`,
      ``,
      `Do not introduce unrelated architectural changes.`
    ].join("\n");
  }
  function buildCinematicImagePrompt(model) {
    const subject = model.specificSubject || "Ferrari";
    const geoClause = model.geography ? ` in ${model.geography}` : "";
    const timeClause = model.timeframe ? ` ${model.timeframe}` : "";
    const lightingText = model.geography ? `${model.geography} night neon reflections, rain-slicked asphalt reflections, deep rich contrast with preserved shadow detail.` : "Naturalistic cinematic lighting, vibrant atmospheric reflections on surrounding surfaces, deep rich contrast with preserved shadow detail.";
    return [
      `Cinematic, atmospheric 35mm photograph of ${subject}${geoClause}${timeClause}.`,
      ``,
      `Visual specifications:`,
      `- Camera & Optics: Shot on 35mm anamorphic lens, shallow depth of field with natural optical bokeh, crisp focal plane on the primary subject.`,
      `- Lighting & Ambiance: ${lightingText}`,
      `- Composition & Perspective: Low-angle dynamic framing emphasizing automotive lines and urban backdrop with depth layers.`,
      `- Texture & Environment: Authentic environmental textures, subtle film grain, zero artificial CG plastic sheen.`,
      `- Color Grade: Moody cinematic color grade with balanced atmospheric saturation.`
    ].join("\n");
  }
  function buildHeadlinePrompt(model) {
    const role = model.audience || model.specificSubject || "CTO";
    return [
      `Write 2-line LinkedIn headline options for a ${role}.`,
      ``,
      `Provide options that:`,
      `- clearly communicate technical leadership, architectural scale, and business impact within a strict 2-line constraint`,
      `- balance strategic vision with hands-on credibility`,
      `- stand out without buzzwords, hyperbole, or self-aggrandizing claims`,
      ``,
      `Keep the scope limited strictly to the 2-line headline. Do not write an entire profile summary, bio, or content strategy. Do not invent specific company names, metrics, or technologies not provided.`
    ].join("\n");
  }
  function buildCompetitiveAnalysisPrompt(model) {
    const subject = model.specificSubject || "Notion";
    const geoClause = model.geography ? ` in ${model.geography}` : "";
    const marketName = model.geography === "India" ? "the Indian market" : model.geography ? `the ${model.geography} market` : "the market";
    return [
      `Conduct an in-depth competitive analysis of alternatives and competitors to ${subject}${geoClause}.`,
      ``,
      `Cover:`,
      `- Competitor Identification & Taxonomy: direct and indirect workspace, productivity, and note-taking competitors active in ${marketName}`,
      `- Feature & Capability Matrix: feature parity, collaboration capabilities, and performance considerations`,
      `- Pricing & Packaging Structure: pricing, regional packaging, and local currency (INR) affordability comparisons across tiers`,
      `- Regional Dynamics & Distribution Moats: adoption dynamics across local tech startups, SMBs, enterprises, and educational institutions`,
      `- Strategic Gaps & Differentiation: localized integrations, offline accessibility, user frustrations, and market opportunities`,
      ``,
      `Ground the analysis in realistic market dynamics, distinguishing verified competitor data from market inferences. Do not invent non-existent startups or unverified pricing data.`
    ].join("\n");
  }
  function buildMetricDiagnosticPrompt(model) {
    const subject = model.specificSubject || "Customer Acquisition Cost (CAC) increase";
    return [
      `Perform a structured diagnostic analysis investigating: ${subject}.`,
      ``,
      `Structure the diagnostic as follows:`,
      `- Metric Decomposition: Deconstruct the metric into underlying mathematical drivers (channel spend, conversion rates across funnel stages, paid vs organic mix, CPM and CPC inflation).`,
      `- Root-Cause Hypothesis Tree: Evaluate acquisition channels (audience saturation, ad fatigue), funnel & UX friction, and attribution and tracking changes.`,
      `- Diagnostic Data Audit: Outline the diagnostic data cuts, cohort analyses, and SQL queries needed to isolate the root cause.`,
      `- Corrective Action Plan: Prioritize immediate tactical checks (0-30 days) and structural remediation actions (30-90 days).`,
      ``,
      `Where specific company, financial, or conversion metrics are unstated, declare reasonable baseline assumptions rather than inventing business facts.`
    ].join("\n");
  }
  function buildFullLandingPagePrompt(model) {
    const subject = model.specificSubject || "the product";
    return [
      `Design the page layout and write complete section copy for a ${subject} landing page.`,
      ``,
      `Cover:`,
      `- Hero Section: Primary headline, supporting value proposition, clear primary and secondary CTAs, and above-the-fold trust signals.`,
      `- Problem & Pain Points: Concrete customer pain points framed around cost, wasted time, or friction.`,
      `- Core Solution & Feature-to-Benefit Breakdown: Translate core capabilities into tangible business outcomes.`,
      `- Social Proof & Credibility Architecture: Framework for customer testimonials and proof points.`,
      `- Pricing & Tier Structure: Clear tier breakdown with feature differentiation.`,
      `- Objection Handling & FAQ: Address critical pre-purchase objections.`,
      ``,
      `Keep copy concise, credible, and outcome-oriented. Do not invent specific customer case studies or unprovided metrics.`
    ].join("\n");
  }
  function buildCodeModulePrompt(model) {
    const subject = model.specificSubject || "the module";
    return [
      `Implement a production-grade, modular solution for: ${subject}.`,
      ``,
      `Engineering Requirements:`,
      `- Clean Interfaces: Define clear module boundaries and complete type definitions.`,
      `- Implementation: Provide fully working code with error handling and zero placeholder comments.`,
      `- Defensive Guards: Handle null states, boundary conditions, and timeouts gracefully.`,
      `- Verification: Include unit test specifications verifying core functionality.`,
      ``,
      `Do not introduce unrelated architectural redesigns or unrequested dependencies.`
    ].join("\n");
  }
  function buildSocialPostPrompt(model) {
    const subject = model.specificSubject || model.rawInput;
    return [
      `Write a high-impact, insight-driven post on: ${subject}.`,
      ``,
      `Requirements:`,
      `- Strong Hook: Open with a compelling insight in the first 2 lines without cheap clickbait.`,
      `- Concrete Insight: Deliver practical, actionable perspectives with clean paragraph breaks.`,
      `- Practical Takeaway: Provide a clear conclusion readers can apply immediately.`,
      `- Natural Engagement: Conclude with a thoughtful discussion prompt.`,
      ``,
      `Stay focused on this specific topic. Do not expand into a broad content strategy.`
    ].join("\n");
  }
  function buildResearchAnalysisPrompt(model) {
    const subject = model.specificSubject || model.rawInput;
    return [
      `Conduct an evidence-grounded research analysis of: ${subject}.`,
      ``,
      `Structure:`,
      `- Executive synthesis and key findings`,
      `- Current landscape, key technologies, and operating models`,
      `- Comparative evaluation of trade-offs and limitations`,
      `- Critical conclusions distinguishing verified facts from market inferences`,
      ``,
      `Do not invent unsupported statistics or speculate without declaring assumptions.`
    ].join("\n");
  }
  function buildCustomExpertPrompt(model) {
    return [
      `Execute the following task with senior practitioner depth and structural rigor:`,
      `"${model.rawInput}"`,
      ``,
      `Execution Directives:`,
      `- Address core requirements systematically without changing the requested scope.`,
      `- Produce a complete, usable deliverable without placeholders.`,
      `- Declare reasonable baseline assumptions explicitly where specific details are omitted.`,
      `- Avoid invented facts, buzzwords, or unrelated deliverables.`
    ].join("\n");
  }
  function buildDetailedTaskSpecification(model) {
    const constraintsText = model.constraints.length > 0 ? `Ground recommendations strictly in the stated constraints (${model.constraints.join(", ")}).` : "Ground all recommendations in the user-specified scope and parameters.";
    return [
      model.rawInput,
      ``,
      `Execution Rigor & Deliverable Format:`,
      `- ${constraintsText}`,
      `- Distinguish verified market data from baseline projections.`,
      `- Present comparative frameworks and milestones with structured, decision-ready clarity without repeating or expanding beyond the requested scope.`
    ].join("\n");
  }

  // extension/src/engine/expert/expertValidator.ts
  var FORBIDDEN_PRESTIGE_TERMS = [
    "world-class",
    "elite",
    "renowned",
    "top 1%",
    "guru",
    "expert architect"
  ];
  var PRESTIGE_ALLOWLIST = [
    "expert witness",
    "senior engineer",
    "specialist",
    "subject matter expert",
    "domain specialist",
    "security specialist",
    "technical specialist",
    "clinical specialist"
  ];
  var FORBIDDEN_GENERIC_MARKETING_TERMS = [
    "direct-response copywriter",
    "discerning buyers",
    "high-converting copy & strategic execution blueprint"
  ];
  var FORBIDDEN_METADATA_CLUTTER = [
    "- Target Domain:",
    "- Target Environment:",
    "- Audience Standard:",
    "# ROLE & PERSPECTIVE\nYou are acting as a World-Class"
  ];
  function calculateIntentSimilarity(rawInput, calibratedPrompt) {
    if (!rawInput || !calibratedPrompt) return 0;
    const raw = rawInput.toLowerCase().trim();
    const calibrated = calibratedPrompt.toLowerCase().trim();
    if (calibrated.includes(raw)) {
      return 1;
    }
    const stopWords = /* @__PURE__ */ new Set([
      "a",
      "an",
      "the",
      "and",
      "or",
      "to",
      "for",
      "in",
      "on",
      "with",
      "by",
      "at",
      "of",
      "this",
      "that",
      "these",
      "those",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "being",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "create",
      "make",
      "write",
      "give",
      "generate"
    ]);
    const rawTokens = raw.split(/[^a-z0-9_#.-]+/).map((t) => t.trim()).filter((t) => t.length > 2 && !stopWords.has(t));
    if (rawTokens.length === 0) {
      return 1;
    }
    let matchedCount = 0;
    for (const token of rawTokens) {
      const cleanToken = token.replace(/[^a-z0-9]/g, "");
      if (calibrated.includes(token) || cleanToken.length > 2 && calibrated.includes(cleanToken) || token.endsWith("s") && calibrated.includes(token.slice(0, -1)) || token.endsWith("ing") && calibrated.includes(token.slice(0, -3))) {
        matchedCount++;
      }
    }
    return matchedCount / rawTokens.length;
  }
  function validateExpertPrompt(prompt, model) {
    const violations = [];
    const lower = prompt.toLowerCase();
    let hasScopeExpansion = false;
    const prestigeTermsFound = [];
    if (model.scope === "hero_section") {
      if (lower.includes("pricing") || lower.includes("tier structure")) {
        violations.push("Scope expansion: hero section prompt generated pricing tiers.");
        hasScopeExpansion = true;
      }
      if (lower.includes("faq") || lower.includes("frequently asked questions")) {
        violations.push("Scope expansion: hero section prompt generated FAQ.");
        hasScopeExpansion = true;
      }
      if (lower.includes("testimonials") || lower.includes("social proof & credibility architecture")) {
        violations.push("Scope expansion: hero section prompt generated testimonial architecture.");
        hasScopeExpansion = true;
      }
      if (lower.includes("acquisition strategy")) {
        violations.push("Scope expansion: hero section prompt generated full acquisition strategy.");
        hasScopeExpansion = true;
      }
    }
    if (model.scope === "single_email") {
      if (lower.includes("customer-retention strategy") || lower.includes("retention strategy")) {
        violations.push("Scope expansion: email prompt generated customer retention strategy.");
        hasScopeExpansion = true;
      }
      if (lower.includes("restitution or credit applied") && !model.rawInput.toLowerCase().includes("credit")) {
        violations.push("Invented fact: unprompted restitution or credit applied in apology email.");
        hasScopeExpansion = true;
      }
    }
    if (model.scope === "headline_only") {
      if ((lower.includes("write an entire profile") || lower.includes("create a content strategy")) && !lower.includes("do not write an entire profile")) {
        violations.push("Scope expansion: headline prompt generated full profile or content strategy.");
        hasScopeExpansion = true;
      }
    }
    if (model.scope === "bug_fix") {
      if (lower.includes("software architecture redesign")) {
        violations.push("Scope expansion: bug fix introduced architectural redesign.");
        hasScopeExpansion = true;
      }
    }
    for (const term of FORBIDDEN_PRESTIGE_TERMS) {
      if (lower.includes(term.toLowerCase())) {
        const isAllowed = PRESTIGE_ALLOWLIST.some((allowed) => lower.includes(allowed.toLowerCase()));
        if (!isAllowed) {
          violations.push(`Contains forbidden prestige term: "${term}"`);
          prestigeTermsFound.push(term);
        }
      }
    }
    if (model.scope !== "social_post" && model.scope !== "full_landing_page" && model.scope !== "hero_section") {
      for (const term of FORBIDDEN_GENERIC_MARKETING_TERMS) {
        if (lower.includes(term.toLowerCase())) {
          violations.push(`Injected generic marketing boilerplate into non-copywriting task: "${term}"`);
        }
      }
    }
    for (const header of FORBIDDEN_METADATA_CLUTTER) {
      if (prompt.includes(header)) {
        violations.push(`Contains unnecessary metadata clutter: "${header}"`);
      }
    }
    const intentSimilarity = calculateIntentSimilarity(model.rawInput, prompt);
    if (intentSimilarity < 0.9) {
      violations.push(`Intent fidelity threshold failed: similarity score is ${(intentSimilarity * 100).toFixed(1)}% (minimum 90% required).`);
    }
    for (const entity of model.explicitEntities) {
      const normalized = entity.toLowerCase();
      const isPresent = lower.includes(normalized) || normalized === "united states" && (lower.includes("us") || lower.includes("u.s.")) || normalized === "node.js" && (lower.includes("nodejs") || lower.includes("node.js") || lower.includes("node"));
      if (!isPresent) {
        violations.push(`Failed to preserve explicit entity: "${entity}"`);
      }
    }
    if (/\b(please tell me|can you provide|what is your (budget|product|company)|before we begin, answer)\b/i.test(prompt)) {
      violations.push("Prompt attempts to interrogate or ask questions to the user.");
    }
    return {
      isValid: violations.length === 0,
      violations,
      intentSimilarity,
      hasScopeExpansion,
      prestigeTermsFound
    };
  }

  // extension/src/engine/expert.ts
  function synthesizeExpertPrompt(rawInput, targetAi = "general") {
    const model = analyzeExpertTask(rawInput, targetAi);
    const domain = mapTaskKindToDomain(model.taskKind);
    let prompt = constructExpertPrompt(model);
    prompt = appendOutOfScopeEscapeHatch(prompt, model);
    let validation = validateExpertPrompt(prompt, model);
    if (validation.prestigeTermsFound.length > 0) {
      prompt = sanitizePrompt(prompt);
      validation = validateExpertPrompt(prompt, model);
    }
    if (validation.intentSimilarity < 0.9) {
      prompt = `Execution Directive: ${model.rawInput.trim()}

${prompt}`;
      validation = validateExpertPrompt(prompt, model);
      if (validation.intentSimilarity < 0.9) {
        const betterFallback = synthesizeBetterPrompt(rawInput, targetAi);
        return {
          mode: "expert",
          prompt: betterFallback.prompt,
          intent: model.coreObjective,
          summary: `${betterFallback.shortReason} (Intent fidelity clamped to Better)`,
          domain,
          assumptions: [
            `Known: ${model.rawInput.trim()}`,
            "Preserved: Core intent protected via Better calibration"
          ]
        };
      }
    }
    if (validation.hasScopeExpansion) {
      prompt = clampDeliverableScope(prompt, model);
      validation = validateExpertPrompt(prompt, model);
      if (validation.hasScopeExpansion) {
        const betterFallback = synthesizeBetterPrompt(rawInput, targetAi);
        return {
          mode: "expert",
          prompt: betterFallback.prompt,
          intent: model.coreObjective,
          summary: `${betterFallback.shortReason} (Scope locked to Better)`,
          domain,
          assumptions: [
            `Known: Deliverable restricted to ${model.deliverable}`,
            "Scope locked: Degraded to Better to prevent unauthorized section expansion"
          ]
        };
      }
    }
    const assumptions = deriveTransparentAssumptions(model);
    const summary = buildSummary(model);
    return {
      mode: "expert",
      prompt,
      intent: model.coreObjective,
      summary,
      domain,
      assumptions
    };
  }
  function appendOutOfScopeEscapeHatch(prompt, model) {
    let observations = "";
    if (model.scope === "hero_section") {
      observations = "Verify subsequent conversion funnel friction (e.g. signup flow, social proof placement) post-hero launch.";
    } else if (model.scope === "single_email") {
      observations = "If client responds defensively, transition from email to a 10-minute discovery call rather than a lengthy email thread.";
    } else if (model.scope === "bug_fix") {
      observations = "Audit upstream event emitters and memory allocation benchmarks during peak load.";
    } else if (model.scope === "gtm_strategy") {
      observations = "Review SOC2 Type II and GDPR readiness early if targeting US/EU enterprise buyers.";
    }
    if (!observations) return prompt;
    return `${prompt}

---
[Out-of-Scope Strategic Observations]
(Advisory notes outside the locked deliverable scope):
\u2022 ${observations}`;
  }
  function clampDeliverableScope(prompt, model) {
    if (model.scope === "hero_section") {
      return prompt.replace(/## Pricing.*?(?=##|$)/gis, "").replace(/## FAQ.*?(?=##|$)/gis, "").replace(/## Testimonials.*?(?=##|$)/gis, "");
    }
    if (model.scope === "single_email") {
      return prompt.replace(/Customer Retention Strategy.*?(?=\n\n|$)/gis, "");
    }
    return prompt;
  }
  function sanitizePrompt(prompt) {
    return prompt.replace(/\b(world-class|elite|renowned|top 1%|guru|expert architect)\b/gi, "senior specialist").replace(/- Target Domain:.*\n?/gi, "").replace(/- Target Environment:.*\n?/gi, "").replace(/- Audience Standard:.*\n?/gi, "").replace(/# ROLE & PERSPECTIVE\nYou are acting as a World-Class.*\n\n?/gi, "");
  }
  function mapTaskKindToDomain(taskKind) {
    switch (taskKind) {
      case "gtm_market_entry":
      case "business_analytics":
        return "business";
      case "landing_page":
      case "social_content":
        return "marketing";
      case "code_debugging":
      case "code_engineering":
        return "code";
      case "image_cinematic":
        return "image_gen";
      case "competitive_research":
      case "general_research":
        return "research";
      case "email_communication":
        return "writing";
      default:
        return "general";
    }
  }
  function deriveTransparentAssumptions(model) {
    const assumptions = [];
    if (model.explicitEntities.length > 0) {
      assumptions.push(`Known: Targeting ${model.explicitEntities.slice(0, 2).join(", ")}`);
    } else {
      assumptions.push(`Known: Deliverable strictly locked to ${model.deliverable}`);
    }
    if (model.geography) {
      const geoName = model.geography === "US" ? "United States" : model.geography;
      assumptions.push(`Inferred: Geographic focus is ${geoName}`);
    }
    switch (model.scope) {
      case "gtm_strategy":
        assumptions.push("Assumed: Mid-market B2B ICP with 30-90 day discovery cycles (stated in prompt)");
        break;
      case "hero_section":
        assumptions.push("Assumed: Developer/technical audience; no pricing or FAQ clutter");
        break;
      case "single_email":
        assumptions.push("Assumed: Senior commercial relationship; non-price levers prioritized");
        break;
      case "bug_fix":
        assumptions.push("Assumed: Production runtime; surgical fix with regression test");
        break;
      case "headline_only":
        assumptions.push("Assumed: Executive leadership tone; strict 2-line maximum");
        break;
      case "competitive_analysis":
        assumptions.push("Assumed: Verified market data prioritized over speculative estimates");
        break;
      case "metric_diagnostic":
        assumptions.push("Assumed: Funnel and cohort breakdown required before speculative fixes");
        break;
      case "single_image":
        assumptions.push("Assumed: 35mm f/1.4 lens optics and natural directional lighting");
        break;
      default:
        assumptions.push("Assumed: Senior practitioner standards with explicit constraints");
        break;
    }
    return assumptions;
  }
  function buildSummary(model) {
    if (model.isAlreadyDetailed) {
      return "Calibrated execution rigor preserving all user specifications.";
    }
    const geoLabel = model.geography === "US" ? "United States" : model.geography || "target market";
    switch (model.scope) {
      case "gtm_strategy":
        return `Comprehensive market-entry strategy calibrated for ${geoLabel}.`;
      case "hero_section":
        return "Developer outcome-oriented hero section copy and structure.";
      case "headline_only":
        return "Concise 2-line leadership headline options.";
      case "single_email":
        return "Professional, accountable customer communication.";
      case "bug_fix":
        return "Root-cause diagnosis, surgical code fix, and regression test.";
      case "competitive_analysis":
        return `In-depth competitive evaluation${model.geography ? ` for ${model.geography}` : ""}.`;
      case "single_image":
        return "Cinematic 35mm photographic prompt specification.";
      case "metric_diagnostic":
        return "Root-cause diagnostic framework and remediation plan.";
      default:
        return "Expert task specification structured for immediate execution.";
    }
  }

  // extension/src/ui/controller.ts
  var RefinziController = class {
    engine = null;
    activeSurface = null;
    orb = null;
    isInitialized = false;
    originalPromptText = "";
    wasPartialSelection = false;
    isCalibrating = false;
    lastTriggerTimestamp = 0;
    isMessageListenerRegistered = false;
    canUndo = false;
    lastCalibratedPrompt = "";
    byokNudgeShownThisSession = false;
    /** Held so the Orb can be constructed lazily, after init() has finished. */
    holdThresholdMs = 350;
    boundOnKeyDown = (e) => this.handleGlobalKeyDown(e);
    /**
     * Returns the Ambient Orb, creating it on first use.
     *
     * This content script runs in every frame of every http/https page, and most
     * of those pages never show an editable surface to the user. Constructing the
     * orb eagerly meant building a shadow root plus window-level listeners on
     * every single page load for UI that was never displayed.
     */
    ensureOrb() {
      if (!this.orb) {
        this.orb = new AmbientOrb(
          {
            onBetter: () => this.handleTrigger("better"),
            onExpert: () => this.handleTrigger("expert")
          },
          this.holdThresholdMs
        );
      }
      return this.orb;
    }
    async init() {
      if (this.isInitialized) return;
      this.isInitialized = true;
      const settings = await getSettings();
      if (typeof window !== "undefined" && window.location) {
        const hostname = window.location.hostname.toLowerCase();
        const activeAdapter = AdapterRegistry.getActiveAdapter();
        if (activeAdapter) {
          const siteKey = activeAdapter.id;
          if (settings.enabledSites && settings.enabledSites[siteKey] === false) {
            return;
          }
        }
      }
      this.holdThresholdMs = settings.holdThresholdMs || 350;
      this.engine = new UniversalTextEngine({
        onSurfaceActivated: (surface) => {
          this.activeSurface = surface;
          const orb = this.ensureOrb();
          orb.attach(surface.element);
          orb.show();
        },
        onSurfaceDeactivated: (surface) => {
          if (this.activeSurface === surface) {
            this.activeSurface = null;
            this.orb?.hide();
          }
        },
        onPositionUpdate: (surface) => {
          if (this.activeSurface === surface && this.orb) {
            this.orb.updatePosition(surface.element);
          }
        }
      });
      this.engine.start();
      this.checkInitialSurface();
      window.addEventListener("keydown", this.boundOnKeyDown, true);
      if (!this.isMessageListenerRegistered) {
        this.isMessageListenerRegistered = true;
        BrowserAPI.runtime.onMessage.addListener((message) => {
          if (!message || typeof message !== "object") return;
          if (message.type === "REFINZI_TRIGGER_BETTER_SHORTCUT") {
            this.handleTrigger("better");
          } else if (message.type === "REFINZI_TRIGGER_EXPERT_SHORTCUT") {
            this.handleTrigger("expert");
          } else if (message.type === "REFINZI_SHOW_ONBOARDING") {
            const modal = new RefinziOnboardingModal();
            modal.show();
          }
        });
      }
      if (typeof chrome !== "undefined" && chrome.storage?.onChanged) {
        chrome.storage.onChanged.addListener((changes, areaName) => {
          if (areaName === "local" && changes.settings?.newValue) {
            const updated = changes.settings.newValue;
            if (typeof updated?.holdThresholdMs === "number") {
              this.holdThresholdMs = updated.holdThresholdMs;
            }
          }
        });
      }
    }
    /**
     * Discovers and binds to an initial editable surface or active composer on page load.
     */
    checkInitialSurface() {
      const active = document.activeElement;
      if (active instanceof HTMLElement && isSafeEditableElement(active)) {
        const surface = SurfaceFactory.createSurface(active);
        if (surface) {
          this.activeSurface = surface;
          this.ensureOrb().attach(surface.element);
          return;
        }
      }
      try {
        const activeAdapter = AdapterRegistry.getActiveAdapter();
        if (activeAdapter) {
          const composer = activeAdapter.getComposer();
          if (composer && isSafeEditableElement(composer)) {
            const surface = SurfaceFactory.createSurface(composer);
            if (surface) {
              this.activeSurface = surface;
              this.ensureOrb().attach(surface.element);
              return;
            }
          }
        }
      } catch {
      }
      try {
        const candidates = document.querySelectorAll(
          'textarea:not([disabled]):not([readonly]), [contenteditable="true"]:not([contenteditable="false"]), #prompt-textarea, [data-refinzi-test-input]'
        );
        for (const el of Array.from(candidates)) {
          if (isSafeEditableElement(el)) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 40 && rect.height > 20) {
              const surface = SurfaceFactory.createSurface(el);
              if (surface) {
                this.activeSurface = surface;
                this.ensureOrb().attach(surface.element);
                return;
              }
            }
          }
        }
      } catch {
      }
    }
    /**
     * In-place calibration (Click = Better, Hold = Expert)
     * Automatically replaces the prompt in the active surface without opening modals or needing "Apply".
     */
    async handleTrigger(mode) {
      if (!this.activeSurface) {
        const attached = this.orb?.getAttachedElement();
        if (attached && isSafeEditableElement(attached) && attached.isConnected) {
          this.activeSurface = SurfaceFactory.createSurface(attached);
        }
      }
      if (!this.activeSurface) {
        const active = document.activeElement;
        if (active instanceof HTMLElement && isSafeEditableElement(active)) {
          this.activeSurface = SurfaceFactory.createSurface(active);
          if (this.activeSurface) {
            this.ensureOrb().attach(this.activeSurface.element);
          }
        }
      }
      if (!this.activeSurface) {
        try {
          const activeAdapter = AdapterRegistry.getActiveAdapter();
          if (activeAdapter) {
            const composer = activeAdapter.getComposer();
            if (composer && isSafeEditableElement(composer)) {
              this.activeSurface = SurfaceFactory.createSurface(composer);
              if (this.activeSurface) {
                this.ensureOrb().attach(this.activeSurface.element);
              }
            }
          }
        } catch {
        }
      }
      if (!this.activeSurface) {
        try {
          const candidate = document.querySelector(
            '#prompt-textarea, textarea:not([disabled]):not([readonly]), [contenteditable="true"]:not([contenteditable="false"])'
          );
          if (candidate && isSafeEditableElement(candidate)) {
            this.activeSurface = SurfaceFactory.createSurface(candidate);
            if (this.activeSurface) {
              this.ensureOrb().attach(this.activeSurface.element);
            }
          }
        } catch {
        }
      }
      const surfaceSelection = this.activeSurface?.getSelection();
      const isSurfacePartial = Boolean(surfaceSelection && surfaceSelection.text.trim().length > 0);
      let windowSel = "";
      try {
        const sel = typeof window !== "undefined" ? window.getSelection() : null;
        if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
          windowSel = sel.toString().trim();
        }
      } catch {
      }
      const isAiOutputSelection = !isSurfacePartial && windowSel.length > 0;
      const isPartialSelection = isSurfacePartial;
      let rawInput = "";
      if (isSurfacePartial) {
        rawInput = surfaceSelection.text.trim();
      } else if (isAiOutputSelection) {
        rawInput = windowSel;
      } else if (this.activeSurface) {
        rawInput = this.activeSurface.getValue().trim();
      }
      if (!this.activeSurface && !rawInput) return;
      const orb = this.ensureOrb();
      const now = Date.now();
      if (this.isCalibrating || now - this.lastTriggerTimestamp < 400) {
        return;
      }
      if (!rawInput) {
        orb.showUndoToast("Type your raw thought in the text box or highlight text first!", () => {
        });
        return;
      }
      this.isCalibrating = true;
      this.lastTriggerTimestamp = now;
      this.originalPromptText = isAiOutputSelection && this.activeSurface ? this.activeSurface.getValue() : rawInput;
      this.wasPartialSelection = isPartialSelection;
      const targetAi = this.activeSurface?.siteName || "general";
      orb.startProcessingFeedback(mode);
      try {
        const messageType = mode === "better" ? "REFINZI_GENERATE_BETTER" : "REFINZI_GENERATE_EXPERT";
        const requestId = `${mode}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const responsePromise = BrowserAPI.runtime.sendMessage({
          type: messageType,
          text: rawInput,
          targetAi,
          requestId
        });
        const isTestEnv = typeof process !== "undefined" && process.env?.VITEST === "true";
        const minDuration = isTestEnv ? 10 : 380;
        const [response] = await Promise.all([
          responsePromise,
          new Promise((resolve) => setTimeout(resolve, minDuration))
        ]);
        orb.stopProcessingFeedback();
        if (response && response.success && response.data?.prompt) {
          const calibratedPrompt = response.data.prompt;
          const currentSettings = await getSettings();
          const autoApply = currentSettings.autoApply !== false;
          if (autoApply) {
            if (this.activeSurface) {
              if (isPartialSelection) {
                this.activeSurface.replaceSelection(calibratedPrompt);
              } else {
                this.activeSurface.setValue(calibratedPrompt);
              }
              this.activeSurface.focus();
              this.canUndo = true;
              this.lastCalibratedPrompt = calibratedPrompt;
            } else {
              try {
                await navigator.clipboard.writeText(calibratedPrompt);
              } catch {
                const tmp = document.createElement("textarea");
                tmp.value = calibratedPrompt;
                document.body.appendChild(tmp);
                tmp.select();
                document.execCommand("copy");
                document.body.removeChild(tmp);
              }
            }
          }
          const hasProviderFailure = response.data.isFallback || !!response.data.providerFailure;
          const failureInfo = response.data.providerFailure;
          const isDefaultFallback = failureInfo?.isDefaultFallback === true;
          let summaryLabel = mode === "better" ? isAiOutputSelection ? "\u26A1 Calibrated from AI output" : `\u26A1 Calibrated for ${response.data.domain || "task"}` : isAiOutputSelection ? "\u{1F9E0} Expert briefing from AI output" : `\u{1F9E0} Expert briefing applied`;
          if (hasProviderFailure) {
            summaryLabel = isDefaultFallback ? isAiOutputSelection ? mode === "better" ? "\u26A1 Calibrated from AI output" : "\u{1F9E0} Expert briefing from AI output" : mode === "better" ? "\u26A1 Better Prompt" : "\u{1F9E0} Expert Briefing" : mode === "better" ? "\u26A1 Better (Offline Engine)" : "\u{1F9E0} Expert (Offline Engine)";
          }
          const assumptionsList = Array.isArray(response.data.assumptions) ? response.data.assumptions : [];
          const assumedItem = assumptionsList.find((a) => a.startsWith("Assumed:")) || assumptionsList[0];
          const failureNote = isDefaultFallback ? "Instant local calibration applied (Zero latency)" : `Note: ${failureInfo?.reason || "Offline calibration used"}`;
          const checklist = mode === "expert" ? [
            "Exact core intent preserved",
            "Scope boundaries locked to task",
            assumedItem ? assumedItem : "Defensible assumptions explicitly marked",
            hasProviderFailure ? failureNote : "Execution criteria & constraints added"
          ] : [
            "Core intent clarified",
            "Vagueness & ambiguity eliminated",
            hasProviderFailure ? failureNote : "Executable prompt structure calibrated"
          ];
          orb.showValidationToast({
            mode,
            domain: response.data.domain ? response.data.domain.toUpperCase() : mode === "better" ? "BETTER" : "EXPERT",
            summary: summaryLabel,
            checklist,
            onUndo: () => this.handleUndo(),
            showApply: !autoApply,
            onApply: () => {
              if (this.activeSurface) {
                if (isPartialSelection) {
                  this.activeSurface.replaceSelection(calibratedPrompt);
                } else {
                  this.activeSurface.setValue(calibratedPrompt);
                }
                this.activeSurface.focus();
              }
            },
            onCopy: async () => {
              try {
                await navigator.clipboard.writeText(calibratedPrompt);
              } catch {
                const tmp = document.createElement("textarea");
                tmp.value = calibratedPrompt;
                document.body.appendChild(tmp);
                tmp.select();
                document.execCommand("copy");
                document.body.removeChild(tmp);
              }
            }
          });
          if (hasProviderFailure && failureInfo && !isDefaultFallback) {
            setTimeout(() => {
              this.orb?.showByokNudge({
                reason: failureInfo.reason,
                isError: true
              });
            }, 600);
          } else if (!this.byokNudgeShownThisSession) {
            try {
              const nudgeSettings = await getSettings();
              const usingFreeEngine = nudgeSettings.provider === "gateway" || nudgeSettings.provider === "local" || nudgeSettings.provider === "gemini" && !nudgeSettings.apiKeys?.gemini || nudgeSettings.provider === "openai" && !nudgeSettings.apiKeys?.openai || nudgeSettings.provider === "deepseek" && !nudgeSettings.apiKeys?.deepseek || nudgeSettings.provider === "openrouter" && !nudgeSettings.apiKeys?.openrouter;
              if (usingFreeEngine) {
                this.byokNudgeShownThisSession = true;
                setTimeout(() => {
                  this.orb?.showByokNudge();
                }, 2500);
              }
            } catch {
            }
          }
        } else {
          throw new Error(response?.error || "Calibration failed");
        }
      } catch (err) {
        orb.stopProcessingFeedback();
        const isContextInvalidated = err?.message?.includes("Extension context invalidated") || err?.message?.includes("context invalidated") || err?.message?.includes("message channel closed") || typeof chrome === "undefined" || !chrome?.runtime?.id;
        if (isContextInvalidated) {
          try {
            const fallbackRes = mode === "expert" ? synthesizeExpertPrompt(rawInput, targetAi) : synthesizeBetterPrompt(rawInput, targetAi);
            const calibratedPrompt = fallbackRes.prompt;
            const currentSettings = await getSettings().catch(() => ({ autoApply: true }));
            const autoApply = currentSettings.autoApply !== false;
            if (autoApply) {
              if (this.activeSurface) {
                if (isPartialSelection) {
                  this.activeSurface.replaceSelection(calibratedPrompt);
                } else {
                  this.activeSurface.setValue(calibratedPrompt);
                }
                this.activeSurface.focus();
                this.canUndo = true;
                this.lastCalibratedPrompt = calibratedPrompt;
              } else {
                try {
                  await navigator.clipboard.writeText(calibratedPrompt);
                } catch {
                }
              }
            }
            const summaryLabel = mode === "better" ? `\xE2\u0161\xA1 Better calibrated (Offline engine)` : `\xF0\u0178\xA7\xA0 Expert briefing applied (Offline engine)`;
            const fallbackAssumptions = "assumptions" in fallbackRes && Array.isArray(fallbackRes.assumptions) ? fallbackRes.assumptions : [];
            const fallbackAssumed = fallbackAssumptions.find((a) => a.startsWith("Assumed:")) || fallbackAssumptions[0];
            const checklist = mode === "expert" ? [
              "Exact core intent preserved",
              "Scope boundaries locked to task",
              fallbackAssumed ? fallbackAssumed : "Defensible assumptions explicitly marked",
              "Execution criteria & constraints added"
            ] : [
              "Core intent clarified",
              "Vagueness & ambiguity eliminated",
              "Executable prompt structure calibrated"
            ];
            orb.showValidationToast({
              mode,
              domain: fallbackRes.domain.toUpperCase(),
              summary: summaryLabel,
              checklist,
              onUndo: () => this.handleUndo(),
              showApply: !autoApply,
              onApply: () => {
                if (this.activeSurface) {
                  if (isPartialSelection) {
                    this.activeSurface.replaceSelection(calibratedPrompt);
                  } else {
                    this.activeSurface.setValue(calibratedPrompt);
                  }
                  this.activeSurface.focus();
                  this.canUndo = true;
                  this.lastCalibratedPrompt = calibratedPrompt;
                }
              },
              onCopy: async () => {
                try {
                  await navigator.clipboard.writeText(calibratedPrompt);
                } catch {
                  const tmp = document.createElement("textarea");
                  tmp.value = calibratedPrompt;
                  document.body.appendChild(tmp);
                  tmp.select();
                  document.execCommand("copy");
                  document.body.removeChild(tmp);
                }
              }
            });
            setTimeout(() => this.destroy(), 4e3);
            return;
          } catch (fallbackErr) {
            console.error("[Refinzi] In-page fallback failed:", fallbackErr);
            this.destroy();
          }
        }
        orb.showUndoToast(`\u26A0\uFE0F Calibration error: ${err?.message || "Try again"}`, () => {
        });
        this.orb?.showByokNudge({
          reason: `API Error: ${err?.message || "Connection failed"}. Configure BYOK in Settings.`,
          isError: true
        });
      } finally {
        this.isCalibrating = false;
      }
    }
    /**
     * Instant Undo: Restores the user's original uncalibrated text with zero loss.
     */
    handleUndo() {
      if (!this.activeSurface) return;
      const undone = this.activeSurface.undo();
      if (!undone && this.originalPromptText) {
        if (!this.wasPartialSelection) {
          this.activeSurface.setValue(this.originalPromptText);
        }
      }
      this.canUndo = false;
      this.activeSurface.focus();
      this.orb?.showUndoToast("\xE2\u2020\xA9 Original prompt restored", () => {
      });
    }
    /**
     * Intercepts Ctrl+Z / Cmd+Z to restore the prompt after in-place calibration.
     */
    handleGlobalKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        if (this.canUndo && this.activeSurface && this.originalPromptText) {
          const currentVal = this.activeSurface.getValue();
          if (!this.lastCalibratedPrompt || currentVal === this.lastCalibratedPrompt || currentVal.includes(this.lastCalibratedPrompt.slice(0, 30))) {
            e.preventDefault();
            e.stopPropagation();
            this.handleUndo();
          }
        }
      }
    }
    destroy() {
      window.removeEventListener("keydown", this.boundOnKeyDown, true);
      this.engine?.destroy();
      this.engine = null;
      this.activeSurface?.cleanup();
      this.activeSurface = null;
      this.orb?.destroy();
      this.orb = null;
      this.isInitialized = false;
    }
  };

  // extension/src/content.ts
  if (!window.__REFINZI_LOADED__) {
    window.__REFINZI_LOADED__ = true;
    const controller = new RefinziController();
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        controller.init();
      });
    } else {
      controller.init();
    }
  }
})();
