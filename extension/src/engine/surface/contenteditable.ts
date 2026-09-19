/**
 * REFINZI — ContentEditable Surface Implementation
 * 
 * Supports:
 * - [contenteditable="true"]
 * - [contenteditable="plaintext-only"]
 * - Rich-text engines (ProseMirror, Lexical, TipTap, Quill, Draft.js, Slate)
 * - Safe selection replacement without destroying DOM container integrity
 * - Multi-strategy injection with undo preservation
 */

import { TextSurface, TextSelectionRange, SurfaceType } from './types';
import { isSafeEditableElement } from './safety';
import { getDestinationName } from './destination';

export class ContentEditableSurface implements TextSurface {
  readonly element: HTMLElement;
  readonly id: string;
  readonly siteName: string;
  readonly surfaceType: SurfaceType = 'contenteditable';

  private undoStack: string[] = [];
  private observer: MutationObserver | null = null;
  private unobserveFn: (() => void) | null = null;

  constructor(element: HTMLElement, destinationSite?: string) {
    this.element = element;
    this.id = `ce-${element.id || Math.random().toString(36).slice(2, 9)}`;
    this.siteName = destinationSite || getDestinationName();
  }

  detect(): boolean {
    return this.element.isConnected && isSafeEditableElement(this.element);
  }

  getValue(): string {
    // innerText properly respects line breaks and block elements
    const raw = this.element.innerText ?? this.element.textContent ?? '';
    return raw.trim();
  }

  setValue(text: string): boolean {
    if (!this.detect()) return false;

    // Record snapshot for undo
    this.undoStack.push(this.element.innerHTML);
    if (this.undoStack.length > 20) {
      this.undoStack.shift();
    }

    return this.executeInjection(text);
  }

  insertText(text: string): boolean {
    if (!this.detect()) return false;

    this.undoStack.push(this.element.innerHTML);
    this.element.focus();

    try {
      const inserted = document.execCommand('insertText', false, text);
      if (inserted) {
        this.dispatchEvents();
        return true;
      }
    } catch {
      // Fallback
    }

    // Direct DOM append
    const textNode = document.createTextNode(text);
    this.element.appendChild(textNode);
    this.dispatchEvents();
    return true;
  }

  getSelection(): TextSelectionRange | null {
    try {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        return null;
      }

      const anchor = sel.anchorNode;
      const focus = sel.focusNode;

      // Ensure selection belongs to this editable element
      if (anchor && focus && this.element.contains(anchor) && this.element.contains(focus)) {
        const text = sel.toString();
        if (text.trim().length > 0) {
          return {
            start: 0,
            end: text.length,
            text,
          };
        }
      }
    } catch {
      // Ignore
    }

    return null;
  }

  setSelection(_start: number, _end: number): void {
    try {
      this.element.focus();
      const sel = window.getSelection();
      if (sel) {
        const range = document.createRange();
        range.selectNodeContents(this.element);
        range.collapse(false); // caret at end
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } catch {
      // Ignore
    }
  }

  replaceSelection(text: string): boolean {
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
      const anchor = sel.anchorNode;
      const focus = sel.focusNode;

      if (anchor && focus && this.element.contains(anchor) && this.element.contains(focus)) {
        this.undoStack.push(this.element.innerHTML);

        // Strategy A: Native execCommand replaces the active selection range
        try {
          const inserted = document.execCommand('insertText', false, text);
          if (inserted) {
            this.dispatchEvents();
            return true;
          }
        } catch {
          // Fall through to Strategy B
        }

        // Strategy B: DOM Range replacement
        try {
          const range = sel.getRangeAt(0);
          range.deleteContents();
          const node = document.createTextNode(text);
          range.insertNode(node);

          // Move cursor after the inserted text
          range.setStartAfter(node);
          range.setEndAfter(node);
          sel.removeAllRanges();
          sel.addRange(range);

          this.dispatchEvents();
          return true;
        } catch {
          // Fallback to full replacement
        }
      }
    }

    return this.setValue(text);
  }

  focus(): void {
    try {
      this.element.focus();
    } catch {
      // Ignore
    }
  }

  supportsUndo(): boolean {
    return true;
  }

  undo(): boolean {
    if (this.undoStack.length === 0) return false;

    const previousHTML = this.undoStack.pop()!;
    this.element.innerHTML = previousHTML;
    this.dispatchEvents();
    return true;
  }

  observe(callback: () => void): () => void {
    const onInput = () => callback();
    this.element.addEventListener('input', onInput);

    this.observer = new MutationObserver(() => callback());
    this.observer.observe(this.element, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    const cleanup = () => {
      this.element.removeEventListener('input', onInput);
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    };

    this.unobserveFn = cleanup;
    return cleanup;
  }

  cleanup(): void {
    if (this.unobserveFn) {
      this.unobserveFn();
      this.unobserveFn = null;
    }
    this.undoStack = [];
  }

  private executeInjection(text: string): boolean {
    this.element.focus();

    // Strategy 1: Select all and execCommand('insertText')
    // Best for ProseMirror, Lexical, TipTap because it preserves editor transaction history
    try {
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(this.element);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        document.execCommand('selectAll', false);
      }

      const inserted = document.execCommand('insertText', false, text);
      if (inserted && this.isTextPresent(text)) {
        this.dispatchEvents();
        return true;
      }
    } catch {
      // Fall through to Strategy 2
    }

    // Strategy 2: Synthetic Clipboard Paste with DataTransfer
    try {
      this.element.focus();
      const dt = new DataTransfer();
      dt.setData('text/plain', text);

      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: dt,
        bubbles: true,
        cancelable: true,
      });

      this.element.dispatchEvent(pasteEvent);

      if (this.isTextPresent(text)) {
        this.dispatchEvents();
        return true;
      }
    } catch {
      // Fall through to Strategy 3
    }

    // Strategy 3: Clean paragraph DOM reconstruction with InputEvents
    try {
      this.element.focus();
      while (this.element.firstChild) {
        this.element.removeChild(this.element.firstChild);
      }

      const lines = text.split('\n');
      lines.forEach((line, index) => {
        if (index === 0 && lines.length === 1 && line.trim() !== '') {
          this.element.textContent = line;
        } else {
          const p = document.createElement('p');
          if (line.trim() === '') {
            p.appendChild(document.createElement('br'));
          } else {
            p.textContent = line;
          }
          this.element.appendChild(p);
        }
      });

      this.dispatchEvents();
      return true;
    } catch {
      return false;
    }
  }

  private dispatchEvents(): void {
    const inputEvt = new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
    });
    this.element.dispatchEvent(inputEvt);

    const changeEvt = new Event('change', {
      bubbles: true,
      cancelable: true,
    });
    this.element.dispatchEvent(changeEvt);
  }

  private isTextPresent(expected: string): boolean {
    const current = (this.element.innerText || this.element.textContent || '').trim();
    const normalized = expected.trim();
    if (!normalized) return true;
    return current.includes(normalized.slice(0, Math.min(30, normalized.length)));
  }
}
