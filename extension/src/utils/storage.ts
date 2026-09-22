/**
 * REFINZI — Storage & Settings Helper
 * Handles persistence via BrowserAPI.storage.local with defaults and migrations.
 * Cross-browser compatible (Chrome, Edge, Firefox, Safari).
 */

import { RefinziSettings } from '../types';
import { BrowserAPI } from '../browser/api';
import { invalidateSnapshot, primeSnapshot, readSnapshot, stageWrite } from './storage-batch';

/**
 * Retired. The extension previously bundled a shared Google AI Studio key for a
 * 25-prompt free tier; that key was a single shared point of failure (and a
 * Google ToS violation), so it has been removed. The default backend is now the
 * Refinzi gateway. This constant stays as an empty string so existing imports
 * keep compiling; any user still on a bundled key is migrated to '' on read.
 */
export const DEFAULT_GEMINI_API_KEY = '';
export const DEFAULT_GROQ_API_KEY = '';
export const DEFAULT_BAI_API_KEY = '';
export const DEFAULT_BAI_ENDPOINT = 'https://ws-ls7my6kl6a1yzk90.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1';

/**
 * Previously bundled Gemini keys have been retired and zeroed out for compliance.
 */
export const DEPRECATED_GEMINI_API_KEYS: readonly string[] = [];

/**
 * Number of free prompt calibrations included on the community tier.
 * After this, the extension gracefully falls back to the local offline engine
 * and shows a BYOK upgrade nudge. Not a hard error — the product still works.
 */
export const FREE_TIER_PROMPT_CAP = 25;

/**
 * Single source of truth for each provider's default model.
 * Referenced by DEFAULT_SETTINGS, the popup guidebook, and the migration table
 * below, so a model bump only has to happen in one place.
 */
export const DEFAULT_PROVIDER_MODELS: Required<RefinziSettings['models']> = {
  // `gemini-flash-latest` is an evergreen alias that always resolves to the
  // newest Flash model (currently Gemini 3.8 Flash), so it never goes stale.
  gemini: 'gemini-flash-latest',
  openai: 'gpt-5.6-luna',
  deepseek: 'deepseek-flash',
  openrouter: 'deepseek/deepseek-v4-flash-0731:free',
  groq: 'openai/gpt-oss-120b',
  bai: 'qwen3.8-flash',
};

export const DEFAULT_SETTINGS: RefinziSettings = {
  enabled: true,
  defaultMode: 'better',
  // Default: Refinzi Cloud Gateway (zero client-side credentials, 25/day free tier).
  provider: 'gateway',
  apiKeys: {
    groq: DEFAULT_GROQ_API_KEY,
  },
  models: { ...DEFAULT_PROVIDER_MODELS },
  gatewayUrl: 'https://refinzi.com/api/v1/refine',
  enabledSites: {
    chatgpt: true,
    claude: true,
    gemini: true,
    perplexity: true,
  },
  shortcuts: {
    better: 'Ctrl+Shift+B',
    expert: 'Ctrl+Shift+E',
  },
  theme: 'dark',
  autoFocus: true,
  showInlineTrigger: true,
  holdThresholdMs: 350,
  autoApply: true,
  saveHistory: true,
  hasSeenOnboarding: false,
  freeUsageCount: 0,
  freeUsageDate: '',
  freeUsageExpired: false,
};

/**
 * Model IDs that have been retired upstream. A user still pinned to one of
 * these is migrated to the current default for that provider on next read.
 *
 * Verified against the live provider catalogs:
 *  - Gemini: the 2.5 / 2.0 / 1.5 families now return HTTP 404 on generateContent.
 *  - OpenAI: 4o / o-series IDs are superseded by the 5.x generation.
 *  - DeepSeek: `deepseek-chat`/`deepseek-reasoner` are superseded by
 *    `deepseek-flash` (DeepSeek-V4.1-Flash) and `deepseek-v4-pro`.
 *  - OpenRouter: the old free pool is retired; see the current free list.
 *  - Groq: llama-3.x models retired on current catalog.
 */
export const DEPRECATED_MODELS: Record<keyof RefinziSettings['models'], readonly string[]> = {
  gemini: [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro',
    'gemini-3-flash-preview',
  ],
  openai: [
    'gpt-4o-mini',
    'gpt-4o',
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo',
    'o1-mini',
    'o1-preview',
    'o3-mini',
  ],
  deepseek: [
    'deepseek-chat',
    'deepseek-reasoner',
    'deepseek-v4-flash',
    'deepseek-v4-flash-vision-exp',
  ],
  openrouter: [
    'meta-llama/llama-3.3-70b-instruct:free',
    'deepseek/deepseek-r1:free',
    'deepseek/deepseek-chat',
    'google/gemini-2.0-flash-exp:free',
    'google/gemma-2-9b-it:free',
    'qwen/qwen-2.5-coder-32b-instruct:free',
    'mistralai/mistral-7b-instruct:free',
  ],
  groq: [
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile',
    'llama-3.1-8b-instant',
    'mixtral-8x7b-32768',
  ],
  bai: [],
};

/**
 * Raw persisted settings snapshot via the shared storage-batch layer.
 *
 * A single prompt generation reads settings ~6 times (ProviderManager routing,
 * free-tier checks, history recording, model lookup). Each uncached read is a
 * full storage round-trip. Caching the *raw* snapshot — rather than the resolved
 * object — keeps every caller isolated: the migration below always runs fresh
 * and returns a brand-new object, so no caller can mutate the cache.
 */
const SETTINGS_KEY = 'refinzi_settings';

/** Drops the cached settings snapshot so the next read hits storage. */
export function invalidateSettingsCache(): void {
  invalidateSnapshot(SETTINGS_KEY);
}

export async function getSettings(): Promise<RefinziSettings> {
  try {
    const saved = await readSnapshot<any>(SETTINGS_KEY, null);
    if (!saved) {
      return { ...DEFAULT_SETTINGS };
    }

    // --- Migration 1: retired bundled keys --------------------------------
    // Deprecated/empty bundled keys resolve to '' (removed), never re-injected.
    const savedGeminiKey = saved.apiKeys?.gemini;
    const isDeprecatedGemini = !savedGeminiKey || savedGeminiKey.startsWith('AQ.') || DEPRECATED_GEMINI_API_KEYS.includes(savedGeminiKey);
    const resolvedGeminiKey = isDeprecatedGemini ? '' : savedGeminiKey;

    const savedBaiKey = saved.apiKeys?.bai;
    const isDeprecatedBai = savedBaiKey && (savedBaiKey.startsWith('sk-ws-H.') || savedBaiKey === DEFAULT_BAI_API_KEY);
    const resolvedBaiKey = isDeprecatedBai ? '' : (savedBaiKey || '');

    // --- Migration 2: retired upstream model IDs --------------------------
    // Only known-deprecated IDs are rewritten, so genuine BYOK model choices
    // (including custom / self-hosted identifiers) are always preserved.
    const savedModels = saved.models || {};
    const resolvedModels = { ...DEFAULT_PROVIDER_MODELS };
    (Object.keys(resolvedModels) as Array<keyof RefinziSettings['models']>).forEach((key) => {
      const savedModel = savedModels[key];
      const deprecated = DEPRECATED_MODELS[key];
      const isRetired = !savedModel || deprecated.includes(savedModel);
      resolvedModels[key] = isRetired ? DEFAULT_PROVIDER_MODELS[key] : savedModel;
    });

    return {
      ...DEFAULT_SETTINGS,
      ...saved,
      provider: saved.provider || 'gateway',
      apiKeys: {
        ...DEFAULT_SETTINGS.apiKeys,
        ...(saved.apiKeys || {}),
        gemini: resolvedGeminiKey,
        bai: resolvedBaiKey,
      },
      models: resolvedModels,
      enabledSites: {
        ...DEFAULT_SETTINGS.enabledSites,
        ...(saved.enabledSites || {}),
      },
    };
  } catch {
    // Never leave a failed read cached, or the defaults would stick forever.
    invalidateSettingsCache();
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(patch: Partial<RefinziSettings>): Promise<RefinziSettings> {
  const current = await getSettings();
  const updated: RefinziSettings = {
    ...current,
    ...patch,
    apiKeys: {
      ...current.apiKeys,
      ...(patch.apiKeys || {}),
    },
    models: {
      ...current.models,
      ...(patch.models || {}),
    },
    enabledSites: {
      ...current.enabledSites,
      ...(patch.enabledSites || {}),
    },
  };

  try {
    // Write-through: prime the snapshot first so reads inside an open batch
    // (or immediately after) observe the new value without another IPC read.
    primeSnapshot(SETTINGS_KEY, updated);
    await stageWrite({ refinzi_settings: updated });
  } catch (err) {
    // A failed write means the cache may no longer match storage.
    invalidateSettingsCache();
    console.error('[Refinzi] Failed to save settings:', err);
  }

  return updated;
}

// -------------------------------------------------------------
// 25/DAY FREE TIER MANAGEMENT (ROLLING DAILY RESET)
// -------------------------------------------------------------

export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC/ISO)
}

/**
 * Returns true when the user is actively on a bundled default key.
 * Bundled client keys are retired for CWS compliance and the free tier
 * is enforced server-side by the Refinzi Gateway.
 */
export async function isFreeKeyActive(): Promise<boolean> {
  const settings = await getSettings();
  const usingBundledGemini =
    Boolean(DEFAULT_GEMINI_API_KEY) &&
    settings.provider === 'gemini' &&
    (!settings.apiKeys?.gemini || settings.apiKeys.gemini === DEFAULT_GEMINI_API_KEY);
  const usingBundledBai =
    Boolean(DEFAULT_BAI_API_KEY) &&
    settings.provider === 'bai' &&
    (!settings.apiKeys?.bai || settings.apiKeys.bai === DEFAULT_BAI_API_KEY);

  return (usingBundledGemini || usingBundledBai) && !settings.freeUsageExpired;
}

/**
 * Increments the daily free-tier usage counter (25 prompts/day).
 * Auto-resets if a new calendar day has started, and caps at FREE_TIER_PROMPT_CAP.
 */
export async function incrementFreeUsage(): Promise<void> {
  try {
    const settings = await getSettings();
    const today = getTodayDateString();

    // Check if new day
    const isNewDay = settings.freeUsageDate !== today;
    const currentCount = isNewDay ? 0 : (settings.freeUsageCount ?? 0);

    const newCount = Math.min(currentCount + 1, FREE_TIER_PROMPT_CAP);
    const expired = newCount >= FREE_TIER_PROMPT_CAP;

    await saveSettings({
      freeUsageCount: newCount,
      freeUsageDate: today,
      freeUsageExpired: expired,
    });
  } catch (err) {
    console.error('[Refinzi] Failed to increment free usage count:', err);
  }
}

/**
 * Returns a snapshot of the current 25/day free tier status for UI display.
 */
export async function getFreeUsageStatus(): Promise<{
  count: number;
  cap: number;
  remaining: number;
  expired: boolean;
  date: string;
}> {
  const settings = await getSettings();
  const today = getTodayDateString();
  const isNewDay = settings.freeUsageDate !== today;

  const count = isNewDay ? 0 : (settings.freeUsageCount ?? 0);
  const expired = isNewDay ? false : (settings.freeUsageExpired ?? false);

  return {
    count,
    cap: FREE_TIER_PROMPT_CAP,
    remaining: Math.max(0, FREE_TIER_PROMPT_CAP - count),
    expired,
    date: today,
  };
}

// -------------------------------------------------------------
// REFINZI HISTORY & USAGE STATS
// -------------------------------------------------------------

import { RefinziHistoryItem, RefinziStats } from '../types';

const HISTORY_KEY = 'refinzi_history';
const STATS_KEY = 'refinzi_stats';

export async function getHistory(): Promise<RefinziHistoryItem[]> {
  return readSnapshot<RefinziHistoryItem[]>(HISTORY_KEY, []);
}

export async function addHistoryItem(
  item: Omit<RefinziHistoryItem, 'id' | 'timestamp' | 'dateStr'>
): Promise<void> {
  try {
    await incrementStats(item.mode);

    const settings = await getSettings();
    if (settings.saveHistory === false) return;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const newItem: RefinziHistoryItem = {
      ...item,
      id: 'rfz_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36),
      timestamp: Date.now(),
      dateStr,
    };

    const history = await getHistory();
    // Keep most recent 50 entries
    const updated = [newItem, ...history].slice(0, 50);
    primeSnapshot(HISTORY_KEY, updated);
    await stageWrite({ refinzi_history: updated });
  } catch (err) {
    console.error('[Refinzi] Failed to record history:', err);
  }
}

export async function clearHistory(): Promise<void> {
  try {
    primeSnapshot(HISTORY_KEY, []);
    await stageWrite({ refinzi_history: [] });
  } catch (err) {
    console.error('[Refinzi] Failed to clear history:', err);
  }
}

export async function deleteHistoryItem(id: string): Promise<void> {
  try {
    const history = await getHistory();
    const updated = history.filter((item) => item.id !== id);
    primeSnapshot(HISTORY_KEY, updated);
    await stageWrite({ refinzi_history: updated });
  } catch (err) {
    console.error('[Refinzi] Failed to delete history item:', err);
  }
}


export async function getStats(): Promise<RefinziStats> {
  const today = new Date().toISOString().split('T')[0];
  const stored = await readSnapshot<RefinziStats | null>(STATS_KEY, null);
  const stats: RefinziStats = stored || {
    todayBetterCount: 0,
    todayExpertCount: 0,
    lastDate: today,
  };

  if (stats.lastDate !== today) {
    // Reset daily counts on date rollover
    return {
      todayBetterCount: 0,
      todayExpertCount: 0,
      lastDate: today,
    };
  }

  return stats;
}

async function incrementStats(mode: 'better' | 'expert'): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const stats = await getStats();
    if (mode === 'better') {
      stats.todayBetterCount = (stats.todayBetterCount || 0) + 1;
    } else {
      stats.todayExpertCount = (stats.todayExpertCount || 0) + 1;
    }
    stats.lastDate = today;

    primeSnapshot(STATS_KEY, stats);
    await stageWrite({ refinzi_stats: stats });
  } catch (err) {
    console.error('[Refinzi] Failed to update stats:', err);
  }
}

