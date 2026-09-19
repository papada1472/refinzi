/**
 * REFINZI — Expert Prompt Builder
 * 
 * Constructs task-grounded execution specifications strictly adhering to:
 * - Scope Fidelity: stay strictly inside what the user asked to produce
 * - Never silently expand hero -> landing page, email -> strategy, bug fix -> redesign
 * - Result quality over prompt length (no prestige fluff, no universal boilerplate)
 * - Anti-hallucination: explicit negative constraints preventing invented facts
 * - Zero questions asked to the user
 */

import { ExpertTaskModel } from './expertAnalyzer';

export function constructExpertPrompt(model: ExpertTaskModel): string {
  // 1. Minimum Sufficient Expert: If prompt is already comprehensive, preserve specifications
  if (model.isAlreadyDetailed) {
    return buildDetailedTaskSpecification(model);
  }

  // 2. Scope-grounded construction
  switch (model.scope) {
    case 'hero_section':
      return buildHeroSectionPrompt(model);

    case 'headline_only':
      return buildHeadlinePrompt(model);

    case 'single_email':
      return buildEmailPrompt(model);

    case 'bug_fix':
      return buildBugFixPrompt(model);

    case 'gtm_strategy':
      return buildGtmStrategyPrompt(model);

    case 'competitive_analysis':
      return buildCompetitiveAnalysisPrompt(model);

    case 'metric_diagnostic':
      return buildMetricDiagnosticPrompt(model);

    case 'single_image':
      return buildCinematicImagePrompt(model);

    case 'full_landing_page':
      return buildFullLandingPagePrompt(model);

    case 'code_module':
      return buildCodeModulePrompt(model);

    case 'social_post':
      return buildSocialPostPrompt(model);

    case 'research_analysis':
      return buildResearchAnalysisPrompt(model);

    default:
      return buildCustomExpertPrompt(model);
  }
}

/**
 * 1. GTM / Market Entry Strategy (Section 6)
 * Addresses: US market entry, expansion, launch.
 * Zero prestige roles, zero discerning buyers, zero invented budgets.
 */
function buildGtmStrategyPrompt(model: ExpertTaskModel): string {
  const geoTerm = model.geography === 'US' ? 'the US' : (model.geography ? `the ${model.geography}` : 'the target');
  const marketOpportunityPrefix = model.geography === 'US' ? 'US market' : (model.geography ? `${model.geography} market` : 'Market');

  return [
    `Develop a comprehensive go-to-market strategy for entering ${geoTerm} market.`,
    ``,
    `Cover:`,
    `- ${marketOpportunityPrefix} opportunity and priority customer segments`,
    `- ideal customer profile and beachhead segment`,
    `- competitive landscape and differentiation`,
    `- recommended market-entry strategy`,
    `- positioning and value proposition`,
    `- pricing and packaging considerations`,
    `- sales, acquisition and distribution channels`,
    `- partnership opportunities`,
    `- localization and operational requirements`,
    `- relevant regulatory considerations`,
    `- 90-day execution plan and expansion milestones`,
    `- resource and budget assumptions`,
    `- KPIs and decision gates`,
    `- major risks and mitigation strategies`,
    ``,
    `Prioritize the highest-leverage actions and explain the reasoning behind major strategic choices. Where company, product, customer, pricing, or financial information is unavailable, state reasonable assumptions explicitly rather than inventing facts. Proceed without asking for clarification.`
  ].join('\n');
}

/**
 * 2. Landing Page Hero Section (Section 7)
 * CRITICAL: Limited strictly to hero section. Never generates pricing, FAQ, testimonials, or full page.
 */
function buildHeroSectionPrompt(model: ExpertTaskModel): string {
  const subject = model.specificSubject || 'developer tool';

  return [
    `Write the hero section for a ${subject} landing page.`,
    ``,
    `Create:`,
    `- 3 strong headline options focused on the primary ${model.audience ? model.audience.toLowerCase().replace(/s$/, '') : 'developer'} outcome`,
    `- a concise supporting subheadline explaining what the product does and why it matters`,
    `- a clear primary CTA`,
    `- an optional secondary CTA where appropriate`,
    `- concise supporting proof points if available`,
    ``,
    `Keep the messaging specific to ${model.audience ? model.audience.toLowerCase() : 'developers'}, outcome-oriented, and technically credible. Do not invent product capabilities, customer results, integrations, or metrics. Keep the scope limited to the hero section.`
  ].join('\n');
}

/**
 * 3. Email Communication (Section 8)
 * Direct, empathetic, accountable. Never creates customer retention strategy or invented dates/refunds.
 */
function buildEmailPrompt(model: ExpertTaskModel): string {
  const lower = model.rawInput.toLowerCase();
  const isDelayedProject = lower.includes('delayed') || lower.includes('delay');

  if (isDelayedProject) {
    const subject = model.specificSubject || 'delayed project delivery';
    const cleanSubject = subject.startsWith('a ') ? subject : `a ${subject}`;
    return [
      `Draft a professional apology email to a client regarding ${cleanSubject}.`,
      ``,
      `Acknowledge the delay directly, take appropriate responsibility, briefly explain the situation without unnecessary excuses, communicate the current status or next step where information is available, and maintain a respectful, accountable tone.`,
      ``,
      `Do not invent a reason for the delay, compensation, revised dates, refunds, credits, or corrective actions that were not provided.`
    ].join('\n');
  }

  // General customer apology/communication
  const recipient = model.audience || 'customer';
  return [
    `Draft a professional apology email to a ${recipient.toLowerCase()} regarding: ${model.specificSubject || 'the reported issue'}.`,
    ``,
    `Structure the communication with:`,
    `1. Tone & Calibration: Direct, respectful, accountable, and empathetic—avoid defensive phrasing or corporate jargon.`,
    `2. Problem Acknowledgment: Clearly acknowledge the issue and validate the recipient's inconvenience.`,
    `3. Transparent Explanation: Provide a brief explanation without unnecessary excuses.`,
    `4. Concrete Resolution & Next Steps: Communicate the current status and immediate resolution where information is available.`,
    ``,
    `Do not invent reasons, dates, refunds, credits, or unrequested commitments not provided in the request.`
  ].join('\n');
}

/**
 * 4. Bug Fix / Memory Leak (Section 9)
 * Surgical diagnosis and minimal production-safe code change. No architectural redesign.
 */
function buildBugFixPrompt(model: ExpertTaskModel): string {
  const lower = model.rawInput.toLowerCase();
  const isStreamOrMemoryLeak = lower.includes('stream') || lower.includes('memory leak');

  if (isStreamOrMemoryLeak) {
    let subject = model.specificSubject || 'memory leak in Node.js stream pipeline';
    subject = subject
      .replace(/\bnodejs\b/gi, 'Node.js')
      .replace(/\bin Node\.js\b/i, 'in the Node.js')
      .replace(/^the\s+/i, '');

    return [
      `Diagnose and fix the ${subject}.`,
      ``,
      `Identify likely lifecycle, buffering, backpressure, event-listener, resource-management, or stream-handling causes based on the available code/context. Provide the minimal production-safe code change required, explain the root cause, and include a regression test or verification procedure.`,
      ``,
      `Do not introduce unrelated architectural changes.`
    ].join('\n');
  }

  // General bug fix (e.g. React login bug)
  const subject = model.specificSubject || 'the reported bug';
  return [
    `Diagnose the root cause and provide a surgical fix for: ${subject}.`,
    ``,
    `Structure your solution with:`,
    `1. Root Cause Analysis: Systematically trace why the issue occurs without speculation.`,
    `2. Surgical Code Fix: Provide clean, minimal code resolving the bug without unnecessary dependencies.`,
    `3. Defensive Edge-Case Guards: Handle boundary states, null checks, and error paths.`,
    `4. Verification & Testing: Provide an automated test case or exact reproduction procedure.`,
    ``,
    `Do not introduce unrelated architectural changes.`
  ].join('\n');
}

/**
 * 5. Cinematic / Visual Image Generation (Section 18, Case 5)
 * 35mm optical framing, lighting, composition, texture.
 */
function buildCinematicImagePrompt(model: ExpertTaskModel): string {
  const subject = model.specificSubject || 'Ferrari';
  const geoClause = model.geography ? ` in ${model.geography}` : '';
  const timeClause = model.timeframe ? ` ${model.timeframe}` : '';

  const lightingText = model.geography
    ? `${model.geography} night neon reflections, rain-slicked asphalt reflections, deep rich contrast with preserved shadow detail.`
    : 'Naturalistic cinematic lighting, vibrant atmospheric reflections on surrounding surfaces, deep rich contrast with preserved shadow detail.';

  return [
    `Cinematic, atmospheric 35mm photograph of ${subject}${geoClause}${timeClause}.`,
    ``,
    `Visual specifications:`,
    `- Camera & Optics: Shot on 35mm anamorphic lens, shallow depth of field with natural optical bokeh, crisp focal plane on the primary subject.`,
    `- Lighting & Ambiance: ${lightingText}`,
    `- Composition & Perspective: Low-angle dynamic framing emphasizing automotive lines and urban backdrop with depth layers.`,
    `- Texture & Environment: Authentic environmental textures, subtle film grain, zero artificial CG plastic sheen.`,
    `- Color Grade: Moody cinematic color grade with balanced atmospheric saturation.`
  ].join('\n');
}

/**
 * 6. Short Headline (Section 18, Case 6)
 * Limited strictly to 2 lines. Does not write bio or profile.
 */
function buildHeadlinePrompt(model: ExpertTaskModel): string {
  const role = model.audience || model.specificSubject || 'CTO';

  return [
    `Write 2-line LinkedIn headline options for a ${role}.`,
    ``,
    `Provide options that:`,
    `- clearly communicate technical leadership, architectural scale, and business impact within a strict 2-line constraint`,
    `- balance strategic vision with hands-on credibility`,
    `- stand out without buzzwords, hyperbole, or self-aggrandizing claims`,
    ``,
    `Keep the scope limited strictly to the 2-line headline. Do not write an entire profile summary, bio, or content strategy. Do not invent specific company names, metrics, or technologies not provided.`
  ].join('\n');
}

/**
 * 7. Competitive Research (Section 18, Case 7)
 * Scope and geography grounded. Distinguishes verified data from inferences.
 */
function buildCompetitiveAnalysisPrompt(model: ExpertTaskModel): string {
  const subject = model.specificSubject || 'Notion';
  const geoClause = model.geography ? ` in ${model.geography}` : '';
  const marketName = model.geography === 'India' ? 'the Indian market' : (model.geography ? `the ${model.geography} market` : 'the market');

  return [
    `Conduct an in-depth competitive analysis of alternatives and competitors to ${subject}${geoClause}.`,
    ``,
    `Cover:`,
    `- Competitor Identification & Taxonomy: direct and indirect workspace, productivity, and note-taking competitors active in ${marketName}`,
    `- Feature & Capability Matrix: feature parity, collaboration capabilities, and performance considerations`,
    `- Pricing & Packaging Structure: pricing, regional packaging, and local currency (INR) affordability comparisons across tiers`,
    `- Regional Dynamics & Distribution Moats: adoption dynamics across local tech startups, SMBs, enterprises, and educational institutions`,
    `- Strategic Gaps & Differentiation: localized integrations, offline accessibility, user frustrations, and market opportunities`,
    ``,
    `Ground the analysis in realistic market dynamics, distinguishing verified competitor data from market inferences. Do not invent non-existent startups or unverified pricing data.`
  ].join('\n');
}

/**
 * 8. Business Analytics & Diagnostic (Section 18, Case 8)
 * Decomposes metric into underlying drivers. No invented revenue/dollar figures.
 */
function buildMetricDiagnosticPrompt(model: ExpertTaskModel): string {
  const subject = model.specificSubject || 'Customer Acquisition Cost (CAC) increase';

  return [
    `Perform a structured diagnostic analysis investigating: ${subject}.`,
    ``,
    `Structure the diagnostic as follows:`,
    `- Metric Decomposition: Deconstruct the metric into underlying mathematical drivers (channel spend, conversion rates across funnel stages, paid vs organic mix, CPM and CPC inflation).`,
    `- Root-Cause Hypothesis Tree: Evaluate acquisition channels (audience saturation, ad fatigue), funnel & UX friction, and attribution and tracking changes.`,
    `- Diagnostic Data Audit: Outline the diagnostic data cuts, cohort analyses, and SQL queries needed to isolate the root cause.`,
    `- Corrective Action Plan: Prioritize immediate tactical checks (0-30 days) and structural remediation actions (30-90 days).`,
    ``,
    `Where specific company, financial, or conversion metrics are unstated, declare reasonable baseline assumptions rather than inventing business facts.`
  ].join('\n');
}

/**
 * 9. Full Landing Page (Only if full page explicitly requested, not hero)
 */
function buildFullLandingPagePrompt(model: ExpertTaskModel): string {
  const subject = model.specificSubject || 'the product';

  return [
    `Design the page layout and write complete section copy for a ${subject} landing page.`,
    ``,
    `Cover:`,
    `- Hero Section: Primary headline, supporting value proposition, clear primary and secondary CTAs, and above-the-fold trust signals.`,
    `- Problem & Pain Points: Concrete customer pain points framed around cost, wasted time, or friction.`,
    `- Core Solution & Feature-to-Benefit Breakdown: Translate core capabilities into tangible business outcomes.`,
    `- Social Proof & Credibility Architecture: Framework for customer testimonials and proof points.`,
    `- Pricing & Tier Structure: Clear tier breakdown with feature differentiation.`,
    `- Objection Handling & FAQ: Address critical pre-purchase objections.`,
    ``,
    `Keep copy concise, credible, and outcome-oriented. Do not invent specific customer case studies or unprovided metrics.`
  ].join('\n');
}

/**
 * 10. Code Engineering Module
 */
function buildCodeModulePrompt(model: ExpertTaskModel): string {
  const subject = model.specificSubject || 'the module';

  return [
    `Implement a production-grade, modular solution for: ${subject}.`,
    ``,
    `Engineering Requirements:`,
    `- Clean Interfaces: Define clear module boundaries and complete type definitions.`,
    `- Implementation: Provide fully working code with error handling and zero placeholder comments.`,
    `- Defensive Guards: Handle null states, boundary conditions, and timeouts gracefully.`,
    `- Verification: Include unit test specifications verifying core functionality.`,
    ``,
    `Do not introduce unrelated architectural redesigns or unrequested dependencies.`
  ].join('\n');
}

/**
 * 11. Social Post (Full post on specific topic)
 */
function buildSocialPostPrompt(model: ExpertTaskModel): string {
  const subject = model.specificSubject || model.rawInput;

  return [
    `Write a high-impact, insight-driven post on: ${subject}.`,
    ``,
    `Requirements:`,
    `- Strong Hook: Open with a compelling insight in the first 2 lines without cheap clickbait.`,
    `- Concrete Insight: Deliver practical, actionable perspectives with clean paragraph breaks.`,
    `- Practical Takeaway: Provide a clear conclusion readers can apply immediately.`,
    `- Natural Engagement: Conclude with a thoughtful discussion prompt.`,
    ``,
    `Stay focused on this specific topic. Do not expand into a broad content strategy.`
  ].join('\n');
}

/**
 * 12. Research Analysis
 */
function buildResearchAnalysisPrompt(model: ExpertTaskModel): string {
  const subject = model.specificSubject || model.rawInput;

  return [
    `Conduct an evidence-grounded research analysis of: ${subject}.`,
    ``,
    `Structure:`,
    `- Executive synthesis and key findings`,
    `- Current landscape, key technologies, and operating models`,
    `- Comparative evaluation of trade-offs and limitations`,
    `- Critical conclusions distinguishing verified facts from market inferences`,
    ``,
    `Do not invent unsupported statistics or speculate without declaring assumptions.`
  ].join('\n');
}

/**
 * 13. Custom / General Expert
 */
function buildCustomExpertPrompt(model: ExpertTaskModel): string {
  return [
    `Execute the following task with senior practitioner depth and structural rigor:`,
    `"${model.rawInput}"`,
    ``,
    `Execution Directives:`,
    `- Address core requirements systematically without changing the requested scope.`,
    `- Produce a complete, usable deliverable without placeholders.`,
    `- Declare reasonable baseline assumptions explicitly where specific details are omitted.`,
    `- Avoid invented facts, buzzwords, or unrelated deliverables.`
  ].join('\n');
}

/**
 * 14. Minimum Sufficient Expert for Already-Detailed Prompts
 * Preserves the user's prompt as the primary directive and appends only execution rigor.
 */
function buildDetailedTaskSpecification(model: ExpertTaskModel): string {
  const constraintsText = model.constraints.length > 0 
    ? `Ground recommendations strictly in the stated constraints (${model.constraints.join(', ')}).`
    : 'Ground all recommendations in the user-specified scope and parameters.';

  return [
    model.rawInput,
    ``,
    `Execution Rigor & Deliverable Format:`,
    `- ${constraintsText}`,
    `- Distinguish verified market data from baseline projections.`,
    `- Present comparative frameworks and milestones with structured, decision-ready clarity without repeating or expanding beyond the requested scope.`
  ].join('\n');
}
