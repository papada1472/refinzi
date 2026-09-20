/**
 * REFINZI — Provider Manager & Quality Gate
 */

import { AIProvider, ProviderRequestOptions } from './types';
import { OpenAIProvider } from './openai';
import { GeminiProvider } from './gemini';
import { DeepSeekProvider } from './deepseek';
import { OpenRouterProvider } from './openrouter';
import { GatewayProvider } from './gateway';
import { BetterPromptResponse, ExpertFinalResponse, SemanticIntent, AIProviderId } from '../types';
import { getSettings } from '../utils/storage';
import { extractSemanticIntent } from '../engine/intent';
import { synthesizeBetterPrompt } from '../engine/better';
import { synthesizeExpertPrompt } from '../engine/expert';

class LocalSynthesisProvider implements AIProvider {
  id = 'local';
  name = 'Refinzi Instant Calibration';

  async generateBetter(rawInput: string, intent: SemanticIntent): Promise<BetterPromptResponse> {
    return synthesizeBetterPrompt(rawInput, intent.targetAi);
  }

  async generateExpert(rawInput: string, intent: SemanticIntent): Promise<ExpertFinalResponse> {
    return synthesizeExpertPrompt(rawInput, intent.targetAi);
  }

  async testConnection(): Promise<{ ok: boolean; message: string }> {
    return { ok: true, message: 'Local calibration engine is active and ready (0ms latency).' };
  }
}

export class ProviderManager {
  private static localProvider = new LocalSynthesisProvider();

  static async getActiveProvider(): Promise<AIProvider> {
    const settings = await getSettings();
    const providerId = settings.provider || 'gateway';

    // Primary AI Provider: Google Gemini (BYOK only — no bundled key ships anymore)
    const getGeminiProvider = () =>
      new GeminiProvider(settings.apiKeys?.gemini || '', settings.models?.gemini || 'gemini-flash-latest');

    // Default Cloud Gateway Provider (server-side DeepSeek backend)
    const getGatewayProvider = () =>
      new GatewayProvider(settings.gatewayUrl || 'https://refinzi.com/api/v1/refine', settings.apiKeys?.gateway);

    switch (providerId) {
      case 'gemini': {
        return getGeminiProvider();
      }

      case 'openai':
        return new OpenAIProvider(settings.apiKeys?.openai || '', settings.models?.openai);

      case 'deepseek':
        if (settings.apiKeys?.deepseek) {
          return new DeepSeekProvider(settings.apiKeys.deepseek, settings.models?.deepseek);
        }
        return getGatewayProvider();

      case 'openrouter':
        if (settings.apiKeys?.openrouter) {
          return new OpenRouterProvider(settings.apiKeys.openrouter, settings.models?.openrouter);
        }
        return getGatewayProvider();

      case 'gateway':
        return getGatewayProvider();

      case 'local':
        // Explicitly selected local → use deterministic offline engine
        return this.localProvider;

      default:
        // Unknown provider → default to the gateway
        return getGatewayProvider();
    }
  }

  static async generateBetter(
    rawInput: string,
    targetAi: string = 'general',
    options?: ProviderRequestOptions
  ): Promise<BetterPromptResponse> {
    const intent = extractSemanticIntent(rawInput, 'better', targetAi);
    const provider = await this.getActiveProvider();

    let result: BetterPromptResponse;
    try {
      result = await provider.generateBetter(rawInput, intent, options);
    } catch (err: any) {
      const fallback = synthesizeBetterPrompt(rawInput, targetAi);
      result = {
        ...fallback,
        isFallback: true,
        providerFailure: {
          provider: provider.id as AIProviderId,
          reason: err?.message || 'Provider execution failed',
          status: err?.status || 0,
          code: 'SERVER_ERROR',
        },
      };
    }

    // Quality gate
    if (!result || !result.prompt || result.prompt.trim().length < 8) {
      const fallback = synthesizeBetterPrompt(rawInput, targetAi);
      result = {
        ...fallback,
        isFallback: true,
        providerFailure: result?.providerFailure || {
          provider: provider.id as AIProviderId,
          reason: 'Provider produced an incomplete response',
          status: 0,
          code: 'SERVER_ERROR',
        },
      };
    }

    return result;
  }

  static async generateExpert(
    rawInput: string,
    targetAi: string = 'general',
    options?: ProviderRequestOptions
  ): Promise<ExpertFinalResponse> {
    const intent = extractSemanticIntent(rawInput, 'expert', targetAi);
    const provider = await this.getActiveProvider();

    let result: ExpertFinalResponse;
    try {
      result = await provider.generateExpert(rawInput, intent, options);
    } catch (err: any) {
      const fallback = synthesizeExpertPrompt(rawInput, targetAi);
      result = {
        ...fallback,
        isFallback: true,
        providerFailure: {
          provider: provider.id as AIProviderId,
          reason: err?.message || 'Provider execution failed',
          status: err?.status || 0,
          code: 'SERVER_ERROR',
        },
      };
    }

    // Quality gate
    if (!result || !result.prompt || result.prompt.trim().length < 15) {
      const fallback = synthesizeExpertPrompt(rawInput, targetAi);
      result = {
        ...fallback,
        isFallback: true,
        providerFailure: result?.providerFailure || {
          provider: provider.id as AIProviderId,
          reason: 'Provider produced an incomplete response',
          status: 0,
          code: 'SERVER_ERROR',
        },
      };
    }

    return result;
  }

  static async testProvider(
    providerId: AIProviderId,
    apiKey?: string,
    endpointUrl?: string
  ): Promise<{ ok: boolean; message: string }> {
    switch (providerId) {
      case 'openai':
        return new OpenAIProvider(apiKey || '').testConnection();
      case 'gemini':
        return new GeminiProvider(apiKey || '').testConnection();
      case 'deepseek':
        return new DeepSeekProvider(apiKey || '').testConnection();
      case 'openrouter':
        return new OpenRouterProvider(apiKey || '').testConnection();
      case 'gateway':
        return new GatewayProvider(endpointUrl || 'https://refinzi.com/api/v1/refine', apiKey).testConnection();
      case 'local':
      default:
        return this.localProvider.testConnection();
    }
  }
}
