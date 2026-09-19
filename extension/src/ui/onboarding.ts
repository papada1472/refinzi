/**
 * REFINZI — First-Run Onboarding Modal
 * "Click for better. Hold for expert."
 * 
 * CORE PHILOSOPHY: Zero Friction.
 * Educates first-time users on the "Click vs. Hold" mechanic without being annoying.
 * Interactive live simulator allows testing Click vs. Hold right inside the modal.
 * Non-blocking, isolated Shadow DOM host, dismissable with 1 click or Escape.
 */

import { BrowserAPI } from '../browser/api';
import { getSettings, saveSettings } from '../utils/storage';

export class RefinziOnboardingModal {
  private container: HTMLElement | null = null;
  private shadow: ShadowRoot | null = null;
  private isVisible: boolean = false;
  private holdTimer: number | null = null;
  private isHolding: boolean = false;
  private progressAnimationFrame: number | null = null;

  static async checkAndShowFirstRun(): Promise<void> {
    try {
      const settings = await getSettings();
      if (!settings.hasSeenOnboarding) {
        const modal = new RefinziOnboardingModal();
        modal.show();
      }
    } catch {
      // Ignore storage errors on restricted pages
    }
  }

  show(): void {
    if (this.isVisible || document.getElementById('refinzi-onboarding-root')) return;
    this.isVisible = true;

    this.container = document.createElement('div');
    this.container.id = 'refinzi-onboarding-root';
    this.container.style.position = 'fixed';
    this.container.style.inset = '0';
    this.container.style.zIndex = '2147483647';
    this.container.style.display = 'flex';
    this.container.style.alignItems = 'center';
    this.container.style.justifyContent = 'center';

    this.shadow = this.container.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
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

    const backdrop = document.createElement('div');
    backdrop.className = 'backdrop';

    const card = document.createElement('div');
    card.className = 'modal-card';
    card.innerHTML = `
      <button type="button" class="btn-close" id="rfz-onboarding-close" title="Close (Esc)">✕</button>
      
      <div class="header-badge">✨ Welcome to Refinzi</div>
      <h2 class="header-title">Any Text Box. <span>Zero Friction.</span></h2>
      <p class="header-desc">
        Refinzi docks an intelligent ambient Orb beside any text box across the web. Type your raw thought and refine it in-place.
      </p>

      <div class="mechanics-grid">
        <div class="mechanic-box better">
          <div class="action-pill">⚡ CLICK</div>
          <div class="mechanic-title">Better Mode</div>
          <div class="mechanic-detail">Instant task calibration. Fixes vagueness and sharpens intent without changing what you asked for.</div>
        </div>

        <div class="mechanic-box expert">
          <div class="action-pill">🧠 HOLD (350ms)</div>
          <div class="mechanic-title">Expert Mode</div>
          <div class="mechanic-detail">Deep execution briefing. Adds missing dimensions, constraints, and defensible baseline assumptions.</div>
        </div>
      </div>

      <!-- Live Simulator -->
      <div class="sandbox-wrapper">
        <div class="sandbox-label">
          <span>Interactive Sandbox</span>
          <span class="sandbox-badge" id="demo-mode-badge">⚡ Click or Hold Orb below</span>
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
          Got it — Start Using Refinzi →
        </button>
      </div>
      <div class="feedback-note">Press <kbd>Esc</kbd> anytime to dismiss. You can replay this guide from Settings.</div>
    `;

    this.shadow.appendChild(backdrop);
    this.shadow.appendChild(card);
    document.body.appendChild(this.container);

    this.bindEvents(card, backdrop);
  }

  private bindEvents(card: HTMLElement, backdrop: HTMLElement): void {
    const closeBtn = card.querySelector('#rfz-onboarding-close');
    const submitBtn = card.querySelector('#rfz-onboarding-submit');
    const demoOrb = card.querySelector('#demo-orb') as HTMLElement | null;
    const demoText = card.querySelector('#demo-text') as HTMLElement | null;
    const demoBadge = card.querySelector('#demo-mode-badge') as HTMLElement | null;
    const demoRing = card.querySelector('#demo-ring') as SVGCircleElement | null;

    const dismiss = async () => {
      await saveSettings({ hasSeenOnboarding: true });
      this.destroy();
    };

    closeBtn?.addEventListener('click', dismiss);
    submitBtn?.addEventListener('click', dismiss);
    backdrop?.addEventListener('click', dismiss);

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.removeEventListener('keydown', onKeydown);
        dismiss();
      }
    };
    window.addEventListener('keydown', onKeydown);

    // Interactive Demo Orb Event Handling
    if (demoOrb && demoText && demoBadge && demoRing) {
      const circumference = 106.8;
      let startTime = 0;

      const setProgress = (ratio: number) => {
        const offset = circumference * (1 - Math.min(1, Math.max(0, ratio)));
        demoRing.style.strokeDashoffset = `${offset}`;
      };

      demoOrb.addEventListener('pointerdown', (e) => {
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
            // Expert Triggered via Hold
            this.isHolding = false;
            demoText.classList.add('updated');
            demoText.textContent =
              'Write the hero section for a developer tool landing page. Create 3 strong headline options focused on primary developer outcome, concise supporting subheadline, and primary CTA. Keep scope limited to hero section.';
            demoBadge.textContent = '🧠 Expert Mode Activated (Hold)';
            demoBadge.style.color = '#C084FC';
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
          // Better Triggered via Click
          demoText.classList.add('updated');
          demoText.textContent =
            'Write a high-converting landing page hero for a developer tool. Include a strong developer-focused headline, value proposition, and primary CTA.';
          demoBadge.textContent = '⚡ Better Mode Activated (Click)';
          demoBadge.style.color = '#FFD700';
        }
      };

      demoOrb.addEventListener('pointerup', handlePointerUp);
      demoOrb.addEventListener('pointercancel', handlePointerUp);
      demoOrb.addEventListener('pointerleave', handlePointerUp);
    }
  }

  destroy(): void {
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
}
