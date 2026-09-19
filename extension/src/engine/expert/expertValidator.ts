/**
 * REFINZI — Expert Quality, Scope & Anti-Generic Validator
 * Version: 2.1.0
 * 
 * Mechanized Quality Gates & Measurable Criteria:
 * 
 * | Gate | Mechanism | On Failure |
 * | :--- | :--- | :--- |
 * | Scope Fidelity | Compare top-level deliverables raw vs. calibrated (zero new deliverable nodes) | Retry once → degrade to Better |
 * | Anti-Prestige | Curated regex list + allowlist exceptions | Sanitize and pass |
 * | Intent Fidelity | Raw objective clause survives verbatim or token recall >= 0.9 | Reject → retry once |
 */

import { ExpertTaskModel } from './expertAnalyzer';

export interface ExpertValidationResult {
  isValid: boolean;
  violations: string[];
  intentSimilarity: number;
  hasScopeExpansion: boolean;
  prestigeTermsFound: string[];
}

export const FORBIDDEN_PRESTIGE_TERMS = [
  'world-class',
  'elite',
  'renowned',
  'top 1%',
  'guru',
  'expert architect',
];

export const PRESTIGE_ALLOWLIST = [
  'expert witness',
  'senior engineer',
  'specialist',
  'subject matter expert',
  'domain specialist',
  'security specialist',
  'technical specialist',
  'clinical specialist',
];

export const FORBIDDEN_GENERIC_MARKETING_TERMS = [
  'direct-response copywriter',
  'discerning buyers',
  'high-converting copy & strategic execution blueprint',
];

export const FORBIDDEN_METADATA_CLUTTER = [
  '- Target Domain:',
  '- Target Environment:',
  '- Audience Standard:',
  '# ROLE & PERSPECTIVE\nYou are acting as a World-Class',
];

/**
 * Computes measurable intent fidelity between raw input and calibrated prompt.
 * Returns a score between 0.0 and 1.0 based on keyword survival & objective clause presence.
 */
export function calculateIntentSimilarity(rawInput: string, calibratedPrompt: string): number {
  if (!rawInput || !calibratedPrompt) return 0;

  const raw = rawInput.toLowerCase().trim();
  const calibrated = calibratedPrompt.toLowerCase().trim();

  // If verbatim substring exists, perfect score
  if (calibrated.includes(raw)) {
    return 1.0;
  }

  // Extract non-trivial semantic tokens (length > 2, excluding common glue words)
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'to', 'for', 'in', 'on', 'with', 'by', 'at', 'of',
    'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'create', 'make', 'write', 'give', 'generate'
  ]);

  const rawTokens = raw
    .split(/[^a-z0-9_#.-]+/)
    .map(t => t.trim())
    .filter(t => t.length > 2 && !stopWords.has(t));

  if (rawTokens.length === 0) {
    return 1.0;
  }

  let matchedCount = 0;
  for (const token of rawTokens) {
    const cleanToken = token.replace(/[^a-z0-9]/g, '');
    // Check direct token match, clean punctuation match, or plural/stem match
    if (
      calibrated.includes(token) ||
      (cleanToken.length > 2 && calibrated.includes(cleanToken)) ||
      (token.endsWith('s') && calibrated.includes(token.slice(0, -1))) ||
      (token.endsWith('ing') && calibrated.includes(token.slice(0, -3)))
    ) {
      matchedCount++;
    }
  }

  return matchedCount / rawTokens.length;
}

export function validateExpertPrompt(prompt: string, model: ExpertTaskModel): ExpertValidationResult {
  const violations: string[] = [];
  const lower = prompt.toLowerCase();
  let hasScopeExpansion = false;
  const prestigeTermsFound: string[] = [];

  // =========================================================================
  // GATE 1: SCOPE FIDELITY (Zero New Deliverable Nodes)
  // =========================================================================
  if (model.scope === 'hero_section') {
    if (lower.includes('pricing') || lower.includes('tier structure')) {
      violations.push('Scope expansion: hero section prompt generated pricing tiers.');
      hasScopeExpansion = true;
    }
    if (lower.includes('faq') || lower.includes('frequently asked questions')) {
      violations.push('Scope expansion: hero section prompt generated FAQ.');
      hasScopeExpansion = true;
    }
    if (lower.includes('testimonials') || lower.includes('social proof & credibility architecture')) {
      violations.push('Scope expansion: hero section prompt generated testimonial architecture.');
      hasScopeExpansion = true;
    }
    if (lower.includes('acquisition strategy')) {
      violations.push('Scope expansion: hero section prompt generated full acquisition strategy.');
      hasScopeExpansion = true;
    }
  }

  if (model.scope === 'single_email') {
    if (lower.includes('customer-retention strategy') || lower.includes('retention strategy')) {
      violations.push('Scope expansion: email prompt generated customer retention strategy.');
      hasScopeExpansion = true;
    }
    if (lower.includes('restitution or credit applied') && !model.rawInput.toLowerCase().includes('credit')) {
      violations.push('Invented fact: unprompted restitution or credit applied in apology email.');
      hasScopeExpansion = true;
    }
  }

  if (model.scope === 'headline_only') {
    if (
      (lower.includes('write an entire profile') || lower.includes('create a content strategy')) &&
      !lower.includes('do not write an entire profile')
    ) {
      violations.push('Scope expansion: headline prompt generated full profile or content strategy.');
      hasScopeExpansion = true;
    }
  }

  if (model.scope === 'bug_fix') {
    if (lower.includes('software architecture redesign')) {
      violations.push('Scope expansion: bug fix introduced architectural redesign.');
      hasScopeExpansion = true;
    }
  }

  // =========================================================================
  // GATE 2: ANTI-PRESTIGE (Blocklist with Context Allowlist)
  // =========================================================================
  for (const term of FORBIDDEN_PRESTIGE_TERMS) {
    if (lower.includes(term.toLowerCase())) {
      // Check if this term is part of an allowed phrase
      const isAllowed = PRESTIGE_ALLOWLIST.some(allowed => lower.includes(allowed.toLowerCase()));
      if (!isAllowed) {
        violations.push(`Contains forbidden prestige term: "${term}"`);
        prestigeTermsFound.push(term);
      }
    }
  }

  // Generic Marketing Boilerplate Check on non-copywriting tasks
  if (model.scope !== 'social_post' && model.scope !== 'full_landing_page' && model.scope !== 'hero_section') {
    for (const term of FORBIDDEN_GENERIC_MARKETING_TERMS) {
      if (lower.includes(term.toLowerCase())) {
        violations.push(`Injected generic marketing boilerplate into non-copywriting task: "${term}"`);
      }
    }
  }

  // Metadata Clutter Check
  for (const header of FORBIDDEN_METADATA_CLUTTER) {
    if (prompt.includes(header)) {
      violations.push(`Contains unnecessary metadata clutter: "${header}"`);
    }
  }

  // =========================================================================
  // GATE 3: INTENT FIDELITY (Measurable Similarity >= 0.9)
  // =========================================================================
  const intentSimilarity = calculateIntentSimilarity(model.rawInput, prompt);
  if (intentSimilarity < 0.9) {
    violations.push(`Intent fidelity threshold failed: similarity score is ${(intentSimilarity * 100).toFixed(1)}% (minimum 90% required).`);
  }

  // Explicit Entity Preservation
  for (const entity of model.explicitEntities) {
    const normalized = entity.toLowerCase();
    const isPresent =
      lower.includes(normalized) ||
      (normalized === 'united states' && (lower.includes('us') || lower.includes('u.s.'))) ||
      (normalized === 'node.js' && (lower.includes('nodejs') || lower.includes('node.js') || lower.includes('node')));

    if (!isPresent) {
      violations.push(`Failed to preserve explicit entity: "${entity}"`);
    }
  }

  // Zero Questions to User
  if (/\b(please tell me|can you provide|what is your (budget|product|company)|before we begin, answer)\b/i.test(prompt)) {
    violations.push('Prompt attempts to interrogate or ask questions to the user.');
  }

  return {
    isValid: violations.length === 0,
    violations,
    intentSimilarity,
    hasScopeExpansion,
    prestigeTermsFound,
  };
}
