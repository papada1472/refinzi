"use strict";
(() => {
  // extension/src/browser/api.ts
  var BrowserAPIWrapper = class {
    rawBrowser;
    rawChrome;
    storage;
    runtime;
    commands;
    tabs;
    constructor() {
      this.rawBrowser = typeof globalThis.browser !== "undefined" ? globalThis.browser : null;
      this.rawChrome = typeof globalThis.chrome !== "undefined" ? globalThis.chrome : null;
      const getArea = (areaName) => {
        if (this.rawBrowser?.storage?.[areaName]) {
          return {
            get: (keys) => this.rawBrowser.storage[areaName].get(keys),
            set: (items) => this.rawBrowser.storage[areaName].set(items),
            remove: (keys) => this.rawBrowser.storage[areaName].remove(keys),
            clear: () => this.rawBrowser.storage[areaName].clear()
          };
        }
        if (this.rawChrome?.storage?.[areaName]) {
          const chromeArea = this.rawChrome.storage[areaName];
          return {
            get: (keys) => new Promise((resolve, reject) => {
              chromeArea.get(keys, (res) => {
                if (this.rawChrome.runtime?.lastError) {
                  reject(new Error(this.rawChrome.runtime.lastError.message));
                } else {
                  resolve(res || {});
                }
              });
            }),
            set: (items) => new Promise((resolve, reject) => {
              chromeArea.set(items, () => {
                if (this.rawChrome.runtime?.lastError) {
                  reject(new Error(this.rawChrome.runtime.lastError.message));
                } else {
                  resolve();
                }
              });
            }),
            remove: (keys) => new Promise((resolve, reject) => {
              chromeArea.remove(keys, () => {
                if (this.rawChrome.runtime?.lastError) {
                  reject(new Error(this.rawChrome.runtime.lastError.message));
                } else {
                  resolve();
                }
              });
            }),
            clear: () => new Promise((resolve, reject) => {
              chromeArea.clear(() => {
                if (this.rawChrome.runtime?.lastError) {
                  reject(new Error(this.rawChrome.runtime.lastError.message));
                } else {
                  resolve();
                }
              });
            })
          };
        }
        const memoryStore = /* @__PURE__ */ new Map();
        return {
          get: async (keys) => {
            if (!keys) return Object.fromEntries(memoryStore.entries());
            if (typeof keys === "string") return { [keys]: memoryStore.get(keys) };
            if (Array.isArray(keys)) {
              const out2 = {};
              for (const k of keys) out2[k] = memoryStore.get(k);
              return out2;
            }
            const out = { ...keys };
            for (const k of Object.keys(keys)) {
              if (memoryStore.has(k)) out[k] = memoryStore.get(k);
            }
            return out;
          },
          set: async (items) => {
            for (const [k, v] of Object.entries(items)) memoryStore.set(k, v);
          },
          remove: async (keys) => {
            const list = typeof keys === "string" ? [keys] : keys;
            for (const k of list) memoryStore.delete(k);
          },
          clear: async () => memoryStore.clear()
        };
      };
      this.storage = {
        local: getArea("local"),
        sync: getArea("sync")
      };
      const rawR = this.rawBrowser?.runtime || this.rawChrome?.runtime;
      this.runtime = {
        sendMessage: (message) => {
          if (this.rawBrowser?.runtime?.sendMessage) {
            return this.rawBrowser.runtime.sendMessage(message);
          }
          if (this.rawChrome?.runtime?.sendMessage) {
            return new Promise((resolve, reject) => {
              this.rawChrome.runtime.sendMessage(message, (response) => {
                const lastErr = this.rawChrome.runtime?.lastError;
                if (lastErr) {
                  reject(new Error(lastErr.message));
                } else {
                  resolve(response);
                }
              });
            });
          }
          return Promise.reject(new Error("Runtime messaging not supported in current environment"));
        },
        onMessage: {
          addListener: (callback) => {
            if (rawR?.onMessage?.addListener) {
              rawR.onMessage.addListener(callback);
            }
          },
          removeListener: (callback) => {
            if (rawR?.onMessage?.removeListener) {
              rawR.onMessage.removeListener(callback);
            }
          }
        },
        getURL: (path) => {
          if (rawR?.getURL) return rawR.getURL(path);
          return path;
        },
        getManifest: () => {
          if (rawR?.getManifest) return rawR.getManifest();
          return { name: "Refinzi", version: "2.1.0" };
        }
      };
      const rawC = this.rawBrowser?.commands || this.rawChrome?.commands;
      this.commands = {
        onCommand: {
          addListener: (cb) => {
            if (rawC?.onCommand?.addListener) rawC.onCommand.addListener(cb);
          },
          removeListener: (cb) => {
            if (rawC?.onCommand?.removeListener) rawC.onCommand.removeListener(cb);
          }
        }
      };
      const rawT = this.rawBrowser?.tabs || this.rawChrome?.tabs;
      this.tabs = {
        query: (queryInfo) => {
          if (this.rawBrowser?.tabs?.query) return this.rawBrowser.tabs.query(queryInfo);
          if (this.rawChrome?.tabs?.query) {
            return new Promise((resolve) => this.rawChrome.tabs.query(queryInfo, resolve));
          }
          return Promise.resolve([]);
        },
        sendMessage: (tabId, message) => {
          if (this.rawBrowser?.tabs?.sendMessage) return this.rawBrowser.tabs.sendMessage(tabId, message);
          if (this.rawChrome?.tabs?.sendMessage) {
            return new Promise((resolve, reject) => {
              this.rawChrome.tabs.sendMessage(tabId, message, (response) => {
                if (this.rawChrome.runtime?.lastError) {
                  reject(new Error(this.rawChrome.runtime.lastError.message));
                } else {
                  resolve(response);
                }
              });
            });
          }
          return Promise.resolve();
        }
      };
    }
    /**
     * Detected Browser Environment
     */
    get browserName() {
      if (typeof navigator !== "undefined") {
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes("edg/")) return "edge";
        if (ua.includes("firefox")) return "firefox";
        if (ua.includes("safari") && !ua.includes("chrome")) return "safari";
        if (ua.includes("chrome")) return "chrome";
      }
      if (this.rawBrowser && !this.rawChrome) return "firefox";
      return "generic";
    }
  };
  var BrowserAPI = new BrowserAPIWrapper();

  // extension/popup/popup.ts
  document.addEventListener("DOMContentLoaded", async () => {
    const navButtons = document.querySelectorAll(".nav-btn");
    const tabViews = document.querySelectorAll(".tab-view");
    const linkViewAll = document.getElementById("link-view-all-history");
    const btnQuickProvider = document.getElementById("btn-quick-provider");
    const globalStatusText = document.getElementById("global-status-text");
    const engineName = document.getElementById("engine-name");
    const periodBtns = document.querySelectorAll(".period-btn");
    const metricTotalPrompts = document.getElementById("metric-total-prompts");
    const metricPromptsSub = document.getElementById("metric-prompts-sub");
    const metricTimeSaved = document.getElementById("metric-time-saved");
    const metricTimeSub = document.getElementById("metric-time-sub");
    const tooltipTimeSaved = document.getElementById("tooltip-time-saved");
    const metricCostSaved = document.getElementById("metric-cost-saved");
    const metricCostSub = document.getElementById("metric-cost-sub");
    const tooltipCostSaved = document.getElementById("tooltip-cost-saved");
    const metricBetterExpertVal = document.getElementById("metric-better-expert-val");
    const metricBetterExpertSub = document.getElementById("metric-better-expert-sub");
    const periodBetterCount = document.getElementById("period-better-count");
    const periodBetterPct = document.getElementById("period-better-pct");
    const periodExpertCount = document.getElementById("period-expert-count");
    const periodExpertPct = document.getElementById("period-expert-pct");
    const homeRecentList = document.getElementById("home-recent-list");
    const historySearch = document.getElementById("history-search");
    const fullHistoryList = document.getElementById("full-history-list");
    const btnClearHistoryTop = document.getElementById("btn-clear-history-top");
    const detailModal = document.getElementById("history-detail-modal");
    const detailModeBadge = document.getElementById("detail-mode-badge");
    const detailTargetAi = document.getElementById("detail-target-ai");
    const detailTimestamp = document.getElementById("detail-timestamp");
    const detailOriginalText = document.getElementById("detail-original-text");
    const detailRefinedText = document.getElementById("detail-refined-text");
    const btnCopyDetail = document.getElementById("btn-copy-detail");
    const btnCloseDetail = document.getElementById("btn-close-detail");
    const settingProvider = document.getElementById("setting-provider");
    const settingKeyRow = document.getElementById("setting-key-row");
    const settingApiKey = document.getElementById("setting-api-key");
    const btnTestProvider = document.getElementById("btn-test-provider");
    const providerTestFeedback = document.getElementById("provider-test-feedback");
    const settingModelRow = document.getElementById("setting-model-row");
    const settingModel = document.getElementById("setting-model");
    const providerGuidebook = document.getElementById("provider-guidebook");
    const guidebookIcon = document.getElementById("guidebook-icon");
    const guidebookName = document.getElementById("guidebook-name");
    const guidebookLink = document.getElementById("guidebook-link");
    const guidebookSteps = document.getElementById("guidebook-steps");
    const guidebookTier = document.getElementById("guidebook-tier");
    const btnReplayOnboarding = document.getElementById("btn-replay-onboarding");
    const settingAutoApply = document.getElementById("setting-auto-apply");
    const settingHoldTime = document.getElementById("setting-hold-time");
    const settingDefaultMode = document.getElementById("setting-default-mode");
    const btnResetOrbPos = document.getElementById("btn-reset-orb-pos");
    const orbPosFeedback = document.getElementById("orb-pos-feedback");
    const settingSaveHistory = document.getElementById("setting-save-history");
    const btnClearAllData = document.getElementById("btn-clear-all-data");
    const privacyFeedback = document.getElementById("privacy-feedback");
    let currentSettings;
    let currentPeriod = "Week";
    let allHistory = [];
    try {
      const [settingsRes, summaryRes, historyRes] = await Promise.allSettled([
        BrowserAPI.runtime.sendMessage({ type: "REFINZI_GET_SETTINGS" }),
        BrowserAPI.runtime.sendMessage({ type: "REFINZI_GET_METRICS_SUMMARY" }),
        BrowserAPI.runtime.sendMessage({ type: "REFINZI_GET_HISTORY" })
      ]);
      currentSettings = settingsRes.status === "fulfilled" && settingsRes.value?.data ? settingsRes.value.data : {
        defaultMode: "better",
        provider: "gemini",
        apiKeys: {},
        models: { gemini: "gemini-2.5-flash" },
        gatewayUrl: "https://refinzi.com/api/v1/refine",
        enabledSites: { chatgpt: true, claude: true, gemini: true, perplexity: true },
        shortcuts: { better: "Ctrl+Shift+B", expert: "Ctrl+Shift+E" },
        theme: "dark",
        autoFocus: true,
        showInlineTrigger: true,
        holdThresholdMs: 350,
        autoApply: true,
        saveHistory: true
      };
      const initialSummary = summaryRes.status === "fulfilled" && summaryRes.value?.data ? summaryRes.value.data : null;
      if (initialSummary?.period) {
        currentPeriod = initialSummary.period;
      }
      allHistory = historyRes.status === "fulfilled" && Array.isArray(historyRes.value?.data) ? historyRes.value.data : [];
      updatePeriodToggleUI(currentPeriod);
      if (initialSummary) {
        updateDashboardUI(initialSummary);
      } else {
        await refreshMetrics();
      }
      renderRecentList(allHistory);
      renderFullHistory(allHistory);
    } catch (err) {
      console.error("[Refinzi] Initialization error:", err);
    }
    if (settingProvider) {
      settingProvider.value = currentSettings.provider;
      updateProviderForm(currentSettings.provider);
    }
    if (settingAutoApply) settingAutoApply.checked = currentSettings.autoApply !== false;
    if (settingHoldTime) settingHoldTime.value = String(currentSettings.holdThresholdMs || 350);
    if (settingDefaultMode) settingDefaultMode.value = currentSettings.defaultMode || "better";
    if (settingSaveHistory) settingSaveHistory.checked = currentSettings.saveHistory !== false;
    updateHeaderEngineStatus(currentSettings.provider);
    function switchTab(tabId) {
      navButtons.forEach((btn) => {
        if (btn.getAttribute("data-tab") === tabId) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
      tabViews.forEach((view) => {
        if (view.id === tabId) {
          view.classList.add("active");
        } else {
          view.classList.remove("active");
        }
      });
    }
    navButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = btn.getAttribute("data-tab");
        if (tab) switchTab(tab);
      });
    });
    linkViewAll?.addEventListener("click", () => switchTab("tab-history"));
    btnQuickProvider?.addEventListener("click", () => switchTab("tab-settings"));
    function updatePeriodToggleUI(activePeriod) {
      periodBtns.forEach((btn) => {
        const period = btn.getAttribute("data-period");
        if (period === activePeriod) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    }
    periodBtns.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const period = btn.getAttribute("data-period");
        if (!period || period === currentPeriod) return;
        currentPeriod = period;
        updatePeriodToggleUI(currentPeriod);
        await BrowserAPI.runtime.sendMessage({
          type: "REFINZI_SET_PERIOD",
          period
        });
        await refreshMetrics();
        renderRecentList(allHistory);
      });
    });
    async function refreshMetrics() {
      try {
        const res = await BrowserAPI.runtime.sendMessage({
          type: "REFINZI_GET_METRICS_SUMMARY",
          period: currentPeriod
        });
        const summary = res?.data;
        if (summary) {
          updateDashboardUI(summary);
        }
      } catch (err) {
        console.error("[Refinzi] Failed to refresh metrics:", err);
      }
    }
    function updateDashboardUI(summary) {
      if (metricTotalPrompts) {
        metricTotalPrompts.textContent = String(summary.totalPromptsEnhanced);
      }
      if (metricPromptsSub) {
        metricPromptsSub.textContent = summary.promptsPeriodSubtitle;
      }
      if (metricTimeSaved) {
        metricTimeSaved.textContent = summary.estimatedTimeSavedFormatted;
      }
      if (metricTimeSub) {
        metricTimeSub.textContent = "estimated";
      }
      if (tooltipTimeSaved && summary.estimatedTimeSavedTooltip) {
        tooltipTimeSaved.title = summary.estimatedTimeSavedTooltip;
      }
      if (metricCostSaved) {
        metricCostSaved.textContent = summary.estimatedCostSavedFormatted;
      }
      if (metricCostSub) {
        metricCostSub.textContent = summary.estimatedCostSavedSubtitle;
      }
      if (tooltipCostSaved && summary.estimatedCostSavedTooltip) {
        tooltipCostSaved.title = summary.estimatedCostSavedTooltip;
      }
      if (metricBetterExpertVal) {
        metricBetterExpertVal.textContent = `${summary.betterCount} / ${summary.expertCount}`;
      }
      if (metricBetterExpertSub) {
        let subText = "this week";
        if (summary.period === "Today") subText = "today";
        else if (summary.period === "Month") subText = "this month";
        else if (summary.period === "All Time") subText = "all time";
        metricBetterExpertSub.textContent = subText;
      }
      if (periodBetterCount) periodBetterCount.textContent = String(summary.betterCount);
      if (periodBetterPct) periodBetterPct.textContent = `(${summary.betterPercentage}%)`;
      if (periodExpertCount) periodExpertCount.textContent = String(summary.expertCount);
      if (periodExpertPct) periodExpertPct.textContent = `(${summary.expertPercentage}%)`;
    }
    async function refreshHistory() {
      try {
        const res = await BrowserAPI.runtime.sendMessage({ type: "REFINZI_GET_HISTORY" });
        allHistory = res?.data || [];
      } catch {
        allHistory = [];
      }
      renderRecentList(allHistory);
      renderFullHistory(allHistory);
    }
    function renderRecentList(items) {
      if (!homeRecentList) return;
      const now = Date.now();
      let filtered = items;
      if (currentPeriod === "Today") {
        const startOfToday = (/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0);
        filtered = items.filter((i) => i.timestamp >= startOfToday);
      } else if (currentPeriod === "Week") {
        const startOfWeek = now - 7 * 24 * 60 * 60 * 1e3;
        filtered = items.filter((i) => i.timestamp >= startOfWeek);
      } else if (currentPeriod === "Month") {
        const startOfMonth = now - 30 * 24 * 60 * 60 * 1e3;
        filtered = items.filter((i) => i.timestamp >= startOfMonth);
      }
      if (filtered.length === 0) {
        homeRecentList.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">\u26A1</span>
          <p class="empty-title">Ready to calibrate</p>
          <p class="empty-desc">Write your prompt in ChatGPT, Claude, Gemini, or Perplexity and click the Orb.</p>
        </div>
      `;
        return;
      }
      homeRecentList.innerHTML = "";
      filtered.slice(0, 4).forEach((item) => {
        const el = createActivityCard(item, async () => {
          await refreshHistory();
          await refreshMetrics();
        });
        homeRecentList.appendChild(el);
      });
    }
    function renderFullHistory(items) {
      if (!fullHistoryList) return;
      const query = historySearch?.value.trim().toLowerCase() || "";
      const filtered = query ? items.filter(
        (i) => i.originalPrompt.toLowerCase().includes(query) || i.refinedPrompt.toLowerCase().includes(query) || i.targetAi.toLowerCase().includes(query)
      ) : items;
      if (filtered.length === 0) {
        fullHistoryList.innerHTML = `
        <div class="empty-state" style="margin-top: 20px;">
          <span class="empty-icon">\u{1F552}</span>
          <p class="empty-title">No matching history</p>
          <p class="empty-desc">${query ? "Try a different search query." : "Calibrations will be logged here."}</p>
        </div>
      `;
        return;
      }
      fullHistoryList.innerHTML = "";
      filtered.forEach((item) => {
        const el = createActivityCard(item, async () => {
          await refreshHistory();
          await refreshMetrics();
        });
        fullHistoryList.appendChild(el);
      });
    }
    historySearch?.addEventListener("input", () => {
      renderFullHistory(allHistory);
    });
    function createActivityCard(item, onDeleted) {
      const card = document.createElement("div");
      card.className = "activity-item";
      card.setAttribute("data-id", item.id);
      const isBetter = item.mode === "better";
      const modeLabel = isBetter ? "Better" : "Expert";
      const relativeTime = formatRelativeTime(item.timestamp);
      const destinationLabel = capitalize(item.targetAi || "AI");
      const promptText = (item.originalPrompt || item.refinedPrompt || "").trim();
      const shortenedPrompt = promptText.length > 55 ? promptText.slice(0, 52).trim() + "\u2026" : promptText;
      card.innerHTML = `
      <div class="activity-item-main" title="${escapeHtml(promptText)}">
        <div class="activity-prompt-title">${escapeHtml(shortenedPrompt)}</div>
        <div class="activity-meta-line">
          <span class="activity-meta-mode ${isBetter ? "better" : "expert"}">${modeLabel}</span>
          <span class="activity-meta-sep">\xB7</span>
          <span class="activity-meta-target">${escapeHtml(destinationLabel)}</span>
          <span class="activity-meta-sep">\xB7</span>
          <span class="activity-meta-time">${relativeTime}</span>
        </div>
      </div>
      <div class="activity-actions">
        <button type="button" class="btn-item-action btn-copy-item" title="Copy calibrated prompt" aria-label="Copy prompt">\u{1F4CB}</button>
        <button type="button" class="btn-item-action btn-delete-item" title="Delete calibration" aria-label="Delete calibration">\u2715</button>
      </div>
    `;
      const mainSection = card.querySelector(".activity-item-main");
      mainSection?.addEventListener("click", () => {
        openDetailModal(item);
      });
      const copyBtn = card.querySelector(".btn-copy-item");
      copyBtn?.addEventListener("click", async (e) => {
        e.stopPropagation();
        const textToCopy = item.refinedPrompt || item.originalPrompt;
        try {
          await navigator.clipboard.writeText(textToCopy);
          copyBtn.textContent = "\u2713";
          copyBtn.classList.add("success");
          setTimeout(() => {
            copyBtn.textContent = "\u{1F4CB}";
            copyBtn.classList.remove("success");
          }, 1500);
        } catch {
          copyBtn.textContent = "\u2713";
          setTimeout(() => {
            copyBtn.textContent = "\u{1F4CB}";
          }, 1500);
        }
      });
      const deleteBtn = card.querySelector(".btn-delete-item");
      deleteBtn?.addEventListener("click", async (e) => {
        e.stopPropagation();
        try {
          await BrowserAPI.runtime.sendMessage({
            type: "REFINZI_DELETE_HISTORY_ITEM",
            id: item.id
          });
          allHistory = allHistory.filter((h) => h.id !== item.id);
          card.remove();
          if (onDeleted) await onDeleted();
        } catch (err) {
          console.error("[Refinzi] Failed to delete history item:", err);
        }
      });
      return card;
    }
    let currentDetailPrompt = "";
    function openDetailModal(item) {
      if (!detailModal || !detailModeBadge || !detailTargetAi || !detailTimestamp || !detailOriginalText || !detailRefinedText || !btnCopyDetail) {
        return;
      }
      const isBetter = item.mode === "better";
      detailModeBadge.className = `detail-mode-badge ${isBetter ? "better" : "expert"}`;
      detailModeBadge.textContent = isBetter ? "\u26A1 Better Prompt" : "\u{1F9E0} Expert Briefing";
      detailTargetAi.textContent = capitalize(item.targetAi || "AI");
      detailTimestamp.textContent = new Date(item.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
      detailOriginalText.textContent = item.originalPrompt;
      detailRefinedText.textContent = item.refinedPrompt;
      currentDetailPrompt = item.refinedPrompt;
      btnCopyDetail.innerHTML = "\u{1F4CB} Copy Calibrated";
      detailModal.classList.remove("hidden");
    }
    btnCloseDetail?.addEventListener("click", () => {
      detailModal?.classList.add("hidden");
    });
    detailModal?.addEventListener("click", (e) => {
      if (e.target === detailModal) detailModal.classList.add("hidden");
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && detailModal && !detailModal.classList.contains("hidden")) {
        detailModal.classList.add("hidden");
      }
    });
    btnCopyDetail?.addEventListener("click", async () => {
      if (!currentDetailPrompt || !btnCopyDetail) return;
      try {
        await navigator.clipboard.writeText(currentDetailPrompt);
        btnCopyDetail.innerHTML = "\u2713 Copied to Clipboard!";
        setTimeout(() => {
          if (btnCopyDetail) btnCopyDetail.innerHTML = "\u{1F4CB} Copy Calibrated";
        }, 1500);
      } catch {
        btnCopyDetail.innerHTML = "\u2713 Copied!";
      }
    });
    settingProvider?.addEventListener("change", async () => {
      if (!settingProvider) return;
      const provider = settingProvider.value;
      currentSettings.provider = provider;
      updateProviderForm(provider);
      updateHeaderEngineStatus(provider);
      await BrowserAPI.runtime.sendMessage({
        type: "REFINZI_SAVE_SETTINGS",
        settings: { provider }
      });
    });
    settingApiKey?.addEventListener("input", async () => {
      if (!settingProvider || !settingApiKey || !providerTestFeedback) return;
      const provider = settingProvider.value;
      const key = settingApiKey.value.trim();
      providerTestFeedback.textContent = "";
      providerTestFeedback.className = "field-feedback";
      const patchKeys = { ...currentSettings.apiKeys, [provider]: key };
      currentSettings.apiKeys = patchKeys;
      await BrowserAPI.runtime.sendMessage({
        type: "REFINZI_SAVE_SETTINGS",
        settings: { apiKeys: patchKeys }
      });
    });
    settingModel?.addEventListener("input", async () => {
      if (!settingProvider || !settingModel) return;
      const provider = settingProvider.value;
      const model = settingModel.value.trim();
      const patchModels = { ...currentSettings.models, [provider]: model };
      currentSettings.models = patchModels;
      await BrowserAPI.runtime.sendMessage({
        type: "REFINZI_SAVE_SETTINGS",
        settings: { models: patchModels }
      });
    });
    btnTestProvider?.addEventListener("click", async () => {
      if (!settingProvider || !settingApiKey || !providerTestFeedback) return;
      const provider = settingProvider.value;
      const key = settingApiKey.value.trim();
      providerTestFeedback.textContent = "Verifying\u2026";
      providerTestFeedback.className = "field-feedback";
      try {
        const res = await BrowserAPI.runtime.sendMessage({
          type: "REFINZI_TEST_PROVIDER",
          provider,
          apiKey: key
        });
        if (res && res.success && res.data?.ok) {
          providerTestFeedback.textContent = "\u2713 Verified & Ready";
          providerTestFeedback.className = "field-feedback success";
        } else {
          providerTestFeedback.textContent = res?.data?.message || "Verification failed";
          providerTestFeedback.className = "field-feedback error";
        }
      } catch {
        providerTestFeedback.textContent = "Connection error";
        providerTestFeedback.className = "field-feedback error";
      }
    });
    settingAutoApply?.addEventListener("change", async () => {
      if (!settingAutoApply) return;
      const autoApply = settingAutoApply.checked;
      await BrowserAPI.runtime.sendMessage({
        type: "REFINZI_SAVE_SETTINGS",
        settings: { autoApply }
      });
    });
    settingHoldTime?.addEventListener("change", async () => {
      if (!settingHoldTime) return;
      const holdThresholdMs = parseInt(settingHoldTime.value, 10);
      await BrowserAPI.runtime.sendMessage({
        type: "REFINZI_SAVE_SETTINGS",
        settings: { holdThresholdMs }
      });
    });
    settingDefaultMode?.addEventListener("change", async () => {
      if (!settingDefaultMode) return;
      const defaultMode = settingDefaultMode.value;
      await BrowserAPI.runtime.sendMessage({
        type: "REFINZI_SAVE_SETTINGS",
        settings: { defaultMode }
      });
    });
    btnResetOrbPos?.addEventListener("click", async () => {
      if (!orbPosFeedback) return;
      orbPosFeedback.textContent = "Position reset to composer docking!";
      orbPosFeedback.className = "action-feedback success";
      setTimeout(() => {
        if (orbPosFeedback) orbPosFeedback.textContent = "";
      }, 2e3);
    });
    settingSaveHistory?.addEventListener("change", async () => {
      if (!settingSaveHistory) return;
      const saveHistory = settingSaveHistory.checked;
      await BrowserAPI.runtime.sendMessage({
        type: "REFINZI_SAVE_SETTINGS",
        settings: { saveHistory }
      });
    });
    btnReplayOnboarding?.addEventListener("click", async () => {
      try {
        const tabs = await BrowserAPI.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]?.id) {
          await BrowserAPI.tabs.sendMessage(tabs[0].id, { type: "REFINZI_SHOW_ONBOARDING" });
          window.close();
        }
      } catch {
      }
    });
    btnClearAllData?.addEventListener("click", async () => {
      if (confirm("Clear all Refinzi prompt history on this device?")) {
        await BrowserAPI.runtime.sendMessage({ type: "REFINZI_CLEAR_HISTORY" });
        if (privacyFeedback) {
          privacyFeedback.textContent = "\u2713 History cleared";
          privacyFeedback.className = "action-feedback success";
        }
        await refreshHistory();
        await refreshMetrics();
        setTimeout(() => {
          if (privacyFeedback) privacyFeedback.textContent = "";
        }, 2500);
      }
    });
    btnClearHistoryTop?.addEventListener("click", async () => {
      await BrowserAPI.runtime.sendMessage({ type: "REFINZI_CLEAR_HISTORY" });
      await refreshHistory();
      await refreshMetrics();
    });
    const GUIDEBOOKS = {
      gemini: {
        icon: "\u26A1",
        name: "Google Gemini Flash Setup",
        url: "https://aistudio.google.com/app/apikey",
        tier: "Free Tier Available (15 RPM / 1M TPM)",
        defaultModel: "gemini-2.5-flash",
        steps: [
          "Open Google AI Studio with your Google account.",
          'Click "Create API Key" to generate a free Gemini key.',
          'Paste your key below and click "Verify" to activate Gemini Flash.'
        ]
      },
      openai: {
        icon: "\u{1F916}",
        name: "OpenAI API Setup",
        url: "https://platform.openai.com/api-keys",
        tier: "Pay-as-you-go",
        defaultModel: "gpt-4o-mini",
        steps: [
          "Log in to your OpenAI Developer Platform account.",
          'Navigate to "API Keys" and click "Create new secret key".',
          "Paste below (recommended model: gpt-4o-mini or o3-mini)."
        ]
      },
      deepseek: {
        icon: "\u{1F40B}",
        name: "DeepSeek API Setup",
        url: "https://platform.deepseek.com/api_keys",
        tier: "Ultra-low cost (~$0.14/M tokens)",
        defaultModel: "deepseek-chat",
        steps: [
          "Log in to DeepSeek Platform console.",
          "Create an API key in the API Keys section.",
          "Paste below (supports V3 deepseek-chat & R1 reasoner)."
        ]
      },
      openrouter: {
        icon: "\u{1F310}",
        name: "OpenRouter Multi-Model Setup",
        url: "https://openrouter.ai/keys",
        tier: "Free Models Supported",
        defaultModel: "meta-llama/llama-3.3-70b-instruct:free",
        steps: [
          "Sign in to OpenRouter.ai with GitHub or Google.",
          "Generate a new API key from the Keys dashboard.",
          "Paste below (access Llama 3.3 70B, DeepSeek R1, and Gemini 2.0)."
        ]
      },
      gateway: {
        icon: "\u2601\uFE0F",
        name: "Refinzi Cloud Gateway",
        url: "https://refinzi.com",
        tier: "Official Hosted Service",
        defaultModel: "gateway-default",
        steps: [
          "Connects through the official Refinzi Cloud Gateway.",
          "Provides high-throughput multi-model fallback.",
          "Requires active Refinzi Pro token."
        ]
      }
    };
    function updateProviderForm(provider) {
      if (!settingKeyRow || !settingModelRow || !settingApiKey || !settingModel) return;
      if (provider === "local") {
        providerGuidebook?.classList.add("hidden");
        settingKeyRow.classList.add("hidden");
        settingModelRow.classList.add("hidden");
      } else {
        providerGuidebook?.classList.remove("hidden");
        settingKeyRow.classList.remove("hidden");
        settingModelRow.classList.remove("hidden");
        const info = GUIDEBOOKS[provider];
        if (info && providerGuidebook) {
          if (guidebookIcon) guidebookIcon.textContent = info.icon;
          if (guidebookName) guidebookName.textContent = info.name;
          if (guidebookLink) {
            guidebookLink.href = info.url;
            guidebookLink.textContent = `Get ${capitalize(provider)} Key \u2197`;
          }
          if (guidebookTier) guidebookTier.textContent = info.tier;
          if (guidebookSteps) {
            guidebookSteps.innerHTML = info.steps.map((s) => `<li>${s}</li>`).join("");
          }
        }
        const savedKey = currentSettings.apiKeys?.[provider] || "";
        settingApiKey.value = savedKey;
        settingApiKey.placeholder = `Paste ${provider.toUpperCase()} API key\u2026`;
        const savedModel = currentSettings.models?.[provider] || (info ? info.defaultModel : "");
        settingModel.value = savedModel;
      }
    }
    function updateHeaderEngineStatus(provider) {
      if (provider === "local") {
        if (globalStatusText) globalStatusText.textContent = "Local Ready";
        if (engineName) engineName.textContent = "Instant Local Engine (0ms)";
      } else if (provider === "gemini") {
        const hasKey = Boolean(currentSettings?.apiKeys?.gemini);
        if (globalStatusText) globalStatusText.textContent = hasKey ? "Gemini 2.5 Flash" : "Gemini Flash";
        if (engineName) engineName.textContent = hasKey ? "Google Gemini 2.5 Flash (BYOK)" : "Google Gemini Flash (Default)";
      } else {
        const name = capitalize(provider);
        const hasKey = Boolean(currentSettings?.apiKeys?.[provider]);
        if (globalStatusText) globalStatusText.textContent = hasKey ? `${name} Ready` : `${name} (Configure)`;
        if (engineName) engineName.textContent = `${name} Engine (BYOK)`;
      }
    }
    function formatRelativeTime(ts) {
      const diffMs = Date.now() - ts;
      const mins = Math.floor(diffMs / 6e4);
      if (mins < 1) return "Just now";
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    }
    function capitalize(str) {
      if (!str) return "";
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
    function escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }
  });
})();
