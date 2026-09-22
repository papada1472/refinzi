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

  // extension/src/utils/storage-batch.ts
  var SNAPSHOT_TTL_MS = 1500;
  var snapshots = {};
  function invalidateSnapshot(key) {
    delete snapshots[key];
  }
  async function readSnapshot(key, fallbackEmpty) {
    const snap = snapshots[key];
    if (snap && Date.now() - snap.at < SNAPSHOT_TTL_MS && snap.value !== void 0) {
      return normalize(snap.value, fallbackEmpty);
    }
    try {
      const res = await BrowserAPI.storage.local.get([key]);
      const raw = res?.[key];
      snapshots[key] = { value: raw ?? null, at: Date.now() };
      return normalize(raw, fallbackEmpty);
    } catch {
      delete snapshots[key];
      return fallbackEmpty;
    }
  }
  function normalize(value, fallbackEmpty) {
    if (Array.isArray(fallbackEmpty)) {
      return Array.isArray(value) ? value : fallbackEmpty;
    }
    return value === null || value === void 0 ? fallbackEmpty : value;
  }

  // extension/src/utils/storage.ts
  var DEFAULT_GEMINI_API_KEY = "";
  var DEFAULT_GROQ_API_KEY = "";
  var DEFAULT_BAI_API_KEY = "";
  var DEPRECATED_GEMINI_API_KEYS = [];
  var FREE_TIER_PROMPT_CAP = 25;
  var DEFAULT_PROVIDER_MODELS = {
    // `gemini-flash-latest` is an evergreen alias that always resolves to the
    // newest Flash model (currently Gemini 3.8 Flash), so it never goes stale.
    gemini: "gemini-flash-latest",
    openai: "gpt-5.6-luna",
    deepseek: "deepseek-flash",
    openrouter: "deepseek/deepseek-v4-flash-0731:free",
    groq: "openai/gpt-oss-120b",
    bai: "qwen3.8-flash"
  };
  var DEFAULT_SETTINGS = {
    enabled: true,
    defaultMode: "better",
    // Default: Refinzi Cloud Gateway (zero client-side credentials, 25/day free tier).
    provider: "gateway",
    apiKeys: {
      groq: DEFAULT_GROQ_API_KEY
    },
    models: { ...DEFAULT_PROVIDER_MODELS },
    gatewayUrl: "https://refinzi.com/api/v1/refine",
    enabledSites: {
      chatgpt: true,
      claude: true,
      gemini: true,
      perplexity: true
    },
    shortcuts: {
      better: "Ctrl+Shift+B",
      expert: "Ctrl+Shift+E"
    },
    theme: "dark",
    autoFocus: true,
    showInlineTrigger: true,
    holdThresholdMs: 350,
    autoApply: true,
    saveHistory: true,
    hasSeenOnboarding: false,
    freeUsageCount: 0,
    freeUsageDate: "",
    freeUsageExpired: false
  };
  var DEPRECATED_MODELS = {
    gemini: [
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-2.5-pro",
      "gemini-2.0-flash",
      "gemini-2.0-flash-exp",
      "gemini-2.0-flash-lite",
      "gemini-1.5-flash",
      "gemini-1.5-flash-8b",
      "gemini-1.5-pro",
      "gemini-3-flash-preview"
    ],
    openai: [
      "gpt-4o-mini",
      "gpt-4o",
      "gpt-4-turbo",
      "gpt-4",
      "gpt-3.5-turbo",
      "o1-mini",
      "o1-preview",
      "o3-mini"
    ],
    deepseek: [
      "deepseek-chat",
      "deepseek-reasoner",
      "deepseek-v4-flash",
      "deepseek-v4-flash-vision-exp"
    ],
    openrouter: [
      "meta-llama/llama-3.3-70b-instruct:free",
      "deepseek/deepseek-r1:free",
      "deepseek/deepseek-chat",
      "google/gemini-2.0-flash-exp:free",
      "google/gemma-2-9b-it:free",
      "qwen/qwen-2.5-coder-32b-instruct:free",
      "mistralai/mistral-7b-instruct:free"
    ],
    groq: [
      "llama-3.3-70b-versatile",
      "llama-3.1-70b-versatile",
      "llama-3.1-8b-instant",
      "mixtral-8x7b-32768"
    ],
    bai: []
  };
  var SETTINGS_KEY = "refinzi_settings";
  function invalidateSettingsCache() {
    invalidateSnapshot(SETTINGS_KEY);
  }
  async function getSettings() {
    try {
      const saved = await readSnapshot(SETTINGS_KEY, null);
      if (!saved) {
        return { ...DEFAULT_SETTINGS };
      }
      const savedGeminiKey = saved.apiKeys?.gemini;
      const isDeprecatedGemini = !savedGeminiKey || savedGeminiKey.startsWith("AQ.") || DEPRECATED_GEMINI_API_KEYS.includes(savedGeminiKey);
      const resolvedGeminiKey = isDeprecatedGemini ? "" : savedGeminiKey;
      const savedBaiKey = saved.apiKeys?.bai;
      const isDeprecatedBai = savedBaiKey && (savedBaiKey.startsWith("sk-ws-H.") || savedBaiKey === DEFAULT_BAI_API_KEY);
      const resolvedBaiKey = isDeprecatedBai ? "" : savedBaiKey || "";
      const savedModels = saved.models || {};
      const resolvedModels = { ...DEFAULT_PROVIDER_MODELS };
      Object.keys(resolvedModels).forEach((key) => {
        const savedModel = savedModels[key];
        const deprecated = DEPRECATED_MODELS[key];
        const isRetired = !savedModel || deprecated.includes(savedModel);
        resolvedModels[key] = isRetired ? DEFAULT_PROVIDER_MODELS[key] : savedModel;
      });
      return {
        ...DEFAULT_SETTINGS,
        ...saved,
        provider: saved.provider || "gateway",
        apiKeys: {
          ...DEFAULT_SETTINGS.apiKeys,
          ...saved.apiKeys || {},
          gemini: resolvedGeminiKey,
          bai: resolvedBaiKey
        },
        models: resolvedModels,
        enabledSites: {
          ...DEFAULT_SETTINGS.enabledSites,
          ...saved.enabledSites || {}
        }
      };
    } catch {
      invalidateSettingsCache();
      return { ...DEFAULT_SETTINGS };
    }
  }
  function getTodayDateString() {
    return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  }
  async function getFreeUsageStatus() {
    const settings = await getSettings();
    const today = getTodayDateString();
    const isNewDay = settings.freeUsageDate !== today;
    const count = isNewDay ? 0 : settings.freeUsageCount ?? 0;
    const expired = isNewDay ? false : settings.freeUsageExpired ?? false;
    return {
      count,
      cap: FREE_TIER_PROMPT_CAP,
      remaining: Math.max(0, FREE_TIER_PROMPT_CAP - count),
      expired,
      date: today
    };
  }

  // extension/src/utils/metrics.ts
  var DEFAULT_METRICS_CONFIG = {
    estimatedMinutesPerPrompt: 2.5,
    estimatedAvoidedIterations: 1.5,
    fallbackCostPerIteration: 8e-3
  };
  async function getMetricsConfig() {
    try {
      const res = await BrowserAPI.storage.local.get(["refinzi_metrics_config"]);
      return {
        ...DEFAULT_METRICS_CONFIG,
        ...res?.refinzi_metrics_config || {}
      };
    } catch {
      return { ...DEFAULT_METRICS_CONFIG };
    }
  }
  async function saveMetricsConfig(patch) {
    const current = await getMetricsConfig();
    const updated = { ...current, ...patch };
    try {
      await BrowserAPI.storage.local.set({ refinzi_metrics_config: updated });
    } catch (err) {
      console.error("[Refinzi] Failed to save metrics config:", err);
    }
    return updated;
  }

  // extension/popup/popup.ts
  document.addEventListener("DOMContentLoaded", async () => {
    const navButtons = document.querySelectorAll(".nav-btn");
    const tabViews = document.querySelectorAll(".tab-view");
    const linkViewAll = document.getElementById("link-view-all-history");
    const btnQuickProvider = document.getElementById("btn-quick-provider");
    const globalStatusText = document.getElementById("global-status-text");
    const engineName = document.getElementById("engine-name");
    const homeEngineBanner = document.getElementById("home-engine-banner");
    const engineTag = document.getElementById("engine-tag");
    const tabContextPill = document.getElementById("tab-context-pill");
    const tabContextDot = document.getElementById("tab-context-dot");
    const tabContextText = document.getElementById("tab-context-text");
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
    const sparklineLine = document.getElementById("sparkline-line");
    const sparklineFill = document.getElementById("sparkline-fill");
    const splitBarBetter = document.getElementById("split-bar-better");
    const splitBarExpert = document.getElementById("split-bar-expert");
    const filterChips = document.querySelectorAll(".filter-chip");
    const periodBetterCount = document.getElementById("period-better-count");
    const periodBetterPct = document.getElementById("period-better-pct");
    const periodExpertCount = document.getElementById("period-expert-count");
    const periodExpertPct = document.getElementById("period-expert-pct");
    const homeRecentList = document.getElementById("home-recent-list");
    const plgNudgeContainer = document.getElementById("plg-nudge-container");
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
    const btnToggleApiKey = document.getElementById("btn-toggle-api-key");
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
    const settingEstMinutes = document.getElementById("setting-est-minutes");
    const settingEstIterations = document.getElementById("setting-est-iterations");
    const settingFallbackCost = document.getElementById("setting-fallback-cost");
    const metricsConfigFeedback = document.getElementById("metrics-config-feedback");
    let currentSettings = {
      ...DEFAULT_SETTINGS,
      apiKeys: { ...DEFAULT_SETTINGS.apiKeys, gemini: DEFAULT_GEMINI_API_KEY }
    };
    let currentPeriod = "Week";
    let allHistory = [];
    let metricConfig = { ...DEFAULT_METRICS_CONFIG };
    let currentHistoryFilter = "all";
    const GUIDEBOOKS = {
      gemini: {
        icon: "\u26A1",
        name: "Google Gemini Flash Setup",
        url: "https://aistudio.google.com/app/apikey",
        tier: "Free Tier Available (Gemini 3.8 Flash)",
        defaultModel: DEFAULT_PROVIDER_MODELS.gemini,
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
        defaultModel: DEFAULT_PROVIDER_MODELS.openai,
        steps: [
          "Log in to your OpenAI Developer Platform account.",
          'Navigate to "API Keys" and click "Create new secret key".',
          "Paste below (recommended model: gpt-5.6-luna or gpt-5.6-terra)."
        ]
      },
      deepseek: {
        icon: "\u{1F40B}",
        name: "DeepSeek API Setup",
        url: "https://platform.deepseek.com/api_keys",
        tier: "Ultra-low cost (from ~$0.15/M tokens)",
        defaultModel: DEFAULT_PROVIDER_MODELS.deepseek,
        steps: [
          "Log in to DeepSeek Platform console.",
          "Create an API key in the API Keys section.",
          "Paste below (supports deepseek-flash & deepseek-v4-pro)."
        ]
      },
      openrouter: {
        icon: "\u{1F310}",
        name: "OpenRouter Multi-Model Setup",
        url: "https://openrouter.ai/keys",
        tier: "Free Models Supported",
        defaultModel: DEFAULT_PROVIDER_MODELS.openrouter,
        steps: [
          "Sign in to OpenRouter.ai with GitHub or Google.",
          "Generate a new API key from the Keys dashboard.",
          "Paste below (access DeepSeek V4 Flash, GLM 5.2, Gemma 4 and more)."
        ]
      },
      groq: {
        icon: "\u26A1",
        name: "Groq LPU Setup (Ultra-Fast ~300ms)",
        url: "https://console.groq.com/keys",
        tier: "Free Tier Available \xB7 Fastest Inference in AI",
        defaultModel: DEFAULT_PROVIDER_MODELS.groq,
        steps: [
          "Open console.groq.com/keys and log in or create an account.",
          'Click "Create API Key" and copy your gsk_... key.',
          'Paste your key below and click "Verify" to activate Groq LPU speed.'
        ]
      },
      bai: {
        icon: "\u{1F310}",
        name: "Refinzi Cloud AI (Qwen 3.8 / DeepSeek V4.1)",
        url: "https://refinzi.com",
        tier: "Cloud AI \xB7 Qwen 3.8 Flash / DeepSeek V4.1 / Qwen 3.7",
        defaultModel: DEFAULT_PROVIDER_MODELS.bai,
        steps: [
          "Connected automatically to high-speed Cloud AI inference.",
          "Supports Qwen 3.8 Flash (Default), DeepSeek V4.1 Flash, and Qwen 3.7 Flash.",
          'Paste your priority access key below and click "Verify" to test connection.'
        ]
      },
      gateway: {
        icon: "\u2601\uFE0F",
        name: "Refinzi Cloud Gateway (Free)",
        url: "https://refinzi.com",
        tier: "Free \xB7 No API Key Required",
        defaultModel: "gateway-default",
        steps: [
          "You are already connected \u2014 no setup required.",
          "The Refinzi Cloud Gateway routes through Gemini AI automatically.",
          "Optionally add your own API key below for priority access."
        ]
      }
    };
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
    const PLG_NUDGES = [
      {
        id: "nudge_first_use",
        pillar: "adoption",
        icon: "\u{1F680}",
        title: "Ready for your first calibration?",
        desc: "Type a draft in ChatGPT, Claude, or Perplexity and click the golden Orb for instant polish.",
        ctaText: "Settings \u2192",
        onCta: () => switchTab("tab-settings"),
        condition: (summary) => (summary.allTimeCount ?? summary.totalPromptsEnhanced) === 0
      },
      {
        id: "nudge_expert_mode",
        pillar: "adoption",
        icon: "\u{1F9E0}",
        title: "Try Expert mode (Hold 350ms)",
        desc: "Single click gives instant Better polish. Hold the Orb for 350ms to generate deep structured reasoning.",
        condition: (summary) => summary.betterCount > 0 && summary.expertCount === 0
      },
      {
        id: "nudge_milestone_5",
        pillar: "advocacy",
        icon: "\u{1F3C6}",
        title: "Prompt master in the making!",
        desc: "You have enhanced 5+ prompts with Refinzi. Share Refinzi with a colleague to boost their workflow.",
        ctaText: "Copy Link",
        onCta: () => {
          navigator.clipboard?.writeText("https://refinzi.com");
        },
        condition: (summary) => (summary.allTimeCount ?? summary.totalPromptsEnhanced) >= 5
      },
      {
        id: "nudge_awareness_provider",
        pillar: "awareness",
        icon: "\u26A1",
        title: "Connect a direct AI provider",
        desc: "Add your own free Gemini Flash or DeepSeek API key for 0-latency priority throughput.",
        ctaText: "Connect Key \u2192",
        onCta: () => switchTab("tab-settings"),
        condition: (_summary, settings) => settings.provider === "gateway" && !settings.apiKeys?.gemini
      },
      {
        id: "nudge_privacy_insight",
        pillar: "innovation",
        icon: "\u{1F512}",
        title: "Privacy-First Architecture",
        desc: "Your prompts and API keys are stored strictly in local browser storage, never sent to external servers.",
        condition: (summary) => (summary.allTimeCount ?? summary.totalPromptsEnhanced) >= 3
      }
    ];
    try {
      const cached = await BrowserAPI.storage.local.get(["refinzi_history", "refinzi_metrics_summary_cache"]);
      if (cached.refinzi_history && Array.isArray(cached.refinzi_history)) {
        allHistory = cached.refinzi_history;
        renderRecentList(allHistory);
      }
      if (cached.refinzi_metrics_summary_cache) {
        updateDashboardUI(cached.refinzi_metrics_summary_cache);
      }
    } catch {
    }
    try {
      const [settingsRes, summaryRes, historyRes] = await Promise.allSettled([
        BrowserAPI.runtime.sendMessage({ type: "REFINZI_GET_SETTINGS" }),
        BrowserAPI.runtime.sendMessage({ type: "REFINZI_GET_METRICS_SUMMARY" }),
        BrowserAPI.runtime.sendMessage({ type: "REFINZI_GET_HISTORY" })
      ]);
      currentSettings = settingsRes.status === "fulfilled" && settingsRes.value?.data ? settingsRes.value.data : {
        // Fallback only if the background service worker is unreachable.
        // Sourced from the single source of truth in utils/storage.ts.
        ...DEFAULT_SETTINGS,
        apiKeys: { ...DEFAULT_SETTINGS.apiKeys, gemini: DEFAULT_GEMINI_API_KEY }
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
    try {
      metricConfig = await getMetricsConfig();
    } catch {
      metricConfig = { ...DEFAULT_METRICS_CONFIG };
    }
    syncMetricConfigInputs();
    await updateHeaderEngineStatus(currentSettings.provider);
    resolveActiveTabContext();
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
          renderSparkline();
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
        tooltipTimeSaved.setAttribute("data-tooltip", summary.estimatedTimeSavedTooltip);
        tooltipTimeSaved.title = summary.estimatedTimeSavedTooltip;
      }
      if (metricCostSaved) {
        metricCostSaved.textContent = summary.estimatedCostSavedFormatted;
      }
      if (metricCostSub) {
        metricCostSub.textContent = summary.estimatedCostSavedSubtitle;
      }
      if (tooltipCostSaved && summary.estimatedCostSavedTooltip) {
        tooltipCostSaved.setAttribute("data-tooltip", summary.estimatedCostSavedTooltip);
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
      renderSplitBar(summary.betterPercentage, summary.expertPercentage);
      if (periodBetterCount) periodBetterCount.textContent = String(summary.betterCount);
      if (periodBetterPct) periodBetterPct.textContent = `(${summary.betterPercentage}%)`;
      if (periodExpertCount) periodExpertCount.textContent = String(summary.expertCount);
      if (periodExpertPct) periodExpertPct.textContent = `(${summary.expertPercentage}%)`;
      renderPlgNudges(summary, currentSettings);
      BrowserAPI.storage.local.set({ refinzi_metrics_summary_cache: summary }).catch(() => {
      });
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
      renderSparkline();
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
      let filtered = currentHistoryFilter === "all" ? items : items.filter((i) => i.mode === currentHistoryFilter);
      if (query) {
        filtered = filtered.filter(
          (i) => i.originalPrompt.toLowerCase().includes(query) || i.refinedPrompt.toLowerCase().includes(query) || i.targetAi.toLowerCase().includes(query)
        );
      }
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
    filterChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const filter = chip.getAttribute("data-filter");
        currentHistoryFilter = filter || "all";
        filterChips.forEach((c) => {
          c.classList.toggle("active", c === chip);
          c.setAttribute("aria-selected", c === chip ? "true" : "false");
        });
        renderFullHistory(allHistory);
      });
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
      await updateHeaderEngineStatus(provider);
      resolveActiveTabContext();
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
    btnToggleApiKey?.addEventListener("click", () => {
      if (!settingApiKey || !btnToggleApiKey) return;
      if (settingApiKey.type === "password") {
        settingApiKey.type = "text";
        btnToggleApiKey.textContent = "\u{1F648}";
        btnToggleApiKey.title = "Hide key";
        btnToggleApiKey.setAttribute("aria-label", "Hide API key");
      } else {
        settingApiKey.type = "password";
        btnToggleApiKey.textContent = "\u{1F441}\uFE0F";
        btnToggleApiKey.title = "Show key";
        btnToggleApiKey.setAttribute("aria-label", "Show API key");
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
    const btnCheckUpdate = document.getElementById("btn-check-update");
    const updateIcon = document.getElementById("update-icon");
    const updateBtnLabel = document.getElementById("update-btn-label");
    const updateStatusDot = document.getElementById("update-status-dot");
    const updateStatusText = document.getElementById("update-status-text");
    const updateNoticeText = document.getElementById("update-notice-text");
    const btnManageExtensions = document.getElementById("btn-manage-extensions");
    const shortcutBetterPill = document.getElementById("shortcut-better-pill");
    const shortcutExpertPill = document.getElementById("shortcut-expert-pill");
    let isUpdateAvailable = false;
    btnCheckUpdate?.addEventListener("click", async () => {
      if (isUpdateAvailable) {
        if (typeof chrome !== "undefined" && chrome.runtime?.reload) {
          if (updateNoticeText) updateNoticeText.textContent = "Reloading Refinzi\u2026";
          setTimeout(() => {
            chrome.runtime.reload();
          }, 300);
        }
        return;
      }
      if (updateIcon) updateIcon.classList.add("spinning");
      if (updateBtnLabel) updateBtnLabel.textContent = "Checking\u2026";
      if (updateStatusText) updateStatusText.textContent = "Checking\u2026";
      try {
        if (typeof chrome !== "undefined" && chrome.runtime?.requestUpdateCheck) {
          chrome.runtime.requestUpdateCheck((status, details) => {
            if (updateIcon) updateIcon.classList.remove("spinning");
            if (status === "update_available") {
              isUpdateAvailable = true;
              if (updateStatusDot) updateStatusDot.className = "update-status-dot update-ready";
              if (updateStatusText) updateStatusText.textContent = "Update Available!";
              if (btnCheckUpdate) {
                btnCheckUpdate.classList.add("btn-apply-update");
              }
              if (updateBtnLabel) updateBtnLabel.textContent = "\u26A1 Apply Update Now";
              if (updateNoticeText) {
                updateNoticeText.textContent = `New version (${details?.version || "Latest"}) is ready. Click to reload extension seamlessly.`;
                updateNoticeText.classList.add("success");
              }
            } else {
              if (updateStatusDot) updateStatusDot.className = "update-status-dot up-to-date";
              if (updateStatusText) updateStatusText.textContent = "Up to date";
              if (updateBtnLabel) updateBtnLabel.textContent = "Check for Updates";
              if (updateNoticeText) {
                updateNoticeText.textContent = "\u2713 You are running the newest version (v2.1.0). No updates needed.";
              }
            }
          });
        } else {
          setTimeout(() => {
            if (updateIcon) updateIcon.classList.remove("spinning");
            if (updateStatusDot) updateStatusDot.className = "update-status-dot up-to-date";
            if (updateStatusText) updateStatusText.textContent = "Up to date";
            if (updateBtnLabel) updateBtnLabel.textContent = "Check for Updates";
            if (updateNoticeText) {
              updateNoticeText.textContent = "\u2713 You are running the newest version (v2.1.0).";
            }
          }, 600);
        }
      } catch {
        if (updateIcon) updateIcon.classList.remove("spinning");
        if (updateBtnLabel) updateBtnLabel.textContent = "Check for Updates";
        if (updateNoticeText) updateNoticeText.textContent = "\u2713 You are running the newest version (v2.1.0).";
      }
    });
    btnManageExtensions?.addEventListener("click", () => {
      try {
        const isEdge = navigator.userAgent.includes("Edg/");
        const url = isEdge ? "edge://extensions" : "chrome://extensions";
        if (typeof chrome !== "undefined" && chrome.tabs?.create) {
          chrome.tabs.create({ url });
        } else {
          window.open(url, "_blank");
        }
      } catch {
      }
    });
    shortcutBetterPill?.addEventListener("click", () => {
      try {
        const isEdge = navigator.userAgent.includes("Edg/");
        const url = isEdge ? "edge://extensions/shortcuts" : "chrome://extensions/shortcuts";
        if (typeof chrome !== "undefined" && chrome.tabs?.create) {
          chrome.tabs.create({ url });
        } else {
          window.open(url, "_blank");
        }
      } catch {
      }
    });
    shortcutExpertPill?.addEventListener("click", () => {
      try {
        const isEdge = navigator.userAgent.includes("Edg/");
        const url = isEdge ? "edge://extensions/shortcuts" : "chrome://extensions/shortcuts";
        if (typeof chrome !== "undefined" && chrome.tabs?.create) {
          chrome.tabs.create({ url });
        } else {
          window.open(url, "_blank");
        }
      } catch {
      }
    });
    function syncMetricConfigInputs() {
      if (settingEstMinutes) {
        settingEstMinutes.value = String(metricConfig.estimatedMinutesPerPrompt ?? DEFAULT_METRICS_CONFIG.estimatedMinutesPerPrompt);
      }
      if (settingEstIterations) {
        settingEstIterations.value = String(metricConfig.estimatedAvoidedIterations ?? DEFAULT_METRICS_CONFIG.estimatedAvoidedIterations);
      }
      if (settingFallbackCost) {
        settingFallbackCost.value = String(metricConfig.fallbackCostPerIteration ?? DEFAULT_METRICS_CONFIG.fallbackCostPerIteration);
      }
    }
    async function commitMetricConfig() {
      const clampOrFallback = (input, fallback, min, max) => {
        const raw = Number(input?.value);
        if (!input || input.value.trim() === "" || !Number.isFinite(raw)) return fallback;
        return Math.min(max, Math.max(min, raw));
      };
      metricConfig = {
        ...metricConfig,
        estimatedMinutesPerPrompt: clampOrFallback(settingEstMinutes, DEFAULT_METRICS_CONFIG.estimatedMinutesPerPrompt, 0.5, 30),
        estimatedAvoidedIterations: clampOrFallback(settingEstIterations, DEFAULT_METRICS_CONFIG.estimatedAvoidedIterations, 0, 5),
        fallbackCostPerIteration: clampOrFallback(settingFallbackCost, DEFAULT_METRICS_CONFIG.fallbackCostPerIteration, 0, 1)
      };
      syncMetricConfigInputs();
      try {
        await saveMetricsConfig(metricConfig);
        await refreshMetrics();
        if (metricsConfigFeedback) {
          metricsConfigFeedback.textContent = "\u2713 Dashboard updated";
          metricsConfigFeedback.className = "action-feedback success";
          setTimeout(() => {
            if (metricsConfigFeedback) {
              metricsConfigFeedback.textContent = "";
              metricsConfigFeedback.className = "action-feedback";
            }
          }, 1800);
        }
      } catch {
        if (metricsConfigFeedback) {
          metricsConfigFeedback.textContent = "Could not save assumptions";
          metricsConfigFeedback.className = "action-feedback error";
        }
      }
    }
    [settingEstMinutes, settingEstIterations, settingFallbackCost].forEach((input) => {
      input?.addEventListener("change", commitMetricConfig);
    });
    function resolveActiveTabContext() {
      if (!tabContextPill || !tabContextDot || !tabContextText) return;
      setTabContextState("detecting", "Detecting\u2026");
      const SUPPORTED_SITES = [
        { match: "chat.openai.com", label: "ChatGPT" },
        { match: "chatgpt.com", label: "ChatGPT" },
        { match: "claude.ai", label: "Claude" },
        { match: "gemini.google.com", label: "Gemini" },
        { match: "perplexity.ai", label: "Perplexity" }
      ];
      const RESTRICTED_PATTERNS = [
        /^chrome:\/\//,
        /^chrome-extension:\/\//,
        /^about:/,
        /^edge:\/\//,
        /^moz-extension:\/\//,
        /^opera:\/\//,
        /^vivaldi:\/\//
      ];
      try {
        BrowserAPI.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
          const tab = tabs?.[0];
          const url = tab?.url || "";
          if (!url) {
            setTabContextState("restricted", "Restricted Tab");
            return;
          }
          if (RESTRICTED_PATTERNS.some((re) => re.test(url))) {
            setTabContextState("restricted", "Restricted Tab");
            return;
          }
          if (url === "about:blank" || url === "about:newtab") {
            setTabContextState("restricted", "New Tab");
            return;
          }
          const matched = SUPPORTED_SITES.find((site) => url.includes(site.match));
          if (matched) {
            setTabContextState("active", `Active on ${matched.label}`);
            return;
          }
          let domain = "";
          try {
            domain = new URL(url).hostname.replace(/^www\./, "");
          } catch {
            domain = "";
          }
          const label = domain ? `Universal \xB7 ${domain.slice(0, 18)}${domain.length > 18 ? "\u2026" : ""}` : "Universal Mode";
          setTabContextState("universal", label);
        }).catch(() => {
          setTabContextState("restricted", "Standing By");
        });
      } catch {
        setTabContextState("restricted", "Standing By");
      }
    }
    function setTabContextState(state, label) {
      if (!tabContextPill || !tabContextText) return;
      tabContextPill.className = `tab-context-pill state-${state}`;
      tabContextText.textContent = label;
    }
    function renderSparkline() {
      if (!sparklineLine || !sparklineFill) return;
      const counts = Array(7).fill(0);
      const now = Date.now();
      const DAY_MS = 24 * 60 * 60 * 1e3;
      for (const item of allHistory) {
        const daysAgo = Math.floor((now - item.timestamp) / DAY_MS);
        if (daysAgo >= 0 && daysAgo < 7) {
          counts[6 - daysAgo]++;
        }
      }
      const maxCount = Math.max(...counts, 1);
      const W = 120;
      const H = 28;
      const PAD = 3;
      const pts = counts.map((c, i) => {
        const x = i / (counts.length - 1) * W;
        const y = PAD + (1 - c / maxCount) * (H - PAD * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      });
      sparklineLine.setAttribute("points", pts.join(" "));
      const fillPts = [
        `0,${H}`,
        ...pts,
        `${W},${H}`
      ];
      sparklineFill.setAttribute("points", fillPts.join(" "));
    }
    function renderSplitBar(betterPct, expertPct) {
      if (!splitBarBetter || !splitBarExpert) return;
      if (betterPct === 0 && expertPct === 0) {
        splitBarBetter.style.width = "0%";
        splitBarExpert.style.width = "0%";
        return;
      }
      splitBarBetter.style.width = `${betterPct}%`;
      splitBarExpert.style.width = `${expertPct}%`;
    }
    function updateProviderForm(provider) {
      if (!settingKeyRow || !settingModelRow || !settingApiKey || !settingModel) return;
      if (provider === "local") {
        providerGuidebook?.classList.add("hidden");
        settingKeyRow.classList.add("hidden");
        settingModelRow.classList.add("hidden");
      } else if (provider === "gateway") {
        providerGuidebook?.classList.remove("hidden");
        settingKeyRow.classList.remove("hidden");
        settingModelRow.classList.add("hidden");
        const info = GUIDEBOOKS["gateway"];
        if (info && providerGuidebook) {
          if (guidebookIcon) guidebookIcon.textContent = info.icon;
          if (guidebookName) guidebookName.textContent = info.name;
          if (guidebookLink) {
            guidebookLink.href = info.url;
            guidebookLink.textContent = "Refinzi.com \u2197";
          }
          if (guidebookTier) guidebookTier.textContent = info.tier;
          if (guidebookSteps) {
            guidebookSteps.innerHTML = info.steps.map((s) => `<li>${s}</li>`).join("");
          }
        }
        const savedKey = currentSettings.apiKeys?.gateway || "";
        settingApiKey.value = savedKey;
        settingApiKey.placeholder = "Optional: Paste priority access key\u2026";
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
    async function updateHeaderEngineStatus(provider) {
      if (provider === "local") {
        if (globalStatusText) globalStatusText.textContent = "Local Ready";
        if (engineName) engineName.textContent = "Instant Local Engine (0ms)";
      } else if (provider === "gateway") {
        if (globalStatusText) globalStatusText.textContent = "Gateway Ready";
        if (engineName) engineName.textContent = "Refinzi Cloud Gateway (Free AI)";
      } else if (provider === "gemini") {
        const hasKey = Boolean(currentSettings?.apiKeys?.gemini);
        const bundledKeyInUse = !hasKey || currentSettings.apiKeys.gemini === DEFAULT_GEMINI_API_KEY;
        if (globalStatusText) globalStatusText.textContent = hasKey ? "Gemini 3.8 Flash" : "Gemini Flash";
        if (engineName) {
          engineName.textContent = bundledKeyInUse ? "Google Gemini Flash (bundled key)" : "Google Gemini 3.8 Flash (BYOK)";
        }
      } else if (provider === "bai") {
        const activeModel = currentSettings?.models?.bai || "Qwen 3.8 Flash";
        if (globalStatusText) globalStatusText.textContent = `${activeModel} Ready`;
        if (engineName) engineName.textContent = `Cloud AI (${activeModel})`;
      } else if (provider === "groq") {
        if (globalStatusText) globalStatusText.textContent = "Groq Ready";
        if (engineName) engineName.textContent = "Groq LPU (~300ms)";
      } else {
        const name = capitalize(provider);
        const hasKey = Boolean(currentSettings?.apiKeys?.[provider]);
        if (globalStatusText) globalStatusText.textContent = hasKey ? `${name} Ready` : `${name} (Configure)`;
        if (engineName) engineName.textContent = `${name} Engine (BYOK)`;
      }
      await applyFreeTierStatus();
    }
    async function applyFreeTierStatus() {
      if (!homeEngineBanner) return;
      homeEngineBanner.classList.remove("warn");
      homeEngineBanner.querySelectorAll(".engine-free").forEach((node) => node.remove());
      const bundledKeyInUse = Boolean(DEFAULT_GEMINI_API_KEY) && (!currentSettings?.apiKeys?.gemini || currentSettings.apiKeys.gemini === DEFAULT_GEMINI_API_KEY);
      if (currentSettings?.provider !== "gemini" || !bundledKeyInUse) {
        if (btnQuickProvider) btnQuickProvider.textContent = "Configure \u2192";
        return;
      }
      if (!engineName) return;
      let status;
      try {
        status = await getFreeUsageStatus();
      } catch {
        return;
      }
      const suffix = document.createElement("span");
      suffix.className = "engine-free";
      if (status.expired) {
        suffix.textContent = " \xB7 free prompts used up";
        homeEngineBanner.classList.add("warn");
        if (btnQuickProvider) btnQuickProvider.textContent = "Add your own key \u2192";
      } else {
        suffix.textContent = ` \xB7 ${status.remaining}/${status.cap} free left`;
        if (status.remaining <= 5) {
          homeEngineBanner.classList.add("warn");
          if (btnQuickProvider) btnQuickProvider.textContent = "Add your own key \u2192";
        } else if (btnQuickProvider) {
          btnQuickProvider.textContent = "Configure \u2192";
        }
      }
      engineName.appendChild(suffix);
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
    function renderPlgNudges(summary, settings) {
      if (!plgNudgeContainer) return;
      plgNudgeContainer.innerHTML = "";
      const activeNudge = PLG_NUDGES.find((n) => n.condition(summary, settings));
      if (!activeNudge) {
        plgNudgeContainer.style.display = "none";
        return;
      }
      plgNudgeContainer.style.display = "block";
      const card = document.createElement("div");
      card.className = `plg-nudge-card nudge-${activeNudge.pillar}`;
      card.innerHTML = `
      <div class="plg-nudge-body">
        <span class="plg-nudge-icon">${activeNudge.icon}</span>
        <div class="plg-nudge-text">
          <span class="plg-nudge-title">${escapeHtml(activeNudge.title)}</span>
          <span class="plg-nudge-desc">${escapeHtml(activeNudge.desc)}</span>
        </div>
      </div>
      ${activeNudge.ctaText ? `<button type="button" class="plg-nudge-cta">${escapeHtml(activeNudge.ctaText)}</button>` : ""}
    `;
      if (activeNudge.onCta) {
        const btn = card.querySelector(".plg-nudge-cta");
        btn?.addEventListener("click", (e) => {
          e.stopPropagation();
          activeNudge.onCta?.();
        });
      }
      plgNudgeContainer.appendChild(card);
    }
    function initAccessibleTooltips() {
      const tooltipEl = document.getElementById("refinzi-global-tooltip");
      if (!tooltipEl) return;
      let activeTarget = null;
      function showTooltip(target, text) {
        activeTarget = target;
        tooltipEl.textContent = text;
        tooltipEl.classList.remove("hidden");
        tooltipEl.classList.add("visible");
        const rect = target.getBoundingClientRect();
        const tooltipRect = tooltipEl.getBoundingClientRect();
        let top = rect.top - tooltipRect.height - 8;
        let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        if (top < 8) {
          top = rect.bottom + 8;
        }
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
          left = window.innerWidth - tooltipRect.width - 10;
        }
        tooltipEl.style.top = `${Math.round(top)}px`;
        tooltipEl.style.left = `${Math.round(left)}px`;
      }
      function hideTooltip() {
        activeTarget = null;
        tooltipEl.classList.remove("visible");
      }
      document.addEventListener("mouseover", (e) => {
        const target = e.target.closest("[data-tooltip]");
        if (!target) return;
        const text = target.getAttribute("data-tooltip");
        if (text && text.trim()) {
          showTooltip(target, text.trim());
        }
      });
      document.addEventListener("mouseout", (e) => {
        const target = e.target.closest("[data-tooltip]");
        if (target && target === activeTarget) {
          hideTooltip();
        }
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") hideTooltip();
      });
      window.addEventListener("scroll", hideTooltip, { passive: true });
    }
    initAccessibleTooltips();
  });
})();
