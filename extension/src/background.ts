/**
 * REFINZI — Cross-Browser Background Service Worker
 * Secure execution layer: API keys and network requests are handled here,
 * never exposed to content scripts or page DOM.
 */

import { BrowserAPI } from './browser/api';
import { ProviderManager } from './providers/manager';
import {
  getSettings,
  saveSettings,
  addHistoryItem,
  getHistory,
  clearHistory,
  getStats,
  deleteHistoryItem,
} from './utils/storage';
import {
  recordUsageEvent,
  clearUsageEvents,
  deleteUsageEvent,
  getUsageEvents,
  getMetricsConfig,
  getSelectedPeriod,
  saveSelectedPeriod,
  computeMetricsSummary,
} from './utils/metrics';
import { ExtensionMessage } from './types';

// In-flight request deduplication map to eliminate duplicate generation & history writes
const inFlightRequests = new Map<string, Promise<any>>();

// Handle Extension Messages
BrowserAPI.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  if (!message || typeof message !== 'object') return false;

  switch (message.type) {
    case 'REFINZI_GENERATE_BETTER': {
      const targetAi = message.targetAi || 'general';
      const eventId = message.requestId || `better:${Date.now()}:${Math.random().toString(36).slice(2, 7)}`;
      const dedupKey = eventId;

      let executionPromise = inFlightRequests.get(dedupKey);
      if (!executionPromise) {
        executionPromise = ProviderManager.generateBetter(message.text, targetAi)
          .then(async (response) => {
            const settings = await getSettings();
            const model = settings.models?.[settings.provider as keyof typeof settings.models];

            // 1. Record usage event for metrics (idempotent, safe metadata only)
            await recordUsageEvent({
              id: eventId,
              mode: 'better',
              targetAi,
              provider: settings.provider,
              model,
              success: true,
            });

            // 2. Record full history item
            await addHistoryItem({
              mode: 'better',
              targetAi,
              originalPrompt: message.text,
              refinedPrompt: response.prompt,
              provider: settings.provider,
              reasonOrSummary: response.shortReason,
            });
            return response;
          })
          .catch(async (err) => {
            // Record failed transformation (does not count as successful)
            const settings = await getSettings();
            await recordUsageEvent({
              id: eventId,
              mode: 'better',
              targetAi,
              provider: settings.provider,
              success: false,
            });
            throw err;
          })
          .finally(() => {
            setTimeout(() => {
              inFlightRequests.delete(dedupKey);
            }, 1000);
          });
        inFlightRequests.set(dedupKey, executionPromise);
      }

      executionPromise
        .then((response) => sendResponse({ success: true, data: response }))
        .catch((err) => sendResponse({ success: false, error: err.message }));
      return true; // Keep message channel open for async response
    }

    case 'REFINZI_GENERATE_EXPERT': {
      const targetAi = message.targetAi || 'general';
      const eventId = message.requestId || `expert:${Date.now()}:${Math.random().toString(36).slice(2, 7)}`;
      const dedupKey = eventId;

      let executionPromise = inFlightRequests.get(dedupKey);
      if (!executionPromise) {
        executionPromise = ProviderManager.generateExpert(message.text, targetAi)
          .then(async (response) => {
            const settings = await getSettings();
            const model = settings.models?.[settings.provider as keyof typeof settings.models];

            // 1. Record usage event for metrics (idempotent, safe metadata only)
            await recordUsageEvent({
              id: eventId,
              mode: 'expert',
              targetAi,
              provider: settings.provider,
              model,
              success: true,
            });

            // 2. Record full history item
            await addHistoryItem({
              mode: 'expert',
              targetAi,
              originalPrompt: message.text,
              refinedPrompt: response.prompt,
              provider: settings.provider,
              reasonOrSummary: response.summary,
            });
            return response;
          })
          .catch(async (err) => {
            // Record failed transformation (does not count as successful)
            const settings = await getSettings();
            await recordUsageEvent({
              id: eventId,
              mode: 'expert',
              targetAi,
              provider: settings.provider,
              success: false,
            });
            throw err;
          })
          .finally(() => {
            setTimeout(() => {
              inFlightRequests.delete(dedupKey);
            }, 1000);
          });
        inFlightRequests.set(dedupKey, executionPromise);
      }

      executionPromise
        .then((response) => sendResponse({ success: true, data: response }))
        .catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }

    case 'REFINZI_GET_SETTINGS': {
      getSettings()
        .then((settings) => sendResponse({ success: true, data: settings }))
        .catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }

    case 'REFINZI_SAVE_SETTINGS': {
      saveSettings(message.settings)
        .then((updated) => sendResponse({ success: true, data: updated }))
        .catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }

    case 'REFINZI_TEST_PROVIDER': {
      ProviderManager.testProvider(message.provider, message.apiKey, message.endpointUrl)
        .then((result) => sendResponse({ success: true, data: result }))
        .catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }

    case 'REFINZI_GET_HISTORY': {
      getHistory()
        .then((history) => sendResponse({ success: true, data: history }))
        .catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }

    case 'REFINZI_CLEAR_HISTORY': {
      Promise.all([clearHistory(), clearUsageEvents()])
        .then(() => sendResponse({ success: true }))
        .catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }

    case 'REFINZI_DELETE_HISTORY_ITEM': {
      Promise.all([deleteHistoryItem(message.id), deleteUsageEvent(message.id)])
        .then(() => sendResponse({ success: true }))
        .catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }


    case 'REFINZI_GET_STATS': {
      getStats()
        .then((stats) => sendResponse({ success: true, data: stats }))
        .catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }

    case 'REFINZI_GET_METRICS_SUMMARY': {
      (async () => {
        const period = message.period || (await getSelectedPeriod());
        const events = await getUsageEvents();
        const config = await getMetricsConfig();
        return computeMetricsSummary(events, period, config);
      })()
        .then((summary) => sendResponse({ success: true, data: summary }))
        .catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }

    case 'REFINZI_SET_PERIOD': {
      saveSelectedPeriod(message.period)
        .then(() => sendResponse({ success: true }))
        .catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }

    default:
      return false;
  }
});

// Handle Keyboard Shortcuts
BrowserAPI.commands.onCommand.addListener(async (command) => {
  try {
    const tabs = await BrowserAPI.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    if (!activeTab?.id) return;

    if (command === 'refinzi-better') {
      await BrowserAPI.tabs.sendMessage(activeTab.id, { type: 'REFINZI_TRIGGER_BETTER_SHORTCUT' });
    } else if (command === 'refinzi-expert') {
      await BrowserAPI.tabs.sendMessage(activeTab.id, { type: 'REFINZI_TRIGGER_EXPERT_SHORTCUT' });
    }
  } catch (err) {
    console.debug('[Refinzi] Shortcut dispatch skipped:', err);
  }
});

if (typeof chrome !== 'undefined' && chrome.runtime?.onInstalled) {
  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      console.log('[Refinzi] Extension installed successfully.');
    }
  });
}
