// @vitest-environment jsdom
/**
 * REFINZI — Storage batch & snapshot cache
 *
 * Guards the write-coalescing and read-caching layer. These tests exist because
 * a typo in a storage KEY constant (a value typed as a literal placeholder rather
 * than the real key) passed typecheck and produced DEFAULTS on every read —
 * silently losing user settings. Key names are therefore asserted explicitly.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserAPI } from '../src/browser/api';
import {
  runInBatch,
  stageWrite,
  readSnapshot,
  primeSnapshot,
  invalidateSnapshot,
  __resetStorageLayerForTests,
} from '../src/utils/storage-batch';
import { getSettings, saveSettings, getHistory, addHistoryItem, getStats } from '../src/utils/storage';
import { recordUsageEvent, getUsageEvents, clearUsageEvents } from '../src/utils/metrics';

describe('Storage batch & snapshot cache', () => {
  let store: Record<string, any>;
  let getCalls: string[][];
  let setCalls: number;

  beforeEach(() => {
    store = {};
    getCalls = [];
    setCalls = 0;
    __resetStorageLayerForTests();

    vi.spyOn(BrowserAPI.storage.local, 'get').mockImplementation(async (keys: any) => {
      const list = Array.isArray(keys) ? keys : [keys];
      getCalls.push(list);
      const res: Record<string, any> = {};
      for (const k of list) if (k in store) res[k] = store[k];
      return res;
    });

    vi.spyOn(BrowserAPI.storage.local, 'set').mockImplementation(async (items: any) => {
      setCalls++;
      Object.assign(store, items);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    __resetStorageLayerForTests();
  });

  describe('key contract', () => {
    it('reads and writes the real persisted key names, not placeholders', async () => {
      await getSettings();
      const requested = getCalls.flat();
      expect(requested).toContain('refinzi_settings');
      // A corrupted constant would request the bogus key instead.
      expect(requested).not.toContain('***');
    });

    it('persists history and stats under their real keys', async () => {
      await addHistoryItem({
        mode: 'better',
        targetAi: 'chatgpt',
        originalPrompt: 'a',
        refinedPrompt: 'b',
        provider: 'local',
      });
      expect(Object.keys(store)).toEqual(
        expect.arrayContaining(['refinzi_history', 'refinzi_stats'])
      );
      expect(Object.keys(store)).not.toContain('***');
    });
  });

  describe('snapshot caching', () => {
    it('serves a second read from cache without another IPC round-trip', async () => {
      store.refinzi_settings = { theme: 'light' };
      await getSettings();
      const readsAfterFirst = getCalls.length;
      await getSettings();
      await getSettings();
      expect(getCalls.length).toBe(readsAfterFirst);
    });

    it('reflects a saved value immediately (write-through, no stale read)', async () => {
      await saveSettings({ theme: 'dark' });
      await saveSettings({ theme: 'light' });
      const settings = await getSettings();
      expect(settings.theme).toBe('light');
    });

    it('drops the snapshot when invalidated', async () => {
      store.refinzi_settings = { theme: 'light' };
      await getSettings();
      const before = getCalls.length;
      invalidateSnapshot('refinzi_settings');
      await getSettings();
      expect(getCalls.length).toBeGreaterThan(before);
    });

    it('never serves an array-shaped caller a non-array value', async () => {
      // Corrupt/legacy shape straight in storage must not crash spread callers.
      store.refinzi_history = { oops: true };
      await __resetStorageLayerForTests();
      const history = await getHistory();
      expect(Array.isArray(history)).toBe(true);
      expect(history).toHaveLength(0);
    });

    it('primes a snapshot so later reads skip storage', async () => {
      primeSnapshot('refinzi_history', [{ id: 'x' }]);
      const history = await getHistory();
      expect(history).toHaveLength(1);
      expect(getCalls.filter((k) => k.includes('refinzi_history'))).toHaveLength(0);
    });
  });

  describe('write batching', () => {
    it('coalesces multiple writes into ONE set() call', async () => {
      await runInBatch(async () => {
        await stageWrite({ a: 1 });
        await stageWrite({ b: 2 });
        await stageWrite({ c: 3 });
      });
      expect(setCalls).toBe(1);
      expect(store).toMatchObject({ a: 1, b: 2, c: 3 });
    });

    it('writes immediately when no batch is open', async () => {
      await stageWrite({ a: 1 });
      expect(setCalls).toBe(1);
    });

    it('flushes once for nested batches', async () => {
      await runInBatch(async () => {
        await stageWrite({ a: 1 });
        await runInBatch(async () => {
          await stageWrite({ b: 2 });
        });
        expect(setCalls).toBe(0); // inner batch must not flush early
      });
      expect(setCalls).toBe(1);
    });

    it('still flushes when the batch body throws', async () => {
      await expect(
        runInBatch(async () => {
          await stageWrite({ a: 1 });
          throw new Error('boom');
        })
      ).rejects.toThrow('boom');
      // The finally-block flush keeps durable data from being lost.
      expect(store.a).toBe(1);
    });

    it('collapses a full generation to a single storage write', async () => {
      await clearUsageEvents();
      await saveSettings({ provider: 'local' });
      __resetStorageLayerForTests();
      setCalls = 0;

      await runInBatch(async () => {
        await recordUsageEvent({
          id: 'gen-1',
          mode: 'better',
          targetAi: 'chatgpt',
          provider: 'local',
          success: true,
        });
        await addHistoryItem({
          mode: 'better',
          targetAi: 'chatgpt',
          originalPrompt: 'a',
          refinedPrompt: 'b',
          provider: 'local',
        });
      });

      expect(setCalls).toBe(1);
      const events = await getUsageEvents();
      expect(events.some((e) => e.id === 'gen-1')).toBe(true);
    });
  });

  describe('stats daily rollover', () => {
    it('resets counts when the date changes', async () => {
      store.refinzi_stats = { todayBetterCount: 5, todayExpertCount: 2, lastDate: '2000-01-01' };
      __resetStorageLayerForTests();
      const stats = await getStats();
      expect(stats.todayBetterCount).toBe(0);
      expect(stats.todayExpertCount).toBe(0);
    });
  });
});
