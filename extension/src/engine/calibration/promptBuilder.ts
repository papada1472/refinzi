/**
 * REFINZI — Dynamic Prompt Constructor
 * Assembles natural, task-specific calibrated instructions without generic boilerplate templates.
 */

import { TaskAnalysis } from './types';
import { BetterPromptResponse } from '../../types';

export function constructCalibratedPrompt(analysis: TaskAnalysis): BetterPromptResponse {
  // Case A: Prompt is already comprehensive
  if (analysis.isAlreadyComprehensive) {
    return constructMinimalTunedPrompt(analysis);
  }

  // Case B: Dynamic Task-Aware Calibration
  switch (analysis.taskType) {
    case 'gtm_strategy':
    case 'market_entry':
      return constructGtmPrompt(analysis);

    case 'social_media_post':
      return constructSocialPostPrompt(analysis);

    case 'code_debugging':
      return constructCodeDebuggingPrompt(analysis);

    case 'code_refactoring':
      return constructCodeRefactoringPrompt(analysis);

    case 'code_feature':
      return constructCodeFeaturePrompt(analysis);

    case 'marketing_campaign':
      return constructMarketingCampaignPrompt(analysis);

    case 'photographic_scene':
    case 'character_art':
      return constructVisualPrompt(analysis);

    case 'video_cinematic':
      return constructVideoPrompt(analysis);

    case 'research_market':
      return constructMarketResearchPrompt(analysis);

    case 'research_academic':
      return constructAcademicResearchPrompt(analysis);

    case 'copywriting':
      return constructCopywritingPrompt(analysis);

    case 'writing_article':
      return constructArticlePrompt(analysis);

    case 'writing_creative':
      return constructCreativeWritingPrompt(analysis);

    case 'business_strategy':
      return constructBusinessStrategyPrompt(analysis);

    case 'data_analysis':
      return constructDataAnalysisPrompt(analysis);

    case 'general_instruction':
    default:
      return constructGeneralCalibratedPrompt(analysis);
  }
}

/**
 * Case A: Already Strong / Comprehensive Prompt (Minimum Sufficient Calibration)
 */
function constructMinimalTunedPrompt(analysis: TaskAnalysis): BetterPromptResponse {
  // Respect the user's detailed existing prompt — DO NOT rewrite or wrap in fluff
  let prompt = analysis.rawInput.trim();

  // Add only technical execution rigor if not already specified
  const lower = prompt.toLowerCase();
  const additions: string[] = [];

  if (!lower.includes('assumption') && analysis.context.unknown.length > 0) {
    additions.push('Clearly state any operational assumptions where context is unspecified.');
  }

  if (additions.length > 0) {
    prompt = `${prompt}\n\nExecution Note: ${additions.join(' ')}`;
  }

  return {
    mode: 'better',
    prompt,
    shortReason: 'Preserved comprehensive prompt; added execution assumption note.',
    domain: analysis.domain,
    calibratedDimensions: ['execution rigor'],
    targetAi: analysis.targetAi,
  };
}

/**
 * GTM Strategy / Market Entry Calibration
 */
function constructGtmPrompt(analysis: TaskAnalysis): BetterPromptResponse {
  const goalPhrase = analysis.coreSubject.toLowerCase().includes('us market')
    ? 'entering the US market'
    : analysis.coreSubject;

  const prompt = [
    `Develop a practical go-to-market (GTM) strategy for ${goalPhrase}.`,
    `Define the ideal target customer and market segment, recommended market-entry approach, positioning and value proposition, competitive landscape, pricing considerations, highest-leverage acquisition channels, partnerships, localization requirements, key execution steps, 90-day launch plan, budget assumptions, KPIs, and major risks.`,
    `Clearly state any assumptions where product or company context is unavailable.`
  ].join(' ');

  return {
    mode: 'better',
    prompt,
    shortReason: 'Calibrated target customer segment, market-entry approach, acquisition channels, 90-day launch roadmap, and explicit assumptions.',
    domain: 'business',
    calibratedDimensions: [
      'target customer segment',
      'market-entry approach',
      'acquisition channels',
    ],
    targetAi: analysis.targetAi,
  };
}

/**
 * Social Media Post (e.g. LinkedIn / Twitter) Calibration
 */
function constructSocialPostPrompt(analysis: TaskAnalysis): BetterPromptResponse {
  // Extract topic cleanly
  let topic = analysis.rawInput
    .replace(/^(can you|please|could you|help me)?\s*(write|draft|create|make)?\s*(a\s+)?(linkedin post|tweet|thread|post)\s+(about|on|regarding)\s+/i, '')
    .trim();

  if (!topic) topic = 'AI agents and practical workflows';

  const isLinkedIn = analysis.rawInput.toLowerCase().includes('linkedin');
  const platformName = isLinkedIn ? 'LinkedIn post' : 'social media post';

  const prompt = [
    `Write an engaging, high-impact ${platformName} about ${topic}.`,
    `Target professionals and technology practitioners with a compelling opening hook that challenges conventional thinking without relying on generic hype.`,
    `Break down 2-3 concrete practical applications or architectural insights, maintain an authentic and authoritative tone free of corporate clichés, use clean scannable line breaks, and conclude with a thoughtful discussion prompt to encourage comments.`
  ].join(' ');

  return {
    mode: 'better',
    prompt,
    shortReason: 'Calibrated professional opening hook, concrete practical takeaways, natural reading rhythm, and engaging discussion prompt.',
    domain: 'marketing',
    calibratedDimensions: [
      'professional opening hook',
      'concrete takeaways',
      'engagement prompt',
    ],
    targetAi: analysis.targetAi,
  };
}

/**
 * Code Debugging / Fix Calibration
 */
function constructCodeDebuggingPrompt(analysis: TaskAnalysis): BetterPromptResponse {
  let targetDesc = analysis.rawInput
    .replace(/^(can you|please|could you|help me)?\s*(analyze and fix|fix|debug|resolve)?\s*(this|the)?\s*/i, '')
    .trim();
  if (!targetDesc) targetDesc = 'this code';
  const prefix = /^(this|the)\b/i.test(targetDesc) ? targetDesc : `this ${targetDesc}`;

  const prompt = [
    `Analyze and fix ${prefix}.`,
    `Identify the root cause of the error or unexpected behavior, provide the corrected implementation with minimal necessary modifications, ensure robust defensive handling for edge cases and invalid inputs, and include a brief verification test confirming the fix.`
  ].join(' ');

  return {
    mode: 'better',
    prompt,
    shortReason: 'Calibrated root-cause diagnosis, minimal regression-free fix, edge-case guards, and verification test.',
    domain: 'code',
    calibratedDimensions: [
      'root-cause explanation',
      'minimal corrective diff',
      'verification test',
    ],
    targetAi: analysis.targetAi,
  };
}

/**
 * Code Refactoring Calibration
 */
function constructCodeRefactoringPrompt(analysis: TaskAnalysis): BetterPromptResponse {
  let refactorTarget = analysis.rawInput
    .replace(/^(can you|please|could you|help me)?\s*(refactor|clean up|optimize)?\s*(this|the)?\s*/i, '')
    .trim();
  if (!refactorTarget) refactorTarget = 'this code';
  const refactorPrefix = /^(this|the)\b/i.test(refactorTarget) ? refactorTarget : `this ${refactorTarget}`;

  const prompt = [
    `Refactor ${refactorPrefix} for production standards.`,
    `Improve modularity, readability, and performance while preserving existing behavior and external interfaces.`,
    `Eliminate code duplication, apply clear naming conventions, ensure comprehensive error handling, and provide the updated code with inline commentary explaining key improvements.`
  ].join(' ');

  return {
    mode: 'better',
    prompt,
    shortReason: 'Calibrated modularity, performance optimization, interface preservation, and error handling.',
    domain: 'code',
    calibratedDimensions: ['modularity', 'interface stability', 'error handling'],
    targetAi: analysis.targetAi,
  };
}

/**
 * Code Feature Implementation Calibration
 */
function constructCodeFeaturePrompt(analysis: TaskAnalysis): BetterPromptResponse {
  const rawLower = analysis.rawInput.toLowerCase();
  const artifactNoun = rawLower.includes('script')
    ? 'script'
    : rawLower.includes('function')
    ? 'function'
    : rawLower.includes('component')
    ? 'component'
    : 'solution';

  let spec = analysis.rawInput
    .replace(/^(can you|please|could you|help me|write|build|create|implement)?\s*(a\s+)?(python script|typescript script|script|function|api|component|program)?\s*(to|that)?\s*/i, '')
    .trim();

  if (!spec) spec = analysis.coreSubject;

  const isPython = rawLower.includes('python');
  const env = isPython ? 'Python 3.11+' : 'Modern TypeScript';

  const prompt = [
    `Implement a clean, production-ready ${isPython ? 'Python ' : ''}${artifactNoun} to ${spec}.`,
    `Use ${env} standards with modular structure, explicit type safety, defensive validation for edge cases and invalid inputs, clear error boundaries, and a runnable usage example with tests.`,
    `Avoid unnecessary external dependencies.`
  ].join(' ');

  return {
    mode: 'better',
    prompt,
    shortReason: `Calibrated ${env} architecture, strict type safety, defensive edge-case validation, and runnable test verification.`,
    domain: 'code',
    calibratedDimensions: ['environment standards', 'defensive edge cases', 'test verification'],
    targetAi: analysis.targetAi,
  };
}

/**
 * Marketing Campaign / Plan Calibration
 */
function constructMarketingCampaignPrompt(analysis: TaskAnalysis): BetterPromptResponse {
  let planTopic = analysis.rawInput
    .replace(/^(can you|please|could you|help me|make|create|develop|write)?\s*(a\s+)?(marketing plan|marketing strategy|campaign)?\s*(for)?\s*/i, '')
    .trim();

  if (!planTopic) planTopic = analysis.coreSubject;

  const prompt = [
    `Develop a strategic, high-impact marketing plan for ${planTopic}.`,
    `Define the target audience and customer profile, core positioning and messaging pillars, highest-leverage acquisition channels, recommended promotional tactics, timeline milestones, conversion KPIs, and a clear call to action.`,
    `Clearly state any assumptions where product or budget details are unspecified.`
  ].join(' ');

  return {
    mode: 'better',
    prompt,
    shortReason: 'Calibrated target audience profile, positioning pillars, channel mix, timeline milestones, and conversion KPIs.',
    domain: 'marketing',
    calibratedDimensions: ['target audience', 'positioning', 'conversion KPIs'],
    targetAi: analysis.targetAi,
  };
}

/**
 * Visual / Photographic Scene Calibration
 * (NO ARBITRARY INVENTION: e.g. Never invent "1974 Porsche 911" for "cool sports car")
 */
function constructVisualPrompt(analysis: TaskAnalysis): BetterPromptResponse {
  const rawLower = analysis.rawInput.toLowerCase();
  const isCar = rawLower.includes('sports car') || rawLower.includes('car');
  const isDesert = rawLower.includes('desert');
  const isSunset = rawLower.includes('sunset') || rawLower.includes('golden hour');

  let prompt = '';

  if (isCar && isDesert && isSunset) {
    // Subject without hallucinating a specific brand
    prompt = `Cinematic wide-angle tracking shot of a cool sports car driving through a desert landscape at sunset, dramatic golden hour warm backlighting, dust kicking up behind the vehicle, 24mm anamorphic lens with shallow depth of field, fine film grain, natural automotive photography.`;
  } else {
    let cleanSubject = analysis.rawInput
      .replace(/^(generate|create|draw|make|show me|a picture of|photo of|image of|render of)\s+/i, '')
      .trim();

    prompt = `Cinematic wide-angle shot of ${cleanSubject}, dramatic natural lighting with rich depth and soft shadows, shot on 35mm prime lens with shallow depth of field, tactile surface textures, authentic color grading, photorealistic composition.`;
  }

  return {
    mode: 'better',
    prompt,
    shortReason: 'Calibrated composition, 24mm anamorphic optics, golden hour backlighting, and atmospheric dust.',
    domain: 'image_gen',
    calibratedDimensions: ['lens optics', 'lighting & atmosphere', 'surface textures'],
    targetAi: analysis.targetAi,
  };
}

/**
 * Video Generation Calibration
 */
function constructVideoPrompt(analysis: TaskAnalysis): BetterPromptResponse {
  let subject = analysis.rawInput
    .replace(/^(generate|create|make|video clip of|video of)\s+/i, '')
    .trim();

  const prompt = `Cinematic continuous tracking camera movement capturing ${subject}, natural physical momentum and camera inertia, atmospheric volumetric lighting, 35mm filmic color palette, smooth temporal consistency with zero distortion.`;

  return {
    mode: 'better',
    prompt,
    shortReason: 'Calibrated continuous tracking velocity, physical inertia, and temporal coherence.',
    domain: 'video_gen',
    calibratedDimensions: ['camera movement', 'volumetric lighting', 'temporal coherence'],
    targetAi: analysis.targetAi,
  };
}

/**
 * Market Research Calibration
 */
function constructMarketResearchPrompt(analysis: TaskAnalysis): BetterPromptResponse {
  let topic = analysis.rawInput
    .replace(/^(research|conduct research on|analyze|explore|tell me about)\s+/i, '')
    .trim();

  const prompt = [
    `Conduct comprehensive research on ${topic}.`,
    `Map the market landscape across key segments, notable players, business models, funding trends, technological differentiators, regulatory and economic drivers, and primary growth barriers.`,
    `Include a structured comparative matrix and clearly state the timeframe and criteria used for selection.`
  ].join(' ');

  return {
    mode: 'better',
    prompt,
    shortReason: 'Calibrated landscape segmentation, funding & tech drivers, comparative matrix, and explicit timeframe criteria.',
    domain: 'research',
    calibratedDimensions: ['market segmentation', 'competitive matrix', 'selection criteria'],
    targetAi: analysis.targetAi,
  };
}

/**
 * Academic Research Calibration
 */
function constructAcademicResearchPrompt(analysis: TaskAnalysis): BetterPromptResponse {
  let topic = analysis.coreSubject;

  const prompt = [
    `Provide a rigorous analytical research synthesis on ${topic}.`,
    `Examine empirical findings and established theoretical models, analyze methodological trade-offs and potential confounders, synthesize competing perspectives with evidence standards, and highlight verified conclusions versus unresolved questions.`
  ].join(' ');

  return {
    mode: 'better',
    prompt,
    shortReason: 'Calibrated empirical framework, methodological trade-offs, and competing perspective synthesis.',
    domain: 'research',
    calibratedDimensions: ['empirical rigor', 'methodological trade-offs', 'comparative evidence'],
    targetAi: analysis.targetAi,
  };
}

/**
 * Direct-Response Copywriting Calibration
 */
function constructCopywritingPrompt(analysis: TaskAnalysis): BetterPromptResponse {
  let topic = analysis.coreSubject;

  const prompt = [
    `Develop compelling, high-converting copy for ${topic}.`,
    `Address the target buyer's primary pain point and emotional motivation, articulate a sharp value proposition with credibility proof points, provide 3 headline variations with high-clarity body copy, and conclude with an action-oriented call to action (CTA).`
  ].join(' ');

  return {
    mode: 'better',
    prompt,
    shortReason: 'Calibrated buyer pain points, sharp value proposition, headline variations, and clear CTA.',
    domain: 'marketing',
    calibratedDimensions: ['buyer motivation', 'value proposition', 'conversion CTA'],
    targetAi: analysis.targetAi,
  };
}

/**
 * Article & Editorial Writing Calibration
 */
function constructArticlePrompt(analysis: TaskAnalysis): BetterPromptResponse {
  let topic = analysis.coreSubject;

  const prompt = [
    `Draft a polished, comprehensive article on ${topic}.`,
    `Open with an insightful hook that reframes the topic, build a coherent narrative with concrete real-world evidence and examples, maintain an authoritative and engaging voice free of AI clichés, and deliver a memorable, actionable conclusion.`
  ].join(' ');

  return {
    mode: 'better',
    prompt,
    shortReason: 'Calibrated narrative hook, real-world evidence, cadence, and actionable takeaway.',
    domain: 'writing',
    calibratedDimensions: ['opening hook', 'editorial voice', 'actionable takeaway'],
    targetAi: analysis.targetAi,
  };
}

/**
 * Creative Writing Calibration
 */
function constructCreativeWritingPrompt(analysis: TaskAnalysis): BetterPromptResponse {
  let topic = analysis.coreSubject;

  const prompt = [
    `Write a compelling narrative scene exploring ${topic}.`,
    `Establish atmospheric world-building with tactile sensory details, ground character actions in clear motivations and emotional tension, balance natural dialogue with pacing, and create a resonant thematic arc.`
  ].join(' ');

  return {
    mode: 'better',
    prompt,
    shortReason: 'Calibrated sensory world-building, character motivation, dialogue pacing, and thematic tension.',
    domain: 'writing',
    calibratedDimensions: ['sensory details', 'character motivation', 'thematic arc'],
    targetAi: analysis.targetAi,
  };
}

/**
 * Business Strategy Calibration
 */
function constructBusinessStrategyPrompt(analysis: TaskAnalysis): BetterPromptResponse {
  let topic = analysis.coreSubject;

  const prompt = [
    `Develop a structured strategic plan for ${topic}.`,
    `Identify core opportunities and target market requirements, establish a phased 30-60-90 day execution roadmap, define resource allocation priorities and operational trade-offs, and specify measurable KPIs alongside risk mitigation plans.`,
    `Explicitly state any assumptions where company or financial data is unspecified.`
  ].join(' ');

  return {
    mode: 'better',
    prompt,
    shortReason: 'Calibrated opportunity sizing, phased 90-day roadmap, operational trade-offs, and KPI metrics.',
    domain: 'business',
    calibratedDimensions: ['opportunity sizing', 'phased roadmap', 'KPIs & risks'],
    targetAi: analysis.targetAi,
  };
}

/**
 * Data Analysis Calibration
 */
function constructDataAnalysisPrompt(analysis: TaskAnalysis): BetterPromptResponse {
  let topic = analysis.coreSubject;

  const prompt = [
    `Perform a thorough analytical evaluation of ${topic}.`,
    `Identify core distributions, anomalous patterns, and statistically significant correlations, provide practical interpretation of business implications, and present findings with clear visual structure and actionable recommendations.`
  ].join(' ');

  return {
    mode: 'better',
    prompt,
    shortReason: 'Calibrated statistical distributions, anomaly detection, business interpretation, and actionable recommendations.',
    domain: 'data',
    calibratedDimensions: ['statistical distributions', 'anomaly detection', 'business impact'],
    targetAi: analysis.targetAi,
  };
}

/**
 * General Calibrated Instruction
 */
function constructGeneralCalibratedPrompt(analysis: TaskAnalysis): BetterPromptResponse {
  const prompt = [
    `Please address the following with structured clarity and depth:`,
    `"${analysis.coreSubject}"`,
    `Provide a direct, high-value answer upfront, break down key factors and practical execution steps with clear headings, include concrete examples or edge cases where relevant, and state any necessary assumptions clearly.`
  ].join('\n\n');

  return {
    mode: 'better',
    prompt,
    shortReason: 'Calibrated upfront thesis, structured breakdown, practical examples, and clear assumptions.',
    domain: 'general',
    calibratedDimensions: ['structural clarity', 'execution criteria', 'explicit assumptions'],
    targetAi: analysis.targetAi,
  };
}
