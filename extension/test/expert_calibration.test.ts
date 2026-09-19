import { describe, it, expect } from 'vitest';
import { synthesizeExpertPrompt } from '../src/engine/expert';
import { analyzeExpertTask } from '../src/engine/expert/expertAnalyzer';
import { validateExpertPrompt } from '../src/engine/expert/expertValidator';

describe('REFINZI Expert Mode — Semantic Task Reconstruction & Anti-Generic Regression Suite', () => {
  // -------------------------------------------------------------
  // TEST 1: GTM to enter in US market
  // -------------------------------------------------------------
  it('Test 1: "GTM to enter in US market" -> US market-entry GTM strategy, NOT copywriter template', () => {
    const input = 'GTM to enter in US market';
    const result = synthesizeExpertPrompt(input, 'chatgpt');

    expect(result.mode).toBe('expert');

    // Expected: US market-entry / GTM strategy
    expect(result.prompt).toMatch(/\b(go-to-market|market-entry|market entry)\b/i);
    expect(result.prompt).toMatch(/\b(united states|the us)\b/i);
    expect(result.prompt).toContain('ideal customer profile and beachhead segment');
    expect(result.prompt).toContain('positioning and value proposition');
    expect(result.prompt).toContain('competitive landscape and differentiation');
    expect(result.prompt).toContain('sales, acquisition and distribution channels');
    expect(result.prompt).toContain('90-day execution plan and expansion milestones');
    expect(result.prompt).toContain('KPIs and decision gates');
    expect(result.prompt).toContain('major risks and mitigation strategies');

    // Must NOT contain:
    expect(result.prompt).not.toContain('direct-response copywriter');
    expect(result.prompt).not.toContain('discerning buyers');
    expect(result.prompt).not.toContain('high-converting copy');
    expect(result.prompt).not.toMatch(/\b(world-class|elite|renowned|top 1%|guru|expert architect)\b/i);

    // Must NOT contain metadata clutter
    expect(result.prompt).not.toContain('- Target Domain:');
    expect(result.prompt).not.toContain('- Target Environment:');
    expect(result.prompt).not.toContain('- Audience Standard:');

    // Never asks questions:
    expect(result.prompt).not.toMatch(/\b(please answer|what is your)\b/i);

    // Declares defensible baseline assumptions without inventing fake facts
    expect(result.prompt).toContain('Where company, product, customer, pricing, or financial information is unavailable');
  });

  // -------------------------------------------------------------
  // TEST 2: Landing page for AI accounting SaaS
  // -------------------------------------------------------------
  it('Test 2: "create landing page for AI accounting SaaS" -> SaaS/product/marketing dimensions', () => {
    const input = 'create landing page for AI accounting SaaS';
    const result = synthesizeExpertPrompt(input, 'chatgpt');

    expect(result.mode).toBe('expert');
    expect(result.prompt).toMatch(/landing page/i);
    expect(result.prompt).toMatch(/AI accounting SaaS/i);
    expect(result.prompt).toContain('Hero Section');
    expect(result.prompt).toContain('Problem & Pain Points');
    expect(result.prompt).toContain('Core Solution & Feature-to-Benefit Breakdown');
    expect(result.prompt).toContain('Pricing & Tier Structure');

    // No prestige junk
    expect(result.prompt).not.toMatch(/\b(world-class|guru|elite)\b/i);
  });

  // -------------------------------------------------------------
  // TEST 3: Fix this React login bug
  // -------------------------------------------------------------
  it('Test 3: "fix this React login bug" -> coding/debugging task', () => {
    const input = 'fix this React login bug';
    const result = synthesizeExpertPrompt(input, 'chatgpt');

    expect(result.mode).toBe('expert');
    expect(result.prompt).toMatch(/React login bug/i);
    expect(result.prompt).toContain('Root Cause Analysis');
    expect(result.prompt).toContain('Surgical Code Fix');
    expect(result.prompt).toContain('Defensive Edge-Case Guards');
    expect(result.prompt).toContain('Verification & Testing');

    // No marketing or copywriting templates
    expect(result.prompt).not.toContain('copywriter');
    expect(result.prompt).not.toContain('discerning buyers');
  });

  // -------------------------------------------------------------
  // TEST 4: Research competitors of Notion in India
  // -------------------------------------------------------------
  it('Test 4: "research competitors of Notion in India" -> competitive research with India scope', () => {
    const input = 'research competitors of Notion in India';
    const result = synthesizeExpertPrompt(input, 'perplexity');

    expect(result.mode).toBe('expert');
    expect(result.prompt).toMatch(/Notion in India/i);
    expect(result.prompt).toContain('Competitor Identification & Taxonomy');
    expect(result.prompt).toContain('Feature & Capability Matrix');
    expect(result.prompt).toContain('Pricing & Packaging Structure');
    expect(result.prompt).toContain('Regional Dynamics & Distribution Moats');
    expect(result.prompt).toContain('Strategic Gaps & Differentiation');

    // Preserves explicit entities: Notion and India
    expect(result.prompt).toContain('Notion');
    expect(result.prompt).toContain('India');
  });

  // -------------------------------------------------------------
  // TEST 5: Cinematic photo of a Ferrari in Tokyo at night
  // -------------------------------------------------------------
  it('Test 5: "make a cinematic photo of a Ferrari in Tokyo at night" -> image-generation calibration', () => {
    const input = 'make a cinematic photo of a Ferrari in Tokyo at night';
    const result = synthesizeExpertPrompt(input, 'midjourney');

    expect(result.mode).toBe('expert');
    expect(result.prompt).toMatch(/Ferrari in Tokyo.*at night/i);
    expect(result.prompt).toContain('35mm anamorphic');
    expect(result.prompt).toContain('Camera & Optics');
    expect(result.prompt).toContain('Lighting & Ambiance');
    expect(result.prompt).toContain('Composition');
    expect(result.prompt).toContain('Texture & Environment');

    // Preserves Ferrari and Tokyo
    expect(result.prompt).toContain('Ferrari');
    expect(result.prompt).toContain('Tokyo');
  });

  // -------------------------------------------------------------
  // TEST 6: Write an apology email to a customer
  // -------------------------------------------------------------
  it('Test 6: "write an apology email to a customer" -> email-writing task', () => {
    const input = 'write an apology email to a customer';
    const result = synthesizeExpertPrompt(input, 'claude');

    expect(result.mode).toBe('expert');
    expect(result.prompt).toMatch(/customer/i);
    expect(result.prompt).toContain('Tone & Calibration');
    expect(result.prompt).toContain('Problem Acknowledgment');
    expect(result.prompt).toContain('Transparent Explanation');
    expect(result.prompt).toContain('Concrete Resolution & Next Steps');

    // Does not turn into a generic software architecture specification
    expect(result.prompt).not.toContain('API endpoint');
    expect(result.prompt).not.toContain('database schema');
  });

  // -------------------------------------------------------------
  // TEST 7: Analyze why our CAC increased
  // -------------------------------------------------------------
  it('Test 7: "analyze why our CAC increased" -> business/analytics diagnosis', () => {
    const input = 'analyze why our CAC increased';
    const result = synthesizeExpertPrompt(input, 'chatgpt');

    expect(result.mode).toBe('expert');
    expect(result.prompt).toContain('Metric Decomposition');
    expect(result.prompt).toContain('Root-Cause Hypothesis Tree');
    expect(result.prompt).toContain('Diagnostic Data Audit');
    expect(result.prompt).toContain('Corrective Action Plan');
    expect(result.prompt).toContain('CAC');
  });

  // -------------------------------------------------------------
  // TEST 8: Already-good prompt (Minimum Sufficient Expert)
  // -------------------------------------------------------------
  it('Test 8: Already-good prompt -> minimal modification without generic explosion', () => {
    const detailedInput =
      'Analyze the US SaaS market for HR technology companies with 50-500 employees, compare the top 10 competitors, estimate pricing ranges, identify acquisition channels, and produce a 90-day entry plan.';

    const model = analyzeExpertTask(detailedInput);
    expect(model.isAlreadyDetailed).toBe(true);

    const result = synthesizeExpertPrompt(detailedInput, 'chatgpt');

    // Expected: Preserves the user's detailed specification verbatim
    expect(result.prompt).toContain(detailedInput);

    // Expected: Appends only high-value execution rigor
    expect(result.prompt).toContain('Execution Rigor & Deliverable Format:');

    // Must NOT explode into 500+ words of generic methodology
    const words = result.prompt.split(/\s+/).filter(Boolean).length;
    const inputWords = detailedInput.split(/\s+/).filter(Boolean).length;
    expect(words).toBeLessThan(inputWords * 3);

    // Preserves all explicit entities and constraints
    expect(result.prompt).toContain('50-500 employees');
    expect(result.prompt).toContain('top 10');
    expect(result.prompt).toContain('90-day');
  });

  // -------------------------------------------------------------
  // TEST 9: Quality & Anti-Generic Gate Enforcement
  // -------------------------------------------------------------
  it('Test 9: Quality Validator detects violations and rejects generic prestige templates', () => {
    const model = analyzeExpertTask('GTM to enter in US market');

    const badBoilerplatePrompt = `
# ROLE & PERSPECTIVE
You are acting as a World-Class Direct-Response Copywriter & Growth Architect.
# CORE OBJECTIVE
"GTM to enter in US market"
- Target Domain: MARKETING
- Target Environment: Calibrated for CHATGPT
- Audience Standard: Discerning buyers seeking immediate value
# METHODOLOGY & QUALITY REQUIREMENTS
- First-Principles Execution
- Defensive Edge-Case Coverage
`;

    const validation = validateExpertPrompt(badBoilerplatePrompt, model);
    expect(validation.isValid).toBe(false);
    expect(validation.violations.some((v) => v.includes('forbidden prestige term'))).toBe(true);
    expect(validation.violations.some((v) => v.includes('generic marketing boilerplate'))).toBe(true);
    expect(validation.violations.some((v) => v.includes('metadata clutter'))).toBe(true);
  });
});
