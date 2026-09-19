/**
 * REFINZI — UI Stylesheet (Shadow DOM Encapsulated)
 * Minimal, premium, dark-first, crisp typography, 8-12px radii.
 * 
 * GRAMMARLY-STYLE IN-PLACE PROMPT CALIBRATION:
 * Automatic in-place replacement directly inside AI composers.
 * Zero modal friction. Floating Undo toast feedback.
 */

export const REFINZI_CSS = `
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

/* Core Icon (Lightning ⚡ / Brain 🧠) */
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
  bottom: calc(100% + 8px);
  right: 0;
  white-space: nowrap;
  background: #0F1015;
  color: #94A3B8;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  pointer-events: none;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.15s ease, transform 0.15s ease;
  z-index: 100;
}

.orb-tooltip strong {
  color: #FFD700;
}

.refinzi-orb-host:hover .orb-tooltip {
  opacity: 1;
  transform: translateY(0);
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
`;
