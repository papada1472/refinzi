/**
 * REFINZI — Groq Direct Provider (Ultra-Fast LPU Inference)
 */

import { AIProvider, ProviderRequestOptions } from './types';
import { BetterPromptResponse, ExpertFinalResponse, SemanticIntent, ProviderFailureInfo } from '../types';
import { BETTER_SYSTEM_PROMPT, synthesizeBetterPrompt } from '../engine/better';
import { EXPERT_SYSTEM_PROMPT, synthesizeExpertPrompt } from '../engine/expert';
import { extractAndParseJSON, validateBetterResponse, validateExpertFinalResponse } from '../engine/validator';
import { DEFAULT_GROQ_API_KEY } from '../utils/storage';

export class GroqProvider implements AIProvider {
  id = 'groq';
  name = 'Groq';
  private apiKey: string;
  private model: string;

  constructor(
    apiKey: string = DEFAULT_GROQ_API_KEY,
    model: string = 'openai/gpt-oss-120b'
  ) {
    this.apiKey = apiKey || DEFAULT_GROQ_API_KEY;
    this.model = model;
  }

  private classifyGroqError(err: any): ProviderFailureInfo {
    const msg = err?.message || String(err);
    if (msg.includes('401') || msg.includes('Unauthorized') || msg.includes('invalid_api_key')) {
      return { provider: 'groq', reason: 'Invalid Groq API key. Check your key in Settings.', status: 401, code: 'INVALID_KEY' };
    }
    if (msg.includes('429') || msg.includes('rate_limit_exceeded')) {
      return { provider: 'groq', reason: 'Groq rate limit exceeded. Please wait a moment.', status: 429, code: 'RATE_LIMITED' };
    }
    if (msg.includes('timeout') || msg.includes('AbortError')) {
      return { provider: 'groq', reason: 'Groq request timed out', status: 408, code: 'TIME_BUDGET_EXHAUSTED' };
    }
    if (msg.includes('500') || msg.includes('502') || msg.includes('503')) {
      return { provider: 'groq', reason: 'Groq service temporarily unavailable', status: 503, code: 'SERVER_ERROR' };
    }
    return { provider: 'groq', reason: 'Groq connection error: ' + msg.slice(0, 80), status: 0, code: 'NETWORK_ERROR' };
  }

  private async callGroq(systemPrompt: string, userMessage: string, options?: ProviderRequestOptions): Promise<string> {
    const timeoutMs = options?.timeoutMs || 15000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.6,
        }),
        signal: options?.signal || controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Groq HTTP ${response.status}: ${errText.slice(0, 150)}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (err: any) {
      clearTimeout(timer);
      throw err;
    }
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
          provider: 'groq',
          reason: 'No Groq API key configured',
          code: 'NO_KEY',
        },
      };
    }

    try {
      const text = await this.callGroq(
        BETTER_SYSTEM_PROMPT,
        `Input: "${rawInput}"\nDomain: ${intent.domain}\nTarget AI: ${intent.targetAi}`,
        options
      );
      const parsed = extractAndParseJSON(text);
      const validated = validateBetterResponse(parsed);
      if (validated) return validated;
    } catch (err: any) {
      console.warn('[Refinzi] Groq Better call failed, using local calibration:', err);
      const failure = this.classifyGroqError(err);
      const fallback = synthesizeBetterPrompt(rawInput, intent.targetAi);
      return {
        ...fallback,
        isFallback: true,
        providerFailure: failure,
      };
    }

    const fallback = synthesizeBetterPrompt(rawInput, intent.targetAi);
    return {
      ...fallback,
      isFallback: true,
      providerFailure: {
        provider: 'groq',
        reason: 'Groq returned an invalid response structure',
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
          provider: 'groq',
          reason: 'No Groq API key configured',
          code: 'NO_KEY',
        },
      };
    }

    try {
      const text = await this.callGroq(
        EXPERT_SYSTEM_PROMPT,
        `User Raw Input: "${rawInput}"\nDomain: ${intent.domain}\nTarget AI: ${intent.targetAi}`,
        options
      );
      const parsed = extractAndParseJSON(text);
      const validated = validateExpertFinalResponse(parsed);
      if (validated) return validated;
    } catch (err: any) {
      console.warn('[Refinzi] Groq Expert call failed, using local briefing:', err);
      const failure = this.classifyGroqError(err);
      const fallback = synthesizeExpertPrompt(rawInput, intent.targetAi);
      return {
        ...fallback,
        isFallback: true,
        providerFailure: failure,
      };
    }

    const fallback = synthesizeExpertPrompt(rawInput, intent.targetAi);
    return {
      ...fallback,
      isFallback: true,
      providerFailure: {
        provider: 'groq',
        reason: 'Groq returned an invalid response structure',
        code: 'SERVER_ERROR',
      },
    };
  }

  async testConnection(options?: ProviderRequestOptions): Promise<{ ok: boolean; message: string }> {
    if (!this.apiKey) {
      return { ok: false, message: 'Missing Groq API key. Paste your key from console.groq.com' };
    }

    try {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        signal: options?.signal || AbortSignal.timeout(7000),
      });

      if (res.ok) {
        return { ok: true, message: 'Groq connected successfully (Ultra-fast LPU inference ready)' };
      }

      if (res.status === 401) {
        return { ok: false, message: 'Invalid Groq API key (HTTP 401)' };
      }

      return { ok: false, message: `Groq error (HTTP ${res.status})` };
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Connection failed' };
    }
  }
}
