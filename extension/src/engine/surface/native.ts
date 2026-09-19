/**
 * REFINZI — Native Text Surface Implementation
 * 
 * Supports:
 * - HTMLTextAreaElement (<textarea>)
 * - HTMLInputElement (<input type="text|search|email|url|tel">)
 * - React / Vue / Angular controlled inputs (uses prototype property descriptor setters)
 * - Native selection detection and partial selection replacement
 * - In-place Undo restoration stack
 */

import { TextSurface, TextSelectionRange, SurfaceType } from './types';
import { isSafeEditableElement } from './safety';
import { getDestinationName } from './destination';

export class NativeTextSurface implements TextSurface {
  readonly element: HTMLTextAreaElement | HTMLInputElement;
  readonly id: string;
  readonly siteName: string;
  readonly surfaceType: SurfaceType = 'native';

  private undoStack: string[] = [];
  private savedSelection: { start: number; end: number } | null = null;
  private unobserveFn: (() => void) | null = null;

  constructor(element: HTMLTextAreaElement | HTMLInputElement, destinationSite?: string) {
    this.element = element;
    this.id = `native-${element.id || element.name || Math.random().toString(36).slice(2, 9)}`;
    this.siteName = destinationSite || getDestinationName();
  }

  detect(): boolean {
    return this.element.isConnected && isSafeEditableElement(this.element);
  }

  getValue(): string {
    return this.element.value || '';
  }

  setValue(text: string): boolean {
    if (!this.detect()) return false;

    // Record state for undo before overwriting
    this.undoStack.push(this.getValue());
    if (this.undoStack.length > 20) {
      this.undoStack.shift();
    }

    this.applyValue(text);

    // Reposition caret to the end
    try {
      this.element.selectionStart = text.length;
      this.element.selectionEnd = text.length;
    } catch {
      // Ignore if browser restricts selection bounds on specific input types
    }

    return true;
  }

  insertText(text: string): boolean {
    if (!this.detect()) return false;

    const currentVal = this.getValue();
    const start = this.element.selectionStart ?? currentVal.length;
    const end = this.element.selectionEnd ?? currentVal.length;

    const nextVal = currentVal.substring(0, start) + text + currentVal.substring(end);
    this.undoStack.push(currentVal);

    this.applyValue(nextVal);

    try {
      const nextPos = start + text.length;
      this.element.selectionStart = nextPos;
      this.element.selectionEnd = nextPos;
    } catch {
      // Ignore
    }

    return true;
  }

  getSelection(): TextSelectionRange | null {
    try {
      const start = this.element.selectionStart;
      const end = this.element.selectionEnd;

      if (start !== null && end !== null && start < end) {
        const text = this.element.value.substring(start, end);
        if (text.trim().length > 0) {
          this.savedSelection = { start, end };
          return { start, end, text };
        }
      }
    } catch {
      // Ignore
    }

    return null;
  }

  setSelection(start: number, end: number): void {
    try {
      this.element.focus();
      this.element.setSelectionRange(start, end);
      this.savedSelection = { start, end };
    } catch {
      // Ignore
    }
  }

  replaceSelection(text: string): boolean {
    const selection = this.getSelection();
    if (!selection) {
      return this.setValue(text);
    }

    const currentVal = this.getValue();
    this.undoStack.push(currentVal);

    const nextVal =
      currentVal.substring(0, selection.start) + text + currentVal.substring(selection.end);

    this.applyValue(nextVal);

    try {
      // Position caret right after replacement or highlight new text
      const newEnd = selection.start + text.length;
      this.element.selectionStart = newEnd;
      this.element.selectionEnd = newEnd;
    } catch {
      // Ignore
    }

    return true;
  }

  focus(): void {
    try {
      this.element.focus();
    } catch {
      // Ignore
    }
  }

  restoreSelection(): void {
    if (this.savedSelection) {
      this.setSelection(this.savedSelection.start, this.savedSelection.end);
    }
  }

  supportsUndo(): boolean {
    return true;
  }

  undo(): boolean {
    if (this.undoStack.length === 0) return false;

    const previousValue = this.undoStack.pop()!;
    this.applyValue(previousValue);

    try {
      this.element.selectionStart = previousValue.length;
      this.element.selectionEnd = previousValue.length;
    } catch {
      // Ignore
    }

    return true;
  }

  observe(callback: () => void): () => void {
    const onInput = () => callback();
    const onChange = () => callback();

    this.element.addEventListener('input', onInput);
    this.element.addEventListener('change', onChange);

    const cleanup = () => {
      this.element.removeEventListener('input', onInput);
      this.element.removeEventListener('change', onChange);
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
    this.savedSelection = null;
  }

  /**
   * Safe value assignment for React / Vue / Angular controlled inputs.
   * Directly calling element.value = newValue does not trigger framework state updates
   * because modern frameworks override the prototype property setter.
   */
  private applyValue(value: string): void {
    this.element.focus();

    // Strategy 1: Attempt document.execCommand to record into the browser's native Undo stack (Ctrl+Z)
    let execSucceeded = false;
    try {
      this.element.select();
      execSucceeded = document.execCommand('insertText', false, value);
    } catch {
      execSucceeded = false;
    }

    // Strategy 2: If execCommand failed or didn't set full text, use framework descriptor setter
    if (!execSucceeded || this.element.value !== value) {
      const proto =
        this.element instanceof HTMLTextAreaElement
          ? window.HTMLTextAreaElement.prototype
          : window.HTMLInputElement.prototype;

      const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
      if (descriptor?.set) {
        descriptor.set.call(this.element, value);
      } else {
        this.element.value = value;
      }
    }

    // Dispatch standard framework-recognized input and change events
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
}
