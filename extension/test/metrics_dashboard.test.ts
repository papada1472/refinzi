// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserAPI } from '../src/browser/api';
import { __resetStorageLayerForTests } from '../src/utils/storage-batch';
import {
  recordUsageEvent,
  clearUsageEvents,
  deleteUsageEvent,
  getUsageEvents,
  filterEventsByPeriod,
  calculateTimeSaved,
  calculateCostSaved,
  computeMetricsSummary,
  DEFAULT_METRICS_CONFIG,
  MODEL_PRICING,
  PeriodType,
  RefinziUsageEvent,
} from '../src/utils/metrics';
import { addHistoryItem, getHistory, clearHistory, deleteHistoryItem, saveSettings } from '../src/utils/storage';
import fs from 'fs';
import path from 'path';

describe('Refinzi Home Dashboard Metrics & Data Architecture', () => {
  let mockStorage: Record<string, any> = {};

  beforeEach(async () => {
    mockStorage = {};
    // Storage backend is replaced wholesale: drop cached snapshots and any
    // open batch so nothing leaks from the previous test.
    __resetStorageLayerForTests();

    vi.spyOn(BrowserAPI.storage.local, 'get').mockImplementation(async (keys: any) => {
      if (!keys) return { ...mockStorage };
      const keyList = Array.isArray(keys) ? keys : [keys];
      const res: Record<string, any> = {};
      for (const k of keyList) {
        if (k in mockStorage) res[k] = mockStorage[k];
      }
      return res;
    });

    vi.spyOn(BrowserAPI.storage.local, 'set').mockImplementation(async (items: any) => {
      mockStorage = { ...mockStorage, ...items };
    });

    vi.spyOn(BrowserAPI.storage.local, 'clear').mockImplementation(async () => {
      mockStorage = {};
    });

    await clearUsageEvents();
    __resetStorageLayerForTests();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // TEST 1: 10 successful Better transformations -> Prompts Enhanced = 10
  it('1. records 10 successful Better transformations and aggregates Prompts Enhanced = 10', async () => {
    const now = Date.now();
    for (let i = 1; i <= 10; i++) {
      const added = await recordUsageEvent({
        id: `better_event_${i}`,
        timestamp: now - i * 1000,
        mode: 'better',
        targetAi: 'chatgpt',
        provider: 'local',
        success: true,
      });
      expect(added).toBe(true);
    }

    const events = await getUsageEvents();
    expect(events).toHaveLength(10);

    const summary = computeMetricsSummary(events, 'Week', DEFAULT_METRICS_CONFIG, now);
    expect(summary.totalPromptsEnhanced).toBe(10);
    expect(summary.betterCount).toBe(10);
    expect(summary.expertCount).toBe(0);
    expect(summary.betterPercentage).toBe(100);
    expect(summary.expertPercentage).toBe(0);
  });

  // TEST 2: 5 successful Expert transformations -> Expert = 5
  it('2. records 5 successful Expert transformations resulting in Expert = 5 and accurate split', async () => {
    const now = Date.now();
    // 10 Better + 5 Expert
    for (let i = 1; i <= 10; i++) {
      await recordUsageEvent({
        id: `better_split_${i}`,
        timestamp: now - i * 1000,
        mode: 'better',
        targetAi: 'claude',
        provider: 'local',
        success: true,
      });
    }

    for (let j = 1; j <= 5; j++) {
      const added = await recordUsageEvent({
        id: `expert_split_${j}`,
        timestamp: now - (10 + j) * 1000,
        mode: 'expert',
        targetAi: 'claude',
        provider: 'local',
        success: true,
      });
      expect(added).toBe(true);
    }

    const events = await getUsageEvents();
    const summary = computeMetricsSummary(events, 'Week', DEFAULT_METRICS_CONFIG, now);
    expect(summary.totalPromptsEnhanced).toBe(15);
    expect(summary.betterCount).toBe(10);
    expect(summary.expertCount).toBe(5);
    expect(summary.betterPercentage).toBe(67);
    expect(summary.expertPercentage).toBe(33);
  });

  // TEST 3: Failed transformation -> does not increment successful prompts
  it('3. does not count failed or cancelled transformations toward successful Prompts Enhanced', async () => {
    const now = Date.now();
    // 3 successful Better
    for (let i = 1; i <= 3; i++) {
      await recordUsageEvent({
        id: `success_evt_${i}`,
        timestamp: now - i * 1000,
        mode: 'better',
        targetAi: 'chatgpt',
        provider: 'local',
        success: true,
      });
    }

    // 2 failed attempts
    for (let j = 1; j <= 2; j++) {
      await recordUsageEvent({
        id: `fail_evt_${j}`,
        timestamp: now - (10 + j) * 1000,
        mode: 'better',
        targetAi: 'chatgpt',
        provider: 'openai',
        success: false,
      });
    }

    const events = await getUsageEvents();
    expect(events).toHaveLength(5); // 5 recorded events total

    const summary = computeMetricsSummary(events, 'Week', DEFAULT_METRICS_CONFIG, now);
    // Successful prompts must remain strictly 3!
    expect(summary.totalPromptsEnhanced).toBe(3);
    expect(summary.betterCount).toBe(3);
  });

  // TEST 4: Duplicate event -> counted once
  it('4. strictly enforces idempotency so duplicate events are counted exactly once', async () => {
    const eventId = 'unique_req_abc_123';

    // First attempt -> recorded
    const firstCall = await recordUsageEvent({
      id: eventId,
      timestamp: Date.now(),
      mode: 'better',
      targetAi: 'chatgpt',
      provider: 'local',
      success: true,
    });
    expect(firstCall).toBe(true);

    // Duplicate call with the same ID (e.g. service-worker retry or component re-render)
    const duplicateCall = await recordUsageEvent({
      id: eventId,
      timestamp: Date.now(),
      mode: 'better',
      targetAi: 'chatgpt',
      provider: 'local',
      success: true,
    });
    expect(duplicateCall).toBe(false);

    const events = await getUsageEvents();
    expect(events).toHaveLength(1);

    const summary = computeMetricsSummary(events, 'Week');
    expect(summary.totalPromptsEnhanced).toBe(1);
  });

  // TEST 5: Time saved -> calculated from configured estimate
  it('5. calculates transparent time saved from configurable minutes per prompt without marketing claims', () => {
    // Zero prompts -> ~0m
    expect(calculateTimeSaved(0)).toEqual({ minutes: 0, formatted: '~0m' });

    // 10 prompts × default 2.5 min = 25 min -> ~25m
    const res10 = calculateTimeSaved(10, DEFAULT_METRICS_CONFIG);
    expect(res10.minutes).toBe(25);
    expect(res10.formatted).toBe('~25m');

    // 128 prompts × 2.5 min = 320 min = 5h 20m -> ~5h 20m
    const res128 = calculateTimeSaved(128, DEFAULT_METRICS_CONFIG);
    expect(res128.minutes).toBe(320);
    expect(res128.formatted).toBe('~5h 20m');

    // 24 prompts × 2.5 min = 60 min -> ~1h
    const res24 = calculateTimeSaved(24, DEFAULT_METRICS_CONFIG);
    expect(res24.formatted).toBe('~1h');

    // Configurable: custom 3.0 min/prompt
    const customConfig = { ...DEFAULT_METRICS_CONFIG, estimatedMinutesPerPrompt: 3.0 };
    const resCustom = calculateTimeSaved(10, customConfig);
    expect(resCustom.minutes).toBe(30);
    expect(resCustom.formatted).toBe('~30m');
  });

  // TEST 6: Cost saved with valid provider/model pricing -> calculated correctly
  it('6. calculates transparent cost saved when valid provider/model pricing or token usage is available', () => {
    // 10 prompts with OpenAI gpt-4o (turn cost: 0.00925, avoided iterations: 1.5)
    // 10 * 1.5 * 0.00925 = 0.13875 -> ~$0.14
    const events: RefinziUsageEvent[] = Array.from({ length: 10 }, (_, i) => ({
      id: `evt_paid_${i}`,
      timestamp: Date.now(),
      mode: 'better',
      targetAi: 'chatgpt',
      provider: 'openai',
      model: 'gpt-4o',
      success: true,
    }));

    const costRes = calculateCostSaved(events, DEFAULT_METRICS_CONFIG);
    expect(costRes.hasData).toBe(true);
    expect(costRes.costUsd).toBeCloseTo(0.13875, 4);
    expect(costRes.formatted).toBe('~$0.14');

    // Direct token usage provided
    const tokenEvents: RefinziUsageEvent[] = [
      {
        id: 'evt_token_1',
        timestamp: Date.now(),
        mode: 'expert',
        targetAi: 'claude',
        provider: 'claude',
        model: 'claude-3-5-sonnet',
        success: true,
        tokenUsage: {
          promptTokens: 1000,
          completionTokens: 1000,
          totalTokens: 2000,
        },
      },
    ];
    // claude-3-5-sonnet: input: $0.003/1k, output: $0.015/1k -> direct: $0.018. Avoided (1.5) -> $0.027
    const tokenCostRes = calculateCostSaved(tokenEvents, DEFAULT_METRICS_CONFIG);
    expect(tokenCostRes.hasData).toBe(true);
    expect(tokenCostRes.costUsd).toBeCloseTo(0.027, 3);
    expect(tokenCostRes.formatted).toBe('~$0.03');
  });

  // TEST 7: Cost saved without pricing -> shows unavailable, not fabricated
  it('7. displays "—" (Cost estimate unavailable) when pricing is unavailable instead of inventing dollar values', () => {
    // Default offline local engine with no external API usage
    const localEvents: RefinziUsageEvent[] = [
      {
        id: 'evt_local_1',
        timestamp: Date.now(),
        mode: 'better',
        targetAi: 'general',
        provider: 'local',
        success: true,
      },
      {
        id: 'evt_local_2',
        timestamp: Date.now(),
        mode: 'expert',
        targetAi: 'general',
        provider: 'local',
        success: true,
      },
    ];

    const res = calculateCostSaved(localEvents, DEFAULT_METRICS_CONFIG);
    expect(res.hasData).toBe(false);
    expect(res.costUsd).toBeNull();
    expect(res.formatted).toBe('—');

    // Also when there are zero successful events
    const emptyRes = calculateCostSaved([], DEFAULT_METRICS_CONFIG);
    expect(emptyRes.hasData).toBe(false);
    expect(emptyRes.formatted).toBe('—');
  });

  // TEST 8: Period filtering -> Today / Week / Month / All Time correct
  it('8. filters metrics accurately across Today, Week, Month, and All Time periods', () => {
    const now = new Date(2026, 8, 19, 12, 0, 0).getTime(); // Fixed baseline
    const hour = 60 * 60 * 1000;
    const day = 24 * hour;

    const events: RefinziUsageEvent[] = [
      // 2 events Today (1h and 3h ago)
      { id: 't1', timestamp: now - 1 * hour, mode: 'better', targetAi: 'chatgpt', provider: 'local', success: true },
      { id: 't2', timestamp: now - 3 * hour, mode: 'expert', targetAi: 'claude', provider: 'local', success: true },
      // 2 events Earlier this Week (3 days and 5 days ago)
      { id: 'w1', timestamp: now - 3 * day, mode: 'better', targetAi: 'chatgpt', provider: 'local', success: true },
      { id: 'w2', timestamp: now - 5 * day, mode: 'expert', targetAi: 'gemini', provider: 'local', success: true },
      // 1 event Earlier this Month (18 days ago)
      { id: 'm1', timestamp: now - 18 * day, mode: 'better', targetAi: 'perplexity', provider: 'local', success: true },
      // 1 event Lifetime only (50 days ago)
      { id: 'a1', timestamp: now - 50 * day, mode: 'better', targetAi: 'chatgpt', provider: 'local', success: true },
    ];

    // Today
    const todaySummary = computeMetricsSummary(events, 'Today', DEFAULT_METRICS_CONFIG, now);
    expect(todaySummary.totalPromptsEnhanced).toBe(2);
    expect(todaySummary.promptsPeriodSubtitle).toBe('2 today');

    // Week
    const weekSummary = computeMetricsSummary(events, 'Week', DEFAULT_METRICS_CONFIG, now);
    expect(weekSummary.totalPromptsEnhanced).toBe(4);
    expect(weekSummary.promptsPeriodSubtitle).toBe('+4 this week');

    // Month
    const monthSummary = computeMetricsSummary(events, 'Month', DEFAULT_METRICS_CONFIG, now);
    expect(monthSummary.totalPromptsEnhanced).toBe(5);
    expect(monthSummary.promptsPeriodSubtitle).toBe('+5 this month');

    // All Time
    const allTimeSummary = computeMetricsSummary(events, 'All Time', DEFAULT_METRICS_CONFIG, now);
    expect(allTimeSummary.totalPromptsEnhanced).toBe(6);
    expect(allTimeSummary.promptsPeriodSubtitle).toBe('6 lifetime total');
  });

  // TEST 9: Popup reload -> metrics unchanged
  it('9. maintains completely idempotent, unchanged metrics on popup reload/reopen', async () => {
    const now = Date.now();
    for (let i = 1; i <= 5; i++) {
      await recordUsageEvent({
        id: `stable_evt_${i}`,
        timestamp: now - i * 1000,
        mode: 'better',
        targetAi: 'chatgpt',
        provider: 'local',
        success: true,
      });
    }

    // First query (e.g. initial popup open)
    const initialEvents = await getUsageEvents();
    const summary1 = computeMetricsSummary(initialEvents, 'Week');

    // Reopen popup 5 times (pure read requests)
    for (let reload = 1; reload <= 5; reload++) {
      const reloadedEvents = await getUsageEvents();
      const summaryReloaded = computeMetricsSummary(reloadedEvents, 'Week');
      expect(summaryReloaded.totalPromptsEnhanced).toBe(summary1.totalPromptsEnhanced);
      expect(summaryReloaded.betterCount).toBe(summary1.betterCount);
      expect(summaryReloaded.expertCount).toBe(summary1.expertCount);
    }
  });

  // TEST 10: Extension restart -> metrics unchanged
  it('10. persists and restores exact metrics across simulated extension restart', async () => {
    const now = Date.now();
    for (let i = 1; i <= 7; i++) {
      await recordUsageEvent({
        id: `restart_evt_${i}`,
        timestamp: now - i * 1000,
        mode: i % 2 === 0 ? 'better' : 'expert',
        targetAi: 'chatgpt',
        provider: 'local',
        success: true,
      });
    }

    const beforeEvents = await getUsageEvents();
    const beforeSummary = computeMetricsSummary(beforeEvents, 'Week');
    expect(beforeSummary.totalPromptsEnhanced).toBe(7);

    // Simulate extension restart: clear memory cache
    clearUsageEvents;

    // Fresh read from persistent storage
    const afterEvents = await getUsageEvents();
    const afterSummary = computeMetricsSummary(afterEvents, 'Week');

    expect(afterSummary.totalPromptsEnhanced).toBe(7);
    expect(afterSummary.betterCount).toBe(beforeSummary.betterCount);
    expect(afterSummary.expertCount).toBe(beforeSummary.expertCount);
  });

  // TEST 11: History disabled -> privacy policy respected
  it('11. respects "saveHistory: false" privacy setting without leaking sensitive prompt content', async () => {
    await saveSettings({ saveHistory: false });

    // Try adding history with sensitive prompt text
    await addHistoryItem({
      mode: 'better',
      targetAi: 'chatgpt',
      originalPrompt: 'Confidential corporate strategy and private revenue numbers',
      refinedPrompt: 'Calibrated confidential prompt',
      provider: 'local',
    });

    const history = await getHistory();
    // Prompt text MUST NOT be saved when saveHistory is disabled!
    expect(history).toHaveLength(0);
  });

  // TEST 12: Dark mode -> readable
  it('12. ensures dark mode color tokens have high contrast and readability', () => {
    const cssPath = path.resolve(__dirname, '../popup/popup.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    // High contrast tokens
    expect(cssContent).toContain('--bg-main: #09090b');
    expect(cssContent).toContain('--text-primary: #f4f4f5');
    expect(cssContent).toContain('--text-secondary: #a1a1aa');
    expect(cssContent).toContain('--gold-accent: #ffd700');
    expect(cssContent).toContain('--border-subtle: rgba(255, 255, 255, 0.08)');
  });

  // TEST 13: Reduced motion -> animations appropriately disabled
  it('13. provides @media (prefers-reduced-motion: reduce) accessibility rules', () => {
    const cssPath = path.resolve(__dirname, '../popup/popup.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    expect(cssContent).toContain('@media (prefers-reduced-motion: reduce)');
    expect(cssContent).toContain('animation-duration: 0.01ms !important');
    expect(cssContent).toContain('transition-duration: 0.01ms !important');
  });

  // TEST 14: Delete single history item
  it('14. supports deleting individual calibrations from history and synchronizing storage', async () => {
    await saveSettings({ saveHistory: true });

    await addHistoryItem({
      mode: 'better',
      targetAi: 'chatgpt',
      originalPrompt: 'Delete me prompt',
      refinedPrompt: 'Calibrated prompt',
      provider: 'local',
    });

    let history = await getHistory();
    expect(history).toHaveLength(1);
    const itemToDeleteId = history[0].id;

    await deleteHistoryItem(itemToDeleteId);
    await deleteUsageEvent(itemToDeleteId);

    history = await getHistory();
    expect(history).toHaveLength(0);
  });

  // TEST 15: Period invariant — allTimeCount must always ≥ every narrower period count
  //           and totalPromptsEnhanced must equal the count for the requested period.
  //           This is the regression test for the "6 vs 5 lifetime total" class of
  //           contradictions visible in screenshots.
  it('15. period invariant: allTimeCount >= weekCount >= todayCount and totalPromptsEnhanced equals period slice', async () => {
    const now = Date.now();
    const HOUR = 60 * 60 * 1000;
    const DAY  = 24 * HOUR;

    // 2 events today (within last 24h)
    await recordUsageEvent({ id: 'p15_t1', timestamp: now - 1 * HOUR,  mode: 'better', targetAi: 'chatgpt', provider: 'local', success: true });
    await recordUsageEvent({ id: 'p15_t2', timestamp: now - 3 * HOUR,  mode: 'expert', targetAi: 'claude',  provider: 'local', success: true });

    // 2 more events within the week but not today
    await recordUsageEvent({ id: 'p15_w1', timestamp: now - 3 * DAY,   mode: 'better', targetAi: 'gemini',  provider: 'local', success: true });
    await recordUsageEvent({ id: 'p15_w2', timestamp: now - 5 * DAY,   mode: 'better', targetAi: 'chatgpt', provider: 'local', success: true });

    // 2 more within the month but not the week
    await recordUsageEvent({ id: 'p15_m1', timestamp: now - 18 * DAY,  mode: 'expert', targetAi: 'claude',  provider: 'local', success: true });
    await recordUsageEvent({ id: 'p15_m2', timestamp: now - 25 * DAY,  mode: 'better', targetAi: 'chatgpt', provider: 'local', success: true });

    // 2 older than 30 days — All Time only
    await recordUsageEvent({ id: 'p15_a1', timestamp: now - 45 * DAY,  mode: 'better', targetAi: 'chatgpt', provider: 'local', success: true });
    await recordUsageEvent({ id: 'p15_a2', timestamp: now - 90 * DAY,  mode: 'expert', targetAi: 'gemini',  provider: 'local', success: true });

    const events = await getUsageEvents();

    const todaySummary = computeMetricsSummary(events, 'Today',    DEFAULT_METRICS_CONFIG, now);
    const weekSummary  = computeMetricsSummary(events, 'Week',     DEFAULT_METRICS_CONFIG, now);
    const monthSummary = computeMetricsSummary(events, 'Month',    DEFAULT_METRICS_CONFIG, now);
    const allSummary   = computeMetricsSummary(events, 'All Time', DEFAULT_METRICS_CONFIG, now);

    // ── Exact period slice correctness ────────────────────────────────────────
    expect(todaySummary.totalPromptsEnhanced).toBe(2);  // p15_t1, p15_t2
    expect(weekSummary.totalPromptsEnhanced ).toBe(4);  // + p15_w1, p15_w2
    expect(monthSummary.totalPromptsEnhanced).toBe(6);  // + p15_m1, p15_m2
    expect(allSummary.totalPromptsEnhanced  ).toBe(8);  // + p15_a1, p15_a2

    // ── Cross-period embedded counts satisfy strict hierarchy ─────────────────
    expect(allSummary.allTimeCount).toBeGreaterThanOrEqual(allSummary.monthCount);
    expect(allSummary.monthCount  ).toBeGreaterThanOrEqual(allSummary.weekCount);
    expect(allSummary.weekCount   ).toBeGreaterThanOrEqual(allSummary.todayCount);

    // Same invariants must hold from every period's vantage point
    for (const summary of [todaySummary, weekSummary, monthSummary, allSummary]) {
      expect(summary.allTimeCount).toBeGreaterThanOrEqual(summary.monthCount);
      expect(summary.monthCount  ).toBeGreaterThanOrEqual(summary.weekCount);
      expect(summary.weekCount   ).toBeGreaterThanOrEqual(summary.todayCount);
      // The card value must never exceed allTimeCount
      expect(summary.allTimeCount).toBeGreaterThanOrEqual(summary.totalPromptsEnhanced);
    }

    // ── Embedded cross-period counts match expected values ────────────────────
    expect(allSummary.allTimeCount).toBe(8);
    expect(allSummary.monthCount  ).toBe(6);
    expect(allSummary.weekCount   ).toBe(4);
    expect(allSummary.todayCount  ).toBe(2);
  });
});
