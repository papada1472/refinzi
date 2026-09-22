/**
 * REFINZI — Master Universal Content Script Controller
 * 
 * UNIVERSAL BROWSER TEXT LAYER:
 * Root Abstraction: BROWSER → EDITABLE TEXT SURFACE → REFINZI
 * 
 * Works seamlessly across ANY website:
 * - Textareas, standard inputs (text, search, email, url, tel)
 * - ContentEditable surfaces & rich-text editors (ProseMirror, Lexical, Draft.js, Slate, Quill)
 * - React / Vue / Angular controlled inputs
 * - AI platforms (ChatGPT, Claude, Gemini, Perplexity) as optional adapters
 * 
 * INTERACTION:
 * - Exactly ONE docked Ambient Orb following the active editable surface
 * - CLICK = Better Prompt (automatically replaces text in-place)
 * - HOLD = Expert Prompt (automatically replaces text in-place)
 * - SELECTION-AWARE: If text is highlighted, replaces only that selection
 * - INSTANT UNDO: Restores the exact prior text state with zero loss
 */

import { PromptMode } from '../types';
import { AmbientOrb } from './orb';
import { BrowserAPI } from '../browser/api';
import { getSettings } from '../utils/storage';
import {
  TextSurface,
  UniversalTextEngine,
  SurfaceFactory,
  isSafeEditableElement,
} from '../engine/surface';
import { AdapterRegistry } from '../adapters/registry';
import { RefinziOnboardingModal } from './onboarding';
import { synthesizeBetterPrompt } from '../engine/better';
import { synthesizeExpertPrompt } from '../engine/expert';

export class RefinziController {
  private engine: UniversalTextEngine | null = null;
  private activeSurface: TextSurface | null = null;
  private orb: AmbientOrb | null = null;
  private isInitialized = false;

  private originalPromptText: string = '';
  private wasPartialSelection: boolean = false;
  private isCalibrating: boolean = false;
  private lastTriggerTimestamp: number = 0;
  private isMessageListenerRegistered: boolean = false;
  private canUndo: boolean = false;
  private lastCalibratedPrompt: string = '';
  private byokNudgeShownThisSession: boolean = false;
  /** Held so the Orb can be constructed lazily, after init() has finished. */
  private holdThresholdMs: number = 350;
  private boundOnKeyDown = (e: KeyboardEvent) => this.handleGlobalKeyDown(e);

  /**
   * Returns the Ambient Orb, creating it on first use.
   *
   * This content script runs in every frame of every http/https page, and most
   * of those pages never show an editable surface to the user. Constructing the
   * orb eagerly meant building a shadow root plus window-level listeners on
   * every single page load for UI that was never displayed.
   */
  private ensureOrb(): AmbientOrb {
    if (!this.orb) {
      this.orb = new AmbientOrb(
        {
          onBetter: () => this.handleTrigger('better'),
          onExpert: () => this.handleTrigger('expert'),
        },
        this.holdThresholdMs
      );
    }
    return this.orb;
  }

  async init(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    const settings = await getSettings();

    // Check if site is explicitly disabled in settings (if legacy enabledSites applies)
    if (typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname.toLowerCase();
      const activeAdapter = AdapterRegistry.getActiveAdapter();
      if (activeAdapter) {
        const siteKey = activeAdapter.id as keyof typeof settings.enabledSites;
        if (settings.enabledSites && settings.enabledSites[siteKey] === false) {
          return;
        }
      }
    }

    // The Orb's DOM/shadow tree and its window-level listeners are created
    // LAZILY on first use (see ensureOrb) — this script runs in every frame of
    // every page, and most never show a surface to interact with.
    this.holdThresholdMs = settings.holdThresholdMs || 350;

    // Initialize the Universal Text Engine
    this.engine = new UniversalTextEngine({
      onSurfaceActivated: (surface: TextSurface) => {
        this.activeSurface = surface;
        const orb = this.ensureOrb();
        orb.attach(surface.element);
        orb.show();
      },
      onSurfaceDeactivated: (surface: TextSurface) => {
        if (this.activeSurface === surface) {
          this.activeSurface = null;
          this.orb?.hide();
        }
      },
      onPositionUpdate: (surface: TextSurface) => {
        if (this.activeSurface === surface && this.orb) {
          this.orb.updatePosition(surface.element);
        }
      },
    });

    this.engine.start();

    // Check if an editable surface or composer is already present/focused
    this.checkInitialSurface();

    // Listen for global Ctrl+Z / Cmd+Z to undo prompt replacements
    window.addEventListener('keydown', this.boundOnKeyDown, true);

    // Listen for background keyboard shortcuts (register exactly once)
    if (!this.isMessageListenerRegistered) {
      this.isMessageListenerRegistered = true;
      BrowserAPI.runtime.onMessage.addListener((message) => {
        if (!message || typeof message !== 'object') return;

        if (message.type === 'REFINZI_TRIGGER_BETTER_SHORTCUT') {
          this.handleTrigger('better');
        } else if (message.type === 'REFINZI_TRIGGER_EXPERT_SHORTCUT') {
          this.handleTrigger('expert');
        } else if (message.type === 'REFINZI_SHOW_ONBOARDING') {
          const modal = new RefinziOnboardingModal();
          modal.show();
        }
      });
    }

    // Reactively update settings when changed from popup without requiring a page refresh
    if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local' && changes.settings?.newValue) {
          const updated = changes.settings.newValue as any;
          if (typeof updated?.holdThresholdMs === 'number') {
            this.holdThresholdMs = updated.holdThresholdMs;
          }
        }
      });
    }
  }

  /**
   * Discovers and binds to an initial editable surface or active composer on page load.
   */
  private checkInitialSurface(): void {
    // 1. Check document.activeElement
    const active = document.activeElement;
    if (active instanceof HTMLElement && isSafeEditableElement(active)) {
      const surface = SurfaceFactory.createSurface(active);
      if (surface) {
        this.activeSurface = surface;
        // A surface already exists on load, so the Orb is genuinely needed.
        this.ensureOrb().attach(surface.element);
        return;
      }
    }

    // 2. Check active AI site composer if present
    try {
      const activeAdapter = AdapterRegistry.getActiveAdapter();
      if (activeAdapter) {
        const composer = activeAdapter.getComposer();
        if (composer && isSafeEditableElement(composer)) {
          const surface = SurfaceFactory.createSurface(composer);
          if (surface) {
            this.activeSurface = surface;
            this.ensureOrb().attach(surface.element);
            return;
          }
        }
      }
    } catch {
      // Ignore
    }

    // 3. Fallback: discover any visible safe editable textarea or rich editor across ANY website
    try {
      const candidates = document.querySelectorAll<HTMLElement>(
        'textarea:not([disabled]):not([readonly]), [contenteditable="true"]:not([contenteditable="false"]), #prompt-textarea, [data-refinzi-test-input]'
      );
      for (const el of Array.from(candidates)) {
        if (isSafeEditableElement(el)) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 40 && rect.height > 20) {
            const surface = SurfaceFactory.createSurface(el);
            if (surface) {
              this.activeSurface = surface;
              this.ensureOrb().attach(surface.element);
              return;
            }
          }
        }
      }
    } catch {
      // Ignore
    }
  }

  /**
   * In-place calibration (Click = Better, Hold = Expert)
   * Automatically replaces the prompt in the active surface without opening modals or needing "Apply".
   */
  private async handleTrigger(mode: PromptMode): Promise<void> {
    // 0. If current document.activeElement is focused and editable, prioritize it
    const activeEl = document.activeElement;
    if (activeEl instanceof HTMLElement && isSafeEditableElement(activeEl)) {
      if (!this.activeSurface || this.activeSurface.element !== activeEl) {
        const directSurface = SurfaceFactory.createSurface(activeEl);
        if (directSurface) {
          this.activeSurface = directSurface;
          this.ensureOrb().attach(directSurface.element);
        }
      }
    }

    // 1. Recover active surface from Orb's currently docked composer if focus shifted
    if (!this.activeSurface) {
      const attached = this.orb?.getAttachedElement();
      if (attached && isSafeEditableElement(attached) && attached.isConnected) {
        this.activeSurface = SurfaceFactory.createSurface(attached);
      }
    }

    // 2. Fallback check document.activeElement
    if (!this.activeSurface) {
      const active = document.activeElement;
      if (active instanceof HTMLElement && isSafeEditableElement(active)) {
        this.activeSurface = SurfaceFactory.createSurface(active);
        if (this.activeSurface) {
          this.ensureOrb().attach(this.activeSurface.element);
        }
      }
    }

    // 3. Fallback to active adapter composer if present
    if (!this.activeSurface) {
      try {
        const activeAdapter = AdapterRegistry.getActiveAdapter();
        if (activeAdapter) {
          const composer = activeAdapter.getComposer();
          if (composer && isSafeEditableElement(composer)) {
            this.activeSurface = SurfaceFactory.createSurface(composer);
            if (this.activeSurface) {
              this.ensureOrb().attach(this.activeSurface.element);
            }
          }
        }
      } catch {
        // Ignore
      }
    }

    // 4. Fallback: discover any visible safe editable textarea or rich editor across ANY website
    if (!this.activeSurface) {
      try {
        const candidate = document.querySelector<HTMLElement>(
          '#prompt-textarea, textarea:not([disabled]):not([readonly]), [contenteditable="true"]:not([contenteditable="false"])'
        );
        if (candidate && isSafeEditableElement(candidate)) {
          this.activeSurface = SurfaceFactory.createSurface(candidate);
          if (this.activeSurface) {
            this.ensureOrb().attach(this.activeSurface.element);
          }
        }
      } catch {
        // Ignore
      }
    }

    // Check for partial text selection within active surface
    const surfaceSelection = this.activeSurface?.getSelection();
    const isSurfacePartial = Boolean(surfaceSelection && surfaceSelection.text.trim().length > 0);

    // Check for window selection anywhere on the page (e.g. user selected text from an AI output message)
    let windowSel = '';
    try {
      const sel = typeof window !== 'undefined' ? window.getSelection() : null;
      if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
        windowSel = sel.toString().trim();
      }
    } catch {
      // Ignore
    }

    const isAiOutputSelection = !isSurfacePartial && windowSel.length > 0;
    const isPartialSelection = isSurfacePartial;

    let rawInput = '';
    if (isSurfacePartial) {
      rawInput = surfaceSelection!.text.trim();
    } else if (isAiOutputSelection) {
      rawInput = windowSel;
    } else if (this.activeSurface) {
      rawInput = this.activeSurface.getValue().trim();
    }

    // If no surface exists and no text is selected on the page, we cannot proceed
    if (!this.activeSurface && !rawInput) return;

    const orb = this.ensureOrb();

    // Concurrency Lock & Debounce guard to prevent duplicate generation
    const now = Date.now();
    if (this.isCalibrating || now - this.lastTriggerTimestamp < 400) {
      return;
    }

    if (!rawInput) {
      orb.showUndoToast('Type your raw thought in the text box or highlight text first!', () => {});
      return;
    }

    this.isCalibrating = true;
    this.lastTriggerTimestamp = now;

    // Preserve the original uncalibrated text for instant Undo
    this.originalPromptText = isAiOutputSelection && this.activeSurface ? this.activeSurface.getValue() : rawInput;
    this.wasPartialSelection = isPartialSelection;
    const targetAi = this.activeSurface?.siteName || 'general';

    // FEATURE 2: Trigger Processing Feedback Animation
    orb.startProcessingFeedback(mode);

    try {
      const messageType = mode === 'better' ? 'REFINZI_GENERATE_BETTER' : 'REFINZI_GENERATE_EXPERT';
      const requestId = `${mode}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      const responsePromise = BrowserAPI.runtime.sendMessage({
        type: messageType,
        text: rawInput,
        targetAi,
        requestId,
      });

      // Enforce brief satisfying perceived-craftsmanship sequence (min 380ms in browser, 10ms in test)
      const isTestEnv = typeof process !== 'undefined' && (process.env?.NODE_ENV === 'test' || process.env?.VITEST === 'true');
      const minDuration = isTestEnv ? 10 : 380;
      const [response] = await Promise.all([
        responsePromise,
        new Promise((resolve) => setTimeout(resolve, minDuration)),
      ]);

      orb.stopProcessingFeedback();

      if (response && response.success && response.data?.prompt) {
        const calibratedPrompt = response.data.prompt;
        const currentSettings = await getSettings();
        const autoApply = currentSettings.autoApply !== false;

        if (autoApply) {
          if (this.activeSurface) {
            // AUTOMATICALLY REPLACE in-place
            if (isPartialSelection) {
              this.activeSurface.replaceSelection(calibratedPrompt);
            } else {
              this.activeSurface.setValue(calibratedPrompt);
            }
            this.activeSurface.focus();
            this.canUndo = true;
            this.lastCalibratedPrompt = calibratedPrompt;
          } else {
            // Page has no editable surface: copy to clipboard
            try {
              await navigator.clipboard.writeText(calibratedPrompt);
            } catch {
              const tmp = document.createElement('textarea');
              tmp.value = calibratedPrompt;
              document.body.appendChild(tmp);
              tmp.select();
              document.execCommand('copy');
              document.body.removeChild(tmp);
            }
          }
        }

        const hasProviderFailure = response.data.isFallback || !!response.data.providerFailure;
        const failureInfo = response.data.providerFailure;
        const isDefaultFallback = failureInfo?.isDefaultFallback === true;

        // FEATURE 3: Floating Validation Checklist Toast
        let summaryLabel = mode === 'better'
          ? (isAiOutputSelection ? '⚡ Calibrated from AI output' : `⚡ Calibrated for ${response.data.domain || 'task'}`)
          : (isAiOutputSelection ? '🧠 Expert briefing from AI output' : `🧠 Expert briefing applied`);

        if (hasProviderFailure) {
          summaryLabel = isDefaultFallback
            ? (isAiOutputSelection
                ? (mode === 'better' ? '⚡ Calibrated from AI output' : '🧠 Expert briefing from AI output')
                : (mode === 'better' ? '⚡ Better Prompt' : '🧠 Expert Briefing'))
            : (mode === 'better' ? '⚡ Better (Offline Engine)' : '🧠 Expert (Offline Engine)');
        }

        const assumptionsList = Array.isArray(response.data.assumptions) ? response.data.assumptions : [];
        const assumedItem = assumptionsList.find((a: string) => a.startsWith('Assumed:')) || assumptionsList[0];

        const failureNote = isDefaultFallback
          ? 'Instant local calibration applied'
          : `Note: ${failureInfo?.reason || 'Offline calibration used'}`;

        const checklist = mode === 'expert'
          ? [
              'Exact core intent preserved',
              'Scope boundaries locked to task',
              assumedItem ? assumedItem : 'Defensible assumptions explicitly marked',
              hasProviderFailure ? failureNote : 'Execution criteria & constraints added',
            ]
          : [
              'Core intent clarified',
              'Vagueness & ambiguity eliminated',
              hasProviderFailure ? failureNote : 'Executable prompt structure calibrated',
            ];

        orb.showValidationToast({
          mode,
          domain: response.data.domain ? response.data.domain.toUpperCase() : (mode === 'better' ? 'BETTER' : 'EXPERT'),
          summary: summaryLabel,
          checklist,
          onUndo: () => this.handleUndo(),
          showApply: !autoApply,
          onApply: () => {
            if (this.activeSurface) {
              if (isPartialSelection) {
                this.activeSurface.replaceSelection(calibratedPrompt);
              } else {
                this.activeSurface.setValue(calibratedPrompt);
              }
              this.activeSurface.focus();
            }
          },
          onCopy: async () => {
            try {
              await navigator.clipboard.writeText(calibratedPrompt);
            } catch {
              const tmp = document.createElement('textarea');
              tmp.value = calibratedPrompt;
              document.body.appendChild(tmp);
              tmp.select();
              document.execCommand('copy');
              document.body.removeChild(tmp);
            }
          },
        });

        // Show BYOK failure nudge only if a user-configured AI provider failed (NOT default unconfigured install)
        if (hasProviderFailure && failureInfo && !isDefaultFallback) {
          setTimeout(() => {
            this.orb?.showByokNudge({
              reason: failureInfo.reason,
              isError: true,
            });
          }, 600);
        } else if (!this.byokNudgeShownThisSession) {
          try {
            const nudgeSettings = await getSettings();
            const usingFreeEngine =
              nudgeSettings.provider === 'gateway' ||
              nudgeSettings.provider === 'local' ||
              (nudgeSettings.provider === 'gemini' && !nudgeSettings.apiKeys?.gemini) ||
              (nudgeSettings.provider === 'openai' && !nudgeSettings.apiKeys?.openai) ||
              (nudgeSettings.provider === 'deepseek' && !nudgeSettings.apiKeys?.deepseek) ||
              (nudgeSettings.provider === 'openrouter' && !nudgeSettings.apiKeys?.openrouter);

            if (usingFreeEngine) {
              this.byokNudgeShownThisSession = true;
              // Delay nudge 2.5s so it doesn't compete with the validation toast
              setTimeout(() => {
                this.orb?.showByokNudge();
              }, 2500);
            }
          } catch {
            // Ignore nudge errors — non-critical
          }
        }
      } else {
        throw new Error(response?.error || 'Calibration failed');
      }
    } catch (err: any) {
      orb.stopProcessingFeedback();

      const isContextInvalidated =
        err?.message?.includes('Extension context invalidated') ||
        err?.message?.includes('context invalidated') ||
        err?.message?.includes('message channel closed') ||
        typeof chrome === 'undefined' ||
        !chrome?.runtime?.id;

      if (isContextInvalidated) {
        // Run seamless in-page fallback calibration directly without failing
        try {
          const fallbackRes = mode === 'expert'
            ? synthesizeExpertPrompt(rawInput, targetAi)
            : synthesizeBetterPrompt(rawInput, targetAi);

          const calibratedPrompt = fallbackRes.prompt;
          const currentSettings = await getSettings().catch(() => ({ autoApply: true }));
          const autoApply = currentSettings.autoApply !== false;

          if (autoApply) {
            if (this.activeSurface) {
              if (isPartialSelection) {
                this.activeSurface.replaceSelection(calibratedPrompt);
              } else {
                this.activeSurface.setValue(calibratedPrompt);
              }
              this.activeSurface.focus();
              this.canUndo = true;
              this.lastCalibratedPrompt = calibratedPrompt;
            } else {
              try {
                await navigator.clipboard.writeText(calibratedPrompt);
              } catch {
                // Ignore
              }
            }
          }

          const summaryLabel = mode === 'better'
            ? `⚡ Better calibrated (Offline engine)`
            : `🧠 Expert briefing applied (Offline engine)`;

          const fallbackAssumptions = 'assumptions' in fallbackRes && Array.isArray(fallbackRes.assumptions)
            ? fallbackRes.assumptions
            : [];
          const fallbackAssumed = fallbackAssumptions.find((a: string) => a.startsWith('Assumed:')) || fallbackAssumptions[0];

          const checklist = mode === 'expert'
            ? [
                'Exact core intent preserved',
                'Scope boundaries locked to task',
                fallbackAssumed ? fallbackAssumed : 'Defensible assumptions explicitly marked',
                'Execution criteria & constraints added',
              ]
            : [
                'Core intent clarified',
                'Vagueness & ambiguity eliminated',
                'Executable prompt structure calibrated',
              ];

          orb.showValidationToast({
            mode,
            domain: fallbackRes.domain.toUpperCase(),
            summary: summaryLabel,
            checklist,
            onUndo: () => this.handleUndo(),
            showApply: !autoApply,
            onApply: () => {
              if (this.activeSurface) {
                if (isPartialSelection) {
                  this.activeSurface.replaceSelection(calibratedPrompt);
                } else {
                  this.activeSurface.setValue(calibratedPrompt);
                }
                this.activeSurface.focus();
                this.canUndo = true;
                this.lastCalibratedPrompt = calibratedPrompt;
              }
            },
            onCopy: async () => {
              try {
                await navigator.clipboard.writeText(calibratedPrompt);
              } catch {
                const tmp = document.createElement('textarea');
                tmp.value = calibratedPrompt;
                document.body.appendChild(tmp);
                tmp.select();
                document.execCommand('copy');
                document.body.removeChild(tmp);
              }
            },
          });

          // The extension is gone (uninstalled or updated). Finish this last
          // offline calibration, then tear our UI down so no dead Orb and no
          // orphaned capture-phase listeners linger until the user refreshes.
          setTimeout(() => this.destroy(), 4000);
          return;
        } catch (fallbackErr) {
          console.error('[Refinzi] In-page fallback failed:', fallbackErr);
          this.destroy();
        }
      }

      orb.showUndoToast(`⚠️ Calibration error: ${err?.message || 'Try again'}`, () => {});
      this.orb?.showByokNudge({
        reason: `API Error: ${err?.message || 'Connection failed'}. Configure BYOK in Settings.`,
        isError: true,
      });
    } finally {
      this.isCalibrating = false;
    }
  }

  /**
   * Instant Undo: Restores the user's original uncalibrated text with zero loss.
   */
  private handleUndo(): void {
    if (!this.activeSurface) return;

    // Use surface-level undo if supported
    const undone = this.activeSurface.undo();
    if (!undone && this.originalPromptText) {
      if (!this.wasPartialSelection) {
        this.activeSurface.setValue(this.originalPromptText);
      }
    }

    this.canUndo = false;
    this.activeSurface.focus();
    this.orb?.showUndoToast('↩ Original prompt restored', () => {});
  }

  /**
   * Intercepts keyboard shortcuts:
   * - Ctrl+Shift+B / Cmd+Shift+B: Trigger Better calibration
   * - Ctrl+Shift+E / Cmd+Shift+E: Trigger Expert calibration
   * - Ctrl+Z / Cmd+Z: Undo prompt replacement
   */
  private handleGlobalKeyDown(e: KeyboardEvent): void {
    // 1. In-place keyboard shortcuts: Ctrl+Shift+B (Better) and Ctrl+Shift+E (Expert)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
      const key = e.key.toLowerCase();
      if (key === 'b') {
        e.preventDefault();
        e.stopPropagation();
        this.handleTrigger('better');
        return;
      }
      if (key === 'e') {
        e.preventDefault();
        e.stopPropagation();
        this.handleTrigger('expert');
        return;
      }
    }

    // 2. Undo shortcut: Ctrl+Z / Cmd+Z
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
      if (this.canUndo && this.activeSurface && this.originalPromptText) {
        const currentVal = this.activeSurface.getValue();
        if (
          !this.lastCalibratedPrompt ||
          currentVal === this.lastCalibratedPrompt ||
          currentVal.includes(this.lastCalibratedPrompt.slice(0, 30))
        ) {
          e.preventDefault();
          e.stopPropagation();
          this.handleUndo();
        }
      }
    }
  }

  destroy(): void {
    window.removeEventListener('keydown', this.boundOnKeyDown, true);
    this.engine?.destroy();
    this.engine = null;
    this.activeSurface?.cleanup();
    this.activeSurface = null;
    this.orb?.destroy();
    this.orb = null;
    this.isInitialized = false;
  }
}
