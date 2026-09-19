/**
 * REFINZI — Semantic Intent & Task Calibration Engine
 * 
 * Identifies the exact task domain and detects the critical dimensions
 * that the target AI needs to produce an exceptional output.
 * Makes defensible assumptions autonomously — NEVER blocks the user with questions.
 */

import { SemanticIntent, TaskDomain, PromptMode } from '../types';

export function extractSemanticIntent(
  rawInput: string,
  mode: PromptMode = 'better',
  targetAi: string = 'general'
): SemanticIntent {
  const text = (rawInput || '').trim();
  const lower = text.toLowerCase();

  // 1. Detect Task Domain
  const domain = detectTaskDomain(lower);

  // 2. Extract Task Objective (clean and focused)
  const objective = extractObjective(text, domain);

  // 3. Detect Missing Dimensions for this target AI & domain
  const calibratedDimensions = detectMissingDimensions(domain, lower);

  // 4. Derive Defensible Assumptions autonomously
  const assumptions = deriveDefensibleAssumptions(domain, lower, targetAi);

  // 5. Extract audience & constraints
  const audience = extractAudience(lower, domain, assumptions);
  const constraints = extractConstraints(text, lower);
  const context = [
    `Target AI Platform: ${targetAi}`,
    `Inferred Domain: ${domain}`,
  ];
  const desiredOutput = extractDesiredOutput(domain, lower);

  // 6. Artifact classification
  const artifactType = domain === 'code' ? 'code' : domain === 'image_gen' || domain === 'video_gen' ? 'visual' : domain === 'research' ? 'query' : 'text';

  // 7. Confidence Score
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const confidence = Math.min(0.95, Math.max(0.4, (wordCount / 12) * 0.4 + (calibratedDimensions.length > 0 ? 0.3 : 0.2)));

  return {
    artifactType,
    rawInput: text,
    intent: objective,
    objective,
    domain,
    targetAi,
    calibratedDimensions,
    assumptions,
    audience,
    constraints,
    context,
    desiredOutput,
    confidence,
    mode,
  };
}

function detectTaskDomain(lower: string): TaskDomain {
  // Video Generation
  if (
    /\b(runway|kling|sora|pika|luma|video clip|camera panning|tracking shot|camera dolly|zoom in|drone flyover|cinematic footage|motion shot|temporal|slow motion)\b/i.test(lower)
  ) {
    return 'video_gen';
  }

  // Image Generation
  if (
    /\b(photo of|portrait of|render|photorealistic|wallpaper|midjourney|flux|dall-e|cinematic lighting|35mm|anamorphic|bokeh|wide shot|close up shot|illustration|oil painting|digital art|shot on|concept art|sunset|desert|aesthetic|view of)\b/i.test(lower) ||
    /\b(car in|landscape with|building with|room with|character with|visual of|design a logo)\b/i.test(lower)
  ) {
    return 'image_gen';
  }

  // Code / Engineering
  if (
    /\b(react|vue|angular|svelte|nextjs|typescript|javascript|python|sql|html|css|tailwind|api|endpoint|backend|frontend|function|regex|database|prisma|docker|bug|refactor|unit test|git|repo|oauth|jwt|auth|authentication|login|json|app|script|build|component)\b/i.test(lower)
  ) {
    return 'code';
  }

  // Marketing & Growth
  if (
    /\b(marketing|landing page|copywriting|seo|ad copy|conversion|funnel|email campaign|lead magnet|social media|twitter thread|linkedin post|hook|cta|gtm|go-to-market|brand|sales pitch)\b/i.test(lower)
  ) {
    return 'marketing';
  }

  // Business Strategy
  if (
    /\b(business plan|pitch deck|investor|tam|sam|som|monetization|pricing model|unit economics|swot|okr|kpi|executive summary|quarterly|roi|cac|ltv|saas)\b/i.test(lower)
  ) {
    return 'business';
  }

  // Research & Academic
  if (
    /\b(research|paper|study|literature review|hypothesis|statistical|clinical|p-value|methodology|confounder|academic|meta-analysis|citation|abstract|critique|comparative analysis|comparison|survey|benchmark)\b/i.test(lower)
  ) {
    return 'research';
  }

  // Data & Analytics
  if (
    /\b(data analysis|analytics|pandas|dataframe|metrics|dashboard|spreadsheet|excel|tableau|powerbi|correlation|regression|clustering|forecast|trend|sql query)\b/i.test(lower)
  ) {
    return 'data';
  }

  // Writing & Creative
  if (
    /\b(essay|article|blog post|story|narrative|script|rewrite|proofread|tone|chapter|character|plot|novel|newsletter|critique|press release)\b/i.test(lower)
  ) {
    return 'writing';
  }

  return 'general';
}

function extractObjective(text: string, domain: TaskDomain): string {
  let clean = text
    .replace(/^(can you|please|could you|help me|i want to|i need to|write|create|make|conduct|generate|produce)\s+/i, '')
    .trim();

  clean = clean.replace(/^(a|an|the)\s+/i, '').trim();

  if (!clean) {
    return `High-quality ${domain.replace('_', ' ')} instruction`;
  }

  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function detectMissingDimensions(domain: TaskDomain, lower: string): string[] {
  const missing: string[] = [];

  switch (domain) {
    case 'image_gen':
      if (!/\b(wide|close-up|low-angle|eye-level|overhead|bird's eye)\b/.test(lower)) missing.push('composition & camera angle');
      if (!/\b(golden hour|volumetric|neon|backlight|softbox|studio|rim light)\b/.test(lower)) missing.push('lighting & atmosphere');
      if (!/\b(35mm|50mm|85mm|anamorphic|macro|telephoto|focal)\b/.test(lower)) missing.push('lens & optics');
      if (!/\b(photorealistic|film grain|tactile|bokeh|8k|render)\b/.test(lower)) missing.push('photographic texture & materials');
      break;

    case 'video_gen':
      if (!/\b(tracking|panning|dolly|drone|crane|static)\b/.test(lower)) missing.push('camera motion & velocity');
      if (!/\b(golden hour|atmospheric|volumetric|dramatic)\b/.test(lower)) missing.push('lighting & environment');
      if (!/\b(continuous|slow motion|fluid|inertia)\b/.test(lower)) missing.push('temporal motion coherence');
      break;

    case 'marketing':
      if (!/\b(b2b|b2c|saas|ecommerce|dtc|consumers)\b/.test(lower)) missing.push('target audience & buyer profile');
      if (!/\b(trial|leads|sales|awareness|conversion)\b/.test(lower)) missing.push('conversion goal & primary hook');
      if (!/\b(channels|organic|paid|outbound|email)\b/.test(lower)) missing.push('acquisition channels & timeframe');
      break;

    case 'code':
      if (!/\b(typescript|javascript|python|sql|go|rust)\b/.test(lower)) missing.push('target language & runtime');
      if (!/\b(error|edge case|null|exception)\b/.test(lower)) missing.push('edge cases & error handling');
      if (!/\b(types|interface|type-safe)\b/.test(lower)) missing.push('strict typing & component interface');
      break;

    case 'research':
      if (!/\b(empirical|methodology|confounders|peer-reviewed)\b/.test(lower)) missing.push('evidence standard & methodology');
      if (!/\b(comparison|matrix|table|synthesis)\b/.test(lower)) missing.push('comparative dimensions & output format');
      break;

    case 'writing':
      if (!/\b(tone|voice|style|formal|casual|punchy)\b/.test(lower)) missing.push('narrative tone & pacing');
      if (!/\b(hook|takeaway|structure)\b/.test(lower)) missing.push('opening hook & deliverable structure');
      break;

    case 'business':
      if (!/\b(kpi|milestones|quarter|horizon)\b/.test(lower)) missing.push('timeframe & measurable KPIs');
      if (!/\b(trade-offs|risks|assumptions)\b/.test(lower)) missing.push('risk trade-offs & execution roadmap');
      break;

    default:
      missing.push('structural clarity & actionable criteria');
      break;
  }

  return missing;
}

function deriveDefensibleAssumptions(domain: TaskDomain, lower: string, targetAi: string): string[] {
  const assumptions: string[] = [];

  switch (domain) {
    case 'image_gen':
      assumptions.push('Style: Photorealistic cinematography with tactile, natural texture');
      assumptions.push('Optics: 35mm anamorphic format with cinematic aspect ratio');
      assumptions.push('Lighting: Natural environmental illumination calibrated for the scene');
      break;

    case 'video_gen':
      assumptions.push('Movement: Smooth cinematic camera tracking with natural physical inertia');
      assumptions.push('Fidelity: High temporal consistency without unnatural morphing or distortion');
      break;

    case 'marketing':
      if (lower.includes('gtm') || lower.includes('go-to-market') || lower.includes('market entry')) {
        assumptions.push('Scope: Comprehensive go-to-market execution and acquisition strategy');
        assumptions.push('Timeframe: Phased 90-day to 180-day market entry horizon');
      } else if (lower.includes('landing page') || lower.includes('sales page')) {
        assumptions.push('Structure: Conversion-focused section layout and value proposition hierarchy');
      } else if (lower.includes('b2b') || lower.includes('saas')) {
        assumptions.push('Audience: Relevant decision makers evaluated on measurable business impact');
        assumptions.push('Strategy: Phased execution combining inbound credibility and targeted outreach');
      } else {
        assumptions.push('Focus: Clear messaging and actionable engagement strategy');
      }
      break;

    case 'code':
      if (lower.includes('react') || lower.includes('frontend') || lower.includes('hook') || lower.includes('ui')) {
        assumptions.push('Stack: Modern TypeScript + React with strict types');
      } else if (lower.includes('python') || lower.includes('data') || lower.includes('ml')) {
        assumptions.push('Stack: Python 3.11+ idiomatic, modular implementation');
      } else {
        assumptions.push('Stack: Modern TypeScript / ESNext production standard');
      }
      assumptions.push('Quality: Production-ready, defensive edge-case handling, zero external bloat');
      break;

    case 'research':
      assumptions.push('Evidence: High analytical rigor distinguishing facts from inferences');
      assumptions.push('Deliverable: Structured comparative synthesis with trade-off matrices');
      break;

    case 'business':
      assumptions.push('Horizon: 90-day to 12-month pragmatic phased implementation');
      assumptions.push('Prioritization: High-leverage, capital-efficient operational initiatives');
      break;

    default:
      assumptions.push('Quality: Authoritative, structured, and immediately actionable response');
      break;
  }

  return assumptions;
}

function extractAudience(lower: string, domain: TaskDomain, assumptions: string[]): string {
  for (const a of assumptions) {
    if (a.toLowerCase().includes('audience:')) {
      return a.split(':')[1].trim();
    }
  }

  switch (domain) {
    case 'code': return 'Senior engineers & code review agents';
    case 'marketing': return 'Target buyers & prospects';
    case 'business': return 'Leadership & key stakeholders';
    case 'research': return 'Analytical practitioners & researchers';
    case 'writing': return 'Discerning general readers';
    default: return 'Subject matter practitioners';
  }
}

function extractConstraints(text: string, lower: string): string[] {
  const constraints: string[] = [];
  const lengthMatch = text.match(/under \d+ words|\d+ words or less|brief|concise|in \d+ bullet points|1 page/i);
  if (lengthMatch) constraints.push(lengthMatch[0]);

  const avoidMatch = text.match(/(?:don't|do not|avoid|without|never)\s+([^.,\n]+)/i);
  if (avoidMatch && avoidMatch[1]) {
    constraints.push(`Avoid: ${avoidMatch[1].trim()}`);
  }

  return constraints;
}

function extractDesiredOutput(domain: TaskDomain, lower: string): string {
  switch (domain) {
    case 'image_gen': return 'High-fidelity calibrated photographic prompt with optics & lighting';
    case 'video_gen': return 'Cinematic video choreography prompt with camera movement & velocity';
    case 'code': return 'Clean, type-safe, production-ready code with edge case handling';
    case 'marketing':
      if (lower.includes('gtm') || lower.includes('market entry')) {
        return 'Comprehensive go-to-market strategy';
      }
      if (lower.includes('landing page')) {
        return 'Conversion-focused page architecture & copy blueprint';
      }
      return 'Actionable marketing strategy, copy, and execution plan';
    case 'research': return 'Structured analytical synthesis with comparative breakdown';
    case 'writing': return 'Polished narrative draft with natural rhythm and voice';
    case 'business': return 'Executive strategic roadmap with phased deliverables and KPIs';
    default: return 'Structured, high-impact instruction';
  }
}
