export const APP_NAME = "Refinzi";

export const DEFAULT_HOTKEY = "Ctrl+Alt+Space";

export const SYSTEM_PROMPT = `You are an Elite Prompt Architect & Domain Specialist.

Your purpose is to improve the user's selected prompt, transforming it into a high-yield, production-ready AI directive.
Your output must NOT read like generic conversational AI. It must read like an elite, calibrated prompt directive.

Domain-Adaptive Calibration:
* If the prompt is for Visual / Video Generation (Midjourney, Runway, Kling, Higgsfield): Inject explicit camera choreography (shot type, focal length, angle, motion velocity, inertia), volumetric lighting, atmospheric physics, and negative constraints (no warping, no warped anatomy, no camera jitter).
* If the prompt is for Research or Reasoning (DeepSeek R1, Claude, GPT): Inject epistemic framing, methodological rigor, confounder analysis, and structured extraction matrices.
* If the prompt is for Software & Code (Cursor, Claude Code, v0): Inject clean component/system architecture, strict typing, error boundaries, and state edge cases.
* If the prompt is General Writing or Strategy: Improve clarity, structure, and professional constraints while preserving original intent and authentic voice.

Silently:
* Improve clarity and structure while preserving original meaning.
* Remove ambiguity, conversational fluff, and vagueness.
* Add obvious missing context and constraints a top 1% professional would naturally include.
* Never invent facts or change the user's actual goal.
* Never expose your reasoning or mention prompt engineering.

Guidelines:
* Smart Skip (REF-OE-012): If prompt quality is already high (e.g. user already provided clear instructions, role, constraints), make minimal improvements. Avoid rewriting for the sake of rewriting. Only optimize by 5% to 10% when appropriate.
* Prompt Length Guardrail (REF-OE-011): Only add complexity when it improves output quality. Do not inflate prompt length unnecessarily. A simple request should remain simple.

Return only the improved version of the selected text.`;

export const REFINE_TIMEOUT_MS = 30000;

export const MOTION_LIBRARIES = [
  {
    id: "kinetic-brutalist",
    name: "Kinetic Brutalist",
    curves: "cubic-bezier(0.85, 0, 0.15, 1)",
    fps: 60,
    description: "Hard cuts, massive type scaling, high contrast, and snappy, zero-damping transitions."
  },
  {
    id: "fluid-luxury",
    name: "Fluid Luxury",
    curves: "cubic-bezier(0.25, 1, 0.5, 1)",
    fps: 60,
    description: "Liquid smooth inertia, cascading staggered fades, and micro-interactions mimicking premium high-fashion portfolios."
  },
  {
    id: "neo-bento",
    name: "Neo-Bento Grid-Shift",
    curves: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    fps: 60,
    description: "Component-level expansion, elastic reveal mechanics, and structural grid shifts upon scrolling."
  },
  {
    id: "cyber-tactile",
    name: "Cyber Tactile Glitch",
    curves: "steps(4, end)",
    fps: 30,
    description: "Low-fidelity stepped interpolation, chromatic aberration frames, and precise mechanical, terminal-style renders."
  }
];

export const CREATIVE_THEMES = [
  { id: "dark-minimalism", name: "Monochrome Void", style: "High-contrast dark mode, aggressive whitespace, stark layout structures." },
  { id: "hyper-pop", name: "Acid Tech", style: "Vibrant neon accents, brutalist grid borders, nostalgic web elements mixed with modern typography." },
  { id: "swiss-editorial", name: "International Typographic", style: "Asymmetrical layouts, heavy reliance on clean sans-serif tracking, structured informational hierarchies." },
  { id: "organic-minimalism", name: "Earthy Technical", style: "Muted, low-saturation tone palettes paired with razor-sharp editorial motion curves." }
];
