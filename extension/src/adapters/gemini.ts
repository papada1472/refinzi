/**
 * REFINZI — Gemini Site Adapter
 * 
 * Target: https://gemini.google.com
 * Handles Google's rich-textarea contenteditable wrapper and Quill-like editors.
 */

import { BaseSiteAdapter } from './base';

export class GeminiAdapter extends BaseSiteAdapter {
  id = 'gemini';
  name = 'Gemini';

  detect(): boolean {
    if (typeof window === 'undefined' || !window.location) return false;
    const host = window.location.hostname.toLowerCase();
    return host.includes('gemini.google.com');
  }

  getComposer(): HTMLElement | null {
    const selectors = [
      'rich-textarea div[contenteditable="true"]',
      'div[contenteditable="true"][aria-label*="Enter a prompt"]',
      'div[contenteditable="true"][aria-label*="Ask Gemini"]',
      'div[contenteditable="true"][aria-label*="prompt"]',
      'div.ql-editor[contenteditable="true"]',
      'rich-textarea [contenteditable="true"]',
      'textarea.textarea',
      'div[contenteditable="true"]',
    ];

    for (const sel of selectors) {
      const el = document.querySelector<HTMLElement>(sel);
      if (el && this.isElementVisible(el)) {
        return el;
      }
    }

    return null;
  }

  getSubmitButton(): HTMLElement | null {
    const selectors = [
      'button[aria-label*="Send prompt"]',
      'button[aria-label*="Send message"]',
      'button[aria-label*="Send"]',
      'button.send-button',
      'button[mattooltip*="Send"]',
    ];

    for (const sel of selectors) {
      const btn = document.querySelector<HTMLElement>(sel);
      if (btn && this.isElementVisible(btn)) {
        return btn;
      }
    }

    return null;
  }

  private isElementVisible(el: HTMLElement): boolean {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }
}
