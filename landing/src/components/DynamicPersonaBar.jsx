import React from "react";
import { TerminalSquare, Camera, PenLine, BookOpen } from "lucide-react";

export const PERSONAS = [
  {
    id: "developer",
    label: "Developer / Code",
    icon: TerminalSquare,
    badge: "Cursor & v0",
    color: "from-blue-500 to-indigo-500",
    raw: "Make a responsive pricing table with toggle and tooltip",
    rebuilt: `Task: Build production-grade Pricing Matrix in React + Tailwind CSS
Architecture: Compound pattern (<Pricing.Root>, <Pricing.Toggle>, <Pricing.Card>)
State: Monthly/Annual billing toggle with animated 20% discount badge
Rules: Kinetic hover elevation cubic-bezier(0.25, 1, 0.5, 1), full ARIA keyboard navigation, zero layout shift.`,
    stats: "React & Tailwind UI Spec",
  },
  {
    id: "creator",
    label: "AI Art & Video",
    icon: Camera,
    badge: "Midjourney & Runway",
    color: "from-purple-500 to-pink-500",
    raw: "A futuristic sports car driving in neon rainy city",
    rebuilt: `/imagine prompt: cinematic 35mm anamorphic wide tracking shot of concept hypercar, rain-slicked Neo-Tokyo asphalt, raytraced reflections, cyan and magenta neon ambiance, Cooke Anamorphic /i 35mm f/1.4 lens, volumetric tire spray, photorealistic Octane 8k render --ar 16:9 --style raw --v 6.0 --q 2`,
    stats: "Midjourney v6 Camera Spec",
  },
  {
    id: "copywriter",
    label: "Copywriter & Growth",
    icon: PenLine,
    badge: "ChatGPT & Claude",
    color: "from-amber-500 to-orange-500",
    raw: "Write a high-converting email sequence for my SaaS product launch",
    rebuilt: `Role: Elite Direct-Response SaaS Copywriter
Framework: 3-Phase Open Loop & Urgency Sequence
• Phase 1: Agitate user workflow bottleneck + quantify hours saved
• Phase 2: Feature matrix mapped 1:1 to measurable business ROI
• Phase 3: Expiring founder deal + overcoming top 3 technical objections
Constraints: 3 subject variants/email (<42 chars), punchy 150w body, single distinct CTA with UTMs.`,
    stats: "3-Phase SaaS Copy Spec",
  },
  {
    id: "researcher",
    label: "Deep Research & Ops",
    icon: BookOpen,
    badge: "DeepSeek & Reasoning",
    color: "from-emerald-500 to-teal-500",
    raw: "Critique this clinical study methodology for selection bias and sample confounders",
    rebuilt: `Role: Principal Investigator & Senior Biostatistician
Task: Execute rigorous methodological audit on highlighted clinical trial excerpt:
1. Confounder Map: Identify unmeasured confounders, collider stratification, and selection bias.
2. Statistical Rigor: Verify if sample size (N) satisfies minimum detectable effect size thresholds under non-parametric distribution.
3. Generalizability: Define boundary conditions where causal claims fail to translate across broader populations.
Output: Formatted Markdown critique matrix with claim citations, confidence scores (1-5), and counter-hypotheses.`,
    stats: "Methodological Audit Spec",
  },
];

export function DynamicPersonaBar({ activePersonaId, onSelectPersona }) {
  return (
    <div className="w-full mt-4 pt-3 border-t border-white/[0.06]">
      <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
        <span>⚡ Customize for your workflow:</span>
      </p>
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {PERSONAS.map((persona) => {
          const Icon = persona.icon;
          const isActive = activePersonaId === persona.id;
          return (
            <button
              key={persona.id}
              type="button"
              onClick={() => onSelectPersona(persona)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-blue-600/30 text-blue-200 border border-blue-400/50 shadow-sm shadow-blue-500/20 scale-[1.02]"
                  : "bg-zinc-900/80 text-zinc-400 border border-white/[0.08] hover:text-white hover:border-zinc-700 hover:bg-zinc-850"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-blue-300" : "text-zinc-400"}`} />
              <span>{persona.label}</span>
              <span className="hidden sm:inline-block text-[10px] px-1 py-0.2 rounded bg-white/5 text-zinc-400 border border-white/5">
                {persona.badge}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
