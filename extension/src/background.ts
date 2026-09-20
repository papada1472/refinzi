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
  isFreeKeyActive,
  incrementFreeUsage,
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
import { runInBatch } from './utils/storage-batch';

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
            // All post-generation persistence is staged and flushed as ONE
            // storage write instead of four sequential IPC round-trips.
            await runInBatch(async () => {
              const settings = await getSettings();
              const model = settings.models?.[settings.provider as keyof typeof settings.models];

              const isSuccess = !response.isFallback && !response.providerFailure;
              // 1. Record usage event for metrics (idempotent, safe metadata only)
              await recordUsageEvent({
                id: eventId,
                mode: 'better',
                targetAi,
                provider: response.providerFailure?.provider || settings.provider,
                model,
                success: isSuccess,
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

              // 3. Increment free tier usage counter when on the bundled default key
              if (await isFreeKeyActive()) {
                await incrementFreeUsage();
              }
            });

            return response;
          })
          .catch(async (err) => {
            // Record failed transformation (does not count as successful)
            try {
              await runInBatch(async () => {
                const settings = await getSettings();
                await recordUsageEvent({
                  id: eventId,
                  mode: 'better',
                  targetAi,
                  provider: settings.provider,
                  success: false,
                });
              });
            } catch {
              /* never mask the original error */
            }
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
            // Single batched flush — see GENERATE_BETTER above.
            await runInBatch(async () => {
              const settings = await getSettings();
              const model = settings.models?.[settings.provider as keyof typeof settings.models];

              const isSuccess = !response.isFallback && !response.providerFailure;
              // 1. Record usage event for metrics (idempotent, safe metadata only)
              await recordUsageEvent({
                id: eventId,
                mode: 'expert',
                targetAi,
                provider: response.providerFailure?.provider || settings.provider,
                model,
                success: isSuccess,
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

              // 3. Increment free tier usage counter when on the bundled default key
              if (await isFreeKeyActive()) {
                await incrementFreeUsage();
              }
            });

            return response;
          })
          .catch(async (err) => {
            // Record failed transformation (does not count as successful)
            try {
              await runInBatch(async () => {
                const settings = await getSettings();
                await recordUsageEvent({
                  id: eventId,
                  mode: 'expert',
                  targetAi,
                  provider: settings.provider,
                  success: false,
                });
              });
            } catch {
              /* never mask the original error */
            }
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

    case 'REFINZI_OPEN_POPUP':
    case 'REFINZI_OPEN_SETTINGS': {
      (async () => {
        try {
          if (typeof chrome !== 'undefined') {
            if (chrome.action?.openPopup) {
              await chrome.action.openPopup();
              return { success: true };
            }
            if (chrome.runtime?.openOptionsPage) {
              await chrome.runtime.openOptionsPage();
              return { success: true };
            }
            const url = chrome.runtime.getURL('popup/popup.html');
            await chrome.tabs.create({ url });
            return { success: true };
          }
        } catch {
          try {
            const url = chrome.runtime.getURL('popup/popup.html');
            await chrome.tabs.create({ url });
            return { success: true };
          } catch (e: any) {
            return { success: false, error: e?.message };
          }
        }
        return { success: false };
      })()
        .then((res) => sendResponse(res))
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
  chrome.runtime.onInstalled.addListener(async (details) => {
    // Content scripts only inject on *navigation*. Without this, every tab that
    // was already open when the user installed or updated Refinzi would show no
    // Orb until they manually refreshed — the "why do I have to reload?" problem.
    // Re-injecting is safe because content.js self-guards against double load.
    const injectIntoOpenTabs = async () => {
      try {
        if (!chrome?.scripting?.executeScript || !chrome?.tabs?.query) return;
        const tabs = await chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] });
        await Promise.allSettled(
          tabs
            .filter((t) => typeof t.id === 'number' && !t.url?.startsWith('chrome://'))
            .map((t) =>
              chrome.scripting.executeScript({ target: { tabId: t.id as number }, files: ['content.js'] })
            )
        );
      } catch (err) {
        console.debug('[Refinzi] Open-tab injection skipped:', err);
      }
    };

    if (details.reason === 'install') {
      console.log('[Refinzi] Extension installed successfully.');

      await injectIntoOpenTabs();

      // Fire the onboarding modal in the currently active tab immediately on install.
      // This ensures the CWS reviewer (and all new users) see the walkthrough
      // the moment the extension is installed, without having to navigate away.
      try {
        const tabs = await BrowserAPI.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];
        if (activeTab?.id) {
          // Small delay to allow the content script to finish initializing on the page
          setTimeout(async () => {
            try {
              await BrowserAPI.tabs.sendMessage(activeTab.id as number, {
                type: 'REFINZI_SHOW_ONBOARDING',
              });
            } catch {
              // Content script may not yet be injected on restricted pages (e.g. chrome://)
              // This is expected — silently ignore.
            }
          }, 800);
        }
      } catch (err) {
        console.debug('[Refinzi] Could not dispatch install-time onboarding:', err);
      }
    } else if (details.reason === 'update') {
      // After an update the old content-script context is orphaned in every open
      // tab; re-inject so the new version is live without a manual refresh.
      await injectIntoOpenTabs();
    }
  });
}
