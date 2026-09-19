/**
 * REFINZI — Expert Mode Engine
 * "Hold for expert."
 * 
 * CORE ARCHITECTURAL PRINCIPLE:
 * TASK -> REASONING -> CALIBRATION (Not Category -> Template)
 * 
 * SCOPE FIDELITY:
 * Deep execution of the user's EXACT task.
 * Never silently expand hero -> landing page, email -> strategy, bug fix -> redesign.
 * 
 * NEVER ASKS QUESTIONS.
 * Reconstructs the semantic task, infers missing execution dimensions,
 * makes defensible baseline assumptions without inventing facts,
 * applies Scope Validation, Intent Fidelity, and Anti-Generic gates,
 * and returns a minimum sufficient execution specification ready for immediate in-place replacement.
 */

import { ExpertFinalResponse, TaskDomain } from '../types';
import { analyzeExpertTask, ExpertTaskKind, ExpertTaskModel } from './expert/expertAnalyzer';
import { constructExpertPrompt } from './expert/expertBuilder';
import { validateExpertPrompt } from './expert/expertValidator';

export const EXPERT_SYSTEM_PROMPT = `You are Refinzi's Autonomous Expert Briefing Engine.
Your purpose: Produce an exhaustive, senior execution specification for the target AI.

CRITICAL PRODUCT PRINCIPLES:
1. SCOPE FIDELITY:
   Determine what the user actually asked to produce and stay strictly inside that scope.
   Never expand "hero" to "landing page", "email" to "customer retention strategy",
   "bug fix" to "architecture redesign", or "headline" to "bio/content strategy".
2. NEVER ASK QUESTIONS:
   Infer missing dimensions, apply defensible baseline assumptions, and instruct the target AI to declare assumptions explicitly if key details are unstated.
3. NO PRESTIGE JARGON:
   Never use generic prestige roles such as "World-Class", "Elite", "Renowned", "Top 1%", or "Guru".
4. NO INVENTED USER FACTS:
   Never manufacture audience personas, specific companies, products, revenue, or budgets unless present in the user's input.
5. TASK SEMANTICS OVER CATEGORY LABELS:
   Never substitute a generic category template. The semantic meaning and scope must dominate.
6. MINIMUM SUFFICIENT EXPERT:
   Do not artificially maximize prompt length. For already comprehensive prompts, apply minimal modification and preserve user specifications.

OUTPUT FORMAT:
Respond with valid JSON matching:
{
  "mode": "expert",
  "prompt": "The calibrated expert prompt ready for immediate execution",
  "intent": "Crisp intent title",
  "summary": "One sentence summary of the execution calibration",
  "domain": "image_gen|video_gen|code|marketing|research|writing|business|data|general",
  "assumptions": ["Defensible assumption 1", "Defensible assumption 2"]
}`;

/**
 * Deterministic Expert Calibration Pipeline:
 * 
 * RAW INPUT
 *    ↓
 * INTENT UNDERSTANDING
 *    ↓
 * TASK RECONSTRUCTION
 *    ↓
 * SCOPE DETECTION
 *    ↓
 * CONTEXT EXTRACTION
 *    ↓
 * TASK TYPE
 *    ↓
 * TASK-SPECIFIC MISSING DIMENSIONS
 *    ↓
 * DEFENSIBLE ASSUMPTIONS
 *    ↓
 * EXPERT INSTRUCTION PLAN
 *    ↓
 * PROMPT CONSTRUCTION
 *    ↓
 * SCOPE VALIDATION
 *    ↓
 * INTENT VALIDATION
 *    ↓
 * ANTI-GENERIC VALIDATION
 *    ↓
 * FINAL PROMPT
 */
import { synthesizeBetterPrompt } from './better';

/**
 * Deterministic Expert Calibration Pipeline with Mechanized Quality Gates:
 * 
 * RAW INPUT
 *    ↓
 * INTENT UNDERSTANDING
 *    ↓
 * TASK RECONSTRUCTION (Scope Detection, Context Extraction)
 *    ↓
 * TASK-SPECIFIC MISSING DIMENSIONS & DEFENSIBLE ASSUMPTIONS
 *    ↓
 * PROMPT CONSTRUCTION (+ Optional Out-of-Scope Observations Appendix)
 *    ↓
 * MECHANIZED QUALITY GATES:
 * ├─ Scope Fidelity Gate   -> Compare deliverables raw vs. calibrated. On failure: Retry -> degrade to Better
 * ├─ Anti-Prestige Gate    -> Regex sweep + allowlist. On failure: Sanitize & pass
 * └─ Intent Fidelity Gate  -> Measurable clause similarity >= 0.9. On failure: Clamp objective -> retry once
 *    ↓
 * FINAL EXPERT SPECIFICATION
 */
export function synthesizeExpertPrompt(rawInput: string, targetAi: string = 'general'): ExpertFinalResponse {
  // 1. Task Reconstruction, Scope Detection & Context Extraction
  const model = analyzeExpertTask(rawInput, targetAi);
  const domain = mapTaskKindToDomain(model.taskKind);

  // 2. Expert Instruction Planning & Prompt Construction
  let prompt = constructExpertPrompt(model);

  // Append Out-of-Scope Strategic Observations Escape Hatch (advisory appendix, never merged into deliverable)
  prompt = appendOutOfScopeEscapeHatch(prompt, model);

  // 3. Mechanized Quality Gate 1: Anti-Prestige (Sanitize and pass)
  let validation = validateExpertPrompt(prompt, model);
  if (validation.prestigeTermsFound.length > 0) {
    prompt = sanitizePrompt(prompt);
    validation = validateExpertPrompt(prompt, model);
  }

  // 4. Mechanized Quality Gate 2: Intent Fidelity (Objective clause similarity >= 0.9)
  if (validation.intentSimilarity < 0.9) {
    // Retry once: explicitly anchor the user's raw objective clause verbatim
    prompt = `Execution Directive: ${model.rawInput.trim()}\n\n${prompt}`;
    validation = validateExpertPrompt(prompt, model);

    if (validation.intentSimilarity < 0.9) {
      // Degrade to Better if objective clause is still compromised
      const betterFallback = synthesizeBetterPrompt(rawInput, targetAi);
      return {
        mode: 'expert',
        prompt: betterFallback.prompt,
        intent: model.coreObjective,
        summary: `${betterFallback.shortReason} (Intent fidelity clamped to Better)`,
        domain,
        assumptions: [
          `Known: ${model.rawInput.trim()}`,
          'Preserved: Core intent protected via Better calibration',
        ],
      };
    }
  }

  // 5. Mechanized Quality Gate 3: Scope Fidelity (Zero new deliverable nodes)
  if (validation.hasScopeExpansion) {
    // Retry once: clamp prompt strictly by stripping unauthorized sections
    prompt = clampDeliverableScope(prompt, model);
    validation = validateExpertPrompt(prompt, model);

    if (validation.hasScopeExpansion) {
      // Degrade to Better to protect strict deliverable boundaries
      const betterFallback = synthesizeBetterPrompt(rawInput, targetAi);
      return {
        mode: 'expert',
        prompt: betterFallback.prompt,
        intent: model.coreObjective,
        summary: `${betterFallback.shortReason} (Scope locked to Better)`,
        domain,
        assumptions: [
          `Known: Deliverable restricted to ${model.deliverable}`,
          'Scope locked: Degraded to Better to prevent unauthorized section expansion',
        ],
      };
    }
  }

  const assumptions = deriveTransparentAssumptions(model);
  const summary = buildSummary(model);

  return {
    mode: 'expert',
    prompt,
    intent: model.coreObjective,
    summary,
    domain,
    assumptions,
  };
}

/**
 * Appends a clearly separated "Out-of-Scope Strategic Observations" appendix.
 * Flagged separately so scope stays locked while seniority still shows.
 */
function appendOutOfScopeEscapeHatch(prompt: string, model: ExpertTaskModel): string {
  let observations = '';

  if (model.scope === 'hero_section') {
    observations = 'Verify subsequent conversion funnel friction (e.g. signup flow, social proof placement) post-hero launch.';
  } else if (model.scope === 'single_email') {
    observations = 'If client responds defensively, transition from email to a 10-minute discovery call rather than a lengthy email thread.';
  } else if (model.scope === 'bug_fix') {
    observations = 'Audit upstream event emitters and memory allocation benchmarks during peak load.';
  } else if (model.scope === 'gtm_strategy') {
    observations = 'Review SOC2 Type II and GDPR readiness early if targeting US/EU enterprise buyers.';
  }

  if (!observations) return prompt;

  return `${prompt}\n\n---\n[Out-of-Scope Strategic Observations]\n(Advisory notes outside the locked deliverable scope):\n• ${observations}`;
}

function clampDeliverableScope(prompt: string, model: ExpertTaskModel): string {
  if (model.scope === 'hero_section') {
    return prompt
      .replace(/## Pricing.*?(?=##|$)/gis, '')
      .replace(/## FAQ.*?(?=##|$)/gis, '')
      .replace(/## Testimonials.*?(?=##|$)/gis, '');
  }
  if (model.scope === 'single_email') {
    return prompt.replace(/Customer Retention Strategy.*?(?=\n\n|$)/gis, '');
  }
  return prompt;
}

function sanitizePrompt(prompt: string): string {
  return prompt
    .replace(/\b(world-class|elite|renowned|top 1%|guru|expert architect)\b/gi, 'senior specialist')
    .replace(/- Target Domain:.*\n?/gi, '')
    .replace(/- Target Environment:.*\n?/gi, '')
    .replace(/- Audience Standard:.*\n?/gi, '')
    .replace(/# ROLE & PERSPECTIVE\nYou are acting as a World-Class.*\n\n?/gi, '');
}

function mapTaskKindToDomain(taskKind: ExpertTaskKind): TaskDomain {
  switch (taskKind) {
    case 'gtm_market_entry':
    case 'business_analytics':
      return 'business';
    case 'landing_page':
    case 'social_content':
      return 'marketing';
    case 'code_debugging':
    case 'code_engineering':
      return 'code';
    case 'image_cinematic':
      return 'image_gen';
    case 'competitive_research':
    case 'general_research':
      return 'research';
    case 'email_communication':
      return 'writing';
    default:
      return 'general';
  }
}

function deriveTransparentAssumptions(model: ExpertTaskModel): string[] {
  const assumptions: string[] = [];

  // 1. KNOWN: Core objective & explicit entities preserved verbatim
  if (model.explicitEntities.length > 0) {
    assumptions.push(`Known: Targeting ${model.explicitEntities.slice(0, 2).join(', ')}`);
  } else {
    assumptions.push(`Known: Deliverable strictly locked to ${model.deliverable}`);
  }

  // 2. INFERRED: Context inferred from task domain
  if (model.geography) {
    const geoName = model.geography === 'US' ? 'United States' : model.geography;
    assumptions.push(`Inferred: Geographic focus is ${geoName}`);
  }

  // 3. ASSUMED: Explicitly declared in prompt to prevent hallucination
  switch (model.scope) {
    case 'gtm_strategy':
      assumptions.push('Assumed: Mid-market B2B ICP with 30-90 day discovery cycles (stated in prompt)');
      break;
    case 'hero_section':
      assumptions.push('Assumed: Developer/technical audience; no pricing or FAQ clutter');
      break;
    case 'single_email':
      assumptions.push('Assumed: Senior commercial relationship; non-price levers prioritized');
      break;
    case 'bug_fix':
      assumptions.push('Assumed: Production runtime; surgical fix with regression test');
      break;
    case 'headline_only':
      assumptions.push('Assumed: Executive leadership tone; strict 2-line maximum');
      break;
    case 'competitive_analysis':
      assumptions.push('Assumed: Verified market data prioritized over speculative estimates');
      break;
    case 'metric_diagnostic':
      assumptions.push('Assumed: Funnel and cohort breakdown required before speculative fixes');
      break;
    case 'single_image':
      assumptions.push('Assumed: 35mm f/1.4 lens optics and natural directional lighting');
      break;
    default:
      assumptions.push('Assumed: Senior practitioner standards with explicit constraints');
      break;
  }

  return assumptions;
}

function buildSummary(model: ExpertTaskModel): string {
  if (model.isAlreadyDetailed) {
    return 'Calibrated execution rigor preserving all user specifications.';
  }

  const geoLabel = model.geography === 'US' ? 'United States' : (model.geography || 'target market');

  switch (model.scope) {
    case 'gtm_strategy':
      return `Comprehensive market-entry strategy calibrated for ${geoLabel}.`;
    case 'hero_section':
      return 'Developer outcome-oriented hero section copy and structure.';
    case 'headline_only':
      return 'Concise 2-line leadership headline options.';
    case 'single_email':
      return 'Professional, accountable customer communication.';
    case 'bug_fix':
      return 'Root-cause diagnosis, surgical code fix, and regression test.';
    case 'competitive_analysis':
      return `In-depth competitive evaluation${model.geography ? ` for ${model.geography}` : ''}.`;
    case 'single_image':
      return 'Cinematic 35mm photographic prompt specification.';
    case 'metric_diagnostic':
      return 'Root-cause diagnostic framework and remediation plan.';
    default:
      return 'Expert task specification structured for immediate execution.';
  }
}
