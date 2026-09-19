/**
 * REFINZI — Universal Text Surface Types & Contracts
 * 
 * The root abstraction of Refinzi:
 * BROWSER → EDITABLE TEXT SURFACE → REFINZI
 * 
 * AI websites are merely optional adapters sitting above this layer.
 */

export interface TextSelectionRange {
  start: number;
  end: number;
  text: string;
}

export type SurfaceType = 'native' | 'contenteditable' | 'rich' | 'site-specific';

export interface TextSurface {
  /** The underlying HTML DOM element of the editable surface */
  readonly element: HTMLElement;

  /** Stable identifier for the surface */
  readonly id: string;

  /** Clean human-readable destination/site name (e.g. "Gmail", "LinkedIn", "ChatGPT", "general") */
  readonly siteName: string;

  /** Categorized surface type */
  readonly surfaceType: SurfaceType;

  /** Checks if the surface is currently valid, attached to the DOM, and editable */
  detect(): boolean;

  /** Retrieves the full text value from the surface */
  getValue(): string;

  /**
   * Sets the full text value of the surface.
   * Preserves React/Vue/Angular controlled states and rich-text transactions.
   */
  setValue(text: string): boolean;

  /** Inserts text at the current caret position or appends if no caret */
  insertText(text: string): boolean;

  /** Retrieves active text selection inside this surface, or null if no selection */
  getSelection(): TextSelectionRange | null;

  /** Sets the selection range (caret or text span) */
  setSelection(start: number, end: number): void;

  /**
   * Replaces only the currently selected text.
   * If no text is selected, replaces the full content according to editor semantics.
   */
  replaceSelection(text: string): boolean;

  /** Focuses the editable surface */
  focus(): void;

  /** Restores saved selection if available */
  restoreSelection?(): void;

  /** Checks if the surface supports in-place undo */
  supportsUndo(): boolean;

  /** Restores the exact previous content before the last replacement */
  undo(): boolean;

  /** Observes text and DOM mutations inside the surface */
  observe(callback: () => void): () => void;

  /** Cleans up observers and listeners */
  cleanup(): void;
}
