/**
 * REFINZI — Site Adapter Registry
 * 
 * Manages optional platform-specific adapters:
 * - ChatGPT
 * - Claude
 * - Gemini
 * - Perplexity
 * - Generic / Dev test adapter
 * 
 * Sits ABOVE the universal text engine layer.
 * A new website does NOT require a new adapter merely for Refinzi to detect its text surface.
 */

import { SiteAdapter } from '../types';
import { ChatGPTAdapter } from './chatgpt';
import { ClaudeAdapter } from './claude';
import { GeminiAdapter } from './gemini';
import { PerplexityAdapter } from './perplexity';
import { BaseSiteAdapter } from './base';

class GenericDevAdapter extends BaseSiteAdapter {
  id = 'generic';
  name = 'Generic / Test';

  detect(): boolean {
    if (typeof window === 'undefined' || !window.location) return true;
    const host = window.location.hostname.toLowerCase();
    return host === 'localhost' || host === '127.0.0.1' || host === '' || window.location.protocol === 'file:';
  }

  getComposer(): HTMLElement | null {
    return document.querySelector<HTMLElement>(
      '#prompt-textarea, [data-refinzi-test-input], textarea, [contenteditable="true"]'
    );
  }

  getSubmitButton(): HTMLElement | null {
    return document.querySelector<HTMLElement>('button[type="submit"], #send-button, button');
  }
}

export class AdapterRegistry {
  private static adapters: BaseSiteAdapter[] = [
    new ChatGPTAdapter(),
    new ClaudeAdapter(),
    new GeminiAdapter(),
    new PerplexityAdapter(),
    new GenericDevAdapter(),
  ];

  static getActiveAdapter(): SiteAdapter | null {
    for (const adapter of this.adapters) {
      if (adapter.detect()) {
        return adapter;
      }
    }
    return null;
  }

  static getAllAdapters(): SiteAdapter[] {
    return [...this.adapters];
  }
}
