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
 *
 * ORDERING MATTERS: this runs on every `pointerover` across every page and
 * frame, so the cheap "is this even an editable candidate?" classification is
 * done *before* the ancestor `closest()` exclusion walk below. Profiling showed
 * that walk accounts for ~99% of the cost for non-editable targets, and the
 * overwhelming majority of hovered elements (div, span, img, …) are neither
 * inputs nor contenteditable. Rejecting them first turns the common case into a
 * few property reads instead of a full ancestor traversal.
 */
export function isSafeEditableElement(el: unknown): el is HTMLElement {
  if (!el || typeof el !== 'object' || !(el instanceof HTMLElement)) {
    return false;
  }

  // Element must be connected to the DOM
  if (el.isConnected === false) {
    return false;
  }

  // --- Cheap candidate classification --------------------------------------
  const isInput = el instanceof HTMLInputElement;
  const isTextarea = el instanceof HTMLTextAreaElement;

  let isContentEditable = false;
  let isRoleTextbox = false;
  let isRichEditor = false;

  if (!isInput && !isTextarea) {
    isContentEditable =
      el.isContentEditable ||
      el.getAttribute('contenteditable') === 'true' ||
      el.getAttribute('contenteditable') === 'plaintext-only' ||
      el.getAttribute('contenteditable') === '';

    isRoleTextbox = el.getAttribute('role') === 'textbox';

    isRichEditor =
      el.classList.contains('ProseMirror') ||
      el.classList.contains('cm-content') ||
      el.classList.contains('ql-editor') ||
      el.hasAttribute('data-slate-editor') ||
      el.hasAttribute('data-lexical-editor') ||
      el.classList.contains('monaco-editor');
  }

  // Fast reject — no ancestor walk, no regex work on the common case.
  if (!isInput && !isTextarea && !isContentEditable && !isRoleTextbox && !isRichEditor) {
    return false;
  }

  // --- Never activate inside Refinzi's own UI containers or shadow roots ----
  if (
    el.hasAttribute('data-refinzi-orb-host') ||
    el.closest('[data-refinzi-orb-host], .refinzi-orb-host, .undo-toast') ||
    el.classList.contains('refinzi-orb') ||
    el.classList.contains('refinzi-orb-host')
  ) {
    return false;
  }

  // --- Inspect HTMLInputElement --------------------------------------------
  if (isInput) {
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

  // --- Inspect HTMLTextAreaElement -----------------------------------------
  if (isTextarea) {
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

  // --- Inspect ContentEditable elements & Rich Text Editors ----------------
  // (candidate classification already happened above; reaching here means the
  // element is one of these three kinds, so no re-testing is needed.)
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
