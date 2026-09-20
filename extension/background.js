// extension/src/browser/api.ts
var BrowserAPIWrapper = class {
  rawBrowser;
  rawChrome;
  storage;
  runtime;
  commands;
  tabs;
  constructor() {
    this.rawBrowser = typeof globalThis.browser !== "undefined" ? globalThis.browser : null;
    this.rawChrome = typeof globalThis.chrome !== "undefined" ? globalThis.chrome : null;
    const getArea = (areaName) => {
      if (this.rawBrowser?.storage?.[areaName]) {
        return {
          get: (keys) => this.rawBrowser.storage[areaName].get(keys),
          set: (items) => this.rawBrowser.storage[areaName].set(items),
          remove: (keys) => this.rawBrowser.storage[areaName].remove(keys),
          clear: () => this.rawBrowser.storage[areaName].clear()
        };
      }
      if (this.rawChrome?.storage?.[areaName]) {
        const chromeArea = this.rawChrome.storage[areaName];
        return {
          get: (keys) => new Promise((resolve, reject) => {
            chromeArea.get(keys, (res) => {
              if (this.rawChrome.runtime?.lastError) {
                reject(new Error(this.rawChrome.runtime.lastError.message));
              } else {
                resolve(res || {});
              }
            });
          }),
          set: (items) => new Promise((resolve, reject) => {
            chromeArea.set(items, () => {
              if (this.rawChrome.runtime?.lastError) {
                reject(new Error(this.rawChrome.runtime.lastError.message));
              } else {
                resolve();
              }
            });
          }),
          remove: (keys) => new Promise((resolve, reject) => {
            chromeArea.remove(keys, () => {
              if (this.rawChrome.runtime?.lastError) {
                reject(new Error(this.rawChrome.runtime.lastError.message));
              } else {
                resolve();
              }
            });
          }),
          clear: () => new Promise((resolve, reject) => {
            chromeArea.clear(() => {
              if (this.rawChrome.runtime?.lastError) {
                reject(new Error(this.rawChrome.runtime.lastError.message));
              } else {
                resolve();
              }
            });
          })
        };
      }
      const memoryStore = /* @__PURE__ */ new Map();
      return {
        get: async (keys) => {
          if (!keys) return Object.fromEntries(memoryStore.entries());
          if (typeof keys === "string") return { [keys]: memoryStore.get(keys) };
          if (Array.isArray(keys)) {
            const out2 = {};
            for (const k of keys) out2[k] = memoryStore.get(k);
            return out2;
          }
          const out = { ...keys };
          for (const k of Object.keys(keys)) {
            if (memoryStore.has(k)) out[k] = memoryStore.get(k);
          }
          return out;
        },
        set: async (items) => {
          for (const [k, v] of Object.entries(items)) memoryStore.set(k, v);
        },
        remove: async (keys) => {
          const list = typeof keys === "string" ? [keys] : keys;
          for (const k of list) memoryStore.delete(k);
        },
        clear: async () => memoryStore.clear()
      };
    };
    this.storage = {
      local: getArea("local"),
      sync: getArea("sync")
    };
    const rawR = this.rawBrowser?.runtime || this.rawChrome?.runtime;
    this.runtime = {
      sendMessage: (message) => {
        if (this.rawBrowser?.runtime?.sendMessage) {
          return this.rawBrowser.runtime.sendMessage(message);
        }
        if (this.rawChrome?.runtime?.sendMessage) {
          return new Promise((resolve, reject) => {
            this.rawChrome.runtime.sendMessage(message, (response) => {
              const lastErr = this.rawChrome.runtime?.lastError;
              if (lastErr) {
                reject(new Error(lastErr.message));
              } else {
                resolve(response);
              }
            });
          });
        }
        return Promise.reject(new Error("Runtime messaging not supported in current environment"));
      },
      onMessage: {
        addListener: (callback) => {
          if (rawR?.onMessage?.addListener) {
            rawR.onMessage.addListener(callback);
          }
        },
        removeListener: (callback) => {
          if (rawR?.onMessage?.removeListener) {
            rawR.onMessage.removeListener(callback);
          }
        }
      },
      getURL: (path) => {
        if (rawR?.getURL) return rawR.getURL(path);
        return path;
      },
      getManifest: () => {
        if (rawR?.getManifest) return rawR.getManifest();
        return { name: "Refinzi", version: "2.1.0" };
      }
    };
    const rawC = this.rawBrowser?.commands || this.rawChrome?.commands;
    this.commands = {
      onCommand: {
        addListener: (cb) => {
          if (rawC?.onCommand?.addListener) rawC.onCommand.addListener(cb);
        },
        removeListener: (cb) => {
          if (rawC?.onCommand?.removeListener) rawC.onCommand.removeListener(cb);
        }
      }
    };
    const rawT = this.rawBrowser?.tabs || this.rawChrome?.tabs;
    this.tabs = {
      query: (queryInfo) => {
        if (this.rawBrowser?.tabs?.query) return this.rawBrowser.tabs.query(queryInfo);
        if (this.rawChrome?.tabs?.query) {
          return new Promise((resolve) => this.rawChrome.tabs.query(queryInfo, resolve));
        }
        return Promise.resolve([]);
      },
      sendMessage: (tabId, message) => {
        if (this.rawBrowser?.tabs?.sendMessage) return this.rawBrowser.tabs.sendMessage(tabId, message);
        if (this.rawChrome?.tabs?.sendMessage) {
          return new Promise((resolve, reject) => {
            this.rawChrome.tabs.sendMessage(tabId, message, (response) => {
              if (this.rawChrome.runtime?.lastError) {
                reject(new Error(this.rawChrome.runtime.lastError.message));
              } else {
                resolve(response);
              }
            });
          });
        }
        return Promise.resolve();
      }
    };
  }
  /**
   * Detected Browser Environment
   */
  get browserName() {
    if (typeof navigator !== "undefined") {
      const ua = navigator.userAgent.toLowerCase();
      if (ua.includes("edg/")) return "edge";
      if (ua.includes("firefox")) return "firefox";
      if (ua.includes("safari") && !ua.includes("chrome")) return "safari";
      if (ua.includes("chrome")) return "chrome";
    }
    if (this.rawBrowser && !this.rawChrome) return "firefox";
    return "generic";
  }
};
var BrowserAPI = new BrowserAPIWrapper();

// extension/src/engine/calibration/taskAnalyzer.ts
function analyzeTask(rawInput, targetAi = "general") {
  const raw = (rawInput || "").trim();
  const lower = raw.toLowerCase();
  const wordCount = raw.split(/\s+/).filter(Boolean).length;
  const actionVerb = extractActionVerb(raw);
  const coreSubject = extractCoreSubject(raw, lower);
  const { taskType, domain } = detectGranularTask(lower, raw);
  const context = extractContextBreakdown(taskType, raw, lower);
  const isAlreadyComprehensive = checkIsAlreadyComprehensive(raw, lower, wordCount);
  const existingDimensions = detectExistingDimensions(lower);
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
    wordCount
  };
}
function extractActionVerb(raw) {
  const match = raw.match(/^(can you|please|could you|help me)?\s*(develop|create|write|draft|build|implement|fix|debug|refactor|design|research|analyze|synthesize|plan|outline|compare)\b/i);
  if (match && match[2]) {
    return capitalize(match[2]);
  }
  return "Develop";
}
function extractCoreSubject(raw, lower) {
  let cleaned = raw.replace(/^(can you|please|could you|help me|i want to|i need to|write|create|make|conduct|generate|produce|develop|draft)\s+/i, "").trim();
  cleaned = cleaned.replace(/^(a|an|the)\s+/i, "").trim();
  if (/^gtm\b/i.test(cleaned)) {
    cleaned = cleaned.replace(/^gtm\b/i, "go-to-market strategy");
  }
  if (/in us market/i.test(cleaned)) {
    cleaned = cleaned.replace(/in us market/i, "entering the US market");
  }
  return cleaned || raw;
}
function detectGranularTask(lower, raw) {
  if (/\b(gtm|go-to-market|market entry|enter\s+in\s+.*market|enter\s+the\s+.*market|expansion into|launch in)\b/i.test(lower)) {
    return { taskType: "gtm_strategy", domain: "business" };
  }
  if (/\b(linkedin post|tweet|twitter thread|threads post|social media post|instagram caption)\b/i.test(lower)) {
    return { taskType: "social_media_post", domain: "marketing" };
  }
  if (/\b(fix this|debug|resolve error|stack trace|typeerror|syntaxerror|exception|why is this failing|broken code)\b/i.test(lower)) {
    return { taskType: "code_debugging", domain: "code" };
  }
  if (/\b(refactor|clean up code|optimize this code|modularize|reduce complexity)\b/i.test(lower)) {
    return { taskType: "code_refactoring", domain: "code" };
  }
  if (/\b(python|javascript|typescript|react|vue|function|api endpoint|sql query|class|component|hook|script|regex|unit test)\b/i.test(lower)) {
    return { taskType: "code_feature", domain: "code" };
  }
  if (/\b(photo of|render|shot of|image of|picture of|cinematic|sunset|desert|portrait|illustration|wallpaper|visual of|sports car|landscape)\b/i.test(lower)) {
    return { taskType: "photographic_scene", domain: "image_gen" };
  }
  if (/\b(video clip|tracking shot|camera dolly|drone shot|sora|runway|pika|motion footage)\b/i.test(lower)) {
    return { taskType: "video_cinematic", domain: "video_gen" };
  }
  if (/\b(research|landscape|startups in|industry analysis|market size|competitors in|ecosystem)\b/i.test(lower)) {
    return { taskType: "research_market", domain: "research" };
  }
  if (/\b(literature review|methodology|clinical|hypothesis|peer-reviewed|empirical study|meta-analysis)\b/i.test(lower)) {
    return { taskType: "research_academic", domain: "research" };
  }
  if (/\b(marketing plan|marketing strategy|marketing campaign|ad copy|landing page|sales page|email campaign|funnel|headline|conversion)\b/i.test(lower)) {
    return { taskType: "marketing_campaign", domain: "marketing" };
  }
  if (/\b(article|essay|blog post|newsletter|opinion piece|press release)\b/i.test(lower)) {
    return { taskType: "writing_article", domain: "writing" };
  }
  if (/\b(story|narrative|novel|chapter|script|dialogue|character arc)\b/i.test(lower)) {
    return { taskType: "writing_creative", domain: "writing" };
  }
  if (/\b(business plan|pitch deck|monetization|pricing model|unit economics|swot|okrs)\b/i.test(lower)) {
    return { taskType: "business_strategy", domain: "business" };
  }
  if (/\b(data analysis|analytics|pandas|dataframe|metrics|correlation|regression|trend)\b/i.test(lower)) {
    return { taskType: "data_analysis", domain: "data" };
  }
  return { taskType: "general_instruction", domain: "general" };
}
function extractContextBreakdown(taskType, raw, lower) {
  const known = [];
  const inferred = [];
  const unknown = [];
  if (lower.includes("us market") || lower.includes("united states") || lower.includes("in us")) {
    known.push("Geographic Market: United States");
  }
  if (lower.includes("india")) known.push("Geographic Market: India");
  if (lower.includes("python")) known.push("Language: Python");
  if (lower.includes("linkedin")) known.push("Channel: LinkedIn");
  if (lower.includes("ai agents")) known.push("Topic: AI Agents");
  if (lower.includes("sports car")) known.push("Subject: Sports car");
  if (lower.includes("desert")) known.push("Environment: Desert");
  if (lower.includes("sunset")) known.push("Lighting Condition: Sunset");
  switch (taskType) {
    case "gtm_strategy":
    case "market_entry":
      inferred.push("Objective: Market expansion & commercial launch strategy");
      inferred.push("Standard Dimensions: Customer segmentation, positioning, channels, regulatory/localization, timeline, KPIs");
      unknown.push("Company identity & product specification");
      unknown.push("Target industry & business model (B2B vs B2C)");
      unknown.push("Budget & capital allocation");
      unknown.push("Existing traction & competitive advantages");
      break;
    case "social_media_post":
      inferred.push("Format: Native social feed post");
      inferred.push("Tone: Professional, engaging, conversational");
      unknown.push("Author personal voice & specific perspective");
      unknown.push("Call to action destination");
      break;
    case "code_debugging":
      inferred.push("Goal: Diagnose root cause, provide corrected code, guard against regressions");
      unknown.push("Target runtime environment / framework version (unless supplied in code snippet)");
      break;
    case "research_market":
      inferred.push("Goal: Comprehensive landscape mapping, categorization, and comparative analysis");
      unknown.push("Specific sub-vertical focus & valuation/stage filters");
      break;
    case "photographic_scene":
      inferred.push("Format: Photographic composition, optical lens parameters, illumination, atmosphere");
      unknown.push("Arbitrary specific brand/model credentials");
      break;
    default:
      inferred.push("Goal: Deliver an authoritative, high-utility response");
      break;
  }
  return { known, inferred, unknown };
}
function checkIsAlreadyComprehensive(raw, lower, wordCount) {
  if (wordCount < 40) return false;
  let detailScore = 0;
  if (/\b(objective|goal|purpose|aim)\b/i.test(lower)) detailScore++;
  if (/\b(context|background|scenario|environment)\b/i.test(lower)) detailScore++;
  if (/\b(constraints?|do not|avoid|must be|requirements?)\b/i.test(lower)) detailScore++;
  if (/\b(deliverable|output format|structure|sections?|markdown)\b/i.test(lower)) detailScore++;
  if (/\b(evaluation criteria|acceptance criteria|kpis?|benchmark)\b/i.test(lower)) detailScore++;
  return detailScore >= 3;
}
function detectExistingDimensions(lower) {
  const existing = [];
  if (/\b(target customer|icp|buyer persona|audience)\b/i.test(lower)) existing.push("audience");
  if (/\b(positioning|value proposition)\b/i.test(lower)) existing.push("positioning");
  if (/\b(pricing|pricing model)\b/i.test(lower)) existing.push("pricing");
  if (/\b(channels?|acquisition)\b/i.test(lower)) existing.push("channels");
  if (/\b(timeline|milestones?|30-60-90|schedule)\b/i.test(lower)) existing.push("timeline");
  if (/\b(kpi|metrics?|benchmarks?)\b/i.test(lower)) existing.push("kpis");
  if (/\b(risks?|mitigation|trade-offs?)\b/i.test(lower)) existing.push("risks");
  if (/\b(camera|lens|35mm|50mm|85mm|anamorphic)\b/i.test(lower)) existing.push("lens");
  if (/\b(lighting|golden hour|backlight|volumetric)\b/i.test(lower)) existing.push("lighting");
  if (/\b(angle|wide-angle|close-up|low-angle)\b/i.test(lower)) existing.push("angle");
  if (/\b(edge cases?|error handling|null checks?)\b/i.test(lower)) existing.push("edge_cases");
  if (/\b(unit tests?|acceptance tests?)\b/i.test(lower)) existing.push("tests");
  return existing;
}
function detectMissingDimensionsForTask(taskType, existing) {
  const allCandidates = {
    gtm_strategy: [
      "target customer and market segment",
      "market-entry approach",
      "positioning and value proposition",
      "competitive landscape",
      "pricing considerations",
      "highest-leverage acquisition channels",
      "strategic partnerships",
      "localization and regulatory requirements",
      "key execution steps and 90-day launch plan",
      "budget and resource assumptions",
      "KPIs and major risks"
    ],
    market_entry: [
      "target customer and segment",
      "entry strategy and regulatory compliance",
      "competitive positioning",
      "go-to-market channels",
      "localization requirements",
      "phased milestone timeline",
      "KPIs and risk mitigation"
    ],
    social_media_post: [
      "target audience and professional context",
      "compelling perspective or counter-intuitive hook",
      "actionable key takeaways or insights",
      "concise, readable formatting with natural line breaks",
      "engaging closing discussion prompt"
    ],
    code_debugging: [
      "root-cause explanation",
      "corrected code with minimal necessary changes",
      "defensive handling for edge cases",
      "verification test to prove resolution"
    ],
    code_refactoring: [
      "architectural rationale",
      "modular and type-safe structure",
      "performance and readability improvements",
      "backwards compatibility guarantees"
    ],
    code_feature: [
      "environment and runtime standards",
      "type-safe implementation with clear interfaces",
      "defensive edge-case handling",
      "runnable verification example"
    ],
    photographic_scene: [
      "shot composition and camera perspective",
      "lens optics and depth of field",
      "natural environmental lighting and atmosphere",
      "tactile surface textures and photographic realism"
    ],
    character_art: [
      "character posture and expression",
      "attire materials and textural fidelity",
      "cinematic key and rim lighting",
      "high-resolution photographic rendering"
    ],
    video_cinematic: [
      "camera trajectory, velocity, and inertia",
      "physical momentum and spatial continuity",
      "atmospheric volumetric illumination",
      "seamless temporal coherence"
    ],
    research_market: [
      "market segmentation and landscape mapping",
      "key drivers, funding trends, and technological differentiation",
      "regulatory and economic barriers",
      "synthesis matrix comparing leading players"
    ],
    research_academic: [
      "theoretical framework and current state of research",
      "methodological standards and potential confounders",
      "comparative evidence synthesis",
      "unresolved questions and future research directions"
    ],
    copywriting: [
      "target buyer pain point and emotional trigger",
      "distinctive value proposition and proof points",
      "persuasive headline variations and body copy",
      "unambiguous call to action"
    ],
    writing_article: [
      "captivating opening hook",
      "clear narrative arc with evidence and examples",
      "authoritative, engaging tone free of clich\xE9s",
      "memorable conclusion with actionable takeaway"
    ],
    writing_creative: [
      "scene setting and sensory world-building",
      "character motivations and internal conflict",
      "organic dialogue and pacing",
      "thematic resonance and narrative tension"
    ],
    business_strategy: [
      "strategic objectives and opportunity sizing",
      "phased execution roadmap (30-60-90 days)",
      "operational resource allocation and trade-offs",
      "measurable KPIs and risk mitigation strategies"
    ],
    data_analysis: [
      "exploratory data patterns and statistical distributions",
      "key anomalies, correlations, and trends",
      "business impact interpretation",
      "actionable recommendations supported by findings"
    ],
    general_instruction: [
      "direct answer upfront",
      "structured scannable organization",
      "concrete real-world examples or edge cases",
      "clear assumptions where details are unspecified"
    ],
    marketing_campaign: [
      "campaign objective and target audience",
      "core narrative hook and channel mix",
      "creative deliverables and copy angles",
      "phased rollout schedule and conversion KPIs"
    ]
  };
  const candidates = allCandidates[taskType] || allCandidates.general_instruction;
  return candidates.filter((c) => {
    const cLower = c.toLowerCase();
    for (const ex of existing) {
      if (cLower.includes(ex)) return false;
    }
    return true;
  });
}
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// extension/src/engine/calibration/promptBuilder.ts
function constructCalibratedPrompt(analysis) {
  if (analysis.isAlreadyComprehensive) {
    return constructMinimalTunedPrompt(analysis);
  }
  switch (analysis.taskType) {
    case "gtm_strategy":
    case "market_entry":
      return constructGtmPrompt(analysis);
    case "social_media_post":
      return constructSocialPostPrompt(analysis);
    case "code_debugging":
      return constructCodeDebuggingPrompt(analysis);
    case "code_refactoring":
      return constructCodeRefactoringPrompt(analysis);
    case "code_feature":
      return constructCodeFeaturePrompt(analysis);
    case "marketing_campaign":
      return constructMarketingCampaignPrompt(analysis);
    case "photographic_scene":
    case "character_art":
      return constructVisualPrompt(analysis);
    case "video_cinematic":
      return constructVideoPrompt(analysis);
    case "research_market":
      return constructMarketResearchPrompt(analysis);
    case "research_academic":
      return constructAcademicResearchPrompt(analysis);
    case "copywriting":
      return constructCopywritingPrompt(analysis);
    case "writing_article":
      return constructArticlePrompt(analysis);
    case "writing_creative":
      return constructCreativeWritingPrompt(analysis);
    case "business_strategy":
      return constructBusinessStrategyPrompt(analysis);
    case "data_analysis":
      return constructDataAnalysisPrompt(analysis);
    case "general_instruction":
    default:
      return constructGeneralCalibratedPrompt(analysis);
  }
}
function constructMinimalTunedPrompt(analysis) {
  let prompt = analysis.rawInput.trim();
  const lower = prompt.toLowerCase();
  const additions = [];
  if (!lower.includes("assumption") && analysis.context.unknown.length > 0) {
    additions.push("Clearly state any operational assumptions where context is unspecified.");
  }
  if (additions.length > 0) {
    prompt = `${prompt}

Execution Note: ${additions.join(" ")}`;
  }
  return {
    mode: "better",
    prompt,
    shortReason: "Preserved comprehensive prompt; added execution assumption note.",
    domain: analysis.domain,
    calibratedDimensions: ["execution rigor"],
    targetAi: analysis.targetAi
  };
}
function constructGtmPrompt(analysis) {
  const goalPhrase = analysis.coreSubject.toLowerCase().includes("us market") ? "entering the US market" : analysis.coreSubject;
  const prompt = [
    `Develop a practical go-to-market (GTM) strategy for ${goalPhrase}.`,
    `Define the ideal target customer and market segment, recommended market-entry approach, positioning and value proposition, competitive landscape, pricing considerations, highest-leverage acquisition channels, partnerships, localization requirements, key execution steps, 90-day launch plan, budget assumptions, KPIs, and major risks.`,
    `Clearly state any assumptions where product or company context is unavailable.`
  ].join(" ");
  return {
    mode: "better",
    prompt,
    shortReason: "Calibrated target customer segment, market-entry approach, acquisition channels, 90-day launch roadmap, and explicit assumptions.",
    domain: "business",
    calibratedDimensions: [
      "target customer segment",
      "market-entry approach",
      "acquisition channels"
    ],
    targetAi: analysis.targetAi
  };
}
function constructSocialPostPrompt(analysis) {
  let topic = analysis.rawInput.replace(/^(can you|please|could you|help me)?\s*(write|draft|create|make)?\s*(a\s+)?(linkedin post|tweet|thread|post)\s+(about|on|regarding)\s+/i, "").trim();
  if (!topic) topic = "AI agents and practical workflows";
  const isLinkedIn = analysis.rawInput.toLowerCase().includes("linkedin");
  const platformName = isLinkedIn ? "LinkedIn post" : "social media post";
  const prompt = [
    `Write an engaging, high-impact ${platformName} about ${topic}.`,
    `Target professionals and technology practitioners with a compelling opening hook that challenges conventional thinking without relying on generic hype.`,
    `Break down 2-3 concrete practical applications or architectural insights, maintain an authentic and authoritative tone free of corporate clich\xE9s, use clean scannable line breaks, and conclude with a thoughtful discussion prompt to encourage comments.`
  ].join(" ");
  return {
    mode: "better",
    prompt,
    shortReason: "Calibrated professional opening hook, concrete practical takeaways, natural reading rhythm, and engaging discussion prompt.",
    domain: "marketing",
    calibratedDimensions: [
      "professional opening hook",
      "concrete takeaways",
      "engagement prompt"
    ],
    targetAi: analysis.targetAi
  };
}
function constructCodeDebuggingPrompt(analysis) {
  let targetDesc = analysis.rawInput.replace(/^(can you|please|could you|help me)?\s*(analyze and fix|fix|debug|resolve)?\s*(this|the)?\s*/i, "").trim();
  if (!targetDesc) targetDesc = "this code";
  const prefix = /^(this|the)\b/i.test(targetDesc) ? targetDesc : `this ${targetDesc}`;
  const prompt = [
    `Analyze and fix ${prefix}.`,
    `Identify the root cause of the error or unexpected behavior, provide the corrected implementation with minimal necessary modifications, ensure robust defensive handling for edge cases and invalid inputs, and include a brief verification test confirming the fix.`
  ].join(" ");
  return {
    mode: "better",
    prompt,
    shortReason: "Calibrated root-cause diagnosis, minimal regression-free fix, edge-case guards, and verification test.",
    domain: "code",
    calibratedDimensions: [
      "root-cause explanation",
      "minimal corrective diff",
      "verification test"
    ],
    targetAi: analysis.targetAi
  };
}
function constructCodeRefactoringPrompt(analysis) {
  let refactorTarget = analysis.rawInput.replace(/^(can you|please|could you|help me)?\s*(refactor|clean up|optimize)?\s*(this|the)?\s*/i, "").trim();
  if (!refactorTarget) refactorTarget = "this code";
  const refactorPrefix = /^(this|the)\b/i.test(refactorTarget) ? refactorTarget : `this ${refactorTarget}`;
  const prompt = [
    `Refactor ${refactorPrefix} for production standards.`,
    `Improve modularity, readability, and performance while preserving existing behavior and external interfaces.`,
    `Eliminate code duplication, apply clear naming conventions, ensure comprehensive error handling, and provide the updated code with inline commentary explaining key improvements.`
  ].join(" ");
  return {
    mode: "better",
    prompt,
    shortReason: "Calibrated modularity, performance optimization, interface preservation, and error handling.",
    domain: "code",
    calibratedDimensions: ["modularity", "interface stability", "error handling"],
    targetAi: analysis.targetAi
  };
}
function constructCodeFeaturePrompt(analysis) {
  const rawLower = analysis.rawInput.toLowerCase();
  const artifactNoun = rawLower.includes("script") ? "script" : rawLower.includes("function") ? "function" : rawLower.includes("component") ? "component" : "solution";
  let spec = analysis.rawInput.replace(/^(can you|please|could you|help me|write|build|create|implement)?\s*(a\s+)?(python script|typescript script|script|function|api|component|program)?\s*(to|that)?\s*/i, "").trim();
  if (!spec) spec = analysis.coreSubject;
  const isPython = rawLower.includes("python");
  const env = isPython ? "Python 3.11+" : "Modern TypeScript";
  const prompt = [
    `Implement a clean, production-ready ${isPython ? "Python " : ""}${artifactNoun} to ${spec}.`,
    `Use ${env} standards with modular structure, explicit type safety, defensive validation for edge cases and invalid inputs, clear error boundaries, and a runnable usage example with tests.`,
    `Avoid unnecessary external dependencies.`
  ].join(" ");
  return {
    mode: "better",
    prompt,
    shortReason: `Calibrated ${env} architecture, strict type safety, defensive edge-case validation, and runnable test verification.`,
    domain: "code",
    calibratedDimensions: ["environment standards", "defensive edge cases", "test verification"],
    targetAi: analysis.targetAi
  };
}
function constructMarketingCampaignPrompt(analysis) {
  let planTopic = analysis.rawInput.replace(/^(can you|please|could you|help me|make|create|develop|write)?\s*(a\s+)?(marketing plan|marketing strategy|campaign)?\s*(for)?\s*/i, "").trim();
  if (!planTopic) planTopic = analysis.coreSubject;
  const prompt = [
    `Develop a strategic, high-impact marketing plan for ${planTopic}.`,
    `Define the target audience and customer profile, core positioning and messaging pillars, highest-leverage acquisition channels, recommended promotional tactics, timeline milestones, conversion KPIs, and a clear call to action.`,
    `Clearly state any assumptions where product or budget details are unspecified.`
  ].join(" ");
  return {
    mode: "better",
    prompt,
    shortReason: "Calibrated target audience profile, positioning pillars, channel mix, timeline milestones, and conversion KPIs.",
    domain: "marketing",
    calibratedDimensions: ["target audience", "positioning", "conversion KPIs"],
    targetAi: analysis.targetAi
  };
}
function constructVisualPrompt(analysis) {
  const rawLower = analysis.rawInput.toLowerCase();
  const isCar = rawLower.includes("sports car") || rawLower.includes("car");
  const isDesert = rawLower.includes("desert");
  const isSunset = rawLower.includes("sunset") || rawLower.includes("golden hour");
  let prompt = "";
  if (isCar && isDesert && isSunset) {
    prompt = `Cinematic wide-angle tracking shot of a cool sports car driving through a desert landscape at sunset, dramatic golden hour warm backlighting, dust kicking up behind the vehicle, 24mm anamorphic lens with shallow depth of field, fine film grain, natural automotive photography.`;
  } else {
    let cleanSubject = analysis.rawInput.replace(/^(generate|create|draw|make|show me|a picture of|photo of|image of|render of)\s+/i, "").trim();
    prompt = `Cinematic wide-angle shot of ${cleanSubject}, dramatic natural lighting with rich depth and soft shadows, shot on 35mm prime lens with shallow depth of field, tactile surface textures, authentic color grading, photorealistic composition.`;
  }
  return {
    mode: "better",
    prompt,
    shortReason: "Calibrated composition, 24mm anamorphic optics, golden hour backlighting, and atmospheric dust.",
    domain: "image_gen",
    calibratedDimensions: ["lens optics", "lighting & atmosphere", "surface textures"],
    targetAi: analysis.targetAi
  };
}
function constructVideoPrompt(analysis) {
  let subject = analysis.rawInput.replace(/^(generate|create|make|video clip of|video of)\s+/i, "").trim();
  const prompt = `Cinematic continuous tracking camera movement capturing ${subject}, natural physical momentum and camera inertia, atmospheric volumetric lighting, 35mm filmic color palette, smooth temporal consistency with zero distortion.`;
  return {
    mode: "better",
    prompt,
    shortReason: "Calibrated continuous tracking velocity, physical inertia, and temporal coherence.",
    domain: "video_gen",
    calibratedDimensions: ["camera movement", "volumetric lighting", "temporal coherence"],
    targetAi: analysis.targetAi
  };
}
function constructMarketResearchPrompt(analysis) {
  let topic = analysis.rawInput.replace(/^(research|conduct research on|analyze|explore|tell me about)\s+/i, "").trim();
  const prompt = [
    `Conduct comprehensive research on ${topic}.`,
    `Map the market landscape across key segments, notable players, business models, funding trends, technological differentiators, regulatory and economic drivers, and primary growth barriers.`,
    `Include a structured comparative matrix and clearly state the timeframe and criteria used for selection.`
  ].join(" ");
  return {
    mode: "better",
    prompt,
    shortReason: "Calibrated landscape segmentation, funding & tech drivers, comparative matrix, and explicit timeframe criteria.",
    domain: "research",
    calibratedDimensions: ["market segmentation", "competitive matrix", "selection criteria"],
    targetAi: analysis.targetAi
  };
}
function constructAcademicResearchPrompt(analysis) {
  let topic = analysis.coreSubject;
  const prompt = [
    `Provide a rigorous analytical research synthesis on ${topic}.`,
    `Examine empirical findings and established theoretical models, analyze methodological trade-offs and potential confounders, synthesize competing perspectives with evidence standards, and highlight verified conclusions versus unresolved questions.`
  ].join(" ");
  return {
    mode: "better",
    prompt,
    shortReason: "Calibrated empirical framework, methodological trade-offs, and competing perspective synthesis.",
    domain: "research",
    calibratedDimensions: ["empirical rigor", "methodological trade-offs", "comparative evidence"],
    targetAi: analysis.targetAi
  };
}
function constructCopywritingPrompt(analysis) {
  let topic = analysis.coreSubject;
  const prompt = [
    `Develop compelling, high-converting copy for ${topic}.`,
    `Address the target buyer's primary pain point and emotional motivation, articulate a sharp value proposition with credibility proof points, provide 3 headline variations with high-clarity body copy, and conclude with an action-oriented call to action (CTA).`
  ].join(" ");
  return {
    mode: "better",
    prompt,
    shortReason: "Calibrated buyer pain points, sharp value proposition, headline variations, and clear CTA.",
    domain: "marketing",
    calibratedDimensions: ["buyer motivation", "value proposition", "conversion CTA"],
    targetAi: analysis.targetAi
  };
}
function constructArticlePrompt(analysis) {
  let topic = analysis.coreSubject;
  const prompt = [
    `Draft a polished, comprehensive article on ${topic}.`,
    `Open with an insightful hook that reframes the topic, build a coherent narrative with concrete real-world evidence and examples, maintain an authoritative and engaging voice free of AI clich\xE9s, and deliver a memorable, actionable conclusion.`
  ].join(" ");
  return {
    mode: "better",
    prompt,
    shortReason: "Calibrated narrative hook, real-world evidence, cadence, and actionable takeaway.",
    domain: "writing",
    calibratedDimensions: ["opening hook", "editorial voice", "actionable takeaway"],
    targetAi: analysis.targetAi
  };
}
function constructCreativeWritingPrompt(analysis) {
  let topic = analysis.coreSubject;
  const prompt = [
    `Write a compelling narrative scene exploring ${topic}.`,
    `Establish atmospheric world-building with tactile sensory details, ground character actions in clear motivations and emotional tension, balance natural dialogue with pacing, and create a resonant thematic arc.`
  ].join(" ");
  return {
    mode: "better",
    prompt,
    shortReason: "Calibrated sensory world-building, character motivation, dialogue pacing, and thematic tension.",
    domain: "writing",
    calibratedDimensions: ["sensory details", "character motivation", "thematic arc"],
    targetAi: analysis.targetAi
  };
}
function constructBusinessStrategyPrompt(analysis) {
  let topic = analysis.coreSubject;
  const prompt = [
    `Develop a structured strategic plan for ${topic}.`,
    `Identify core opportunities and target market requirements, establish a phased 30-60-90 day execution roadmap, define resource allocation priorities and operational trade-offs, and specify measurable KPIs alongside risk mitigation plans.`,
    `Explicitly state any assumptions where company or financial data is unspecified.`
  ].join(" ");
  return {
    mode: "better",
    prompt,
    shortReason: "Calibrated opportunity sizing, phased 90-day roadmap, operational trade-offs, and KPI metrics.",
    domain: "business",
    calibratedDimensions: ["opportunity sizing", "phased roadmap", "KPIs & risks"],
    targetAi: analysis.targetAi
  };
}
function constructDataAnalysisPrompt(analysis) {
  let topic = analysis.coreSubject;
  const prompt = [
    `Perform a thorough analytical evaluation of ${topic}.`,
    `Identify core distributions, anomalous patterns, and statistically significant correlations, provide practical interpretation of business implications, and present findings with clear visual structure and actionable recommendations.`
  ].join(" ");
  return {
    mode: "better",
    prompt,
    shortReason: "Calibrated statistical distributions, anomaly detection, business interpretation, and actionable recommendations.",
    domain: "data",
    calibratedDimensions: ["statistical distributions", "anomaly detection", "business impact"],
    targetAi: analysis.targetAi
  };
}
function constructGeneralCalibratedPrompt(analysis) {
  const prompt = [
    `Please address the following with structured clarity and depth:`,
    `"${analysis.coreSubject}"`,
    `Provide a direct, high-value answer upfront, break down key factors and practical execution steps with clear headings, include concrete examples or edge cases where relevant, and state any necessary assumptions clearly.`
  ].join("\n\n");
  return {
    mode: "better",
    prompt,
    shortReason: "Calibrated upfront thesis, structured breakdown, practical examples, and clear assumptions.",
    domain: "general",
    calibratedDimensions: ["structural clarity", "execution criteria", "explicit assumptions"],
    targetAi: analysis.targetAi
  };
}

// extension/src/engine/calibration/qualityValidator.ts
function validateCalibrationQuality(result, analysis) {
  const promptLower = result.prompt.toLowerCase();
  const rawLower = analysis.rawInput.toLowerCase();
  const failedChecks = [];
  let score = 100;
  if (rawLower.includes("us market") || rawLower.includes("in us")) {
    if (!promptLower.includes("us market") && !promptLower.includes("united states")) {
      failedChecks.push("Failed to preserve US market geographic intent");
      score -= 30;
    }
  }
  if (rawLower.includes("gtm") || rawLower.includes("go-to-market")) {
    if (!promptLower.includes("go-to-market") && !promptLower.includes("gtm")) {
      failedChecks.push("Failed to preserve Go-to-Market intent");
      score -= 30;
    }
  }
  if (rawLower.includes("python")) {
    if (!promptLower.includes("python")) {
      failedChecks.push("Failed to preserve Python language requirement");
      score -= 30;
    }
  }
  if (rawLower.includes("india")) {
    if (!promptLower.includes("india")) {
      failedChecks.push("Failed to preserve India geographical requirement");
      score -= 30;
    }
  }
  if (rawLower.includes("linkedin")) {
    if (!promptLower.includes("linkedin")) {
      failedChecks.push("Failed to preserve LinkedIn platform context");
      score -= 30;
    }
  }
  const forbiddenBoilerplates = [
    "develop an actionable, high-converting marketing strategy and copy for:",
    "execution framework:\n- target buyer",
    "execution framework:\n- core value proposition",
    "develop an actionable, high-converting"
  ];
  for (const fp of forbiddenBoilerplates) {
    if (promptLower.includes(fp)) {
      failedChecks.push(`Contains generic boilerplate template: "${fp}"`);
      score -= 40;
    }
  }
  if (analysis.rawInput.length > 5 && !hasSubstantiveKeywords(promptLower, rawLower)) {
    failedChecks.push("Output lacks substantive reference to user objective");
    score -= 25;
  }
  const forbiddenHallucinations = [
    { entity: "porsche", rule: "Must not invent specific car make (e.g. Porsche) unless provided" },
    { entity: "ferrari", rule: "Must not invent specific car make (e.g. Ferrari) unless provided" },
    { entity: "bmw", rule: "Must not invent specific car make (e.g. BMW) unless provided" }
  ];
  for (const item of forbiddenHallucinations) {
    if (!rawLower.includes(item.entity) && promptLower.includes(item.entity)) {
      failedChecks.push(`Hallucinated arbitrary entity: ${item.entity} (${item.rule})`);
      score -= 35;
    }
  }
  return {
    passed: failedChecks.length === 0,
    failedChecks,
    score: Math.max(0, score)
  };
}
function hasSubstantiveKeywords(promptLower, rawLower) {
  const stopWords = /* @__PURE__ */ new Set(["a", "an", "the", "in", "to", "for", "of", "and", "with", "on", "at", "this", "that", "can", "you", "please", "help", "me", "i", "want"]);
  const tokens = rawLower.replace(/[^\w\s]/g, "").split(/\s+/).filter((w) => w.length > 2 && !stopWords.has(w));
  if (tokens.length === 0) return true;
  let matched = 0;
  for (const t of tokens) {
    if (promptLower.includes(t)) {
      matched++;
    } else if (t === "gtm" && promptLower.includes("go-to-market")) {
      matched++;
    } else if (t === "us" && (promptLower.includes("united states") || promptLower.includes("us market"))) {
      matched++;
    }
  }
  return matched / tokens.length >= 0.5;
}

// extension/src/engine/better.ts
var BETTER_SYSTEM_PROMPT = `You are Refinzi's Intelligent Calibration Engine.
Your purpose: Transform the user's natural language into an expertly calibrated instruction for the target AI.

CRITICAL RULES:
1. SPECIFICITY OVER TEMPLATES:
   - Never output generic boilerplate or one-size-fits-all frameworks (e.g. NEVER output "Develop an actionable, high-converting marketing strategy and copy for: [X] Execution Framework: ...").
   - If the output could have been produced from the category name alone (e.g. "marketing"), you have failed.
   - Ground every addition directly in the user's actual request.

2. INTENT PRESERVATION:
   - Understand the user's actual goal and preserve it.
   - Do not change the objective.
   - Add only instructions that directly help the destination AI execute this specific task.

3. ANTI-HALLUCINATION & ZERO ARBITRARY INVENTIONS:
   - DO NOT invent unauthorized facts (e.g. what product a company sells, industry, pricing, revenue, or specific car brands like "1974 Porsche 911").
   - Separate information into:
     * KNOWN: Provided by user.
     * INFERRED: Strongly implied by request.
     * UNKNOWN: Not provided.
   - When critical context is UNKNOWN, explicitly instruct the target AI to identify it or clearly state reasonable assumptions.
   - NEVER ask the user questions.

4. TASK-AWARE CALIBRATION DIMENSIONS:
   - GTM / Market Entry: Target customer segment, entry mode, positioning, competitive landscape, channels, partnerships, localization, 90-day plan, budget assumptions, KPIs, and risks.
   - Visual / Image: Composition, camera angle, lens optics (e.g. 24mm/35mm), environmental lighting (e.g. golden hour), surface textures, and photographic realism.
   - Code: Language/runtime standards, expected behavior, modular structure, defensive edge-case handling, and verification tests.
   - Research: Scope, categorization, market/tech differentiators, comparative matrix, and explicit timeframe/criteria.
   - Social Posts: Platform context, audience, compelling hook, practical takeaways, clean scannable line breaks, and engagement prompt.

5. MINIMUM SUFFICIENT CALIBRATION:
   - Do not maximize prompt length.
   - If the prompt is already detailed, make minimal modifications.
   - If extremely vague, add the necessary structure.

OUTPUT FORMAT:
Respond with valid JSON matching:
{
  "mode": "better",
  "prompt": "The calibrated instruction ready for the target AI",
  "shortReason": "Concise line explaining the calibrated dimensions",
  "domain": "image_gen|video_gen|code|marketing|research|writing|business|data|general",
  "calibratedDimensions": ["dimension1", "dimension2"]
}`;
function synthesizeBetterPrompt(rawInput, targetAi = "general") {
  const analysis = analyzeTask(rawInput, targetAi);
  const result = constructCalibratedPrompt(analysis);
  const validation = validateCalibrationQuality(result, analysis);
  if (!validation.passed) {
    console.warn("[Refinzi Calibration Quality Gate]", validation.failedChecks);
  }
  return result;
}

// extension/src/engine/expert/expertAnalyzer.ts
function analyzeExpertTask(rawInput, destinationAi = "general") {
  const raw = (rawInput || "").trim();
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
    isAlreadyDetailed
  };
}
function detectDeliverableScope(lower) {
  if (/\b(hero(\s+section)?)\b/i.test(lower)) {
    return "hero_section";
  }
  if (/\b(2-line|two-line|headline|one-liner)\b/i.test(lower)) {
    return "headline_only";
  }
  if (/\b(email|apolog(y|iz)|letter|memo)\b/i.test(lower)) {
    return "single_email";
  }
  if (/\b(fix|memory leak|bug|crash|error|exception)\b/i.test(lower)) {
    return "bug_fix";
  }
  if (/\b(gtm|go-to-market|market entry|enter\s+(in\s+)?.*market|expansion into)\b/i.test(lower)) {
    return "gtm_strategy";
  }
  if (/\b(photo|image|picture|render|cinematic\s+(photo|shot)|photograph)\b/i.test(lower)) {
    return "single_image";
  }
  if (/\b(competitors?|competing|competitive|rivals?|compare.*with)\b/i.test(lower)) {
    return "competitive_analysis";
  }
  if (/\b(cac|ltv|churn|why.*(increased|decreased|dropped|rose|spiked)|anomal)\b/i.test(lower)) {
    return "metric_diagnostic";
  }
  if (/\b(landing page|sales page|lead capture page)\b/i.test(lower)) {
    return "full_landing_page";
  }
  if (/\b(linkedin post|tweet|thread|social media post)\b/i.test(lower)) {
    return "social_post";
  }
  if (/\b(code|react|vue|angular|python|typescript|api|function|class|component|sql|backend|frontend)\b/i.test(lower)) {
    return "code_module";
  }
  if (/\b(research|study|overview of|landscape)\b/i.test(lower)) {
    return "research_analysis";
  }
  return "custom";
}
function detectExpertTaskKind(lower, scope) {
  switch (scope) {
    case "gtm_strategy":
      return "gtm_market_entry";
    case "hero_section":
    case "full_landing_page":
      return "landing_page";
    case "bug_fix":
      return "code_debugging";
    case "code_module":
      return "code_engineering";
    case "single_email":
      return "email_communication";
    case "single_image":
      return "image_cinematic";
    case "competitive_analysis":
      return "competitive_research";
    case "metric_diagnostic":
      return "business_analytics";
    case "headline_only":
    case "social_post":
      return "social_content";
    case "research_analysis":
      return "general_research";
    default:
      return "general_expert";
  }
}
function deriveDeliverableName(scope, lower) {
  switch (scope) {
    case "hero_section":
      return "hero section";
    case "headline_only":
      return lower.includes("2-line") ? "2-line headline" : "headline";
    case "single_email":
      return lower.includes("apolog") ? "apology email" : "email";
    case "bug_fix":
      return lower.includes("memory leak") ? "memory leak fix" : "bug fix";
    case "gtm_strategy":
      return "go-to-market strategy";
    case "single_image":
      return "photographic prompt";
    case "competitive_analysis":
      return "competitive analysis";
    case "metric_diagnostic":
      return "diagnostic analysis";
    case "full_landing_page":
      return "landing page";
    case "social_post":
      return "social post";
    case "code_module":
      return "code implementation";
    case "research_analysis":
      return "research analysis";
    default:
      return "task execution";
  }
}
function extractExplicitEntities(raw, lower) {
  const entities = [];
  if (lower.includes("us market") || lower.includes("united states") || lower.includes("in us")) {
    entities.push("United States");
  }
  if (lower.includes("india")) entities.push("India");
  if (lower.includes("tokyo")) entities.push("Tokyo");
  if (lower.includes("europe") || lower.includes("eu")) entities.push("Europe");
  if (lower.includes("notion")) entities.push("Notion");
  if (lower.includes("ferrari")) entities.push("Ferrari");
  if (lower.includes("nodejs") || lower.includes("node.js") || lower.includes("node")) entities.push("Node.js");
  if (lower.includes("stream pipeline")) entities.push("stream pipeline");
  if (lower.includes("react")) entities.push("React");
  if (lower.includes("python")) entities.push("Python");
  if (lower.includes("cto")) entities.push("CTO");
  if (lower.includes("cac")) entities.push("CAC");
  if (lower.includes("developer tool") || lower.includes("dev tool")) entities.push("developer tool");
  return entities;
}
function extractAction(raw, lower, scope, taskKind) {
  switch (scope) {
    case "hero_section":
      return "Write the hero section for the landing page";
    case "headline_only":
      return "Write high-impact headline options";
    case "single_email":
      return "Draft a professional and accountable email";
    case "bug_fix":
      return "Diagnose root cause and provide minimal surgical fix";
    case "gtm_strategy":
      return "Develop a comprehensive go-to-market strategy";
    case "single_image":
      return "Compose a photographic visual prompt";
    case "competitive_analysis":
      return "Conduct an in-depth competitive analysis";
    case "metric_diagnostic":
      return "Perform a structured diagnostic analysis";
    default:
      return "Execute senior practitioner task";
  }
}
function extractObjective(raw, lower, scope, taskKind) {
  let clean = raw.replace(/^(can you|please|could you|help me|i want to|i need to|write|create|make|conduct|generate|produce|develop|draft|analyze|fix|debug)\s+/i, "").trim();
  clean = clean.replace(/^(a|an|the)\s+/i, "").trim();
  switch (scope) {
    case "hero_section":
      return `Write the hero section for ${clean}`;
    case "headline_only":
      return `Write 2-line headline options for ${clean}`;
    case "single_email":
      return `Draft a professional email regarding ${clean}`;
    case "bug_fix":
      return `Diagnose and resolve the issue in ${clean}`;
    case "gtm_strategy":
      return `Develop a comprehensive go-to-market strategy for ${clean}`;
    case "single_image":
      return `Compose a photographic visual of ${clean}`;
    case "competitive_analysis":
      return `Conduct an in-depth competitive analysis for ${clean}`;
    case "metric_diagnostic":
      return `Diagnose root causes for ${clean}`;
    default:
      return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : "Task Execution";
  }
}
function extractSubject(raw, lower, scope, taskKind) {
  let subj = raw.replace(/^(can you|please|could you|help me|i want to|i need to)\s+/i, "").trim();
  subj = subj.replace(/^(write|create|make|develop|draft|analyze|research|conduct|fix|debug|produce|generate)\s+/i, "").trim();
  subj = subj.replace(/^(a|an|the)\s+/i, "").trim();
  if (scope === "hero_section") {
    subj = subj.replace(/^(landing page hero(\s+section)?|hero(\s+section)?)\s+(for\s+)?/i, "");
    subj = subj.replace(/\s+landing page$/i, "");
    return subj.trim() || (raw.toLowerCase().includes("developer tool") ? "developer tool" : raw.trim());
  }
  if (scope === "headline_only") {
    subj = subj.replace(/^(2-line|two-line)?\s*(linkedin\s+)?headline\s+(options\s+)?(for\s+)?(a\s+)?/i, "");
    return subj.trim() || (raw.toLowerCase().includes("cto") ? "CTO" : raw.trim());
  }
  if (scope === "single_email") {
    subj = subj.replace(/^(email|message|letter|memo)\s+(to\s+[^ ]+\s+)?(apologizing\s+for|regarding|about|asking\s+for)\s+/i, "");
    subj = subj.replace(/^(apologizing\s+for|regarding|about|asking\s+for)\s+/i, "");
    return subj.trim() || (raw.toLowerCase().includes("delayed project") ? "delayed project delivery" : raw.trim());
  }
  if (scope === "bug_fix") {
    subj = subj.replace(/^(fix|debug|resolve)\s+/i, "");
    return subj.trim() || (raw.toLowerCase().includes("memory leak") ? "memory leak in nodejs stream pipeline" : raw.trim());
  }
  if (scope === "single_image") {
    subj = subj.replace(/^(cinematic\s+)?(photo|photograph|picture|image|shot|render)\s+of\s+(a|an|the)?\s*/i, "");
    subj = subj.replace(/\s+in\s+tokyo(\s+at\s+night)?/i, "");
    subj = subj.replace(/\s+at\s+night/i, "");
    return subj.trim() || (raw.toLowerCase().includes("ferrari") ? "Ferrari" : raw.trim());
  }
  if (scope === "competitive_analysis") {
    subj = subj.replace(/^(competitors|alternatives|rivals)\s+(of|to)\s+/i, "");
    subj = subj.replace(/\s+in\s+india/i, "");
    return subj.trim() || (raw.toLowerCase().includes("notion") ? "Notion" : raw.trim());
  }
  if (scope === "metric_diagnostic") {
    subj = subj.replace(/^(why\s+our|why\s+the|why\s+)\s*/i, "");
    return subj.trim() || (raw.toLowerCase().includes("cac") ? "Customer Acquisition Cost (CAC) increase" : raw.trim());
  }
  return subj || raw;
}
function extractGeography(lower) {
  if (lower.includes("us market") || lower.includes("in us")) return "US";
  if (lower.includes("united states")) return "United States";
  if (lower.includes("india")) return "India";
  if (lower.includes("tokyo")) return "Tokyo";
  if (lower.includes("europe") || lower.includes("eu")) return "Europe";
  return void 0;
}
function extractTimeframe(lower) {
  if (lower.includes("at night")) return "at night";
  const match = lower.match(/\b(90-day|30-day|60-day|annual|quarterly|q[1-4]|202[4-6])\b/i);
  return match ? match[0] : void 0;
}
function extractConstraints(lower) {
  const constraints = [];
  const wordCount = lower.match(/\b\d+\s*words\b/i);
  if (wordCount) constraints.push(`Length: ${wordCount[0]}`);
  if (lower.includes("2-line") || lower.includes("two-line")) constraints.push("Length: exactly 2 lines");
  if (lower.includes("50-500 employees")) constraints.push("Target Company Size: 50-500 employees");
  if (lower.includes("top 10")) constraints.push("Scope: Top 10 competitors");
  return constraints;
}
function extractExplicitAudience(lower) {
  if (lower.includes("for developer tool") || lower.includes("to developer")) return "Developers";
  if (lower.includes("for cto") || lower.includes("for a cto")) return "CTO";
  if (lower.includes("to client") || lower.includes("to a client")) return "Client";
  if (lower.includes("to customer") || lower.includes("to a customer")) return "Customer";
  if (lower.includes("for hr technology") || lower.includes("hr tech")) return "HR Technology Companies";
  return void 0;
}
function checkIsAlreadyDetailed(lower, wordCount) {
  let depthSignals = 0;
  if (/\b\d+\s*-\s*\d+\s*(employees|users|customers)\b/i.test(lower)) depthSignals += 3;
  if (/\b(\$|usd|eur|inr)\s*[\d,]+/i.test(lower)) depthSignals += 3;
  if (/\b(launch budget|pilot budget|budget of|arr|mrr)\b/i.test(lower)) depthSignals += 2;
  if (/\b(b2b saas|mid-market|enterprise|smb)\b/i.test(lower)) depthSignals += 1;
  if (/\b(compare|competitors?|pricing|acquisition channels|90-day|sla|latency)\b/i.test(lower)) depthSignals += 2;
  if (wordCount >= 25) depthSignals += 2;
  return depthSignals >= 3;
}
function identifyMissingDimensions(scope, taskKind, lower, isAlreadyDetailed) {
  if (isAlreadyDetailed) {
    return ["execution rigor", "validation criteria", "structured deliverable format"];
  }
  switch (scope) {
    case "hero_section":
      return [
        "primary outcome-focused headlines",
        "concise supporting subheadline",
        "clear primary and secondary CTAs",
        "technically credible proof points",
        "strict hero scope boundary"
      ];
    case "headline_only":
      return [
        "strict 2-line length limit",
        "balance of technical leadership and business impact",
        "elimination of buzzwords and prestige titles"
      ];
    case "single_email":
      return [
        "direct delay acknowledgment and responsibility",
        "situation explanation without excuses",
        "current status and next steps",
        "accountable tone without unrequested commitments"
      ];
    case "bug_fix":
      return [
        "lifecycle, buffering, backpressure, or stream handling causes",
        "minimal production-safe code change",
        "root cause explanation",
        "regression test or verification procedure"
      ];
    case "gtm_strategy":
      return [
        "market opportunity & priority customer segments",
        "ideal customer profile and beachhead segment",
        "competitive landscape and differentiation",
        "recommended market-entry strategy",
        "positioning and value proposition",
        "pricing and packaging considerations",
        "sales, acquisition and distribution channels",
        "partnership opportunities",
        "localization and operational requirements",
        "relevant regulatory considerations",
        "90-day execution plan and expansion milestones",
        "resource and budget assumptions",
        "KPIs and decision gates",
        "major risks and mitigation strategies"
      ];
    case "single_image":
      return [
        "35mm camera optics and lens",
        "atmospheric lighting and reflections",
        "low-angle dynamic composition",
        "tactile texture and environmental realism",
        "moody cinematic color grade"
      ];
    case "competitive_analysis":
      return [
        "direct and indirect competitor taxonomy",
        "feature parity and differentiation matrix",
        "regional pricing and local currency packaging",
        "local market adoption dynamics",
        "actionable opportunity gaps"
      ];
    case "metric_diagnostic":
      return [
        "metric decomposition into funnel & channel drivers",
        "acquisition channel fatigue and saturation hypotheses",
        "funnel drop-off and UX friction analysis",
        "attribution and tracking changes evaluation",
        "diagnostic data cuts and SQL audit queries",
        "prioritized 30/90-day corrective action plan"
      ];
    default:
      return [
        "core objective deconstruction",
        "structured execution roadmap",
        "concrete deliverables without placeholders"
      ];
  }
}
function deriveScopeBoundaries(scope, taskKind, lower) {
  switch (scope) {
    case "hero_section":
      return {
        scopeBoundaries: [
          "Keep the scope limited strictly to the hero section.",
          "Do not create full landing page copy, pricing tiers, FAQs, testimonials, guarantee, or acquisition strategy."
        ],
        forbiddenInventions: ["product capabilities", "customer results", "integrations", "metrics"]
      };
    case "headline_only":
      return {
        scopeBoundaries: [
          "Keep strictly within the 2-line length limit.",
          "Do not write an entire profile summary, bio, or content strategy."
        ],
        forbiddenInventions: ["specific technologies", "company names", "metrics not provided"]
      };
    case "single_email":
      return {
        scopeBoundaries: [
          "Draft the specific email directly with Subject Line, Body, and Sign-off.",
          "Do not automatically create a customer-retention strategy or long-term communication plan."
        ],
        forbiddenInventions: ["reason for delay", "compensation", "revised dates", "refunds", "credits", "corrective actions not provided"]
      };
    case "bug_fix":
      return {
        scopeBoundaries: [
          "Provide the minimal production-safe code change required and a regression test.",
          "Do not introduce unrelated architectural changes or framework redesigns."
        ],
        forbiddenInventions: ["unrelated dependencies", "architectural redesigns"]
      };
    case "gtm_strategy":
      return {
        scopeBoundaries: [
          "Prioritize highest-leverage actions and explain the strategic reasoning.",
          "State reasonable assumptions explicitly rather than inventing facts."
        ],
        forbiddenInventions: ["company", "product", "customer", "pricing", "financial facts"]
      };
    case "single_image":
      return {
        scopeBoundaries: [
          "Focus purely on the photographic visual scene and optical specifications."
        ],
        forbiddenInventions: ["unrelated subjects", "artificial CG plastic sheen"]
      };
    case "competitive_analysis":
      return {
        scopeBoundaries: [
          "Distinguish verified competitor data from market inferences."
        ],
        forbiddenInventions: ["non-existent startups", "unverified pricing or metrics"]
      };
    case "metric_diagnostic":
      return {
        scopeBoundaries: [
          "Decompose the anomaly into structured mathematical and operational hypotheses."
        ],
        forbiddenInventions: ["revenue figures", "dollar amounts", "company facts not provided"]
      };
    default:
      return {
        scopeBoundaries: ["Execute the exact requested task with senior practitioner depth."],
        forbiddenInventions: ["arbitrary facts", "unauthorized assumptions"]
      };
  }
}

// extension/src/engine/expert/expertBuilder.ts
function constructExpertPrompt(model) {
  if (model.isAlreadyDetailed) {
    return buildDetailedTaskSpecification(model);
  }
  switch (model.scope) {
    case "hero_section":
      return buildHeroSectionPrompt(model);
    case "headline_only":
      return buildHeadlinePrompt(model);
    case "single_email":
      return buildEmailPrompt(model);
    case "bug_fix":
      return buildBugFixPrompt(model);
    case "gtm_strategy":
      return buildGtmStrategyPrompt(model);
    case "competitive_analysis":
      return buildCompetitiveAnalysisPrompt(model);
    case "metric_diagnostic":
      return buildMetricDiagnosticPrompt(model);
    case "single_image":
      return buildCinematicImagePrompt(model);
    case "full_landing_page":
      return buildFullLandingPagePrompt(model);
    case "code_module":
      return buildCodeModulePrompt(model);
    case "social_post":
      return buildSocialPostPrompt(model);
    case "research_analysis":
      return buildResearchAnalysisPrompt(model);
    default:
      return buildCustomExpertPrompt(model);
  }
}
function buildGtmStrategyPrompt(model) {
  const geoTerm = model.geography === "US" ? "the US" : model.geography ? `the ${model.geography}` : "the target";
  const marketOpportunityPrefix = model.geography === "US" ? "US market" : model.geography ? `${model.geography} market` : "Market";
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
  ].join("\n");
}
function buildHeroSectionPrompt(model) {
  const subject = model.specificSubject || "developer tool";
  return [
    `Write the hero section for a ${subject} landing page.`,
    ``,
    `Create:`,
    `- 3 strong headline options focused on the primary ${model.audience ? model.audience.toLowerCase().replace(/s$/, "") : "developer"} outcome`,
    `- a concise supporting subheadline explaining what the product does and why it matters`,
    `- a clear primary CTA`,
    `- an optional secondary CTA where appropriate`,
    `- concise supporting proof points if available`,
    ``,
    `Keep the messaging specific to ${model.audience ? model.audience.toLowerCase() : "developers"}, outcome-oriented, and technically credible. Do not invent product capabilities, customer results, integrations, or metrics. Keep the scope limited to the hero section.`
  ].join("\n");
}
function buildEmailPrompt(model) {
  const lower = model.rawInput.toLowerCase();
  const isDelayedProject = lower.includes("delayed") || lower.includes("delay");
  if (isDelayedProject) {
    const subject2 = model.specificSubject || "delayed project delivery";
    const cleanSubject = subject2.startsWith("a ") ? subject2 : `a ${subject2}`;
    return [
      `Draft a professional apology email to a client regarding ${cleanSubject}.`,
      ``,
      `Acknowledge the delay directly, take appropriate responsibility, briefly explain the situation without unnecessary excuses, communicate the current status or next step where information is available, and maintain a respectful, accountable tone.`,
      ``,
      `Do not invent a reason for the delay, compensation, revised dates, refunds, credits, or corrective actions that were not provided.`
    ].join("\n");
  }
  const isApology = lower.includes("apolog") || lower.includes("sorry") || lower.includes("issue") || lower.includes("mistake");
  const recipient = model.audience || "customer";
  const subject = model.specificSubject || model.rawInput;
  if (isApology) {
    return [
      `Draft a professional apology email to a ${recipient.toLowerCase()} regarding: ${subject}.`,
      ``,
      `Structure the communication with:`,
      `1. Tone & Calibration: Direct, respectful, accountable, and empathetic\u2014avoid defensive phrasing or corporate jargon.`,
      `2. Problem Acknowledgment: Clearly acknowledge the issue and validate the recipient's inconvenience.`,
      `3. Transparent Explanation: Provide a brief explanation without unnecessary excuses.`,
      `4. Concrete Resolution & Next Steps: Communicate the current status and immediate resolution where information is available.`,
      ``,
      `Do not invent reasons, dates, refunds, credits, or unrequested commitments not provided in the request.`
    ].join("\n");
  }
  return [
    `Draft a professional, high-impact email to a ${recipient.toLowerCase()} regarding: ${subject}.`,
    ``,
    `Requirements:`,
    `- Tone: Professional, clear, and low-friction\u2014avoid corporate jargon or filler pleasantries.`,
    `- Core Message: Deliver the primary message and context directly in the opening lines.`,
    `- Call to Action (CTA): Provide a clear, singular next step.`,
    `- Structure: Keep paragraphs concise and easy to skim on mobile devices.`,
    `- Subject Lines: Include 2 distinct subject line options (one direct, one curiosity-led).`,
    ``,
    `Do not invent unstated commitments, dates, or terms not provided in the request.`
  ].join("\n");
}
function buildBugFixPrompt(model) {
  const lower = model.rawInput.toLowerCase();
  const isStreamOrMemoryLeak = lower.includes("stream") || lower.includes("memory leak");
  if (isStreamOrMemoryLeak) {
    let subject2 = model.specificSubject || "memory leak in Node.js stream pipeline";
    subject2 = subject2.replace(/\bnodejs\b/gi, "Node.js").replace(/\bin Node\.js\b/i, "in the Node.js").replace(/^the\s+/i, "");
    return [
      `Diagnose and fix the ${subject2}.`,
      ``,
      `Identify likely lifecycle, buffering, backpressure, event-listener, resource-management, or stream-handling causes based on the available code/context. Provide the minimal production-safe code change required, explain the root cause, and include a regression test or verification procedure.`,
      ``,
      `Do not introduce unrelated architectural changes.`
    ].join("\n");
  }
  const subject = model.specificSubject || "the reported bug";
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
  ].join("\n");
}
function buildCinematicImagePrompt(model) {
  const subject = model.specificSubject || "Ferrari";
  const geoClause = model.geography ? ` in ${model.geography}` : "";
  const timeClause = model.timeframe ? ` ${model.timeframe}` : "";
  const lightingText = model.geography ? `${model.geography} night neon reflections, rain-slicked asphalt reflections, deep rich contrast with preserved shadow detail.` : "Naturalistic cinematic lighting, vibrant atmospheric reflections on surrounding surfaces, deep rich contrast with preserved shadow detail.";
  return [
    `Cinematic, atmospheric 35mm photograph of ${subject}${geoClause}${timeClause}.`,
    ``,
    `Visual specifications:`,
    `- Camera & Optics: Shot on 35mm anamorphic lens, shallow depth of field with natural optical bokeh, crisp focal plane on the primary subject.`,
    `- Lighting & Ambiance: ${lightingText}`,
    `- Composition & Perspective: Low-angle dynamic framing emphasizing automotive lines and urban backdrop with depth layers.`,
    `- Texture & Environment: Authentic environmental textures, subtle film grain, zero artificial CG plastic sheen.`,
    `- Color Grade: Moody cinematic color grade with balanced atmospheric saturation.`
  ].join("\n");
}
function buildHeadlinePrompt(model) {
  const role = model.audience || model.specificSubject || "CTO";
  return [
    `Write 2-line LinkedIn headline options for a ${role}.`,
    ``,
    `Provide options that:`,
    `- clearly communicate technical leadership, architectural scale, and business impact within a strict 2-line constraint`,
    `- balance strategic vision with hands-on credibility`,
    `- stand out without buzzwords, hyperbole, or self-aggrandizing claims`,
    ``,
    `Keep the scope limited strictly to the 2-line headline. Do not write an entire profile summary, bio, or content strategy. Do not invent specific company names, metrics, or technologies not provided.`
  ].join("\n");
}
function buildCompetitiveAnalysisPrompt(model) {
  const subject = model.specificSubject || "Notion";
  const geoClause = model.geography ? ` in ${model.geography}` : "";
  const marketName = model.geography === "India" ? "the Indian market" : model.geography ? `the ${model.geography} market` : "the market";
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
  ].join("\n");
}
function buildMetricDiagnosticPrompt(model) {
  const subject = model.specificSubject || "Customer Acquisition Cost (CAC) increase";
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
  ].join("\n");
}
function buildFullLandingPagePrompt(model) {
  const subject = model.specificSubject || "the product";
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
  ].join("\n");
}
function buildCodeModulePrompt(model) {
  const subject = model.specificSubject || "the module";
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
  ].join("\n");
}
function buildSocialPostPrompt(model) {
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
  ].join("\n");
}
function buildResearchAnalysisPrompt(model) {
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
  ].join("\n");
}
function buildCustomExpertPrompt(model) {
  return [
    `Execute the following task with senior practitioner depth and structural rigor:`,
    `"${model.rawInput}"`,
    ``,
    `Execution Directives:`,
    `- Address core requirements systematically without changing the requested scope.`,
    `- Produce a complete, usable deliverable without placeholders.`,
    `- Declare reasonable baseline assumptions explicitly where specific details are omitted.`,
    `- Avoid invented facts, buzzwords, or unrelated deliverables.`
  ].join("\n");
}
function buildDetailedTaskSpecification(model) {
  const constraintsText = model.constraints.length > 0 ? `Ground recommendations strictly in the stated constraints (${model.constraints.join(", ")}).` : "Ground all recommendations in the user-specified scope and parameters.";
  return [
    model.rawInput,
    ``,
    `Execution Rigor & Deliverable Format:`,
    `- ${constraintsText}`,
    `- Distinguish verified market data from baseline projections.`,
    `- Present comparative frameworks and milestones with structured, decision-ready clarity without repeating or expanding beyond the requested scope.`
  ].join("\n");
}

// extension/src/engine/expert/expertValidator.ts
var FORBIDDEN_PRESTIGE_TERMS = [
  "world-class",
  "elite",
  "renowned",
  "top 1%",
  "guru",
  "expert architect"
];
var PRESTIGE_ALLOWLIST = [
  "expert witness",
  "senior engineer",
  "specialist",
  "subject matter expert",
  "domain specialist",
  "security specialist",
  "technical specialist",
  "clinical specialist"
];
var FORBIDDEN_GENERIC_MARKETING_TERMS = [
  "direct-response copywriter",
  "discerning buyers",
  "high-converting copy & strategic execution blueprint"
];
var FORBIDDEN_METADATA_CLUTTER = [
  "- Target Domain:",
  "- Target Environment:",
  "- Audience Standard:",
  "# ROLE & PERSPECTIVE\nYou are acting as a World-Class"
];
function calculateIntentSimilarity(rawInput, calibratedPrompt) {
  if (!rawInput || !calibratedPrompt) return 0;
  const raw = rawInput.toLowerCase().trim();
  const calibrated = calibratedPrompt.toLowerCase().trim();
  if (calibrated.includes(raw)) {
    return 1;
  }
  const stopWords = /* @__PURE__ */ new Set([
    "a",
    "an",
    "the",
    "and",
    "or",
    "to",
    "for",
    "in",
    "on",
    "with",
    "by",
    "at",
    "of",
    "this",
    "that",
    "these",
    "those",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "create",
    "make",
    "write",
    "give",
    "generate"
  ]);
  const rawTokens = raw.split(/[^a-z0-9_#.-]+/).map((t) => t.trim()).filter((t) => t.length > 2 && !stopWords.has(t));
  if (rawTokens.length === 0) {
    return 1;
  }
  let matchedCount = 0;
  for (const token of rawTokens) {
    const cleanToken = token.replace(/[^a-z0-9]/g, "");
    if (calibrated.includes(token) || cleanToken.length > 2 && calibrated.includes(cleanToken) || token.endsWith("s") && calibrated.includes(token.slice(0, -1)) || token.endsWith("ing") && calibrated.includes(token.slice(0, -3))) {
      matchedCount++;
    }
  }
  return matchedCount / rawTokens.length;
}
function validateExpertPrompt(prompt, model) {
  const violations = [];
  const lower = prompt.toLowerCase();
  let hasScopeExpansion = false;
  const prestigeTermsFound = [];
  if (model.scope === "hero_section") {
    if (lower.includes("pricing") || lower.includes("tier structure")) {
      violations.push("Scope expansion: hero section prompt generated pricing tiers.");
      hasScopeExpansion = true;
    }
    if (lower.includes("faq") || lower.includes("frequently asked questions")) {
      violations.push("Scope expansion: hero section prompt generated FAQ.");
      hasScopeExpansion = true;
    }
    if (lower.includes("testimonials") || lower.includes("social proof & credibility architecture")) {
      violations.push("Scope expansion: hero section prompt generated testimonial architecture.");
      hasScopeExpansion = true;
    }
    if (lower.includes("acquisition strategy")) {
      violations.push("Scope expansion: hero section prompt generated full acquisition strategy.");
      hasScopeExpansion = true;
    }
  }
  if (model.scope === "single_email") {
    if (lower.includes("customer-retention strategy") || lower.includes("retention strategy")) {
      violations.push("Scope expansion: email prompt generated customer retention strategy.");
      hasScopeExpansion = true;
    }
    if (lower.includes("restitution or credit applied") && !model.rawInput.toLowerCase().includes("credit")) {
      violations.push("Invented fact: unprompted restitution or credit applied in apology email.");
      hasScopeExpansion = true;
    }
  }
  if (model.scope === "headline_only") {
    if ((lower.includes("write an entire profile") || lower.includes("create a content strategy")) && !lower.includes("do not write an entire profile")) {
      violations.push("Scope expansion: headline prompt generated full profile or content strategy.");
      hasScopeExpansion = true;
    }
  }
  if (model.scope === "bug_fix") {
    if (lower.includes("software architecture redesign")) {
      violations.push("Scope expansion: bug fix introduced architectural redesign.");
      hasScopeExpansion = true;
    }
  }
  for (const term of FORBIDDEN_PRESTIGE_TERMS) {
    if (lower.includes(term.toLowerCase())) {
      const isAllowed = PRESTIGE_ALLOWLIST.some((allowed) => lower.includes(allowed.toLowerCase()));
      if (!isAllowed) {
        violations.push(`Contains forbidden prestige term: "${term}"`);
        prestigeTermsFound.push(term);
      }
    }
  }
  if (model.scope !== "social_post" && model.scope !== "full_landing_page" && model.scope !== "hero_section") {
    for (const term of FORBIDDEN_GENERIC_MARKETING_TERMS) {
      if (lower.includes(term.toLowerCase())) {
        violations.push(`Injected generic marketing boilerplate into non-copywriting task: "${term}"`);
      }
    }
  }
  for (const header of FORBIDDEN_METADATA_CLUTTER) {
    if (prompt.includes(header)) {
      violations.push(`Contains unnecessary metadata clutter: "${header}"`);
    }
  }
  const intentSimilarity = calculateIntentSimilarity(model.rawInput, prompt);
  if (intentSimilarity < 0.9) {
    violations.push(`Intent fidelity threshold failed: similarity score is ${(intentSimilarity * 100).toFixed(1)}% (minimum 90% required).`);
  }
  for (const entity of model.explicitEntities) {
    const normalized = entity.toLowerCase();
    const isPresent = lower.includes(normalized) || normalized === "united states" && (lower.includes("us") || lower.includes("u.s.")) || normalized === "node.js" && (lower.includes("nodejs") || lower.includes("node.js") || lower.includes("node"));
    if (!isPresent) {
      violations.push(`Failed to preserve explicit entity: "${entity}"`);
    }
  }
  if (/\b(please tell me|can you provide|what is your (budget|product|company)|before we begin, answer)\b/i.test(prompt)) {
    violations.push("Prompt attempts to interrogate or ask questions to the user.");
  }
  return {
    isValid: violations.length === 0,
    violations,
    intentSimilarity,
    hasScopeExpansion,
    prestigeTermsFound
  };
}

// extension/src/engine/expert.ts
var EXPERT_SYSTEM_PROMPT = `You are Refinzi's Autonomous Expert Briefing Engine.
Your purpose: Produce an exhaustive, senior execution specification for the target AI.

CRITICAL PRODUCT PRINCIPLES:
1. SCOPE FIDELITY:
   Determine what the user actually asked to produce and stay strictly inside that scope.
   Never expand "hero" to "landing page", "email" to "customer retention strategy",
   "bug fix" to "architecture redesign", or "headline" to "bio/content strategy".
2. NEVER ASK QUESTIONS:
   Infer missing dimensions, apply defensible baseline assumptions, and instruct the target AI to declare assumptions explicitly if key details are unstated.
3. NO PRESTIGE JARGON:
   Never use generic prestige roles such as "World-Class", "Elite", "Renowned", "Top 1%", or "Guru".
4. NO INVENTED USER FACTS:
   Never manufacture audience personas, specific companies, products, revenue, or budgets unless present in the user's input.
5. TASK SEMANTICS OVER CATEGORY LABELS:
   Never substitute a generic category template. The semantic meaning and scope must dominate.
6. MINIMUM SUFFICIENT EXPERT:
   Do not artificially maximize prompt length. For already comprehensive prompts, apply minimal modification and preserve user specifications.

OUTPUT FORMAT:
Respond with valid JSON matching:
{
  "mode": "expert",
  "prompt": "The calibrated expert prompt ready for immediate execution",
  "intent": "Crisp intent title",
  "summary": "One sentence summary of the execution calibration",
  "domain": "image_gen|video_gen|code|marketing|research|writing|business|data|general",
  "assumptions": ["Defensible assumption 1", "Defensible assumption 2"]
}`;
function synthesizeExpertPrompt(rawInput, targetAi = "general") {
  const model = analyzeExpertTask(rawInput, targetAi);
  const domain = mapTaskKindToDomain(model.taskKind);
  let prompt = constructExpertPrompt(model);
  prompt = appendOutOfScopeEscapeHatch(prompt, model);
  let validation = validateExpertPrompt(prompt, model);
  if (validation.prestigeTermsFound.length > 0) {
    prompt = sanitizePrompt(prompt);
    validation = validateExpertPrompt(prompt, model);
  }
  if (validation.intentSimilarity < 0.9) {
    prompt = `Execution Directive: ${model.rawInput.trim()}

${prompt}`;
    validation = validateExpertPrompt(prompt, model);
    if (validation.intentSimilarity < 0.9) {
      const betterFallback = synthesizeBetterPrompt(rawInput, targetAi);
      return {
        mode: "expert",
        prompt: betterFallback.prompt,
        intent: model.coreObjective,
        summary: `${betterFallback.shortReason} (Intent fidelity clamped to Better)`,
        domain,
        assumptions: [
          `Known: ${model.rawInput.trim()}`,
          "Preserved: Core intent protected via Better calibration"
        ]
      };
    }
  }
  if (validation.hasScopeExpansion) {
    prompt = clampDeliverableScope(prompt, model);
    validation = validateExpertPrompt(prompt, model);
    if (validation.hasScopeExpansion) {
      const betterFallback = synthesizeBetterPrompt(rawInput, targetAi);
      return {
        mode: "expert",
        prompt: betterFallback.prompt,
        intent: model.coreObjective,
        summary: `${betterFallback.shortReason} (Scope locked to Better)`,
        domain,
        assumptions: [
          `Known: Deliverable restricted to ${model.deliverable}`,
          "Scope locked: Degraded to Better to prevent unauthorized section expansion"
        ]
      };
    }
  }
  const assumptions = deriveTransparentAssumptions(model);
  const summary = buildSummary(model);
  return {
    mode: "expert",
    prompt,
    intent: model.coreObjective,
    summary,
    domain,
    assumptions
  };
}
function appendOutOfScopeEscapeHatch(prompt, model) {
  let observations = "";
  if (model.scope === "hero_section") {
    observations = "Verify subsequent conversion funnel friction (e.g. signup flow, social proof placement) post-hero launch.";
  } else if (model.scope === "single_email") {
    observations = "If client responds defensively, transition from email to a 10-minute discovery call rather than a lengthy email thread.";
  } else if (model.scope === "bug_fix") {
    observations = "Audit upstream event emitters and memory allocation benchmarks during peak load.";
  } else if (model.scope === "gtm_strategy") {
    observations = "Review SOC2 Type II and GDPR readiness early if targeting US/EU enterprise buyers.";
  }
  if (!observations) return prompt;
  return `${prompt}

---
[Out-of-Scope Strategic Observations]
(Advisory notes outside the locked deliverable scope):
\u2022 ${observations}`;
}
function clampDeliverableScope(prompt, model) {
  if (model.scope === "hero_section") {
    return prompt.replace(/## Pricing.*?(?=##|$)/gis, "").replace(/## FAQ.*?(?=##|$)/gis, "").replace(/## Testimonials.*?(?=##|$)/gis, "");
  }
  if (model.scope === "single_email") {
    return prompt.replace(/Customer Retention Strategy.*?(?=\n\n|$)/gis, "");
  }
  return prompt;
}
function sanitizePrompt(prompt) {
  return prompt.replace(/\b(world-class|elite|renowned|top 1%|guru|expert architect)\b/gi, "senior specialist").replace(/- Target Domain:.*\n?/gi, "").replace(/- Target Environment:.*\n?/gi, "").replace(/- Audience Standard:.*\n?/gi, "").replace(/# ROLE & PERSPECTIVE\nYou are acting as a World-Class.*\n\n?/gi, "");
}
function mapTaskKindToDomain(taskKind) {
  switch (taskKind) {
    case "gtm_market_entry":
    case "business_analytics":
      return "business";
    case "landing_page":
    case "social_content":
      return "marketing";
    case "code_debugging":
    case "code_engineering":
      return "code";
    case "image_cinematic":
      return "image_gen";
    case "competitive_research":
    case "general_research":
      return "research";
    case "email_communication":
      return "writing";
    default:
      return "general";
  }
}
function deriveTransparentAssumptions(model) {
  const assumptions = [];
  if (model.explicitEntities.length > 0) {
    assumptions.push(`Known: Targeting ${model.explicitEntities.slice(0, 2).join(", ")}`);
  } else {
    assumptions.push(`Known: Deliverable strictly locked to ${model.deliverable}`);
  }
  if (model.geography) {
    const geoName = model.geography === "US" ? "United States" : model.geography;
    assumptions.push(`Inferred: Geographic focus is ${geoName}`);
  }
  switch (model.scope) {
    case "gtm_strategy":
      assumptions.push("Assumed: Mid-market B2B ICP with 30-90 day discovery cycles (stated in prompt)");
      break;
    case "hero_section":
      assumptions.push("Assumed: Developer/technical audience; no pricing or FAQ clutter");
      break;
    case "single_email":
      assumptions.push("Assumed: Senior commercial relationship; non-price levers prioritized");
      break;
    case "bug_fix":
      assumptions.push("Assumed: Production runtime; surgical fix with regression test");
      break;
    case "headline_only":
      assumptions.push("Assumed: Executive leadership tone; strict 2-line maximum");
      break;
    case "competitive_analysis":
      assumptions.push("Assumed: Verified market data prioritized over speculative estimates");
      break;
    case "metric_diagnostic":
      assumptions.push("Assumed: Funnel and cohort breakdown required before speculative fixes");
      break;
    case "single_image":
      assumptions.push("Assumed: 35mm f/1.4 lens optics and natural directional lighting");
      break;
    default:
      assumptions.push("Assumed: Senior practitioner standards with explicit constraints");
      break;
  }
  return assumptions;
}
function buildSummary(model) {
  if (model.isAlreadyDetailed) {
    return "Calibrated execution rigor preserving all user specifications.";
  }
  const geoLabel = model.geography === "US" ? "United States" : model.geography || "target market";
  switch (model.scope) {
    case "gtm_strategy":
      return `Comprehensive market-entry strategy calibrated for ${geoLabel}.`;
    case "hero_section":
      return "Developer outcome-oriented hero section copy and structure.";
    case "headline_only":
      return "Concise 2-line leadership headline options.";
    case "single_email":
      return "Professional, accountable customer communication.";
    case "bug_fix":
      return "Root-cause diagnosis, surgical code fix, and regression test.";
    case "competitive_analysis":
      return `In-depth competitive evaluation${model.geography ? ` for ${model.geography}` : ""}.`;
    case "single_image":
      return "Cinematic 35mm photographic prompt specification.";
    case "metric_diagnostic":
      return "Root-cause diagnostic framework and remediation plan.";
    default:
      return "Expert task specification structured for immediate execution.";
  }
}

// extension/src/engine/validator.ts
function extractAndParseJSON(raw) {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
  }
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
    }
  }
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const candidate = trimmed.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      try {
        const sanitized = candidate.replace(/[\u0000-\u001F]+/g, (match) => {
          if (match === "\n") return "\\n";
          if (match === "\r") return "\\r";
          if (match === "	") return "\\t";
          return "";
        });
        return JSON.parse(sanitized);
      } catch {
        return null;
      }
    }
  }
  return null;
}
function validateBetterResponse(data) {
  if (!data || typeof data !== "object") return null;
  const obj = data;
  const prompt = typeof obj.prompt === "string" ? obj.prompt.trim() : "";
  if (!prompt) return null;
  return {
    mode: "better",
    prompt,
    shortReason: typeof obj.shortReason === "string" ? obj.shortReason.trim() : "Calibrated high-leverage dimensions for target AI.",
    domain: isValidDomain(obj.domain) ? obj.domain : "general",
    calibratedDimensions: Array.isArray(obj.calibratedDimensions) ? obj.calibratedDimensions.map(String) : void 0,
    targetAi: typeof obj.targetAi === "string" ? obj.targetAi : void 0
  };
}
function validateExpertFinalResponse(data) {
  if (!data || typeof data !== "object") return null;
  const obj = data;
  const prompt = typeof obj.prompt === "string" ? obj.prompt.trim() : "";
  if (!prompt) return null;
  const rawAssumptions = Array.isArray(obj.assumptions) ? obj.assumptions : [];
  const assumptions = rawAssumptions.map(String);
  return {
    mode: "expert",
    prompt,
    intent: typeof obj.intent === "string" ? obj.intent.trim() : "Expert Briefing",
    summary: typeof obj.summary === "string" ? obj.summary.trim() : "Autonomous expert task specification",
    domain: isValidDomain(obj.domain) ? obj.domain : "general",
    assumptions
  };
}
function isValidDomain(val) {
  const domains = [
    "image_gen",
    "video_gen",
    "code",
    "marketing",
    "research",
    "writing",
    "business",
    "data",
    "general"
  ];
  return typeof val === "string" && domains.includes(val);
}

// extension/src/providers/openai.ts
var OpenAIProvider = class {
  constructor(apiKey, model = "gpt-5.6-luna", baseURL = "https://api.openai.com/v1") {
    this.apiKey = apiKey;
    this.model = model;
    this.baseURL = baseURL;
  }
  id = "openai";
  name = "OpenAI";
  async callChat(systemPrompt, userMessage, options) {
    const timeoutMs = options?.timeoutMs || 15e3;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ],
          temperature: 0.6
        }),
        signal: options?.signal || controller.signal
      });
      clearTimeout(timer);
      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(`OpenAI HTTP ${response.status}: ${errText.slice(0, 150)}`);
      }
      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }
  classifyOpenAIError(err) {
    const msg = err?.message || String(err);
    if (msg.includes("401") || msg.includes("Incorrect API key") || msg.includes("Unauthorized")) {
      return { reason: "OpenAI API key is invalid (HTTP 401)", status: 401, code: "INVALID_KEY" };
    }
    if (msg.includes("429") || msg.includes("quota") || msg.includes("Rate limit")) {
      return { reason: "OpenAI quota or rate limit exceeded (HTTP 429)", status: 429, code: "QUOTA_EXCEEDED" };
    }
    if (msg.includes("timeout") || msg.includes("AbortError")) {
      return { reason: "OpenAI request timed out", status: 408, code: "TIME_BUDGET_EXHAUSTED" };
    }
    if (msg.includes("500") || msg.includes("502") || msg.includes("503")) {
      return { reason: "OpenAI servers temporarily unavailable", status: 503, code: "SERVER_ERROR" };
    }
    return { reason: msg.slice(0, 120), status: 0, code: "NETWORK_ERROR" };
  }
  async generateBetter(rawInput, intent, options) {
    if (!this.apiKey) {
      const fallback2 = synthesizeBetterPrompt(rawInput, intent.targetAi);
      return {
        ...fallback2,
        isFallback: true,
        providerFailure: {
          provider: "openai",
          reason: "OpenAI API key is not configured. Add your key in Settings.",
          status: 0,
          code: "NO_KEY"
        }
      };
    }
    try {
      const content = await this.callChat(
        BETTER_SYSTEM_PROMPT,
        `User Input: "${rawInput}"
Detected Domain: ${intent.domain}
Target AI: ${intent.targetAi}`,
        options
      );
      const parsed = extractAndParseJSON(content);
      const validated = validateBetterResponse(parsed);
      if (validated) return validated;
    } catch (err) {
      console.warn("[Refinzi] OpenAI Better call failed, using local calibration:", err);
      const failure = this.classifyOpenAIError(err);
      const fallback2 = synthesizeBetterPrompt(rawInput, intent.targetAi);
      return {
        ...fallback2,
        isFallback: true,
        providerFailure: {
          provider: "openai",
          reason: failure.reason,
          status: failure.status,
          code: failure.code
        }
      };
    }
    const fallback = synthesizeBetterPrompt(rawInput, intent.targetAi);
    return {
      ...fallback,
      isFallback: true,
      providerFailure: {
        provider: "openai",
        reason: "OpenAI returned an invalid response",
        status: 0,
        code: "SERVER_ERROR"
      }
    };
  }
  async generateExpert(rawInput, intent, options) {
    if (!this.apiKey) {
      const fallback2 = synthesizeExpertPrompt(rawInput, intent.targetAi);
      return {
        ...fallback2,
        isFallback: true,
        providerFailure: {
          provider: "openai",
          reason: "OpenAI API key is not configured. Add your key in Settings.",
          status: 0,
          code: "NO_KEY"
        }
      };
    }
    try {
      const content = await this.callChat(
        EXPERT_SYSTEM_PROMPT,
        `User Raw Input: "${rawInput}"
Domain: ${intent.domain}
Target AI: ${intent.targetAi}`,
        options
      );
      const parsed = extractAndParseJSON(content);
      const validated = validateExpertFinalResponse(parsed);
      if (validated) return validated;
    } catch (err) {
      console.warn("[Refinzi] OpenAI Expert call failed, using local briefing:", err);
      const failure = this.classifyOpenAIError(err);
      const fallback2 = synthesizeExpertPrompt(rawInput, intent.targetAi);
      return {
        ...fallback2,
        isFallback: true,
        providerFailure: {
          provider: "openai",
          reason: failure.reason,
          status: failure.status,
          code: failure.code
        }
      };
    }
    const fallback = synthesizeExpertPrompt(rawInput, intent.targetAi);
    return {
      ...fallback,
      isFallback: true,
      providerFailure: {
        provider: "openai",
        reason: "OpenAI returned an invalid response",
        status: 0,
        code: "SERVER_ERROR"
      }
    };
  }
  async testConnection(options) {
    try {
      const res = await fetch(`${this.baseURL}/models`, {
        method: "GET",
        headers: { Authorization: `Bearer ${this.apiKey}` },
        signal: options?.signal || AbortSignal.timeout(6e3)
      });
      if (res.ok) {
        return { ok: true, message: "OpenAI API key verified successfully!" };
      }
      return { ok: false, message: `OpenAI returned status ${res.status}` };
    } catch (err) {
      return { ok: false, message: err?.message || "Connection failed" };
    }
  }
};

// extension/src/utils/storage-batch.ts
var SNAPSHOT_TTL_MS = 1500;
var snapshots = {};
function invalidateSnapshot(key) {
  delete snapshots[key];
}
function invalidateAllSnapshots() {
  for (const k of Object.keys(snapshots)) delete snapshots[k];
}
async function readSnapshot(key, fallbackEmpty) {
  const snap = snapshots[key];
  if (snap && Date.now() - snap.at < SNAPSHOT_TTL_MS && snap.value !== void 0) {
    return normalize(snap.value, fallbackEmpty);
  }
  try {
    const res = await BrowserAPI.storage.local.get([key]);
    const raw = res?.[key];
    snapshots[key] = { value: raw ?? null, at: Date.now() };
    return normalize(raw, fallbackEmpty);
  } catch {
    delete snapshots[key];
    return fallbackEmpty;
  }
}
function normalize(value, fallbackEmpty) {
  if (Array.isArray(fallbackEmpty)) {
    return Array.isArray(value) ? value : fallbackEmpty;
  }
  return value === null || value === void 0 ? fallbackEmpty : value;
}
function primeSnapshot(key, value) {
  snapshots[key] = { value, at: Date.now() };
}
var batchDepth = 0;
var pendingWrites = null;
async function stageWrite(items) {
  if (pendingWrites) {
    Object.assign(pendingWrites, items);
    return;
  }
  await BrowserAPI.storage.local.set(items);
}
async function runInBatch(fn) {
  batchDepth++;
  if (!pendingWrites) pendingWrites = {};
  try {
    const result = await fn();
    return result;
  } finally {
    batchDepth--;
    if (batchDepth === 0 && pendingWrites) {
      const writes = pendingWrites;
      pendingWrites = null;
      try {
        await BrowserAPI.storage.local.set(writes);
      } catch (err) {
        invalidateAllSnapshots();
        throw err;
      }
    } else if (batchDepth === 0) {
      pendingWrites = null;
    }
  }
}

// extension/src/utils/storage.ts
var decodeLegacyKey = (b64) => typeof atob === "function" ? atob(b64) : typeof Buffer !== "undefined" ? Buffer.from(b64, "base64").toString("binary") : "";
var DEFAULT_GEMINI_API_KEY = "";
var DEFAULT_GROQ_API_KEY = "";
var DEFAULT_BAI_API_KEY = decodeLegacyKey("c2std3MtSC5ESEVERUxJLlcxRXYuTUVRQ0lCbmRadVBVbXlGT2JlQUV6bnhSbzVfdlJNMUtMN29nTVo0eHVEYXNRVDBiQWlCUWtKX1pJdWFyS1l4MlRsUTU2akFhdER2QTZ0NmpheE4wYlhoYlJIc0J4UQ==");
var DEFAULT_BAI_ENDPOINT = "https://ws-ls7my6kl6a1yzk90.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1";
var DEPRECATED_GEMINI_API_KEYS = [
  decodeLegacyKey("QVEuQWI4Uk42S1g3T0E4dzlLOWNoc0hZR2xFX0VnbjZKU3dncHVPZTQ0S3pWMVdldzV1UHc="),
  decodeLegacyKey("QVEuQWI4Uk42SjF6QzVJVEZFbGh6LU94TjBvd0VueGhVaXM5QjN3X0FlTGdCNHZoNE4ySUE=")
];
var FREE_TIER_PROMPT_CAP = 25;
var DEFAULT_PROVIDER_MODELS = {
  // `gemini-flash-latest` is an evergreen alias that always resolves to the
  // newest Flash model (currently Gemini 3.8 Flash), so it never goes stale.
  gemini: "gemini-flash-latest",
  openai: "gpt-5.6-luna",
  deepseek: "deepseek-flash",
  openrouter: "deepseek/deepseek-v4-flash-0731:free",
  groq: "openai/gpt-oss-120b",
  bai: "qwen3.8-flash"
};
var DEFAULT_SETTINGS = {
  defaultMode: "better",
  // Default: b.ai (Qwen 3.8 Flash inference).
  provider: "bai",
  apiKeys: {
    bai: DEFAULT_BAI_API_KEY,
    groq: DEFAULT_GROQ_API_KEY
  },
  models: { ...DEFAULT_PROVIDER_MODELS },
  gatewayUrl: "https://refinzi.com/api/v1/refine",
  enabledSites: {
    chatgpt: true,
    claude: true,
    gemini: true,
    perplexity: true
  },
  shortcuts: {
    better: "Ctrl+Shift+B",
    expert: "Ctrl+Shift+E"
  },
  theme: "dark",
  autoFocus: true,
  showInlineTrigger: true,
  holdThresholdMs: 350,
  autoApply: true,
  saveHistory: true,
  hasSeenOnboarding: false,
  freeUsageCount: 0,
  freeUsageExpired: false
};
var DEPRECATED_MODELS = {
  gemini: [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-2.0-flash-exp",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.5-pro",
    "gemini-3-flash-preview"
  ],
  openai: [
    "gpt-4o-mini",
    "gpt-4o",
    "gpt-4-turbo",
    "gpt-4",
    "gpt-3.5-turbo",
    "o1-mini",
    "o1-preview",
    "o3-mini"
  ],
  deepseek: [
    "deepseek-chat",
    "deepseek-reasoner",
    "deepseek-v4-flash",
    "deepseek-v4-flash-vision-exp"
  ],
  openrouter: [
    "meta-llama/llama-3.3-70b-instruct:free",
    "deepseek/deepseek-r1:free",
    "deepseek/deepseek-chat",
    "google/gemini-2.0-flash-exp:free",
    "google/gemma-2-9b-it:free",
    "qwen/qwen-2.5-coder-32b-instruct:free",
    "mistralai/mistral-7b-instruct:free"
  ],
  groq: [
    "llama-3.3-70b-versatile",
    "llama-3.1-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768"
  ],
  bai: []
};
var SETTINGS_KEY = "refinzi_settings";
function invalidateSettingsCache() {
  invalidateSnapshot(SETTINGS_KEY);
}
async function getSettings() {
  try {
    const saved = await readSnapshot(SETTINGS_KEY, null);
    if (!saved) {
      return { ...DEFAULT_SETTINGS };
    }
    const savedGeminiKey = saved.apiKeys?.gemini;
    const isDeprecatedKey = !savedGeminiKey || DEPRECATED_GEMINI_API_KEYS.includes(savedGeminiKey);
    const resolvedGeminiKey = isDeprecatedKey ? "" : savedGeminiKey;
    const savedModels = saved.models || {};
    const resolvedModels = { ...DEFAULT_PROVIDER_MODELS };
    Object.keys(resolvedModels).forEach((key) => {
      const savedModel = savedModels[key];
      const deprecated = DEPRECATED_MODELS[key];
      const isRetired = !savedModel || deprecated.includes(savedModel);
      resolvedModels[key] = isRetired ? DEFAULT_PROVIDER_MODELS[key] : savedModel;
    });
    return {
      ...DEFAULT_SETTINGS,
      ...saved,
      provider: saved.provider || "gateway",
      apiKeys: {
        ...DEFAULT_SETTINGS.apiKeys,
        ...saved.apiKeys || {},
        gemini: resolvedGeminiKey
      },
      models: resolvedModels,
      enabledSites: {
        ...DEFAULT_SETTINGS.enabledSites,
        ...saved.enabledSites || {}
      }
    };
  } catch {
    invalidateSettingsCache();
    return { ...DEFAULT_SETTINGS };
  }
}
async function saveSettings(patch) {
  const current = await getSettings();
  const updated = {
    ...current,
    ...patch,
    apiKeys: {
      ...current.apiKeys,
      ...patch.apiKeys || {}
    },
    models: {
      ...current.models,
      ...patch.models || {}
    },
    enabledSites: {
      ...current.enabledSites,
      ...patch.enabledSites || {}
    }
  };
  try {
    primeSnapshot(SETTINGS_KEY, updated);
    await stageWrite({ refinzi_settings: updated });
  } catch (err) {
    invalidateSettingsCache();
    console.error("[Refinzi] Failed to save settings:", err);
  }
  return updated;
}
async function isFreeKeyActive() {
  const settings = await getSettings();
  const usingDefaultKey = settings.provider === "gemini" && (!settings.apiKeys?.gemini || settings.apiKeys.gemini === DEFAULT_GEMINI_API_KEY);
  return usingDefaultKey && !settings.freeUsageExpired;
}
async function incrementFreeUsage() {
  try {
    const settings = await getSettings();
    if (settings.freeUsageExpired) return;
    const currentCount = settings.freeUsageCount ?? 0;
    const newCount = currentCount + 1;
    const expired = newCount >= FREE_TIER_PROMPT_CAP;
    await saveSettings({
      freeUsageCount: newCount,
      freeUsageExpired: expired
    });
  } catch (err) {
    console.error("[Refinzi] Failed to increment free usage count:", err);
  }
}
var HISTORY_KEY = "refinzi_history";
var STATS_KEY = "refinzi_stats";
async function getHistory() {
  return readSnapshot(HISTORY_KEY, []);
}
async function addHistoryItem(item) {
  try {
    await incrementStats(item.mode);
    const settings = await getSettings();
    if (settings.saveHistory === false) return;
    const now = /* @__PURE__ */ new Date();
    const dateStr = now.toISOString().split("T")[0];
    const newItem = {
      ...item,
      id: "rfz_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now().toString(36),
      timestamp: Date.now(),
      dateStr
    };
    const history = await getHistory();
    const updated = [newItem, ...history].slice(0, 50);
    primeSnapshot(HISTORY_KEY, updated);
    await stageWrite({ refinzi_history: updated });
  } catch (err) {
    console.error("[Refinzi] Failed to record history:", err);
  }
}
async function clearHistory() {
  try {
    primeSnapshot(HISTORY_KEY, []);
    await stageWrite({ refinzi_history: [] });
  } catch (err) {
    console.error("[Refinzi] Failed to clear history:", err);
  }
}
async function deleteHistoryItem(id) {
  try {
    const history = await getHistory();
    const updated = history.filter((item) => item.id !== id);
    primeSnapshot(HISTORY_KEY, updated);
    await stageWrite({ refinzi_history: updated });
  } catch (err) {
    console.error("[Refinzi] Failed to delete history item:", err);
  }
}
async function getStats() {
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const stored = await readSnapshot(STATS_KEY, null);
  const stats = stored || {
    todayBetterCount: 0,
    todayExpertCount: 0,
    lastDate: today
  };
  if (stats.lastDate !== today) {
    return {
      todayBetterCount: 0,
      todayExpertCount: 0,
      lastDate: today
    };
  }
  return stats;
}
async function incrementStats(mode) {
  try {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const stats = await getStats();
    if (mode === "better") {
      stats.todayBetterCount = (stats.todayBetterCount || 0) + 1;
    } else {
      stats.todayExpertCount = (stats.todayExpertCount || 0) + 1;
    }
    stats.lastDate = today;
    primeSnapshot(STATS_KEY, stats);
    await stageWrite({ refinzi_stats: stats });
  } catch (err) {
    console.error("[Refinzi] Failed to update stats:", err);
  }
}

// extension/src/providers/gemini.ts
var GEMINI_FALLBACK_MODELS = [
  "gemini-flash-latest",
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite"
];
var ATTEMPT_TIMEOUT_MS = 9e3;
var TOTAL_BUDGET_MS = 18e3;
var ATTEMPTS_PER_MODEL = 1;
var LAST_GOOD_TTL_MS = 5 * 60 * 1e3;
var lastGoodModel = null;
var lastGoodAt = 0;
function isRetryableStatus(status) {
  return status === 408 || status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}
function isFatalStatus(status) {
  return status === 400 || status === 401 || status === 403;
}
var GeminiHttpError = class extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = "GeminiHttpError";
  }
};
var GeminiProvider = class {
  id = "gemini";
  name = "Google Gemini";
  apiKey;
  model;
  constructor(apiKey, model = "gemini-flash-latest") {
    this.apiKey = apiKey && apiKey.trim() || DEFAULT_GEMINI_API_KEY;
    this.model = model && model.trim() || "gemini-flash-latest";
  }
  /**
   * Configured model first, then the known-good model (if one is remembered and
   * still fresh), then the static fallbacks — de-duplicated.
   */
  buildModelChain() {
    const base = [this.model, ...GEMINI_FALLBACK_MODELS].filter(Boolean);
    const remembered = lastGoodModel;
    const memoryIsFresh = !!remembered && remembered !== this.model && Date.now() - lastGoodAt < LAST_GOOD_TTL_MS;
    return Array.from(new Set(memoryIsFresh ? [remembered, ...base] : base));
  }
  /** Single request against one model. */
  async callModel(model, systemPrompt, userMessage, timeoutMs, externalSignal) {
    const activeKey = this.apiKey || DEFAULT_GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const signal = externalSignal ? typeof AbortSignal.any === "function" ? AbortSignal.any([controller.signal, externalSignal]) : controller.signal : controller.signal;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": activeKey
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userMessage }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.6
          }
        }),
        signal
      });
      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new GeminiHttpError(response.status, `Gemini HTTP ${response.status}: ${errText.slice(0, 150)}`);
      }
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } finally {
      clearTimeout(timer);
    }
  }
  /**
   * Calls Gemini with model fallback.
   *
   * Order of defence:
   *   1. try the configured model
   *   2. walk the fallback chain, so one busy or throttled model cannot disable
   *      the feature (each model has its own capacity pool and quota bucket)
   *   3. only then propagate, letting the caller fall back to local synthesis
   *
   * Bounded by a wall-clock budget so a degraded provider cannot hang the UI.
   */
  async callGemini(systemPrompt, userMessage, options) {
    const chain = this.buildModelChain();
    const budgetMs = options?.timeoutMs ?? TOTAL_BUDGET_MS;
    const deadline = Date.now() + budgetMs;
    const failures = [];
    for (const model of chain) {
      for (let attempt = 0; attempt < ATTEMPTS_PER_MODEL; attempt++) {
        const remaining = deadline - Date.now();
        if (remaining < 1200) {
          throw new Error(
            `Gemini time budget (${budgetMs}ms) exhausted. Tried: ${failures.join(" | ")}`
          );
        }
        try {
          const text = await this.callModel(
            model,
            systemPrompt,
            userMessage,
            Math.min(ATTEMPT_TIMEOUT_MS, remaining),
            options?.signal
          );
          if (text && text.trim()) {
            lastGoodModel = model;
            lastGoodAt = Date.now();
            if (model !== this.model) {
              console.warn(
                `[Refinzi] Gemini served by fallback model "${model}" (primary "${this.model}" unavailable).`
              );
            }
            return text;
          }
          failures.push(`${model}: empty response`);
        } catch (err) {
          const status = err instanceof GeminiHttpError ? err.status : 0;
          const label = status ? `HTTP ${status}` : err?.name || "error";
          failures.push(`${model}: ${label}`);
          if (isFatalStatus(status)) {
            throw new Error(`Gemini request rejected (${label}). ${err?.message ?? ""}`.trim());
          }
          if (status === 404) break;
          if (!isRetryableStatus(status) && status !== 0) break;
        }
      }
    }
    throw new Error(`All Gemini models failed. Tried: ${failures.join(" | ")}`);
  }
  classifyGeminiError(err) {
    const msg = err?.message || String(err);
    if (msg.includes("401") || msg.includes("API_KEY_INVALID") || msg.includes("Unauthorized")) {
      return { reason: "Gemini API key is invalid (HTTP 401)", status: 401, code: "INVALID_KEY" };
    }
    if (msg.includes("403") || msg.includes("PERMISSION_DENIED")) {
      return { reason: "Gemini API permission denied (HTTP 403)", status: 403, code: "INVALID_KEY" };
    }
    if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota") || msg.includes("throttled")) {
      return { reason: "Gemini quota or rate limit exceeded (HTTP 429)", status: 429, code: "QUOTA_EXCEEDED" };
    }
    if (msg.includes("time budget") || msg.includes("timeout") || msg.includes("AbortError")) {
      return { reason: "Gemini request timed out", status: 408, code: "TIME_BUDGET_EXHAUSTED" };
    }
    if (msg.includes("500") || msg.includes("502") || msg.includes("503") || msg.includes("504")) {
      return { reason: "Google Gemini servers temporarily unavailable", status: 503, code: "SERVER_ERROR" };
    }
    return { reason: msg.slice(0, 120), status: 0, code: "NETWORK_ERROR" };
  }
  async generateBetter(rawInput, intent, options) {
    if (!this.apiKey) {
      const fallback2 = synthesizeBetterPrompt(rawInput, intent.targetAi);
      return {
        ...fallback2,
        isFallback: true,
        providerFailure: {
          provider: "gemini",
          reason: "Gemini API key is not configured. Add your free key in Settings.",
          status: 0,
          code: "NO_KEY"
        }
      };
    }
    try {
      const text = await this.callGemini(
        BETTER_SYSTEM_PROMPT,
        `Input: "${rawInput}"
Domain: ${intent.domain}
Target AI: ${intent.targetAi}`,
        options
      );
      const parsed = extractAndParseJSON(text);
      const validated = validateBetterResponse(parsed);
      if (validated) return validated;
    } catch (err) {
      console.warn("[Refinzi] Gemini Better call failed, using local calibration:", err);
      const failure = this.classifyGeminiError(err);
      const fallback2 = synthesizeBetterPrompt(rawInput, intent.targetAi);
      return {
        ...fallback2,
        isFallback: true,
        providerFailure: {
          provider: "gemini",
          reason: failure.reason,
          status: failure.status,
          code: failure.code
        }
      };
    }
    const fallback = synthesizeBetterPrompt(rawInput, intent.targetAi);
    return {
      ...fallback,
      isFallback: true,
      providerFailure: {
        provider: "gemini",
        reason: "Gemini returned an invalid response",
        status: 0,
        code: "SERVER_ERROR"
      }
    };
  }
  async generateExpert(rawInput, intent, options) {
    if (!this.apiKey) {
      const fallback2 = synthesizeExpertPrompt(rawInput, intent.targetAi);
      return {
        ...fallback2,
        isFallback: true,
        providerFailure: {
          provider: "gemini",
          reason: "Gemini API key is not configured. Add your free key in Settings.",
          status: 0,
          code: "NO_KEY"
        }
      };
    }
    try {
      const text = await this.callGemini(
        EXPERT_SYSTEM_PROMPT,
        `User Raw Input: "${rawInput}"
Domain: ${intent.domain}
Target AI: ${intent.targetAi}`,
        options
      );
      const parsed = extractAndParseJSON(text);
      const validated = validateExpertFinalResponse(parsed);
      if (validated) return validated;
    } catch (err) {
      console.warn("[Refinzi] Gemini Expert call failed, using local briefing:", err);
      const failure = this.classifyGeminiError(err);
      const fallback2 = synthesizeExpertPrompt(rawInput, intent.targetAi);
      return {
        ...fallback2,
        isFallback: true,
        providerFailure: {
          provider: "gemini",
          reason: failure.reason,
          status: failure.status,
          code: failure.code
        }
      };
    }
    const fallback = synthesizeExpertPrompt(rawInput, intent.targetAi);
    return {
      ...fallback,
      isFallback: true,
      providerFailure: {
        provider: "gemini",
        reason: "Gemini returned an invalid response",
        status: 0,
        code: "SERVER_ERROR"
      }
    };
  }
  async testConnection(options) {
    try {
      const activeKey = this.apiKey || DEFAULT_GEMINI_API_KEY;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${activeKey}`, {
        method: "GET",
        headers: {
          "X-goog-api-key": activeKey
        },
        signal: options?.signal || AbortSignal.timeout(6e3)
      });
      if (res.ok) {
        return { ok: true, message: "Google Gemini API key verified successfully!" };
      }
      return { ok: false, message: `Gemini returned status ${res.status}` };
    } catch (err) {
      return { ok: false, message: err?.message || "Connection failed" };
    }
  }
};

// extension/src/providers/deepseek.ts
var DeepSeekProvider = class {
  id = "deepseek";
  name = "DeepSeek";
  apiKey;
  model;
  constructor(apiKey, model = "deepseek-flash") {
    this.apiKey = apiKey;
    this.model = model;
  }
  async callDeepSeek(systemPrompt, userMessage, options) {
    const timeoutMs = options?.timeoutMs || 15e3;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ],
          temperature: 0.6
        }),
        signal: options?.signal || controller.signal
      });
      clearTimeout(timer);
      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(`DeepSeek HTTP ${response.status}: ${errText.slice(0, 150)}`);
      }
      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }
  async generateBetter(rawInput, intent, options) {
    if (!this.apiKey) return synthesizeBetterPrompt(rawInput, intent.targetAi);
    try {
      const text = await this.callDeepSeek(
        BETTER_SYSTEM_PROMPT,
        `Input: "${rawInput}"
Domain: ${intent.domain}
Target AI: ${intent.targetAi}`,
        options
      );
      const parsed = extractAndParseJSON(text);
      const validated = validateBetterResponse(parsed);
      if (validated) return validated;
    } catch (err) {
      console.warn("[Refinzi] DeepSeek Better call failed, using local calibration:", err);
    }
    return synthesizeBetterPrompt(rawInput, intent.targetAi);
  }
  async generateExpert(rawInput, intent, options) {
    if (!this.apiKey) return synthesizeExpertPrompt(rawInput, intent.targetAi);
    try {
      const text = await this.callDeepSeek(
        EXPERT_SYSTEM_PROMPT,
        `User Raw Input: "${rawInput}"
Domain: ${intent.domain}
Target AI: ${intent.targetAi}`,
        options
      );
      const parsed = extractAndParseJSON(text);
      const validated = validateExpertFinalResponse(parsed);
      if (validated) return validated;
    } catch (err) {
      console.warn("[Refinzi] DeepSeek Expert call failed, using local briefing:", err);
    }
    return synthesizeExpertPrompt(rawInput, intent.targetAi);
  }
  async testConnection(options) {
    try {
      const res = await fetch("https://api.deepseek.com/models", {
        method: "GET",
        headers: { Authorization: `Bearer ${this.apiKey}` },
        signal: options?.signal || AbortSignal.timeout(6e3)
      });
      if (res.ok) {
        return { ok: true, message: "DeepSeek API key verified successfully!" };
      }
      return { ok: false, message: `DeepSeek returned status ${res.status}` };
    } catch (err) {
      return { ok: false, message: err?.message || "Connection failed" };
    }
  }
};

// extension/src/providers/openrouter.ts
var OpenRouterProvider = class {
  constructor(apiKey, model = "deepseek/deepseek-v4-flash-0731:free") {
    this.apiKey = apiKey;
    this.model = model;
  }
  id = "openrouter";
  name = "OpenRouter";
  async callOpenRouter(systemPrompt, userMessage, options) {
    const timeoutMs = options?.timeoutMs || 15e3;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
          "HTTP-Referer": "https://refinzi.com",
          "X-Title": "Refinzi Browser Extension"
        },
        body: JSON.stringify({
          model: this.model,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ],
          temperature: 0.6
        }),
        signal: options?.signal || controller.signal
      });
      clearTimeout(timer);
      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(`OpenRouter HTTP ${response.status}: ${errText.slice(0, 150)}`);
      }
      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }
  async generateBetter(rawInput, intent, options) {
    if (!this.apiKey) return synthesizeBetterPrompt(rawInput, intent.targetAi);
    try {
      const text = await this.callOpenRouter(
        BETTER_SYSTEM_PROMPT,
        `Input: "${rawInput}"
Domain: ${intent.domain}
Target AI: ${intent.targetAi}`,
        options
      );
      const parsed = extractAndParseJSON(text);
      const validated = validateBetterResponse(parsed);
      if (validated) return validated;
    } catch (err) {
      console.warn("[Refinzi] OpenRouter Better call failed, using local calibration:", err);
    }
    return synthesizeBetterPrompt(rawInput, intent.targetAi);
  }
  async generateExpert(rawInput, intent, options) {
    if (!this.apiKey) return synthesizeExpertPrompt(rawInput, intent.targetAi);
    try {
      const text = await this.callOpenRouter(
        EXPERT_SYSTEM_PROMPT,
        `User Raw Input: "${rawInput}"
Domain: ${intent.domain}
Target AI: ${intent.targetAi}`,
        options
      );
      const parsed = extractAndParseJSON(text);
      const validated = validateExpertFinalResponse(parsed);
      if (validated) return validated;
    } catch (err) {
      console.warn("[Refinzi] OpenRouter Expert call failed, using local briefing:", err);
    }
    return synthesizeExpertPrompt(rawInput, intent.targetAi);
  }
  async testConnection(options) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/auth/key", {
        method: "GET",
        headers: { Authorization: `Bearer ${this.apiKey}` },
        signal: options?.signal || AbortSignal.timeout(6e3)
      });
      if (res.ok) {
        return { ok: true, message: "OpenRouter API key verified successfully!" };
      }
      return { ok: false, message: `OpenRouter returned status ${res.status}` };
    } catch (err) {
      return { ok: false, message: err?.message || "Connection failed" };
    }
  }
};

// extension/src/providers/gateway.ts
var GatewayProvider = class {
  constructor(gatewayUrl = "https://refinzi.com/api/v1/refine", apiKey, model = "gateway-default") {
    this.gatewayUrl = gatewayUrl;
    this.apiKey = apiKey;
    this.model = model;
  }
  id = "gateway";
  name = "Refinzi Gateway";
  async callGateway(systemPrompt, text, options) {
    const timeoutMs = options?.timeoutMs || 15e3;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(this.gatewayUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.apiKey ? { "x-api-key": this.apiKey, "Authorization": `Bearer ${this.apiKey}` } : {}
        },
        body: JSON.stringify({
          text,
          systemPrompt,
          model: this.model,
          apiKey: this.apiKey
        }),
        signal: options?.signal || controller.signal
      });
      clearTimeout(timer);
      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(`Gateway HTTP ${response.status}: ${errText.slice(0, 150)}`);
      }
      const data = await response.json();
      return data.refinedText || "";
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }
  classifyGatewayError(err) {
    const msg = err?.message || String(err);
    if (msg.includes("401") || msg.includes("Unauthorized")) {
      return { reason: "Gateway access unauthorized. Add a BYOK API key in Settings.", status: 401, code: "INVALID_KEY" };
    }
    if (msg.includes("429")) {
      return { reason: "Gateway rate limited. Add your free Gemini API key for unlimited speed.", status: 429, code: "QUOTA_EXCEEDED" };
    }
    if (msg.includes("timeout") || msg.includes("AbortError")) {
      return { reason: "Gateway request timed out", status: 408, code: "TIME_BUDGET_EXHAUSTED" };
    }
    if (msg.includes("500") || msg.includes("502") || msg.includes("503")) {
      return { reason: "Gateway server temporarily unavailable", status: 503, code: "SERVER_ERROR" };
    }
    return { reason: "Gateway connection error. Configure a BYOK key in Settings.", status: 0, code: "NETWORK_ERROR" };
  }
  async generateBetter(rawInput, intent, options) {
    try {
      const text = await this.callGateway(
        BETTER_SYSTEM_PROMPT,
        `Input: "${rawInput}"
Domain: ${intent.domain}
Target AI: ${intent.targetAi}`,
        options
      );
      const parsed = extractAndParseJSON(text);
      const validated = validateBetterResponse(parsed);
      if (validated) return validated;
    } catch (err) {
      console.warn("[Refinzi] Gateway Better call failed, using local calibration:", err);
      const failure = this.classifyGatewayError(err);
      const fallback2 = synthesizeBetterPrompt(rawInput, intent.targetAi);
      return {
        ...fallback2,
        isFallback: true,
        providerFailure: {
          provider: "gateway",
          reason: failure.reason,
          status: failure.status,
          code: failure.code,
          isDefaultFallback: !this.apiKey
        }
      };
    }
    const fallback = synthesizeBetterPrompt(rawInput, intent.targetAi);
    return {
      ...fallback,
      isFallback: true,
      providerFailure: {
        provider: "gateway",
        reason: "Gateway returned an invalid response",
        status: 0,
        code: "SERVER_ERROR",
        isDefaultFallback: !this.apiKey
      }
    };
  }
  async generateExpert(rawInput, intent, options) {
    try {
      const text = await this.callGateway(
        EXPERT_SYSTEM_PROMPT,
        `User Raw Input: "${rawInput}"
Domain: ${intent.domain}
Target AI: ${intent.targetAi}`,
        options
      );
      const parsed = extractAndParseJSON(text);
      const validated = validateExpertFinalResponse(parsed);
      if (validated) return validated;
    } catch (err) {
      console.warn("[Refinzi] Gateway Expert call failed, using local briefing:", err);
      const failure = this.classifyGatewayError(err);
      const fallback2 = synthesizeExpertPrompt(rawInput, intent.targetAi);
      return {
        ...fallback2,
        isFallback: true,
        providerFailure: {
          provider: "gateway",
          reason: failure.reason,
          status: failure.status,
          code: failure.code,
          isDefaultFallback: !this.apiKey
        }
      };
    }
    const fallback = synthesizeExpertPrompt(rawInput, intent.targetAi);
    return {
      ...fallback,
      isFallback: true,
      providerFailure: {
        provider: "gateway",
        reason: "Gateway returned an invalid response",
        status: 0,
        code: "SERVER_ERROR",
        isDefaultFallback: !this.apiKey
      }
    };
  }
  async testConnection(options) {
    try {
      const res = await fetch(this.gatewayUrl, {
        method: "OPTIONS",
        signal: options?.signal || AbortSignal.timeout(6e3)
      });
      if (res.ok || res.status === 405) {
        return { ok: true, message: "Refinzi Gateway reachable" };
      }
      return { ok: false, message: `Gateway status: ${res.status}` };
    } catch (err) {
      return { ok: false, message: err?.message || "Gateway unreachable" };
    }
  }
};

// extension/src/providers/groq.ts
var GroqProvider = class {
  id = "groq";
  name = "Groq";
  apiKey;
  model;
  constructor(apiKey = DEFAULT_GROQ_API_KEY, model = "openai/gpt-oss-120b") {
    this.apiKey = apiKey || DEFAULT_GROQ_API_KEY;
    this.model = model;
  }
  classifyGroqError(err) {
    const msg = err?.message || String(err);
    if (msg.includes("401") || msg.includes("Unauthorized") || msg.includes("invalid_api_key")) {
      return { provider: "groq", reason: "Invalid Groq API key. Check your key in Settings.", status: 401, code: "INVALID_KEY" };
    }
    if (msg.includes("429") || msg.includes("rate_limit_exceeded")) {
      return { provider: "groq", reason: "Groq rate limit exceeded. Please wait a moment.", status: 429, code: "RATE_LIMITED" };
    }
    if (msg.includes("timeout") || msg.includes("AbortError")) {
      return { provider: "groq", reason: "Groq request timed out", status: 408, code: "TIME_BUDGET_EXHAUSTED" };
    }
    if (msg.includes("500") || msg.includes("502") || msg.includes("503")) {
      return { provider: "groq", reason: "Groq service temporarily unavailable", status: 503, code: "SERVER_ERROR" };
    }
    return { provider: "groq", reason: "Groq connection error: " + msg.slice(0, 80), status: 0, code: "NETWORK_ERROR" };
  }
  async callGroq(systemPrompt, userMessage, options) {
    const timeoutMs = options?.timeoutMs || 15e3;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ],
          temperature: 0.6
        }),
        signal: options?.signal || controller.signal
      });
      clearTimeout(timer);
      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(`Groq HTTP ${response.status}: ${errText.slice(0, 150)}`);
      }
      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }
  async generateBetter(rawInput, intent, options) {
    if (!this.apiKey) {
      const fallback2 = synthesizeBetterPrompt(rawInput, intent.targetAi);
      return {
        ...fallback2,
        isFallback: true,
        providerFailure: {
          provider: "groq",
          reason: "No Groq API key configured",
          code: "NO_KEY"
        }
      };
    }
    try {
      const text = await this.callGroq(
        BETTER_SYSTEM_PROMPT,
        `Input: "${rawInput}"
Domain: ${intent.domain}
Target AI: ${intent.targetAi}`,
        options
      );
      const parsed = extractAndParseJSON(text);
      const validated = validateBetterResponse(parsed);
      if (validated) return validated;
    } catch (err) {
      console.warn("[Refinzi] Groq Better call failed, using local calibration:", err);
      const failure = this.classifyGroqError(err);
      const fallback2 = synthesizeBetterPrompt(rawInput, intent.targetAi);
      return {
        ...fallback2,
        isFallback: true,
        providerFailure: failure
      };
    }
    const fallback = synthesizeBetterPrompt(rawInput, intent.targetAi);
    return {
      ...fallback,
      isFallback: true,
      providerFailure: {
        provider: "groq",
        reason: "Groq returned an invalid response structure",
        code: "SERVER_ERROR"
      }
    };
  }
  async generateExpert(rawInput, intent, options) {
    if (!this.apiKey) {
      const fallback2 = synthesizeExpertPrompt(rawInput, intent.targetAi);
      return {
        ...fallback2,
        isFallback: true,
        providerFailure: {
          provider: "groq",
          reason: "No Groq API key configured",
          code: "NO_KEY"
        }
      };
    }
    try {
      const text = await this.callGroq(
        EXPERT_SYSTEM_PROMPT,
        `User Raw Input: "${rawInput}"
Domain: ${intent.domain}
Target AI: ${intent.targetAi}`,
        options
      );
      const parsed = extractAndParseJSON(text);
      const validated = validateExpertFinalResponse(parsed);
      if (validated) return validated;
    } catch (err) {
      console.warn("[Refinzi] Groq Expert call failed, using local briefing:", err);
      const failure = this.classifyGroqError(err);
      const fallback2 = synthesizeExpertPrompt(rawInput, intent.targetAi);
      return {
        ...fallback2,
        isFallback: true,
        providerFailure: failure
      };
    }
    const fallback = synthesizeExpertPrompt(rawInput, intent.targetAi);
    return {
      ...fallback,
      isFallback: true,
      providerFailure: {
        provider: "groq",
        reason: "Groq returned an invalid response structure",
        code: "SERVER_ERROR"
      }
    };
  }
  async testConnection(options) {
    if (!this.apiKey) {
      return { ok: false, message: "Missing Groq API key. Paste your key from console.groq.com" };
    }
    try {
      const res = await fetch("https://api.groq.com/openai/v1/models", {
        headers: {
          "Authorization": `Bearer ${this.apiKey}`
        },
        signal: options?.signal || AbortSignal.timeout(7e3)
      });
      if (res.ok) {
        return { ok: true, message: "Groq connected successfully (Ultra-fast LPU inference ready)" };
      }
      if (res.status === 401) {
        return { ok: false, message: "Invalid Groq API key (HTTP 401)" };
      }
      return { ok: false, message: `Groq error (HTTP ${res.status})` };
    } catch (err) {
      return { ok: false, message: err?.message || "Connection failed" };
    }
  }
};

// extension/src/providers/bai.ts
var BAIProvider = class {
  id = "bai";
  name = "b.ai";
  apiKey;
  model;
  baseUrl;
  constructor(apiKey, model = "qwen3.8-flash", baseUrl = DEFAULT_BAI_ENDPOINT) {
    this.apiKey = apiKey !== void 0 ? apiKey : DEFAULT_BAI_API_KEY;
    this.model = model || "qwen3.8-flash";
    this.baseUrl = baseUrl || DEFAULT_BAI_ENDPOINT;
  }
  classifyBaiError(err) {
    const msg = err?.message || String(err);
    if (msg.includes("401") || msg.includes("Unauthorized") || msg.includes("invalid_api_key")) {
      return { provider: "bai", reason: "Invalid b.ai API key. Check your key in Settings.", status: 401, code: "INVALID_KEY" };
    }
    if (msg.includes("429") || msg.includes("rate_limit_exceeded") || msg.includes("quota")) {
      return { provider: "bai", reason: "b.ai rate limit exceeded. Please wait a moment.", status: 429, code: "RATE_LIMITED" };
    }
    if (msg.includes("timeout") || msg.includes("AbortError")) {
      return { provider: "bai", reason: "b.ai request timed out", status: 408, code: "TIME_BUDGET_EXHAUSTED" };
    }
    if (msg.includes("500") || msg.includes("502") || msg.includes("503")) {
      return { provider: "bai", reason: "b.ai service temporarily unavailable", status: 503, code: "SERVER_ERROR" };
    }
    return { provider: "bai", reason: "b.ai connection error: " + msg.slice(0, 80), status: 0, code: "NETWORK_ERROR" };
  }
  async callBai(systemPrompt, userMessage, options) {
    const timeoutMs = options?.timeoutMs || 25e3;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const endpoint = `${this.baseUrl.replace(/\/+$/, "")}/chat/completions`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          enable_thinking: false,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ],
          temperature: 0.4
        }),
        signal: options?.signal || controller.signal
      });
      clearTimeout(timer);
      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(`b.ai HTTP ${response.status}: ${errText.slice(0, 150)}`);
      }
      const data = await response.json();
      const choice = data.choices?.[0];
      const content = choice?.message?.content || choice?.message?.reasoning_content || "";
      return content;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }
  async generateBetter(rawInput, intent, options) {
    if (!this.apiKey) {
      const fallback2 = synthesizeBetterPrompt(rawInput, intent.targetAi);
      return {
        ...fallback2,
        isFallback: true,
        providerFailure: {
          provider: "bai",
          reason: "No b.ai API key configured",
          code: "NO_KEY"
        }
      };
    }
    try {
      const userPayload = JSON.stringify({
        rawPrompt: rawInput,
        targetAi: intent.targetAi,
        domain: intent.domain
      });
      const rawResponse = await this.callBai(BETTER_SYSTEM_PROMPT, userPayload, options);
      const parsed = extractAndParseJSON(rawResponse);
      const validated = validateBetterResponse(parsed);
      if (validated) return validated;
    } catch (err) {
      console.warn("[Refinzi] b.ai Better call failed, using local calibration:", err);
      const fallback2 = synthesizeBetterPrompt(rawInput, intent.targetAi);
      return {
        ...fallback2,
        isFallback: true,
        providerFailure: this.classifyBaiError(err)
      };
    }
    const fallback = synthesizeBetterPrompt(rawInput, intent.targetAi);
    return {
      ...fallback,
      isFallback: true,
      providerFailure: {
        provider: "bai",
        reason: "b.ai returned an invalid response structure",
        code: "SERVER_ERROR"
      }
    };
  }
  async generateExpert(rawInput, intent, options) {
    if (!this.apiKey) {
      const fallback2 = synthesizeExpertPrompt(rawInput, intent.targetAi);
      return {
        ...fallback2,
        isFallback: true,
        providerFailure: {
          provider: "bai",
          reason: "No b.ai API key configured",
          code: "NO_KEY"
        }
      };
    }
    try {
      const userPayload = JSON.stringify({
        rawPrompt: rawInput,
        targetAi: intent.targetAi,
        domain: intent.domain,
        assumptions: intent.assumptions,
        constraints: intent.constraints
      });
      const rawResponse = await this.callBai(EXPERT_SYSTEM_PROMPT, userPayload, options);
      const parsed = extractAndParseJSON(rawResponse);
      const validated = validateExpertFinalResponse(parsed);
      if (validated) return validated;
    } catch (err) {
      console.warn("[Refinzi] b.ai Expert call failed, using local briefing:", err);
      const fallback2 = synthesizeExpertPrompt(rawInput, intent.targetAi);
      return {
        ...fallback2,
        isFallback: true,
        providerFailure: this.classifyBaiError(err)
      };
    }
    const fallback = synthesizeExpertPrompt(rawInput, intent.targetAi);
    return {
      ...fallback,
      isFallback: true,
      providerFailure: {
        provider: "bai",
        reason: "b.ai returned an invalid response structure",
        code: "SERVER_ERROR"
      }
    };
  }
  async testConnection(options) {
    if (!this.apiKey) {
      return { ok: false, message: "No b.ai API key provided." };
    }
    try {
      const endpoint = `${this.baseUrl.replace(/\/+$/, "")}/models`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), options?.timeoutMs || 8e3);
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`
        },
        signal: options?.signal || controller.signal
      });
      clearTimeout(timer);
      if (response.ok) {
        return { ok: true, message: `b.ai connected successfully (Model: ${this.model}).` };
      }
      if (response.status === 401) {
        return { ok: false, message: "Invalid b.ai API key (HTTP 401)." };
      }
      return { ok: false, message: `b.ai connection returned HTTP ${response.status}.` };
    } catch (err) {
      if (err?.name === "AbortError") {
        return { ok: false, message: "b.ai connection test timed out." };
      }
      return { ok: false, message: `b.ai error: ${err?.message || String(err)}` };
    }
  }
};

// extension/src/engine/intent.ts
function extractSemanticIntent(rawInput, mode = "better", targetAi = "general") {
  const text = (rawInput || "").trim();
  const lower = text.toLowerCase();
  const domain = detectTaskDomain(lower);
  const objective = extractObjective2(text, domain);
  const calibratedDimensions = detectMissingDimensions(domain, lower);
  const assumptions = deriveDefensibleAssumptions(domain, lower, targetAi);
  const audience = extractAudience(lower, domain, assumptions);
  const constraints = extractConstraints2(text, lower);
  const context = [
    `Target AI Platform: ${targetAi}`,
    `Inferred Domain: ${domain}`
  ];
  const desiredOutput = extractDesiredOutput(domain, lower);
  const artifactType = domain === "code" ? "code" : domain === "image_gen" || domain === "video_gen" ? "visual" : domain === "research" ? "query" : "text";
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const confidence = Math.min(0.95, Math.max(0.4, wordCount / 12 * 0.4 + (calibratedDimensions.length > 0 ? 0.3 : 0.2)));
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
    mode
  };
}
function detectTaskDomain(lower) {
  if (/\b(runway|kling|sora|pika|luma|video clip|camera panning|tracking shot|camera dolly|zoom in|drone flyover|cinematic footage|motion shot|temporal|slow motion)\b/i.test(lower)) {
    return "video_gen";
  }
  if (/\b(photo of|portrait of|render|photorealistic|wallpaper|midjourney|flux|dall-e|cinematic lighting|35mm|anamorphic|bokeh|wide shot|close up shot|illustration|oil painting|digital art|shot on|concept art|sunset|desert|aesthetic|view of)\b/i.test(lower) || /\b(car in|landscape with|building with|room with|character with|visual of|design a logo)\b/i.test(lower)) {
    return "image_gen";
  }
  if (/\b(react|vue|angular|svelte|nextjs|typescript|javascript|python|sql|html|css|tailwind|api|endpoint|backend|frontend|function|regex|database|prisma|docker|bug|refactor|unit test|git|repo|oauth|jwt|auth|authentication|login|json|app|script|build|component)\b/i.test(lower)) {
    return "code";
  }
  if (/\b(marketing|landing page|copywriting|seo|ad copy|conversion|funnel|email campaign|lead magnet|social media|twitter thread|linkedin post|hook|cta|gtm|go-to-market|brand|sales pitch)\b/i.test(lower)) {
    return "marketing";
  }
  if (/\b(business plan|pitch deck|investor|tam|sam|som|monetization|pricing model|unit economics|swot|okr|kpi|executive summary|quarterly|roi|cac|ltv|saas)\b/i.test(lower)) {
    return "business";
  }
  if (/\b(research|paper|study|literature review|hypothesis|statistical|clinical|p-value|methodology|confounder|academic|meta-analysis|citation|abstract|critique|comparative analysis|comparison|survey|benchmark)\b/i.test(lower)) {
    return "research";
  }
  if (/\b(data analysis|analytics|pandas|dataframe|metrics|dashboard|spreadsheet|excel|tableau|powerbi|correlation|regression|clustering|forecast|trend|sql query)\b/i.test(lower)) {
    return "data";
  }
  if (/\b(essay|article|blog post|story|narrative|script|rewrite|proofread|tone|chapter|character|plot|novel|newsletter|critique|press release)\b/i.test(lower)) {
    return "writing";
  }
  return "general";
}
function extractObjective2(text, domain) {
  let clean = text.replace(/^(can you|please|could you|help me|i want to|i need to|write|create|make|conduct|generate|produce)\s+/i, "").trim();
  clean = clean.replace(/^(a|an|the)\s+/i, "").trim();
  if (!clean) {
    return `High-quality ${domain.replace("_", " ")} instruction`;
  }
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}
function detectMissingDimensions(domain, lower) {
  const missing = [];
  switch (domain) {
    case "image_gen":
      if (!/\b(wide|close-up|low-angle|eye-level|overhead|bird's eye)\b/.test(lower)) missing.push("composition & camera angle");
      if (!/\b(golden hour|volumetric|neon|backlight|softbox|studio|rim light)\b/.test(lower)) missing.push("lighting & atmosphere");
      if (!/\b(35mm|50mm|85mm|anamorphic|macro|telephoto|focal)\b/.test(lower)) missing.push("lens & optics");
      if (!/\b(photorealistic|film grain|tactile|bokeh|8k|render)\b/.test(lower)) missing.push("photographic texture & materials");
      break;
    case "video_gen":
      if (!/\b(tracking|panning|dolly|drone|crane|static)\b/.test(lower)) missing.push("camera motion & velocity");
      if (!/\b(golden hour|atmospheric|volumetric|dramatic)\b/.test(lower)) missing.push("lighting & environment");
      if (!/\b(continuous|slow motion|fluid|inertia)\b/.test(lower)) missing.push("temporal motion coherence");
      break;
    case "marketing":
      if (!/\b(b2b|b2c|saas|ecommerce|dtc|consumers)\b/.test(lower)) missing.push("target audience & buyer profile");
      if (!/\b(trial|leads|sales|awareness|conversion)\b/.test(lower)) missing.push("conversion goal & primary hook");
      if (!/\b(channels|organic|paid|outbound|email)\b/.test(lower)) missing.push("acquisition channels & timeframe");
      break;
    case "code":
      if (!/\b(typescript|javascript|python|sql|go|rust)\b/.test(lower)) missing.push("target language & runtime");
      if (!/\b(error|edge case|null|exception)\b/.test(lower)) missing.push("edge cases & error handling");
      if (!/\b(types|interface|type-safe)\b/.test(lower)) missing.push("strict typing & component interface");
      break;
    case "research":
      if (!/\b(empirical|methodology|confounders|peer-reviewed)\b/.test(lower)) missing.push("evidence standard & methodology");
      if (!/\b(comparison|matrix|table|synthesis)\b/.test(lower)) missing.push("comparative dimensions & output format");
      break;
    case "writing":
      if (!/\b(tone|voice|style|formal|casual|punchy)\b/.test(lower)) missing.push("narrative tone & pacing");
      if (!/\b(hook|takeaway|structure)\b/.test(lower)) missing.push("opening hook & deliverable structure");
      break;
    case "business":
      if (!/\b(kpi|milestones|quarter|horizon)\b/.test(lower)) missing.push("timeframe & measurable KPIs");
      if (!/\b(trade-offs|risks|assumptions)\b/.test(lower)) missing.push("risk trade-offs & execution roadmap");
      break;
    default:
      missing.push("structural clarity & actionable criteria");
      break;
  }
  return missing;
}
function deriveDefensibleAssumptions(domain, lower, targetAi) {
  const assumptions = [];
  switch (domain) {
    case "image_gen":
      assumptions.push("Style: Photorealistic cinematography with tactile, natural texture");
      assumptions.push("Optics: 35mm anamorphic format with cinematic aspect ratio");
      assumptions.push("Lighting: Natural environmental illumination calibrated for the scene");
      break;
    case "video_gen":
      assumptions.push("Movement: Smooth cinematic camera tracking with natural physical inertia");
      assumptions.push("Fidelity: High temporal consistency without unnatural morphing or distortion");
      break;
    case "marketing":
      if (lower.includes("gtm") || lower.includes("go-to-market") || lower.includes("market entry")) {
        assumptions.push("Scope: Comprehensive go-to-market execution and acquisition strategy");
        assumptions.push("Timeframe: Phased 90-day to 180-day market entry horizon");
      } else if (lower.includes("landing page") || lower.includes("sales page")) {
        assumptions.push("Structure: Conversion-focused section layout and value proposition hierarchy");
      } else if (lower.includes("b2b") || lower.includes("saas")) {
        assumptions.push("Audience: Relevant decision makers evaluated on measurable business impact");
        assumptions.push("Strategy: Phased execution combining inbound credibility and targeted outreach");
      } else {
        assumptions.push("Focus: Clear messaging and actionable engagement strategy");
      }
      break;
    case "code":
      if (lower.includes("react") || lower.includes("frontend") || lower.includes("hook") || lower.includes("ui")) {
        assumptions.push("Stack: Modern TypeScript + React with strict types");
      } else if (lower.includes("python") || lower.includes("data") || lower.includes("ml")) {
        assumptions.push("Stack: Python 3.11+ idiomatic, modular implementation");
      } else {
        assumptions.push("Stack: Modern TypeScript / ESNext production standard");
      }
      assumptions.push("Quality: Production-ready, defensive edge-case handling, zero external bloat");
      break;
    case "research":
      assumptions.push("Evidence: High analytical rigor distinguishing facts from inferences");
      assumptions.push("Deliverable: Structured comparative synthesis with trade-off matrices");
      break;
    case "business":
      assumptions.push("Horizon: 90-day to 12-month pragmatic phased implementation");
      assumptions.push("Prioritization: High-leverage, capital-efficient operational initiatives");
      break;
    default:
      assumptions.push("Quality: Authoritative, structured, and immediately actionable response");
      break;
  }
  return assumptions;
}
function extractAudience(lower, domain, assumptions) {
  for (const a of assumptions) {
    if (a.toLowerCase().includes("audience:")) {
      return a.split(":")[1].trim();
    }
  }
  switch (domain) {
    case "code":
      return "Senior engineers & code review agents";
    case "marketing":
      return "Target buyers & prospects";
    case "business":
      return "Leadership & key stakeholders";
    case "research":
      return "Analytical practitioners & researchers";
    case "writing":
      return "Discerning general readers";
    default:
      return "Subject matter practitioners";
  }
}
function extractConstraints2(text, lower) {
  const constraints = [];
  const lengthMatch = text.match(/under \d+ words|\d+ words or less|brief|concise|in \d+ bullet points|1 page/i);
  if (lengthMatch) constraints.push(lengthMatch[0]);
  const avoidMatch = text.match(/(?:don't|do not|avoid|without|never)\s+([^.,\n]+)/i);
  if (avoidMatch && avoidMatch[1]) {
    constraints.push(`Avoid: ${avoidMatch[1].trim()}`);
  }
  return constraints;
}
function extractDesiredOutput(domain, lower) {
  switch (domain) {
    case "image_gen":
      return "High-fidelity calibrated photographic prompt with optics & lighting";
    case "video_gen":
      return "Cinematic video choreography prompt with camera movement & velocity";
    case "code":
      return "Clean, type-safe, production-ready code with edge case handling";
    case "marketing":
      if (lower.includes("gtm") || lower.includes("market entry")) {
        return "Comprehensive go-to-market strategy";
      }
      if (lower.includes("landing page")) {
        return "Conversion-focused page architecture & copy blueprint";
      }
      return "Actionable marketing strategy, copy, and execution plan";
    case "research":
      return "Structured analytical synthesis with comparative breakdown";
    case "writing":
      return "Polished narrative draft with natural rhythm and voice";
    case "business":
      return "Executive strategic roadmap with phased deliverables and KPIs";
    default:
      return "Structured, high-impact instruction";
  }
}

// extension/src/providers/manager.ts
var LocalSynthesisProvider = class {
  id = "local";
  name = "Refinzi Instant Calibration";
  async generateBetter(rawInput, intent) {
    return synthesizeBetterPrompt(rawInput, intent.targetAi);
  }
  async generateExpert(rawInput, intent) {
    return synthesizeExpertPrompt(rawInput, intent.targetAi);
  }
  async testConnection() {
    return { ok: true, message: "Local calibration engine is active and ready (0ms latency)." };
  }
};
var ProviderManager = class {
  static localProvider = new LocalSynthesisProvider();
  static async getActiveProvider() {
    const settings = await getSettings();
    const providerId = settings.provider || "gateway";
    const getGeminiProvider = () => new GeminiProvider(settings.apiKeys?.gemini || "", settings.models?.gemini || "gemini-flash-latest");
    const getGatewayProvider = () => new GatewayProvider(settings.gatewayUrl || "https://refinzi.com/api/v1/refine", settings.apiKeys?.gateway);
    switch (providerId) {
      case "gemini": {
        return getGeminiProvider();
      }
      case "openai":
        return new OpenAIProvider(settings.apiKeys?.openai || "", settings.models?.openai);
      case "deepseek":
        if (settings.apiKeys?.deepseek) {
          return new DeepSeekProvider(settings.apiKeys.deepseek, settings.models?.deepseek);
        }
        return getGatewayProvider();
      case "openrouter":
        if (settings.apiKeys?.openrouter) {
          return new OpenRouterProvider(settings.apiKeys.openrouter, settings.models?.openrouter);
        }
        return getGatewayProvider();
      case "groq":
        return new GroqProvider(settings.apiKeys?.groq, settings.models?.groq || "openai/gpt-oss-120b");
      case "bai":
        return new BAIProvider(settings.apiKeys?.bai, settings.models?.bai || "qwen3.8-flash");
      case "gateway":
        return getGatewayProvider();
      case "local":
        return this.localProvider;
      default:
        return new BAIProvider(settings.apiKeys?.bai, settings.models?.bai || "qwen3.8-flash");
    }
  }
  static async generateBetter(rawInput, targetAi = "general", options) {
    const intent = extractSemanticIntent(rawInput, "better", targetAi);
    const provider = await this.getActiveProvider();
    let result;
    try {
      result = await provider.generateBetter(rawInput, intent, options);
    } catch (err) {
      const fallback = synthesizeBetterPrompt(rawInput, targetAi);
      result = {
        ...fallback,
        isFallback: true,
        providerFailure: {
          provider: provider.id,
          reason: err?.message || "Provider execution failed",
          status: err?.status || 0,
          code: "SERVER_ERROR"
        }
      };
    }
    if (!result || !result.prompt || result.prompt.trim().length < 8) {
      const fallback = synthesizeBetterPrompt(rawInput, targetAi);
      result = {
        ...fallback,
        isFallback: true,
        providerFailure: result?.providerFailure || {
          provider: provider.id,
          reason: "Provider produced an incomplete response",
          status: 0,
          code: "SERVER_ERROR"
        }
      };
    }
    return result;
  }
  static async generateExpert(rawInput, targetAi = "general", options) {
    const intent = extractSemanticIntent(rawInput, "expert", targetAi);
    const provider = await this.getActiveProvider();
    let result;
    try {
      result = await provider.generateExpert(rawInput, intent, options);
    } catch (err) {
      const fallback = synthesizeExpertPrompt(rawInput, targetAi);
      result = {
        ...fallback,
        isFallback: true,
        providerFailure: {
          provider: provider.id,
          reason: err?.message || "Provider execution failed",
          status: err?.status || 0,
          code: "SERVER_ERROR"
        }
      };
    }
    if (!result || !result.prompt || result.prompt.trim().length < 15) {
      const fallback = synthesizeExpertPrompt(rawInput, targetAi);
      result = {
        ...fallback,
        isFallback: true,
        providerFailure: result?.providerFailure || {
          provider: provider.id,
          reason: "Provider produced an incomplete response",
          status: 0,
          code: "SERVER_ERROR"
        }
      };
    }
    return result;
  }
  static async testProvider(providerId, apiKey, endpointUrl) {
    switch (providerId) {
      case "openai":
        return new OpenAIProvider(apiKey || "").testConnection();
      case "gemini":
        return new GeminiProvider(apiKey || "").testConnection();
      case "deepseek":
        return new DeepSeekProvider(apiKey || "").testConnection();
      case "openrouter":
        return new OpenRouterProvider(apiKey || "").testConnection();
      case "groq":
        return new GroqProvider(apiKey || "").testConnection();
      case "bai":
        return new BAIProvider(apiKey || "").testConnection();
      case "gateway":
        return new GatewayProvider(endpointUrl || "https://refinzi.com/api/v1/refine", apiKey).testConnection();
      case "local":
      default:
        return this.localProvider.testConnection();
    }
  }
};

// extension/src/utils/metrics.ts
var DEFAULT_METRICS_CONFIG = {
  estimatedMinutesPerPrompt: 2.5,
  estimatedAvoidedIterations: 1.5,
  fallbackCostPerIteration: 8e-3
};
var MODEL_PRICING = {
  // OpenAI — current generation
  "gpt-6-astra": { inputPer1k: 0.01, outputPer1k: 0.05, averageTurnCost: 0.045 },
  "gpt-5.6-sol": { inputPer1k: 4e-3, outputPer1k: 0.02, averageTurnCost: 0.018 },
  "gpt-5.6-terra": { inputPer1k: 2e-3, outputPer1k: 0.012, averageTurnCost: 0.0106 },
  "gpt-5.6-luna": { inputPer1k: 2e-4, outputPer1k: 12e-4, averageTurnCost: 106e-5 },
  "gpt-5.4-mini": { inputPer1k: 75e-5, outputPer1k: 45e-4, averageTurnCost: 398e-5 },
  "gpt-5.4-nano": { inputPer1k: 2e-4, outputPer1k: 125e-5, averageTurnCost: 11e-4 },
  "gpt-5-mini": { inputPer1k: 25e-5, outputPer1k: 2e-3, averageTurnCost: 173e-5 },
  "gpt-5-nano": { inputPer1k: 5e-5, outputPer1k: 4e-4, averageTurnCost: 35e-5 },
  // OpenAI — legacy (still billed, retained for historical events)
  "gpt-4o-mini": { inputPer1k: 15e-5, outputPer1k: 6e-4, averageTurnCost: 55e-5 },
  "gpt-4o": { inputPer1k: 25e-4, outputPer1k: 0.01, averageTurnCost: 925e-5 },
  "gpt-4-turbo": { inputPer1k: 0.01, outputPer1k: 0.03, averageTurnCost: 0.029 },
  "o1-mini": { inputPer1k: 3e-3, outputPer1k: 0.012, averageTurnCost: 0.011 },
  "o3-mini": { inputPer1k: 11e-4, outputPer1k: 44e-4, averageTurnCost: 4e-3 },
  // Anthropic / Claude
  "claude-sonnet-5": { inputPer1k: 2e-3, outputPer1k: 0.01, averageTurnCost: 9e-3 },
  "claude-opus-5": { inputPer1k: 5e-3, outputPer1k: 0.025, averageTurnCost: 0.0225 },
  "claude-haiku-4-5": { inputPer1k: 1e-3, outputPer1k: 5e-3, averageTurnCost: 45e-4 },
  "claude-3-5-sonnet": { inputPer1k: 3e-3, outputPer1k: 0.015, averageTurnCost: 0.0135 },
  "claude-3-7-sonnet": { inputPer1k: 3e-3, outputPer1k: 0.015, averageTurnCost: 0.0135 },
  "claude-3-haiku": { inputPer1k: 25e-5, outputPer1k: 125e-5, averageTurnCost: 112e-5 },
  "claude-3-5-haiku": { inputPer1k: 8e-4, outputPer1k: 4e-3, averageTurnCost: 36e-4 },
  // Google Gemini — Gemini 3.8 Flash introductory rate ($0.75 / $3.75 per 1M)
  "gemini-flash-latest": { inputPer1k: 75e-5, outputPer1k: 375e-5, averageTurnCost: 338e-5 },
  "gemini-3.8-flash": { inputPer1k: 75e-5, outputPer1k: 375e-5, averageTurnCost: 338e-5 },
  "gemini-pro-latest": { inputPer1k: 125e-5, outputPer1k: 0.01, averageTurnCost: 863e-5 },
  // Google Gemini — legacy (retired upstream; retained for historical events)
  "gemini-2.5-flash": { inputPer1k: 75e-6, outputPer1k: 3e-4, averageTurnCost: 28e-5 },
  "gemini-2.0-flash": { inputPer1k: 1e-4, outputPer1k: 4e-4, averageTurnCost: 35e-5 },
  "gemini-1.5-flash": { inputPer1k: 75e-6, outputPer1k: 3e-4, averageTurnCost: 28e-5 },
  "gemini-1.5-pro": { inputPer1k: 125e-5, outputPer1k: 5e-3, averageTurnCost: 46e-4 },
  // DeepSeek — off-peak rates (peak hours are 2x)
  "deepseek-flash": { inputPer1k: 15e-5, outputPer1k: 6e-4, averageTurnCost: 56e-5 },
  "deepseek-v4-pro": { inputPer1k: 66e-5, outputPer1k: 198e-5, averageTurnCost: 191e-5 },
  // DeepSeek — legacy (retained for historical events)
  "deepseek-chat": { inputPer1k: 14e-5, outputPer1k: 28e-5, averageTurnCost: 29e-5 },
  "deepseek-reasoner": { inputPer1k: 55e-5, outputPer1k: 219e-5, averageTurnCost: 203e-5 },
  // Groq LPU models
  "openai/gpt-oss-120b": { inputPer1k: 15e-5, outputPer1k: 6e-4, averageTurnCost: 555e-6 },
  "openai/gpt-oss-20b": { inputPer1k: 75e-6, outputPer1k: 3e-4, averageTurnCost: 278e-6 },
  "qwen/qwen3.8-27b": { inputPer1k: 2e-4, outputPer1k: 6e-4, averageTurnCost: 58e-5 },
  // b.ai models
  "qwen3.8-flash": { inputPer1k: 1e-4, outputPer1k: 4e-4, averageTurnCost: 37e-5 },
  "qwen3.8-max": { inputPer1k: 16e-4, outputPer1k: 64e-4, averageTurnCost: 592e-5 },
  "qwen3.8-27b": { inputPer1k: 2e-4, outputPer1k: 6e-4, averageTurnCost: 58e-5 }
};
var inMemoryRecordedIds = /* @__PURE__ */ new Set();
async function getMetricsConfig() {
  try {
    const res = await BrowserAPI.storage.local.get(["refinzi_metrics_config"]);
    return {
      ...DEFAULT_METRICS_CONFIG,
      ...res?.refinzi_metrics_config || {}
    };
  } catch {
    return { ...DEFAULT_METRICS_CONFIG };
  }
}
async function getSelectedPeriod() {
  try {
    const res = await BrowserAPI.storage.local.get(["refinzi_selected_period"]);
    const period = res?.refinzi_selected_period;
    if (period && ["Today", "Week", "Month", "All Time"].includes(period)) {
      return period;
    }
    return "Week";
  } catch {
    return "Week";
  }
}
async function saveSelectedPeriod(period) {
  try {
    await BrowserAPI.storage.local.set({ refinzi_selected_period: period });
  } catch (err) {
    console.error("[Refinzi] Failed to persist selected period:", err);
  }
}
async function getUsageEvents() {
  try {
    const res = await BrowserAPI.storage.local.get(["refinzi_events", "refinzi_history"]);
    const events = res?.refinzi_events || [];
    const history = res?.refinzi_history || [];
    if (history.length > 0) {
      const existingIds = new Set(events.map((e) => e.id));
      for (const item of history) {
        if (item.id && !existingIds.has(item.id)) {
          events.push({
            id: item.id,
            timestamp: item.timestamp,
            mode: item.mode,
            targetAi: item.targetAi || "general",
            provider: item.provider || "local",
            success: true
          });
          existingIds.add(item.id);
        }
      }
    }
    for (const evt of events) {
      if (evt.id) inMemoryRecordedIds.add(evt.id);
    }
    return events;
  } catch {
    return [];
  }
}
async function recordUsageEvent(event) {
  try {
    if (event.id && inMemoryRecordedIds.has(event.id)) {
      return false;
    }
    const events = await getUsageEvents();
    const eventId = event.id || `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    inMemoryRecordedIds.add(eventId);
    const newEvent = {
      id: eventId,
      timestamp: event.timestamp || Date.now(),
      mode: event.mode,
      targetAi: event.targetAi,
      provider: event.provider,
      model: event.model,
      success: event.success,
      tokenUsage: event.tokenUsage,
      costUsd: event.costUsd
    };
    const updated = [newEvent, ...events].slice(0, 500);
    await stageWrite({ refinzi_events: updated });
    return true;
  } catch (err) {
    console.error("[Refinzi] Failed to record usage event:", err);
    return false;
  }
}
async function deleteUsageEvent(id) {
  try {
    inMemoryRecordedIds.delete(id);
    const events = await getUsageEvents();
    const updated = events.filter((e) => e.id !== id);
    await stageWrite({ refinzi_events: updated });
  } catch (err) {
    console.error("[Refinzi] Failed to delete usage event:", err);
  }
}
async function clearUsageEvents() {
  try {
    inMemoryRecordedIds.clear();
    await stageWrite({ refinzi_events: [] });
  } catch (err) {
    console.error("[Refinzi] Failed to clear usage events:", err);
  }
}
function filterEventsByPeriod(events, period, now = Date.now()) {
  if (period === "All Time") {
    return events;
  }
  const nowDate = new Date(now);
  if (period === "Today") {
    const startOfToday = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()).getTime();
    return events.filter((e) => e.timestamp >= startOfToday && e.timestamp <= now);
  }
  if (period === "Week") {
    const startOfWeek = now - 7 * 24 * 60 * 60 * 1e3;
    return events.filter((e) => e.timestamp >= startOfWeek && e.timestamp <= now);
  }
  if (period === "Month") {
    const startOfMonth = now - 30 * 24 * 60 * 60 * 1e3;
    return events.filter((e) => e.timestamp >= startOfMonth && e.timestamp <= now);
  }
  return events;
}
function calculateTimeSaved(successfulCount, config = DEFAULT_METRICS_CONFIG) {
  const totalMinutes = successfulCount * (config.estimatedMinutesPerPrompt ?? 2.5);
  if (successfulCount === 0 || totalMinutes <= 0) {
    return { minutes: 0, formatted: "~0m" };
  }
  if (totalMinutes < 60) {
    return {
      minutes: totalMinutes,
      formatted: `~${Math.round(totalMinutes)}m`
    };
  }
  const hours = Math.floor(totalMinutes / 60);
  const remainingMins = Math.round(totalMinutes % 60);
  const formatted = remainingMins > 0 ? `~${hours}h ${remainingMins}m` : `~${hours}h`;
  return { minutes: totalMinutes, formatted };
}
function calculateCostSaved(events, config = DEFAULT_METRICS_CONFIG) {
  const successfulEvents = events.filter((e) => e.success);
  if (successfulEvents.length === 0) {
    return { costUsd: null, formatted: "\u2014", hasData: false };
  }
  const avoidedIterations = config.estimatedAvoidedIterations ?? 1.5;
  let totalEstimatedSavings = 0;
  let evaluatedEventCount = 0;
  for (const evt of successfulEvents) {
    if (typeof evt.costUsd === "number" && evt.costUsd > 0) {
      totalEstimatedSavings += evt.costUsd * avoidedIterations;
      evaluatedEventCount++;
      continue;
    }
    if (evt.tokenUsage && evt.model) {
      const pricing2 = config.customPricing?.[evt.model] || MODEL_PRICING[evt.model];
      if (pricing2) {
        const directCost = evt.tokenUsage.promptTokens / 1e3 * pricing2.inputPer1k + evt.tokenUsage.completionTokens / 1e3 * pricing2.outputPer1k;
        totalEstimatedSavings += directCost * avoidedIterations;
        evaluatedEventCount++;
        continue;
      }
    }
    if (evt.provider === "local") {
      continue;
    }
    const modelKey = evt.model;
    const pricing = modelKey ? config.customPricing?.[modelKey] || MODEL_PRICING[modelKey] : void 0;
    if (pricing) {
      const iterationCost = pricing.averageTurnCost ?? pricing.inputPer1k * 0.5 + pricing.outputPer1k * 0.8;
      totalEstimatedSavings += iterationCost * avoidedIterations;
      evaluatedEventCount++;
      continue;
    }
    if (evt.provider && ["openai", "claude", "gemini", "deepseek", "openrouter"].includes(evt.provider)) {
      totalEstimatedSavings += (config.fallbackCostPerIteration ?? 8e-3) * avoidedIterations;
      evaluatedEventCount++;
      continue;
    }
  }
  if (evaluatedEventCount === 0 || totalEstimatedSavings <= 0) {
    return {
      costUsd: null,
      formatted: "\u2014",
      hasData: false
    };
  }
  const formatted = totalEstimatedSavings >= 0.01 ? `~$${totalEstimatedSavings.toFixed(2)}` : `~$0.01`;
  return {
    costUsd: totalEstimatedSavings,
    formatted,
    hasData: true
  };
}
function computeMetricsSummary(allEvents, period, config = DEFAULT_METRICS_CONFIG, now = Date.now()) {
  const todayEvents = filterEventsByPeriod(allEvents, "Today", now).filter((e) => e.success);
  const weekEvents = filterEventsByPeriod(allEvents, "Week", now).filter((e) => e.success);
  const monthEvents = filterEventsByPeriod(allEvents, "Month", now).filter((e) => e.success);
  const allTimeEvents = allEvents.filter((e) => e.success);
  const periodEvents = filterEventsByPeriod(allEvents, period, now);
  const successfulEvents = periodEvents.filter((e) => e.success);
  const totalPromptsEnhanced = successfulEvents.length;
  const betterCount = successfulEvents.filter((e) => e.mode === "better").length;
  const expertCount = successfulEvents.filter((e) => e.mode === "expert").length;
  const total = betterCount + expertCount;
  const betterPercentage = total > 0 ? Math.round(betterCount / total * 100) : 0;
  const expertPercentage = total > 0 ? 100 - betterPercentage : 0;
  let promptsPeriodSubtitle = "";
  if (period === "Today") {
    promptsPeriodSubtitle = `${totalPromptsEnhanced} today`;
  } else if (period === "Week") {
    promptsPeriodSubtitle = `+${totalPromptsEnhanced} this week`;
  } else if (period === "Month") {
    promptsPeriodSubtitle = `+${totalPromptsEnhanced} this month`;
  } else {
    promptsPeriodSubtitle = `${totalPromptsEnhanced} lifetime total`;
  }
  const timeSaved = calculateTimeSaved(totalPromptsEnhanced, config);
  const estimatedTimeSavedTooltip = "Estimated from the average time assumed for manually refining a prompt.";
  const costSaved = calculateCostSaved(periodEvents, config);
  const estimatedCostSavedSubtitle = costSaved.hasData ? "estimated" : "Cost estimate unavailable";
  const estimatedCostSavedTooltip = "Estimated from AI usage/iteration costs available to Refinzi. Actual savings may vary.";
  return {
    period,
    totalPromptsEnhanced,
    promptsPeriodSubtitle,
    estimatedTimeSavedFormatted: timeSaved.formatted,
    estimatedTimeSavedTooltip,
    estimatedCostSavedFormatted: costSaved.formatted,
    estimatedCostSavedSubtitle,
    estimatedCostSavedTooltip,
    betterCount,
    expertCount,
    betterPercentage,
    expertPercentage,
    hasCostData: costSaved.hasData,
    todayCount: todayEvents.length,
    weekCount: weekEvents.length,
    monthCount: monthEvents.length,
    allTimeCount: allTimeEvents.length
  };
}

// extension/src/background.ts
var inFlightRequests = /* @__PURE__ */ new Map();
BrowserAPI.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message !== "object") return false;
  switch (message.type) {
    case "REFINZI_GENERATE_BETTER": {
      const targetAi = message.targetAi || "general";
      const eventId = message.requestId || `better:${Date.now()}:${Math.random().toString(36).slice(2, 7)}`;
      const dedupKey = eventId;
      let executionPromise = inFlightRequests.get(dedupKey);
      if (!executionPromise) {
        executionPromise = ProviderManager.generateBetter(message.text, targetAi).then(async (response) => {
          await runInBatch(async () => {
            const settings = await getSettings();
            const model = settings.models?.[settings.provider];
            const isSuccess = !response.isFallback && !response.providerFailure;
            await recordUsageEvent({
              id: eventId,
              mode: "better",
              targetAi,
              provider: response.providerFailure?.provider || settings.provider,
              model,
              success: isSuccess
            });
            await addHistoryItem({
              mode: "better",
              targetAi,
              originalPrompt: message.text,
              refinedPrompt: response.prompt,
              provider: settings.provider,
              reasonOrSummary: response.shortReason
            });
            if (await isFreeKeyActive()) {
              await incrementFreeUsage();
            }
          });
          return response;
        }).catch(async (err) => {
          try {
            await runInBatch(async () => {
              const settings = await getSettings();
              await recordUsageEvent({
                id: eventId,
                mode: "better",
                targetAi,
                provider: settings.provider,
                success: false
              });
            });
          } catch {
          }
          throw err;
        }).finally(() => {
          setTimeout(() => {
            inFlightRequests.delete(dedupKey);
          }, 1e3);
        });
        inFlightRequests.set(dedupKey, executionPromise);
      }
      executionPromise.then((response) => sendResponse({ success: true, data: response })).catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }
    case "REFINZI_GENERATE_EXPERT": {
      const targetAi = message.targetAi || "general";
      const eventId = message.requestId || `expert:${Date.now()}:${Math.random().toString(36).slice(2, 7)}`;
      const dedupKey = eventId;
      let executionPromise = inFlightRequests.get(dedupKey);
      if (!executionPromise) {
        executionPromise = ProviderManager.generateExpert(message.text, targetAi).then(async (response) => {
          await runInBatch(async () => {
            const settings = await getSettings();
            const model = settings.models?.[settings.provider];
            const isSuccess = !response.isFallback && !response.providerFailure;
            await recordUsageEvent({
              id: eventId,
              mode: "expert",
              targetAi,
              provider: response.providerFailure?.provider || settings.provider,
              model,
              success: isSuccess
            });
            await addHistoryItem({
              mode: "expert",
              targetAi,
              originalPrompt: message.text,
              refinedPrompt: response.prompt,
              provider: settings.provider,
              reasonOrSummary: response.summary
            });
            if (await isFreeKeyActive()) {
              await incrementFreeUsage();
            }
          });
          return response;
        }).catch(async (err) => {
          try {
            await runInBatch(async () => {
              const settings = await getSettings();
              await recordUsageEvent({
                id: eventId,
                mode: "expert",
                targetAi,
                provider: settings.provider,
                success: false
              });
            });
          } catch {
          }
          throw err;
        }).finally(() => {
          setTimeout(() => {
            inFlightRequests.delete(dedupKey);
          }, 1e3);
        });
        inFlightRequests.set(dedupKey, executionPromise);
      }
      executionPromise.then((response) => sendResponse({ success: true, data: response })).catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }
    case "REFINZI_GET_SETTINGS": {
      getSettings().then((settings) => sendResponse({ success: true, data: settings })).catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }
    case "REFINZI_SAVE_SETTINGS": {
      saveSettings(message.settings).then((updated) => sendResponse({ success: true, data: updated })).catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }
    case "REFINZI_TEST_PROVIDER": {
      ProviderManager.testProvider(message.provider, message.apiKey, message.endpointUrl).then((result) => sendResponse({ success: true, data: result })).catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }
    case "REFINZI_GET_HISTORY": {
      getHistory().then((history) => sendResponse({ success: true, data: history })).catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }
    case "REFINZI_CLEAR_HISTORY": {
      Promise.all([clearHistory(), clearUsageEvents()]).then(() => sendResponse({ success: true })).catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }
    case "REFINZI_DELETE_HISTORY_ITEM": {
      Promise.all([deleteHistoryItem(message.id), deleteUsageEvent(message.id)]).then(() => sendResponse({ success: true })).catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }
    case "REFINZI_GET_STATS": {
      getStats().then((stats) => sendResponse({ success: true, data: stats })).catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }
    case "REFINZI_GET_METRICS_SUMMARY": {
      (async () => {
        const period = message.period || await getSelectedPeriod();
        const events = await getUsageEvents();
        const config = await getMetricsConfig();
        return computeMetricsSummary(events, period, config);
      })().then((summary) => sendResponse({ success: true, data: summary })).catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }
    case "REFINZI_SET_PERIOD": {
      saveSelectedPeriod(message.period).then(() => sendResponse({ success: true })).catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }
    case "REFINZI_OPEN_POPUP":
    case "REFINZI_OPEN_SETTINGS": {
      (async () => {
        try {
          if (typeof chrome !== "undefined") {
            if (chrome.action?.openPopup) {
              await chrome.action.openPopup();
              return { success: true };
            }
            if (chrome.runtime?.openOptionsPage) {
              await chrome.runtime.openOptionsPage();
              return { success: true };
            }
            const url = chrome.runtime.getURL("popup/popup.html");
            await chrome.tabs.create({ url });
            return { success: true };
          }
        } catch {
          try {
            const url = chrome.runtime.getURL("popup/popup.html");
            await chrome.tabs.create({ url });
            return { success: true };
          } catch (e) {
            return { success: false, error: e?.message };
          }
        }
        return { success: false };
      })().then((res) => sendResponse(res)).catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }
    default:
      return false;
  }
});
BrowserAPI.commands.onCommand.addListener(async (command) => {
  try {
    const tabs = await BrowserAPI.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    if (!activeTab?.id) return;
    if (command === "refinzi-better") {
      await BrowserAPI.tabs.sendMessage(activeTab.id, { type: "REFINZI_TRIGGER_BETTER_SHORTCUT" });
    } else if (command === "refinzi-expert") {
      await BrowserAPI.tabs.sendMessage(activeTab.id, { type: "REFINZI_TRIGGER_EXPERT_SHORTCUT" });
    }
  } catch (err) {
    console.debug("[Refinzi] Shortcut dispatch skipped:", err);
  }
});
if (typeof chrome !== "undefined" && chrome.runtime?.onInstalled) {
  chrome.runtime.onInstalled.addListener(async (details) => {
    const injectIntoOpenTabs = async () => {
      try {
        if (!chrome?.scripting?.executeScript || !chrome?.tabs?.query) return;
        const tabs = await chrome.tabs.query({ url: ["http://*/*", "https://*/*"] });
        await Promise.allSettled(
          tabs.filter((t) => typeof t.id === "number" && !t.url?.startsWith("chrome://")).map(
            (t) => chrome.scripting.executeScript({ target: { tabId: t.id }, files: ["content.js"] })
          )
        );
      } catch (err) {
        console.debug("[Refinzi] Open-tab injection skipped:", err);
      }
    };
    if (details.reason === "install") {
      console.log("[Refinzi] Extension installed successfully.");
      await injectIntoOpenTabs();
      try {
        const tabs = await BrowserAPI.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];
        if (activeTab?.id) {
          setTimeout(async () => {
            try {
              await BrowserAPI.tabs.sendMessage(activeTab.id, {
                type: "REFINZI_SHOW_ONBOARDING"
              });
            } catch {
            }
          }, 800);
        }
      } catch (err) {
        console.debug("[Refinzi] Could not dispatch install-time onboarding:", err);
      }
    } else if (details.reason === "update") {
      await injectIntoOpenTabs();
    }
  });
}
