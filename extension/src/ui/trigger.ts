/**
 * REFINZI — Inline Trigger Component
 * Docked near the active AI composer without obstructing controls.
 */

export class InlineTrigger {
  private container: HTMLElement | null = null;
  private shadow: ShadowRoot | null = null;
  private triggerBtn: HTMLElement | null = null;
  private onClickHandler: () => void;

  constructor(onClick: () => void) {
    this.onClickHandler = onClick;
  }

  attach(composer: HTMLElement): void {
    if (this.container && document.body.contains(this.container)) {
      this.updatePosition(composer);
      return;
    }

    // Remove any orphaned trigger instances
    this.destroy();

    this.container = document.createElement('div');
    this.container.setAttribute('data-refinzi-trigger-host', 'true');
    this.container.style.position = 'absolute';
    this.container.style.zIndex = '9999';
    this.container.style.pointerEvents = 'none';

    this.shadow = this.container.attachShadow({ mode: 'open' });

    // Inject styles
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .rfz-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 9px;
        background: #18191E;
        color: #F1F5F9;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 6px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        pointer-events: auto;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
        transition: all 0.15s ease;
        user-select: none;
      }
      .rfz-pill:hover {
        background: #23252C;
        border-color: rgba(99, 102, 241, 0.5);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45);
      }
      .rfz-sparkle {
        color: #818CF8;
        font-size: 12px;
      }
    `;
    this.shadow.appendChild(styleEl);

    // Create trigger button
    const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    const modKey = isMac ? '⌘' : 'Ctrl';

    this.triggerBtn = document.createElement('button');
    this.triggerBtn.className = 'rfz-pill';
    this.triggerBtn.title = `Refinzi: ⚡ Better (${modKey}+Shift+B) | 🧠 Expert (${modKey}+Shift+E)`;
    this.triggerBtn.setAttribute('data-tooltip', `Refinzi: ⚡ Better (${modKey}+Shift+B) · 🧠 Expert (${modKey}+Shift+E)`);
    this.triggerBtn.setAttribute('aria-label', `Refinzi prompt assistant: Click for Better (${modKey}+Shift+B), Hold for Expert (${modKey}+Shift+E)`);
    this.triggerBtn.innerHTML = '<span class="rfz-sparkle">✨</span> <span>Refinzi</span>';
    this.triggerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onClickHandler();
    });

    this.shadow.appendChild(this.triggerBtn);
    document.body.appendChild(this.container);

    this.updatePosition(composer);
  }

  updatePosition(composer: HTMLElement): void {
    if (!this.container || !composer) return;

    const rect = composer.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      this.container.style.display = 'none';
      return;
    }

    this.container.style.display = 'block';

    // Position above or near top-right of composer
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    // Dock subtly at top-right above the composer
    const top = rect.top + scrollY - 32;
    const left = rect.right + scrollX - 90;

    this.container.style.top = `${Math.max(8, top)}px`;
    this.container.style.left = `${Math.max(8, left)}px`;
  }

  hide(): void {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  show(): void {
    if (this.container) {
      this.container.style.display = 'block';
    }
  }

  destroy(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
    this.shadow = null;
    this.triggerBtn = null;
  }
}
