/**
 * REFINZI — AI Provider Interfaces
 */

import { BetterPromptResponse, ExpertFinalResponse, SemanticIntent } from '../types';

export interface ProviderRequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

export interface AIProvider {
  id: string;
  name: string;

  generateBetter(
    rawInput: string,
    intent: SemanticIntent,
    options?: ProviderRequestOptions
  ): Promise<BetterPromptResponse>;

  generateExpert(
    rawInput: string,
    intent: SemanticIntent,
    options?: ProviderRequestOptions
  ): Promise<ExpertFinalResponse>;

  testConnection?(options?: ProviderRequestOptions): Promise<{ ok: boolean; message: string }>;
}
