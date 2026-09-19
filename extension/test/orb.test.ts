// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AmbientOrb } from '../src/ui/orb';

describe('Refinzi Ambient Orb Component & State Machine', () => {
  let orb: AmbientOrb;
  let composer: HTMLDivElement;
  let onBetterMock: ReturnType<typeof vi.fn>;
  let onExpertMock: ReturnType<typeof vi.fn>;

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
    composer = document.createElement('div');
    composer.setAttribute('contenteditable', 'true');
    composer.getBoundingClientRect = () => ({
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
    document.body.appendChild(composer);

    onBetterMock = vi.fn();
    onExpertMock = vi.fn();
    orb = new AmbientOrb({
      onBetter: onBetterMock,
      onExpert: onExpertMock,
    }, 350);
  });

  afterEach(() => {
    orb?.destroy();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('attaches to the DOM docked near composer', () => {
    orb.attach(composer);
    const host = document.querySelector('[data-refinzi-orb-host="true"]');
    expect(host).not.toBeNull();

    const orbEl = host?.shadowRoot?.querySelector('.refinzi-orb');
    expect(orbEl).not.toBeNull();
  });

  it('triggers Better Prompt on short click (< 350ms)', () => {
    orb.attach(composer);
    const host = document.querySelector('[data-refinzi-orb-host="true"]');
    const orbEl = host?.shadowRoot?.querySelector('.refinzi-orb') as HTMLElement;

    orbEl.dispatchEvent(createPointerEvent('pointerdown', { button: 0, bubbles: true }));
    expect(orbEl.classList.contains('holding')).toBe(true);

    orbEl.dispatchEvent(createPointerEvent('pointerup', { button: 0, bubbles: true }));

    expect(onBetterMock).toHaveBeenCalledTimes(1);
    expect(onExpertMock).not.toHaveBeenCalled();
  });

  it('triggers Expert Prompt on hold (>= 350ms)', () => {
    vi.useFakeTimers();
    orb.attach(composer);
    const host = document.querySelector('[data-refinzi-orb-host="true"]');
    const orbEl = host?.shadowRoot?.querySelector('.refinzi-orb') as HTMLElement;

    orbEl.dispatchEvent(createPointerEvent('pointerdown', { button: 0, bubbles: true }));
    vi.advanceTimersByTime(400);

    expect(orbEl.classList.contains('expert-ready')).toBe(true);

    orbEl.dispatchEvent(createPointerEvent('pointerup', { button: 0, bubbles: true }));

    expect(onExpertMock).toHaveBeenCalledTimes(1);
    expect(onBetterMock).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('safely resets on pointercancel without triggering Better or Expert', () => {
    orb.attach(composer);
    const host = document.querySelector('[data-refinzi-orb-host="true"]');
    const orbEl = host?.shadowRoot?.querySelector('.refinzi-orb') as HTMLElement;

    orbEl.dispatchEvent(createPointerEvent('pointerdown', { button: 0, bubbles: true }));
    expect(orbEl.classList.contains('holding')).toBe(true);

    orbEl.dispatchEvent(createPointerEvent('pointercancel', { bubbles: true }));
    expect(orbEl.classList.contains('holding')).toBe(false);

    expect(onBetterMock).not.toHaveBeenCalled();
    expect(onExpertMock).not.toHaveBeenCalled();
  });

  it('allows repositioning the orb via dragging without firing Better or Expert', () => {
    orb.attach(composer);
    const host = document.querySelector('[data-refinzi-orb-host="true"]') as HTMLElement;
    const orbEl = host?.shadowRoot?.querySelector('.refinzi-orb') as HTMLElement;

    // Pointer down
    orbEl.dispatchEvent(createPointerEvent('pointerdown', { button: 0, bubbles: true, clientX: 100, clientY: 100 }));

    // Drag move > 6px
    orbEl.dispatchEvent(createPointerEvent('pointermove', { bubbles: true, clientX: 250, clientY: 300 }));
    expect(orbEl.classList.contains('dragging')).toBe(true);
    expect(host.style.position).toBe('fixed');

    // Pointer up after drag
    orbEl.dispatchEvent(createPointerEvent('pointerup', { button: 0, bubbles: true, clientX: 250, clientY: 300 }));
    expect(orbEl.classList.contains('dragging')).toBe(false);

    expect(onBetterMock).not.toHaveBeenCalled();
    expect(onExpertMock).not.toHaveBeenCalled();
  });

  it('triggers Better on Enter keyboard shortcut', () => {
    orb.attach(composer);
    const host = document.querySelector('[data-refinzi-orb-host="true"]');
    const orbEl = host?.shadowRoot?.querySelector('.refinzi-orb') as HTMLElement;

    orbEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(onBetterMock).toHaveBeenCalledTimes(1);
  });

  it('triggers Expert on "e" keyboard shortcut', () => {
    orb.attach(composer);
    const host = document.querySelector('[data-refinzi-orb-host="true"]');
    const orbEl = host?.shadowRoot?.querySelector('.refinzi-orb') as HTMLElement;

    orbEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'e', bubbles: true }));
    expect(onExpertMock).toHaveBeenCalledTimes(1);
  });

  it('cleans up window event listeners on destroy', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    orb.attach(composer);
    orb.destroy();

    expect(removeSpy).toHaveBeenCalledWith('blur', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    removeSpy.mockRestore();
  });

  it('ignores duplicate trigger calls within the cooldown window', () => {
    orb.attach(composer);
    const host = document.querySelector('[data-refinzi-orb-host="true"]');
    const orbEl = host?.shadowRoot?.querySelector('.refinzi-orb') as HTMLElement;

    // Rapid double click (< 400ms)
    orbEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    orbEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    // Should only trigger once
    expect(onBetterMock).toHaveBeenCalledTimes(1);
  });
});
