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
    expect(tooltipTimeSaved?.getAttribute('title')).toContain('average time assumed for manually refining a prompt');

    // 4. Metric 3: Estimated Cost Saved
    const cardCost = document.getElementById('card-cost-saved');
    const metricCostSaved = document.getElementById('metric-cost-saved');
    const metricCostSub = document.getElementById('metric-cost-sub');
    const tooltipCostSaved = document.getElementById('tooltip-cost-saved');
    expect(cardCost).not.toBeNull();
    expect(metricCostSaved).not.toBeNull();
    expect(metricCostSub).not.toBeNull();
    expect(tooltipCostSaved?.getAttribute('title')).toContain('Estimated from AI usage/iteration costs available to Refinzi');

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
});
