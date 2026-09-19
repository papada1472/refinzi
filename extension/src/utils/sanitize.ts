/**
 * REFINZI — Security & Sanitization Utilities
 * Prevents HTML injection, XSS, and unsafe model output evaluation.
 */

/**
 * Escapes raw strings for safe rendering in HTML contexts
 */
export function escapeHTML(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Creates an element with safe text content (no innerHTML parsing)
 */
export function createSafeElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  className?: string,
  textContent?: string
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tagName);
  if (className) {
    el.className = className;
  }
  if (textContent !== undefined && textContent !== null) {
    el.textContent = textContent;
  }
  return el;
}

/**
 * Safe text setter that prevents innerHTML injection
 */
export function setSafeText(element: HTMLElement, text: string): void {
  element.textContent = text;
}
