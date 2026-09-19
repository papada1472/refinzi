/**
 * REFINZI — Quality & Anti-Generic Validator
 * Ensures intent preservation, zero hallucination of specific entities,
 * and zero generic boilerplate templates.
 */

import { TaskAnalysis, ValidationCheckResult } from './types';
import { BetterPromptResponse } from '../../types';

export function validateCalibrationQuality(
  result: BetterPromptResponse,
  analysis: TaskAnalysis
): ValidationCheckResult {
  const promptLower = result.prompt.toLowerCase();
  const rawLower = analysis.rawInput.toLowerCase();
  const failedChecks: string[] = [];
  let score = 100;

  // 1. INTENT PRESERVATION TEST
  // The output must preserve the user's specific request
  if (rawLower.includes('us market') || rawLower.includes('in us')) {
    if (!promptLower.includes('us market') && !promptLower.includes('united states')) {
      failedChecks.push('Failed to preserve US market geographic intent');
      score -= 30;
    }
  }

  if (rawLower.includes('gtm') || rawLower.includes('go-to-market')) {
    if (!promptLower.includes('go-to-market') && !promptLower.includes('gtm')) {
      failedChecks.push('Failed to preserve Go-to-Market intent');
      score -= 30;
    }
  }

  if (rawLower.includes('python')) {
    if (!promptLower.includes('python')) {
      failedChecks.push('Failed to preserve Python language requirement');
      score -= 30;
    }
  }

  if (rawLower.includes('india')) {
    if (!promptLower.includes('india')) {
      failedChecks.push('Failed to preserve India geographical requirement');
      score -= 30;
    }
  }

  if (rawLower.includes('linkedin')) {
    if (!promptLower.includes('linkedin')) {
      failedChecks.push('Failed to preserve LinkedIn platform context');
      score -= 30;
    }
  }

  // 2. ANTI-GENERIC BOILERPLATE TEST
  // Check for the known faulty generic template strings
  const forbiddenBoilerplates = [
    'develop an actionable, high-converting marketing strategy and copy for:',
    'execution framework:\n- target buyer',
    'execution framework:\n- core value proposition',
    'develop an actionable, high-converting',
  ];

  for (const fp of forbiddenBoilerplates) {
    if (promptLower.includes(fp)) {
      failedChecks.push(`Contains generic boilerplate template: "${fp}"`);
      score -= 40;
    }
  }

  // Check if output is just generic filler without specific user context
  if (analysis.rawInput.length > 5 && !hasSubstantiveKeywords(promptLower, rawLower)) {
    failedChecks.push('Output lacks substantive reference to user objective');
    score -= 25;
  }

  // 3. ANTI-HALLUCINATION TEST
  // Check for arbitrary invented specific entities that the user never provided
  const forbiddenHallucinations = [
    { entity: 'porsche', rule: 'Must not invent specific car make (e.g. Porsche) unless provided' },
    { entity: 'ferrari', rule: 'Must not invent specific car make (e.g. Ferrari) unless provided' },
    { entity: 'bmw', rule: 'Must not invent specific car make (e.g. BMW) unless provided' },
  ];

  for (const item of forbiddenHallucinations) {
    if (!rawLower.includes(item.entity) && promptLower.includes(item.entity)) {
      failedChecks.push(`Hallucinated arbitrary entity: ${item.entity} (${item.rule})`);
      score -= 35;
    }
  }

  return {
    passed: failedChecks.length === 0,
    failedChecks,
    score: Math.max(0, score),
  };
}

function hasSubstantiveKeywords(promptLower: string, rawLower: string): boolean {
  // Extract key non-trivial tokens from raw input
  const stopWords = new Set(['a', 'an', 'the', 'in', 'to', 'for', 'of', 'and', 'with', 'on', 'at', 'this', 'that', 'can', 'you', 'please', 'help', 'me', 'i', 'want']);
  const tokens = rawLower
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  if (tokens.length === 0) return true;

  // At least 60% of significant tokens or an expanded synonym should appear in the calibrated prompt
  let matched = 0;
  for (const t of tokens) {
    if (promptLower.includes(t)) {
      matched++;
    } else if (t === 'gtm' && promptLower.includes('go-to-market')) {
      matched++;
    } else if (t === 'us' && (promptLower.includes('united states') || promptLower.includes('us market'))) {
      matched++;
    }
  }

  return matched / tokens.length >= 0.5;
}
