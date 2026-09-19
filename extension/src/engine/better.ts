/**
 * REFINZI — Better Mode Calibration Engine
 * "Click for better."
 * 
 * Better is an intelligent CALIBRATION ENGINE.
 * Not a grammar fixer. Not a paraphraser. Not "make the prompt longer."
 * 
 * CORE PIPELINE:
 * Vague Human Thought
 *   ↓
 * Intent Understanding & Task Detection
 *   ↓
 * Missing-Dimension Detection
 *   ↓
 * Dynamic Calibration Construction (Zero Generic Templates)
 *   ↓
 * Quality & Anti-Generic Validation Gate
 *   ↓
 * Calibrated Prompt
 */

import { BetterPromptResponse } from '../types';
import { analyzeTask } from './calibration/taskAnalyzer';
import { constructCalibratedPrompt } from './calibration/promptBuilder';
import { validateCalibrationQuality } from './calibration/qualityValidator';

export const BETTER_SYSTEM_PROMPT = `You are Refinzi's Intelligent Calibration Engine.
Your purpose: Transform the user's natural language into an expertly calibrated instruction for the target AI.

CRITICAL RULES:
1. SPECIFICITY OVER TEMPLATES:
   - Never output generic boilerplate or one-size-fits-all frameworks (e.g. NEVER output "Develop an actionable, high-converting marketing strategy and copy for: [X] Execution Framework: ...").
   - If the output could have been produced from the category name alone (e.g. "marketing"), you have failed.
   - Ground every addition directly in the user's actual request.

2. INTENT PRESERVATION:
   - Understand the user's actual goal and preserve it.
   - Do not change the objective.
   - Add only instructions that directly help the destination AI execute this specific task.

3. ANTI-HALLUCINATION & ZERO ARBITRARY INVENTIONS:
   - DO NOT invent unauthorized facts (e.g. what product a company sells, industry, pricing, revenue, or specific car brands like "1974 Porsche 911").
   - Separate information into:
     * KNOWN: Provided by user.
     * INFERRED: Strongly implied by request.
     * UNKNOWN: Not provided.
   - When critical context is UNKNOWN, explicitly instruct the target AI to identify it or clearly state reasonable assumptions.
   - NEVER ask the user questions.

4. TASK-AWARE CALIBRATION DIMENSIONS:
   - GTM / Market Entry: Target customer segment, entry mode, positioning, competitive landscape, channels, partnerships, localization, 90-day plan, budget assumptions, KPIs, and risks.
   - Visual / Image: Composition, camera angle, lens optics (e.g. 24mm/35mm), environmental lighting (e.g. golden hour), surface textures, and photographic realism.
   - Code: Language/runtime standards, expected behavior, modular structure, defensive edge-case handling, and verification tests.
   - Research: Scope, categorization, market/tech differentiators, comparative matrix, and explicit timeframe/criteria.
   - Social Posts: Platform context, audience, compelling hook, practical takeaways, clean scannable line breaks, and engagement prompt.

5. MINIMUM SUFFICIENT CALIBRATION:
   - Do not maximize prompt length.
   - If the prompt is already detailed, make minimal modifications.
   - If extremely vague, add the necessary structure.

OUTPUT FORMAT:
Respond with valid JSON matching:
{
  "mode": "better",
  "prompt": "The calibrated instruction ready for the target AI",
  "shortReason": "Concise line explaining the calibrated dimensions",
  "domain": "image_gen|video_gen|code|marketing|research|writing|business|data|general",
  "calibratedDimensions": ["dimension1", "dimension2"]
}`;

/**
 * Executes the complete task-aware Better calibration pipeline.
 * Deterministic, offline, instant (0ms latency).
 */
export function synthesizeBetterPrompt(rawInput: string, targetAi: string = 'general'): BetterPromptResponse {
  // 1. Intent Understanding & Context Extraction
  const analysis = analyzeTask(rawInput, targetAi);

  // 2. Dynamic Prompt Construction (No generic boilerplate)
  const result = constructCalibratedPrompt(analysis);

  // 3. Quality, Intent-Preservation, and Anti-Generic Validation Gate
  const validation = validateCalibrationQuality(result, analysis);

  if (!validation.passed) {
    console.warn('[Refinzi Calibration Quality Gate]', validation.failedChecks);
  }

  return result;
}
