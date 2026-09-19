/**
 * REFINZI — Universal Surface Factory
 * 
 * Instantiates the appropriate TextSurface abstraction for any DOM element:
 * NativeTextSurface, ContentEditableSurface, RichTextSurface, or SiteSpecificSurface.
 */

import { TextSurface } from './types';
import { isSafeEditableElement } from './safety';
import { NativeTextSurface } from './native';
import { ContentEditableSurface } from './contenteditable';
import { RichTextSurface } from './rich';
import { SiteSpecificSurface } from './siteSpecific';
import { AdapterRegistry } from '../../adapters/registry';

export class SurfaceFactory {
  /**
   * Creates a TextSurface for the provided element.
   * Returns null if the element is not safe, not editable, or excluded.
   */
  static createSurface(element: HTMLElement | null): TextSurface | null {
    if (!element || !isSafeEditableElement(element)) {
      return null;
    }

    // 1. Check if an active AI site adapter (ChatGPT, Claude, Gemini, Perplexity) claims this element
    try {
      const activeAdapter = AdapterRegistry.getActiveAdapter();
      if (activeAdapter && activeAdapter.id !== 'generic') {
        const composer = activeAdapter.getComposer();
        if (composer && (composer === element || composer.contains(element) || element.contains(composer))) {
          return new SiteSpecificSurface(activeAdapter, composer);
        }
      }
    } catch {
      // If adapter registry encounters an issue, proceed cleanly to generic surfaces
    }

    // 2. Check for specialized rich editors
    const isRichEditor =
      element.classList.contains('ProseMirror') ||
      element.classList.contains('cm-content') ||
      element.classList.contains('ql-editor') ||
      element.hasAttribute('data-slate-editor') ||
      element.hasAttribute('data-lexical-editor') ||
      element.closest('.monaco-editor, .cm-editor, .DraftEditor-root') !== null;

    if (isRichEditor) {
      return new RichTextSurface(element);
    }

    // 3. Native <textarea> and <input>
    if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
      return new NativeTextSurface(element);
    }

    // 4. ContentEditable surfaces
    if (
      element.isContentEditable ||
      element.getAttribute('contenteditable') === 'true' ||
      element.getAttribute('contenteditable') === 'plaintext-only' ||
      element.getAttribute('contenteditable') === '' ||
      element.getAttribute('role') === 'textbox'
    ) {
      return new ContentEditableSurface(element);
    }

    return null;
  }
}
