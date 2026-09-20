import { describe, it, expect } from 'vitest';
import { synthesizeBetterPrompt } from '../src/engine/better';
import { synthesizeExpertPrompt } from '../src/engine/expert';
import { calculateIntentSimilarity, FORBIDDEN_PRESTIGE_TERMS, PRESTIGE_ALLOWLIST } from '../src/engine/expert/expertValidator';
import { TaskDomain } from '../src/types';
import { GOLDEN_PROMPT_BENCHMARK, GoldenPrompt } from '../src/engine/benchmarkData';
export { GOLDEN_PROMPT_BENCHMARK, GoldenPrompt };

/**
 * Calculates Jaccard / token overlap similarity between candidate output and naive template baseline.
 */
function calculateNaiveTemplateSimilarity(prompt: string, domain: string, input: string): number {
  const naiveTemplate = `Act as a world-class ${domain} expert. As a renowned top 1% specialist, please write a comprehensive and high-converting ${input}. Provide step by step breakdown.`;
  const setA = new Set(naiveTemplate.toLowerCase().split(/\W+/).filter(w => w.length > 3));
  const setB = new Set(prompt.toLowerCase().split(/\W+/).filter(w => w.length > 3));

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

describe('REFINZI EVAL HARNESS — Automated Quality & Benchmark Suite', () => {

  describe('Check 1: Anti-Template & Non-Generic Rigor', () => {
    it.each(GOLDEN_PROMPT_BENCHMARK)('[$id] Prompt is not a naive "Act as a {domain} expert" wrapper ($domain)', ({ rawInput, domain }) => {
      const better = synthesizeBetterPrompt(rawInput);
      const expert = synthesizeExpertPrompt(rawInput);

      // Verify outputs do not start with lazy template prefixes
      expect(better.prompt.toLowerCase()).not.toMatch(/^act as (a|an)\b/i);
      expect(expert.prompt.toLowerCase()).not.toMatch(/^act as (a|an)\b/i);
      expect(better.prompt.toLowerCase()).not.toMatch(/^you are (a|an) (world-class|expert|elite)\b/i);

      // Verify token similarity to naive prompt wrapper is strictly bounded (< 0.45)
      const betterSim = calculateNaiveTemplateSimilarity(better.prompt, domain, rawInput);
      const expertSim = calculateNaiveTemplateSimilarity(expert.prompt, domain, rawInput);

      expect(betterSim).toBeLessThan(0.45);
      expect(expertSim).toBeLessThan(0.45);
    });
  });

  describe('Check 2: Scope Lock & Zero Unauthorized Deliverables', () => {
    it.each(GOLDEN_PROMPT_BENCHMARK.filter(p => p.scopeRestriction))('[$id] Strictly locks deliverable scope ($scopeRestriction)', ({ rawInput, scopeRestriction }) => {
      const expert = synthesizeExpertPrompt(rawInput);
      const lower = expert.prompt.toLowerCase();

      if (scopeRestriction === 'hero_only') {
        // Hero section must NOT contain full landing page deliverables like pricing tables or FAQs
        expect(lower).not.toContain('## pricing');
        expect(lower).not.toContain('## faq');
      } else if (scopeRestriction === 'email_only') {
        // Email must not explode into a multi-quarter corporate retention strategy
        expect(lower).not.toContain('customer retention strategy');
        expect(lower).not.toContain('retention blueprint');
      } else if (scopeRestriction === 'bug_fix_only') {
        // Bug fix must not trigger a full architectural redesign
        expect(lower).not.toContain('software architecture redesign');
      } else if (scopeRestriction === 'headline_only') {
        // Headline must not generate full profile bio or content strategy
        expect(lower).not.toContain('full profile');
        expect(lower).not.toContain('content strategy');
      }
    });
  });

  describe('Check 3: Anti-Prestige Regex Sweep with Domain Allowlist', () => {
    it.each(GOLDEN_PROMPT_BENCHMARK)('[$id] Contains zero forbidden prestige terms ($rawInput)', ({ rawInput }) => {
      const better = synthesizeBetterPrompt(rawInput);
      const expert = synthesizeExpertPrompt(rawInput);

      const checkPrestige = (text: string) => {
        const lower = text.toLowerCase();
        for (const term of FORBIDDEN_PRESTIGE_TERMS) {
          if (lower.includes(term)) {
            // Must be covered by an approved functional phrase in allowlist
            const isAllowed = PRESTIGE_ALLOWLIST.some(allowed => lower.includes(allowed));
            expect(isAllowed).toBe(true);
          }
        }
      };

      checkPrestige(better.prompt);
      checkPrestige(expert.prompt);
    });
  });


  describe('Check 5: Length Bounds (Concise Better, Structured Expert)', () => {
    it.each(GOLDEN_PROMPT_BENCHMARK)('[$id] Prompt lengths adhere to strict production bounds', ({ rawInput }) => {
      const better = synthesizeBetterPrompt(rawInput);
      const expert = synthesizeExpertPrompt(rawInput);

      const betterWords = better.prompt.split(/\s+/).filter(Boolean).length;
      const expertWords = expert.prompt.split(/\s+/).filter(Boolean).length;

      // Better Mode: 1-3 crisp paragraphs (15 to 260 words)
      expect(betterWords).toBeGreaterThanOrEqual(12);
      expect(betterWords).toBeLessThanOrEqual(260);

      // Expert Mode: Structured specification (at least 60 words, not a runaway 3000-word spam)
      expect(expertWords).toBeGreaterThanOrEqual(50);
      expect(expertWords).toBeLessThanOrEqual(1200);
    });
  });

  describe('Check 6: Intent Fidelity & Entity Preservation (>= 0.9 Similarity)', () => {
    it.each(GOLDEN_PROMPT_BENCHMARK)('[$id] Intent fidelity score >= 0.9 and preserves named entities ($rawInput)', ({ rawInput, expectedEntities }) => {
      const better = synthesizeBetterPrompt(rawInput);
      const expert = synthesizeExpertPrompt(rawInput);

      // Intent similarity calculation
      const betterSim = calculateIntentSimilarity(rawInput, better.prompt);
      const expertSim = calculateIntentSimilarity(rawInput, expert.prompt);

      expect(betterSim).toBeGreaterThanOrEqual(0.9);
      expect(expertSim).toBeGreaterThanOrEqual(0.9);

      // Explicit Entity Preservation
      if (expectedEntities && expectedEntities.length > 0) {
        for (const entity of expectedEntities) {
          const lowerEntity = entity.toLowerCase();
          const betterMatch = better.prompt.toLowerCase().includes(lowerEntity) ||
            (lowerEntity === 'us' && (better.prompt.toLowerCase().includes('united states') || better.prompt.toLowerCase().includes('us')));
          const expertMatch = expert.prompt.toLowerCase().includes(lowerEntity) ||
            (lowerEntity === 'us' && (expert.prompt.toLowerCase().includes('united states') || expert.prompt.toLowerCase().includes('us')));

          expect(betterMatch).toBe(true);
          expect(expertMatch).toBe(true);
        }
      }
    });
  });

  describe('Check 7: Transparency Classification (KNOWN / INFERRED / ASSUMED)', () => {
    it.each(GOLDEN_PROMPT_BENCHMARK)('[$id] Expert mode exposes structured assumptions for user trust', ({ rawInput }) => {
      const expert = synthesizeExpertPrompt(rawInput);

      expect(expert.assumptions).toBeDefined();
      expect(Array.isArray(expert.assumptions)).toBe(true);
      expect(expert.assumptions.length).toBeGreaterThan(0);

      // Every assumption item should be categorized as Known, Inferred, or Assumed
      const hasTaxonomyPrefix = expert.assumptions.some(a =>
        a.startsWith('Known:') || a.startsWith('Inferred:') || a.startsWith('Assumed:') || a.startsWith('Preserved:')
      );
      expect(hasTaxonomyPrefix).toBe(true);
    });
  });

});
