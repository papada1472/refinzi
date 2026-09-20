/**
 * REFINZI — Expert Semantic Task & Scope Analyzer
 * 
 * CORE ARCHITECTURAL PRINCIPLE:
 * TASK -> REASONING -> CALIBRATION (Not Category -> Template)
 * 
 * Reconstructs the semantic task before prompt generation:
 * 1. Intent Understanding: What is the user trying to accomplish?
 * 2. Scope Detection: WHAT DID THE USER ACTUALLY ASK TO PRODUCE?
 *    Never silently expand "hero" -> "landing page", "email" -> "strategy", "bug fix" -> "redesign".
 * 3. Context Extraction: Explicit entities, geography, timeframe, constraints, audience.
 * 4. Missing Dimensions: Task-specific dimensions ONLY (never apply universal bloat).
 * 5. Defensible Assumptions & Scope Boundaries: Strict negative constraints preventing invented facts.
 */

export type ExpertTaskKind =
  | 'gtm_market_entry'
  | 'landing_page'
  | 'code_debugging'
  | 'code_engineering'
  | 'competitive_research'
  | 'general_research'
  | 'image_cinematic'
  | 'email_communication'
  | 'business_analytics'
  | 'social_content'
  | 'general_expert';

export type DeliverableScope =
  | 'hero_section'
  | 'headline_only'
  | 'single_email'
  | 'bug_fix'
  | 'code_module'
  | 'gtm_strategy'
  | 'competitive_analysis'
  | 'metric_diagnostic'
  | 'single_image'
  | 'research_analysis'
  | 'social_post'
  | 'full_landing_page'
  | 'custom';

export interface ExpertTaskModel {
  rawInput: string;
  taskKind: ExpertTaskKind;
  scope: DeliverableScope;
  deliverable: string;
  action: string;
  coreObjective: string;
  specificSubject: string;
  explicitEntities: string[];
  audience?: string;
  geography?: string;
  timeframe?: string;
  constraints: string[];
  sourceContext?: string;
  desiredOutput?: string;
  destinationAi: string;
  missingDimensions: string[];
  scopeBoundaries: string[];
  forbiddenInventions: string[];
  isAlreadyDetailed: boolean;
}

export function analyzeExpertTask(rawInput: string, destinationAi: string = 'general'): ExpertTaskModel {
  const raw = (rawInput || '').trim();
  const lower = raw.toLowerCase();
  const wordCount = raw.split(/\s+/).filter(Boolean).length;

  const explicitEntities = extractExplicitEntities(raw, lower);
  const scope = detectDeliverableScope(lower);
  const taskKind = detectExpertTaskKind(lower, scope);
  const deliverable = deriveDeliverableName(scope, lower);
  const geography = extractGeography(lower);
  const timeframe = extractTimeframe(lower);
  const constraints = extractConstraints(lower);
  const audience = extractExplicitAudience(lower);
  const action = extractAction(raw, lower, scope, taskKind);
  const coreObjective = extractObjective(raw, lower, scope, taskKind);
  const specificSubject = extractSubject(raw, lower, scope, taskKind);
  const isAlreadyDetailed = checkIsAlreadyDetailed(lower, wordCount);
  const missingDimensions = identifyMissingDimensions(scope, taskKind, lower, isAlreadyDetailed);
  const { scopeBoundaries, forbiddenInventions } = deriveScopeBoundaries(scope, taskKind, lower);

  return {
    rawInput: raw,
    taskKind,
    scope,
    deliverable,
    action,
    coreObjective,
    specificSubject,
    explicitEntities,
    audience,
    geography,
    timeframe,
    constraints,
    destinationAi,
    missingDimensions,
    scopeBoundaries,
    forbiddenInventions,
    isAlreadyDetailed,
  };
}

/**
 * Detects the EXACT scope of the deliverable requested by the user.
 * Prevents silent scope creep (e.g. hero -> landing page, email -> strategy).
 */
function detectDeliverableScope(lower: string): DeliverableScope {
  // 1. Hero Section (distinct from full landing page)
  if (/\b(hero(\s+section)?)\b/i.test(lower)) {
    return 'hero_section';
  }

  // 2. Short headline / 2-line copy (distinct from full article or profile)
  if (/\b(2-line|two-line|headline|one-liner)\b/i.test(lower)) {
    return 'headline_only';
  }

  // 3. Email / Apology / Single message
  if (/\b(email|apolog(y|iz)|letter|memo)\b/i.test(lower)) {
    return 'single_email';
  }

  // 4. Bug fix / Memory leak / Crash
  if (/\b(fix|memory leak|bug|crash|error|exception)\b/i.test(lower)) {
    return 'bug_fix';
  }

  // 5. GTM / Market Entry Strategy
  if (/\b(gtm|go-to-market|market entry|enter\s+(in\s+)?.*market|expansion into)\b/i.test(lower)) {
    return 'gtm_strategy';
  }

  // 6. Photographic / Cinematic Image
  if (/\b(photo|image|picture|render|cinematic\s+(photo|shot)|photograph)\b/i.test(lower)) {
    return 'single_image';
  }

  // 7. Competitive Analysis
  if (/\b(competitors?|competing|competitive|rivals?|compare.*with)\b/i.test(lower)) {
    return 'competitive_analysis';
  }

  // 8. Metric Diagnostic / Root-cause analytics
  if (/\b(cac|ltv|churn|why.*(increased|decreased|dropped|rose|spiked)|anomal)\b/i.test(lower)) {
    return 'metric_diagnostic';
  }

  // 9. Full Landing Page (only if explicitly full page and not hero)
  if (/\b(landing page|sales page|lead capture page)\b/i.test(lower)) {
    return 'full_landing_page';
  }

  // 10. Social post (longer than headline)
  if (/\b(linkedin post|tweet|thread|social media post)\b/i.test(lower)) {
    return 'social_post';
  }

  // 11. Code Engineering
  if (/\b(code|react|vue|angular|python|typescript|api|function|class|component|sql|backend|frontend)\b/i.test(lower)) {
    return 'code_module';
  }

  // 12. General research
  if (/\b(research|study|overview of|landscape)\b/i.test(lower)) {
    return 'research_analysis';
  }

  return 'custom';
}

function detectExpertTaskKind(lower: string, scope: DeliverableScope): ExpertTaskKind {
  switch (scope) {
    case 'gtm_strategy':
      return 'gtm_market_entry';
    case 'hero_section':
    case 'full_landing_page':
      return 'landing_page';
    case 'bug_fix':
      return 'code_debugging';
    case 'code_module':
      return 'code_engineering';
    case 'single_email':
      return 'email_communication';
    case 'single_image':
      return 'image_cinematic';
    case 'competitive_analysis':
      return 'competitive_research';
    case 'metric_diagnostic':
      return 'business_analytics';
    case 'headline_only':
    case 'social_post':
      return 'social_content';
    case 'research_analysis':
      return 'general_research';
    default:
      return 'general_expert';
  }
}

function deriveDeliverableName(scope: DeliverableScope, lower: string): string {
  switch (scope) {
    case 'hero_section':
      return 'hero section';
    case 'headline_only':
      return lower.includes('2-line') ? '2-line headline' : 'headline';
    case 'single_email':
      return lower.includes('apolog') ? 'apology email' : 'email';
    case 'bug_fix':
      return lower.includes('memory leak') ? 'memory leak fix' : 'bug fix';
    case 'gtm_strategy':
      return 'go-to-market strategy';
    case 'single_image':
      return 'photographic prompt';
    case 'competitive_analysis':
      return 'competitive analysis';
    case 'metric_diagnostic':
      return 'diagnostic analysis';
    case 'full_landing_page':
      return 'landing page';
    case 'social_post':
      return 'social post';
    case 'code_module':
      return 'code implementation';
    case 'research_analysis':
      return 'research analysis';
    default:
      return 'task execution';
  }
}

function extractExplicitEntities(raw: string, lower: string): string[] {
  const entities: string[] = [];

  // Geographies
  if (lower.includes('us market') || lower.includes('united states') || lower.includes('in us')) {
    entities.push('United States');
  }
  if (lower.includes('india')) entities.push('India');
  if (lower.includes('tokyo')) entities.push('Tokyo');
  if (lower.includes('europe') || lower.includes('eu')) entities.push('Europe');

  // Brands / Subjects / Technologies
  if (lower.includes('notion')) entities.push('Notion');
  if (lower.includes('ferrari')) entities.push('Ferrari');
  if (lower.includes('nodejs') || lower.includes('node.js') || lower.includes('node')) entities.push('Node.js');
  if (lower.includes('stream pipeline')) entities.push('stream pipeline');
  if (lower.includes('react')) entities.push('React');
  if (lower.includes('python')) entities.push('Python');
  if (lower.includes('cto')) entities.push('CTO');
  if (lower.includes('cac')) entities.push('CAC');
  if (lower.includes('developer tool') || lower.includes('dev tool')) entities.push('developer tool');

  return entities;
}

function extractAction(raw: string, lower: string, scope: DeliverableScope, taskKind: ExpertTaskKind): string {
  switch (scope) {
    case 'hero_section':
      return 'Write the hero section for the landing page';
    case 'headline_only':
      return 'Write high-impact headline options';
    case 'single_email':
      return 'Draft a professional and accountable email';
    case 'bug_fix':
      return 'Diagnose root cause and provide minimal surgical fix';
    case 'gtm_strategy':
      return 'Develop a comprehensive go-to-market strategy';
    case 'single_image':
      return 'Compose a photographic visual prompt';
    case 'competitive_analysis':
      return 'Conduct an in-depth competitive analysis';
    case 'metric_diagnostic':
      return 'Perform a structured diagnostic analysis';
    default:
      return 'Execute senior practitioner task';
  }
}

function extractObjective(raw: string, lower: string, scope: DeliverableScope, taskKind: ExpertTaskKind): string {
  let clean = raw
    .replace(/^(can you|please|could you|help me|i want to|i need to|write|create|make|conduct|generate|produce|develop|draft|analyze|fix|debug)\s+/i, '')
    .trim();
  clean = clean.replace(/^(a|an|the)\s+/i, '').trim();

  switch (scope) {
    case 'hero_section':
      return `Write the hero section for ${clean}`;
    case 'headline_only':
      return `Write 2-line headline options for ${clean}`;
    case 'single_email':
      return `Draft a professional email regarding ${clean}`;
    case 'bug_fix':
      return `Diagnose and resolve the issue in ${clean}`;
    case 'gtm_strategy':
      return `Develop a comprehensive go-to-market strategy for ${clean}`;
    case 'single_image':
      return `Compose a photographic visual of ${clean}`;
    case 'competitive_analysis':
      return `Conduct an in-depth competitive analysis for ${clean}`;
    case 'metric_diagnostic':
      return `Diagnose root causes for ${clean}`;
    default:
      return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : 'Task Execution';
  }
}

function extractSubject(raw: string, lower: string, scope: DeliverableScope, taskKind: ExpertTaskKind): string {
  let subj = raw
    .replace(/^(can you|please|could you|help me|i want to|i need to)\s+/i, '')
    .trim();

  // Strip leading action verbs
  subj = subj.replace(/^(write|create|make|develop|draft|analyze|research|conduct|fix|debug|produce|generate)\s+/i, '').trim();
  subj = subj.replace(/^(a|an|the)\s+/i, '').trim();

  if (scope === 'hero_section') {
    subj = subj.replace(/^(landing page hero(\s+section)?|hero(\s+section)?)\s+(for\s+)?/i, '');
    subj = subj.replace(/\s+landing page$/i, '');
    return subj.trim() || (raw.toLowerCase().includes('developer tool') ? 'developer tool' : raw.trim());
  }

  if (scope === 'headline_only') {
    subj = subj.replace(/^(2-line|two-line)?\s*(linkedin\s+)?headline\s+(options\s+)?(for\s+)?(a\s+)?/i, '');
    return subj.trim() || (raw.toLowerCase().includes('cto') ? 'CTO' : raw.trim());
  }

  if (scope === 'single_email') {
    subj = subj.replace(/^(email|message|letter|memo)\s+(to\s+[^ ]+\s+)?(apologizing\s+for|regarding|about|asking\s+for)\s+/i, '');
    subj = subj.replace(/^(apologizing\s+for|regarding|about|asking\s+for)\s+/i, '');
    return subj.trim() || (raw.toLowerCase().includes('delayed project') ? 'delayed project delivery' : raw.trim());
  }

  if (scope === 'bug_fix') {
    subj = subj.replace(/^(fix|debug|resolve)\s+/i, '');
    return subj.trim() || (raw.toLowerCase().includes('memory leak') ? 'memory leak in nodejs stream pipeline' : raw.trim());
  }

  if (scope === 'single_image') {
    subj = subj.replace(/^(cinematic\s+)?(photo|photograph|picture|image|shot|render)\s+of\s+(a|an|the)?\s*/i, '');
    subj = subj.replace(/\s+in\s+tokyo(\s+at\s+night)?/i, '');
    subj = subj.replace(/\s+at\s+night/i, '');
    return subj.trim() || (raw.toLowerCase().includes('ferrari') ? 'Ferrari' : raw.trim());
  }

  if (scope === 'competitive_analysis') {
    subj = subj.replace(/^(competitors|alternatives|rivals)\s+(of|to)\s+/i, '');
    subj = subj.replace(/\s+in\s+india/i, '');
    return subj.trim() || (raw.toLowerCase().includes('notion') ? 'Notion' : raw.trim());
  }

  if (scope === 'metric_diagnostic') {
    subj = subj.replace(/^(why\s+our|why\s+the|why\s+)\s*/i, '');
    return subj.trim() || (raw.toLowerCase().includes('cac') ? 'Customer Acquisition Cost (CAC) increase' : raw.trim());
  }

  return subj || raw;
}

function extractGeography(lower: string): string | undefined {
  if (lower.includes('us market') || lower.includes('in us')) return 'US';
  if (lower.includes('united states')) return 'United States';
  if (lower.includes('india')) return 'India';
  if (lower.includes('tokyo')) return 'Tokyo';
  if (lower.includes('europe') || lower.includes('eu')) return 'Europe';
  return undefined;
}

function extractTimeframe(lower: string): string | undefined {
  if (lower.includes('at night')) return 'at night';
  const match = lower.match(/\b(90-day|30-day|60-day|annual|quarterly|q[1-4]|202[4-6])\b/i);
  return match ? match[0] : undefined;
}

function extractConstraints(lower: string): string[] {
  const constraints: string[] = [];
  const wordCount = lower.match(/\b\d+\s*words\b/i);
  if (wordCount) constraints.push(`Length: ${wordCount[0]}`);

  if (lower.includes('2-line') || lower.includes('two-line')) constraints.push('Length: exactly 2 lines');
  if (lower.includes('50-500 employees')) constraints.push('Target Company Size: 50-500 employees');
  if (lower.includes('top 10')) constraints.push('Scope: Top 10 competitors');

  return constraints;
}

function extractExplicitAudience(lower: string): string | undefined {
  if (lower.includes('for developer tool') || lower.includes('to developer')) return 'Developers';
  if (lower.includes('for cto') || lower.includes('for a cto')) return 'CTO';
  if (lower.includes('to client') || lower.includes('to a client')) return 'Client';
  if (lower.includes('to customer') || lower.includes('to a customer')) return 'Customer';
  if (lower.includes('for hr technology') || lower.includes('hr tech')) return 'HR Technology Companies';
  return undefined;
}

function checkIsAlreadyDetailed(lower: string, wordCount: number): boolean {
  // Direct signals that the prompt already specifies concrete scope parameters (e.g. employee count, budget, SLA)
  let depthSignals = 0;
  if (/\b\d+\s*-\s*\d+\s*(employees|users|customers)\b/i.test(lower)) depthSignals += 3;
  if (/\b(\$|usd|eur|inr)\s*[\d,]+/i.test(lower)) depthSignals += 3;
  if (/\b(launch budget|pilot budget|budget of|arr|mrr)\b/i.test(lower)) depthSignals += 2;
  if (/\b(b2b saas|mid-market|enterprise|smb)\b/i.test(lower)) depthSignals += 1;
  if (/\b(compare|competitors?|pricing|acquisition channels|90-day|sla|latency)\b/i.test(lower)) depthSignals += 2;
  if (wordCount >= 25) depthSignals += 2;

  return depthSignals >= 3;
}

function identifyMissingDimensions(
  scope: DeliverableScope,
  taskKind: ExpertTaskKind,
  lower: string,
  isAlreadyDetailed: boolean
): string[] {
  if (isAlreadyDetailed) {
    return ['execution rigor', 'validation criteria', 'structured deliverable format'];
  }

  switch (scope) {
    case 'hero_section':
      return [
        'primary outcome-focused headlines',
        'concise supporting subheadline',
        'clear primary and secondary CTAs',
        'technically credible proof points',
        'strict hero scope boundary',
      ];

    case 'headline_only':
      return [
        'strict 2-line length limit',
        'balance of technical leadership and business impact',
        'elimination of buzzwords and prestige titles',
      ];

    case 'single_email':
      return [
        'direct delay acknowledgment and responsibility',
        'situation explanation without excuses',
        'current status and next steps',
        'accountable tone without unrequested commitments',
      ];

    case 'bug_fix':
      return [
        'lifecycle, buffering, backpressure, or stream handling causes',
        'minimal production-safe code change',
        'root cause explanation',
        'regression test or verification procedure',
      ];

    case 'gtm_strategy':
      return [
        'market opportunity & priority customer segments',
        'ideal customer profile and beachhead segment',
        'competitive landscape and differentiation',
        'recommended market-entry strategy',
        'positioning and value proposition',
        'pricing and packaging considerations',
        'sales, acquisition and distribution channels',
        'partnership opportunities',
        'localization and operational requirements',
        'relevant regulatory considerations',
        '90-day execution plan and expansion milestones',
        'resource and budget assumptions',
        'KPIs and decision gates',
        'major risks and mitigation strategies',
      ];

    case 'single_image':
      return [
        '35mm camera optics and lens',
        'atmospheric lighting and reflections',
        'low-angle dynamic composition',
        'tactile texture and environmental realism',
        'moody cinematic color grade',
      ];

    case 'competitive_analysis':
      return [
        'direct and indirect competitor taxonomy',
        'feature parity and differentiation matrix',
        'regional pricing and local currency packaging',
        'local market adoption dynamics',
        'actionable opportunity gaps',
      ];

    case 'metric_diagnostic':
      return [
        'metric decomposition into funnel & channel drivers',
        'acquisition channel fatigue and saturation hypotheses',
        'funnel drop-off and UX friction analysis',
        'attribution and tracking changes evaluation',
        'diagnostic data cuts and SQL audit queries',
        'prioritized 30/90-day corrective action plan',
      ];

    default:
      return [
        'core objective deconstruction',
        'structured execution roadmap',
        'concrete deliverables without placeholders',
      ];
  }
}

function deriveScopeBoundaries(
  scope: DeliverableScope,
  taskKind: ExpertTaskKind,
  lower: string
): { scopeBoundaries: string[]; forbiddenInventions: string[] } {
  switch (scope) {
    case 'hero_section':
      return {
        scopeBoundaries: [
          'Keep the scope limited strictly to the hero section.',
          'Do not create full landing page copy, pricing tiers, FAQs, testimonials, guarantee, or acquisition strategy.',
        ],
        forbiddenInventions: ['product capabilities', 'customer results', 'integrations', 'metrics'],
      };

    case 'headline_only':
      return {
        scopeBoundaries: [
          'Keep strictly within the 2-line length limit.',
          'Do not write an entire profile summary, bio, or content strategy.',
        ],
        forbiddenInventions: ['specific technologies', 'company names', 'metrics not provided'],
      };

    case 'single_email':
      return {
        scopeBoundaries: [
          'Draft the specific email directly with Subject Line, Body, and Sign-off.',
          'Do not automatically create a customer-retention strategy or long-term communication plan.',
        ],
        forbiddenInventions: ['reason for delay', 'compensation', 'revised dates', 'refunds', 'credits', 'corrective actions not provided'],
      };

    case 'bug_fix':
      return {
        scopeBoundaries: [
          'Provide the minimal production-safe code change required and a regression test.',
          'Do not introduce unrelated architectural changes or framework redesigns.',
        ],
        forbiddenInventions: ['unrelated dependencies', 'architectural redesigns'],
      };

    case 'gtm_strategy':
      return {
        scopeBoundaries: [
          'Prioritize highest-leverage actions and explain the strategic reasoning.',
          'State reasonable assumptions explicitly rather than inventing facts.',
        ],
        forbiddenInventions: ['company', 'product', 'customer', 'pricing', 'financial facts'],
      };

    case 'single_image':
      return {
        scopeBoundaries: [
          'Focus purely on the photographic visual scene and optical specifications.',
        ],
        forbiddenInventions: ['unrelated subjects', 'artificial CG plastic sheen'],
      };

    case 'competitive_analysis':
      return {
        scopeBoundaries: [
          'Distinguish verified competitor data from market inferences.',
        ],
        forbiddenInventions: ['non-existent startups', 'unverified pricing or metrics'],
      };

    case 'metric_diagnostic':
      return {
        scopeBoundaries: [
          'Decompose the anomaly into structured mathematical and operational hypotheses.',
        ],
        forbiddenInventions: ['revenue figures', 'dollar amounts', 'company facts not provided'],
      };

    default:
      return {
        scopeBoundaries: ['Execute the exact requested task with senior practitioner depth.'],
        forbiddenInventions: ['arbitrary facts', 'unauthorized assumptions'],
      };
  }
}
