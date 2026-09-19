/**
 * REFINZI — Storage & Settings Helper
 * Handles persistence via BrowserAPI.storage.local with defaults and migrations.
 * Cross-browser compatible (Chrome, Edge, Firefox, Safari).
 */

import { RefinziSettings } from '../types';
import { BrowserAPI } from '../browser/api';

export const DEFAULT_SETTINGS: RefinziSettings = {
  defaultMode: 'better',
  provider: 'gemini', // Set Google Gemini Flash by default per user specification
  apiKeys: {},
  models: {
    gemini: 'gemini-2.5-flash',
    openai: 'gpt-4o-mini',
    deepseek: 'deepseek-chat',
    openrouter: 'meta-llama/llama-3.3-70b-instruct:free',
  },
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
};

export async function getSettings(): Promise<RefinziSettings> {
  try {
    const result = await BrowserAPI.storage.local.get(['refinzi_settings']);
    if (!result || !result.refinzi_settings) {
      return { ...DEFAULT_SETTINGS };
    }
    return {
      ...DEFAULT_SETTINGS,
      ...result.refinzi_settings,
      apiKeys: {
        ...DEFAULT_SETTINGS.apiKeys,
        ...(result.refinzi_settings.apiKeys || {}),
      },
      models: {
        ...DEFAULT_SETTINGS.models,
        ...(result.refinzi_settings.models || {}),
      },
      enabledSites: {
        ...DEFAULT_SETTINGS.enabledSites,
        ...(result.refinzi_settings.enabledSites || {}),
      },
    };
  } catch {
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
    await BrowserAPI.storage.local.set({ refinzi_settings: updated });
  } catch (err) {
    console.error('[Refinzi] Failed to save settings:', err);
  }

  return updated;
}

// -------------------------------------------------------------
// REFINZI HISTORY & USAGE STATS
// -------------------------------------------------------------

import { RefinziHistoryItem, RefinziStats } from '../types';

export async function getHistory(): Promise<RefinziHistoryItem[]> {
  try {
    const res = await BrowserAPI.storage.local.get(['refinzi_history']);
    return (res?.refinzi_history as RefinziHistoryItem[]) || [];
  } catch {
    return [];
  }
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
    await BrowserAPI.storage.local.set({ refinzi_history: updated });
  } catch (err) {
    console.error('[Refinzi] Failed to record history:', err);
  }
}

export async function clearHistory(): Promise<void> {
  try {
    await BrowserAPI.storage.local.set({ refinzi_history: [] });
  } catch (err) {
    console.error('[Refinzi] Failed to clear history:', err);
  }
}

export async function deleteHistoryItem(id: string): Promise<void> {
  try {
    const history = await getHistory();
    const updated = history.filter((item) => item.id !== id);
    await BrowserAPI.storage.local.set({ refinzi_history: updated });
  } catch (err) {
    console.error('[Refinzi] Failed to delete history item:', err);
  }
}


export async function getStats(): Promise<RefinziStats> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const res = await BrowserAPI.storage.local.get(['refinzi_stats']);
    const stats: RefinziStats = res?.refinzi_stats || {
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
  } catch {
    return {
      todayBetterCount: 0,
      todayExpertCount: 0,
      lastDate: new Date().toISOString().split('T')[0],
    };
  }
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

    await BrowserAPI.storage.local.set({ refinzi_stats: stats });
  } catch (err) {
    console.error('[Refinzi] Failed to update stats:', err);
  }
}

