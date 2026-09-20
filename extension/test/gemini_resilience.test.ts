// @vitest-environment jsdom
/**
 * REFINZI — Gemini provider resilience
 *
 * Regression guard for the failure that made click (Better) and hold (Expert)
 * silently return offline template output: a single hard-coded model meant one
 * HTTP 503 / 429 / timeout downgraded the whole feature, with the user still
 * believing AI was running.
 *
 * These tests drive the real fetch path with mocked responses.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GeminiProvider, GEMINI_FALLBACK_MODELS, resetGeminiModelMemory } from '../src/providers/gemini';

const PRIMARY = 'gemini-flash-latest';

/** Builds a fetch mock that answers per-model with a scripted status. */
function mockFetchByModel(plan: Record<string, Array<number | 'network' | 'slow'>>) {
  const calls: string[] = [];
  const cursor: Record<string, number> = {};

  const impl = vi.fn(async (url: string) => {
    const model = String(url).match(/models\/([^:]+):/)?.[1] ?? 'unknown';
    calls.push(model);
    const idx = cursor[model] ?? 0;
    cursor[model] = idx + 1;
    const seq = plan[model] ?? [];
    const step = seq[Math.min(idx, seq.length - 1)];

    if (step === 'slow') {
      // Consumes real wall-clock time so the budget logic is actually exercised.
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
    if (step === 'network' || step === 'slow') {
      const err: any = new Error('This operation was aborted');
      err.name = 'AbortError';
      throw err;
    }
    const status = step ?? 200;
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => ({ candidates: [{ content: { parts: [{ text: '{"ok":true}' }] } }] }),
      text: async () => `{"error":{"code":${status},"message":"upstream said no"}}`,
    } as any;
  });

  return { impl, calls };
}

const intent = { domain: 'marketing', targetAi: 'chatgpt', mode: 'better' } as any;

describe('Gemini provider resilience (click / hold must reach AI)', () => {
  beforeEach(() => {
    // Module-level model memory must not leak between tests.
    resetGeminiModelMemory();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetGeminiModelMemory();
  });

  it('keeps the configured model first, and the chain deduped', () => {
    expect(GEMINI_FALLBACK_MODELS[0]).toBe(PRIMARY);
    expect(new Set(GEMINI_FALLBACK_MODELS).size).toBe(GEMINI_FALLBACK_MODELS.length);
  });

  it('succeeds on the primary model when it is healthy', async () => {
    const { impl, calls } = mockFetchByModel({ [PRIMARY]: [200] });
    vi.stubGlobal('fetch', impl);

    const provider = new GeminiProvider('test-key', PRIMARY);
    // generateBetter validates the response shape, so assert on the call pattern.
    await provider.generateBetter('write a hero section', intent);

    expect(calls[0]).toBe(PRIMARY);
  });

  it('falls back to another model after the primary returns HTTP 503', async () => {
    // Primary is overloaded; the next model serves fine.
    const { impl, calls } = mockFetchByModel({
      [PRIMARY]: [503, 503],
      [GEMINI_FALLBACK_MODELS[1]]: [200],
    });
    vi.stubGlobal('fetch', impl);

    const provider = new GeminiProvider('test-key', PRIMARY);
    await provider.generateBetter('write a hero section', intent);

    expect(calls).toContain(GEMINI_FALLBACK_MODELS[1]);
    // One attempt per model: switching pools beats re-queuing on a busy one.
    expect(calls.filter((m) => m === PRIMARY).length).toBe(1);
  });

  it('moves to the next model on a transient network abort (no same-model retry)', async () => {
    const { impl, calls } = mockFetchByModel({
      [PRIMARY]: ['network'],
      [GEMINI_FALLBACK_MODELS[1]]: [200],
    });
    vi.stubGlobal('fetch', impl);

    const provider = new GeminiProvider('test-key', PRIMARY);
    await provider.generateBetter('write a hero section', intent);

    expect(calls).toEqual([PRIMARY, GEMINI_FALLBACK_MODELS[1]]);
  });

  it('skips a retired (404) model and uses the next one', async () => {
    const { impl, calls } = mockFetchByModel({
      [PRIMARY]: [404],
      [GEMINI_FALLBACK_MODELS[1]]: [200],
    });
    vi.stubGlobal('fetch', impl);

    const provider = new GeminiProvider('test-key', PRIMARY);
    await provider.generateBetter('write a hero section', intent);

    expect(calls[0]).toBe(PRIMARY);
    expect(calls).toContain(GEMINI_FALLBACK_MODELS[1]);
    expect(calls.filter((m) => m === PRIMARY).length).toBe(1);
  });

  it('does not burn quota by retrying a throttled (429) model', async () => {
    const { impl, calls } = mockFetchByModel({
      [PRIMARY]: [429],
      [GEMINI_FALLBACK_MODELS[1]]: [429],
      [GEMINI_FALLBACK_MODELS[2]]: [200],
    });
    vi.stubGlobal('fetch', impl);

    const provider = new GeminiProvider('test-key', PRIMARY);
    await provider.generateBetter('write a hero section', intent);

    // Each throttled model is tried exactly once — retrying the same quota
    // bucket only deepens the throttle.
    expect(calls.filter((m) => m === PRIMARY).length).toBe(1);
    expect(calls.filter((m) => m === GEMINI_FALLBACK_MODELS[1]).length).toBe(1);
    expect(calls).toContain(GEMINI_FALLBACK_MODELS[2]);
  });

  it('stops immediately on a fatal 401 instead of walking the whole chain', async () => {
    const { impl, calls } = mockFetchByModel({ [PRIMARY]: [401] });
    vi.stubGlobal('fetch', impl);

    const provider = new GeminiProvider('bad-key', PRIMARY);
    await provider.generateBetter('write a hero section', intent);

    // A rejected key is key-wide: exactly one request, then straight to local.
    expect(calls.length).toBe(1);
  });

  it('walks the entire chain and then degrades, rather than hanging', async () => {
    const plan: Record<string, number[]> = {};
    for (const m of GEMINI_FALLBACK_MODELS) plan[m] = [503];
    const { impl, calls } = mockFetchByModel(plan);
    vi.stubGlobal('fetch', impl);

    const provider = new GeminiProvider('test-key', PRIMARY);
    const result = await provider.generateBetter('write a hero section', intent);

    // One bounded request per model — 5 total, never 10.
    expect(calls.length).toBe(GEMINI_FALLBACK_MODELS.length);
    // And the caller still received usable (local) output instead of an error.
    expect(result.prompt.length).toBeGreaterThan(10);
  }, 20000);

  it('bounds total wall-clock time so the UI cannot hang', async () => {
    // Every attempt hangs for 600ms, so the caller's 1.5s budget must trip
    // partway through the chain instead of trying all five models.
    const plan: Record<string, Array<number | 'network' | 'slow'>> = {};
    for (const m of GEMINI_FALLBACK_MODELS) plan[m] = ['slow'];
    const { impl, calls } = mockFetchByModel(plan);
    vi.stubGlobal('fetch', impl);

    const started = Date.now();
    const provider = new GeminiProvider('test-key', PRIMARY);
    await provider.generateBetter('write a hero section', intent, { timeoutMs: 1500 });
    const elapsed = Date.now() - started;

    expect(calls.length).toBeGreaterThan(0);
    // Aborted early rather than walking the whole chain…
    expect(calls.length).toBeLessThan(GEMINI_FALLBACK_MODELS.length);
    // …and stayed close to the requested budget.
    expect(elapsed).toBeLessThan(4000);
  }, 20000);

  it('remembers the working model so later actions skip the dead chain', async () => {
    // Primary is dead; only the second fallback serves.
    const healthy = GEMINI_FALLBACK_MODELS[2];
    const plan: Record<string, Array<number | 'network' | 'slow'>> = {};
    for (const m of GEMINI_FALLBACK_MODELS) plan[m] = [503];
    plan[healthy] = [200];

    const { impl, calls } = mockFetchByModel(plan);
    vi.stubGlobal('fetch', impl);

    const provider = new GeminiProvider('test-key', PRIMARY);

    // First action: walks the chain until it finds the healthy model.
    await provider.generateBetter('first prompt', intent);
    const firstRunCalls = calls.length;
    expect(firstRunCalls).toBeGreaterThan(1);

    // Second action: the remembered model is tried first, so it costs 1 request.
    calls.length = 0;
    await provider.generateBetter('second prompt', intent);
    expect(calls.length).toBe(1);
    expect(calls[0]).toBe(healthy);
  }, 20000);
});
