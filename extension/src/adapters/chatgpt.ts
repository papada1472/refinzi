/**
 * REFINZI — ChatGPT Site Adapter
 * 
 * Target: https://chatgpt.com & https://chat.openai.com
 * Handles ProseMirror contenteditable editor and textarea variations.
 */

import { BaseSiteAdapter } from './base';

export class ChatGPTAdapter extends BaseSiteAdapter {
  id = 'chatgpt';
  name = 'ChatGPT';

  detect(): boolean {
    if (typeof window === 'undefined' || !window.location) return false;
    const host = window.location.hostname.toLowerCase();
    return host.includes('chatgpt.com') || host.includes('chat.openai.com');
  }

  getComposer(): HTMLElement | null {
    // Multi-selector cascade to withstand OpenAI DOM updates
    const selectors = [
      '#prompt-textarea',
      'div[id="prompt-textarea"][contenteditable="true"]',
      'div[contenteditable="true"].ProseMirror',
      'textarea[data-id="root"]',
      'form textarea[tabindex="0"]',
      'div[data-placeholder*="Ask anything"]',
      'div[data-placeholder*="Message ChatGPT"]',
      'form [contenteditable="true"]',
      'textarea#prompt-textarea',
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
      'button[data-testid="send-button"]',
      'button[aria-label="Send prompt"]',
      'button[aria-label="Send message"]',
      'button[data-testid="fruitjuice-send-button"]',
      'form button[type="submit"]',
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
