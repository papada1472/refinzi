/**
 * REFINZI — Types & Contracts
 * "Click for better. Hold for expert."
 * "Write naturally. Refinzi handles the prompt engineering."
 */

export type PromptMode = 'better' | 'expert';

export type TaskDomain = 
  | 'image_gen'
  | 'video_gen'
  | 'code' 
  | 'marketing' 
  | 'research' 
  | 'writing' 
  | 'business' 
  | 'data' 
  | 'general';

/**
 * Shared Semantic Intent Object (SIO)
 * Formed autonomously without asking user questions.
 */
export interface SemanticIntent {
  artifactType: 'text' | 'code' | 'query' | 'visual' | 'workflow';
  rawInput: string;
  intent: string;
  objective: string;
  domain: TaskDomain;
  targetAi: string; // 'chatgpt' | 'claude' | 'gemini' | 'perplexity' | 'midjourney' | 'general'
  calibratedDimensions: string[]; // e.g. ['camera', 'lens', 'lighting', 'composition']
  assumptions: string[]; // defensible inferences made autonomously
  audience: string;
  constraints: string[];
  context: string[];
  desiredOutput: string;
  confidence: number;
  mode: PromptMode;
}

export interface ProviderFailureInfo {
  provider: AIProviderId;
  reason: string;
  status?: number;
  code?: 'NO_KEY' | 'INVALID_KEY' | 'QUOTA_EXCEEDED' | 'RATE_LIMITED' | 'NETWORK_ERROR' | 'SERVER_ERROR' | 'TIME_BUDGET_EXHAUSTED';
}

/**
 * Calibrated Better Mode Response Contract
 */
export interface BetterPromptResponse {
  mode: 'better';
  prompt: string;
  shortReason: string;
  domain: TaskDomain;
  calibratedDimensions?: string[];
  targetAi?: string;
  isFallback?: boolean;
  providerFailure?: ProviderFailureInfo;
}

/**
 * Calibrated Expert Mode Response Contract (Zero Questions Asked)
 */
export interface ExpertFinalResponse {
  mode: 'expert';
  prompt: string;
  intent: string;
  summary: string;
  domain: TaskDomain;
  assumptions: string[]; // Transparent defensible assumptions
  isFallback?: boolean;
  providerFailure?: ProviderFailureInfo;
}

/**
 * Site Adapter Interface
 */
export interface SiteAdapter {
  id: string;
  name: string;
  detect(): boolean;
  getComposer(): HTMLElement | null;
  getCurrentInput(): string;
  setComposerValue(text: string): boolean;
  focusComposer(): void;
  observeComposer(cb: () => void): MutationObserver | null;
  getSubmitButton(): HTMLElement | null;
  supportsApply(): boolean;
  cleanup?(): void;
}

/**
 * Provider Configuration
 */
export type AIProviderId = 'local' | 'gateway' | 'openai' | 'gemini' | 'deepseek' | 'openrouter';

export interface ProviderConfig {
  provider: AIProviderId;
  apiKey?: string;
  model?: string;
  endpointUrl?: string;
  temperature?: number;
}

export interface RefinziHistoryItem {
  id: string;
  timestamp: number;
  dateStr: string;
  mode: PromptMode;
  targetAi: string;
  originalPrompt: string;
  refinedPrompt: string;
  provider: AIProviderId;
  reasonOrSummary?: string;
}

export interface RefinziStats {
  todayBetterCount: number;
  todayExpertCount: number;
  lastDate: string;
}

/**
 * Refinzi User Settings
 */
export interface RefinziSettings {
  defaultMode: PromptMode;
  provider: AIProviderId;
  apiKeys: {
    openai?: string;
    gemini?: string;
    deepseek?: string;
    openrouter?: string;
    gateway?: string;
  };
  models: {
    openai?: string;
    gemini?: string;
    deepseek?: string;
    openrouter?: string;
  };
  gatewayUrl: string;
  enabledSites: {
    chatgpt: boolean;
    claude: boolean;
    gemini: boolean;
    perplexity: boolean;
  };
  shortcuts: {
    better: string;
    expert: string;
  };
  theme: 'dark' | 'light' | 'auto';
  autoFocus: boolean;
  showInlineTrigger: boolean;
  holdThresholdMs: number; // Duration in ms to trigger Expert mode (default: 350ms)
  autoApply: boolean; // Grammarly-style in-place replacement (default: true)
  saveHistory: boolean; // Privacy setting (default: true)
  hasSeenOnboarding?: boolean; // Track first-run modal state (default: false)
  freeUsageCount?: number;    // Number of prompts calibrated on the default free Gemini key
  freeUsageExpired?: boolean;  // true once the free tier cap (25) is reached
}

export type PeriodType = 'Today' | 'Week' | 'Month' | 'All Time';

export interface RefinziUsageEvent {
  id: string;
  timestamp: number;
  mode: PromptMode;
  targetAi: string;
  provider: AIProviderId;
  model?: string;
  success: boolean;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  costUsd?: number;
}

export interface RefinziMetricsSummary {
  period: PeriodType;
  totalPromptsEnhanced: number;
  promptsPeriodSubtitle: string;
  estimatedTimeSavedFormatted: string;
  estimatedTimeSavedTooltip: string;
  estimatedCostSavedFormatted: string;
  estimatedCostSavedSubtitle: string;
  estimatedCostSavedTooltip: string;
  betterCount: number;
  expertCount: number;
  betterPercentage: number;
  expertPercentage: number;
  hasCostData: boolean;
  todayCount: number;
  weekCount: number;
  monthCount: number;
  allTimeCount: number;
}

/**
 * Extension Messaging
 */
export type ExtensionMessage =
  | { type: 'REFINZI_GENERATE_BETTER'; text: string; targetAi?: string; requestId?: string }
  | { type: 'REFINZI_GENERATE_EXPERT'; text: string; targetAi?: string; requestId?: string }
  | { type: 'REFINZI_GET_SETTINGS' }
  | { type: 'REFINZI_SAVE_SETTINGS'; settings: Partial<RefinziSettings> }
  | { type: 'REFINZI_TEST_PROVIDER'; provider: AIProviderId; apiKey?: string; endpointUrl?: string }
  | { type: 'REFINZI_GET_HISTORY' }
  | { type: 'REFINZI_CLEAR_HISTORY' }
  | { type: 'REFINZI_DELETE_HISTORY_ITEM'; id: string }
  | { type: 'REFINZI_GET_STATS' }
  | { type: 'REFINZI_GET_METRICS_SUMMARY'; period?: PeriodType }
  | { type: 'REFINZI_SET_PERIOD'; period: PeriodType }
  | { type: 'REFINZI_TRIGGER_BETTER_SHORTCUT' }
  | { type: 'REFINZI_TRIGGER_EXPERT_SHORTCUT' }
  | { type: 'REFINZI_OPEN_POPUP' }
  | { type: 'REFINZI_OPEN_SETTINGS' };



