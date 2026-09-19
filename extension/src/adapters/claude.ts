/**
 * REFINZI — Claude Site Adapter
 * 
 * Target: https://claude.ai
 * Handles Claude's ProseMirror contenteditable composer and fieldset wrapping.
 */

import { BaseSiteAdapter } from './base';

export class ClaudeAdapter extends BaseSiteAdapter {
  id = 'claude';
  name = 'Claude';

  detect(): boolean {
    if (typeof window === 'undefined' || !window.location) return false;
    const host = window.location.hostname.toLowerCase();
    return host.includes('claude.ai');
  }

  getComposer(): HTMLElement | null {
    const selectors = [
      'div[contenteditable="true"].ProseMirror',
      'fieldset div[contenteditable="true"]',
      'div[contenteditable="true"][data-placeholder*="How can Claude help"]',
      'div[contenteditable="true"][data-placeholder*="Reply to Claude"]',
      'div[contenteditable="true"][data-placeholder*="Reply"]',
      'div.ProseMirror[contenteditable="true"]',
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
      'button[aria-label="Send Message"]',
      'button[aria-label="Send message"]',
      'button[aria-label="Send"]',
      'fieldset button[type="submit"]',
      'button:has(svg[viewBox*="24"])',
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
