/**
 * REFINZI — Google Gemini Direct Provider
 */

import { AIProvider, ProviderRequestOptions } from './types';
import { BetterPromptResponse, ExpertFinalResponse, SemanticIntent } from '../types';
import { BETTER_SYSTEM_PROMPT, synthesizeBetterPrompt } from '../engine/better';
import { EXPERT_SYSTEM_PROMPT, synthesizeExpertPrompt } from '../engine/expert';
import { extractAndParseJSON, validateBetterResponse, validateExpertFinalResponse } from '../engine/validator';

export class GeminiProvider implements AIProvider {
  id = 'gemini';
  name = 'Google Gemini';

  constructor(
    private apiKey: string,
    private model: string = 'gemini-2.5-flash'
  ) {}

  private async callGemini(systemPrompt: string, userMessage: string, options?: ProviderRequestOptions): Promise<string> {
    const timeoutMs = options?.timeoutMs || 15000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userMessage }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.6,
          },
        }),
        signal: options?.signal || controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Gemini HTTP ${response.status}: ${errText.slice(0, 150)}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
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
    if (!this.apiKey) return synthesizeBetterPrompt(rawInput, intent.targetAi);

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
    }

    return synthesizeBetterPrompt(rawInput, intent.targetAi);
  }

  async generateExpert(
    rawInput: string,
    intent: SemanticIntent,
    options?: ProviderRequestOptions
  ): Promise<ExpertFinalResponse> {
    if (!this.apiKey) return synthesizeExpertPrompt(rawInput, intent.targetAi);

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
    }

    return synthesizeExpertPrompt(rawInput, intent.targetAi);
  }

  async testConnection(options?: ProviderRequestOptions): Promise<{ ok: boolean; message: string }> {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`, {
        method: 'GET',
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
