/**
 * REFINZI — Dashboard Metrics Architecture
 * 
 * CORE PRINCIPLES:
 * 1. The dashboard communicates product usage and ROI in seconds.
 * 2. Four primary metrics only: Prompts Enhanced, Est. Time Saved, Est. Cost Saved, Better/Expert Usage.
 * 3. Transparent estimation: Never claim measured time/cost unless actually measured.
 * 4. Zero fabricated numbers: If pricing/usage unavailable, display "—" / "Cost estimate unavailable".
 * 5. Idempotent deduplication: One user action = one transformation = one metric increment.
 * 6. Period-aware: Today | Week | Month | All Time (Default: Week).
 */

import { BrowserAPI } from '../browser/api';
import { stageWrite } from './storage-batch';
import type { PromptMode, AIProviderId, PeriodType, RefinziUsageEvent, RefinziMetricsSummary, RefinziHistoryItem } from '../types';

export type { PeriodType, RefinziUsageEvent, RefinziMetricsSummary };

export interface ModelPricing {
  inputPer1k: number;
  outputPer1k: number;
  averageTurnCost: number; // Blended turn cost: ~500 in tokens, ~800 out tokens
}

export interface MetricsConfig {
  estimatedMinutesPerPrompt: number; // Configurable (default: 2.5 min)
  estimatedAvoidedIterations: number; // Configurable (default: 1.5 iterations)
  fallbackCostPerIteration: number; // Fallback cost if provider known but model unlisted (default: $0.008)
  customPricing?: Record<string, ModelPricing>;
}

export const DEFAULT_METRICS_CONFIG: MetricsConfig = {
  estimatedMinutesPerPrompt: 2.5,
  estimatedAvoidedIterations: 1.5,
  fallbackCostPerIteration: 0.008,
};

/**
 * Verified Model Pricing (Per 1k tokens) and estimated turn costs.
 *
 * `averageTurnCost` is the blended cost of one refinement turn assuming
 * ~500 input tokens and ~800 output tokens:
 *     averageTurnCost = 0.5 * inputPer1k + 0.8 * outputPer1k
 *
 * Superseded (retired) model IDs are deliberately retained so that historical
 * usage events recorded before a migration still price correctly.
 */
export const MODEL_PRICING: Record<string, ModelPricing> = {
  // OpenAI — current generation
  'gpt-6-astra': { inputPer1k: 0.01, outputPer1k: 0.05, averageTurnCost: 0.045 },
  'gpt-5.6-sol': { inputPer1k: 0.004, outputPer1k: 0.02, averageTurnCost: 0.018 },
  'gpt-5.6-terra': { inputPer1k: 0.002, outputPer1k: 0.012, averageTurnCost: 0.0106 },
  'gpt-5.6-luna': { inputPer1k: 0.0002, outputPer1k: 0.0012, averageTurnCost: 0.00106 },
  'gpt-5.4-mini': { inputPer1k: 0.00075, outputPer1k: 0.0045, averageTurnCost: 0.00398 },
  'gpt-5.4-nano': { inputPer1k: 0.0002, outputPer1k: 0.00125, averageTurnCost: 0.0011 },
  'gpt-5-mini': { inputPer1k: 0.00025, outputPer1k: 0.002, averageTurnCost: 0.00173 },
  'gpt-5-nano': { inputPer1k: 0.00005, outputPer1k: 0.0004, averageTurnCost: 0.00035 },
  // OpenAI — legacy (still billed, retained for historical events)
  'gpt-4o-mini': { inputPer1k: 0.00015, outputPer1k: 0.0006, averageTurnCost: 0.00055 },
  'gpt-4o': { inputPer1k: 0.0025, outputPer1k: 0.010, averageTurnCost: 0.00925 },
  'gpt-4-turbo': { inputPer1k: 0.01, outputPer1k: 0.03, averageTurnCost: 0.029 },
  'o1-mini': { inputPer1k: 0.003, outputPer1k: 0.012, averageTurnCost: 0.011 },
  'o3-mini': { inputPer1k: 0.0011, outputPer1k: 0.0044, averageTurnCost: 0.004 },
  // Anthropic / Claude
  'claude-sonnet-5': { inputPer1k: 0.002, outputPer1k: 0.010, averageTurnCost: 0.009 },
  'claude-opus-5': { inputPer1k: 0.005, outputPer1k: 0.025, averageTurnCost: 0.0225 },
  'claude-haiku-4-5': { inputPer1k: 0.001, outputPer1k: 0.005, averageTurnCost: 0.0045 },
  'claude-3-5-sonnet': { inputPer1k: 0.003, outputPer1k: 0.015, averageTurnCost: 0.0135 },
  'claude-3-7-sonnet': { inputPer1k: 0.003, outputPer1k: 0.015, averageTurnCost: 0.0135 },
  'claude-3-haiku': { inputPer1k: 0.00025, outputPer1k: 0.00125, averageTurnCost: 0.00112 },
  'claude-3-5-haiku': { inputPer1k: 0.0008, outputPer1k: 0.004, averageTurnCost: 0.0036 },
  // Google Gemini — Gemini 3.8 Flash introductory rate ($0.75 / $3.75 per 1M)
  'gemini-flash-latest': { inputPer1k: 0.00075, outputPer1k: 0.00375, averageTurnCost: 0.00338 },
  'gemini-3.8-flash': { inputPer1k: 0.00075, outputPer1k: 0.00375, averageTurnCost: 0.00338 },
  'gemini-pro-latest': { inputPer1k: 0.00125, outputPer1k: 0.01, averageTurnCost: 0.00863 },
  // Google Gemini — legacy (retired upstream; retained for historical events)
  'gemini-2.5-flash': { inputPer1k: 0.000075, outputPer1k: 0.0003, averageTurnCost: 0.00028 },
  'gemini-2.0-flash': { inputPer1k: 0.0001, outputPer1k: 0.0004, averageTurnCost: 0.00035 },
  'gemini-1.5-flash': { inputPer1k: 0.000075, outputPer1k: 0.0003, averageTurnCost: 0.00028 },
  'gemini-1.5-pro': { inputPer1k: 0.00125, outputPer1k: 0.005, averageTurnCost: 0.0046 },
  // DeepSeek — off-peak rates (peak hours are 2x)
  'deepseek-flash': { inputPer1k: 0.00015, outputPer1k: 0.0006, averageTurnCost: 0.00056 },
  'deepseek-v4-pro': { inputPer1k: 0.00066, outputPer1k: 0.00198, averageTurnCost: 0.00191 },
  // DeepSeek — legacy (retained for historical events)
  'deepseek-chat': { inputPer1k: 0.00014, outputPer1k: 0.00028, averageTurnCost: 0.00029 },
  'deepseek-reasoner': { inputPer1k: 0.00055, outputPer1k: 0.00219, averageTurnCost: 0.00203 },
  // Groq LPU models
  'openai/gpt-oss-120b': { inputPer1k: 0.00015, outputPer1k: 0.0006, averageTurnCost: 0.000555 },
  'openai/gpt-oss-20b': { inputPer1k: 0.000075, outputPer1k: 0.0003, averageTurnCost: 0.000278 },
  'qwen/qwen3.8-27b': { inputPer1k: 0.0002, outputPer1k: 0.0006, averageTurnCost: 0.00058 },
  // b.ai models
  'qwen3.8-flash': { inputPer1k: 0.0001, outputPer1k: 0.0004, averageTurnCost: 0.00037 },
  'qwen3.8-max': { inputPer1k: 0.0016, outputPer1k: 0.0064, averageTurnCost: 0.00592 },
  'qwen3.8-27b': { inputPer1k: 0.0002, outputPer1k: 0.0006, averageTurnCost: 0.00058 },
};

/**
 * Calculates direct API cost in USD based on model pricing and token counts.
 */
export function calculateCostUsd(
  provider: string,
  model: string,
  tokenUsage: { promptTokens: number; completionTokens: number; totalTokens?: number }
): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) return 0;
  return (
    (tokenUsage.promptTokens / 1000) * pricing.inputPer1k +
    (tokenUsage.completionTokens / 1000) * pricing.outputPer1k
  );
}

/**
 * Default model mapping when destination AI website is known
 */
export const TARGET_AI_DEFAULT_MODELS: Record<string, string> = {
  'chatgpt': 'gpt-5.6-sol',
  'claude': 'claude-sonnet-5',
  'gemini': 'gemini-3.8-flash',
  'perplexity': 'claude-sonnet-5',
};

// In-memory set of recorded event IDs to prevent race-condition duplicates across rapid calls
const inMemoryRecordedIds = new Set<string>();

/**
 * Unbounded lifetime tallies, kept separately from the rolling event window.
 *
 * `refinzi_events` is capped (see MAX_STORED_EVENTS) so period math stays cheap,
 * but that cap silently truncates "All Time" / "lifetime total" once a heavy user
 * crosses it. These counters never age out, so lifetime figures keep climbing
 * accurately for the users who engage most.
 */
export interface LifetimeTotals {
  total: number;
  better: number;
  expert: number;
}

const LIFETIME_TOTALS_KEY = 'refinzi_lifetime_totals';

/** Rolling window kept for period aggregation and per-event cost pricing. */
export const MAX_STORED_EVENTS = 1000;

export async function getLifetimeTotals(): Promise<LifetimeTotals> {
  try {
    const res = await BrowserAPI.storage.local.get([LIFETIME_TOTALS_KEY]);
    const t = (res?.[LIFETIME_TOTALS_KEY] as Partial<LifetimeTotals>) || {};
    return {
      total: typeof t.total === 'number' ? t.total : 0,
      better: typeof t.better === 'number' ? t.better : 0,
      expert: typeof t.expert === 'number' ? t.expert : 0,
    };
  } catch {
    return { total: 0, better: 0, expert: 0 };
  }
}

async function adjustLifetimeTotals(mode: PromptMode, delta: number): Promise<void> {
  try {
    const current = await getLifetimeTotals();
    const next: LifetimeTotals = {
      total: Math.max(0, current.total + delta),
      better: Math.max(0, current.better + (mode === 'better' ? delta : 0)),
      expert: Math.max(0, current.expert + (mode === 'expert' ? delta : 0)),
    };
    await stageWrite({ [LIFETIME_TOTALS_KEY]: next });
  } catch (err) {
    console.error('[Refinzi] Failed to adjust lifetime totals:', err);
  }
}

// -----------------------------------------------------------------------------
// STORAGE OPERATIONS
// -----------------------------------------------------------------------------

export async function getMetricsConfig(): Promise<MetricsConfig> {
  try {
    const res = await BrowserAPI.storage.local.get(['refinzi_metrics_config']);
    return {
      ...DEFAULT_METRICS_CONFIG,
      ...(res?.refinzi_metrics_config || {}),
    };
  } catch {
    return { ...DEFAULT_METRICS_CONFIG };
  }
}

export async function saveMetricsConfig(patch: Partial<MetricsConfig>): Promise<MetricsConfig> {
  const current = await getMetricsConfig();
  const updated = { ...current, ...patch };
  try {
    await BrowserAPI.storage.local.set({ refinzi_metrics_config: updated });
  } catch (err) {
    console.error('[Refinzi] Failed to save metrics config:', err);
  }
  return updated;
}

export async function getSelectedPeriod(): Promise<PeriodType> {
  try {
    const res = await BrowserAPI.storage.local.get(['refinzi_selected_period']);
    const period = res?.refinzi_selected_period as PeriodType;
    if (period && ['Today', 'Week', 'Month', 'All Time'].includes(period)) {
      return period;
    }
    return 'Week'; // Default per specification
  } catch {
    return 'Week';
  }
}

export async function saveSelectedPeriod(period: PeriodType): Promise<void> {
  try {
    await BrowserAPI.storage.local.set({ refinzi_selected_period: period });
  } catch (err) {
    console.error('[Refinzi] Failed to persist selected period:', err);
  }
}

export async function getUsageEvents(): Promise<RefinziUsageEvent[]> {
  try {
    const res = await BrowserAPI.storage.local.get(['refinzi_events', 'refinzi_history']);
    const events: RefinziUsageEvent[] = (res?.refinzi_events as RefinziUsageEvent[]) || [];
    const history: RefinziHistoryItem[] = (res?.refinzi_history as RefinziHistoryItem[]) || [];

    // Ensure backwards compatibility with any existing history items
    if (history.length > 0) {
      const existingIds = new Set(events.map((e) => e.id));
      for (const item of history) {
        if (item.id && !existingIds.has(item.id)) {
          events.push({
            id: item.id,
            timestamp: item.timestamp,
            mode: item.mode,
            targetAi: item.targetAi || 'general',
            provider: item.provider || 'local',
            success: true,
          });
          existingIds.add(item.id);
        }
      }
    }

    // Sync in-memory set
    for (const evt of events) {
      if (evt.id) inMemoryRecordedIds.add(evt.id);
    }

    return events;
  } catch {
    return [];
  }
}

/**
 * Records a usage event with strict idempotency / deduplication.
 * Returns true if newly recorded, false if duplicate or ignored.
 */
export async function recordUsageEvent(
  event: Omit<RefinziUsageEvent, 'timestamp'> & { timestamp?: number }
): Promise<boolean> {
  try {
    // 1. Immediate in-memory idempotency check (stops concurrent async races).
    // getUsageEvents() hydrates this set from every stored id, so an O(1)
    // lookup here fully subsumes the old O(n) scan over the persisted array —
    // which used to re-read and linearly search up to 500 events per write.
    if (event.id && inMemoryRecordedIds.has(event.id)) {
      return false;
    }

    const events = await getUsageEvents();

    const eventId = event.id || `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    inMemoryRecordedIds.add(eventId);

    const newEvent: RefinziUsageEvent = {
      id: eventId,
      timestamp: event.timestamp || Date.now(),
      mode: event.mode,
      targetAi: event.targetAi,
      provider: event.provider,
      model: event.model,
      success: event.success,
      tokenUsage: event.tokenUsage,
      costUsd: event.costUsd,
    };

    // Keep a bounded window of recent events for rolling calculations
    const updated = [newEvent, ...events].slice(0, MAX_STORED_EVENTS);
    await stageWrite({ refinzi_events: updated });

    // Maintain the unbounded lifetime tally so "All Time" never undercounts once
    // the rolling window fills. Only successful, newly-recorded events count.
    if (newEvent.success) {
      await adjustLifetimeTotals(newEvent.mode, 1);
    }
    return true;
  } catch (err) {
    console.error('[Refinzi] Failed to record usage event:', err);
    return false;
  }
}

export async function deleteUsageEvent(id: string): Promise<void> {
  try {
    inMemoryRecordedIds.delete(id);
    const events = await getUsageEvents();
    const removed = events.find((e) => e.id === id);
    const updated = events.filter((e) => e.id !== id);
    await stageWrite({ refinzi_events: updated });
    // Keep the lifetime tally consistent when a successful event is removed.
    if (removed && removed.success) {
      await adjustLifetimeTotals(removed.mode, -1);
    }
  } catch (err) {
    console.error('[Refinzi] Failed to delete usage event:', err);
  }
}

export async function clearUsageEvents(): Promise<void> {
  try {
    inMemoryRecordedIds.clear();
    await stageWrite({
      refinzi_events: [],
      [LIFETIME_TOTALS_KEY]: { total: 0, better: 0, expert: 0 },
    });
  } catch (err) {
    console.error('[Refinzi] Failed to clear usage events:', err);
  }
}

// -----------------------------------------------------------------------------
// METRICS AGGREGATION & DERIVATION
// -----------------------------------------------------------------------------

/**
 * Filter events by selected time period.
 * Strict time boundaries:
 * - Today: Since 00:00:00 local today
 * - Week: Last 7 days (7 * 24h)
 * - Month: Last 30 days (30 * 24h)
 * - All Time: All records
 */
export function filterEventsByPeriod(
  events: RefinziUsageEvent[],
  period: PeriodType,
  now: number = Date.now()
): RefinziUsageEvent[] {
  if (period === 'All Time') {
    return events;
  }

  const nowDate = new Date(now);

  if (period === 'Today') {
    const startOfToday = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()).getTime();
    return events.filter((e) => e.timestamp >= startOfToday && e.timestamp <= now);
  }

  if (period === 'Week') {
    const startOfWeek = now - 7 * 24 * 60 * 60 * 1000;
    return events.filter((e) => e.timestamp >= startOfWeek && e.timestamp <= now);
  }

  if (period === 'Month') {
    const startOfMonth = now - 30 * 24 * 60 * 60 * 1000;
    return events.filter((e) => e.timestamp >= startOfMonth && e.timestamp <= now);
  }

  return events;
}

/**
 * Transparent Time-Saved Calculation:
 * estimated_time_saved = successful_prompts_enhanced * configurable_estimated_minutes_per_prompt
 */
export function calculateTimeSaved(
  successfulCount: number,
  config: MetricsConfig = DEFAULT_METRICS_CONFIG
): { minutes: number; formatted: string } {
  const totalMinutes = successfulCount * (config.estimatedMinutesPerPrompt ?? 2.5);

  if (successfulCount === 0 || totalMinutes <= 0) {
    return { minutes: 0, formatted: '~0m' };
  }

  if (totalMinutes < 60) {
    return {
      minutes: totalMinutes,
      formatted: `~${Math.round(totalMinutes)}m`,
    };
  }

  const hours = Math.floor(totalMinutes / 60);
  const remainingMins = Math.round(totalMinutes % 60);

  const formatted = remainingMins > 0 ? `~${hours}h ${remainingMins}m` : `~${hours}h`;

  return { minutes: totalMinutes, formatted };
}

/**
 * Cost-Saved Calculation Hierarchy (Section 6):
 * A. Actual token usage and pricing if available
 * B. Avoided-iteration model using provider/model pricing table
 * C. If neither is available, show "—" (Cost estimate unavailable)
 * 
 * Never fabricates financial claims.
 */
export function calculateCostSaved(
  events: RefinziUsageEvent[],
  config: MetricsConfig = DEFAULT_METRICS_CONFIG
): { costUsd: number | null; formatted: string; hasData: boolean } {
  const successfulEvents = events.filter((e) => e.success);
  if (successfulEvents.length === 0) {
    return { costUsd: null, formatted: '—', hasData: false };
  }

  const avoidedIterations = config.estimatedAvoidedIterations ?? 1.5;
  let totalEstimatedSavings = 0;
  let evaluatedEventCount = 0;

  for (const evt of successfulEvents) {
    // Provenance A: Explicit cost provided
    if (typeof evt.costUsd === 'number' && evt.costUsd > 0) {
      totalEstimatedSavings += evt.costUsd * avoidedIterations;
      evaluatedEventCount++;
      continue;
    }

    // Provenance A: Actual token usage provided + pricing exists
    if (evt.tokenUsage && evt.model) {
      const pricing = config.customPricing?.[evt.model] || MODEL_PRICING[evt.model];
      if (pricing) {
        const directCost =
          (evt.tokenUsage.promptTokens / 1000) * pricing.inputPer1k +
          (evt.tokenUsage.completionTokens / 1000) * pricing.outputPer1k;
        totalEstimatedSavings += directCost * avoidedIterations;
        evaluatedEventCount++;
        continue;
      }
    }

    // If provider is local engine without token cost / model pricing -> Provenance C (not fabricated)
    if (evt.provider === 'local') {
      continue;
    }

    // Provenance B: Model pricing lookup via configured model or known BYOK provider
    const modelKey = evt.model;
    const pricing = modelKey ? (config.customPricing?.[modelKey] || MODEL_PRICING[modelKey]) : undefined;

    if (pricing) {
      const iterationCost = pricing.averageTurnCost ?? ((pricing.inputPer1k * 0.5) + (pricing.outputPer1k * 0.8));
      totalEstimatedSavings += iterationCost * avoidedIterations;
      evaluatedEventCount++;
      continue;
    }

    // Fallback: If the event was served by any cloud provider (BYOK or the
    // default Refinzi Cloud engines) but the specific model is unlisted, use the
    // configurable flat per-iteration estimate. 'local' is intentionally excluded
    // above (Provenance C) because the offline engine has no API cost to save.
    if (evt.provider && ['openai', 'claude', 'gemini', 'deepseek', 'openrouter', 'bai', 'groq', 'gateway'].includes(evt.provider)) {
      totalEstimatedSavings += (config.fallbackCostPerIteration ?? 0.008) * avoidedIterations;
      evaluatedEventCount++;
      continue;
    }
  }

  // Provenance C: Insufficient data -> Show unavailable, do not invent
  if (evaluatedEventCount === 0 || totalEstimatedSavings <= 0) {
    return {
      costUsd: null,
      formatted: '—',
      hasData: false,
    };
  }

  const formatted = totalEstimatedSavings >= 0.01 
    ? `~$${totalEstimatedSavings.toFixed(2)}`
    : `~$0.01`;

  return {
    costUsd: totalEstimatedSavings,
    formatted,
    hasData: true,
  };
}

/**
 * Computes complete 4-metric summary for the requested period.
 */
export function computeMetricsSummary(
  allEvents: RefinziUsageEvent[],
  period: PeriodType,
  config: MetricsConfig = DEFAULT_METRICS_CONFIG,
  now: number = Date.now(),
  lifetimeTotals?: LifetimeTotals
): RefinziMetricsSummary {
  // All period counts for quick overview
  const todayEvents = filterEventsByPeriod(allEvents, 'Today', now).filter((e) => e.success);
  const weekEvents = filterEventsByPeriod(allEvents, 'Week', now).filter((e) => e.success);
  const monthEvents = filterEventsByPeriod(allEvents, 'Month', now).filter((e) => e.success);
  const allTimeEvents = allEvents.filter((e) => e.success);

  // 1. Filter events by selected period
  const periodEvents = filterEventsByPeriod(allEvents, period, now);
  const successfulEvents = periodEvents.filter((e) => e.success);
  let totalPromptsEnhanced = successfulEvents.length;

  // 2. Better / Expert counts
  let betterCount = successfulEvents.filter((e) => e.mode === 'better').length;
  let expertCount = successfulEvents.filter((e) => e.mode === 'expert').length;

  // Lifetime override: once the rolling event window (MAX_STORED_EVENTS) fills,
  // the stored array undercounts true lifetime usage. When authoritative lifetime
  // tallies are supplied and exceed what the window can show, use them for the
  // "All Time" view so the headline and split never regress for heavy users.
  let allTimeCount = allTimeEvents.length;
  if (lifetimeTotals && lifetimeTotals.total > allTimeCount) {
    allTimeCount = lifetimeTotals.total;
    if (period === 'All Time') {
      totalPromptsEnhanced = lifetimeTotals.total;
      betterCount = lifetimeTotals.better;
      expertCount = lifetimeTotals.expert;
    }
  }

  const total = betterCount + expertCount;
  const betterPercentage = total > 0 ? Math.round((betterCount / total) * 100) : 0;
  const expertPercentage = total > 0 ? 100 - betterPercentage : 0;

  // 3. Prompts Subtitle
  let promptsPeriodSubtitle = '';
  if (period === 'Today') {
    promptsPeriodSubtitle = `${totalPromptsEnhanced} today`;
  } else if (period === 'Week') {
    promptsPeriodSubtitle = `+${totalPromptsEnhanced} this week`;
  } else if (period === 'Month') {
    promptsPeriodSubtitle = `+${totalPromptsEnhanced} this month`;
  } else {
    promptsPeriodSubtitle = `${totalPromptsEnhanced} lifetime total`;
  }

  // 4. Time Saved
  const timeSaved = calculateTimeSaved(totalPromptsEnhanced, config);
  const estimatedTimeSavedTooltip = 'Estimated from the average time assumed for manually refining a prompt.';

  // 5. Cost Saved
  const costSaved = calculateCostSaved(periodEvents, config);
  const estimatedCostSavedSubtitle = costSaved.hasData ? 'estimated' : 'Cost estimate unavailable';
  const estimatedCostSavedTooltip =
    'Estimated from AI usage/iteration costs available to Refinzi. Actual savings may vary.';

  return {
    period,
    totalPromptsEnhanced,
    promptsPeriodSubtitle,
    estimatedTimeSavedFormatted: timeSaved.formatted,
    estimatedTimeSavedTooltip,
    estimatedCostSavedFormatted: costSaved.formatted,
    estimatedCostSavedSubtitle,
    estimatedCostSavedTooltip,
    betterCount,
    expertCount,
    betterPercentage,
    expertPercentage,
    hasCostData: costSaved.hasData,
    todayCount: todayEvents.length,
    weekCount: weekEvents.length,
    monthCount: monthEvents.length,
    allTimeCount,
  };
}
