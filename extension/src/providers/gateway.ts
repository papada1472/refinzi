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
          apiKey: this.apiKey,
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
    }

    return synthesizeBetterPrompt(rawInput, intent.targetAi);
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
    }

    return synthesizeExpertPrompt(rawInput, intent.targetAi);
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
