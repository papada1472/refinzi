// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RefinziController } from '../src/ui/controller';
import { BrowserAPI } from '../src/browser/api';

describe('Refinzi Controller — Grammarly-Style In-Place Calibration', () => {
  let controller: RefinziController;
  let textarea: HTMLTextAreaElement;

  const createPointerEvent = (type: string, init: any = {}) => {
    try {
      return new PointerEvent(type, init);
    } catch {
      const event = new MouseEvent(type, init) as any;
      event.pointerId = 1;
      event.button = init.button ?? 0;
      event.clientX = init.clientX ?? 0;
      event.clientY = init.clientY ?? 0;
      return event;
    }
  };

  beforeEach(() => {
    document.body.innerHTML = '';

    // Create a mock AI composer textarea on the page
    textarea = document.createElement('textarea');
    textarea.id = 'prompt-textarea';
    textarea.value = 'cool sports car in desert sunset';
    textarea.getBoundingClientRect = () => ({
      top: 100,
      left: 100,
      right: 500,
      bottom: 200,
      width: 400,
      height: 100,
      x: 100,
      y: 100,
      toJSON: () => {},
    });
    document.body.appendChild(textarea);

    // Mock background service worker message handling
    vi.spyOn(BrowserAPI.runtime, 'sendMessage').mockImplementation(async (msg: any) => {
      if (msg.type === 'REFINZI_GENERATE_BETTER') {
        return {
          success: true,
          data: {
            mode: 'better',
            prompt: 'Ultra-wide low-angle cinematic shot of a sleek high-performance sports car driving through the Mojave desert at golden hour, 24mm anamorphic lens.',
            domain: 'image_gen',
            shortReason: 'Calibrated visual optics',
          },
        };
      }
      if (msg.type === 'REFINZI_GENERATE_EXPERT') {
        return {
          success: true,
          data: {
            mode: 'expert',
            prompt: '# ROLE & PERSPECTIVE\nMaster Automotive Cinematographer\n\n# CORE OBJECTIVE\nPhotorealistic sports car desert capture.',
            domain: 'image_gen',
            assumptions: ['Golden Hour Lighting', 'Mojave Desert'],
          },
        };
      }
      return { success: false };
    });

    controller = new RefinziController();
  });

  afterEach(() => {
    controller?.destroy();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('automatically replaces vague prompt in-place on Better trigger without modal', async () => {
    await controller.init();

    // Verify Orb is mounted
    const host = document.querySelector('[data-refinzi-orb-host="true"]');
    expect(host).not.toBeNull();

    const orbEl = host?.shadowRoot?.querySelector('.refinzi-orb') as HTMLElement;
    expect(orbEl).not.toBeNull();

    // Trigger Better via click (< 350ms)
    orbEl.dispatchEvent(createPointerEvent('pointerdown', { button: 0, bubbles: true }));
    orbEl.dispatchEvent(createPointerEvent('pointerup', { button: 0, bubbles: true }));

    // Wait for microtask/async replacement
    await new Promise((r) => setTimeout(r, 60));

    // Verifies AUTOMATIC in-place replacement directly in composer!
    expect(textarea.value).toContain('Ultra-wide low-angle cinematic shot');
    expect(textarea.value).toContain('24mm anamorphic lens');

    // Verifies floating Undo toast exists
    const toast = host?.shadowRoot?.querySelector('.undo-toast');
    expect(toast).not.toBeNull();
    expect(toast?.textContent).toContain('Calibrated');
  });

  it('restores original vague prompt when Undo is clicked', async () => {
    await controller.init();

    const host = document.querySelector('[data-refinzi-orb-host="true"]');
    const orbEl = host?.shadowRoot?.querySelector('.refinzi-orb') as HTMLElement;

    // Trigger Better
    orbEl.dispatchEvent(createPointerEvent('pointerdown', { button: 0, bubbles: true }));
    orbEl.dispatchEvent(createPointerEvent('pointerup', { button: 0, bubbles: true }));
    await new Promise((r) => setTimeout(r, 60));

    expect(textarea.value).toContain('Ultra-wide low-angle');

    // Click [↩ Undo] button in floating toast
    const undoBtn = host?.shadowRoot?.querySelector('#rfz-undo-btn') as HTMLButtonElement;
    expect(undoBtn).not.toBeNull();
    undoBtn.click();

    // Verifies original prompt is restored in the composer!
    expect(textarea.value).toBe('cool sports car in desert sunset');
  });

  it('deduplicates rapid triggers: sends only ONE background message and performs ONE replacement', async () => {
    await controller.init();

    const host = document.querySelector('[data-refinzi-orb-host="true"]');
    const orbEl = host?.shadowRoot?.querySelector('.refinzi-orb') as HTMLElement;

    const sendSpy = vi.spyOn(BrowserAPI.runtime, 'sendMessage');

    // Rapid double trigger within cooldown
    orbEl.dispatchEvent(createPointerEvent('pointerdown', { button: 0, bubbles: true }));
    orbEl.dispatchEvent(createPointerEvent('pointerup', { button: 0, bubbles: true }));

    orbEl.dispatchEvent(createPointerEvent('pointerdown', { button: 0, bubbles: true }));
    orbEl.dispatchEvent(createPointerEvent('pointerup', { button: 0, bubbles: true }));

    await new Promise((r) => setTimeout(r, 60));

    // Must be called exactly ONCE despite rapid double trigger
    expect(sendSpy).toHaveBeenCalledTimes(1);
  });

  it('restores original prompt when Ctrl+Z keyboard shortcut is pressed', async () => {
    await controller.init();

    const host = document.querySelector('[data-refinzi-orb-host="true"]');
    const orbEl = host?.shadowRoot?.querySelector('.refinzi-orb') as HTMLElement;

    // Trigger Better
    orbEl.dispatchEvent(createPointerEvent('pointerdown', { button: 0, bubbles: true }));
    orbEl.dispatchEvent(createPointerEvent('pointerup', { button: 0, bubbles: true }));
    await new Promise((r) => setTimeout(r, 60));

    expect(textarea.value).toContain('Ultra-wide low-angle');

    // Press Ctrl+Z keyboard shortcut
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      })
    );

    // Verifies original prompt is restored via Ctrl+Z!
    expect(textarea.value).toBe('cool sports car in desert sunset');
  });

  it('seamlessly falls back to local in-page calibration when extension context is invalidated', async () => {
    await controller.init();

    const host = document.querySelector('[data-refinzi-orb-host="true"]');
    const orbEl = host?.shadowRoot?.querySelector('.refinzi-orb') as HTMLElement;

    // Simulate Extension context invalidated error from Chrome
    vi.spyOn(BrowserAPI.runtime, 'sendMessage').mockRejectedValueOnce(
      new Error('Extension context invalidated.')
    );

    // Trigger Expert mode
    orbEl.dispatchEvent(createPointerEvent('pointerdown', { button: 0, bubbles: true }));
    // Hold beyond threshold
    await new Promise((r) => setTimeout(r, 360));
    orbEl.dispatchEvent(createPointerEvent('pointerup', { button: 0, bubbles: true }));

    await new Promise((r) => setTimeout(r, 60));

    // Verifies local fallback calibration successfully executed and replaced in-place!
    expect(textarea.value.length).toBeGreaterThan(50);
    expect(textarea.value).not.toBe('cool sports car in desert sunset');
  });

  it('detects and calibrates text selected from an AI output on the page into the composer', async () => {
    // Simulate an AI response block on the page
    const aiOutputDiv = document.createElement('div');
    aiOutputDiv.className = 'markdown prose';
    aiOutputDiv.textContent = 'Here is the generated marketing campaign analysis for Q3.';
    document.body.appendChild(aiOutputDiv);

    // Empty composer awaiting next prompt
    textarea.value = '';

    // Mock window.getSelection() selecting text from the AI output
    const mockSelection = {
      isCollapsed: false,
      rangeCount: 1,
      toString: () => 'Here is the generated marketing campaign analysis for Q3.',
    };
    vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

    await controller.init();

    const host = document.querySelector('[data-refinzi-orb-host="true"]');
    const orbEl = host?.shadowRoot?.querySelector('.refinzi-orb') as HTMLElement;

    orbEl.dispatchEvent(createPointerEvent('pointerdown', { button: 0, bubbles: true }));
    orbEl.dispatchEvent(createPointerEvent('pointerup', { button: 0, bubbles: true }));

    await new Promise((r) => setTimeout(r, 60));

    // Verifies the composer now contains the calibrated prompt derived from the AI output!
    expect(textarea.value).toContain('Ultra-wide low-angle');
  });

  it('presents clean instant calibration without scary error alerts on default install fallback', async () => {
    await controller.init();

    // Simulate default unconfigured gateway fallback
    vi.spyOn(BrowserAPI.runtime, 'sendMessage').mockResolvedValueOnce({
      success: true,
      data: {
        mode: 'better',
        prompt: 'Calibrated instruction ready for AI',
        domain: 'general',
        shortReason: 'Instant local calibration applied',
        isFallback: true,
        providerFailure: {
          provider: 'gateway',
          reason: 'Gateway server temporarily unavailable',
          status: 503,
          code: 'SERVER_ERROR',
          isDefaultFallback: true,
        },
      },
    });

    const host = document.querySelector('[data-refinzi-orb-host="true"]');
    const orbEl = host?.shadowRoot?.querySelector('.refinzi-orb') as HTMLElement;

    orbEl.dispatchEvent(createPointerEvent('pointerdown', { button: 0, bubbles: true }));
    orbEl.dispatchEvent(createPointerEvent('pointerup', { button: 0, bubbles: true }));
    await new Promise((r) => setTimeout(r, 60));

    expect(textarea.value).toBe('Calibrated instruction ready for AI');

    // Verify no scary error banner was shown
    const shadow = host?.shadowRoot;
    const toast = shadow?.querySelector('.validation-toast');
    expect(toast).toBeTruthy();
    const toastText = toast?.textContent || '';
    expect(toastText).not.toContain('Gateway server temporarily unavailable');
    expect(toastText).toContain('Instant local calibration applied');
  });
});

