/**
 * REFINZI — Universal Text Surface Safety Exclusions
 * 
 * Strict boundary enforcement:
 * Refinzi NEVER attaches to or processes sensitive inputs:
 * - Passwords, secret keys, OTPs, PINs
 * - Credit card numbers, CVVs, transaction amounts
 * - Hidden, disabled, readonly, or non-textual input types
 * - Refinzi's own internal UI host containers
 */

const EXCLUDED_INPUT_TYPES = new Set([
  'password',
  'hidden',
  'file',
  'checkbox',
  'radio',
  'submit',
  'button',
  'reset',
  'image',
  'color',
  'range',
  'date',
  'datetime-local',
  'month',
  'time',
  'week',
]);

const ALLOWED_INPUT_TYPES = new Set([
  'text',
  'search',
  'email',
  'url',
  'tel',
  '', // empty defaults to text in HTML5
]);

const SENSITIVE_AUTOCOMPLETE_PATTERN =
  /\b(current-password|new-password|one-time-code|cc-number|cc-csc|cc-exp|cc-exp-month|cc-exp-year|cc-type|transaction-amount)\b/i;

const SENSITIVE_KEYWORD_PATTERN =
  /(?:^|[^a-zA-Z0-9])(?:password|passwd|secret|token|otp|2fa|cvv|cvc|card[-_]?number|credit[-_]?card|ssn|pin)(?:[^a-zA-Z0-9]|$)/i;

/**
 * Validates whether an element is a safe, eligible editable text surface.
 * Returns true ONLY if the element is safe and editable.
 */
export function isSafeEditableElement(el: unknown): el is HTMLElement {
  if (!el || typeof el !== 'object' || !(el instanceof HTMLElement)) {
    return false;
  }

  // 1. Never activate inside Refinzi's own UI containers or shadow roots
  if (
    el.hasAttribute('data-refinzi-orb-host') ||
    el.closest('[data-refinzi-orb-host], .refinzi-orb-host, .undo-toast') ||
    el.classList.contains('refinzi-orb') ||
    el.classList.contains('refinzi-orb-host')
  ) {
    return false;
  }

  // 2. Element must be connected to the DOM
  if (el.isConnected === false) {
    return false;
  }

  // 3. Inspect HTMLInputElement
  if (el instanceof HTMLInputElement) {
    const rawType = (el.type || 'text').toLowerCase().trim();

    // Check excluded types (password, hidden, file, etc.)
    if (EXCLUDED_INPUT_TYPES.has(rawType) || !ALLOWED_INPUT_TYPES.has(rawType)) {
      return false;
    }

    // Exclude disabled or readonly
    if (el.disabled || el.readOnly || el.hasAttribute('disabled') || el.hasAttribute('readonly')) {
      return false;
    }

    // Exclude sensitive autocomplete (passwords, 2FA, credit cards)
    const autocomplete = el.autocomplete || el.getAttribute('autocomplete') || '';
    if (SENSITIVE_AUTOCOMPLETE_PATTERN.test(autocomplete)) {
      return false;
    }

    // Exclude sensitive names, IDs, placeholders, or aria labels
    const identifierString = [
      el.id,
      el.name,
      el.placeholder,
      el.getAttribute('aria-label') || '',
      el.getAttribute('data-field-type') || '',
    ].join(' ');

    if (SENSITIVE_KEYWORD_PATTERN.test(identifierString)) {
      return false;
    }

    return true;
  }

  // 4. Inspect HTMLTextAreaElement
  if (el instanceof HTMLTextAreaElement) {
    // Exclude disabled or readonly
    if (el.disabled || el.readOnly || el.hasAttribute('disabled') || el.hasAttribute('readonly')) {
      return false;
    }

    const autocomplete = el.autocomplete || el.getAttribute('autocomplete') || '';
    if (SENSITIVE_AUTOCOMPLETE_PATTERN.test(autocomplete)) {
      return false;
    }

    const identifierString = [
      el.id,
      el.name,
      el.placeholder,
      el.getAttribute('aria-label') || '',
    ].join(' ');

    if (SENSITIVE_KEYWORD_PATTERN.test(identifierString)) {
      return false;
    }

    return true;
  }

  // 5. Inspect ContentEditable elements & Rich Text Editors
  const isContentEditable =
    el.isContentEditable ||
    el.getAttribute('contenteditable') === 'true' ||
    el.getAttribute('contenteditable') === 'plaintext-only' ||
    el.getAttribute('contenteditable') === '';

  const isRoleTextbox = el.getAttribute('role') === 'textbox';

  const isRichEditor =
    el.classList.contains('ProseMirror') ||
    el.classList.contains('cm-content') ||
    el.classList.contains('ql-editor') ||
    el.hasAttribute('data-slate-editor') ||
    el.hasAttribute('data-lexical-editor') ||
    el.classList.contains('monaco-editor');

  if (isContentEditable || isRoleTextbox || isRichEditor) {
    // Exclude disabled or aria-readonly
    if (
      el.getAttribute('aria-readonly') === 'true' ||
      el.getAttribute('contenteditable') === 'false' ||
      el.getAttribute('aria-disabled') === 'true'
    ) {
      return false;
    }

    // Ensure it's not nested inside a sensitive container
    const parentContainer = el.closest('[data-sensitive="true"], form[action*="login"], form[action*="auth"]');
    if (parentContainer) {
      const containerText = parentContainer.id + ' ' + parentContainer.className;
      if (SENSITIVE_KEYWORD_PATTERN.test(containerText)) {
        return false;
      }
    }

    return true;
  }

  return false;
}
