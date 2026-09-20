/**
 * REFINZI — b.ai Direct Provider (Qwen 3.8 Flash / OpenAI-compatible API)
 * Base URL: https://api.b.ai/v1/
 */

import { AIProvider, ProviderRequestOptions } from './types';
import { BetterPromptResponse, ExpertFinalResponse, SemanticIntent, ProviderFailureInfo } from '../types';
import { BETTER_SYSTEM_PROMPT, synthesizeBetterPrompt } from '../engine/better';
import { EXPERT_SYSTEM_PROMPT, synthesizeExpertPrompt } from '../engine/expert';
import { extractAndParseJSON, validateBetterResponse, validateExpertFinalResponse } from '../engine/validator';
import { DEFAULT_BAI_API_KEY, DEFAULT_BAI_ENDPOINT } from '../utils/storage';

export class BAIProvider implements AIProvider {
  id = 'bai';
  name = 'b.ai';
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(
    apiKey?: string,
    model: string = 'qwen3.8-flash',
    baseUrl: string = DEFAULT_BAI_ENDPOINT
  ) {
    this.apiKey = apiKey !== undefined ? apiKey : DEFAULT_BAI_API_KEY;
    this.model = model || 'qwen3.8-flash';
    this.baseUrl = baseUrl || DEFAULT_BAI_ENDPOINT;
  }

  private classifyBaiError(err: any): ProviderFailureInfo {
    const msg = err?.message || String(err);
    if (msg.includes('401') || msg.includes('Unauthorized') || msg.includes('invalid_api_key')) {
      return { provider: 'bai', reason: 'Invalid b.ai API key. Check your key in Settings.', status: 401, code: 'INVALID_KEY' };
    }
    if (msg.includes('429') || msg.includes('rate_limit_exceeded') || msg.includes('quota')) {
      return { provider: 'bai', reason: 'b.ai rate limit exceeded. Please wait a moment.', status: 429, code: 'RATE_LIMITED' };
    }
    if (msg.includes('timeout') || msg.includes('AbortError')) {
      return { provider: 'bai', reason: 'b.ai request timed out', status: 408, code: 'TIME_BUDGET_EXHAUSTED' };
    }
    if (msg.includes('500') || msg.includes('502') || msg.includes('503')) {
      return { provider: 'bai', reason: 'b.ai service temporarily unavailable', status: 503, code: 'SERVER_ERROR' };
    }
    return { provider: 'bai', reason: 'b.ai connection error: ' + msg.slice(0, 80), status: 0, code: 'NETWORK_ERROR' };
  }

  private async callBai(systemPrompt: string, userMessage: string, options?: ProviderRequestOptions): Promise<string> {
    const timeoutMs = options?.timeoutMs || 25000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const endpoint = `${this.baseUrl.replace(/\/+$/, '')}/chat/completions`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          enable_thinking: false,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.4,
        }),
        signal: options?.signal || controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`b.ai HTTP ${response.status}: ${errText.slice(0, 150)}`);
      }

      const data = await response.json();
      const choice = data.choices?.[0];
      const content = choice?.message?.content || choice?.message?.reasoning_content || '';
      return content;
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
          provider: 'bai',
          reason: 'No b.ai API key configured',
          code: 'NO_KEY',
        },
      };
    }

    try {
      const userPayload = JSON.stringify({
        rawPrompt: rawInput,
        targetAi: intent.targetAi,
        domain: intent.domain,
      });

      const rawResponse = await this.callBai(BETTER_SYSTEM_PROMPT, userPayload, options);
      const parsed = extractAndParseJSON(rawResponse);
      const validated = validateBetterResponse(parsed);
      if (validated) return validated;
    } catch (err: any) {
      console.warn('[Refinzi] b.ai Better call failed, using local calibration:', err);
      const fallback = synthesizeBetterPrompt(rawInput, intent.targetAi);
      return {
        ...fallback,
        isFallback: true,
        providerFailure: this.classifyBaiError(err),
      };
    }

    const fallback = synthesizeBetterPrompt(rawInput, intent.targetAi);
    return {
      ...fallback,
      isFallback: true,
      providerFailure: {
        provider: 'bai',
        reason: 'b.ai returned an invalid response structure',
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
          provider: 'bai',
          reason: 'No b.ai API key configured',
          code: 'NO_KEY',
        },
      };
    }

    try {
      const userPayload = JSON.stringify({
        rawPrompt: rawInput,
        targetAi: intent.targetAi,
        domain: intent.domain,
        assumptions: intent.assumptions,
        constraints: intent.constraints,
      });

      const rawResponse = await this.callBai(EXPERT_SYSTEM_PROMPT, userPayload, options);
      const parsed = extractAndParseJSON(rawResponse);
      const validated = validateExpertFinalResponse(parsed);
      if (validated) return validated;
    } catch (err: any) {
      console.warn('[Refinzi] b.ai Expert call failed, using local briefing:', err);
      const fallback = synthesizeExpertPrompt(rawInput, intent.targetAi);
      return {
        ...fallback,
        isFallback: true,
        providerFailure: this.classifyBaiError(err),
      };
    }

    const fallback = synthesizeExpertPrompt(rawInput, intent.targetAi);
    return {
      ...fallback,
      isFallback: true,
      providerFailure: {
        provider: 'bai',
        reason: 'b.ai returned an invalid response structure',
        code: 'SERVER_ERROR',
      },
    };
  }

  async testConnection(options?: ProviderRequestOptions): Promise<{ ok: boolean; message: string }> {
    if (!this.apiKey) {
      return { ok: false, message: 'No b.ai API key provided.' };
    }

    try {
      const endpoint = `${this.baseUrl.replace(/\/+$/, '')}/models`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), options?.timeoutMs || 8000);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        signal: options?.signal || controller.signal,
      });

      clearTimeout(timer);

      if (response.ok) {
        return { ok: true, message: `b.ai connected successfully (Model: ${this.model}).` };
      }

      if (response.status === 401) {
        return { ok: false, message: 'Invalid b.ai API key (HTTP 401).' };
      }

      return { ok: false, message: `b.ai connection returned HTTP ${response.status}.` };
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return { ok: false, message: 'b.ai connection test timed out.' };
      }
      return { ok: false, message: `b.ai error: ${err?.message || String(err)}` };
    }
  }
}
