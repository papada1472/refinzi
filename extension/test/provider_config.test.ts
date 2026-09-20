// @vitest-environment jsdom
/**
 * REFINZI — Provider Configuration Regression Tests
 *
 * Locks in:
 *  1. The bundled (free-tier) Gemini key value and its rotation away from
 *     retired AI Studio keys.
 *  2. That every provider default points at a currently-supported model.
 *  3. That users with a saved retired key/model are migrated on read, while
 *     genuine BYOK keys and custom model IDs are never clobbered.
 *  4. That pricing exists and is internally consistent for the default models.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserAPI } from '../src/browser/api';
import { __resetStorageLayerForTests } from '../src/utils/storage-batch';
import {
  DEFAULT_GEMINI_API_KEY,
  DEFAULT_GROQ_API_KEY,
  DEFAULT_BAI_API_KEY,
  DEPRECATED_GEMINI_API_KEYS,
  DEPRECATED_MODELS,
  DEFAULT_SETTINGS,
  FREE_TIER_PROMPT_CAP,
  getFreeUsageStatus,
  incrementFreeUsage,
  isFreeKeyActive,
  invalidateSettingsCache,
  getSettings,
  saveSettings,
} from '../src/utils/storage';
import {
  MODEL_PRICING,
  DEFAULT_METRICS_CONFIG,
  getMetricsConfig,
  saveMetricsConfig,
  calculateTimeSaved,
  calculateCostSaved,
} from '../src/utils/metrics';
import { GeminiProvider } from '../src/providers/gemini';
import { OpenAIProvider } from '../src/providers/openai';
import { DeepSeekProvider } from '../src/providers/deepseek';
import { OpenRouterProvider } from '../src/providers/openrouter';
import { GroqProvider } from '../src/providers/groq';
import { BAIProvider } from '../src/providers/bai';

/** The bundled key shipped before the current one (pulled from deprecated list). */
const PREVIOUS_BUNDLED_KEY = DEPRECATED_GEMINI_API_KEYS[1];

describe('Provider defaults, bundled key & settings migration', () => {
  let mockStorage: Record<string, any> = {};

  beforeEach(() => {
    mockStorage = {};
    vi.restoreAllMocks();
    // The storage backend is being replaced, so every cached snapshot must be
    // dropped — otherwise a previous test's settings/history would be served
    // from cache instead of this test's mock contents.
    __resetStorageLayerForTests();

    vi.spyOn(BrowserAPI.storage.local, 'get').mockImplementation(async (keys: any) => {
      if (!keys) return { ...mockStorage };
      const keyList = Array.isArray(keys) ? keys : [keys];
      const res: Record<string, any> = {};
      for (const k of keyList) {
        if (k in mockStorage) res[k] = mockStorage[k];
      }
      return res;
    });

    vi.spyOn(BrowserAPI.storage.local, 'set').mockImplementation(async (items: any) => {
      mockStorage = { ...mockStorage, ...items };
    });
  });

  describe('1. Retired bundled key & default provider', () => {
    it('ships no bundled key (retired to an empty string)', () => {
      expect(DEFAULT_GEMINI_API_KEY).toBe('');
    });

    it('lists both retired bundled keys as deprecated', () => {
      expect(DEPRECATED_GEMINI_API_KEYS).toHaveLength(2);
      expect(DEPRECATED_GEMINI_API_KEYS).toContain(PREVIOUS_BUNDLED_KEY);
      expect(DEPRECATED_GEMINI_API_KEYS).toContain(DEPRECATED_GEMINI_API_KEYS[0]);
      // The empty "no key" sentinel must not itself be flagged as deprecated.
      expect(DEPRECATED_GEMINI_API_KEYS).not.toContain('');
    });

    it('defaults to bai with configured default key in fresh settings', () => {
      expect(DEFAULT_SETTINGS.provider).toBe('bai');
      expect(DEFAULT_SETTINGS.apiKeys.gemini).toBeUndefined();
      expect(DEFAULT_SETTINGS.apiKeys.bai).toBe(DEFAULT_BAI_API_KEY);
    });
  });

  describe('2. Default models are current', () => {
    it('pins each provider to a supported model', () => {
      expect(DEFAULT_SETTINGS.models.gemini).toBe('gemini-flash-latest');
      expect(DEFAULT_SETTINGS.models.openai).toBe('gpt-5.6-luna');
      expect(DEFAULT_SETTINGS.models.deepseek).toBe('deepseek-flash');
      expect(DEFAULT_SETTINGS.models.openrouter).toBe('deepseek/deepseek-v4-flash-0731:free');
      expect(DEFAULT_SETTINGS.models.groq).toBe('openai/gpt-oss-120b');
      expect(DEFAULT_SETTINGS.models.bai).toBe('qwen3.8-flash');
    });

    it('never ships a retired model as a default', () => {
      (Object.keys(DEFAULT_SETTINGS.models) as Array<keyof typeof DEFAULT_SETTINGS.models>).forEach(
        (provider) => {
          expect(DEPRECATED_MODELS[provider]).not.toContain(DEFAULT_SETTINGS.models[provider]);
        }
      );
    });

    it('marks the retired Gemini 2.x / 1.5 model family as deprecated', () => {
      expect(DEPRECATED_MODELS.gemini).toEqual(
        expect.arrayContaining(['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'])
      );
      expect(DEPRECATED_MODELS.deepseek).toEqual(
        expect.arrayContaining(['deepseek-chat', 'deepseek-reasoner'])
      );
      expect(DEPRECATED_MODELS.openrouter).toContain('meta-llama/llama-3.3-70b-instruct:free');
    });
  });

  describe('3. Migration on read', () => {
    it('rewrites a saved retired bundled key to empty (never re-injects a key)', async () => {
      mockStorage.refinzi_settings = { apiKeys: { gemini: PREVIOUS_BUNDLED_KEY } };
      __resetStorageLayerForTests();
      const settings = await getSettings();
      expect(settings.apiKeys.gemini).toBe('');
    });

    it('rewrites every retired default model to the current default', async () => {
      mockStorage.refinzi_settings = {
        models: {
          gemini: 'gemini-2.5-flash',
          openai: 'gpt-4o-mini',
          deepseek: 'deepseek-chat',
          openrouter: 'meta-llama/llama-3.3-70b-instruct:free',
        },
      };
      __resetStorageLayerForTests();

      const settings = await getSettings();

      expect(settings.models.gemini).toBe('gemini-flash-latest');
      expect(settings.models.openai).toBe('gpt-5.6-luna');
      expect(settings.models.deepseek).toBe('deepseek-flash');
      expect(settings.models.openrouter).toBe('deepseek/deepseek-v4-flash-0731:free');
    });

    it('backfills models that were never saved', async () => {
      mockStorage.refinzi_settings = { provider: 'gemini' };
      __resetStorageLayerForTests();
      const settings = await getSettings();
      expect(settings.models.deepseek).toBe('deepseek-flash');
      expect(settings.models.openai).toBe('gpt-5.6-luna');
    });

    it('preserves a genuine BYOK key', async () => {
      mockStorage.refinzi_settings = { apiKeys: { gemini: 'AIzaSyUserOwnKey123' } };
      __resetStorageLayerForTests();
      const settings = await getSettings();
      expect(settings.apiKeys.gemini).toBe('AIzaSyUserOwnKey123');
    });

    it('preserves a custom / self-hosted model ID that is not known-deprecated', async () => {
      mockStorage.refinzi_settings = {
        models: { openrouter: 'my-org/private-model-v9', gemini: 'gemini-3.8-flash' },
      };
      __resetStorageLayerForTests();
      const settings = await getSettings();
      expect(settings.models.openrouter).toBe('my-org/private-model-v9');
      expect(settings.models.gemini).toBe('gemini-3.8-flash');
    });

    it('keeps user preferences intact while migrating', async () => {
      mockStorage.refinzi_settings = {
        theme: 'light',
        holdThresholdMs: 500,
        models: { gemini: 'gemini-1.5-flash' },
      };
      __resetStorageLayerForTests();
      const settings = await getSettings();
      expect(settings.theme).toBe('light');
      expect(settings.holdThresholdMs).toBe(500);
      expect(settings.models.gemini).toBe('gemini-flash-latest');
    });

    it('does not corrupt persisted state through a save round-trip', async () => {
      await saveSettings({ theme: 'light' });
      const reloaded = await getSettings();
      expect(reloaded.theme).toBe('light');
      expect(reloaded.apiKeys.gemini).toBe(DEFAULT_GEMINI_API_KEY);
    });
  });

  describe('4. Provider constructors agree with the defaults', () => {
    it('GeminiProvider falls back to the bundled key and evergreen Flash alias', () => {
      const provider = new GeminiProvider();
      expect((provider as any).apiKey).toBe(DEFAULT_GEMINI_API_KEY);
      expect((provider as any).model).toBe('gemini-flash-latest');
    });

    it('each BYOK provider defaults to its configured model', () => {
      expect((new OpenAIProvider('sk-test') as any).model).toBe(DEFAULT_SETTINGS.models.openai);
      expect((new DeepSeekProvider('sk-test') as any).model).toBe(DEFAULT_SETTINGS.models.deepseek);
      expect((new OpenRouterProvider('sk-or-test') as any).model).toBe(
        DEFAULT_SETTINGS.models.openrouter
      );
      expect((new GroqProvider('gsk-test') as any).model).toBe(DEFAULT_SETTINGS.models.groq);
      expect((new BAIProvider('sk-test') as any).model).toBe(DEFAULT_SETTINGS.models.bai);
    });
  });

  describe('5. Pricing integrity', () => {
    it('prices every paid default model', () => {
      expect(MODEL_PRICING[DEFAULT_SETTINGS.models.gemini]).toBeDefined();
      expect(MODEL_PRICING[DEFAULT_SETTINGS.models.openai]).toBeDefined();
      expect(MODEL_PRICING[DEFAULT_SETTINGS.models.deepseek]).toBeDefined();
      expect(MODEL_PRICING[DEFAULT_SETTINGS.models.groq]).toBeDefined();
      expect(MODEL_PRICING[DEFAULT_SETTINGS.models.bai]).toBeDefined();
    });

    it('derives averageTurnCost as 0.5*input + 0.8*output per 1k tokens', () => {
      // Applied to the current-generation entries. Some legacy rows were
      // rounded under a different token-mix assumption and are excluded.
      const CURRENT_GEN = [
        'gpt-6-astra', 'gpt-5.6-sol', 'gpt-5.6-terra', 'gpt-5.6-luna',
        'gpt-5.4-mini', 'gpt-5.4-nano', 'gpt-5-mini', 'gpt-5-nano',
        'claude-sonnet-5', 'claude-opus-5', 'claude-haiku-4-5',
        'gemini-flash-latest', 'gemini-3.8-flash', 'gemini-pro-latest',
        'deepseek-flash', 'deepseek-v4-pro',
      ];

      CURRENT_GEN.forEach((model) => {
        const pricing = MODEL_PRICING[model];
        expect(pricing, `missing pricing for ${model}`).toBeDefined();
        const expected = 0.5 * pricing.inputPer1k + 0.8 * pricing.outputPer1k;
        const relativeError = Math.abs(pricing.averageTurnCost - expected) / expected;
        expect(relativeError, `averageTurnCost mismatch for ${model}`).toBeLessThan(0.02);
      });
    });

    it('has sane, positive pricing for every entry', () => {
      Object.entries(MODEL_PRICING).forEach(([model, pricing]) => {
        expect(pricing.inputPer1k, `${model} inputPer1k`).toBeGreaterThan(0);
        expect(pricing.outputPer1k, `${model} outputPer1k`).toBeGreaterThan(0);
        expect(pricing.averageTurnCost, `${model} averageTurnCost`).toBeGreaterThan(0);
      });
    });

    it('retains legacy pricing so historical usage events still price correctly', () => {
      expect(MODEL_PRICING['deepseek-chat']).toBeDefined();
      expect(MODEL_PRICING['gemini-2.5-flash']).toBeDefined();
    });
  });

  describe('6. Free-tier status surfaced to the dashboard', () => {
    it('reports the full allowance as remaining for a fresh install', async () => {
      const status = await getFreeUsageStatus();
      expect(status.cap).toBe(FREE_TIER_PROMPT_CAP);
      expect(status.count).toBe(0);
      expect(status.remaining).toBe(FREE_TIER_PROMPT_CAP);
      expect(status.expired).toBe(false);
    });

    it('tracks remaining prompts down to zero and then expires', async () => {
      for (let i = 0; i < FREE_TIER_PROMPT_CAP; i++) {
        await incrementFreeUsage();
      }
      const status = await getFreeUsageStatus();
      expect(status.count).toBe(FREE_TIER_PROMPT_CAP);
      expect(status.remaining).toBe(0);
      expect(status.expired).toBe(true);
    });

    it('stops counting once expired (no unbounded growth)', async () => {
      for (let i = 0; i < FREE_TIER_PROMPT_CAP + 5; i++) {
        await incrementFreeUsage();
      }
      expect((await getFreeUsageStatus()).count).toBe(FREE_TIER_PROMPT_CAP);
    });

    it('never reports an active free key now that the bundled key is retired', async () => {
      // Default provider is the gateway with no bundled Gemini key.
      expect(await isFreeKeyActive()).toBe(false);

      // The legacy counter still increments, but it can no longer activate a
      // "free key" because there is no bundled key to attach it to.
      for (let i = 0; i < FREE_TIER_PROMPT_CAP; i++) {
        await incrementFreeUsage();
      }
      expect(await isFreeKeyActive()).toBe(false);
    });

    it('is not considered a free key once the user supplies their own key', async () => {
      await saveSettings({ apiKeys: { gemini: 'AIzaSyUserOwnKey123' } });
      expect(await isFreeKeyActive()).toBe(false);
    });
  });

  describe('7. Dashboard estimate assumptions are persisted and applied', () => {
    it('defaults match the shipped metrics config', async () => {
      const config = await getMetricsConfig();
      expect(config.estimatedMinutesPerPrompt).toBe(DEFAULT_METRICS_CONFIG.estimatedMinutesPerPrompt);
      expect(config.estimatedAvoidedIterations).toBe(DEFAULT_METRICS_CONFIG.estimatedAvoidedIterations);
      expect(config.fallbackCostPerIteration).toBe(DEFAULT_METRICS_CONFIG.fallbackCostPerIteration);
    });

    it('round-trips a user-adjusted assumption without losing the others', async () => {
      await saveMetricsConfig({ estimatedMinutesPerPrompt: 7 });
      const config = await getMetricsConfig();
      expect(config.estimatedMinutesPerPrompt).toBe(7);
      expect(config.estimatedAvoidedIterations).toBe(DEFAULT_METRICS_CONFIG.estimatedAvoidedIterations);
      expect(config.fallbackCostPerIteration).toBe(DEFAULT_METRICS_CONFIG.fallbackCostPerIteration);
    });

    it('changes the displayed time-saved estimate immediately', async () => {
      const before = calculateTimeSaved(4, DEFAULT_METRICS_CONFIG);
      const after = calculateTimeSaved(4, { ...DEFAULT_METRICS_CONFIG, estimatedMinutesPerPrompt: 10 });

      // 4 prompts: 4*2.5 = 10m default vs 4*10 = 40m adjusted
      expect(before.formatted).toBe('~10m');
      expect(after.formatted).toBe('~40m');
    });

    it('changes the cost-saved estimate via avoided iterations', async () => {
      const events = [
        {
          id: 'e1',
          timestamp: Date.now(),
          mode: 'better' as const,
          targetAi: 'chatgpt',
          provider: 'openai' as const,
          model: DEFAULT_SETTINGS.models.openai,
          success: true,
        },
      ];

      const low = calculateCostSaved(events, { ...DEFAULT_METRICS_CONFIG, estimatedAvoidedIterations: 1 });
      const high = calculateCostSaved(events, { ...DEFAULT_METRICS_CONFIG, estimatedAvoidedIterations: 3 });

      expect(low.hasData).toBe(true);
      expect(high.hasData).toBe(true);
      expect(high.costUsd!).toBeGreaterThan(low.costUsd!);
    });
  });
});
