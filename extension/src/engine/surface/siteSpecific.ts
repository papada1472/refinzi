/**
 * REFINZI — Site-Specific Adapter Surface
 * 
 * Sits ABOVE the universal text engine layer.
 * Adapts specialized platform handlers (ChatGPT, Claude, Gemini, Perplexity)
 * to adhere strictly to the universal TextSurface contract.
 */

import { TextSurface, TextSelectionRange, SurfaceType } from './types';
import { SiteAdapter } from '../../types';

export class SiteSpecificSurface implements TextSurface {
  readonly element: HTMLElement;
  readonly id: string;
  readonly siteName: string;
  readonly surfaceType: SurfaceType = 'site-specific';

  private adapter: SiteAdapter;
  private undoStack: string[] = [];
  private observer: MutationObserver | null = null;

  constructor(adapter: SiteAdapter, composerElement: HTMLElement) {
    this.adapter = adapter;
    this.element = composerElement;
    this.id = `adapter-${adapter.id}`;
    this.siteName = adapter.name || adapter.id;
  }

  detect(): boolean {
    return this.adapter.detect() && this.element.isConnected;
  }

  getValue(): string {
    return this.adapter.getCurrentInput();
  }

  setValue(text: string): boolean {
    const current = this.getValue();
    this.undoStack.push(current);
    if (this.undoStack.length > 20) {
      this.undoStack.shift();
    }

    const success = this.adapter.setComposerValue(text);
    this.focus();
    return success;
  }

  insertText(text: string): boolean {
    const current = this.getValue();
    return this.setValue(current ? `${current} ${text}` : text);
  }

  getSelection(): TextSelectionRange | null {
    if (this.element instanceof HTMLTextAreaElement || this.element instanceof HTMLInputElement) {
      const start = this.element.selectionStart;
      const end = this.element.selectionEnd;
      if (start !== null && end !== null && start < end) {
        const text = this.element.value.substring(start, end);
        if (text.trim().length > 0) {
          return { start, end, text };
        }
      }
    } else {
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
        const text = sel.toString();
        if (text.trim().length > 0) {
          return { start: 0, end: text.length, text };
        }
      }
    }
    return null;
  }

  setSelection(start: number, end: number): void {
    if (this.element instanceof HTMLTextAreaElement || this.element instanceof HTMLInputElement) {
      try {
        this.element.setSelectionRange(start, end);
      } catch {
        // Ignore
      }
    }
  }

  replaceSelection(text: string): boolean {
    const sel = this.getSelection();
    if (!sel) {
      return this.setValue(text);
    }

    if (this.element instanceof HTMLTextAreaElement || this.element instanceof HTMLInputElement) {
      const val = this.element.value;
      const nextVal = val.substring(0, sel.start) + text + val.substring(sel.end);
      return this.setValue(nextVal);
    }

    // For contenteditable composers (ChatGPT ProseMirror, Claude)
    try {
      const inserted = document.execCommand('insertText', false, text);
      if (inserted) return true;
    } catch {
      // Fallback
    }

    return this.setValue(text);
  }

  focus(): void {
    this.adapter.focusComposer();
  }

  supportsUndo(): boolean {
    return true;
  }

  undo(): boolean {
    if (this.undoStack.length === 0) return false;
    const prev = this.undoStack.pop()!;
    return this.adapter.setComposerValue(prev);
  }

  observe(callback: () => void): () => void {
    this.observer = this.adapter.observeComposer(callback);
    return () => {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    };
  }

  cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.adapter.cleanup?.();
    this.undoStack = [];
  }
}
