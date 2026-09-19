/**
 * REFINZI — Rich Text Surface Implementation
 * 
 * Supports common rich text editors:
 * - ProseMirror / Lexical / TipTap
 * - Monaco Editor (<div class="monaco-editor"> / .monaco-mouse-cursor-text)
 * - CodeMirror 5 & 6 (.CodeMirror, .cm-editor, .cm-content)
 * - Slate ([data-slate-editor="true"])
 * - Draft.js (.DraftEditor-root)
 * - Quill (.ql-editor)
 */

import { TextSurface, TextSelectionRange, SurfaceType } from './types';
import { isSafeEditableElement } from './safety';
import { getDestinationName } from './destination';
import { ContentEditableSurface } from './contenteditable';
import { NativeTextSurface } from './native';

export class RichTextSurface implements TextSurface {
  readonly element: HTMLElement;
  readonly id: string;
  readonly siteName: string;
  readonly surfaceType: SurfaceType = 'rich';

  private delegate: TextSurface;

  constructor(element: HTMLElement, destinationSite?: string) {
    this.element = element;
    this.id = `rich-${element.id || element.className.toString().slice(0, 15) || Math.random().toString(36).slice(2, 9)}`;
    this.siteName = destinationSite || getDestinationName();

    // Determine the most effective underlying delegate
    if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
      this.delegate = new NativeTextSurface(element, this.siteName);
    } else {
      // Check if this container contains an embedded input/textarea (like Monaco's hidden textarea)
      const embeddedInput = element.querySelector<HTMLTextAreaElement | HTMLInputElement>(
        'textarea.inputarea, textarea, input'
      );
      if (embeddedInput && isSafeEditableElement(embeddedInput)) {
        this.delegate = new NativeTextSurface(embeddedInput, this.siteName);
      } else {
        this.delegate = new ContentEditableSurface(element, this.siteName);
      }
    }
  }

  detect(): boolean {
    return this.element.isConnected && (isSafeEditableElement(this.element) || this.delegate.detect());
  }

  getValue(): string {
    return this.delegate.getValue();
  }

  setValue(text: string): boolean {
    return this.delegate.setValue(text);
  }

  insertText(text: string): boolean {
    return this.delegate.insertText(text);
  }

  getSelection(): TextSelectionRange | null {
    return this.delegate.getSelection();
  }

  setSelection(start: number, end: number): void {
    this.delegate.setSelection(start, end);
  }

  replaceSelection(text: string): boolean {
    return this.delegate.replaceSelection(text);
  }

  focus(): void {
    this.delegate.focus();
  }

  supportsUndo(): boolean {
    return this.delegate.supportsUndo();
  }

  undo(): boolean {
    return this.delegate.undo();
  }

  observe(callback: () => void): () => void {
    return this.delegate.observe(callback);
  }

  cleanup(): void {
    this.delegate.cleanup();
  }
}
