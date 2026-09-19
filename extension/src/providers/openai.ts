/**
 * REFINZI — OpenAI & OpenAI-Compatible Provider
 */

import { AIProvider, ProviderRequestOptions } from './types';
import { BetterPromptResponse, ExpertFinalResponse, SemanticIntent } from '../types';
import { BETTER_SYSTEM_PROMPT, synthesizeBetterPrompt } from '../engine/better';
import { EXPERT_SYSTEM_PROMPT, synthesizeExpertPrompt } from '../engine/expert';
import { extractAndParseJSON, validateBetterResponse, validateExpertFinalResponse } from '../engine/validator';

export class OpenAIProvider implements AIProvider {
  id = 'openai';
  name = 'OpenAI';

  constructor(
    private apiKey: string,
    private model: string = 'gpt-4o-mini',
    private baseURL: string = 'https://api.openai.com/v1'
  ) {}

  private async callChat(systemPrompt: string, userMessage: string, options?: ProviderRequestOptions): Promise<string> {
    const timeoutMs = options?.timeoutMs || 15000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
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
        throw new Error(`OpenAI HTTP ${response.status}: ${errText.slice(0, 150)}`);
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
      return synthesizeBetterPrompt(rawInput, intent.targetAi);
    }

    try {
      const content = await this.callChat(
        BETTER_SYSTEM_PROMPT,
        `User Input: "${rawInput}"\nDetected Domain: ${intent.domain}\nTarget AI: ${intent.targetAi}`,
        options
      );
      const parsed = extractAndParseJSON(content);
      const validated = validateBetterResponse(parsed);
      if (validated) return validated;
    } catch (err) {
      console.warn('[Refinzi] OpenAI Better call failed, using local calibration:', err);
    }

    return synthesizeBetterPrompt(rawInput, intent.targetAi);
  }

  async generateExpert(
    rawInput: string,
    intent: SemanticIntent,
    options?: ProviderRequestOptions
  ): Promise<ExpertFinalResponse> {
    if (!this.apiKey) {
      return synthesizeExpertPrompt(rawInput, intent.targetAi);
    }

    try {
      const content = await this.callChat(
        EXPERT_SYSTEM_PROMPT,
        `User Raw Input: "${rawInput}"\nDomain: ${intent.domain}\nTarget AI: ${intent.targetAi}`,
        options
      );
      const parsed = extractAndParseJSON(content);
      const validated = validateExpertFinalResponse(parsed);
      if (validated) return validated;
    } catch (err) {
      console.warn('[Refinzi] OpenAI Expert call failed, using local briefing:', err);
    }

    return synthesizeExpertPrompt(rawInput, intent.targetAi);
  }

  async testConnection(options?: ProviderRequestOptions): Promise<{ ok: boolean; message: string }> {
    try {
      const res = await fetch(`${this.baseURL}/models`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${this.apiKey}` },
        signal: options?.signal || AbortSignal.timeout(6000),
      });
      if (res.ok) {
        return { ok: true, message: 'OpenAI API key verified successfully!' };
      }
      return { ok: false, message: `OpenAI returned status ${res.status}` };
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Connection failed' };
    }
  }
}
