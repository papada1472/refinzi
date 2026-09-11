import React, { useState } from "react";
import { Check, X, Sparkles, Zap, Shield, Layers, Key, Lock, ArrowRight, Laptop } from "lucide-react";
import { Reveal } from "./Reveal.jsx";
import {
  ChatGptLogo,
  ClaudeLogo,
  MidjourneyLogo,
  CursorLogo,
  GeminiLogo,
  HiggsfieldLogo,
} from "./WorkspaceLogos.jsx";

const STACK_MATRIX = [
  {
    tool: "ChatGPT & Claude",
    Logo: ChatGptLogo,
    count: "14 Presets",
    subWorkflows: ["Direct-Response Copy", "5-Block Architectures", "System Directives"],
    beforeText: "Vague 1-liner → generic, surface-level fluff.",
    afterText: "Structured blueprint with role, context, constraints & tone.",
    result: "1st-try detailed answer",
  },
  {
    tool: "Midjourney & Higgsfield",
    Logo: MidjourneyLogo,
    count: "18 Presets",
    subWorkflows: ["Optical Lens Physics", "3D Camera Vectors", "Aspect & Negative Ratios"],
    beforeText: "\"cyberpunk car\" → 20 wasted fast-hour re-rolls.",
    afterText: "35mm anamorphic lens, lighting physics & aspect ratios.",
    result: "Saves expensive GPU credits",
  },
  {
    tool: "Cursor & Claude Code",
    Logo: CursorLogo,
    count: "16 Presets",
    subWorkflows: ["React 19 Architecture", "FastAPI Specs", "State Token Matrix"],
    beforeText: "\"build a landing page\" → broken components & hallucinations.",
    afterText: "5-Block architecture spec: section tree, state tokens & strict rules.",
    result: "Flawless compiling code",
  },
  {
    tool: "Gemini & OpenRouter (BYOK)",
    Logo: GeminiLogo,
    count: "12 Presets",
    subWorkflows: ["Token Pruning", "Model Calibration", "Zero Markup BYOK"],
    beforeText: "Unfocused prompts → massive context waste & high bills.",
    afterText: "Model-calibrated system prompts with zero token waste.",
    result: "Cuts API bills by 60–80%",
  },
];

const FRICTION_MATRIX = [
  {
    dimension: "Where it works",
    manual: "Copy-pasting between browser tabs",
    extensions: "Locked to Chrome / Edge only",
    refinzi: "Every Windows app (Cursor, Discord, Slack, Web)",
  },
  {
    dimension: "Trigger Friction",
    manual: "Alt-Tab, copy, paste, copy back",
    extensions: "Trapped in browser tabs",
    refinzi: "1-Click Orb in-place (Ctrl+Alt+Space)",
  },
  {
    dimension: "API key markup",
    manual: "N/A",
    extensions: "2x to 5x price markup on tokens",
    refinzi: "0% markup forever (Bring Your Own Key)",
  },
  {
    dimension: "Your privacy",
    manual: "Stored on third-party cloud servers",
    extensions: "Logged on SaaS backends",
    refinzi: "100% Local-first (Windows DPAPI AES-256)",
  },
  {
    dimension: "Execution Speed",
    manual: "30–60 seconds per prompt",
    extensions: "10–15 seconds",
    refinzi: "< 2 seconds in-place (1-Click)",
  },
  {
    dimension: "Pricing model",
    manual: "Wasted time & tokens",
    extensions: "$15–$30/month subscription",
    refinzi: "Free BYOK / ₹999 ($12) Lifetime Supporter",
  },
];

export function RefinziComparison() {
  const [activeTab, setActiveTab] = useState("stack"); // "stack" | "friction"

  return (
    <section className="py-14 sm:py-20 border-t border-white/[0.06] bg-[#07080b] relative overflow-hidden" id="stack-layer">
      {/* Subtle ambient glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] bg-blue-600/5 blur-[140px] rounded-full" />

      <div className="mx-auto max-w-[1140px] px-4 sm:px-6 relative">
        {/* Section Header — Harry Dry Style */}
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 text-xs font-semibold text-blue-400 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>The Missing Layer</span>
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Don’t replace your AI stack. <br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                Stop wasting it.
              </span>
            </h2>

            <p className="mt-3 text-sm sm:text-base text-zinc-300 leading-relaxed">
              You already pay for ChatGPT Plus, Cursor Pro, or Midjourney. <br className="hidden sm:inline" />
              Refinzi sits between your brain and your models, turning rough thoughts into production prompts before they ever hit the AI.
            </p>

            {/* Tab Switcher with Clear Descriptive Labels */}
            <div className="mt-6 inline-flex p-1 rounded-xl bg-zinc-900/90 border border-white/10 shadow-lg">
              <button
                onClick={() => setActiveTab("stack")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === "stack"
                    ? "bg-blue-600 text-white shadow-md ring-1 ring-blue-400"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                AI Workflow Comparisons
              </button>
              <button
                onClick={() => setActiveTab("friction")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === "friction"
                    ? "bg-blue-600 text-white shadow-md ring-1 ring-blue-400"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Architecture &amp; Friction Specs
              </button>
            </div>
          </div>
        </Reveal>

        {/* Tab 1: Stack Matrix */}
        {activeTab === "stack" && (
          <Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {STACK_MATRIX.map(({ tool, Logo, count, subWorkflows, beforeText, afterText, result }) => (
                <div
                  key={tool}
                  className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-5 backdrop-blur-md hover:border-blue-500/40 transition-all shadow-xl space-y-3.5"
                >
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] text-white border border-white/[0.1] p-1.5">
                        <Logo className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm sm:text-base">{tool}</h3>
                        <span className="text-[10px] font-mono text-zinc-400">{count}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                      {result}
                    </span>
                  </div>

                  {/* Sub-workflows taxonomy preview */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-zinc-400 font-semibold">Sub-Workflows:</span>
                    {subWorkflows.map((flow) => (
                      <span
                        key={flow}
                        className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-zinc-300 border border-white/[0.06]"
                      >
                        {flow}
                      </span>
                    ))}
                  </div>

                  {/* Without vs With (Enhanced WCAG AA contrast) */}
                  <div className="space-y-2 text-xs">
                    <div className="rounded-xl bg-red-950/40 border border-red-500/30 p-3 flex items-start gap-2.5">
                      <X className="h-4 w-4 text-red-300 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-red-300 tracking-wider block">Without Refinzi</span>
                        <p className="text-zinc-100 mt-1 font-medium leading-relaxed">{beforeText}</p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-blue-950/40 border border-blue-500/30 p-3 flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-blue-300 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-blue-300 tracking-wider block">With Refinzi (1-Click)</span>
                        <p className="text-white font-medium mt-1 leading-relaxed">{afterText}</p>
                      </div>
                    </div>
                  </div>

                  {/* In-Card Tool-Specific CTA */}
                  <div className="pt-1 flex items-center justify-between">
                    <a
                      href="#demo"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors group cursor-pointer"
                    >
                      <span>Try {tool.split(" ")[0]} with Refinzi</span>
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                    <span className="text-[10px] text-zinc-400">&lt; 2s in-place</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom punchline — The Rule (Broken into 2 crisp sentences with visual highlight) */}
            <div className="mt-6 rounded-2xl bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-blue-950/60 border-2 border-blue-500/40 p-4 sm:p-5 text-center shadow-lg shadow-blue-500/10">
              <p className="text-sm sm:text-base font-semibold text-zinc-100 leading-relaxed">
                💡 <span className="text-white font-bold underline decoration-blue-400 underline-offset-4">The Rule:</span> Great AI models don't fail because they lack capability. They fail because 1-line prompts lack context and constraints. Refinzi fixes the prompt in 2 seconds.
              </p>
            </div>
          </Reveal>
        )}

        {/* Tab 2: Workflow Friction & BYOK Advantage Matrix */}
        {activeTab === "friction" && (
          <Reveal>
            <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-zinc-900/50 backdrop-blur-md shadow-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-zinc-950/80">
                    <th className="p-3.5 sm:p-4 font-semibold text-zinc-400 w-1/4">Comparison</th>
                    <th className="p-3.5 sm:p-4 font-semibold text-zinc-400 text-center">Manual Copy-Paste</th>
                    <th className="p-3.5 sm:p-4 font-semibold text-zinc-400 text-center hidden sm:table-cell">Browser Extensions</th>
                    <th className="p-3.5 sm:p-4 font-extrabold text-blue-400 bg-blue-950/30 border-x border-blue-500/20 text-center w-1/3">
                      <div className="flex items-center justify-center gap-1">
                        <span>⚡ Refinzi 2.0 (Windows Native)</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {FRICTION_MATRIX.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3.5 sm:p-4 font-medium text-zinc-200">
                        {row.dimension}
                      </td>
                      <td className="p-3.5 sm:p-4 text-center text-zinc-400">
                        {row.manual}
                      </td>
                      <td className="p-3.5 sm:p-4 text-center text-zinc-400 hidden sm:table-cell">
                        {row.extensions}
                      </td>
                      <td className="p-3.5 sm:p-4 text-center bg-blue-950/20 border-x border-blue-500/20 font-bold text-emerald-400">
                        {row.refinzi}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        )}

        {/* 3 Core Pillars */}
        <Reveal>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-4 sm:p-5 space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                <Key className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-white">0% Markup BYOK</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Connect your own Gemini or OpenRouter API keys. You pay direct wholesale rates. We take $0.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-4 sm:p-5 space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                <Lock className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-white">Zero Cloud Logging</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Local Windows execution with DPAPI encryption. Your prompts never touch our servers or train any model.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-4 sm:p-5 space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20">
                <Layers className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-white">Works Everywhere</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                ChatGPT, Cursor, Discord, Slack, Figma, VS Code. Highlight text and 1-Click the Orb. Done.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default RefinziComparison;
