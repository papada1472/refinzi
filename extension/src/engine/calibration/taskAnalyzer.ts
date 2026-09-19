/**
 * REFINZI — Task & Intent Analyzer
 * Extracts core action, subject, knowns/inferred/unknowns, and detects task granularity.
 */

import { TaskAnalysis, GranularTaskType } from './types';
import { TaskDomain } from '../../types';

export function analyzeTask(rawInput: string, targetAi: string = 'general'): TaskAnalysis {
  const raw = (rawInput || '').trim();
  const lower = raw.toLowerCase();
  const wordCount = raw.split(/\s+/).filter(Boolean).length;

  // 1. Cleaned input & Action verb
  const actionVerb = extractActionVerb(raw);
  const coreSubject = extractCoreSubject(raw, lower);

  // 2. Granular Task Detection
  const { taskType, domain } = detectGranularTask(lower, raw);

  // 3. Known / Inferred / Unknown Context Extraction
  const context = extractContextBreakdown(taskType, raw, lower);

  // 4. Check if already comprehensive
  const isAlreadyComprehensive = checkIsAlreadyComprehensive(raw, lower, wordCount);

  // 5. Existing dimensions detection
  const existingDimensions = detectExistingDimensions(lower);

  // 6. Identify Missing High-Value Dimensions
  const missingDimensions = detectMissingDimensionsForTask(taskType, existingDimensions);

  return {
    rawInput: raw,
    cleanedInput: coreSubject,
    taskType,
    domain,
    targetAi,
    actionVerb,
    coreSubject,
    context,
    existingDimensions,
    missingDimensions,
    isAlreadyComprehensive,
    wordCount,
  };
}

function extractActionVerb(raw: string): string {
  const match = raw.match(/^(can you|please|could you|help me)?\s*(develop|create|write|draft|build|implement|fix|debug|refactor|design|research|analyze|synthesize|plan|outline|compare)\b/i);
  if (match && match[2]) {
    return capitalize(match[2]);
  }
  return 'Develop';
}

function extractCoreSubject(raw: string, lower: string): string {
  let cleaned = raw
    .replace(/^(can you|please|could you|help me|i want to|i need to|write|create|make|conduct|generate|produce|develop|draft)\s+/i, '')
    .trim();

  // Normalize initial articles
  cleaned = cleaned.replace(/^(a|an|the)\s+/i, '').trim();

  // Expand common shorthand while preserving exact intent
  if (/^gtm\b/i.test(cleaned)) {
    cleaned = cleaned.replace(/^gtm\b/i, 'go-to-market strategy');
  }

  if (/in us market/i.test(cleaned)) {
    cleaned = cleaned.replace(/in us market/i, 'entering the US market');
  }

  return cleaned || raw;
}

function detectGranularTask(lower: string, raw: string): { taskType: GranularTaskType; domain: TaskDomain } {
  // GTM / Market Entry
  if (/\b(gtm|go-to-market|market entry|enter\s+in\s+.*market|enter\s+the\s+.*market|expansion into|launch in)\b/i.test(lower)) {
    return { taskType: 'gtm_strategy', domain: 'business' };
  }

  // Social Media Post (e.g. LinkedIn, Twitter, Threads)
  if (/\b(linkedin post|tweet|twitter thread|threads post|social media post|instagram caption)\b/i.test(lower)) {
    return { taskType: 'social_media_post', domain: 'marketing' };
  }

  // Code Debugging / Fix
  if (/\b(fix this|debug|resolve error|stack trace|typeerror|syntaxerror|exception|why is this failing|broken code)\b/i.test(lower)) {
    return { taskType: 'code_debugging', domain: 'code' };
  }

  // Code Refactoring
  if (/\b(refactor|clean up code|optimize this code|modularize|reduce complexity)\b/i.test(lower)) {
    return { taskType: 'code_refactoring', domain: 'code' };
  }

  // Code Feature Implementation
  if (/\b(python|javascript|typescript|react|vue|function|api endpoint|sql query|class|component|hook|script|regex|unit test)\b/i.test(lower)) {
    return { taskType: 'code_feature', domain: 'code' };
  }

  // Image Generation / Scene
  if (/\b(photo of|render|shot of|image of|picture of|cinematic|sunset|desert|portrait|illustration|wallpaper|visual of|sports car|landscape)\b/i.test(lower)) {
    return { taskType: 'photographic_scene', domain: 'image_gen' };
  }

  // Video Generation
  if (/\b(video clip|tracking shot|camera dolly|drone shot|sora|runway|pika|motion footage)\b/i.test(lower)) {
    return { taskType: 'video_cinematic', domain: 'video_gen' };
  }

  // Market & Industry Research
  if (/\b(research|landscape|startups in|industry analysis|market size|competitors in|ecosystem)\b/i.test(lower)) {
    return { taskType: 'research_market', domain: 'research' };
  }

  // Academic / Scientific Research
  if (/\b(literature review|methodology|clinical|hypothesis|peer-reviewed|empirical study|meta-analysis)\b/i.test(lower)) {
    return { taskType: 'research_academic', domain: 'research' };
  }

  // Copywriting & Ad Campaigns
  if (/\b(marketing plan|marketing strategy|marketing campaign|ad copy|landing page|sales page|email campaign|funnel|headline|conversion)\b/i.test(lower)) {
    return { taskType: 'marketing_campaign', domain: 'marketing' };
  }

  // Writing Article / Essay
  if (/\b(article|essay|blog post|newsletter|opinion piece|press release)\b/i.test(lower)) {
    return { taskType: 'writing_article', domain: 'writing' };
  }

  // Writing Creative / Story
  if (/\b(story|narrative|novel|chapter|script|dialogue|character arc)\b/i.test(lower)) {
    return { taskType: 'writing_creative', domain: 'writing' };
  }

  // General Business Strategy
  if (/\b(business plan|pitch deck|monetization|pricing model|unit economics|swot|okrs)\b/i.test(lower)) {
    return { taskType: 'business_strategy', domain: 'business' };
  }

  // Data Analysis
  if (/\b(data analysis|analytics|pandas|dataframe|metrics|correlation|regression|trend)\b/i.test(lower)) {
    return { taskType: 'data_analysis', domain: 'data' };
  }

  return { taskType: 'general_instruction', domain: 'general' };
}

function extractContextBreakdown(taskType: GranularTaskType, raw: string, lower: string): TaskAnalysis['context'] {
  const known: string[] = [];
  const inferred: string[] = [];
  const unknown: string[] = [];

  // Extract explicit known entities
  if (lower.includes('us market') || lower.includes('united states') || lower.includes('in us')) {
    known.push('Geographic Market: United States');
  }
  if (lower.includes('india')) known.push('Geographic Market: India');
  if (lower.includes('python')) known.push('Language: Python');
  if (lower.includes('linkedin')) known.push('Channel: LinkedIn');
  if (lower.includes('ai agents')) known.push('Topic: AI Agents');
  if (lower.includes('sports car')) known.push('Subject: Sports car');
  if (lower.includes('desert')) known.push('Environment: Desert');
  if (lower.includes('sunset')) known.push('Lighting Condition: Sunset');

  switch (taskType) {
    case 'gtm_strategy':
    case 'market_entry':
      inferred.push('Objective: Market expansion & commercial launch strategy');
      inferred.push('Standard Dimensions: Customer segmentation, positioning, channels, regulatory/localization, timeline, KPIs');
      unknown.push('Company identity & product specification');
      unknown.push('Target industry & business model (B2B vs B2C)');
      unknown.push('Budget & capital allocation');
      unknown.push('Existing traction & competitive advantages');
      break;

    case 'social_media_post':
      inferred.push('Format: Native social feed post');
      inferred.push('Tone: Professional, engaging, conversational');
      unknown.push('Author personal voice & specific perspective');
      unknown.push('Call to action destination');
      break;

    case 'code_debugging':
      inferred.push('Goal: Diagnose root cause, provide corrected code, guard against regressions');
      unknown.push('Target runtime environment / framework version (unless supplied in code snippet)');
      break;

    case 'research_market':
      inferred.push('Goal: Comprehensive landscape mapping, categorization, and comparative analysis');
      unknown.push('Specific sub-vertical focus & valuation/stage filters');
      break;

    case 'photographic_scene':
      inferred.push('Format: Photographic composition, optical lens parameters, illumination, atmosphere');
      unknown.push('Arbitrary specific brand/model credentials');
      break;

    default:
      inferred.push('Goal: Deliver an authoritative, high-utility response');
      break;
  }

  return { known, inferred, unknown };
}

function checkIsAlreadyComprehensive(raw: string, lower: string, wordCount: number): boolean {
  // If prompt is over 45 words and already specifies objectives, constraints, format, or criteria:
  if (wordCount < 40) return false;

  let detailScore = 0;
  if (/\b(objective|goal|purpose|aim)\b/i.test(lower)) detailScore++;
  if (/\b(context|background|scenario|environment)\b/i.test(lower)) detailScore++;
  if (/\b(constraints?|do not|avoid|must be|requirements?)\b/i.test(lower)) detailScore++;
  if (/\b(deliverable|output format|structure|sections?|markdown)\b/i.test(lower)) detailScore++;
  if (/\b(evaluation criteria|acceptance criteria|kpis?|benchmark)\b/i.test(lower)) detailScore++;

  return detailScore >= 3;
}

function detectExistingDimensions(lower: string): string[] {
  const existing: string[] = [];
  if (/\b(target customer|icp|buyer persona|audience)\b/i.test(lower)) existing.push('audience');
  if (/\b(positioning|value proposition)\b/i.test(lower)) existing.push('positioning');
  if (/\b(pricing|pricing model)\b/i.test(lower)) existing.push('pricing');
  if (/\b(channels?|acquisition)\b/i.test(lower)) existing.push('channels');
  if (/\b(timeline|milestones?|30-60-90|schedule)\b/i.test(lower)) existing.push('timeline');
  if (/\b(kpi|metrics?|benchmarks?)\b/i.test(lower)) existing.push('kpis');
  if (/\b(risks?|mitigation|trade-offs?)\b/i.test(lower)) existing.push('risks');
  if (/\b(camera|lens|35mm|50mm|85mm|anamorphic)\b/i.test(lower)) existing.push('lens');
  if (/\b(lighting|golden hour|backlight|volumetric)\b/i.test(lower)) existing.push('lighting');
  if (/\b(angle|wide-angle|close-up|low-angle)\b/i.test(lower)) existing.push('angle');
  if (/\b(edge cases?|error handling|null checks?)\b/i.test(lower)) existing.push('edge_cases');
  if (/\b(unit tests?|acceptance tests?)\b/i.test(lower)) existing.push('tests');
  return existing;
}

function detectMissingDimensionsForTask(taskType: GranularTaskType, existing: string[]): string[] {
  const allCandidates: Record<GranularTaskType, string[]> = {
    gtm_strategy: [
      'target customer and market segment',
      'market-entry approach',
      'positioning and value proposition',
      'competitive landscape',
      'pricing considerations',
      'highest-leverage acquisition channels',
      'strategic partnerships',
      'localization and regulatory requirements',
      'key execution steps and 90-day launch plan',
      'budget and resource assumptions',
      'KPIs and major risks',
    ],
    market_entry: [
      'target customer and segment',
      'entry strategy and regulatory compliance',
      'competitive positioning',
      'go-to-market channels',
      'localization requirements',
      'phased milestone timeline',
      'KPIs and risk mitigation',
    ],
    social_media_post: [
      'target audience and professional context',
      'compelling perspective or counter-intuitive hook',
      'actionable key takeaways or insights',
      'concise, readable formatting with natural line breaks',
      'engaging closing discussion prompt',
    ],
    code_debugging: [
      'root-cause explanation',
      'corrected code with minimal necessary changes',
      'defensive handling for edge cases',
      'verification test to prove resolution',
    ],
    code_refactoring: [
      'architectural rationale',
      'modular and type-safe structure',
      'performance and readability improvements',
      'backwards compatibility guarantees',
    ],
    code_feature: [
      'environment and runtime standards',
      'type-safe implementation with clear interfaces',
      'defensive edge-case handling',
      'runnable verification example',
    ],
    photographic_scene: [
      'shot composition and camera perspective',
      'lens optics and depth of field',
      'natural environmental lighting and atmosphere',
      'tactile surface textures and photographic realism',
    ],
    character_art: [
      'character posture and expression',
      'attire materials and textural fidelity',
      'cinematic key and rim lighting',
      'high-resolution photographic rendering',
    ],
    video_cinematic: [
      'camera trajectory, velocity, and inertia',
      'physical momentum and spatial continuity',
      'atmospheric volumetric illumination',
      'seamless temporal coherence',
    ],
    research_market: [
      'market segmentation and landscape mapping',
      'key drivers, funding trends, and technological differentiation',
      'regulatory and economic barriers',
      'synthesis matrix comparing leading players',
    ],
    research_academic: [
      'theoretical framework and current state of research',
      'methodological standards and potential confounders',
      'comparative evidence synthesis',
      'unresolved questions and future research directions',
    ],
    copywriting: [
      'target buyer pain point and emotional trigger',
      'distinctive value proposition and proof points',
      'persuasive headline variations and body copy',
      'unambiguous call to action',
    ],
    writing_article: [
      'captivating opening hook',
      'clear narrative arc with evidence and examples',
      'authoritative, engaging tone free of clichés',
      'memorable conclusion with actionable takeaway',
    ],
    writing_creative: [
      'scene setting and sensory world-building',
      'character motivations and internal conflict',
      'organic dialogue and pacing',
      'thematic resonance and narrative tension',
    ],
    business_strategy: [
      'strategic objectives and opportunity sizing',
      'phased execution roadmap (30-60-90 days)',
      'operational resource allocation and trade-offs',
      'measurable KPIs and risk mitigation strategies',
    ],
    data_analysis: [
      'exploratory data patterns and statistical distributions',
      'key anomalies, correlations, and trends',
      'business impact interpretation',
      'actionable recommendations supported by findings',
    ],
    general_instruction: [
      'direct answer upfront',
      'structured scannable organization',
      'concrete real-world examples or edge cases',
      'clear assumptions where details are unspecified',
    ],
    marketing_campaign: [
      'campaign objective and target audience',
      'core narrative hook and channel mix',
      'creative deliverables and copy angles',
      'phased rollout schedule and conversion KPIs',
    ],
  };

  const candidates = allCandidates[taskType] || allCandidates.general_instruction;

  // Filter out any candidate that matches an already existing dimension
  return candidates.filter((c) => {
    const cLower = c.toLowerCase();
    for (const ex of existing) {
      if (cLower.includes(ex)) return false;
    }
    return true;
  });
}

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
