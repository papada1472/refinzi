'use strict';

/**
 * Refinzi Prompt Engineer Engine v0
 *
 * Converts an optimized Envelope into a final provider-agnostic prompt package.
 * This module represents Refinzi's core intelligence.
 *
 * It does NOT communicate with providers.
 * It does NOT generate XML.
 * It does NOT know specific models (GPT, Claude, Gemini).
 *
 * Pure, synchronous transformation.
 */

/**
 * Generates an expert persona string dynamically from a profile identifier.
 *
 * @param {string} profile
 * @returns {string}
 */
function generateDynamicPersona(profile) {
  const label = (profile || 'expert_architect').replace(/_/g, ' ');
  const article = /^[aeiou]/i.test(label) ? 'an' : 'a';
  return `${article} ${label}`;
}

/**
 * Resolves domain-calibrated guidance based on intent and structured hints.
 *
 * @param {Object} envelope
 * @returns {Object}
 */
function getDomainGuidance(envelope) {
  const outputType = envelope.intentAnnotations?.outputType || envelope.structuredHints?.detectedOutput || '';
  const role = envelope.intentAnnotations?.expectedRole || envelope.structuredHints?.detectedRole || '';
  const text = (envelope.rawIntent || '').toLowerCase();

  const isMedia = 
    outputType === 'cinematic_prompt' || 
    outputType === 'Cinematic Media' ||
    role === 'cinematographer' ||
    /\b(midjourney|runway|kling|higgsfield|pika|luma|sora|cinematic|camera|lens|lighting|volumetric|photoreal|render|35mm|anamorphic)\b/i.test(text);

  const isResearch =
    outputType === 'research_synthesis' ||
    outputType === 'Deep Research' ||
    role === 'research scientist' ||
    /\b(research|paper|study|methodology|literature review|confounder|hypothesis|clinical|sample size|p-value|bias|prisma|peer review)\b/i.test(text);

  const isCode =
    outputType === 'code_architecture' ||
    outputType === 'Software Architecture' ||
    role === 'software architect' ||
    role === 'software_engineer' ||
    role === 'engineer' ||
    /\b(react|typescript|component|api|database|sql|bug|refactor|tailwind|cursor|endpoint|backend|frontend)\b/i.test(text);

  if (isMedia) {
    return {
      domain: 'media',
      persona: 'Senior Visual Director & Cinematographer',
      purpose: "Transform the user's idea into a high-fidelity cinematic prompt calibrated for generative visual & video models (Midjourney, Runway, Kling, Higgsfield).",
      domainRules: [
        "- Specify explicit camera choreography (shot type, focal length, angle, camera velocity, and inertia).",
        "- Detail volumetric lighting, atmospheric texture, depth of field, and color temperature.",
        "- Enforce motion coherence and physical realism (natural inertia, gravity, fluid/particle behavior).",
        "- Include negative constraints (e.g., no warping, no distorted anatomy, no erratic camera shake).",
        "- Avoid generic buzzwords; use tangible physical and optical descriptors."
      ]
    };
  }

  if (isResearch) {
    return {
      domain: 'research',
      persona: 'Principal Research Scientist & Analytical Epistemologist',
      purpose: "Transform the user's inquiry into a rigorous, multi-dimensional research specification calibrated for frontier reasoning models (DeepSeek R1, Claude 3.7 Thinking, o1/o3).",
      domainRules: [
        "- Frame inquiry through explicit epistemic criteria and rigorous domain expertise.",
        "- Mandate methodological critique (potential confounders, selection bias, statistical power, generalizability limits).",
        "- Direct the model to produce structured extraction schemas (Markdown comparison matrices, variable breakdowns).",
        "- Require adversarial falsification (probing assumptions, edge cases, and boundary conditions).",
        "- Eliminate conversational pleasantries; enforce formal academic precision."
      ]
    };
  }

  if (isCode) {
    return {
      domain: 'code',
      persona: 'Staff Software Architect & Systems Designer',
      purpose: "Transform the user's requirement into an unambiguous, production-grade software engineering specification for coding agents (Cursor, Claude Code, v0).",
      domainRules: [
        "- Define semantic architecture, component boundaries, and state flow.",
        "- Enforce strict type contracts, data structures, and deterministic logic.",
        "- Explicitly detail edge cases, error handling, loading states, and accessibility standards.",
        "- Structure instructions into clean, modular blocks that compile cleanly."
      ]
    };
  }

  return {
    domain: 'general',
    persona: 'Elite Prompt Architect & Communication Strategist',
    purpose: "Refine and upgrade the user's request into a high-yield, production-ready prompt that maximizes AI output quality without changing core intent.",
    domainRules: [
      "- Improve clarity, structure, and actionable precision while preserving authentic user voice.",
      "- Remove ambiguity, vagueness, and conversational filler.",
      "- Clarify expected output format and add constraints a top 1% professional would naturally include.",
      "- Never invent facts or alter original meaning."
    ]
  };
}

/**
 * Builds a system prompt for "Preserve Mode" (✨).
 *
 * @param {Object} envelope
 * @returns {string}
 */
function buildPreserveSystemPrompt(envelope) {
  const { constraints, outputPolicy } = envelope;
  const guidance = getDomainGuidance(envelope);

  const sections = [
    `You are a ${guidance.persona}.`,
    "",
    guidance.purpose,
    "Your output must NOT read like generic conversational AI. It must read like an elite, calibrated prompt directive.",
    "",
    "Domain Calibration:",
    ...guidance.domainRules,
    "",
    "Instructions:",
    "- Improve clarity and structure.",
    "- Add obvious missing output expectations and constraints.",
    "- Preserve the user's natural tone and primary objective.",
    "- Never invent facts.",
    "- Never expose reasoning or mention prompt engineering.",
    "- **Smart Skip (REF-OE-012)**: If prompt quality is already high (e.g. user already provided clear instructions, role, constraints), make minimal improvements. Avoid rewriting for the sake of rewriting. Only optimize by 5% to 10% when appropriate.",
    "- **Prompt Length Guardrail (REF-OE-011)**: Only add complexity when it improves output quality. Do not inflate prompt length unnecessarily. A simple request should remain simple.",
    "- **Multilingual / Translation Preserver (REF-OE-013)**: If the request is a translation instruction (e.g., 'Translate X to Y', 'Traduce esto', etc.) or is written in a non-English language, do NOT translate the request itself, do NOT change the target languages, and do NOT change the text that needs to be translated. Keep the instruction language and structure intact, only optimizing phrasing if needed.",
    "- Return only the optimized request.",
  ];

  // Logic for inputConstraints/outputConstraints as per requirements
  const inputConstraints = envelope.inputConstraints || [];
  const outputConstraints = envelope.outputConstraints || [];
  const allConstraints = [...(constraints || []), ...inputConstraints, ...outputConstraints];

  if (allConstraints.length > 0) {
    sections.push('', 'Constraints:');
    allConstraints.forEach((c) => sections.push(`- ${c}`));
  }

  if (outputPolicy) {
    sections.push('', 'Refinzi Policy:');
    if (outputPolicy.preserveLanguage) sections.push('- Preserve original language exactly.');
    if (outputPolicy.preservePersonality) sections.push('- Maintain the original tone and personality.');
    if (outputPolicy.minimalModification) sections.push('- Apply minimal modifications to the core intent.');
  }

  return sections.join('\n').trim();
}

/**
 * Builds a system prompt for "Expert Mode" (Hold ✨).
 *
 * @param {Object} envelope
 * @returns {string}
 */
function buildExpertSystemPrompt(envelope) {
  const { intentAnnotations, constraints, outputPolicy } = envelope;
  const guidance = getDomainGuidance(envelope);
  const profile = intentAnnotations?.expectedRole || guidance.domain;
  const persona = generateDynamicPersona(profile);

  const sections = [
    `You are a ${guidance.persona}, acting as ${persona}.`,
    "",
    "Your purpose is to silently engineer the strongest possible production-grade AI specification before execution.",
    guidance.purpose,
    "",
    "Domain Calibration:",
    ...guidance.domainRules,
    "",
    "Instructions:",
    "- Adopt the provided persona to frame the prompt with deep domain expertise.",
    "- Add domain-specific framing, edge cases, negative constraints, and structured schemas.",
    "- Infer the optimal output format for downstream consumption.",
    "- Specify execution constraints and validation boundaries.",
    "",
    "Preserve:",
    "- original meaning,",
    "- original objective.",
    "",
    "Never:",
    "- expose internal reasoning,",
    "- mention prompt engineering,",
    "- explain optimization steps,",
    "- invent facts,",
    "- change the user's actual goal.",
    "",
    "Guidelines:",
    "- **Smart Skip (REF-OE-012)**: If prompt quality is already high (e.g. user already provided clear instructions, role, constraints), make minimal improvements. Avoid rewriting for the sake of rewriting.",
    "- **Multilingual / Translation Preserver (REF-OE-013)**: If the request is a translation instruction or written in a non-English language, you must preserve the original language and target language of the instruction. Do not translate the user's input text or instructions into English unless explicitly requested.",
    "",
    "Return only the final optimized request.",
  ];

  // Logic for inputConstraints/outputConstraints as per requirements
  const inputConstraints = envelope.inputConstraints || [];
  const outputConstraints = envelope.outputConstraints || [];
  const allConstraints = [...(constraints || []), ...inputConstraints, ...outputConstraints];

  if (allConstraints.length > 0) {
    sections.push('', 'Professional Constraints:');
    allConstraints.forEach((c) => sections.push(`- ${c}`));
  }

  const expectations = intentAnnotations?.expectations;
  if (expectations && Object.keys(expectations).length > 0) {
    sections.push('', 'Output Expectations:');
    for (const [key, value] of Object.entries(expectations)) {
      sections.push(`- ${key}: ${value}`);
    }
  }

  if (outputPolicy) {
    sections.push('', 'Policy:');
    if (outputPolicy.preserveLanguage) sections.push('- Maintain original language.');
    if (outputPolicy.preserveMeaning) sections.push('- Do not change the underlying objective.');
  }

  return sections.join('\n').trim();
}

/**
 * Converts an optimized Envelope into a final provider-agnostic prompt package.
 *
 * @param {Object} envelope - The optimized Refinzi Envelope
 * @param {"preserve"|"expert"} [mode="preserve"] - The execution mode
 * @returns {{ systemPrompt: string, userPrompt: string }}
 */
export function buildExecutionPlan(envelope, mode = 'preserve') {
  if (!envelope || typeof envelope !== 'object') {
    throw new Error('buildExecutionPlan: envelope must be a valid object');
  }

  let userPrompt = envelope.rawIntent || '';
  let systemPrompt = '';

  const hints = [];
  if (envelope.intentAnnotations?.outputType) {
    hints.push(`Detected output type: ${envelope.intentAnnotations.outputType}`);
  }
  if (envelope.intentAnnotations?.expectedRole) {
    hints.push(`Suggested expert role: ${envelope.intentAnnotations.expectedRole}`);
  }
  if (Object.keys(envelope.intentAnnotations?.expectations || {}).length > 0) {
    hints.push(`Output expectations: ${JSON.stringify(envelope.intentAnnotations.expectations)}`);
  }

  const normalizedMode = mode === 'sparkle' || mode === 'click' || mode === 'context' ? 'preserve' : (mode === 'hold' ? 'expert' : mode);

  if (normalizedMode === 'expert') {
    systemPrompt = buildExpertSystemPrompt(envelope);
  } else if (normalizedMode === 'preserve') {
    systemPrompt = buildPreserveSystemPrompt(envelope);
  } else {
    throw new Error(`buildExecutionPlan: unknown execution mode: ${mode}`);
  }

  if (hints.length > 0) {
    systemPrompt = systemPrompt + '\n\nRefinzi Context:\n' + hints.map(h => `- ${h}`).join('\n');
  }

  return {
    systemPrompt,
    userPrompt,
  };
}
