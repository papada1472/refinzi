/**
 * REFINZI — Quick Panel Component
 * Zero-friction prompt preview and application.
 * 
 * NEVER ASKS QUESTIONS.
 * Transparently displays calibrated dimensions and defensible assumptions.
 * Supports Apply, Copy, and Undo (reverting to original input).
 */

import { REFINZI_CSS } from './styles';
import {
  PromptMode,
  BetterPromptResponse,
  ExpertFinalResponse,
} from '../types';
import { BrowserAPI } from '../browser/api';
import { escapeHTML } from '../utils/sanitize';

export interface PanelCallbacks {
  onApply: (text: string) => void;
  onUndo: () => void;
  onClose: () => void;
}

export class RefinziPanel {
  private container: HTMLElement | null = null;
  private shadow: ShadowRoot | null = null;
  private callbacks: PanelCallbacks;

  // Active state
  private activeMode: PromptMode = 'better';
  private rawInputText: string = '';
  private betterResult: BetterPromptResponse | null = null;
  private expertResult: ExpertFinalResponse | null = null;
  private targetAi: string = 'general';

  constructor(callbacks: PanelCallbacks) {
    this.callbacks = callbacks;
  }

  open(initialInput: string, mode: PromptMode = 'better', targetAi: string = 'general'): void {
    this.rawInputText = (initialInput || '').trim();
    this.activeMode = mode;
    this.targetAi = targetAi;
    this.createDOM();

    if (!this.rawInputText) {
      this.renderNoInput();
      return;
    }

    if (mode === 'better') {
      this.executeBetter();
    } else {
      this.executeExpert();
    }
  }

  close(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
    this.shadow = null;
    this.callbacks.onClose();
  }

  private createDOM(): void {
    this.destroy();

    this.container = document.createElement('div');
    this.container.setAttribute('data-refinzi-panel-host', 'true');
    this.container.style.position = 'fixed';
    this.container.style.inset = '0';
    this.container.style.zIndex = '100000';

    this.shadow = this.container.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = REFINZI_CSS;
    this.shadow.appendChild(style);

    const overlay = document.createElement('div');
    overlay.className = 'refinzi-overlay';
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    const panel = document.createElement('div');
    panel.className = 'refinzi-panel';
    panel.id = 'rfz-panel';
    overlay.appendChild(panel);

    this.shadow.appendChild(overlay);
    document.body.appendChild(this.container);

    // Close on Escape key
    window.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Escape' && this.container) {
          this.close();
        }
      },
      { once: true }
    );
  }

  private renderHeader(): HTMLElement {
    const header = document.createElement('div');
    header.className = 'panel-header';

    const brand = document.createElement('div');
    brand.className = 'brand';
    const isBetter = this.activeMode === 'better';
    brand.innerHTML = `
      <span>✨ Refinzi</span>
      <span class="brand-badge ${isBetter ? 'better' : 'expert'}">
        ${isBetter ? '⚡ Better Calibration' : '🧠 Expert Briefing'}
      </span>
    `;

    const actions = document.createElement('div');
    actions.className = 'header-actions';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'icon-btn';
    closeBtn.title = 'Close (Esc)';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => this.close());

    actions.appendChild(closeBtn);
    header.appendChild(brand);
    header.appendChild(actions);

    return header;
  }

  private getPanelElement(): HTMLElement | null {
    return this.shadow?.querySelector('#rfz-panel') || null;
  }

  private renderNoInput(): void {
    const panel = this.getPanelElement();
    if (!panel) return;
    panel.innerHTML = '';
    panel.appendChild(this.renderHeader());

    const body = document.createElement('div');
    body.className = 'panel-body';
    body.innerHTML = `
      <div class="error-box">
        <strong>No prompt detected</strong>
        <p>Type your raw thought in the AI composer, then click or hold the Refinzi Orb.</p>
      </div>
    `;

    const footer = document.createElement('div');
    footer.className = 'panel-footer';
    footer.innerHTML = `
      <div></div>
      <button class="btn btn-secondary" id="rfz-close-btn">Close</button>
    `;
    footer.querySelector('#rfz-close-btn')?.addEventListener('click', () => this.close());

    panel.appendChild(body);
    panel.appendChild(footer);
  }

  private renderLoading(message: string = 'Calibrating prompt…'): void {
    const panel = this.getPanelElement();
    if (!panel) return;
    panel.innerHTML = '';
    panel.appendChild(this.renderHeader());

    const body = document.createElement('div');
    body.className = 'panel-body';
    body.innerHTML = `
      <div class="loading-box">
        <div class="shimmer-bar"></div>
        <div class="loading-text">${escapeHTML(message)}</div>
      </div>
    `;

    const footer = document.createElement('div');
    footer.className = 'panel-footer';
    footer.innerHTML = `
      <div></div>
      <button class="btn btn-subtle" id="rfz-cancel-btn">Cancel</button>
    `;
    footer.querySelector('#rfz-cancel-btn')?.addEventListener('click', () => this.close());

    panel.appendChild(body);
    panel.appendChild(footer);
  }

  private renderError(message: string): void {
    const panel = this.getPanelElement();
    if (!panel) return;
    panel.innerHTML = '';
    panel.appendChild(this.renderHeader());

    const body = document.createElement('div');
    body.className = 'panel-body';
    body.innerHTML = `
      <div class="error-box">
        <strong>Calibration error</strong>
        <p>${escapeHTML(message)}</p>
      </div>
    `;

    const footer = document.createElement('div');
    footer.className = 'panel-footer';

    const retryBtn = document.createElement('button');
    retryBtn.className = 'btn btn-primary';
    retryBtn.textContent = 'Retry';
    retryBtn.addEventListener('click', () => {
      if (this.activeMode === 'better') this.executeBetter();
      else this.executeExpert();
    });

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn btn-secondary';
    closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', () => this.close());

    footer.appendChild(retryBtn);
    footer.appendChild(closeBtn);

    panel.appendChild(body);
    panel.appendChild(footer);
  }

  /* -------------------------------------------------------------
   * BETTER MODE EXECUTION & RENDERING
   * ------------------------------------------------------------- */
  private async executeBetter(): Promise<void> {
    this.renderLoading('Identifying missing technical dimensions…');

    try {
      const response = await BrowserAPI.runtime.sendMessage({
        type: 'REFINZI_GENERATE_BETTER',
        text: this.rawInputText,
        targetAi: this.targetAi,
      });

      if (response && response.success && response.data) {
        this.betterResult = response.data;
        this.renderBetterResult();
      } else {
        throw new Error(response?.error || 'Failed to calibrate prompt');
      }
    } catch (err: any) {
      this.renderError(err?.message || 'Could not calibrate prompt.');
    }
  }

  private renderBetterResult(): void {
    if (!this.betterResult) return;
    const panel = this.getPanelElement();
    if (!panel) return;

    panel.innerHTML = '';
    panel.appendChild(this.renderHeader());

    const body = document.createElement('div');
    body.className = 'panel-body';

    // Rationale
    const reasonEl = document.createElement('div');
    reasonEl.className = 'meta-reason';
    reasonEl.innerHTML = `<span>💡</span> <span>${escapeHTML(this.betterResult.shortReason)}</span>`;
    body.appendChild(reasonEl);

    // Prompt content
    const promptBox = document.createElement('div');
    promptBox.className = 'prompt-box';
    promptBox.textContent = this.betterResult.prompt;
    body.appendChild(promptBox);

    // Footer actions
    const footer = document.createElement('div');
    footer.className = 'panel-footer';

    const left = document.createElement('div');
    left.className = 'footer-left';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn btn-secondary';
    copyBtn.innerHTML = '<span>📋</span> <span>Copy</span>';
    copyBtn.addEventListener('click', () => this.copyToClipboard(this.betterResult!.prompt, copyBtn));

    const undoBtn = document.createElement('button');
    undoBtn.className = 'btn btn-subtle';
    undoBtn.innerHTML = '<span>↩</span> <span>Undo</span>';
    undoBtn.title = 'Restore your original uncalibrated prompt';
    undoBtn.addEventListener('click', () => this.handleUndo());

    left.appendChild(copyBtn);
    left.appendChild(undoBtn);

    const right = document.createElement('div');
    right.className = 'footer-right';

    const applyBtn = document.createElement('button');
    applyBtn.className = 'btn btn-primary';
    applyBtn.innerHTML = '<span>⚡</span> <span>Apply to Composer</span>';
    applyBtn.addEventListener('click', () => this.applyPrompt(this.betterResult!.prompt));

    right.appendChild(applyBtn);

    footer.appendChild(left);
    footer.appendChild(right);

    panel.appendChild(body);
    panel.appendChild(footer);
  }

  /* -------------------------------------------------------------
   * EXPERT MODE EXECUTION & RENDERING (ZERO QUESTIONS)
   * ------------------------------------------------------------- */
  private async executeExpert(): Promise<void> {
    this.renderLoading('Analyzing task & generating autonomous expert specification…');

    try {
      const response = await BrowserAPI.runtime.sendMessage({
        type: 'REFINZI_GENERATE_EXPERT',
        text: this.rawInputText,
        targetAi: this.targetAi,
      });

      if (response && response.success && response.data) {
        this.expertResult = response.data;
        this.renderExpertResult();
      } else {
        throw new Error(response?.error || 'Failed to assemble expert briefing');
      }
    } catch (err: any) {
      this.renderError(err?.message || 'Could not assemble expert briefing.');
    }
  }

  private renderExpertResult(): void {
    if (!this.expertResult) return;
    const panel = this.getPanelElement();
    if (!panel) return;

    panel.innerHTML = '';
    panel.appendChild(this.renderHeader());

    const body = document.createElement('div');
    body.className = 'panel-body';

    // Transparent Assumptions Banner
    if (this.expertResult.assumptions && this.expertResult.assumptions.length > 0) {
      const banner = document.createElement('div');
      banner.className = 'assumptions-banner';

      const title = document.createElement('div');
      title.className = 'assumptions-title';
      title.innerHTML = '<span>📌</span> <span>Built with Defensible Assumptions:</span>';
      banner.appendChild(title);

      const chips = document.createElement('div');
      chips.className = 'assumptions-chips';
      this.expertResult.assumptions.forEach((assump) => {
        const pill = document.createElement('span');
        pill.className = 'assumption-pill';
        pill.textContent = assump;
        chips.appendChild(pill);
      });
      banner.appendChild(chips);
      body.appendChild(banner);
    }

    // Summary
    const summaryEl = document.createElement('div');
    summaryEl.className = 'meta-reason';
    summaryEl.innerHTML = `<span>🎯</span> <strong>${escapeHTML(this.expertResult.summary)}</strong>`;
    body.appendChild(summaryEl);

    // Prompt content
    const promptBox = document.createElement('div');
    promptBox.className = 'prompt-box';
    promptBox.textContent = this.expertResult.prompt;
    body.appendChild(promptBox);

    // Footer actions
    const footer = document.createElement('div');
    footer.className = 'panel-footer';

    const left = document.createElement('div');
    left.className = 'footer-left';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn btn-secondary';
    copyBtn.innerHTML = '<span>📋</span> <span>Copy</span>';
    copyBtn.addEventListener('click', () => this.copyToClipboard(this.expertResult!.prompt, copyBtn));

    const undoBtn = document.createElement('button');
    undoBtn.className = 'btn btn-subtle';
    undoBtn.innerHTML = '<span>↩</span> <span>Undo</span>';
    undoBtn.title = 'Restore your original prompt';
    undoBtn.addEventListener('click', () => this.handleUndo());

    left.appendChild(copyBtn);
    left.appendChild(undoBtn);

    const right = document.createElement('div');
    right.className = 'footer-right';

    const applyBtn = document.createElement('button');
    applyBtn.className = 'btn btn-primary btn-expert';
    applyBtn.innerHTML = '<span>🧠</span> <span>Apply to Composer</span>';
    applyBtn.addEventListener('click', () => this.applyPrompt(this.expertResult!.prompt));

    right.appendChild(applyBtn);

    footer.appendChild(left);
    footer.appendChild(right);

    panel.appendChild(body);
    panel.appendChild(footer);
  }

  /* -------------------------------------------------------------
   * ACTIONS: APPLY, COPY, UNDO
   * ------------------------------------------------------------- */
  private applyPrompt(text: string): void {
    this.callbacks.onApply(text);

    const panel = this.getPanelElement();
    if (!panel) return;

    const body = panel.querySelector('.panel-body');
    if (body) {
      body.innerHTML = `
        <div class="applied-banner">
          <span>✓</span>
          <span>Applied to AI Composer!</span>
        </div>
      `;
    }

    setTimeout(() => this.close(), 600);
  }

  private handleUndo(): void {
    this.callbacks.onUndo();

    const panel = this.getPanelElement();
    if (!panel) return;

    const body = panel.querySelector('.panel-body');
    if (body) {
      body.innerHTML = `
        <div class="applied-banner" style="background: rgba(99, 102, 241, 0.15); border-color: rgba(99, 102, 241, 0.35); color: #A5B4FC;">
          <span>↩</span>
          <span>Original prompt restored!</span>
        </div>
      `;
    }

    setTimeout(() => this.close(), 700);
  }

  private async copyToClipboard(text: string, buttonEl: HTMLButtonElement): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      const original = buttonEl.innerHTML;
      buttonEl.innerHTML = '<span>✓</span> <span>Copied!</span>';
      setTimeout(() => {
        buttonEl.innerHTML = original;
      }, 1500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      buttonEl.innerHTML = '<span>✓</span> <span>Copied!</span>';
    }
  }

  private destroy(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
    this.shadow = null;
  }
}
