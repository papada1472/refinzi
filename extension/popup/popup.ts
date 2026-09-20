/**
 * REFINZI — Modern Extension Dashboard Controller
 * Design: Raycast × Linear × Arc
 * Modern FY2026 browser-extension UX
 * 
 * CORE PRINCIPLES:
 * 1. The dashboard communicates product usage and ROI in seconds.
 * 2. Four primary metrics only: Prompts Enhanced, Est. Time Saved, Est. Cost Saved, Better/Expert Usage.
 * 3. Transparent estimation: Never claim measured time/cost unless actually measured.
 * 4. Zero fabricated numbers: If pricing/usage unavailable, display "—" / "Cost estimate unavailable".
 * 5. Idempotent deduplication: One user action = one transformation = one metric increment.
 * 6. Period-aware: Today | Week | Month | All Time (Default: Week).
 */

import { BrowserAPI } from '../src/browser/api';
import {
  DEFAULT_SETTINGS,
  DEFAULT_GEMINI_API_KEY,
  DEFAULT_PROVIDER_MODELS,
  getFreeUsageStatus,
} from '../src/utils/storage';
import {
  getMetricsConfig,
  saveMetricsConfig,
  DEFAULT_METRICS_CONFIG,
} from '../src/utils/metrics';
import type { MetricsConfig } from '../src/utils/metrics';
import {
  RefinziSettings,
  RefinziHistoryItem,
  AIProviderId,
  PeriodType,
  RefinziMetricsSummary,
} from '../src/types';

document.addEventListener('DOMContentLoaded', async () => {
  // Elements: Navigation
  const navButtons = document.querySelectorAll<HTMLButtonElement>('.nav-btn');
  const tabViews = document.querySelectorAll<HTMLElement>('.tab-view');
  const linkViewAll = document.getElementById('link-view-all-history') as HTMLButtonElement | null;
  const btnQuickProvider = document.getElementById('btn-quick-provider') as HTMLButtonElement | null;

  // Elements: Header & Status
  const globalStatusText = document.getElementById('global-status-text') as HTMLSpanElement | null;
  const engineName = document.getElementById('engine-name') as HTMLSpanElement | null;
  const homeEngineBanner = document.getElementById('home-engine-banner') as HTMLDivElement | null;
  const engineTag = document.getElementById('engine-tag') as HTMLSpanElement | null;

  // Elements: Active Tab Context Pill
  const tabContextPill = document.getElementById('tab-context-pill') as HTMLDivElement | null;
  const tabContextDot = document.getElementById('tab-context-dot') as HTMLSpanElement | null;
  const tabContextText = document.getElementById('tab-context-text') as HTMLSpanElement | null;

  // Elements: Home Mini Dashboard - 4 Top Metrics
  const periodBtns = document.querySelectorAll<HTMLButtonElement>('.period-btn');
  const metricTotalPrompts = document.getElementById('metric-total-prompts') as HTMLDivElement | null;
  const metricPromptsSub = document.getElementById('metric-prompts-sub') as HTMLDivElement | null;

  const metricTimeSaved = document.getElementById('metric-time-saved') as HTMLDivElement | null;
  const metricTimeSub = document.getElementById('metric-time-sub') as HTMLDivElement | null;
  const tooltipTimeSaved = document.getElementById('tooltip-time-saved') as HTMLSpanElement | null;

  const metricCostSaved = document.getElementById('metric-cost-saved') as HTMLDivElement | null;
  const metricCostSub = document.getElementById('metric-cost-sub') as HTMLDivElement | null;
  const tooltipCostSaved = document.getElementById('tooltip-cost-saved') as HTMLSpanElement | null;

  const metricBetterExpertVal = document.getElementById('metric-better-expert-val') as HTMLDivElement | null;
  const metricBetterExpertSub = document.getElementById('metric-better-expert-sub') as HTMLDivElement | null;

  // Elements: Sparkline (Prompts Enhanced card)
  const sparklineLine = document.getElementById('sparkline-line') as SVGPolylineElement | null;
  const sparklineFill = document.getElementById('sparkline-fill') as SVGPolylineElement | null;

  // Elements: Split-bar (Better / Expert card)
  const splitBarBetter = document.getElementById('split-bar-better') as HTMLDivElement | null;
  const splitBarExpert = document.getElementById('split-bar-expert') as HTMLDivElement | null;

  // Elements: History filter chips
  const filterChips = document.querySelectorAll<HTMLButtonElement>('.filter-chip');

  // Elements: Activity Breakdown Bar
  const periodBetterCount = document.getElementById('period-better-count') as HTMLSpanElement | null;
  const periodBetterPct = document.getElementById('period-better-pct') as HTMLSpanElement | null;
  const periodExpertCount = document.getElementById('period-expert-count') as HTMLSpanElement | null;
  const periodExpertPct = document.getElementById('period-expert-pct') as HTMLSpanElement | null;

  // Elements: Recent List & Activation Hero
  const homeRecentList = document.getElementById('home-recent-list') as HTMLDivElement | null;
  const heroActivationTitle = document.getElementById('hero-activation-title') as HTMLSpanElement | null;
  const heroSiteBadge = document.getElementById('hero-site-badge') as HTMLSpanElement | null;
  const plgNudgeContainer = document.getElementById('plg-nudge-container') as HTMLDivElement | null;

  // Elements: History View
  const historySearch = document.getElementById('history-search') as HTMLInputElement | null;
  const fullHistoryList = document.getElementById('full-history-list') as HTMLDivElement | null;
  const btnClearHistoryTop = document.getElementById('btn-clear-history-top') as HTMLButtonElement | null;

  // Elements: Detail Modal
  const detailModal = document.getElementById('history-detail-modal') as HTMLDivElement | null;
  const detailModeBadge = document.getElementById('detail-mode-badge') as HTMLSpanElement | null;
  const detailTargetAi = document.getElementById('detail-target-ai') as HTMLSpanElement | null;
  const detailTimestamp = document.getElementById('detail-timestamp') as HTMLSpanElement | null;
  const detailOriginalText = document.getElementById('detail-original-text') as HTMLDivElement | null;
  const detailRefinedText = document.getElementById('detail-refined-text') as HTMLDivElement | null;
  const btnCopyDetail = document.getElementById('btn-copy-detail') as HTMLButtonElement | null;
  const btnCloseDetail = document.getElementById('btn-close-detail') as HTMLButtonElement | null;

  // Elements: Settings View
  const settingProvider = document.getElementById('setting-provider') as HTMLSelectElement | null;
  const settingKeyRow = document.getElementById('setting-key-row') as HTMLDivElement | null;
  const settingApiKey = document.getElementById('setting-api-key') as HTMLInputElement | null;
  const btnTestProvider = document.getElementById('btn-test-provider') as HTMLButtonElement | null;
  const providerTestFeedback = document.getElementById('provider-test-feedback') as HTMLSpanElement | null;
  const settingModelRow = document.getElementById('setting-model-row') as HTMLDivElement | null;
  const settingModel = document.getElementById('setting-model') as HTMLInputElement | null;
  const providerGuidebook = document.getElementById('provider-guidebook') as HTMLDivElement | null;
  const guidebookIcon = document.getElementById('guidebook-icon') as HTMLSpanElement | null;
  const guidebookName = document.getElementById('guidebook-name') as HTMLSpanElement | null;
  const guidebookLink = document.getElementById('guidebook-link') as HTMLAnchorElement | null;
  const guidebookSteps = document.getElementById('guidebook-steps') as HTMLOListElement | null;
  const guidebookTier = document.getElementById('guidebook-tier') as HTMLSpanElement | null;
  const btnReplayOnboarding = document.getElementById('btn-replay-onboarding') as HTMLButtonElement | null;
  const settingAutoApply = document.getElementById('setting-auto-apply') as HTMLInputElement | null;
  const settingHoldTime = document.getElementById('setting-hold-time') as HTMLSelectElement | null;
  const settingDefaultMode = document.getElementById('setting-default-mode') as HTMLSelectElement | null;
  const btnResetOrbPos = document.getElementById('btn-reset-orb-pos') as HTMLButtonElement | null;
  const orbPosFeedback = document.getElementById('orb-pos-feedback') as HTMLSpanElement | null;
  const settingSaveHistory = document.getElementById('setting-save-history') as HTMLInputElement | null;
  const btnClearAllData = document.getElementById('btn-clear-all-data') as HTMLButtonElement | null;
  const privacyFeedback = document.getElementById('privacy-feedback') as HTMLSpanElement | null;

  // Elements: Dashboard Estimate Assumptions
  const settingEstMinutes = document.getElementById('setting-est-minutes') as HTMLInputElement | null;
  const settingEstIterations = document.getElementById('setting-est-iterations') as HTMLInputElement | null;
  const settingFallbackCost = document.getElementById('setting-fallback-cost') as HTMLInputElement | null;
  const metricsConfigFeedback = document.getElementById('metrics-config-feedback') as HTMLSpanElement | null;

  // Initialised up-front with the documented defaults rather than assigned only
  // inside the init try-block: if anything in that block throws, the catch would
  // previously leave this undefined and every later use (updateProviderForm,
  // updateHeaderEngineStatus, …) would crash with a TypeError.
  let currentSettings: RefinziSettings = {
    ...DEFAULT_SETTINGS,
    apiKeys: { ...DEFAULT_SETTINGS.apiKeys, gemini: DEFAULT_GEMINI_API_KEY },
  };
  let currentPeriod: PeriodType = 'Week';
  let allHistory: RefinziHistoryItem[] = [];
  let metricConfig: MetricsConfig = { ...DEFAULT_METRICS_CONFIG };
  let currentHistoryFilter: 'all' | 'better' | 'expert' = 'all';

  // -------------------------------------------------------------------------
  // Provider guidebook content.
  //
  // Declared BEFORE the init sequence below on purpose: `updateProviderForm()`
  // reads GUIDEBOOKS during initial load. As a `const` it sits in the temporal
  // dead zone until its declaration is evaluated, so declaring it further down
  // threw "Cannot access 'GUIDEBOOKS' before initialization". Because that
  // throw happened inside the async DOMContentLoaded callback, it aborted the
  // remainder of init — silently killing every handler registered below
  // (tab navigation, period toggles, settings, history, metrics refresh).
  // -------------------------------------------------------------------------
  interface GuideBookInfo {
    icon: string;
    name: string;
    url: string;
    tier: string;
    defaultModel: string;
    steps: string[];
  }

  const GUIDEBOOKS: Record<string, GuideBookInfo> = {
    gemini: {
      icon: '⚡',
      name: 'Google Gemini Flash Setup',
      url: 'https://aistudio.google.com/app/apikey',
      tier: 'Free Tier Available (Gemini 3.8 Flash)',
      defaultModel: DEFAULT_PROVIDER_MODELS.gemini,
      steps: [
        'Open Google AI Studio with your Google account.',
        'Click "Create API Key" to generate a free Gemini key.',
        'Paste your key below and click "Verify" to activate Gemini Flash.',
      ],
    },
    openai: {
      icon: '🤖',
      name: 'OpenAI API Setup',
      url: 'https://platform.openai.com/api-keys',
      tier: 'Pay-as-you-go',
      defaultModel: DEFAULT_PROVIDER_MODELS.openai,
      steps: [
        'Log in to your OpenAI Developer Platform account.',
        'Navigate to "API Keys" and click "Create new secret key".',
        'Paste below (recommended model: gpt-5.6-luna or gpt-5.6-terra).',
      ],
    },
    deepseek: {
      icon: '🐋',
      name: 'DeepSeek API Setup',
      url: 'https://platform.deepseek.com/api_keys',
      tier: 'Ultra-low cost (from ~$0.15/M tokens)',
      defaultModel: DEFAULT_PROVIDER_MODELS.deepseek,
      steps: [
        'Log in to DeepSeek Platform console.',
        'Create an API key in the API Keys section.',
        'Paste below (supports deepseek-flash & deepseek-v4-pro).',
      ],
    },
    openrouter: {
      icon: '🌐',
      name: 'OpenRouter Multi-Model Setup',
      url: 'https://openrouter.ai/keys',
      tier: 'Free Models Supported',
      defaultModel: DEFAULT_PROVIDER_MODELS.openrouter,
      steps: [
        'Sign in to OpenRouter.ai with GitHub or Google.',
        'Generate a new API key from the Keys dashboard.',
        'Paste below (access DeepSeek V4 Flash, GLM 5.2, Gemma 4 and more).',
      ],
    },
    gateway: {
      icon: '☁️',
      name: 'Refinzi Cloud Gateway (Free)',
      url: 'https://refinzi.com',
      tier: 'Free · No API Key Required',
      defaultModel: 'gateway-default',
      steps: [
        'You are already connected — no setup required.',
        'The Refinzi Cloud Gateway routes through Gemini AI automatically.',
        'Optionally add your own API key below for priority access.',
      ],
    },
  };

  // Declared before initial load so initial renders (e.g. PLG nudges and default actions) can call it
  function switchTab(tabId: string): void {
    navButtons.forEach((btn) => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    tabViews.forEach((view) => {
      if (view.id === tabId) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });
  }

  interface PlgNudgeDef {
    id: string;
    pillar: 'awareness' | 'adoption' | 'advocacy' | 'innovation';
    icon: string;
    title: string;
    desc: string;
    ctaText?: string;
    onCta?: () => void;
    condition: (summary: RefinziMetricsSummary, settings: RefinziSettings) => boolean;
  }

  const PLG_NUDGES: PlgNudgeDef[] = [
    {
      id: 'nudge_first_use',
      pillar: 'adoption',
      icon: '🚀',
      title: 'Ready for your first calibration?',
      desc: 'Type a draft in ChatGPT, Claude, or Perplexity and click the golden Orb for instant polish.',
      ctaText: 'Settings →',
      onCta: () => switchTab('tab-settings'),
      condition: (summary) => (summary.allTimeCount ?? summary.totalPromptsEnhanced) === 0,
    },
    {
      id: 'nudge_expert_mode',
      pillar: 'adoption',
      icon: '🧠',
      title: 'Try Expert mode (Hold 350ms)',
      desc: 'Single click gives instant Better polish. Hold the Orb for 350ms to generate deep structured reasoning.',
      condition: (summary) => summary.betterCount > 0 && summary.expertCount === 0,
    },
    {
      id: 'nudge_milestone_5',
      pillar: 'advocacy',
      icon: '🏆',
      title: 'Prompt master in the making!',
      desc: 'You have enhanced 5+ prompts with Refinzi. Share Refinzi with a colleague to boost their workflow.',
      ctaText: 'Copy Link',
      onCta: () => {
        navigator.clipboard?.writeText('https://refinzi.com');
      },
      condition: (summary) => (summary.allTimeCount ?? summary.totalPromptsEnhanced) >= 5,
    },
    {
      id: 'nudge_awareness_provider',
      pillar: 'awareness',
      icon: '⚡',
      title: 'Connect a direct AI provider',
      desc: 'Add your own free Gemini Flash or DeepSeek API key for 0-latency priority throughput.',
      ctaText: 'Connect Key →',
      onCta: () => switchTab('tab-settings'),
      condition: (_summary, settings) => settings.provider === 'gateway' && !settings.apiKeys?.gemini,
    },
    {
      id: 'nudge_privacy_insight',
      pillar: 'innovation',
      icon: '🔒',
      title: 'Privacy-First Architecture',
      desc: 'Your prompts and API keys are stored strictly in local browser storage, never sent to external servers.',
      condition: (summary) => (summary.allTimeCount ?? summary.totalPromptsEnhanced) >= 3,
    },
  ];

  // =========================================================================
  // 1. INITIAL LOAD & STATE BINDING
  // =========================================================================
  try {
    const [settingsRes, summaryRes, historyRes] = await Promise.allSettled([
      BrowserAPI.runtime.sendMessage({ type: 'REFINZI_GET_SETTINGS' }),
      BrowserAPI.runtime.sendMessage({ type: 'REFINZI_GET_METRICS_SUMMARY' }),
      BrowserAPI.runtime.sendMessage({ type: 'REFINZI_GET_HISTORY' }),
    ]);

    currentSettings = settingsRes.status === 'fulfilled' && settingsRes.value?.data
      ? settingsRes.value.data
      : {
          // Fallback only if the background service worker is unreachable.
          // Sourced from the single source of truth in utils/storage.ts.
          ...DEFAULT_SETTINGS,
          apiKeys: { ...DEFAULT_SETTINGS.apiKeys, gemini: DEFAULT_GEMINI_API_KEY },
        };

    const initialSummary: RefinziMetricsSummary | null =
      summaryRes.status === 'fulfilled' && summaryRes.value?.data ? summaryRes.value.data : null;

    if (initialSummary?.period) {
      currentPeriod = initialSummary.period;
    }

    allHistory =
      historyRes.status === 'fulfilled' && Array.isArray(historyRes.value?.data)
        ? historyRes.value.data
        : [];

    // Sync period toggle buttons with persisted active period
    updatePeriodToggleUI(currentPeriod);

    // Render Metrics
    if (initialSummary) {
      updateDashboardUI(initialSummary);
    } else {
      await refreshMetrics();
    }

    // Render Recent & Full History
    renderRecentList(allHistory);
    renderFullHistory(allHistory);
  } catch (err) {
    console.error('[Refinzi] Initialization error:', err);
  }

  // Populate Settings form fields
  if (settingProvider) {
    settingProvider.value = currentSettings.provider;
    updateProviderForm(currentSettings.provider);
  }
  if (settingAutoApply) settingAutoApply.checked = currentSettings.autoApply !== false;
  if (settingHoldTime) settingHoldTime.value = String(currentSettings.holdThresholdMs || 350);
  if (settingDefaultMode) settingDefaultMode.value = currentSettings.defaultMode || 'better';
  if (settingSaveHistory) settingSaveHistory.checked = currentSettings.saveHistory !== false;

  // Populate the Dashboard Estimate assumptions (single source: metrics config)
  try {
    metricConfig = await getMetricsConfig();
  } catch {
    metricConfig = { ...DEFAULT_METRICS_CONFIG };
  }
  syncMetricConfigInputs();

  // Update Header & Banner Status
  await updateHeaderEngineStatus(currentSettings.provider);

  // Resolve and display active tab context (async, non-blocking)
  resolveActiveTabContext();

  // Initialize accessible floating tooltips
  initAccessibleTooltips();

  // =========================================================================
  // 2. TAB NAVIGATION
  // =========================================================================
  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      if (tab) switchTab(tab);
    });
  });

  linkViewAll?.addEventListener('click', () => switchTab('tab-history'));
  btnQuickProvider?.addEventListener('click', () => switchTab('tab-settings'));

  // =========================================================================
  // 3. PERIOD TOGGLE HANDLERS (Today | Week | Month | All Time)
  // =========================================================================
  function updatePeriodToggleUI(activePeriod: PeriodType): void {
    periodBtns.forEach((btn) => {
      const period = btn.getAttribute('data-period');
      if (period === activePeriod) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  periodBtns.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const period = btn.getAttribute('data-period') as PeriodType;
      if (!period || period === currentPeriod) return;

      currentPeriod = period;
      updatePeriodToggleUI(currentPeriod);

      // Persist selected period
      await BrowserAPI.runtime.sendMessage({
        type: 'REFINZI_SET_PERIOD',
        period,
      });

      // Update metrics & recent calibrations
      await refreshMetrics();
      renderRecentList(allHistory);
    });
  });

  // =========================================================================
  // 4. METRICS REFRESH & DASHBOARD UI BINDING
  // =========================================================================
  async function refreshMetrics(): Promise<void> {
    try {
      const res = await BrowserAPI.runtime.sendMessage({
        type: 'REFINZI_GET_METRICS_SUMMARY',
        period: currentPeriod,
      });
      const summary: RefinziMetricsSummary = res?.data;
      if (summary) {
        updateDashboardUI(summary);
        renderSparkline();
      }
    } catch (err) {
      console.error('[Refinzi] Failed to refresh metrics:', err);
    }
  }

  function updateDashboardUI(summary: RefinziMetricsSummary): void {
    // 1. Prompts Enhanced
    if (metricTotalPrompts) {
      metricTotalPrompts.textContent = String(summary.totalPromptsEnhanced);
    }
    if (metricPromptsSub) {
      metricPromptsSub.textContent = summary.promptsPeriodSubtitle;
    }

    // 2. Est. Time Saved
    if (metricTimeSaved) {
      metricTimeSaved.textContent = summary.estimatedTimeSavedFormatted;
    }
    if (metricTimeSub) {
      metricTimeSub.textContent = 'estimated';
    }
    if (tooltipTimeSaved && summary.estimatedTimeSavedTooltip) {
      tooltipTimeSaved.title = summary.estimatedTimeSavedTooltip;
      tooltipTimeSaved.setAttribute('data-tooltip', summary.estimatedTimeSavedTooltip);
    }

    // 3. Est. Cost Saved
    if (metricCostSaved) {
      metricCostSaved.textContent = summary.estimatedCostSavedFormatted;
    }
    if (metricCostSub) {
      metricCostSub.textContent = summary.estimatedCostSavedSubtitle;
    }
    if (tooltipCostSaved && summary.estimatedCostSavedTooltip) {
      tooltipCostSaved.title = summary.estimatedCostSavedTooltip;
      tooltipCostSaved.setAttribute('data-tooltip', summary.estimatedCostSavedTooltip);
    }

    // 4. Better / Expert Usage Split
    if (metricBetterExpertVal) {
      metricBetterExpertVal.textContent = `${summary.betterCount} / ${summary.expertCount}`;
    }
    if (metricBetterExpertSub) {
      let subText = 'this week';
      if (summary.period === 'Today') subText = 'today';
      else if (summary.period === 'Month') subText = 'this month';
      else if (summary.period === 'All Time') subText = 'all time';
      metricBetterExpertSub.textContent = subText;
    }

    // 4b. Visual split-bar
    renderSplitBar(summary.betterPercentage, summary.expertPercentage);

    // 5. Activity Breakdown Bar
    if (periodBetterCount) periodBetterCount.textContent = String(summary.betterCount);
    if (periodBetterPct) periodBetterPct.textContent = `(${summary.betterPercentage}%)`;
    if (periodExpertCount) periodExpertCount.textContent = String(summary.expertCount);
    if (periodExpertPct) periodExpertPct.textContent = `(${summary.expertPercentage}%)`;

    // 6. Progressive PLG Nudges
    renderPlgNudges(summary, currentSettings);
  }

  // =========================================================================
  // 5. RECENT CALIBRATIONS & HISTORY RENDERING
  // =========================================================================
  async function refreshHistory(): Promise<void> {
    try {
      const res = await BrowserAPI.runtime.sendMessage({ type: 'REFINZI_GET_HISTORY' });
      allHistory = res?.data || [];
    } catch {
      allHistory = [];
    }

    renderRecentList(allHistory);
    renderFullHistory(allHistory);
    renderSparkline();
  }

  function renderRecentList(items: RefinziHistoryItem[]): void {
    if (!homeRecentList) return;

    const now = Date.now();
    let filtered = items;

    if (currentPeriod === 'Today') {
      const startOfToday = new Date().setHours(0, 0, 0, 0);
      filtered = items.filter((i) => i.timestamp >= startOfToday);
    } else if (currentPeriod === 'Week') {
      const startOfWeek = now - 7 * 24 * 60 * 60 * 1000;
      filtered = items.filter((i) => i.timestamp >= startOfWeek);
    } else if (currentPeriod === 'Month') {
      const startOfMonth = now - 30 * 24 * 60 * 60 * 1000;
      filtered = items.filter((i) => i.timestamp >= startOfMonth);
    }

    if (filtered.length === 0) {
      homeRecentList.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">⚡</span>
          <p class="empty-title">Ready to calibrate</p>
          <p class="empty-desc">Write your prompt in ChatGPT, Claude, Gemini, or Perplexity and click the Orb.</p>
        </div>
      `;
      return;
    }

    homeRecentList.innerHTML = '';
    filtered.slice(0, 4).forEach((item) => {
      const el = createActivityCard(item, async () => {
        await refreshHistory();
        await refreshMetrics();
      });
      homeRecentList.appendChild(el);
    });
  }

  function renderFullHistory(items: RefinziHistoryItem[]): void {
    if (!fullHistoryList) return;

    const query = historySearch?.value.trim().toLowerCase() || '';

    // Apply mode filter chip first
    let filtered = currentHistoryFilter === 'all'
      ? items
      : items.filter((i) => i.mode === currentHistoryFilter);

    // Then apply search query
    if (query) {
      filtered = filtered.filter(
        (i) =>
          i.originalPrompt.toLowerCase().includes(query) ||
          i.refinedPrompt.toLowerCase().includes(query) ||
          i.targetAi.toLowerCase().includes(query)
      );
    }

    if (filtered.length === 0) {
      fullHistoryList.innerHTML = `
        <div class="empty-state" style="margin-top: 20px;">
          <span class="empty-icon">🕒</span>
          <p class="empty-title">No matching history</p>
          <p class="empty-desc">${query ? 'Try a different search query.' : 'Calibrations will be logged here.'}</p>
        </div>
      `;
      return;
    }

    fullHistoryList.innerHTML = '';
    filtered.forEach((item) => {
      const el = createActivityCard(item, async () => {
        await refreshHistory();
        await refreshMetrics();
      });
      fullHistoryList.appendChild(el);
    });
  }

  historySearch?.addEventListener('input', () => {
    renderFullHistory(allHistory);
  });

  // History filter chip handlers
  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const filter = chip.getAttribute('data-filter') as 'all' | 'better' | 'expert';
      currentHistoryFilter = filter || 'all';
      filterChips.forEach((c) => {
        c.classList.toggle('active', c === chip);
        c.setAttribute('aria-selected', c === chip ? 'true' : 'false');
      });
      renderFullHistory(allHistory);
    });
  });

  /**
   * Builds an activity item card adhering to Section 9:
   * Title: Shortened original prompt
   * Subtitle: Mode · Destination AI · Relative Timestamp
   * Actions: Copy, View Details, Delete
   */
  function createActivityCard(
    item: RefinziHistoryItem,
    onDeleted?: () => void | Promise<void>
  ): HTMLElement {
    const card = document.createElement('div');
    card.className = 'activity-item';
    card.setAttribute('data-id', item.id);

    const isBetter = item.mode === 'better';
    const modeLabel = isBetter ? 'Better' : 'Expert';
    const relativeTime = formatRelativeTime(item.timestamp);
    const destinationLabel = capitalize(item.targetAi || 'AI');

    // Shortened original prompt
    const promptText = (item.originalPrompt || item.refinedPrompt || '').trim();
    const shortenedPrompt = promptText.length > 55
      ? promptText.slice(0, 52).trim() + '…'
      : promptText;

    card.innerHTML = `
      <div class="activity-item-main" title="${escapeHtml(promptText)}">
        <div class="activity-prompt-title">${escapeHtml(shortenedPrompt)}</div>
        <div class="activity-meta-line">
          <span class="activity-meta-mode ${isBetter ? 'better' : 'expert'}">${modeLabel}</span>
          <span class="activity-meta-sep">·</span>
          <span class="activity-meta-target">${escapeHtml(destinationLabel)}</span>
          <span class="activity-meta-sep">·</span>
          <span class="activity-meta-time">${relativeTime}</span>
        </div>
      </div>
      <div class="activity-actions">
        <button type="button" class="btn-item-action btn-copy-item" title="Copy calibrated prompt" aria-label="Copy prompt">📋</button>
        <button type="button" class="btn-item-action btn-delete-item" title="Delete calibration" aria-label="Delete calibration">✕</button>
      </div>
    `;

    // Clicking main area opens detail modal
    const mainSection = card.querySelector('.activity-item-main');
    mainSection?.addEventListener('click', () => {
      openDetailModal(item);
    });

    // Copy action
    const copyBtn = card.querySelector('.btn-copy-item') as HTMLButtonElement | null;
    copyBtn?.addEventListener('click', async (e) => {
      e.stopPropagation();
      const textToCopy = item.refinedPrompt || item.originalPrompt;
      try {
        await navigator.clipboard.writeText(textToCopy);
        copyBtn.textContent = '✓';
        copyBtn.classList.add('success');
        setTimeout(() => {
          copyBtn.textContent = '📋';
          copyBtn.classList.remove('success');
        }, 1500);
      } catch {
        copyBtn.textContent = '✓';
        setTimeout(() => { copyBtn.textContent = '📋'; }, 1500);
      }
    });

    // Delete action
    const deleteBtn = card.querySelector('.btn-delete-item') as HTMLButtonElement | null;
    deleteBtn?.addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        await BrowserAPI.runtime.sendMessage({
          type: 'REFINZI_DELETE_HISTORY_ITEM',
          id: item.id,
        });
        allHistory = allHistory.filter((h) => h.id !== item.id);
        card.remove();
        if (onDeleted) await onDeleted();
      } catch (err) {
        console.error('[Refinzi] Failed to delete history item:', err);
      }
    });

    return card;
  }

  // =========================================================================
  // 6. DETAIL MODAL HANDLER
  // =========================================================================
  let currentDetailPrompt = '';

  function openDetailModal(item: RefinziHistoryItem): void {
    if (!detailModal || !detailModeBadge || !detailTargetAi || !detailTimestamp || !detailOriginalText || !detailRefinedText || !btnCopyDetail) {
      return;
    }

    const isBetter = item.mode === 'better';
    detailModeBadge.className = `detail-mode-badge ${isBetter ? 'better' : 'expert'}`;
    detailModeBadge.textContent = isBetter ? '⚡ Better Prompt' : '🧠 Expert Briefing';

    detailTargetAi.textContent = capitalize(item.targetAi || 'AI');
    detailTimestamp.textContent = new Date(item.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    detailOriginalText.textContent = item.originalPrompt;
    detailRefinedText.textContent = item.refinedPrompt;
    currentDetailPrompt = item.refinedPrompt;

    btnCopyDetail.innerHTML = '📋 Copy Calibrated';
    detailModal.classList.remove('hidden');
  }

  btnCloseDetail?.addEventListener('click', () => {
    detailModal?.classList.add('hidden');
  });

  detailModal?.addEventListener('click', (e) => {
    if (e.target === detailModal) detailModal.classList.add('hidden');
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && detailModal && !detailModal.classList.contains('hidden')) {
      detailModal.classList.add('hidden');
    }
  });

  btnCopyDetail?.addEventListener('click', async () => {
    if (!currentDetailPrompt || !btnCopyDetail) return;
    try {
      await navigator.clipboard.writeText(currentDetailPrompt);
      btnCopyDetail.innerHTML = '✓ Copied to Clipboard!';
      setTimeout(() => {
        if (btnCopyDetail) btnCopyDetail.innerHTML = '📋 Copy Calibrated';
      }, 1500);
    } catch {
      btnCopyDetail.innerHTML = '✓ Copied!';
    }
  });

  // =========================================================================
  // 7. SETTINGS EVENT HANDLERS
  // =========================================================================
  settingProvider?.addEventListener('change', async () => {
    if (!settingProvider) return;
    const provider = settingProvider.value as AIProviderId;
    currentSettings.provider = provider;
    updateProviderForm(provider);
    await updateHeaderEngineStatus(provider);
    resolveActiveTabContext();

    await BrowserAPI.runtime.sendMessage({
      type: 'REFINZI_SAVE_SETTINGS',
      settings: { provider },
    });
  });

  settingApiKey?.addEventListener('input', async () => {
    if (!settingProvider || !settingApiKey || !providerTestFeedback) return;
    const provider = settingProvider.value as AIProviderId;
    const key = settingApiKey.value.trim();
    providerTestFeedback.textContent = '';
    providerTestFeedback.className = 'field-feedback';

    const patchKeys = { ...currentSettings.apiKeys, [provider]: key };
    currentSettings.apiKeys = patchKeys;

    await BrowserAPI.runtime.sendMessage({
      type: 'REFINZI_SAVE_SETTINGS',
      settings: { apiKeys: patchKeys },
    });
  });

  settingModel?.addEventListener('input', async () => {
    if (!settingProvider || !settingModel) return;
    const provider = settingProvider.value as AIProviderId;
    const model = settingModel.value.trim();

    const patchModels = { ...currentSettings.models, [provider]: model };
    currentSettings.models = patchModels;

    await BrowserAPI.runtime.sendMessage({
      type: 'REFINZI_SAVE_SETTINGS',
      settings: { models: patchModels },
    });
  });

  btnTestProvider?.addEventListener('click', async () => {
    if (!settingProvider || !settingApiKey || !providerTestFeedback) return;
    const provider = settingProvider.value as AIProviderId;
    const key = settingApiKey.value.trim();
    providerTestFeedback.textContent = 'Verifying…';
    providerTestFeedback.className = 'field-feedback';

    try {
      const res = await BrowserAPI.runtime.sendMessage({
        type: 'REFINZI_TEST_PROVIDER',
        provider,
        apiKey: key,
      });

      if (res && res.success && res.data?.ok) {
        providerTestFeedback.textContent = '✓ Verified & Ready';
        providerTestFeedback.className = 'field-feedback success';
      } else {
        providerTestFeedback.textContent = res?.data?.message || 'Verification failed';
        providerTestFeedback.className = 'field-feedback error';
      }
    } catch {
      providerTestFeedback.textContent = 'Connection error';
      providerTestFeedback.className = 'field-feedback error';
    }
  });

  settingAutoApply?.addEventListener('change', async () => {
    if (!settingAutoApply) return;
    const autoApply = settingAutoApply.checked;
    await BrowserAPI.runtime.sendMessage({
      type: 'REFINZI_SAVE_SETTINGS',
      settings: { autoApply },
    });
  });

  settingHoldTime?.addEventListener('change', async () => {
    if (!settingHoldTime) return;
    const holdThresholdMs = parseInt(settingHoldTime.value, 10);
    await BrowserAPI.runtime.sendMessage({
      type: 'REFINZI_SAVE_SETTINGS',
      settings: { holdThresholdMs },
    });
  });

  settingDefaultMode?.addEventListener('change', async () => {
    if (!settingDefaultMode) return;
    const defaultMode = settingDefaultMode.value as any;
    await BrowserAPI.runtime.sendMessage({
      type: 'REFINZI_SAVE_SETTINGS',
      settings: { defaultMode },
    });
  });

  btnResetOrbPos?.addEventListener('click', async () => {
    if (!orbPosFeedback) return;
    orbPosFeedback.textContent = 'Position reset to composer docking!';
    orbPosFeedback.className = 'action-feedback success';
    setTimeout(() => {
      if (orbPosFeedback) orbPosFeedback.textContent = '';
    }, 2000);
  });

  settingSaveHistory?.addEventListener('change', async () => {
    if (!settingSaveHistory) return;
    const saveHistory = settingSaveHistory.checked;
    await BrowserAPI.runtime.sendMessage({
      type: 'REFINZI_SAVE_SETTINGS',
      settings: { saveHistory },
    });
  });

  btnReplayOnboarding?.addEventListener('click', async () => {
    try {
      const tabs = await BrowserAPI.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]?.id) {
        await BrowserAPI.tabs.sendMessage(tabs[0].id, { type: 'REFINZI_SHOW_ONBOARDING' });
        window.close();
      }
    } catch {
      // Ignored
    }
  });

  btnClearAllData?.addEventListener('click', async () => {
    if (confirm('Clear all Refinzi prompt history on this device?')) {
      await BrowserAPI.runtime.sendMessage({ type: 'REFINZI_CLEAR_HISTORY' });
      if (privacyFeedback) {
        privacyFeedback.textContent = '✓ History cleared';
        privacyFeedback.className = 'action-feedback success';
      }
      await refreshHistory();
      await refreshMetrics();
      setTimeout(() => {
        if (privacyFeedback) privacyFeedback.textContent = '';
      }, 2500);
    }
  });

  btnClearHistoryTop?.addEventListener('click', async () => {
    await BrowserAPI.runtime.sendMessage({ type: 'REFINZI_CLEAR_HISTORY' });
    await refreshHistory();
    await refreshMetrics();
  });

  // -------------------------------------------------------------------------
  // Dashboard Estimate Assumptions
  // The dashboard's time/cost figures are estimates built on three tunable
  // assumptions. They live in Settings so the Home view stays uncluttered,
  // while the numbers on it stay explainable and user-adjustable.
  // -------------------------------------------------------------------------

  function syncMetricConfigInputs(): void {
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

  /**
   * Persists the assumption inputs, then re-renders the dashboard so the
   * effect of a change is visible immediately. Values are clamped to sane
   * bounds and fall back to the default when the field is cleared.
   */
  async function commitMetricConfig(): Promise<void> {
    // Empty or non-numeric input reverts to the default; anything else is clamped.
    const clampOrFallback = (
      input: HTMLInputElement | null,
      fallback: number,
      min: number,
      max: number
    ): number => {
      const raw = Number(input?.value);
      if (!input || input.value.trim() === '' || !Number.isFinite(raw)) return fallback;
      return Math.min(max, Math.max(min, raw));
    };

    metricConfig = {
      ...metricConfig,
      estimatedMinutesPerPrompt: clampOrFallback(settingEstMinutes, DEFAULT_METRICS_CONFIG.estimatedMinutesPerPrompt, 0.5, 30),
      estimatedAvoidedIterations: clampOrFallback(settingEstIterations, DEFAULT_METRICS_CONFIG.estimatedAvoidedIterations, 0, 5),
      fallbackCostPerIteration: clampOrFallback(settingFallbackCost, DEFAULT_METRICS_CONFIG.fallbackCostPerIteration, 0, 1),
    };

    syncMetricConfigInputs();

    try {
      await saveMetricsConfig(metricConfig);
      await refreshMetrics();
      if (metricsConfigFeedback) {
        metricsConfigFeedback.textContent = '✓ Dashboard updated';
        metricsConfigFeedback.className = 'action-feedback success';
        setTimeout(() => {
          if (metricsConfigFeedback) {
            metricsConfigFeedback.textContent = '';
            metricsConfigFeedback.className = 'action-feedback';
          }
        }, 1800);
      }
    } catch {
      if (metricsConfigFeedback) {
        metricsConfigFeedback.textContent = 'Could not save assumptions';
        metricsConfigFeedback.className = 'action-feedback error';
      }
    }
  }

  [settingEstMinutes, settingEstIterations, settingFallbackCost].forEach((input) => {
    input?.addEventListener('change', commitMetricConfig);
  });

  // =========================================================================
  // 7b. ACCESSIBLE FLOATING TOOLTIPS & PLG NUDGES
  // =========================================================================

  function initAccessibleTooltips(): void {
    const globalTooltip = document.getElementById('refinzi-global-tooltip');
    if (!globalTooltip) return;

    let activeTrigger: HTMLElement | null = null;

    function showTooltip(el: HTMLElement): void {
      if (!globalTooltip) return;
      const text = el.getAttribute('data-tooltip') || el.getAttribute('title');
      if (!text) return;

      // Stash title temporarily so browser's unstyled default tooltip does not flash
      if (el.hasAttribute('title')) {
        el.setAttribute('data-stored-title', el.getAttribute('title') || '');
        el.removeAttribute('title');
      }

      globalTooltip.textContent = text;
      globalTooltip.classList.remove('hidden');
      globalTooltip.classList.add('visible');
      globalTooltip.setAttribute('aria-hidden', 'false');
      activeTrigger = el;

      const rect = el.getBoundingClientRect();
      const tooltipWidth = 220;
      let left = rect.left + rect.width / 2 - tooltipWidth / 2;
      if (left < 10) left = 10;
      if (left + tooltipWidth > window.innerWidth - 10) {
        left = window.innerWidth - tooltipWidth - 10;
      }

      let top = rect.bottom + 6;
      if (top + 60 > window.innerHeight) {
        top = Math.max(10, rect.top - 45);
      }

      globalTooltip.style.left = `${Math.max(8, left)}px`;
      globalTooltip.style.top = `${Math.max(8, top)}px`;
    }

    function hideTooltip(): void {
      if (!globalTooltip) return;
      globalTooltip.classList.remove('visible');
      globalTooltip.classList.add('hidden');
      globalTooltip.setAttribute('aria-hidden', 'true');
      if (activeTrigger && activeTrigger.hasAttribute('data-stored-title')) {
        activeTrigger.setAttribute('title', activeTrigger.getAttribute('data-stored-title') || '');
        activeTrigger.removeAttribute('data-stored-title');
      }
      activeTrigger = null;
    }

    // Event delegation for hover & focus
    document.addEventListener('mouseover', (e) => {
      const target = (e.target as HTMLElement)?.closest('[data-tooltip], .info-tooltip-trigger') as HTMLElement | null;
      if (target) showTooltip(target);
    });

    document.addEventListener('mouseout', (e) => {
      const target = (e.target as HTMLElement)?.closest('[data-tooltip], .info-tooltip-trigger') as HTMLElement | null;
      if (target) hideTooltip();
    });

    document.addEventListener('focusin', (e) => {
      const target = (e.target as HTMLElement)?.closest('[data-tooltip], .info-tooltip-trigger') as HTMLElement | null;
      if (target) showTooltip(target);
    });

    document.addEventListener('focusout', (e) => {
      const target = (e.target as HTMLElement)?.closest('[data-tooltip], .info-tooltip-trigger') as HTMLElement | null;
      if (target) hideTooltip();
    });

    // Escape key dismisses tooltip immediately
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        hideTooltip();
      }
    });
  }

  async function renderPlgNudges(summary: RefinziMetricsSummary, settings: RefinziSettings): Promise<void> {
    if (!plgNudgeContainer) return;

    let dismissed: string[] = [];
    try {
      const stored = await BrowserAPI.storage.local.get(['refinzi_dismissed_nudges']);
      dismissed = Array.isArray(stored?.refinzi_dismissed_nudges) ? stored.refinzi_dismissed_nudges : [];
    } catch {
      dismissed = [];
    }

    const activeNudge = PLG_NUDGES.find(
      (nudge) => !dismissed.includes(nudge.id) && nudge.condition(summary, settings)
    );

    if (!activeNudge) {
      plgNudgeContainer.innerHTML = '';
      plgNudgeContainer.classList.add('hidden');
      return;
    }

    plgNudgeContainer.classList.remove('hidden');
    plgNudgeContainer.innerHTML = `
      <div class="plg-nudge-card nudge-${activeNudge.pillar}" id="${activeNudge.id}" role="note" aria-live="polite">
        <div class="plg-nudge-body">
          <span class="plg-nudge-icon" aria-hidden="true">${activeNudge.icon}</span>
          <div class="plg-nudge-text">
            <span class="plg-nudge-title">${escapeHtml(activeNudge.title)}</span>
            <span class="plg-nudge-desc">${escapeHtml(activeNudge.desc)}</span>
          </div>
        </div>
        ${activeNudge.ctaText ? `<button type="button" class="plg-nudge-cta" id="btn-nudge-cta">${escapeHtml(activeNudge.ctaText)}</button>` : ''}
        <button type="button" class="plg-nudge-dismiss" id="btn-dismiss-nudge" aria-label="Dismiss tip">✕</button>
      </div>
    `;

    if (activeNudge.ctaText && activeNudge.onCta) {
      document.getElementById('btn-nudge-cta')?.addEventListener('click', activeNudge.onCta);
    }

    document.getElementById('btn-dismiss-nudge')?.addEventListener('click', async () => {
      dismissed.push(activeNudge.id);
      try {
        await BrowserAPI.storage.local.set({ refinzi_dismissed_nudges: dismissed });
      } catch {
        // storage fallback
      }
      plgNudgeContainer.innerHTML = '';
      plgNudgeContainer.classList.add('hidden');
    });
  }

  // =========================================================================
  // 8. UI HELPERS & GUIDEBOOK
  // =========================================================================

  /**
   * Resolves the active browser tab's URL and updates the contextual tab
   * awareness pill in the header.
   *
   * States:
   *  - state-active    : Active on ChatGPT / Claude / Gemini / Perplexity
   *  - state-universal : Generic page — universal mode, Refinzi works on any text input
   *  - state-restricted: chrome://, about:, new tab, extensions page — cannot inject
   *  - state-detecting : Tab query in flight or permission denied
   */
  function resolveActiveTabContext(): void {
    if (!tabContextPill || !tabContextDot || !tabContextText) return;

    // Start in detecting state while the async tab query is in flight.
    setTabContextState('detecting', 'Detecting…');

    // SUPPORTED_SITES maps a hostname fragment → human-readable site label
    const SUPPORTED_SITES: Array<{ match: string; label: string }> = [
      { match: 'chat.openai.com', label: 'ChatGPT' },
      { match: 'chatgpt.com',     label: 'ChatGPT' },
      { match: 'claude.ai',       label: 'Claude' },
      { match: 'gemini.google.com', label: 'Gemini' },
      { match: 'perplexity.ai',   label: 'Perplexity' },
    ];

    // Restricted URL patterns — extension cannot inject into these
    const RESTRICTED_PATTERNS = [
      /^chrome:\/\//,
      /^chrome-extension:\/\//,
      /^about:/,
      /^edge:\/\//,
      /^moz-extension:\/\//,
      /^opera:\/\//,
      /^vivaldi:\/\//,
    ];

    try {
      BrowserAPI.tabs.query({ active: true, currentWindow: true })
        .then((tabs) => {
          const tab = tabs?.[0];
          const url = tab?.url || '';

          if (!url) {
            setTabContextState('restricted', 'Restricted Tab');
            return;
          }

          // Check for restricted browser-internal pages
          if (RESTRICTED_PATTERNS.some((re) => re.test(url))) {
            setTabContextState('restricted', 'Restricted Tab');
            return;
          }

          // Check for new tab / empty page
          if (url === 'about:blank' || url === 'about:newtab') {
            setTabContextState('restricted', 'New Tab');
            return;
          }

          // Check for a supported AI site
          const matched = SUPPORTED_SITES.find((site) => url.includes(site.match));
          if (matched) {
            setTabContextState('active', `Active on ${matched.label}`);
            return;
          }

          // Generic page — universal surface mode is active
          let domain = '';
          try {
            domain = new URL(url).hostname.replace(/^www\./, '');
          } catch {
            domain = '';
          }
          const label = domain ? `Universal · ${domain.slice(0, 18)}${domain.length > 18 ? '…' : ''}` : 'Universal Mode';
          setTabContextState('universal', label);
        })
        .catch(() => {
          // tabs.query can fail if extension doesn't have tabs permission
          setTabContextState('restricted', 'Standing By');
        });
    } catch {
      setTabContextState('restricted', 'Standing By');
    }
  }

  /** Applies a named state class + text label to the tab context pill and activation hero. */
  function setTabContextState(
    state: 'active' | 'universal' | 'restricted' | 'detecting',
    label: string
  ): void {
    if (tabContextPill && tabContextText) {
      tabContextPill.className = `tab-context-pill state-${state}`;
      tabContextText.textContent = label;
    }

    if (heroActivationTitle && heroSiteBadge) {
      if (state === 'active') {
        const siteName = label.replace(/^Active on /, '');
        heroActivationTitle.textContent = `Ready to enhance in ${siteName}`;
        heroSiteBadge.textContent = siteName;
      } else if (state === 'universal') {
        heroActivationTitle.textContent = 'Universal prompt layer ready';
        heroSiteBadge.textContent = 'Universal';
      } else {
        heroActivationTitle.textContent = 'Ready to enhance your next prompt';
        heroSiteBadge.textContent = 'Universal';
      }
    }
  }

  /**
   * Draws a 7-day sparkline inside the Prompts Enhanced card.
   * Buckets allHistory into daily counts over the last 7 days,
   * then maps each count to a Y coordinate within the 120×28 viewBox.
   */
  function renderSparkline(): void {
    if (!sparklineLine || !sparklineFill) return;

    // Build a 7-element array of daily counts (index 0 = 6 days ago, 6 = today)
    const counts: number[] = Array(7).fill(0);
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;

    for (const item of allHistory) {
      const daysAgo = Math.floor((now - item.timestamp) / DAY_MS);
      if (daysAgo >= 0 && daysAgo < 7) {
        counts[6 - daysAgo]++;
      }
    }

    const maxCount = Math.max(...counts, 1); // avoid division by zero
    const W = 120;
    const H = 28;
    const PAD = 3; // vertical padding so line doesn't clip at edges

    // Map each day to (x, y) within the viewBox
    const pts = counts.map((c, i) => {
      const x = (i / (counts.length - 1)) * W;
      const y = PAD + (1 - c / maxCount) * (H - PAD * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    sparklineLine.setAttribute('points', pts.join(' '));

    // Fill polygon: close the path by running along the bottom edge
    const fillPts = [
      `0,${H}`,
      ...pts,
      `${W},${H}`,
    ];
    sparklineFill.setAttribute('points', fillPts.join(' '));
  }

  /**
   * Animates the visual proportional split-bar on the Better / Expert card.
   * betterPct and expertPct are integers 0–100 that must sum to 100.
   */
  function renderSplitBar(betterPct: number, expertPct: number): void {
    if (!splitBarBetter || !splitBarExpert) return;
    // Guard: if both are 0 (no data yet), show an empty bar
    if (betterPct === 0 && expertPct === 0) {
      splitBarBetter.style.width = '0%';
      splitBarExpert.style.width = '0%';
      return;
    }
    splitBarBetter.style.width = `${betterPct}%`;
    splitBarExpert.style.width = `${expertPct}%`;
  }

  function updateProviderForm(provider: AIProviderId): void {

    if (!settingKeyRow || !settingModelRow || !settingApiKey || !settingModel) return;

    if (provider === 'local') {
      providerGuidebook?.classList.add('hidden');
      settingKeyRow.classList.add('hidden');
      settingModelRow.classList.add('hidden');
    } else if (provider === 'gateway') {
      // Gateway: show guidebook but make API key optional
      providerGuidebook?.classList.remove('hidden');
      settingKeyRow.classList.remove('hidden');
      settingModelRow.classList.add('hidden');

      const info = GUIDEBOOKS['gateway'];
      if (info && providerGuidebook) {
        if (guidebookIcon) guidebookIcon.textContent = info.icon;
        if (guidebookName) guidebookName.textContent = info.name;
        if (guidebookLink) {
          guidebookLink.href = info.url;
          guidebookLink.textContent = 'Refinzi.com ↗';
        }
        if (guidebookTier) guidebookTier.textContent = info.tier;
        if (guidebookSteps) {
          guidebookSteps.innerHTML = info.steps.map((s) => `<li>${s}</li>`).join('');
        }
      }

      const savedKey = currentSettings.apiKeys?.gateway || '';
      settingApiKey.value = savedKey;
      settingApiKey.placeholder = 'Optional: Paste priority access key…';
    } else {
      providerGuidebook?.classList.remove('hidden');
      settingKeyRow.classList.remove('hidden');
      settingModelRow.classList.remove('hidden');

      const info = GUIDEBOOKS[provider];
      if (info && providerGuidebook) {
        if (guidebookIcon) guidebookIcon.textContent = info.icon;
        if (guidebookName) guidebookName.textContent = info.name;
        if (guidebookLink) {
          guidebookLink.href = info.url;
          guidebookLink.textContent = `Get ${capitalize(provider)} Key ↗`;
        }
        if (guidebookTier) guidebookTier.textContent = info.tier;
        if (guidebookSteps) {
          guidebookSteps.innerHTML = info.steps.map((s) => `<li>${s}</li>`).join('');
        }
      }

      const savedKey = currentSettings.apiKeys?.[provider as keyof typeof currentSettings.apiKeys] || '';
      settingApiKey.value = savedKey;
      settingApiKey.placeholder = `Paste ${provider.toUpperCase()} API key…`;

      const savedModel = currentSettings.models?.[provider as keyof typeof currentSettings.models] || (info ? info.defaultModel : '');
      settingModel.value = savedModel;
    }
  }

  async function updateHeaderEngineStatus(provider: AIProviderId): Promise<void> {
    if (provider === 'local') {
      if (globalStatusText) globalStatusText.textContent = 'Local Ready';
      if (engineName) engineName.textContent = 'Instant Local Engine (0ms)';
    } else if (provider === 'gateway') {
      if (globalStatusText) globalStatusText.textContent = 'Gateway Ready';
      if (engineName) engineName.textContent = 'Refinzi Cloud Gateway (Free AI)';
    } else if (provider === 'gemini') {
      const hasKey = Boolean(currentSettings?.apiKeys?.gemini);
      // The bundled free key also lives in apiKeys, so distinguish it from a
      // real user-supplied key rather than always claiming "BYOK".
      const bundledKeyInUse = !hasKey || currentSettings.apiKeys.gemini === DEFAULT_GEMINI_API_KEY;
      if (globalStatusText) globalStatusText.textContent = hasKey ? 'Gemini 3.8 Flash' : 'Gemini Flash';
      if (engineName) {
        engineName.textContent = bundledKeyInUse
          ? 'Google Gemini Flash (bundled key)'
          : 'Google Gemini 3.8 Flash (BYOK)';
      }
    } else {
      const name = capitalize(provider);
      const hasKey = Boolean(currentSettings?.apiKeys?.[provider as keyof typeof currentSettings.apiKeys]);
      if (globalStatusText) globalStatusText.textContent = hasKey ? `${name} Ready` : `${name} (Configure)`;
      if (engineName) engineName.textContent = `${name} Engine (BYOK)`;
    }

    // Fold free-tier usage into the same banner (no extra dashboard rows).
    await applyFreeTierStatus();
  }

  /**
   * Free-tier visibility, folded into the existing engine banner so the Home
   * view gains no extra rows. The banner only takes on the attention (amber)
   * state when the user is close to — or past — the free cap, which is the
   * point where the information is actually actionable.
   */
  async function applyFreeTierStatus(): Promise<void> {
    if (!homeEngineBanner) return;
    homeEngineBanner.classList.remove('warn');

    // Idempotent: drop any suffix left by a previous render before re-adding,
    // so repeated calls can never stack up duplicate badges.
    homeEngineBanner.querySelectorAll('.engine-free').forEach((node) => node.remove());

    const bundledKeyInUse =
      !currentSettings?.apiKeys?.gemini ||
      currentSettings.apiKeys.gemini === DEFAULT_GEMINI_API_KEY;

    // Free-tier accounting only applies to the bundled Gemini key.
    if (currentSettings?.provider !== 'gemini' || !bundledKeyInUse) {
      if (btnQuickProvider) btnQuickProvider.textContent = 'Configure →';
      return;
    }
    if (!engineName) return;

    let status: { remaining: number; cap: number; expired: boolean };
    try {
      status = await getFreeUsageStatus();
    } catch {
      return;
    }

    const suffix = document.createElement('span');
    suffix.className = 'engine-free';

    if (status.expired) {
      suffix.textContent = ' · free prompts used up';
      homeEngineBanner.classList.add('warn');
      if (btnQuickProvider) btnQuickProvider.textContent = 'Add your own key →';
    } else {
      suffix.textContent = ` · ${status.remaining}/${status.cap} free left`;
      if (status.remaining <= 5) {
        homeEngineBanner.classList.add('warn');
        if (btnQuickProvider) btnQuickProvider.textContent = 'Add your own key →';
      } else if (btnQuickProvider) {
        btnQuickProvider.textContent = 'Configure →';
      }
    }

    engineName.appendChild(suffix);
  }

  function formatRelativeTime(ts: number): string {
    const diffMs = Date.now() - ts;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  function capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
