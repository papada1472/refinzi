/**
 * REFINZI — Storage Batch & Snapshot Cache Layer
 *
 * Two related problems, one module:
 *
 * 1. WRITE AMPLIFICATION. A single prompt generation previously persisted four
 *    separate keys (events, stats, history, settings) via four sequential
 *    chrome.storage.set() calls — each a full IPC round-trip. runInBatch() lets
 *    the caller stage every mutation and flush once at commit time.
 *
 * 2. READ AMPLIFICATION. The same generation re-read those keys several times
 *    (recordUsageEvent loads the whole event log, addHistoryItem loads history,
 *    incrementStats loads stats…). Snapshot caches hold the raw stored value
 *    briefly — long enough to absorb one burst of reads — with immediate
 *    write-through on commit so later code in the same burst sees fresh data.
 *
 * Caches are deliberately short-lived: only the background service worker
 * writes these keys, but the TTL bounds staleness anyway (e.g. after storage
 * is cleared externally). `undefined` = not loaded yet, `null` = loaded empty.
 */
import { BrowserAPI } from '../browser/api';

const SNAPSHOT_TTL_MS = 1500;

interface Snapshot<T> {
  value: T | null | undefined; // undefined = cold, null = stored-empty
  at: number;
}

const snapshots: Record<string, Snapshot<any>> = {};

export function invalidateSnapshot(key: string): void {
  delete snapshots[key];
}

export function invalidateAllSnapshots(): void {
  for (const k of Object.keys(snapshots)) delete snapshots[k];
}

/**
 * Test seam: drop every cached snapshot AND any open batch.
 *
 * Required whenever a test swaps the storage backend wholesale (e.g. installs a
 * fresh mock), because staged/cached values from the previous test would
 * otherwise be served instead of the new mock's contents.
 */
export function __resetStorageLayerForTests(): void {
  invalidateAllSnapshots();
  batchDepth = 0;
  pendingWrites = null;
}

/**
 * Returns the cached raw value for `key`, loading it from storage on miss or
 * expiry. `empty` decides what counts as "stored-empty" (arrays vs objects).
 */
export async function readSnapshot<T>(key: string, fallbackEmpty: T): Promise<T> {
  const snap = snapshots[key];
  if (snap && Date.now() - snap.at < SNAPSHOT_TTL_MS && snap.value !== undefined) {
    return normalize(snap.value, fallbackEmpty) as T;
  }

  try {
    const res = await BrowserAPI.storage.local.get([key]);
    const raw = res?.[key];
    snapshots[key] = { value: raw ?? null, at: Date.now() };
    return normalize(raw, fallbackEmpty) as T;
  } catch {
    // Never cache a failed read, or defaults would stick until TTL.
    delete snapshots[key];
    return fallbackEmpty;
  }
}

/**
 * Guards against non-array values reaching array callers. Storage can hold a
 * legacy/odd shape (an object, or a stale value written before a clear), and
 * callers spread the result (`[...history]`) — which throws "not iterable".
 */
function normalize<T>(value: unknown, fallbackEmpty: T): T {
  if (Array.isArray(fallbackEmpty)) {
    return (Array.isArray(value) ? value : fallbackEmpty) as T;
  }
  return ((value === null || value === undefined) ? fallbackEmpty : value) as T;
}

/** Updates the in-memory snapshot immediately (write-through) without persisting. */
export function primeSnapshot<T>(key: string, value: T): void {
  snapshots[key] = { value, at: Date.now() };
}

// ---------------------------------------------------------------------------
// Batching
// ---------------------------------------------------------------------------

let batchDepth = 0;
let pendingWrites: Record<string, unknown> | null = null;

/**
 * Persists `items`, coalescing into the active batch when one is open.
 * Callers must keep updating their own snapshots (primeSnapshot) at this point
 * so subsequent reads inside the same batch observe the new state.
 */
export async function stageWrite(items: Record<string, unknown>): Promise<void> {
  if (pendingWrites) {
    Object.assign(pendingWrites, items);
    return;
  }
  await BrowserAPI.storage.local.set(items);
}

/**
 * Runs `fn` with all storage writes deferred into a single set() call.
 * Nested batches share the outermost flush.
 */
export async function runInBatch<T>(fn: () => Promise<T>): Promise<T> {
  batchDepth++;
  if (!pendingWrites) pendingWrites = {};
  try {
    const result = await fn();
    return result;
  } finally {
    batchDepth--;
    if (batchDepth === 0 && pendingWrites) {
      const writes = pendingWrites;
      pendingWrites = null;
      try {
        await BrowserAPI.storage.local.set(writes);
      } catch (err) {
        // A failed flush leaves storage unknown — drop every snapshot so the
        // next reader reloads instead of trusting staged-but-unwritten values.
        invalidateAllSnapshots();
        throw err;
      }
    } else if (batchDepth === 0) {
      pendingWrites = null;
    }
  }
}
