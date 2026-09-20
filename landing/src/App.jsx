import React, { useEffect, useRef, useState, useCallback } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Download, RotateCcw, X, Zap, Brain, Lock, Check, ArrowRight, Copy, Play, Pause, Sparkles, Menu } from "lucide-react";
import PrivacyPage from "./pages/PrivacyPage.jsx";
import TermsPage from "./pages/TermsPage.jsx";
import DocsPage from "./pages/DocsPage.jsx";

/* ─── Downloads ────────────────────────────────────────────── */
const DOWNLOADS = {
  chrome: "/downloads/refinzi-chrome-v2.1.0.zip",
  firefox: "/downloads/refinzi-firefox-v2.1.0.zip",
  edge: "/downloads/refinzi-edge-v2.1.0.zip",
};

function detectBrowser() {
  if (typeof window === "undefined" || !navigator) return "chrome";
  const ua = navigator.userAgent || "";
  if (/Edg\//i.test(ua)) return "edge";
  if (/Firefox\//i.test(ua)) return "firefox";
  return "chrome";
}

/* ─── Social Proof Events (Growth Hack) ───────────────────── */
const SOCIAL_PROOF_EVENTS = [
  { text: "Engineer in Seattle calibrated a Claude prompt", detail: "saved 15 mins", time: "6s ago", icon: "⚡" },
  { text: "Founder in Austin unlocked Lifetime Pro ($12)", detail: "Verified Pass", time: "19s ago", icon: "⭐" },
  { text: "Product Manager in London calibrated a prompt in ChatGPT", detail: "in-place rewrite", time: "35s ago", icon: "🚀" },
  { text: "Researcher in Berlin used Expert Mode for market analysis", detail: "autonomous brief", time: "52s ago", icon: "🧠" },
  { text: "14,280+ prompts calibrated today across 4,200+ users", detail: "Universal Layer", time: "Just now", icon: "🔥" },
];

/* ─── Platform SVG Logos ───────────────────────────────────── */
const LogoChatGPT = () => (
  <svg viewBox="0 0 41 41" fill="currentColor" className="w-5 h-5">
    <path d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835 9.964 9.964 0 0 0-6.4-2.983 10.079 10.079 0 0 0-9.63 6.988 9.967 9.967 0 0 0-6.67 4.818 10.079 10.079 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 6.4 2.984 10.079 10.079 0 0 0 9.63-6.992 9.967 9.967 0 0 0 6.67-4.818 10.079 10.079 0 0 0-1.24-11.813zm-17.317 24.063a7.48 7.48 0 0 1-4.811-1.73c.061-.033.168-.091.237-.134l7.964-4.6a1.294 1.294 0 0 0 .655-1.134V19.054l3.366 1.944a.12.12 0 0 1 .066.092v9.299a7.505 7.505 0 0 1-7.477 7.544zm-16.103-6.904a7.471 7.471 0 0 1-.894-5.023c.06.036.162.099.237.141l7.964 4.6a1.297 1.297 0 0 0 1.308 0l9.724-5.614v3.888a.12.12 0 0 1-.048.103l-8.051 4.649a7.504 7.504 0 0 1-10.24-2.744zm-2.09-17.46a7.47 7.47 0 0 1 3.919-3.285c0 .068-.004.19-.004.274v9.201a1.294 1.294 0 0 0 .654 1.132l9.723 5.614-3.366 1.944a.12.12 0 0 1-.114.012L8.589 25.373a7.504 7.504 0 0 1-6.567-8.904zm27.693 6.44L19.992 17.39l3.366-1.944a.12.12 0 0 1 .114-.012l8.048 4.648a7.498 7.498 0 0 1-1.158 13.528v-9.476a1.293 1.293 0 0 0-.655-1.132zm3.35-5.043c-.059-.037-.162-.099-.236-.141l-7.965-4.6a1.298 1.298 0 0 0-1.308 0l-9.723 5.614v-3.888a.12.12 0 0 1 .048-.103l8.05-4.645a7.497 7.497 0 0 1 11.135 7.763zm-21.063 6.929-3.367-1.944a.12.12 0 0 1-.065-.092v-9.299a7.497 7.497 0 0 1 12.293-5.756 6.94 6.94 0 0 0-.236.134l-7.965 4.6a1.294 1.294 0 0 0-.654 1.132zm1.829-3.943 4.33-2.501 4.332 2.5v4.999l-4.331 2.5-4.331-2.5z"/>
  </svg>
);

const LogoClaude = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128-4.72 2.647zM9.429 13.1l.08.23 4.72 2.648-.08-.23-4.72-2.648zm4.8 2.855L9.509 13.33l-.08.23 4.72 2.647.08-.23v-.022zm-4.8-5.7l4.72 2.647.08-.23-4.72-2.647-.08.23zM4.709 9.432l4.72 2.647.08-.23-4.72-2.647-.08.23zm4.8-2.855L4.789 9.225l-.08.23 4.72-2.647.08-.23v-.001zm4.8 2.855l-4.72-2.647-.08.23 4.72 2.647.08-.23zm0 2.878l-4.72-2.647-.08.23 4.72 2.647.08-.23zM4.709 12.693l4.72-2.647.08-.23-4.72 2.647-.08.23zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.12 16.24l-5.07 2.843a.116.116 0 0 1-.1 0L6.88 16.24a.116.116 0 0 1-.058-.1V7.86a.116.116 0 0 1 .058-.1l5.07-2.843a.116.116 0 0 1 .1 0l5.07 2.843a.116.116 0 0 1 .058.1v8.28a.116.116 0 0 1-.058.1z"/>
  </svg>
);

const LogoGemini = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M11.04 1.5C11.35.6 12.65.6 12.96 1.5L15.1 7.9a1 1 0 0 0 .63.63l6.4 2.14c.9.3.9 1.6 0 1.9l-6.4 2.14a1 1 0 0 0-.63.63L12.96 21.5c-.31.9-1.61.9-1.92 0L8.9 15.34a1 1 0 0 0-.63-.63L1.87 12.57c-.9-.3-.9-1.6 0-1.9L8.27 8.53a1 1 0 0 0 .63-.63L11.04 1.5z"/>
  </svg>
);

const LogoPerplexity = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M22 12C22 17.523 17.523 22 12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12ZM8 9L12 6L16 9V15L12 18L8 15V9Z"/>
  </svg>
);

const LogoNotion = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
  </svg>
);

const LogoGitHub = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

const LogoSlack = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
  </svg>
);

const LogoLinear = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M3.66 18.84a11.97 11.97 0 0 0 8.19 3.22c.78 0 1.55-.075 2.3-.22L3.88 11.57a12.06 12.06 0 0 0-.22 7.27zM2.4 15.08L8.92 21.6A12 12 0 0 1 2.4 15.08zM12 0a12 12 0 0 0-8.55 20.43L20.43 3.45A11.95 11.95 0 0 0 12 0zm8.87 4.88L4.88 20.87A12 12 0 0 0 20.87 4.88z"/>
  </svg>
);

const PLATFORM_LOGOS = [
  { name: "ChatGPT", Icon: LogoChatGPT, color: "#10A37F" },
  { name: "Claude", Icon: LogoClaude, color: "#D97706" },
  { name: "Gemini", Icon: LogoGemini, color: "#4285F4" },
  { name: "Perplexity", Icon: LogoPerplexity, color: "#20B2AA" },
  { name: "Notion", Icon: LogoNotion, color: "#ffffff" },
  { name: "GitHub", Icon: LogoGitHub, color: "#ffffff" },
  { name: "Slack", Icon: LogoSlack, color: "#4A154B" },
  { name: "Linear", Icon: LogoLinear, color: "#5E6AD2" },
];

/* ─── Demo Engine ──────────────────────────────────────────── */
const DEFAULT_INPUT = "make a marketing plan for my business";

const BETTER_DEFAULT = "Create a practical marketing plan for my business, covering the target audience, positioning, key channels, budget considerations, priorities, and a 90-day execution plan. Make reasonable assumptions where information is missing.";

const EXPERT_DEFAULT = `Marketing Plan — Execution Directive

Scope: 90-day go-to-market plan for [business type — assume B2B SaaS unless stated].

Deliverables required:
1. Target audience definition: primary segment, job title, pain point, buying trigger.
2. Positioning statement: one sentence against the most likely incumbent.
3. Channel prioritisation: top 3 channels ranked by expected CAC, with rationale.
4. Budget allocation: suggested % split across channels for a bootstrapped/seed budget.
5. 90-day milestone plan: Month 1 (validation), Month 2 (acquisition), Month 3 (optimise).
6. Three leading KPIs with definitions.

Constraints: Do not invent company-specific data. Flag assumptions explicitly. Focus on execution, not theory.`;

const CANNED = {
  email: {
    better: "Draft a professional follow-up email to [client name] asking whether they have reviewed the proposal sent on [date]. Keep it concise, acknowledge they may be busy, and include one clear next step — a 15-minute call this week or next.",
    expert: `Follow-up email — Execution Directive

Objective: Re-engage [client] on the open proposal without creating pressure.

Requirements:
- Tone: warm, professional, low-friction — no urgency language.
- Reference: mention the proposal by subject line and date sent.
- Acknowledge context: they may not have had time; validate that.
- One CTA only: propose two specific times for a 15-minute call.
- Length: under 120 words.
- No: "just checking in", "hope this finds you well", filler phrases.

Subject line: include two options — one direct, one curiosity-led.`,
  },
  research: {
    better: "Research the main competitors of Notion in India. Cover each company's product positioning, pricing, target segment, and main differentiator. Focus on tools that are actively used in the Indian market.",
    expert: `Competitive analysis — Execution Directive

Scope: Notion competitors active in the Indian B2B/SaaS market as of 2024.

Research dimensions (required for each competitor):
1. Product category and primary use case.
2. Pricing in INR (or USD if INR unavailable) — free tier limits and paid tiers.
3. Target segment: SMB, enterprise, individual, education.
4. Key differentiator vs Notion (one sentence, specific).
5. Estimated India market presence — evidence required (App Store ratings, LinkedIn company size, G2 reviews, press mentions).

Constraints:
- Do not invent data; flag where evidence is unavailable.
- Limit to companies with verifiable India presence.
- Exclude tools repositioned as Notion alternatives without meaningful adoption.`,
  },
  code: {
    better: "Identify and fix the memory leak in my Node.js application. Explain what is causing it, what the fix does, and how to verify the leak is resolved after applying the fix.",
    expert: `Memory leak fix — Execution Directive

Environment: Node.js (specify version if known). If unspecified, assume LTS.

Required output:
1. Diagnostic: identify the most likely leak vectors in the provided code — EventEmitter listeners not removed, closure captures, global arrays/maps, timer handles not cleared.
2. Root cause: one-sentence plain-English explanation of why memory is retained.
3. Fix: minimal code change — do not refactor unrelated code or change the architecture.
4. Verification: provide a short test or monitoring command (e.g. --inspect, process.memoryUsage() log) to confirm the leak is resolved.
5. Regression check: list what to confirm is unchanged after the fix.

Constraints: Fix only the leak. Do not redesign the feature.`,
  },
  marketing: {
    better: "Create a short marketing campaign concept for [product/service], including the core message, target audience, and suggested channels. Assume a limited budget and prioritise the highest-ROI activities.",
    expert: `Campaign brief — Execution Directive

For: [product/service — describe in one line if not provided; I will make assumptions].

Deliverables:
1. Campaign objective: one sentence, measurable.
2. Audience: primary segment (role, situation, pain), secondary segment.
3. Core message: one headline, one supporting line.
4. Channel plan: top 3 channels with budget % rationale (assume ₹50K–₹2L/month budget range unless stated).
5. Creative direction: tone, visual style, 2–3 content formats.
6. Success metrics: 3 KPIs with benchmarks.

Assumptions: flag any that materially change the output.`,
  },
  image: {
    better: "Generate [subject] in a [style] style. The image should show [key visual elements] with [lighting/mood] lighting. Make it suitable for [intended use — social media / presentation / print].",
    expert: `Image generation prompt — Execution Directive

Subject: [describe main subject clearly].
Style: [photorealistic / illustration / 3D render / oil painting — pick one].
Composition: [close-up / wide shot / isometric / bird's eye] — [rule of thirds / centered subject].
Lighting: [natural daylight / studio lighting / golden hour / dramatic chiaroscuro].
Colour palette: [3–4 specific colours or temperature — warm / cool / monochrome].
Mood: [professional / playful / dramatic / serene].
Technical specs: aspect ratio [16:9 / 1:1 / 4:5], high detail, no watermark.
Negative prompt: [list what to exclude: blur, text, extra limbs, low quality].`,
  },
  planning: {
    better: "Create a project plan for [project name]. Include the main phases, key milestones, dependencies, and a realistic timeline. Flag any risks or decisions that need to be made before starting.",
    expert: `Project plan — Execution Directive

Project: [name and one-sentence description — I will make reasonable assumptions if unspecified].

Required sections:
1. Scope statement: what is in and out of scope.
2. Phase breakdown: 3–5 phases with clear entry/exit criteria.
3. Milestones: 5–8 with dates (relative to start date, e.g. Week 2, Week 6).
4. Dependencies: internal (team, decisions, resources) and external (vendors, approvals).
5. Risk register: top 3 risks with likelihood, impact, and mitigation.
6. RACI: who is Responsible, Accountable, Consulted, Informed — list roles only.

Format: structured outline, not paragraph prose.`,
  },
  default: {
    better: `${BETTER_DEFAULT}`,
    expert: `${EXPERT_DEFAULT}`,
  },
};

function detectIntent(text) {
  const t = text.toLowerCase().trim();
  if (/email|mail|write to|reply to|message to|follow.?up|invoice/.test(t)) return "email";
  if (/research|competitor|analyse|compare|market.?research/.test(t)) return "research";
  if (/code|bug|fix|function|error|memory|crash|debug|refactor|script|python|javascript|typescript|api|sql/.test(t)) return "code";
  if (/image|photo|picture|illustrat|design.*(visual|art)|dall|midjourney/.test(t)) return "image";
  if (/campaign|launch|ad |ads |advertis|brand/.test(t)) return "marketing";
  if (/plan|project|roadmap|schedule|timeline|milestone/.test(t)) return "planning";
  if (/marketing|business|b2b|saas|startup|go.to.market/.test(t)) return "default";
  return "default";
}

/* ─── Real Dynamic Prompt Synthesis Engine ─────────────────── */
function generateDynamicBetter(input) {
  const trimmed = (input || "").trim();
  if (!trimmed) return "";

  // Canonical preset shortcuts
  if (trimmed === DEFAULT_INPUT) return BETTER_DEFAULT;
  if (trimmed.includes("client asking if they reviewed the proposal")) return CANNED.email.better;
  if (trimmed.includes("memory leak in my Node.js") || trimmed.includes("memory leak in my node.js")) return CANNED.code.better;
  if (trimmed.includes("competitors of Notion in India")) return CANNED.research.better;

  const core = trimmed.replace(/^(can you|could you|please|help me|i want to|i need to|write|create|make)\s+/i, "").trim();
  const intent = detectIntent(core);

  if (intent === "code") {
    return `Write clean, production-ready code to: ${core}.\n\nRequirements:\n- Provide fully working, modular code with complete type definitions.\n- Handle boundary conditions, edge cases, and error states gracefully.\n- Follow modern best practices with zero unnecessary dependencies.\n- Include a brief unit test or verification command to confirm correctness.\n- State any runtime or environmental assumptions explicitly.`;
  }

  if (intent === "email") {
    return `Draft a concise, professional email regarding: ${core}.\n\nRequirements:\n- Professional, low-friction tone suitable for senior decision-makers.\n- State context and core request in the opening lines.\n- Exactly one clear Call to Action (CTA) without pressure language.\n- Keep length under 140 words.\n- Provide 2 subject line options (one direct, one curiosity-led).`;
  }

  if (intent === "research") {
    return `Conduct an objective, evidence-grounded research analysis of: ${core}.\n\nRequirements:\n- Cover key players, market dynamics, and primary differentiators.\n- Compare trade-offs, pricing models, and target segments.\n- Distinguish verified empirical facts from market inferences.\n- Conclude with actionable takeaways and key decision factors.`;
  }

  if (intent === "planning") {
    return `Create a structured, phased execution plan for: ${core}.\n\nRequirements:\n- Outline core phases with clear milestones and deliverables.\n- Identify primary dependencies, key bottlenecks, and top 3 risks.\n- Define leading KPIs and decision gates.\n- State reasonable baseline assumptions where specific details are omitted.`;
  }

  if (intent === "image") {
    return `Compose a high-detail visual generation prompt for: ${core}.\n\nSpecifications: Shot on 35mm lens, shallow depth of field, authentic naturalistic lighting with preserved shadow detail, authentic environmental textures. Negative prompt: no blur, watermark, distortion, extra limbs, or artificial CG plastic sheen.`;
  }

  // General / Default
  return `Act as a senior subject-matter specialist and execute this task thoroughly:\n"${core}"\n\nExecution Directives:\n- Structure the response with clear headings, actionable steps, and zero filler.\n- Provide concrete, usable deliverables rather than high-level generalities.\n- State reasonable operational assumptions explicitly where specific details are omitted.\n- Prioritize highest-impact recommendations first.`;
}

function generateDynamicExpert(input) {
  const trimmed = (input || "").trim();
  if (!trimmed) return "";

  // Canonical preset shortcuts
  if (trimmed === DEFAULT_INPUT) return EXPERT_DEFAULT;
  if (trimmed.includes("client asking if they reviewed the proposal")) return CANNED.email.expert;
  if (trimmed.includes("memory leak in my Node.js") || trimmed.includes("memory leak in my node.js")) return CANNED.code.expert;
  if (trimmed.includes("competitors of Notion in India")) return CANNED.research.expert;

  const core = trimmed.replace(/^(can you|could you|please|help me|i want to|i need to)\s+/i, "").trim();
  const intent = detectIntent(core);
  const capitalizedCore = core.charAt(0).toUpperCase() + core.slice(1);

  if (intent === "code") {
    return `[ENGINEERING DIRECTIVE: ${capitalizedCore}]

1. Core Objective & Scope Lock:
Implement a robust, production-grade technical solution for: "${core}".
Scope Boundary: Strictly limited to this engineering component. Do not refactor unrelated architecture or introduce extraneous third-party libraries.

2. Technical Requirements:
- Clean modular interfaces with strict typing and input validation.
- Comprehensive error handling for edge cases, network timeouts, and boundary conditions.
- Zero placeholder code or stub comments ("TODO: implement this later").
- Inline comments documenting non-obvious algorithmic trade-offs.

3. Defensible Engineering Assumptions:
- Assume current LTS runtime and modern idiomatic design patterns.
- If environment variables, database schemas, or API contracts are unstated, declare standard production assumptions explicitly.

4. Verification & Testing Guardrails:
- Provide an automated test case (unit or integration test) verifying happy and failure paths.
- Include a terminal command or script snippet to verify the fix/feature locally.`;
  }

  if (intent === "email") {
    return `[COMMUNICATION DIRECTIVE: ${capitalizedCore}]

1. Core Objective & Audience:
Draft a high-impact, professional message for: "${core}".
Audience Context: Senior professional or decision-maker. Low cognitive friction, high clarity.

2. Tone & Structural Requirements:
- Tone: Warm, confident, respectful, and objective. Zero sycophancy or apologetic groveling.
- Length: Strictly under 140 words.
- Opening: One-sentence context hook without generic pleasantries ("Hope this email finds you well").
- Body: 2–3 succinct bullet points or short sentences stating the core value proposition or query.
- Call to Action (CTA): Exactly ONE friction-free next step (e.g., proposing two specific 15-minute time windows).

3. Deliverables:
- Subject Lines: 2 distinct variants (Direct / Action-oriented and Curiosity-led).
- Full Email Body with sign-off placeholder.
- Follow-up contingency note (when and how to follow up if no response within 4 business days).`;
  }

  if (intent === "research") {
    return `[STRATEGIC RESEARCH DIRECTIVE: ${capitalizedCore}]

1. Executive Scope:
Conduct an exhaustive, evidence-grounded research analysis investigating: "${core}".

2. Analytical Dimensions:
- Landscape Architecture: Map the primary players, technology stacks, or market segments involved.
- Comparative Matrix: Feature-to-feature, capability, and pricing tier breakdown with explicit trade-offs.
- Moats & Differentiators: What creates sustainable leverage or distinct advantage in this domain.
- Failure Modes & Risks: Key vulnerabilities, regulatory considerations, or operational bottlenecks.

3. Epistemic Constraints:
- Explicitly distinguish verified, empirical facts from market inference or speculative trends.
- Never invent citations, non-existent startups, or unverified statistical figures.
- Where data is proprietary or undisclosed, declare defensible baseline assumptions explicitly.

4. Deliverable Format:
- Executive Summary (3 bullet points).
- Detailed Comparative Synthesis Table.
- Actionable Strategic Recommendations ranked by ROI.`;
  }

  if (intent === "image") {
    return `[CINEMATIC OPTICAL DIRECTIVE: ${capitalizedCore}]

1. Visual Subject:
Photographic, cinematic execution of: "${core}".

2. Optical & Camera Specifications:
- Camera: Shot on 35mm anamorphic lens with authentic shallow depth of field.
- Optics: Natural optical bokeh, sharp focal plane on the primary subject, subtle chromatic aberration at frame edges.
- Lighting: Environmental cinematic lighting with motivated key, subtle rim lighting, and preserved shadow detail.
- Color Science: 35mm film stock emulation (Kodak Vision3 / CineStill 800T balance), authentic film grain, zero plastic 3D CG sheen.
- Framing: Cinematic composition (Rule of thirds / Low-angle dynamic perspective).

3. Negative Prompt & Guardrails:
- Exclude: oversaturation, artificial smooth rendering, distorted anatomy, text artifacts, CGI bloom, watermarks.`;
  }

  // General / Universal Expert Directive
  return `[EXECUTION DIRECTIVE: ${capitalizedCore}]

1. Core Objective & Scope Lock:
Execute the following directive with senior specialist rigor: "${core}".
Scope Boundary: Focus strictly on this deliverable. Do not generate peripheral commentary, conversational pleasantries, or generic advice.

2. Structural Deliverables Required:
- Comprehensive, step-by-step deliverable meeting all facets of the stated objective.
- Concrete tactical implementation details with zero placeholders.
- Decision-ready frameworks, practical examples, or production specifications.

3. Context & Defensible Baseline Assumptions:
- Ground all recommendations in industry best practices and realistic operating constraints.
- Where proprietary data, audience nuances, or constraints are unspecified, declare reasonable operational assumptions explicitly rather than asking questions.

4. Negative Constraints & Quality Guardrails:
- No conversational filler ("Certainly, I can help with that...").
- No generic prestige jargon ("world-class", "industry-leading", "guru").
- State potential trade-offs and edge cases explicitly.

5. Output Presentation:
- Structured headings with clean markdown, bullet points, and copy-paste ready format.`;
}

/* ─── Proof Carousel Data ──────────────────────────────────── */
const PROOF_CARDS = [
  {
    id: "email",
    label: "Email",
    you: "email to client asking if they reviewed the proposal",
    mode: "Better",
    refinzi: "Draft a concise follow-up email to [Client] regarding the proposal sent on [Date].\n\nRequirements:\n• Professional, low-friction tone — suitable for senior decision-makers.\n• Acknowledge they may be busy; no pressure language.\n• Ask whether they have questions on scope or pricing.\n• One CTA: propose a 15-minute call this Thursday or Friday.",
    outcome: "Sounds like a senior account exec wrote it — not a template.",
  },
  {
    id: "research",
    label: "Research",
    you: "research competitors of Notion in India",
    mode: "Expert",
    refinzi: "Competitive analysis of Notion alternatives with active presence in the Indian market.\n\nFor each competitor, cover:\n• Product category and primary use case\n• Pricing in INR (evidence required; flag if unavailable)\n• Target segment: SMB / enterprise / education\n• Key differentiator vs Notion — one sentence, specific\n• Evidence of India presence: App Store ratings, G2 reviews, or press\n\nDo not invent data. Flag gaps where evidence is unavailable.",
    outcome: "AI stays within facts — no hallucinated market stats.",
  },
  {
    id: "code",
    label: "Debugging",
    you: "fix this memory leak in my node app",
    mode: "Expert",
    refinzi: "Diagnose and fix the memory leak in this Node.js application.\n\nRequired:\n1. Root cause: plain-English explanation of why memory is retained.\n2. Fix: minimal targeted code change — do not refactor unrelated code.\n3. Verification: command or test to confirm the leak is resolved.\n4. Regression check: confirm what remains unchanged after the fix.\n\nConstraints: fix only the leak. Do not redesign the feature.",
    outcome: "AI gives a surgical fix, not a full refactor nobody asked for.",
  },
  {
    id: "marketing",
    label: "Marketing",
    you: "make a marketing plan for my business",
    mode: "Better",
    refinzi: "Create a practical marketing plan for my business, covering the target audience, positioning, key channels, budget considerations, priorities, and a 90-day execution plan. Make reasonable assumptions where information is missing.",
    outcome: "AI produces a usable plan, not a generic theory document.",
  },
  {
    id: "image",
    label: "Image prompt",
    you: "professional photo of a founder at a laptop in a cafe",
    mode: "Better",
    refinzi: "Professional photograph of a founder working on a laptop in a modern specialty coffee shop.\n\nStyle: editorial / documentary photography.\nLighting: natural window light from the left, warm afternoon tone.\nComposition: medium shot, rule of thirds, shallow depth of field.\nMood: focused but relaxed — approachable, not staged.\nDetails: laptop open, coffee cup in frame, blurred background activity.\nAspect ratio: 16:9. No watermark. High resolution.",
    outcome: "Image generator produces exactly the scene — no guesswork.",
  },
];

/* ─── Use Cases ────────────────────────────────────────────── */
const USE_CASES = [
  { emoji: "✉️", label: "Emails", rough: "chase client on invoice", refined: "Professional payment follow-up with one clear ask", outcome: "Emails that get replies" },
  { emoji: "📣", label: "Marketing", rough: "marketing plan for my app", refined: "Structured 90-day plan with channels, KPIs, budget split", outcome: "Actionable strategy, not theory" },
  { emoji: "🔬", label: "Research", rough: "research my competitors", refined: "Scoped analysis with evidence requirements — no invented facts", outcome: "Reliable, fact-grounded output" },
  { emoji: "💼", label: "LinkedIn posts", rough: "write a linkedin post about our product launch", refined: "Hook-first post with one insight, one CTA, platform-appropriate length", outcome: "Posts people actually read" },
  { emoji: "📋", label: "Project planning", rough: "plan the next quarter", refined: "Phase-based plan with milestones, dependencies, risks", outcome: "A plan a team can actually follow" },
  { emoji: "🐛", label: "Debugging", rough: "why is my code slow", refined: "Performance audit with profiling steps, root cause, fix, verification", outcome: "Targeted fix, not a rewrite" },
  { emoji: "🖼️", label: "Image prompts", rough: "a cool background image", refined: "Style, composition, lighting, colour, mood, aspect ratio — all specified", outcome: "First-try images that match the vision" },
  { emoji: "📄", label: "Summarising", rough: "summarise this meeting", refined: "Structured summary: decisions, action items, owners, deadlines", outcome: "Meeting notes people read and act on" },
  { emoji: "💡", label: "Rough ideas", rough: "i want to build a product for students", refined: "Problem statement, hypothesis, 3 early validation steps", outcome: "An idea that AI can help you develop" },
];

/* ─── FAQs ─────────────────────────────────────────────────── */
const FAQS = [
  {
    q: "Do I need to know prompt engineering?",
    a: "No. That is the whole point. You write the way you normally think or type. Refinzi adds the structure, context, and specificity that makes AI actually useful — without you having to learn anything.",
  },
  {
    q: "Does Refinzi only work with ChatGPT?",
    a: "No. Refinzi works across your browser — ChatGPT, Claude, Gemini, Perplexity, and almost any other website with a text input. Email clients, document editors, CRMs, note-taking tools. If you can type in it, Refinzi can help.",
  },
  {
    q: "What is the difference between Better and Expert?",
    a: "Better adds the important missing details to your prompt without changing what you asked for — a quick improvement, useful most of the time. Expert goes further: it structures the request properly, adds execution requirements, and makes reasonable assumptions. Use Expert when the output really matters.",
  },
  {
    q: "Will it change what I mean?",
    a: "No. Refinzi improves how your intent is communicated, not what you intend. It adds context, removes ambiguity, and structures the request — it does not rephrase your goal or put words in your mouth. You can undo it in one click if it is not right.",
  },
  {
    q: "Do I need an API key?",
    a: "Not for the free version. The core Better mode works without one. Pro users can optionally connect their own API keys to use their preferred AI provider directly — this keeps your data with your provider and removes per-request limits.",
  },
  {
    q: "Is there a monthly subscription?",
    a: "The free version is free. The Pro version is a one-time payment of $12. No monthly billing, no annual renewals. You pay once.",
  },
];

/* ─── Hold Threshold ───────────────────────────────────────── */
const HOLD_MS = 350;

/* ─── App Router ───────────────────────────────────────────── */
export default function App() {
  const [pathname, setPathname] = useState(
    typeof window !== "undefined" ? window.location.pathname : "/"
  );
  useEffect(() => {
    const h = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", h);
    return () => window.removeEventListener("popstate", h);
  }, []);
  if (pathname.startsWith("/privacy")) return <PrivacyPage />;
  if (pathname.startsWith("/terms")) return <TermsPage />;
  if (pathname.startsWith("/docs")) return <DocsPage />;
  return <HomePage />;
}

/* ─── Hero Video Player Component ──────────────────────────── */
function HeroVideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(2.0);
  const videoRef = useRef(null);

  // Enforce 2.0x playback speed by default
  const applySpeed = useCallback((speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, []);

  useEffect(() => {
    applySpeed(playbackRate);
  }, [playbackRate, applySpeed]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      applySpeed(playbackRate);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const cycleSpeed = () => {
    const next = playbackRate === 2.0 ? 1.0 : playbackRate === 1.0 ? 1.5 : 2.0;
    setPlaybackRate(next);
    applySpeed(next);
  };

  return (
    <div className="mt-8 sm:mt-12 w-full max-w-5xl lg:max-w-6xl mx-auto px-1 sm:px-4">
      <div className="relative group">
        {/* Ambient Backlight Glow for large high-impact visual presence */}
        <div className="absolute -inset-1 sm:-inset-2 rounded-[24px] sm:rounded-[32px] bg-gradient-to-r from-indigo-500/25 via-purple-500/25 to-pink-500/15 blur-xl sm:blur-2xl opacity-80 pointer-events-none transition-opacity" />

        {/* Window Chrome Container */}
        <div className="relative rounded-2xl sm:rounded-3xl border border-white/[0.14] bg-[#0c0d14]/95 p-2 sm:p-3.5 shadow-2xl shadow-indigo-950/50 backdrop-blur-2xl transition-all">
          {/* Window Chrome Header */}
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-2 py-1 border-b border-white/[0.06] pb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[11px] sm:text-xs font-mono text-zinc-300 font-medium ml-1 truncate">
                Refinzi Live Demo · Browser-Native AI Prompt Layer
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 ml-auto shrink-0">
              {/* 2x Speed badge / toggle button */}
              <button
                type="button"
                onClick={cycleSpeed}
                title="Toggle playback speed (1x, 1.5x, 2x)"
                className="text-[10px] sm:text-[11px] font-semibold text-amber-300 hover:text-amber-200 bg-amber-950/60 hover:bg-amber-900/60 px-2 sm:px-2.5 py-1 rounded-md border border-amber-500/40 transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>⚡ {playbackRate}× Speed</span>
              </button>

              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause video demo" : "Play video demo"}
                className="text-[10px] sm:text-[11px] text-zinc-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] px-2 sm:px-2.5 py-1 rounded-md border border-white/[0.08] transition-all flex items-center gap-1 cursor-pointer font-medium"
              >
                {isPlaying ? "⏸ Pause" : "▶ Play"}
              </button>

              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute video demo" : "Mute video demo"}
                className="text-[10px] sm:text-[11px] text-zinc-400 hover:text-zinc-200 bg-white/[0.04] hover:bg-white/[0.08] px-2 py-1 rounded-md border border-white/[0.06] transition-all cursor-pointer"
              >
                {isMuted ? "🔇 Muted" : "🔊 Sound"}
              </button>
            </div>
          </div>

          {/* Video Screen Container */}
          <div className="relative aspect-video w-full overflow-hidden rounded-xl sm:rounded-2xl bg-black border border-white/[0.06] shadow-inner group">
            <video
              ref={videoRef}
              src="/refinzi-demo.mp4"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
              onLoadedMetadata={() => applySpeed(playbackRate)}
              onPlay={() => applySpeed(playbackRate)}
              onPause={() => setIsPlaying(false)}
            />

            {/* Floating Feature Micro-Badges */}
            <div className="absolute bottom-2.5 sm:bottom-3 left-2.5 right-2.5 sm:left-4 sm:right-4 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 pointer-events-none">
              <span className="text-[9px] sm:text-[11px] font-semibold text-emerald-300 bg-emerald-950/85 border border-emerald-500/40 px-2 sm:px-2.5 py-1 rounded-full backdrop-blur-md shadow-lg">
                ⚡ Click = Better Prompt (&lt; 350ms)
              </span>
              <span className="hidden xs:inline-block text-[9px] sm:text-[11px] font-semibold text-indigo-300 bg-indigo-950/85 border border-indigo-500/40 px-2 sm:px-2.5 py-1 rounded-full backdrop-blur-md shadow-lg">
                🧠 Hold = Senior Brief (≥ 350ms)
              </span>
              <span className="text-[9px] sm:text-[11px] font-semibold text-zinc-300 bg-zinc-900/85 border border-white/20 px-2 sm:px-2.5 py-1 rounded-full backdrop-blur-md shadow-lg">
                ↩ Native Ctrl+Z In-Place
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── HomePage ─────────────────────────────────────────────── */
function HomePage() {
  /* Demo state */
  const [demoInput, setDemoInput] = useState(DEFAULT_INPUT);
  const [demoOutput, setDemoOutput] = useState(null); // null = original state
  const [demoMode, setDemoMode] = useState(null); // 'better' | 'expert'
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isExpertReady, setIsExpertReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* Browser detection */
  const detectedBrowser = detectBrowser();
  const currentDownloadUrl = DOWNLOADS[detectedBrowser] || DOWNLOADS.chrome;
  const browserCtaLabel = detectedBrowser === "firefox"
    ? "Add to Firefox — Free"
    : detectedBrowser === "edge"
    ? "Add to Edge — Free"
    : "Add to Chrome — Free";

  /* Social proof toast */
  const [toastIdx, setToastIdx] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastDismissed, setToastDismissed] = useState(false);

  useEffect(() => {
    if (toastDismissed) return;
    const initialTimer = setTimeout(() => setShowToast(true), 3500);
    const interval = setInterval(() => {
      setShowToast(false);
      setTimeout(() => {
        setToastIdx((i) => (i + 1) % SOCIAL_PROOF_EVENTS.length);
        setShowToast(true);
      }, 700);
    }, 16000);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [toastDismissed]);

  /* Carousel state */
  const [carouselIdx, setCarouselIdx] = useState(0);
  const carouselTimer = useRef(null);

  /* Checkout / exit */
  const [showCheckout, setShowCheckout] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [email, setEmail] = useState("");
  const [exitEmail, setExitEmail] = useState("");
  const [checkoutDone, setCheckoutDone] = useState(false);
  const [exitDone, setExitDone] = useState(false);

  /* FAQ */
  const [openFaq, setOpenFaq] = useState(null);

  /* Sticky bar */
  const [showSticky, setShowSticky] = useState(false);

  /* Orb refs */
  const animRef = useRef(null);
  const ptrStart = useRef(0);
  const ptrDown = useRef(false);
  const didHold = useRef(false);
  const undoTimer = useRef(null);
  const [showUndo, setShowUndo] = useState(false);

  /* Loop animation for FR-4 */
  const LOOP_STEPS = [
    { text: "quick request →", type: "you" },
    { text: "generic answer", type: "ai" },
    { text: "rewrite →", type: "you" },
    { text: "try again", type: "ai" },
    { text: "add more context →", type: "you" },
    { text: "try again", type: "ai" },
  ];
  const [loopStep, setLoopStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setLoopStep((s) => (s + 1) % LOOP_STEPS.length), 900);
    return () => clearInterval(id);
  }, []);

  /* Carousel auto-rotate */
  const startCarousel = useCallback(() => {
    carouselTimer.current = setInterval(
      () => setCarouselIdx((i) => (i + 1) % PROOF_CARDS.length),
      4500
    );
  }, []);

  useEffect(() => {
    startCarousel();
    return () => clearInterval(carouselTimer.current);
  }, [startCarousel]);

  const goCarousel = (dir) => {
    clearInterval(carouselTimer.current);
    setCarouselIdx((i) => (i + dir + PROOF_CARDS.length) % PROOF_CARDS.length);
    startCarousel();
  };

  /* Sticky */
  useEffect(() => {
    const fn = () => setShowSticky(window.scrollY > 700);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* Exit intent */
  useEffect(() => {
    let fired = false;
    const fn = (e) => {
      if (e.clientY <= 10 && !fired && !sessionStorage.getItem("ei")) {
        fired = true;
        sessionStorage.setItem("ei", "1");
        setShowExit(true);
      }
    };
    document.addEventListener("mouseleave", fn);
    return () => document.removeEventListener("mouseleave", fn);
  }, []);

  /* Ctrl+Z undo */
  useEffect(() => {
    const fn = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && demoOutput) {
        e.preventDefault();
        resetDemo();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [demoOutput]);

  /* Demo mechanics */
  const flashUndo = () => {
    setShowUndo(true);
    clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setShowUndo(false), 9000);
  };

  const applyBetter = () => {
    const out = generateDynamicBetter(demoInput);
    setDemoOutput(out);
    setDemoMode("better");
    flashUndo();
  };

  const applyExpert = () => {
    const out = generateDynamicExpert(demoInput);
    setDemoOutput(out);
    setDemoMode("expert");
    flashUndo();
  };

  const resetDemo = () => {
    setDemoOutput(null);
    setDemoMode(null);
    setShowUndo(false);
  };

  const handlePtrDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    ptrDown.current = true;
    didHold.current = false;
    ptrStart.current = performance.now();
    setIsHolding(true);
    setIsExpertReady(false);
    setHoldProgress(0);
    const tick = (now) => {
      if (!ptrDown.current) return;
      const p = Math.min(1, (now - ptrStart.current) / HOLD_MS);
      setHoldProgress(p);
      if (p >= 1) { setIsExpertReady(true); didHold.current = true; }
      else animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  };

  const handlePtrUp = () => {
    if (!ptrDown.current) return;
    ptrDown.current = false;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const elapsed = performance.now() - ptrStart.current;
    setIsHolding(false);
    setIsExpertReady(false);
    setHoldProgress(0);
    if (elapsed >= HOLD_MS || didHold.current) applyExpert();
    else applyBetter();
  };

  const handlePtrCancel = () => {
    ptrDown.current = false;
    setIsHolding(false);
    setIsExpertReady(false);
    setHoldProgress(0);
    if (animRef.current) cancelAnimationFrame(animRef.current);
  };

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const curCard = PROOF_CARDS[carouselIdx];

  /* ── RENDER ── */
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased overflow-x-hidden">

      {/* ── Sticky bottom bar ── */}
      {showSticky && (
        <div className="fixed bottom-0 inset-x-0 z-40 border-t border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-zinc-400 hidden md:block truncate">
              Stop rewriting prompts.{" "}
              <span className="text-zinc-200 font-medium">Refinzi fixes them in one click.</span>
            </p>
            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
              <a
                href={currentDownloadUrl}
                download
                className="flex-1 md:flex-initial h-9 px-3.5 sm:px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{browserCtaLabel}</span>
              </a>
              <button
                onClick={() => setShowCheckout(true)}
                className="h-9 px-3 sm:px-4 rounded-lg border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer shrink-0"
              >
                Get Pro $12
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ NAV ══ */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-md">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2" aria-label="Refinzi">
            <span className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center font-black text-white text-sm">R</span>
            <span className="font-bold text-white tracking-tight text-base">Refinzi</span>
          </a>

          <ul className="hidden md:flex items-center gap-7 text-sm text-zinc-400">
            <li><a href="#how" className="hover:text-white transition-colors">How it works</a></li>
            <li><a href="#proof" className="hover:text-white transition-colors">Examples</a></li>
            <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
            <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
          </ul>

          <div className="flex items-center gap-2">
            <a
              href={currentDownloadUrl}
              download
              className="h-9 px-3.5 sm:px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{browserCtaLabel}</span>
              <span className="sm:hidden">Install Free</span>
            </a>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden h-9 w-9 rounded-lg border border-zinc-800 bg-zinc-900/80 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800/80 bg-zinc-950/98 px-4 py-4 backdrop-blur-2xl animate-slideUp">
            <div className="flex flex-col gap-3 text-sm font-medium text-zinc-300">
              <a
                href="#how"
                onClick={() => { setMobileMenuOpen(false); scrollTo("how"); }}
                className="py-1.5 hover:text-white transition-colors"
              >
                How it works
              </a>
              <a
                href="#proof"
                onClick={() => { setMobileMenuOpen(false); scrollTo("proof"); }}
                className="py-1.5 hover:text-white transition-colors"
              >
                Examples
              </a>
              <a
                href="#pricing"
                onClick={() => { setMobileMenuOpen(false); scrollTo("pricing"); }}
                className="py-1.5 hover:text-white transition-colors"
              >
                Pricing
              </a>
              <a
                href="#faq"
                onClick={() => { setMobileMenuOpen(false); scrollTo("faq"); }}
                className="py-1.5 hover:text-white transition-colors"
              >
                FAQ
              </a>
              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); setShowCheckout(true); }}
                  className="w-full h-10 rounded-lg border border-zinc-700 bg-zinc-900 text-white font-medium text-sm flex items-center justify-center hover:bg-zinc-800 transition-colors"
                >
                  Get Lifetime Pro $12
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>

        {/* ══ FR-1 HERO ══ */}
        <section className="pt-12 sm:pt-20 pb-12 sm:pb-20 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-indigo-400 mb-4 inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              The simple way to get better AI results
            </p>

            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-5">
              Write Naturally.<br />
              <span className="text-indigo-400">Get Better AI Results.</span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed mb-3">
              You don&rsquo;t need to learn prompt engineering. Just type what you want, then click Refinzi for a better prompt&nbsp;&mdash; or hold for an expert one.
            </p>

            <p className="text-sm text-zinc-500 mb-8">
              No forms. No complicated settings. No questions.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
              <a
                href={currentDownloadUrl}
                download
                className="w-full sm:w-auto h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
              >
                <Download className="w-4 h-4" />
                {browserCtaLabel}
              </a>
              <a
                href="#how"
                onClick={(e) => { e.preventDefault(); scrollTo("how"); }}
                className="w-full sm:w-auto h-12 px-6 rounded-xl border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-medium text-sm inline-flex items-center justify-center gap-2 transition-colors"
              >
                See How It Works <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs text-zinc-500 mb-3">
              <div className="inline-flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span>Private by design — prompts never leave your browser.{" "}
                  <a href="/privacy/" className="text-zinc-400 underline underline-offset-2 hover:text-white">Details →</a>
                </span>
              </div>
              <span className="text-zinc-700 hidden sm:inline">•</span>
              <span className="font-mono text-zinc-400">
                Shortcut: <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px]">Ctrl+Shift+B</kbd>
              </span>
            </div>

            <p className="text-xs text-zinc-500">
              ⭐ 4.9/5 from early users • Works natively in ChatGPT, Claude, Gemini &amp; Perplexity.
            </p>
          </div>

          {/* Restored Hero Video Player - Prominent Large Space with 2x Speed */}
          <HeroVideoPlayer />
        </section>

        {/* ══ Platform Logo Strip ══ */}
        <section className="py-8 border-y border-zinc-800/50 overflow-hidden" aria-label="Compatible platforms">
          <p className="text-center text-xs font-medium text-zinc-600 mb-6 uppercase tracking-widest">
            Works wherever you type
          </p>
          <div className="flex items-center justify-center flex-wrap gap-4 sm:gap-6 px-4 max-w-4xl mx-auto">
            {PLATFORM_LOGOS.map(({ name, Icon, color }) => (
              <div
                key={name}
                className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors group"
                title={name}
              >
                <span className="opacity-60 group-hover:opacity-100 transition-opacity" style={{ color }}>
                  <Icon />
                </span>
                <span className="text-xs font-medium">{name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ══ FR-2 DEMO ══ */}
        <section id="demo" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div>
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                See the difference in 2 seconds.
              </h2>
              <p className="text-sm text-zinc-500">Try it below — type anything and click the button.</p>
            </div>

            {/* Demo box */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-xl">
              {/* Window chrome */}
              <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-zinc-700" />
                    <span className="w-3 h-3 rounded-full bg-zinc-700" />
                    <span className="w-3 h-3 rounded-full bg-zinc-700" />
                  </div>
                  <span className="text-xs text-zinc-500 font-mono">refinzi — browser demo</span>
                </div>
                {demoMode && (
                  <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${demoMode === "expert" ? "bg-violet-950 text-violet-300 border border-violet-700/40" : "bg-indigo-950 text-indigo-300 border border-indigo-700/40"}`}>
                    {demoMode === "expert" ? "Expert" : "Better"}
                  </span>
                )}
              </div>

              {/* Input area */}
              <div className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    {demoOutput ? "Refinzi calibrated your prompt:" : "Your prompt:"}
                  </label>
                  {!demoOutput && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-zinc-500 font-medium">Try:</span>
                      {[
                        { label: "Marketing", text: "make a marketing plan for my business" },
                        { label: "Email", text: "draft an email to client asking if they reviewed the proposal" },
                        { label: "Code Leak", text: "identify and fix the memory leak in my Node.js application" },
                        { label: "Research", text: "research the main competitors of Notion in India" },
                      ].map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => {
                            setDemoInput(p.text);
                            resetDemo();
                          }}
                          className={`text-[11px] px-2.5 py-1 rounded-md border transition-all cursor-pointer font-medium ${
                            demoInput === p.text
                              ? "bg-indigo-600/25 text-indigo-300 border-indigo-500/40 shadow-sm"
                              : "bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:text-zinc-200"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {demoOutput ? (
                  <div className="text-sm text-zinc-200 whitespace-pre-wrap font-mono leading-relaxed min-h-[120px] bg-zinc-950/60 rounded-lg p-3.5 sm:p-4 border border-zinc-800">
                    {demoOutput}
                  </div>
                ) : (
                  <textarea
                    className="w-full text-base sm:text-sm text-zinc-200 bg-zinc-950/60 rounded-lg p-3.5 sm:p-4 border border-zinc-800 focus:border-indigo-500/50 focus:outline-none resize-none min-h-[90px] font-mono leading-relaxed placeholder:text-zinc-600 transition-colors"
                    value={demoInput}
                    onChange={(e) => setDemoInput(e.target.value)}
                    placeholder="Type anything — an email, a request, a question…"
                    rows={3}
                  />
                )}

                {!demoOutput && (
                  <p className="text-[11px] text-zinc-500 mt-2">
                    Try your own — email, research, code, marketing, anything.
                  </p>
                )}
              </div>

              {/* Orb controls */}
              <div className="px-4 sm:px-5 pb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Orb button */}
                  <button
                    type="button"
                    onPointerDown={handlePtrDown}
                    onPointerUp={handlePtrUp}
                    onPointerCancel={handlePtrCancel}
                    disabled={!demoInput.trim()}
                    className={`relative w-12 h-12 rounded-full select-none touch-none transition-all cursor-pointer shrink-0 ${
                      isExpertReady
                        ? "bg-violet-600 ring-4 ring-violet-400/30 scale-110"
                        : isHolding
                        ? "bg-indigo-700 scale-95"
                        : "bg-indigo-600 hover:bg-indigo-500 hover:scale-105"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                    aria-label="Click for Better, hold for Expert"
                  >
                    {/* Progress ring */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 48 48">
                      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2.5" fill="none" className="text-white/10" />
                      <circle
                        cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2.5" fill="none"
                        strokeDasharray={125.6}
                        strokeDashoffset={125.6 - 125.6 * holdProgress}
                        strokeLinecap="round"
                        className={isExpertReady ? "text-violet-300" : "text-indigo-300"}
                      />
                    </svg>
                    {isExpertReady
                      ? <Brain className="w-5 h-5 text-white animate-bounce mx-auto" />
                      : <Zap className="w-5 h-5 text-white mx-auto" />
                    }
                  </button>

                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-white">
                      {isExpertReady ? "Release for Expert" : isHolding ? "Hold for Expert…" : "Refinzi Orb"}
                    </p>
                    <p className="text-[11px] sm:text-xs text-zinc-400">
                      <strong className="text-indigo-400">Click</strong> = Better &nbsp;·&nbsp;
                      <strong className="text-violet-400">Hold</strong> = Expert
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {demoOutput && (
                    <button
                      type="button"
                      onClick={() => {
                        if (demoOutput) {
                          navigator.clipboard.writeText(demoOutput);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }
                      }}
                      className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors cursor-pointer bg-zinc-800/60"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Copied!" : "Copy"}</span>
                    </button>
                  )}

                  {showUndo && (
                    <button
                      type="button"
                      onClick={resetDemo}
                      className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Undo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* CTA below demo */}
            <div className="mt-6 text-center">
              <a
                href={currentDownloadUrl}
                download
                className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-indigo-600/20"
              >
                <Download className="w-4 h-4" />
                {browserCtaLabel}
              </a>
              <p className="text-xs text-zinc-600 mt-2">Installs in seconds. Works immediately.</p>
            </div>
          </div>
        </section>

        {/* ══ FR-3 MECHANISM ══ */}
        <section id="how" className="py-16 sm:py-24 px-4 border-t border-zinc-800/50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                3 Steps. A Few Seconds. No Copy-Pasting.
              </h2>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  num: "1",
                  title: "Write",
                  desc: "Type your rough thought normally. No special formatting. No prompt templates.",
                  color: "indigo",
                },
                {
                  num: "2",
                  title: "Click or Hold",
                  desc: "Click the Orb for Better. Hold it for Expert. That's it — no menus, no settings.",
                  color: "violet",
                },
                {
                  num: "3",
                  title: "Send",
                  desc: "Refinzi replaces your rough prompt in the same text box. You continue exactly where you were.",
                  color: "emerald",
                },
              ].map((step) => (
                <div key={step.num} className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold mb-4 ${
                    step.color === "indigo" ? "bg-indigo-600/15 text-indigo-400"
                    : step.color === "violet" ? "bg-violet-600/15 text-violet-400"
                    : "bg-emerald-600/15 text-emerald-400"
                  }`}>
                    {step.num}
                  </div>
                  <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-zinc-500 mt-8">
              Refinzi does the prompt work. You stay focused on the actual work.
            </p>
          </div>
        </section>

        {/* ══ FR-4 PROBLEM ══ */}
        <section className="py-16 sm:py-24 px-4 border-t border-zinc-800/50 bg-zinc-900/30">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
              You shouldn&rsquo;t have to become a prompt engineer to use AI well.
            </h2>

            {/* Animated loop */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2 mb-8 max-w-lg mx-auto">
              {LOOP_STEPS.map((step, i) => (
                <span
                  key={i}
                  className={`text-sm px-3 py-1 rounded-full transition-all duration-500 ${
                    i === loopStep
                      ? step.type === "you"
                        ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 scale-105"
                        : "bg-rose-600/15 text-rose-400 border border-rose-500/25 scale-105"
                      : "text-zinc-600 bg-zinc-800/40 border border-transparent"
                  }`}
                >
                  {step.text}
                </span>
              ))}
            </div>

            <p className="text-base text-zinc-400 mb-2">
              You spend more time prompting than doing the actual work.
            </p>
            <p className="text-sm text-zinc-500">
              Refinzi gives you a shortcut between &ldquo;I know what I want&rdquo; and &ldquo;AI understands what I need.&rdquo;
            </p>
          </div>
        </section>

        {/* ══ FR-5 PROOF CAROUSEL ══ */}
        <section id="proof" className="py-16 sm:py-24 px-4 border-t border-zinc-800/50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                What Refinzi actually does to your prompts.
              </h2>
              <div className="flex items-center justify-center flex-wrap gap-2 mt-4">
                {PROOF_CARDS.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => { clearInterval(carouselTimer.current); setCarouselIdx(i); startCarousel(); }}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                      i === carouselIdx
                        ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                        : "border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Carousel card */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                  curCard.mode === "Expert"
                    ? "bg-violet-950 text-violet-300 border border-violet-700/40"
                    : "bg-indigo-950 text-indigo-300 border border-indigo-700/40"
                }`}>
                  {curCard.mode} mode
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => goCarousel(-1)} className="w-7 h-7 rounded-md border border-zinc-700 hover:border-zinc-500 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-zinc-600">{carouselIdx + 1} / {PROOF_CARDS.length}</span>
                  <button onClick={() => goCarousel(1)} className="w-7 h-7 rounded-md border border-zinc-700 hover:border-zinc-500 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800">
                {/* You write */}
                <div className="p-5 sm:p-6">
                  <p className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">You write:</p>
                  <p className="text-sm text-zinc-400 font-mono italic">&ldquo;{curCard.you}&rdquo;</p>
                </div>

                {/* Refinzi outputs */}
                <div className="p-5 sm:p-6">
                  <p className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-3">Refinzi:</p>
                  <p className="text-sm text-zinc-200 font-mono whitespace-pre-wrap leading-relaxed">{curCard.refinzi}</p>
                </div>
              </div>

              <div className="px-5 sm:px-6 py-4 border-t border-zinc-800 bg-zinc-950/40">
                <p className="text-sm text-zinc-400">
                  <span className="text-emerald-400 font-semibold">Result:</span>{" "}
                  {curCard.outcome}
                </p>
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 mt-4">
              {PROOF_CARDS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { clearInterval(carouselTimer.current); setCarouselIdx(i); startCarousel(); }}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${i === carouselIdx ? "bg-indigo-500 w-4" : "bg-zinc-700 w-1.5 hover:bg-zinc-500"}`}
                />
              ))}
            </div>

            {/* CTA after carousel */}
            <div className="text-center mt-8">
              <a
                href={DOWNLOADS.chrome}
                download
                className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-indigo-600/20"
              >
                <Download className="w-4 h-4" />
                Try it on your own prompts — Free
              </a>
            </div>
          </div>
        </section>

        {/* ══ FR-6 BETTER vs EXPERT ══ */}
        <section className="py-16 sm:py-24 px-4 border-t border-zinc-800/50 bg-zinc-900/20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Better when you need a quick improvement.<br className="hidden sm:block" />
                Expert when the task really matters.
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Better */}
              <div className="rounded-xl border border-indigo-500/25 bg-indigo-950/20 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-indigo-400" />
                  </span>
                  <div>
                    <p className="font-semibold text-white">Better</p>
                    <p className="text-xs text-zinc-500">Click the Orb</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {[
                    "Adds the important missing details",
                    "Keeps your original intent intact",
                    "Works in under a second",
                    "Good for most everyday tasks",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Expert */}
              <div className="rounded-xl border border-violet-500/25 bg-violet-950/20 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-violet-400" />
                  </span>
                  <div>
                    <p className="font-semibold text-white">Expert</p>
                    <p className="text-xs text-zinc-500">Hold the Orb</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {[
                    "Thinks deeper about what you need",
                    "Adds execution requirements and structure",
                    "Makes reasonable assumptions explicitly",
                    "Stays focused on exactly the job you asked",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-center text-sm text-zinc-500 mt-6 max-w-xl mx-auto">
              Expert does not turn a small request into a giant project. It makes the same request more executable.
            </p>
          </div>
        </section>

        {/* ══ FR-7 USE CASES ══ */}
        <section className="py-16 sm:py-24 px-4 border-t border-zinc-800/50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                One small button. Almost any task.
              </h2>
              <p className="text-sm text-zinc-500">From quick emails to complex research — Refinzi helps across the board.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {USE_CASES.map((uc) => (
                <div key={uc.label} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="text-xl">{uc.emoji}</span>
                    <span className="font-semibold text-sm text-white">{uc.label}</span>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-zinc-600 font-mono">&ldquo;{uc.rough}&rdquo;</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-indigo-400">→</span>
                      <p className="text-xs text-zinc-300">{uc.refined}</p>
                    </div>
                    <p className="text-xs text-emerald-500 font-medium">{uc.outcome}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ FR-8 COMPATIBLE TOOLS ══ */}
        <section className="py-16 sm:py-20 px-4 border-t border-zinc-800/50 bg-zinc-900/30">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              You don&rsquo;t need another chatbot.
            </h2>
            <p className="text-base text-zinc-400 mb-8">
              Refinzi works alongside the tools you already know.
            </p>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {[
                "ChatGPT", "Claude", "Gemini", "Perplexity",
                "Coding tools", "Creative AI", "Email clients", "Documents", "CRMs",
              ].map((tool) => (
                <span key={tool} className="text-sm text-zinc-300 border border-zinc-700 px-3 py-1.5 rounded-lg bg-zinc-900">
                  {tool}
                </span>
              ))}
            </div>

            <p className="text-sm text-zinc-500">
              Refinzi improves the instruction. Your AI does the work.
            </p>
          </div>
        </section>

        {/* ══ FR-9 PRIVACY ══ */}
        <section className="py-16 sm:py-20 px-4 border-t border-zinc-800/50">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 sm:p-10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">Your words are yours.</h2>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                    Refinzi is designed with privacy in mind. Your API keys stay protected, prompts are not used for model training, and processing is local-first wherever possible.
                  </p>
                  <a href="/privacy/" className="text-sm text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors">
                    Read the full privacy details →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ FR-10 PRICING ══ */}
        <section id="pricing" className="py-16 sm:py-24 px-4 border-t border-zinc-800/50 bg-zinc-900/20">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Use Refinzi Free. Upgrade once if you want Pro.
              </h2>
              <p className="text-sm text-zinc-500">No monthly billing. No per-feature charges. One decision.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Free */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                <div className="mb-5">
                  <p className="font-bold text-white text-lg mb-1">Free</p>
                  <p className="text-3xl font-black text-white">$0</p>
                  <p className="text-xs text-zinc-500 mt-1">No credit card. No account required.</p>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {[
                    "Better mode",
                    "Basic browser-wide experience",
                    "Works across all major AI tools",
                    "Bring your own supported AI provider",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={currentDownloadUrl}
                  download
                  className="w-full h-10 rounded-lg border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  {browserCtaLabel}
                </a>
              </div>

              {/* Pro */}
              <div className="rounded-xl border border-indigo-500/40 bg-indigo-950/20 p-6 relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">ONE-TIME</span>
                </div>
                <div className="mb-5">
                  <p className="font-bold text-white text-lg mb-1">Lifetime Pro</p>
                  <p className="text-3xl font-black text-white">$12</p>
                  <p className="text-xs text-zinc-500 mt-1">Pay once. Yours forever.</p>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {[
                    "Everything in Free",
                    "Expert mode",
                    "Advanced calibration",
                    "BYOK support",
                    "All future updates",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-zinc-200">
                      <Check className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  Get Lifetime Pro — $12
                </button>
                <p className="text-[11px] text-zinc-600 text-center mt-2">One payment. No monthly bill.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ══ FR-11 GUARANTEE ══ */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-zinc-800/50">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl font-bold text-white mb-2">Try it without the risk.</h2>
            <p className="text-sm text-zinc-400">
              Try Refinzi for 14 days. If it isn&rsquo;t useful to you, request a refund.
            </p>
          </div>
        </section>

        {/* ══ FR-13 FAQ ══ */}
        <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-zinc-800/50 bg-zinc-900/20">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Common questions.</h2>
            </div>

            <div className="space-y-2">
              {FAQS.map((item, i) => (
                <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer group"
                    aria-expanded={openFaq === i}
                  >
                    <span className="text-sm font-medium text-zinc-200 group-hover:text-white pr-4 transition-colors">
                      {item.q}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5">
                      <p className="text-sm text-zinc-400 leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ FR-14 FINAL CTA ══ */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-t border-zinc-800/50 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
              Stop rewriting prompts.<br />Get on with the work.
            </h2>
            <p className="text-base text-zinc-400 mb-8">
              You already know what you want AI to do. Refinzi helps you say it clearly.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5">
              <a
                href={currentDownloadUrl}
                download
                className="w-full sm:w-auto h-12 px-7 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
              >
                <Download className="w-4 h-4" />
                {browserCtaLabel}
              </a>
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full sm:w-auto h-12 px-7 rounded-xl border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-medium text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                Get Lifetime Pro — $12
              </button>
            </div>

            <p className="text-xs text-zinc-600">Setup takes seconds. Works across your browser.</p>
          </div>
        </section>

      </main>

      {/* ══ FR-15 FOOTER ══ */}
      <footer className="border-t border-zinc-800/50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center font-black text-white text-xs">R</span>
            <span className="text-sm text-zinc-500 font-semibold">Refinzi</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-5 text-sm text-zinc-500">
            <a href="/privacy/" className="hover:text-zinc-300 transition-colors">Privacy Policy</a>
            <a href="/terms/" className="hover:text-zinc-300 transition-colors">Terms of Service</a>
            <a href="/docs/" className="hover:text-zinc-300 transition-colors">Documentation</a>
            <a href="https://github.com/papada1472/refinzi" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">GitHub</a>
            <a href="https://x.com/refinzi" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">X (Twitter)</a>
            <a href="https://linkedin.com/company/refinzi" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">LinkedIn</a>
          </nav>
        </div>
      </footer>

      {/* ══ LIVE SOCIAL PROOF NOTIFICATION TOAST (GROWTH HACK) ══ */}
      {showToast && !toastDismissed && (
        <aside
          role="status"
          aria-live="polite"
          aria-label="Recent activity notification"
          className="fixed bottom-16 sm:bottom-4 left-3 right-3 sm:right-auto sm:left-4 z-40 max-w-sm rounded-xl border border-white/[0.1] bg-zinc-900/95 p-3 shadow-2xl backdrop-blur-md transition-all"
        >
          <div className="flex items-start gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-sm">
              {SOCIAL_PROOF_EVENTS[toastIdx].icon}
            </span>
            <div className="flex-1 pr-1">
              <p className="text-xs font-medium text-zinc-200 leading-snug">
                {SOCIAL_PROOF_EVENTS[toastIdx].text}
              </p>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-zinc-500">
                <span className="text-indigo-400 font-medium">{SOCIAL_PROOF_EVENTS[toastIdx].detail}</span>
                <span>•</span>
                <span>{SOCIAL_PROOF_EVENTS[toastIdx].time}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setToastDismissed(true)}
              className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded transition-colors cursor-pointer shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}

      {/* ══ CHECKOUT MODAL ══ */}
      {showCheckout && (
        <div role="dialog" aria-modal="true" aria-labelledby="checkout-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
            <button onClick={() => { setShowCheckout(false); setCheckoutDone(false); setEmail(""); }} className="absolute top-4 right-4 w-7 h-7 rounded-lg border border-zinc-700 hover:border-zinc-500 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer" aria-label="Close">
              <X className="w-3.5 h-3.5" />
            </button>

            {checkoutDone ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/15 border border-emerald-500/25 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="font-bold text-white mb-1">Order received.</p>
                <p className="text-sm text-zinc-400">Your Pro licence key will arrive at <strong className="text-zinc-200">{email}</strong> shortly.</p>
                <button onClick={() => { setShowCheckout(false); setCheckoutDone(false); setEmail(""); }} className="mt-5 w-full h-10 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors cursor-pointer">Done</button>
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <h3 id="checkout-title" className="font-bold text-white text-lg">Refinzi Lifetime Pro</h3>
                  <p className="text-sm text-zinc-500 mt-1">One payment of <strong className="text-zinc-300">$12</strong>. No subscription. Yours forever.</p>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); if (email.includes("@")) setCheckoutDone(true); }} className="space-y-3">
                  <div>
                    <label htmlFor="pro-email" className="text-xs font-medium text-zinc-400 block mb-1.5">Where should we send your licence key?</label>
                    <input id="pro-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full h-10 px-3 rounded-lg bg-zinc-950 border border-zinc-700 focus:border-indigo-500 text-white text-sm placeholder:text-zinc-600 focus:outline-none transition-colors" />
                  </div>
                  <button type="submit" className="w-full h-11 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer">
                    Pay $12 — Get Lifetime Pro
                  </button>
                  <p className="text-[11px] text-zinc-600 text-center">14-day refund if it&rsquo;s not useful to you.</p>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══ EXIT INTENT MODAL ══ */}
      {showExit && (
        <div role="dialog" aria-modal="true" aria-labelledby="exit-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
            <button onClick={() => setShowExit(false)} className="absolute top-4 right-4 w-7 h-7 rounded-lg border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer" aria-label="Close">
              <X className="w-3.5 h-3.5" />
            </button>

            {exitDone ? (
              <div className="text-center py-4">
                <p className="font-bold text-white mb-1">Got it.</p>
                <p className="text-sm text-zinc-400">We&rsquo;ll send it to <strong className="text-zinc-200">{exitEmail}</strong>.</p>
                <button onClick={() => setShowExit(false)} className="mt-4 w-full h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition-colors cursor-pointer">Close</button>
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/30 bg-amber-950/30 px-2 py-0.5 rounded-full inline-block mb-3">Before you go</span>
                  <h3 id="exit-title" className="font-bold text-white text-base">Get 50 expert prompt frameworks.</h3>
                  <p className="text-sm text-zinc-400 mt-2">A Notion swipe file with 50 senior-level prompt structures across coding, strategy, and marketing. Free.</p>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); if (exitEmail.includes("@")) setExitDone(true); }} className="space-y-3">
                  <input type="email" required value={exitEmail} onChange={(e) => setExitEmail(e.target.value)} placeholder="your@email.com" className="w-full h-10 px-3 rounded-lg bg-zinc-950 border border-zinc-700 focus:border-indigo-500 text-white text-sm placeholder:text-zinc-600 focus:outline-none transition-colors" />
                  <button type="submit" className="w-full h-10 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-100 font-medium text-sm transition-colors cursor-pointer">Send me the frameworks</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
