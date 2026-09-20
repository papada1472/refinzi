// @vitest-environment jsdom
/**
 * REFINZI — Lazy Orb construction
 *
 * The content script runs in every frame of every http/https page, so the Orb
 * is built on first use rather than at page load. These tests pin both halves of
 * that contract: pages with no editable surface must create nothing, and a
 * trigger fired before any surface activated must STILL work (the original eager
 * code had a `|| !this.orb` bail-out that silently dropped such triggers).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RefinziController } from '../src/ui/controller';
import { BrowserAPI } from '../src/browser/api';
import { __resetStorageLayerForTests } from '../src/utils/storage-batch';

function countOrbHosts(): number {
  return document.querySelectorAll('[data-refinzi-orb-host], .refinzi-orb-host').length;
}

describe('Lazy Orb construction', () => {
  let sendMessage: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    document.body.innerHTML = '';
    __resetStorageLayerForTests();

    vi.spyOn(BrowserAPI.storage.local, 'get').mockImplementation(async (keys: any) => {
      const list = Array.isArray(keys) ? keys : [keys];
      const res: Record<string, any> = {};
      for (const k of list) if (k === 'refinzi_settings') res[k] = { provider: 'local' };
      return res;
    });
    vi.spyOn(BrowserAPI.storage.local, 'set').mockImplementation(async () => {});

    sendMessage = vi.fn(async () => ({ success: false, error: 'no backend in test' }));
    vi.spyOn(BrowserAPI.runtime, 'sendMessage').mockImplementation(sendMessage as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    __resetStorageLayerForTests();
  });

  it('creates no Orb UI when the page has no editable surface', async () => {
    document.body.innerHTML = '<div><p>plain marketing copy, nothing to edit</p></div>';

    const controller = new RefinziController();
    await controller.init();

    // This is the common case across the whole web: zero DOM, zero orb listeners.
    expect(countOrbHosts()).toBe(0);
    controller.destroy();
  });

  it('creates exactly one Orb when a surface activates, and reuses it', async () => {
    document.body.innerHTML = '<textarea id="box"></textarea>';

    const controller = new RefinziController();
    await controller.init();

    const box = document.getElementById('box') as HTMLTextAreaElement;
    box.focus();
    box.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 30));

    const afterFirst = countOrbHosts();
    expect(afterFirst).toBeGreaterThanOrEqual(1);

    // A second activation must not stack a second host.
    box.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    box.focus();
    box.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 30));
    expect(countOrbHosts()).toBe(afterFirst);

    controller.destroy();
  });

  it('still handles a trigger when no surface activated beforehand', async () => {
    // A textarea that is neither focused nor large enough to be auto-discovered
    // at init: the Orb must be built on demand by the trigger itself, because
    // the original eager code carried a `|| !this.orb` guard that silently
    // dropped exactly this case (keyboard shortcut before any focus).
    document.body.innerHTML =
      '<textarea id="box" style="width:0;height:0">write a launch email</textarea>';

    const controller = new RefinziController();
    await controller.init();

    const box = document.getElementById('box') as HTMLTextAreaElement;
    box.focus();

    await (controller as any).handleTrigger('better');
    await new Promise((r) => setTimeout(r, 60));

    // The request reached the background layer rather than being dropped.
    expect(sendMessage).toHaveBeenCalled();
    const message = sendMessage.mock.calls[0][0];
    expect(message.type).toBe('REFINZI_GENERATE_BETTER');
    // And the Orb exists now that the user asked for it.
    expect(countOrbHosts()).toBeGreaterThanOrEqual(1);

    controller.destroy();
  });

  it('destroy() removes the Orb DOM it created', async () => {
    document.body.innerHTML = '<textarea id="box"></textarea>';

    const controller = new RefinziController();
    await controller.init();

    const box = document.getElementById('box') as HTMLTextAreaElement;
    box.focus();
    box.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 30));
    expect(countOrbHosts()).toBeGreaterThanOrEqual(1);

    controller.destroy();
    expect(countOrbHosts()).toBe(0);
  });
});
