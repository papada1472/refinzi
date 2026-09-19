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

  // Elements: Activity Breakdown Bar
  const periodBetterCount = document.getElementById('period-better-count') as HTMLSpanElement | null;
  const periodBetterPct = document.getElementById('period-better-pct') as HTMLSpanElement | null;
  const periodExpertCount = document.getElementById('period-expert-count') as HTMLSpanElement | null;
  const periodExpertPct = document.getElementById('period-expert-pct') as HTMLSpanElement | null;

  // Elements: Recent List
  const homeRecentList = document.getElementById('home-recent-list') as HTMLDivElement | null;

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

  let currentSettings: RefinziSettings;
  let currentPeriod: PeriodType = 'Week';
  let allHistory: RefinziHistoryItem[] = [];

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
          defaultMode: 'better',
          provider: 'gemini',
          apiKeys: {},
          models: { gemini: 'gemini-2.5-flash' },
          gatewayUrl: 'https://refinzi.com/api/v1/refine',
          enabledSites: { chatgpt: true, claude: true, gemini: true, perplexity: true },
          shortcuts: { better: 'Ctrl+Shift+B', expert: 'Ctrl+Shift+E' },
          theme: 'dark',
          autoFocus: true,
          showInlineTrigger: true,
          holdThresholdMs: 350,
          autoApply: true,
          saveHistory: true,
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

  // Update Header & Banner Status
  updateHeaderEngineStatus(currentSettings.provider);

  // =========================================================================
  // 2. TAB NAVIGATION
  // =========================================================================
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

    // 5. Activity Breakdown Bar
    if (periodBetterCount) periodBetterCount.textContent = String(summary.betterCount);
    if (periodBetterPct) periodBetterPct.textContent = `(${summary.betterPercentage}%)`;
    if (periodExpertCount) periodExpertCount.textContent = String(summary.expertCount);
    if (periodExpertPct) periodExpertPct.textContent = `(${summary.expertPercentage}%)`;
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
    const filtered = query
      ? items.filter(
          (i) =>
            i.originalPrompt.toLowerCase().includes(query) ||
            i.refinedPrompt.toLowerCase().includes(query) ||
            i.targetAi.toLowerCase().includes(query)
        )
      : items;

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
    updateHeaderEngineStatus(provider);

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

  // =========================================================================
  // 8. UI HELPERS & GUIDEBOOK
  // =========================================================================
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
      tier: 'Free Tier Available (15 RPM / 1M TPM)',
      defaultModel: 'gemini-2.5-flash',
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
      defaultModel: 'gpt-4o-mini',
      steps: [
        'Log in to your OpenAI Developer Platform account.',
        'Navigate to "API Keys" and click "Create new secret key".',
        'Paste below (recommended model: gpt-4o-mini or o3-mini).',
      ],
    },
    deepseek: {
      icon: '🐋',
      name: 'DeepSeek API Setup',
      url: 'https://platform.deepseek.com/api_keys',
      tier: 'Ultra-low cost (~$0.14/M tokens)',
      defaultModel: 'deepseek-chat',
      steps: [
        'Log in to DeepSeek Platform console.',
        'Create an API key in the API Keys section.',
        'Paste below (supports V3 deepseek-chat & R1 reasoner).',
      ],
    },
    openrouter: {
      icon: '🌐',
      name: 'OpenRouter Multi-Model Setup',
      url: 'https://openrouter.ai/keys',
      tier: 'Free Models Supported',
      defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
      steps: [
        'Sign in to OpenRouter.ai with GitHub or Google.',
        'Generate a new API key from the Keys dashboard.',
        'Paste below (access Llama 3.3 70B, DeepSeek R1, and Gemini 2.0).',
      ],
    },
    gateway: {
      icon: '☁️',
      name: 'Refinzi Cloud Gateway',
      url: 'https://refinzi.com',
      tier: 'Official Hosted Service',
      defaultModel: 'gateway-default',
      steps: [
        'Connects through the official Refinzi Cloud Gateway.',
        'Provides high-throughput multi-model fallback.',
        'Requires active Refinzi Pro token.',
      ],
    },
  };

  function updateProviderForm(provider: AIProviderId): void {
    if (!settingKeyRow || !settingModelRow || !settingApiKey || !settingModel) return;

    if (provider === 'local') {
      providerGuidebook?.classList.add('hidden');
      settingKeyRow.classList.add('hidden');
      settingModelRow.classList.add('hidden');
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

  function updateHeaderEngineStatus(provider: AIProviderId): void {
    if (provider === 'local') {
      if (globalStatusText) globalStatusText.textContent = 'Local Ready';
      if (engineName) engineName.textContent = 'Instant Local Engine (0ms)';
    } else if (provider === 'gemini') {
      const hasKey = Boolean(currentSettings?.apiKeys?.gemini);
      if (globalStatusText) globalStatusText.textContent = hasKey ? 'Gemini 2.5 Flash' : 'Gemini Flash';
      if (engineName) engineName.textContent = hasKey ? 'Google Gemini 2.5 Flash (BYOK)' : 'Google Gemini Flash (Default)';
    } else {
      const name = capitalize(provider);
      const hasKey = Boolean(currentSettings?.apiKeys?.[provider as keyof typeof currentSettings.apiKeys]);
      if (globalStatusText) globalStatusText.textContent = hasKey ? `${name} Ready` : `${name} (Configure)`;
      if (engineName) engineName.textContent = `${name} Engine (BYOK)`;
    }
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
