/**
 * REFINZI — Text Injection Engine
 * 
 * Production-grade replacement of AI composer content.
 * Handles ProseMirror (ChatGPT, Claude), Lexical, Draft.js, and standard textareas/inputs.
 * Preserves Unicode, emojis, multiline indentation, and undo stacks.
 */

export function injectPrompt(target: HTMLElement, text: string): boolean {
  if (!target) return false;

  try {
    // 1. Ensure target element is focused and active
    target.focus();

    const isContentEditable = target.isContentEditable || target.getAttribute('contenteditable') === 'true';

    if (isContentEditable) {
      return injectIntoContentEditable(target, text);
    } else if (target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement) {
      return injectIntoInput(target, text);
    } else {
      // Fallback for custom shadow/nested elements
      const editableChild = target.querySelector<HTMLElement>('[contenteditable="true"], textarea, input');
      if (editableChild) {
        return injectPrompt(editableChild, text);
      }
      return false;
    }
  } catch (err) {
    console.error('[Refinzi] Text injection failed:', err);
    return false;
  }
}

function injectIntoContentEditable(el: HTMLElement, text: string): boolean {
  el.focus();

  // Strategy 1: document.execCommand('selectAll') + insertText
  // Best for ProseMirror (ChatGPT, Claude) because it simulates direct native typing
  // and preserves the editor's internal transaction/history state.
  try {
    const selection = window.getSelection();
    if (selection) {
      const range = document.createRange();
      range.selectNodeContents(el);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      document.execCommand('selectAll', false);
    }

    const inserted = document.execCommand('insertText', false, text);
    if (inserted && isTextPresent(el, text)) {
      dispatchInputEvents(el);
      return true;
    }
  } catch {
    // Fall through to Strategy 2
  }

  // Strategy 2: Synthetic Clipboard Paste simulation with DataTransfer
  try {
    el.focus();
    const dt = new DataTransfer();
    dt.setData('text/plain', text);

    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: dt,
      bubbles: true,
      cancelable: true,
    });

    el.dispatchEvent(pasteEvent);

    if (isTextPresent(el, text)) {
      dispatchInputEvents(el);
      return true;
    }
  } catch {
    // Fall through to Strategy 3
  }

  // Strategy 3: Direct textContent / innerText injection with synthetic InputEvent
  try {
    el.focus();
    
    // Clear children cleanly
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }

    // Split text by lines to construct paragraphs or line breaks for contenteditable
    const lines = text.split('\n');
    lines.forEach((line, index) => {
      const p = document.createElement('p');
      if (line.trim() === '') {
        p.appendChild(document.createElement('br'));
      } else {
        p.textContent = line;
      }
      el.appendChild(p);
      if (index === 0 && lines.length === 1 && line.trim() !== '') {
        // Simple single line replacement
        el.textContent = line;
      }
    });

    dispatchInputEvents(el);
    return true;
  } catch {
    return false;
  }
}

function injectIntoInput(target: HTMLTextAreaElement | HTMLInputElement, text: string): boolean {
  target.focus();

  // React and modern frameworks override the prototype value setter
  const proto = target instanceof HTMLTextAreaElement
    ? window.HTMLTextAreaElement.prototype
    : window.HTMLInputElement.prototype;
  
  const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
  if (descriptor?.set) {
    descriptor.set.call(target, text);
  } else {
    target.value = text;
  }

  // Dispatch both InputEvent and standard Event
  dispatchInputEvents(target);

  // Reposition caret to the end
  try {
    target.selectionStart = target.value.length;
    target.selectionEnd = target.value.length;
  } catch {
    // Ignore selection bounds if unsupported
  }

  return true;
}

function dispatchInputEvents(element: HTMLElement): void {
  const inputEvt = new InputEvent('input', {
    bubbles: true,
    cancelable: true,
    inputType: 'insertText',
  });
  element.dispatchEvent(inputEvt);

  const changeEvt = new Event('change', {
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(changeEvt);
}

function isTextPresent(el: HTMLElement, expected: string): boolean {
  const current = (el.innerText || el.textContent || '').trim();
  const normalizedExpected = expected.trim();
  if (!normalizedExpected) return true;
  return current.includes(normalizedExpected.slice(0, Math.min(30, normalizedExpected.length)));
}
