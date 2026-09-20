/**
 * REFINZI — Refinzi Gateway Provider
 */

import { AIProvider, ProviderRequestOptions } from './types';
import { BetterPromptResponse, ExpertFinalResponse, SemanticIntent } from '../types';
import { BETTER_SYSTEM_PROMPT, synthesizeBetterPrompt } from '../engine/better';
import { EXPERT_SYSTEM_PROMPT, synthesizeExpertPrompt } from '../engine/expert';
import { extractAndParseJSON, validateBetterResponse, validateExpertFinalResponse } from '../engine/validator';

export class GatewayProvider implements AIProvider {
  id = 'gateway';
  name = 'Refinzi Gateway';

  constructor(
    private gatewayUrl: string = 'https://refinzi.com/api/v1/refine',
    private apiKey?: string,
    private model: string = 'gateway-default'
  ) {}

  private async callGateway(systemPrompt: string, text: string, options?: ProviderRequestOptions): Promise<string> {
    const timeoutMs = options?.timeoutMs || 15000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(this.gatewayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'x-api-key': this.apiKey, 'Authorization': `Bearer ${this.apiKey}` } : {}),
        },
        body: JSON.stringify({
          text,
          systemPrompt,
          model: this.model,
        }),
        signal: options?.signal || controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Gateway HTTP ${response.status}: ${errText.slice(0, 150)}`);
      }

      const data = await response.json();
      return data.refinedText || '';
    } catch (err: any) {
      clearTimeout(timer);
      throw err;
    }
  }

  private classifyGatewayError(err: any): { reason: string; status: number; code: 'INVALID_KEY' | 'QUOTA_EXCEEDED' | 'SERVER_ERROR' | 'TIME_BUDGET_EXHAUSTED' | 'NETWORK_ERROR' } {
  const msg = err?.message || String(err);
  if (msg.includes('401') || msg.includes('Unauthorized')) {
    return { reason: 'Gateway access unauthorized. Add a BYOK API key in Settings.', status: 401, code: 'INVALID_KEY' };
  }
  if (msg.includes('429') || msg.includes('DAILY_FREE_QUOTA_EXCEEDED')) {
    return { reason: 'Daily free limit reached (25/25 prompts). Configure a BYOK key in Settings for unlimited calibration.', status: 429, code: 'QUOTA_EXCEEDED' };
  }
  if (msg.includes('403') || msg.includes('UPSTREAM_QUOTA_EXHAUSTED') || msg.includes('AllocationQuota')) {
    return { reason: 'Community free tier capacity temporarily full. Add your BYOK key in Settings for unlimited speed.', status: 403, code: 'QUOTA_EXCEEDED' };
  }
  if (msg.includes('timeout') || msg.includes('AbortError')) {
    return { reason: 'Gateway request timed out', status: 408, code: 'TIME_BUDGET_EXHAUSTED' };
  }
  if (msg.includes('500') || msg.includes('502') || msg.includes('503')) {
    return { reason: 'Gateway server temporarily unavailable', status: 503, code: 'SERVER_ERROR' };
  }
  return { reason: 'Gateway connection error. Configure a BYOK key in Settings.', status: 0, code: 'NETWORK_ERROR' };
}

  async generateBetter(
    rawInput: string,
    intent: SemanticIntent,
    options?: ProviderRequestOptions
  ): Promise<BetterPromptResponse> {
    try {
      const text = await this.callGateway(
        BETTER_SYSTEM_PROMPT,
        `Input: "${rawInput}"\nDomain: ${intent.domain}\nTarget AI: ${intent.targetAi}`,
        options
      );
      const parsed = extractAndParseJSON(text);
      const validated = validateBetterResponse(parsed);
      if (validated) return validated;
    } catch (err) {
      console.warn('[Refinzi] Gateway Better call failed, using local calibration:', err);
      const failure = this.classifyGatewayError(err);
      const fallback = synthesizeBetterPrompt(rawInput, intent.targetAi);
      return {
        ...fallback,
        isFallback: true,
        providerFailure: {
          provider: 'gateway',
          reason: failure.reason,
          status: failure.status,
          code: failure.code,
          isDefaultFallback: !this.apiKey,
        },
      };
    }

    const fallback = synthesizeBetterPrompt(rawInput, intent.targetAi);
    return {
      ...fallback,
      isFallback: true,
      providerFailure: {
        provider: 'gateway',
        reason: 'Gateway returned an invalid response',
        status: 0,
        code: 'SERVER_ERROR',
        isDefaultFallback: !this.apiKey,
      },
    };
  }

  async generateExpert(
    rawInput: string,
    intent: SemanticIntent,
    options?: ProviderRequestOptions
  ): Promise<ExpertFinalResponse> {
    try {
      const text = await this.callGateway(
        EXPERT_SYSTEM_PROMPT,
        `User Raw Input: "${rawInput}"\nDomain: ${intent.domain}\nTarget AI: ${intent.targetAi}`,
        options
      );
      const parsed = extractAndParseJSON(text);
      const validated = validateExpertFinalResponse(parsed);
      if (validated) return validated;
    } catch (err) {
      console.warn('[Refinzi] Gateway Expert call failed, using local briefing:', err);
      const failure = this.classifyGatewayError(err);
      const fallback = synthesizeExpertPrompt(rawInput, intent.targetAi);
      return {
        ...fallback,
        isFallback: true,
        providerFailure: {
          provider: 'gateway',
          reason: failure.reason,
          status: failure.status,
          code: failure.code,
          isDefaultFallback: !this.apiKey,
        },
      };
    }

    const fallback = synthesizeExpertPrompt(rawInput, intent.targetAi);
    return {
      ...fallback,
      isFallback: true,
      providerFailure: {
        provider: 'gateway',
        reason: 'Gateway returned an invalid response',
        status: 0,
        code: 'SERVER_ERROR',
        isDefaultFallback: !this.apiKey,
      },
    };
  }

  async testConnection(options?: ProviderRequestOptions): Promise<{ ok: boolean; message: string }> {
    try {
      const res = await fetch(this.gatewayUrl, {
        method: 'OPTIONS',
        signal: options?.signal || AbortSignal.timeout(6000),
      });
      if (res.ok || res.status === 405) {
        return { ok: true, message: 'Refinzi Gateway reachable' };
      }
      return { ok: false, message: `Gateway status: ${res.status}` };
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Gateway unreachable' };
    }
  }
}
