/**
 * REFINZI — Perplexity Site Adapter
 * 
 * Target: https://www.perplexity.ai & https://perplexity.ai
 * Handles Perplexity's query textareas and follow-up inputs.
 */

import { BaseSiteAdapter } from './base';

export class PerplexityAdapter extends BaseSiteAdapter {
  id = 'perplexity';
  name = 'Perplexity';

  detect(): boolean {
    if (typeof window === 'undefined' || !window.location) return false;
    const host = window.location.hostname.toLowerCase();
    return host.includes('perplexity.ai');
  }

  getComposer(): HTMLElement | null {
    const selectors = [
      'textarea[placeholder*="Ask anything"]',
      'textarea[placeholder*="Ask a question"]',
      'textarea[placeholder*="Ask follow-up"]',
      'textarea[placeholder*="Ask"]',
      'div[contenteditable="true"][data-placeholder*="Ask"]',
      'textarea[rows="1"]',
      'form textarea',
      'textarea',
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
      'button[aria-label*="Submit"]',
      'button[aria-label*="Send"]',
      'button[aria-label*="Ask"]',
      'form button[type="submit"]',
      'button:has(svg)',
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
