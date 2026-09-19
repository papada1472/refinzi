import { describe, it, expect } from 'vitest';
import { synthesizeExpertPrompt } from '../src/engine/expert';

describe('Refinzi Expert Prompt Engine — Deep Task Execution & Scope Fidelity', () => {
  // Case 1: GTM
  it('1. "GTM to enter in US market" — deep go-to-market strategy without prestige fluff or fake personas', () => {
    const raw = 'GTM to enter in US market';
    const result = synthesizeExpertPrompt(raw, 'claude');

    expect(result.mode).toBe('expert');
    expect(result.domain).toBe('business');
    expect(result.summary).toContain('United States');

    // Covers the core dimensions from Section 6
    expect(result.prompt).toContain('US market opportunity and priority customer segments');
    expect(result.prompt).toContain('ideal customer profile and beachhead segment');
    expect(result.prompt).toContain('competitive landscape and differentiation');
    expect(result.prompt).toContain('recommended market-entry strategy');
    expect(result.prompt).toContain('positioning and value proposition');
    expect(result.prompt).toContain('pricing and packaging considerations');
    expect(result.prompt).toContain('sales, acquisition and distribution channels');
    expect(result.prompt).toContain('90-day execution plan and expansion milestones');
    expect(result.prompt).toContain('KPIs and decision gates');
    expect(result.prompt).toContain('major risks and mitigation strategies');

    // Assumptions without inventing facts
    expect(result.prompt).toContain('Where company, product, customer, pricing, or financial information is unavailable');
    expect(result.prompt).toContain('Proceed without asking for clarification');

    // Zero prestige role inventions
    expect(result.prompt).not.toMatch(/world-class|direct-response copywriter|discerning buyers|guru|elite/i);
  });

  // Case 2: Landing Page Hero
  it('2. "write landing page hero for developer tool" — SCOPE FIDELITY: hero only, no pricing/FAQ/full page', () => {
    const raw = 'write landing page hero for developer tool';
    const result = synthesizeExpertPrompt(raw, 'chatgpt');

    expect(result.mode).toBe('expert');
    expect(result.domain).toBe('marketing');

    // Preserves hero section deliverable
    expect(result.prompt).toContain('Write the hero section for a developer tool landing page');
    expect(result.prompt).toContain('3 strong headline options focused on the primary developer outcome');
    expect(result.prompt).toContain('concise supporting subheadline explaining what the product does and why it matters');
    expect(result.prompt).toContain('clear primary CTA');
    expect(result.prompt).toContain('Keep the scope limited to the hero section');

    // CRITICAL SCOPE FIDELITY: Never silently expands hero -> full landing page
    expect(result.prompt.toLowerCase()).not.toContain('pricing');
    expect(result.prompt.toLowerCase()).not.toContain('faq');
    expect(result.prompt.toLowerCase()).not.toContain('testimonial');
    expect(result.prompt.toLowerCase()).not.toContain('guarantee');
    expect(result.prompt.toLowerCase()).not.toContain('full landing page');
    expect(result.prompt.toLowerCase()).not.toContain('acquisition strategy');
  });

  // Case 3: Email Apology
  it('3. "email to client apologizing for delayed project delivery" — SCOPE FIDELITY: single apology email, no retention strategy or invented credits', () => {
    const raw = 'email to client apologizing for delayed project delivery';
    const result = synthesizeExpertPrompt(raw, 'general');

    expect(result.mode).toBe('expert');
    expect(result.domain).toBe('writing');

    // Specific apology email draft
    expect(result.prompt).toContain('Draft a professional apology email to a client regarding a delayed project delivery');
    expect(result.prompt).toContain('Acknowledge the delay directly, take appropriate responsibility');
    expect(result.prompt).toContain('Do not invent a reason for the delay, compensation, revised dates, refunds, credits');

    // Never expands into retention strategy
    expect(result.prompt.toLowerCase()).not.toContain('customer-retention strategy');
    expect(result.prompt.toLowerCase()).not.toContain('retention strategy');
  });

  // Case 4: Coding Bug Fix
  it('4. "fix memory leak in nodejs stream pipeline" — SCOPE FIDELITY: minimal surgical fix, no architectural redesign', () => {
    const raw = 'fix memory leak in nodejs stream pipeline';
    const result = synthesizeExpertPrompt(raw, 'chatgpt');

    expect(result.mode).toBe('expert');
    expect(result.domain).toBe('code');

    // Surgical debugging directive
    expect(result.prompt).toContain('Diagnose and fix the memory leak in the Node.js stream pipeline');
    expect(result.prompt).toContain('Identify likely lifecycle, buffering, backpressure, event-listener, resource-management, or stream-handling causes');
    expect(result.prompt).toContain('Provide the minimal production-safe code change required');
    expect(result.prompt).toContain('regression test or verification procedure');
    expect(result.prompt).toContain('Do not introduce unrelated architectural changes');
  });

  // Case 5: Cinematic Image
  it('5. "make a cinematic photo of a Ferrari in Tokyo at night" — 35mm optical specifications without CG sheen', () => {
    const raw = 'make a cinematic photo of a Ferrari in Tokyo at night';
    const result = synthesizeExpertPrompt(raw, 'general');

    expect(result.mode).toBe('expert');
    expect(result.domain).toBe('image_gen');

    expect(result.prompt).toContain('Cinematic, atmospheric 35mm photograph of Ferrari in Tokyo at night');
    expect(result.prompt).toContain('35mm anamorphic lens');
    expect(result.prompt).toContain('shallow depth of field');
    expect(result.prompt).toContain('Tokyo night neon reflections');
    expect(result.prompt).toContain('zero artificial CG plastic sheen');
  });

  // Case 6: Short Headline
  it('6. "write a 2-line LinkedIn headline for a CTO" — SCOPE FIDELITY: strict 2-line limit, no bio or profile overhaul', () => {
    const raw = 'write a 2-line LinkedIn headline for a CTO';
    const result = synthesizeExpertPrompt(raw, 'linkedin');

    expect(result.mode).toBe('expert');
    expect(result.domain).toBe('marketing');

    expect(result.prompt).toContain('Write 2-line LinkedIn headline options for a CTO');
    expect(result.prompt).toContain('strict 2-line constraint');
    expect(result.prompt).toContain('Keep the scope limited strictly to the 2-line headline');
    expect(result.prompt).toContain('Do not write an entire profile summary, bio, or content strategy');
  });

  // Case 7: Competitive Research in India
  it('7. "research competitors of Notion in India" — localized competitive analysis distinguishing verified data', () => {
    const raw = 'research competitors of Notion in India';
    const result = synthesizeExpertPrompt(raw, 'perplexity');

    expect(result.mode).toBe('expert');
    expect(result.domain).toBe('research');

    expect(result.prompt).toContain('Conduct an in-depth competitive analysis of alternatives and competitors to Notion in India');
    expect(result.prompt).toContain('Indian market');
    expect(result.prompt).toContain('local currency (INR) affordability comparisons');
    expect(result.prompt).toContain('Ground the analysis in realistic market dynamics, distinguishing verified competitor data from market inferences');
  });

  // Case 8: Metric Diagnostic
  it('8. "analyze why our CAC increased" — mathematical driver decomposition without invented dollar amounts', () => {
    const raw = 'analyze why our CAC increased';
    const result = synthesizeExpertPrompt(raw, 'general');

    expect(result.mode).toBe('expert');
    expect(result.domain).toBe('business');

    expect(result.prompt).toContain('Deconstruct the metric into underlying mathematical drivers');
    expect(result.prompt).toContain('channel spend, conversion rates across funnel stages');
    expect(result.prompt).toContain('audience saturation, ad fatigue');
    expect(result.prompt).toContain('attribution and tracking changes');
    expect(result.prompt).toContain('SQL queries needed to isolate the root cause');
    expect(result.prompt).toContain('declare reasonable baseline assumptions rather than inventing business facts');
  });

  // Case 9: Already-detailed GTM prompt
  it('9. Already detailed GTM prompt — MINIMUM SUFFICIENT EXPERT: minimal changes, preserves user specifications', () => {
    const raw = 'Develop a comprehensive go-to-market strategy for our B2B HR tech platform entering the US market. Target audience: mid-market companies with 50-500 employees. Focus: CFOs and People Ops leaders. Execution timeframe: 90-day phased rollout with a $50k pilot budget.';
    const result = synthesizeExpertPrompt(raw, 'claude');

    expect(result.mode).toBe('expert');
    expect(result.summary).toContain('Calibrated execution rigor');

    // Preserves the user's detailed specification directly
    expect(result.prompt).toContain('50-500 employees');
    expect(result.prompt).toContain('$50k pilot budget');
    expect(result.prompt).toContain('CFOs and People Ops leaders');
    expect(result.prompt).toContain('90-day phased rollout');

    // Adds only structured execution rigor guidelines
    expect(result.prompt).toContain('Ground recommendations strictly in the stated constraints');
    expect(result.prompt).toContain('Distinguish verified market data from baseline projections');

    // Does not bloat with generic category frameworks
    expect(result.prompt.length).toBeLessThan(raw.length + 550);
  });

  // Rule: Anti-Generic Validation (Different tasks in same domain must not produce same template)
  it('enforces Anti-Generic validation: hero section task does NOT share framework with GTM strategy', () => {
    const heroResult = synthesizeExpertPrompt('write landing page hero for developer tool');
    const gtmResult = synthesizeExpertPrompt('GTM to enter in US market');

    expect(heroResult.prompt).not.toBe(gtmResult.prompt);
    expect(heroResult.prompt).toContain('headline');
    expect(heroResult.prompt).not.toContain('GTM');
    expect(gtmResult.prompt).toContain('go-to-market');
    expect(gtmResult.prompt).not.toContain('headline');
  });

  // Rule: Zero Questions
  it('NEVER asks the user clarification questions across any task', () => {
    const queries = [
      'GTM to enter in US market',
      'write landing page hero for developer tool',
      'fix memory leak in nodejs stream pipeline',
      'research competitors of Notion in India',
    ];

    for (const q of queries) {
      const result = synthesizeExpertPrompt(q);
      expect(result.prompt).not.toMatch(/\b(please answer|what is your (budget|product|company)|before we begin, answer)\b/i);
      expect((result as any).questions).toBeUndefined();
    }
  });

  // Rule: Zero Prestige Fluff
  it('contains ZERO prestige fluff across all outputs', () => {
    const queries = [
      'GTM to enter in US market',
      'write landing page hero for developer tool',
      'email to client apologizing for delayed project delivery',
      'make a cinematic photo of a Ferrari in Tokyo at night',
    ];

    for (const q of queries) {
      const result = synthesizeExpertPrompt(q);
      expect(result.prompt).not.toMatch(/\b(world-class|elite|renowned|top 1%|guru|expert architect)\b/i);
    }
  });
});
