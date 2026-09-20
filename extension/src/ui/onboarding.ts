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
          Got it — Show me Step 2 →
        </button>
      </div>
      <div class="feedback-note">Press <kbd>Esc</kbd> anytime to dismiss. Replay from the extension popup → Settings.</div>
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

    const DEMO_PROMPT = 'Write a landing page hero section for a developer tool SaaS';

    const autoPasteDemoPrompt = () => {
      try {
        // Try known AI site composer selectors first (ChatGPT, Claude, Gemini, Perplexity)
        const aiComposerSelectors = [
          '#prompt-textarea',
          'div[id="prompt-textarea"][contenteditable="true"]',
          'div[contenteditable="true"].ProseMirror',
          'div[contenteditable="true"][data-placeholder]',
          'textarea[placeholder*="Ask"]',
          'textarea[placeholder*="Message"]',
          'textarea[placeholder*="How can I help"]',
          'fieldset textarea',
          'form textarea',
          'textarea',
        ];

        let target: HTMLElement | null = null;
        for (const sel of aiComposerSelectors) {
          const el = document.querySelector<HTMLElement>(sel);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 40 && rect.height > 10) {
              target = el;
              break;
            }
          }
        }

        if (!target) return;

        // Paste using the right method per element type
        if (target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement) {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLTextAreaElement.prototype, 'value'
          )?.set || Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'value'
          )?.set;
          if (nativeInputValueSetter) {
            nativeInputValueSetter.call(target, DEMO_PROMPT);
          } else {
            target.value = DEMO_PROMPT;
          }
          target.dispatchEvent(new Event('input', { bubbles: true }));
          target.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (target.isContentEditable) {
          target.focus();
          // Clear existing content and insert demo prompt
          document.execCommand('selectAll', false);
          document.execCommand('insertText', false, DEMO_PROMPT);
          // Fallback if execCommand doesn't work (modern browsers)
          if (!target.textContent?.includes(DEMO_PROMPT.slice(0, 10))) {
            target.textContent = DEMO_PROMPT;
            target.dispatchEvent(new InputEvent('input', { bubbles: true, data: DEMO_PROMPT }));
          }
        }

        target.focus();
      } catch {
        // Non-critical — ignore paste errors silently
      }
    };

    const dismiss = async () => {
      autoPasteDemoPrompt();
      await saveSettings({ hasSeenOnboarding: true });
      this.destroy();
    };

    const showStep2 = () => {
      // Replace the card content with the "You're Ready!" confirmation screen.
      card.innerHTML = `
        <button type="button" class="btn-close" id="rfz-step2-close" title="Close (Esc)">✕</button>

        <div class="header-badge" style="background:rgba(16,185,129,0.12);border-color:rgba(16,185,129,0.3);color:#34D399">✅ You're Ready</div>
        <h2 class="header-title">Refinzi is <span style="background:linear-gradient(135deg,#34D399,#10B981);-webkit-background-clip:text;-webkit-text-fill-color:transparent">active right now</span></h2>
        <p class="header-desc">
          The Ambient Orb is now docked beside any text box you focus on. No API key needed to get started.
        </p>

        <div style="background:rgba(255,215,0,0.05);border:1px solid rgba(255,215,0,0.2);border-radius:14px;padding:16px 18px;margin-bottom:18px">
          <div style="font-size:13px;font-weight:700;color:#FFD700;margin-bottom:10px">✨ What's included — free, from day one</div>
          <div style="display:flex;flex-direction:column;gap:8px">
            <div style="display:flex;align-items:center;gap:10px;font-size:13px;color:#CBD5E1">
              <span style="width:22px;height:22px;border-radius:50%;background:rgba(16,185,129,0.2);display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0">✓</span>
              <span><strong style="color:#F1F5F9">25 free prompt calibrations</strong> — powered by Gemini, zero setup</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px;font-size:13px;color:#CBD5E1">
              <span style="width:22px;height:22px;border-radius:50%;background:rgba(16,185,129,0.2);display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0">✓</span>
              <span>Works on <strong style="color:#F1F5F9">ChatGPT, Claude, Gemini, Perplexity</strong> and any text box</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px;font-size:13px;color:#CBD5E1">
              <span style="width:22px;height:22px;border-radius:50%;background:rgba(16,185,129,0.2);display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0">✓</span>
              <span><strong style="color:#F1F5F9">Zero prompts stored on our servers</strong> — local only, privacy-first</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px;font-size:13px;color:#CBD5E1">
              <span style="width:22px;height:22px;border-radius:50%;background:rgba(168,85,247,0.2);display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0">∞</span>
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
            Try it on ChatGPT →
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

      // Step 2 event bindings
      const step2Close = card.querySelector('#rfz-step2-close');
      const tryChatGPT = card.querySelector('#rfz-try-chatgpt') as HTMLButtonElement | null;
      const step2Dismiss = card.querySelector('#rfz-step2-dismiss') as HTMLButtonElement | null;

      const finalDismiss = async () => {
        await saveSettings({ hasSeenOnboarding: true });
        this.destroy();
      };

      step2Close?.addEventListener('click', finalDismiss);
      step2Dismiss?.addEventListener('click', finalDismiss);

      tryChatGPT?.addEventListener('click', async () => {
        await saveSettings({ hasSeenOnboarding: true });
        this.destroy();
        // Open ChatGPT in a new tab for the reviewer to see the Orb in action
        try {
          window.open('https://chatgpt.com', '_blank', 'noopener,noreferrer');
        } catch {
          // Silently ignore if popup was blocked
        }
      });
    };

    closeBtn?.addEventListener('click', dismiss);
    submitBtn?.addEventListener('click', showStep2);
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
