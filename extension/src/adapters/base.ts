/**
 * REFINZI — Base Site Adapter
 * 
 * Abstract base class providing common extraction, injection,
 * and DOM observation helpers for AI web platforms.
 */

import { SiteAdapter } from '../types';
import { injectPrompt } from '../utils/inject';

export abstract class BaseSiteAdapter implements SiteAdapter {
  abstract id: string;
  abstract name: string;

  abstract detect(): boolean;
  abstract getComposer(): HTMLElement | null;

  getCurrentInput(): string {
    const composer = this.getComposer();
    if (!composer) return '';

    if (composer.isContentEditable || composer.getAttribute('contenteditable') === 'true') {
      // ContentEditable ProseMirror / rich text
      return (composer.innerText || composer.textContent || '').trim();
    }

    if (composer instanceof HTMLTextAreaElement || composer instanceof HTMLInputElement) {
      return (composer.value || '').trim();
    }

    // Check children
    const child = composer.querySelector<HTMLTextAreaElement | HTMLInputElement>('textarea, input');
    if (child) return (child.value || '').trim();

    return (composer.textContent || '').trim();
  }

  setComposerValue(text: string): boolean {
    const composer = this.getComposer();
    if (!composer) return false;
    return injectPrompt(composer, text);
  }

  focusComposer(): void {
    const composer = this.getComposer();
    if (composer) {
      composer.focus();
    }
  }

  observeComposer(callback: () => void): MutationObserver | null {
    if (typeof MutationObserver === 'undefined') return null;

    let debounceTimer: number | null = null;
    const debouncedCallback = () => {
      if (debounceTimer) window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(callback, 200);
    };

    const observer = new MutationObserver((mutations) => {
      // Check if relevant DOM elements changed
      let hasRelevantChange = false;
      for (const m of mutations) {
        if (m.type === 'childList' && (m.addedNodes.length > 0 || m.removedNodes.length > 0)) {
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
        subtree: true,
      });
      return observer;
    } catch {
      return null;
    }
  }

  abstract getSubmitButton(): HTMLElement | null;

  supportsApply(): boolean {
    return this.getComposer() !== null;
  }

  cleanup(): void {
    // Override in subclass if needed
  }
}
