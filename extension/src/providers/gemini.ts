/**
 * REFINZI — Google Gemini Direct Provider
 */

import { AIProvider, ProviderRequestOptions } from './types';
import { BetterPromptResponse, ExpertFinalResponse, SemanticIntent } from '../types';
import { BETTER_SYSTEM_PROMPT, synthesizeBetterPrompt } from '../engine/better';
import { EXPERT_SYSTEM_PROMPT, synthesizeExpertPrompt } from '../engine/expert';
import { extractAndParseJSON, validateBetterResponse, validateExpertFinalResponse } from '../engine/validator';
import { DEFAULT_GEMINI_API_KEY } from '../utils/storage';

/**
 * Models tried, in order, when the configured model cannot serve the request.
 *
 * Google's `-latest` aliases and individual Flash releases hit *independent*
 * capacity spikes (HTTP 503) and per-model quota limits (HTTP 429). With a
 * single hard-coded model, any such spike made click/hold silently degrade to
 * the offline template engine while the user believed AI was running.
 */
export const GEMINI_FALLBACK_MODELS = [
  'gemini-flash-latest',
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
];

/** Per-attempt ceiling. Observed serving latency is ~1–5s; 9s means "queued". */
const ATTEMPT_TIMEOUT_MS = 9000;
/** Total wall-clock budget across every model. Kept short so the UI never hangs. */
const TOTAL_BUDGET_MS = 18000;

/**
 * Exactly one attempt per model, then move on.
 *
 * Deliberately NOT retrying the same model: the two failure modes we actually
 * observe behave oppositely under retry.
 *   - HTTP 503 (capacity): a different model has a *different* capacity pool, so
 *     switching beats re-queuing behind the same overloaded one.
 *   - HTTP 429 (quota): retrying burns more of the same quota bucket and makes
 *     throttling worse. Switching models is the only useful move.
 * One attempt each also caps a single generation at 5 requests, keeping the
 * free tier well inside its rate limits.
 */
const ATTEMPTS_PER_MODEL = 1;

/**
 * Remembers the last model that actually served a request.
 *
 * Without this, every click/hold re-walks the chain from the top and pays the
 * full latency of each unavailable model before reaching a healthy one
 * (measured: 8–17s when the primary was down). Hoisting the known-good model to
 * the front makes the second and later actions fast again.
 *
 * Module-level so it survives across provider instances within a service worker,
 * and time-boxed so the configured model is periodically retried in case the
 * outage has cleared.
 */
const LAST_GOOD_TTL_MS = 5 * 60 * 1000;
let lastGoodModel: string | null = null;
let lastGoodAt = 0;

/** Test seam: clears the adaptive model memory. */
export function resetGeminiModelMemory(): void {
  lastGoodModel = null;
  lastGoodAt = 0;
}

/** Statuses worth retrying / worth trying another model for. */
function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

/** Key-wide failures: retrying or switching models cannot help. */
function isFatalStatus(status: number): boolean {
  return status === 400 || status === 401 || status === 403;
}

/** Error carrying the HTTP status so the retry loop can classify it. */
class GeminiHttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'GeminiHttpError';
  }
}

export class GeminiProvider implements AIProvider {
  id = 'gemini';
  name = 'Google Gemini';
  private apiKey: string;
  private model: string;

  constructor(
    apiKey?: string,
    model: string = 'gemini-flash-latest'
  ) {
    this.apiKey = (apiKey && apiKey.trim()) || DEFAULT_GEMINI_API_KEY;
    this.model = (model && model.trim()) || 'gemini-flash-latest';
  }

  /**
   * Configured model first, then the known-good model (if one is remembered and
   * still fresh), then the static fallbacks — de-duplicated.
   */
  private buildModelChain(): string[] {
    const base = [this.model, ...GEMINI_FALLBACK_MODELS].filter(Boolean);
    const remembered = lastGoodModel;
    const memoryIsFresh =
      !!remembered && remembered !== this.model && Date.now() - lastGoodAt < LAST_GOOD_TTL_MS;
    return Array.from(new Set(memoryIsFresh ? [remembered as string, ...base] : base));
  }

  /** Single request against one model. */
  private async callModel(
    model: string,
    systemPrompt: string,
    userMessage: string,
    timeoutMs: number,
    externalSignal?: AbortSignal
  ): Promise<string> {
    const activeKey = this.apiKey || DEFAULT_GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    // Honour a caller-supplied signal alongside our own timeout.
    const signal = externalSignal
      ? (typeof AbortSignal.any === 'function'
          ? AbortSignal.any([controller.signal, externalSignal])
          : controller.signal)
      : controller.signal;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': activeKey,
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userMessage }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.6,
          },
        }),
        signal,
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new GeminiHttpError(response.status, `Gemini HTTP ${response.status}: ${errText.slice(0, 150)}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Calls Gemini with model fallback.
   *
   * Order of defence:
   *   1. try the configured model
   *   2. walk the fallback chain, so one busy or throttled model cannot disable
   *      the feature (each model has its own capacity pool and quota bucket)
   *   3. only then propagate, letting the caller fall back to local synthesis
   *
   * Bounded by a wall-clock budget so a degraded provider cannot hang the UI.
   */
  private async callGemini(systemPrompt: string, userMessage: string, options?: ProviderRequestOptions): Promise<string> {
    const chain = this.buildModelChain();
    // A caller-supplied timeout is the overall bound; otherwise use our budget.
    const budgetMs = options?.timeoutMs ?? TOTAL_BUDGET_MS;
    const deadline = Date.now() + budgetMs;
    const failures: string[] = [];

    for (const model of chain) {
      for (let attempt = 0; attempt < ATTEMPTS_PER_MODEL; attempt++) {
        const remaining = deadline - Date.now();
        if (remaining < 1200) {
          throw new Error(
            `Gemini time budget (${budgetMs}ms) exhausted. Tried: ${failures.join(' | ')}`
          );
        }

        try {
          const text = await this.callModel(
            model,
            systemPrompt,
            userMessage,
            Math.min(ATTEMPT_TIMEOUT_MS, remaining),
            options?.signal
          );

          if (text && text.trim()) {
            // Remember which model worked so the next action can go straight to it.
            lastGoodModel = model;
            lastGoodAt = Date.now();

            if (model !== this.model) {
              console.warn(
                `[Refinzi] Gemini served by fallback model "${model}" (primary "${this.model}" unavailable).`
              );
            }
            return text;
          }
          failures.push(`${model}: empty response`);
        } catch (err: any) {
          const status = err instanceof GeminiHttpError ? err.status : 0;
          const label = status ? `HTTP ${status}` : err?.name || 'error';
          failures.push(`${model}: ${label}`);

          // Bad key / malformed request — every model will fail the same way.
          if (isFatalStatus(status)) {
            throw new Error(`Gemini request rejected (${label}). ${err?.message ?? ''}`.trim());
          }

          // Unknown/retired model: skip straight to the next one.
          if (status === 404) break;

          if (!isRetryableStatus(status) && status !== 0) break;
        }
      }
    }

    throw new Error(`All Gemini models failed. Tried: ${failures.join(' | ')}`);
  }

  private classifyGeminiError(err: any): { reason: string; status: number; code: 'INVALID_KEY' | 'QUOTA_EXCEEDED' | 'SERVER_ERROR' | 'TIME_BUDGET_EXHAUSTED' | 'NETWORK_ERROR' } {
  const msg = err?.message || String(err);
  if (msg.includes('401') || msg.includes('API_KEY_INVALID') || msg.includes('Unauthorized')) {
    return { reason: 'Gemini API key is invalid (HTTP 401)', status: 401, code: 'INVALID_KEY' };
  }
  if (msg.includes('403') || msg.includes('PERMISSION_DENIED')) {
    return { reason: 'Gemini API permission denied (HTTP 403)', status: 403, code: 'INVALID_KEY' };
  }
  if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota') || msg.includes('throttled')) {
    return { reason: 'Gemini quota or rate limit exceeded (HTTP 429)', status: 429, code: 'QUOTA_EXCEEDED' };
  }
  if (msg.includes('time budget') || msg.includes('timeout') || msg.includes('AbortError')) {
    return { reason: 'Gemini request timed out', status: 408, code: 'TIME_BUDGET_EXHAUSTED' };
  }
  if (msg.includes('500') || msg.includes('502') || msg.includes('503') || msg.includes('504')) {
    return { reason: 'Google Gemini servers temporarily unavailable', status: 503, code: 'SERVER_ERROR' };
  }
  return { reason: msg.slice(0, 120), status: 0, code: 'NETWORK_ERROR' };
}

  async generateBetter(
    rawInput: string,
    intent: SemanticIntent,
    options?: ProviderRequestOptions
  ): Promise<BetterPromptResponse> {
    if (!this.apiKey) {
      const fallback = synthesizeBetterPrompt(rawInput, intent.targetAi);
      return {
        ...fallback,
        isFallback: true,
        providerFailure: {
          provider: 'gemini',
          reason: 'Gemini API key is not configured. Add your free key in Settings.',
          status: 0,
          code: 'NO_KEY',
        },
      };
    }

    try {
      const text = await this.callGemini(
        BETTER_SYSTEM_PROMPT,
        `Input: "${rawInput}"\nDomain: ${intent.domain}\nTarget AI: ${intent.targetAi}`,
        options
      );
      const parsed = extractAndParseJSON(text);
      const validated = validateBetterResponse(parsed);
      if (validated) return validated;
    } catch (err) {
      console.warn('[Refinzi] Gemini Better call failed, using local calibration:', err);
      const failure = this.classifyGeminiError(err);
      const fallback = synthesizeBetterPrompt(rawInput, intent.targetAi);
      return {
        ...fallback,
        isFallback: true,
        providerFailure: {
          provider: 'gemini',
          reason: failure.reason,
          status: failure.status,
          code: failure.code,
        },
      };
    }

    const fallback = synthesizeBetterPrompt(rawInput, intent.targetAi);
    return {
      ...fallback,
      isFallback: true,
      providerFailure: {
        provider: 'gemini',
        reason: 'Gemini returned an invalid response',
        status: 0,
        code: 'SERVER_ERROR',
      },
    };
  }

  async generateExpert(
    rawInput: string,
    intent: SemanticIntent,
    options?: ProviderRequestOptions
  ): Promise<ExpertFinalResponse> {
    if (!this.apiKey) {
      const fallback = synthesizeExpertPrompt(rawInput, intent.targetAi);
      return {
        ...fallback,
        isFallback: true,
        providerFailure: {
          provider: 'gemini',
          reason: 'Gemini API key is not configured. Add your free key in Settings.',
          status: 0,
          code: 'NO_KEY',
        },
      };
    }

    try {
      const text = await this.callGemini(
        EXPERT_SYSTEM_PROMPT,
        `User Raw Input: "${rawInput}"\nDomain: ${intent.domain}\nTarget AI: ${intent.targetAi}`,
        options
      );
      const parsed = extractAndParseJSON(text);
      const validated = validateExpertFinalResponse(parsed);
      if (validated) return validated;
    } catch (err) {
      console.warn('[Refinzi] Gemini Expert call failed, using local briefing:', err);
      const failure = this.classifyGeminiError(err);
      const fallback = synthesizeExpertPrompt(rawInput, intent.targetAi);
      return {
        ...fallback,
        isFallback: true,
        providerFailure: {
          provider: 'gemini',
          reason: failure.reason,
          status: failure.status,
          code: failure.code,
        },
      };
    }

    const fallback = synthesizeExpertPrompt(rawInput, intent.targetAi);
    return {
      ...fallback,
      isFallback: true,
      providerFailure: {
        provider: 'gemini',
        reason: 'Gemini returned an invalid response',
        status: 0,
        code: 'SERVER_ERROR',
      },
    };
  }

  async testConnection(options?: ProviderRequestOptions): Promise<{ ok: boolean; message: string }> {
    try {
      const activeKey = this.apiKey || DEFAULT_GEMINI_API_KEY;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${activeKey}`, {
        method: 'GET',
        headers: {
          'X-goog-api-key': activeKey,
        },
        signal: options?.signal || AbortSignal.timeout(6000),
      });
      if (res.ok) {
        return { ok: true, message: 'Google Gemini API key verified successfully!' };
      }
      return { ok: false, message: `Gemini returned status ${res.status}` };
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Connection failed' };
    }
  }
}
