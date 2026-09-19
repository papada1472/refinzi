/**
 * REFINZI — Response Validator & JSON Recovery
 * 
 * Safely parses and validates structured model outputs.
 * Recovers from unescaped newlines, markdown code blocks, and malformed JSON.
 */

import { BetterPromptResponse, ExpertFinalResponse, TaskDomain } from '../types';

export function extractAndParseJSON<T = unknown>(raw: string): T | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();

  // 1. Direct parse
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    // Continue
  }

  // 2. Strip markdown code fences (```json ... ```)
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim()) as T;
    } catch {
      // Continue
    }
  }

  // 3. Outermost bracket extraction { ... }
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const candidate = trimmed.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate) as T;
    } catch {
      try {
        const sanitized = candidate.replace(/[\u0000-\u001F]+/g, (match) => {
          if (match === '\n') return '\\n';
          if (match === '\r') return '\\r';
          if (match === '\t') return '\\t';
          return '';
        });
        return JSON.parse(sanitized) as T;
      } catch {
        return null;
      }
    }
  }

  return null;
}

export function validateBetterResponse(data: unknown): BetterPromptResponse | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;

  const prompt = typeof obj.prompt === 'string' ? obj.prompt.trim() : '';
  if (!prompt) return null;

  return {
    mode: 'better',
    prompt,
    shortReason: typeof obj.shortReason === 'string' ? obj.shortReason.trim() : 'Calibrated high-leverage dimensions for target AI.',
    domain: isValidDomain(obj.domain) ? (obj.domain as TaskDomain) : 'general',
    calibratedDimensions: Array.isArray(obj.calibratedDimensions) ? obj.calibratedDimensions.map(String) : undefined,
    targetAi: typeof obj.targetAi === 'string' ? obj.targetAi : undefined,
  };
}

export function validateExpertFinalResponse(data: unknown): ExpertFinalResponse | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;

  const prompt = typeof obj.prompt === 'string' ? obj.prompt.trim() : '';
  if (!prompt) return null;

  const rawAssumptions = Array.isArray(obj.assumptions) ? obj.assumptions : [];
  const assumptions = rawAssumptions.map(String);

  return {
    mode: 'expert',
    prompt,
    intent: typeof obj.intent === 'string' ? obj.intent.trim() : 'Expert Briefing',
    summary: typeof obj.summary === 'string' ? obj.summary.trim() : 'Autonomous expert task specification',
    domain: isValidDomain(obj.domain) ? (obj.domain as TaskDomain) : 'general',
    assumptions,
  };
}

function isValidDomain(val: unknown): boolean {
  const domains: TaskDomain[] = [
    'image_gen',
    'video_gen',
    'code',
    'marketing',
    'research',
    'writing',
    'business',
    'data',
    'general',
  ];
  return typeof val === 'string' && domains.includes(val as TaskDomain);
}
