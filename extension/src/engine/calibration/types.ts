/**
 * REFINZI — Calibration Engine Types
 * Pure semantic representation of tasks, knowns/unknowns, and missing dimensions.
 */

import { TaskDomain } from '../../types';

export type GranularTaskType =
  | 'gtm_strategy'
  | 'market_entry'
  | 'social_media_post'
  | 'marketing_campaign'
  | 'copywriting'
  | 'code_debugging'
  | 'code_feature'
  | 'code_refactoring'
  | 'photographic_scene'
  | 'character_art'
  | 'video_cinematic'
  | 'research_market'
  | 'research_academic'
  | 'writing_article'
  | 'writing_creative'
  | 'business_strategy'
  | 'data_analysis'
  | 'general_instruction';

export interface TaskContextBreakdown {
  known: string[]; // Explicitly provided by user
  inferred: string[]; // Strongly implied by the prompt
  unknown: string[]; // Critical missing context (must NOT be hallucinated)
}

export interface TaskAnalysis {
  rawInput: string;
  cleanedInput: string;
  taskType: GranularTaskType;
  domain: TaskDomain;
  targetAi: string;
  actionVerb: string;
  coreSubject: string;
  context: TaskContextBreakdown;
  existingDimensions: string[];
  missingDimensions: string[];
  isAlreadyComprehensive: boolean;
  wordCount: number;
}

export interface CalibrationPlan {
  analysis: TaskAnalysis;
  selectedDimensions: string[];
  instructionsToTargetAi: string[];
  assumptionsHandling: string;
  rationale: string;
}

export interface ValidationCheckResult {
  passed: boolean;
  failedChecks: string[];
  score: number;
}
