// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserAPI } from '../src/browser/api';
import fs from 'fs';
import path from 'path';

describe('Refinzi Popup UI Controller DOM & User Interactions', () => {
  let htmlContent: string;

  beforeEach(() => {
    const popupHtmlPath = path.resolve(__dirname, '../popup/popup.html');
    htmlContent = fs.readFileSync(popupHtmlPath, 'utf8');
    document.body.innerHTML = htmlContent;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('contains all four top metric elements and period toggle in Home dashboard', () => {
    // 1. Period Toggle Group
    const periodButtons = document.querySelectorAll('.period-btn');
    expect(periodButtons).toHaveLength(4);
    const periods = Array.from(periodButtons).map((btn) => btn.getAttribute('data-period'));
    expect(periods).toEqual(['Today', 'Week', 'Month', 'All Time']);

    // 2. Metric 1: Prompts Enhanced
    const cardPrompts = document.getElementById('card-prompts-enhanced');
    const metricTotalPrompts = document.getElementById('metric-total-prompts');
    const metricPromptsSub = document.getElementById('metric-prompts-sub');
    expect(cardPrompts).not.toBeNull();
    expect(metricTotalPrompts).not.toBeNull();
    expect(metricPromptsSub).not.toBeNull();

    // 3. Metric 2: Estimated Time Saved
    const cardTime = document.getElementById('card-time-saved');
    const metricTimeSaved = document.getElementById('metric-time-saved');
    const metricTimeSub = document.getElementById('metric-time-sub');
    const tooltipTimeSaved = document.getElementById('tooltip-time-saved');
    expect(cardTime).not.toBeNull();
    expect(metricTimeSaved).not.toBeNull();
    expect(metricTimeSub).not.toBeNull();
    // Tooltip must describe the ACTUAL calculation (prompts × configurable
    // minutes-per-prompt, default 2.5) — not the stale "4 min" copy.
    expect(tooltipTimeSaved?.getAttribute('title')).toContain('minutes-per-prompt');
    expect(tooltipTimeSaved?.getAttribute('title')).toContain('2.5 min');

    // 4. Metric 3: Estimated Cost Saved
    const cardCost = document.getElementById('card-cost-saved');
    const metricCostSaved = document.getElementById('metric-cost-saved');
    const metricCostSub = document.getElementById('metric-cost-sub');
    const tooltipCostSaved = document.getElementById('tooltip-cost-saved');
    expect(cardCost).not.toBeNull();
    expect(metricCostSaved).not.toBeNull();
    expect(metricCostSub).not.toBeNull();
    // Tooltip must describe the ACTUAL model (per-refinement iteration cost ×
    // iterations avoided) — not a non-existent "$50/hr" rate.
    expect(tooltipCostSaved?.getAttribute('title')).toContain('per-refinement AI usage/iteration costs');

    // 5. Metric 4: Better / Expert Usage
    const cardUsage = document.getElementById('card-usage-split');
    const metricBetterExpertVal = document.getElementById('metric-better-expert-val');
    const metricBetterExpertSub = document.getElementById('metric-better-expert-sub');
    expect(cardUsage).not.toBeNull();
    expect(metricBetterExpertVal).not.toBeNull();
    expect(metricBetterExpertSub).not.toBeNull();

    // 6. Period Activity Breakdown Bar
    const periodBetterCount = document.getElementById('period-better-count');
    const periodExpertCount = document.getElementById('period-expert-count');
    expect(periodBetterCount).not.toBeNull();
    expect(periodExpertCount).not.toBeNull();

    // 7. Recent Calibrations list
    const homeRecentList = document.getElementById('home-recent-list');
    expect(homeRecentList).not.toBeNull();
  });

  it('verifies absence of vanity metrics in Home dashboard', () => {
    // Quality Score, star ratings, streaks, words enhanced MUST NOT be present
    expect(document.getElementById('metric-quality-score')).toBeNull();
    expect(document.getElementById('metric-quality-stars')).toBeNull();
    expect(document.getElementById('metric-streak')).toBeNull();
    expect(document.getElementById('metric-words')).toBeNull();
    expect(document.getElementById('metric-success-rate')).toBeNull();
  });

  it('keeps the mini dashboard uncluttered: exactly four metric cards, one activity bar, one engine banner', () => {
    // The Home view must not grow new rows/cards when features are added.
    // Free-tier status and estimate settings are deliberately placed in the
    // existing engine banner and the Settings tab instead.
    expect(document.querySelectorAll('#tab-home .dash-card')).toHaveLength(4);
    expect(document.querySelectorAll('#tab-home .period-activity-bar')).toHaveLength(1);
    expect(document.querySelectorAll('#tab-home .engine-banner')).toHaveLength(1);

    // No additional metric tiles or banners were introduced.
    expect(document.getElementById('card-free-tier')).toBeNull();
    expect(document.querySelectorAll('#tab-home .dash-card').length).toBeLessThan(5);
  });

  it('reuses the existing engine banner for free-tier status rather than adding an element', () => {
    // The runtime appends `<span class="engine-free">` into #engine-name.
    // Assert the host elements exist and nothing is hardcoded in the static markup.
    expect(document.getElementById('home-engine-banner')).not.toBeNull();
    expect(document.getElementById('engine-name')).not.toBeNull();
    expect(document.querySelectorAll('.engine-free')).toHaveLength(0);

    // The CTA button already exists and is reused for the upgrade nudge.
    const quickProvider = document.getElementById('btn-quick-provider');
    expect(quickProvider).not.toBeNull();
    expect(quickProvider?.textContent).toContain('Configure');
  });

  it('exposes the three dashboard estimate assumptions as compact Settings controls', () => {
    const minutes = document.getElementById('setting-est-minutes') as HTMLInputElement | null;
    const iterations = document.getElementById('setting-est-iterations') as HTMLInputElement | null;
    const fallbackCost = document.getElementById('setting-fallback-cost') as HTMLInputElement | null;

    expect(minutes).not.toBeNull();
    expect(iterations).not.toBeNull();
    expect(fallbackCost).not.toBeNull();

    // Defaults must mirror DEFAULT_METRICS_CONFIG in utils/metrics.ts.
    expect(minutes?.value).toBe('2.5');
    expect(iterations?.value).toBe('1.5');
    expect(fallbackCost?.value).toBe('0.008');

    // Bounds prevent nonsensical estimates.
    expect(minutes?.getAttribute('min')).toBe('0.5');
    expect(iterations?.getAttribute('min')).toBe('0');
    expect(fallbackCost?.getAttribute('step')).toBe('0.001');

    // The three controls live in the Settings tab, not on the Home dashboard.
    expect(document.querySelectorAll('#tab-settings #setting-est-minutes')).toHaveLength(1);
    expect(document.querySelectorAll('#tab-home #setting-est-minutes')).toHaveLength(0);
  });
});
