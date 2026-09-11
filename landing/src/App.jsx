import React, { useState, useEffect, useRef } from "react";
import {
  Download,
  Menu,
  X,
  MousePointer,
  Layers,
  Zap,
  Check,
  LayoutTemplate,
  Boxes,
  PenLine,
  MousePointerClick,
  TerminalSquare,
  Sparkles,
  ShieldCheck,
  Globe,
  Clock,
  Star,
  Copy,
  CheckCheck,
  ArrowRight,
  Flame,
  Camera,
  Video,
  Bot,
  Laptop,
  CheckCircle2,
  Lock,
  ChevronRight,
  Apple,
  Smartphone,
  ArrowUp,
  BookOpen,
} from "lucide-react";
import { Button } from "./components/ui/button.jsx";
import { Card } from "./components/ui/card.jsx";
import { Badge } from "./components/ui/badge.jsx";
import { Accordion, AccordionItem } from "./components/ui/accordion.jsx";
import { Reveal } from "./components/Reveal.jsx";
import OrbCursor from "./components/OrbCursor.jsx";
import { PaypalCheckoutModal } from "./components/PaypalCheckoutModal.jsx";
import { NonWindowsModal } from "./components/NonWindowsModal.jsx";
import { CurrencyBadge } from "./components/CurrencySelector.jsx";
import { SocialProofToast } from "./components/SocialProofToast.jsx";
import { RequestAiSummary } from "./components/RequestAiSummary.jsx";
import { PrivacyPage } from "./pages/PrivacyPage.jsx";
import { TermsPage } from "./pages/TermsPage.jsx";
import { DocsPage } from "./pages/DocsPage.jsx";
import { FounderSection } from "./components/FounderSection.jsx";
import { DirectFeedbackSection } from "./components/DirectFeedbackSection.jsx";
import { RefinziComparison } from "./components/RefinziComparison.jsx";
import { ThemeToggle } from "./components/ThemeToggle.jsx";
import { CookieBanner } from "./components/CookieBanner.jsx";
import { DynamicPersonaBar, PERSONAS } from "./components/DynamicPersonaBar.jsx";
import { AiConversionConcierge } from "./components/AiConversionConcierge.jsx";
import { initAnalytics, trackEvent, trackFileDownload } from "./utils/analytics.js";
import { initPerformanceMonitoring } from "./utils/performance.js";
import {
  SUPPORTED_CURRENCIES,
  detectCountryAndCurrencyAsync,
  detectLocalCurrencyOffline,
} from "./utils/currency.js";
import {
  CursorLogo,
  V0Logo,
  VercelLogo,
  ClaudeLogo,
  ChatGptLogo,
  GeminiLogo,
  HiggsfieldLogo,
  MidjourneyLogo,
} from "./components/WorkspaceLogos.jsx";

/* ---------------------------------- data ---------------------------------- */

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "AI Demo", href: "#demo" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const WORKSPACES = [
  { name: "ChatGPT", Logo: ChatGptLogo },
  { name: "Gemini", Logo: GeminiLogo },
  { name: "Midjourney", Logo: MidjourneyLogo },
  { name: "Higgsfield", Logo: HiggsfieldLogo },
  { name: "Cursor", Logo: CursorLogo },
  { name: "Claude", Logo: ClaudeLogo },
  { name: "Vercel", Logo: VercelLogo },
];

const BLUEPRINT_BLOCKS = [
  { icon: LayoutTemplate, label: "1. Hierarchical Layout Scaffolding" },
  { icon: Boxes, label: "2. Component Token & State Matrix" },
  { icon: PenLine, label: "3. Conversion Copy & Brand Voice" },
  { icon: MousePointerClick, label: "4. Motion Dynamics & Physics" },
  { icon: TerminalSquare, label: "5. Production-Ready Prompt Pack" },
];

const BLUEPRINT_DETAILS = [
  {
    icon: LayoutTemplate,
    title: "1. Structural Layout Scaffolding",
    desc: "Complete section trees, responsive breakpoint shifts, and CSS grid spacing scales. Eliminates layout guessing on the first generation.",
  },
  {
    icon: Boxes,
    title: "2. Component & State Matrix",
    desc: "Tokenized UI assets, component variants (hover, active, focus, disabled), ARIA accessibility roles, and boundary conditions.",
  },
  {
    icon: PenLine,
    title: "3. Conversion Copy Engine",
    desc: "Direct-response headlines, contextual value propositions, and precise microcopy tailored for ChatGPT, Claude, and Gemini.",
  },
  {
    icon: Video,
    title: "4. Motion Dynamics & Camera Physics",
    desc: "Liquid cubic-bezier spring curves for web UIs, or 3D orbital camera vectors and volumetric lighting physics tuned for Higgsfield & Midjourney.",
  },
  {
    icon: TerminalSquare,
    title: "5. Production Prompt Pack",
    desc: "Zero-rework master prompt packs calibrated for the exact context windows of ChatGPT, Gemini, Midjourney, Higgsfield, Cursor & Claude.",
  },
];

const DEMO_PRESETS = [
  {
    id: "midjourney",
    label: "Midjourney",
    icon: MidjourneyLogo,
    badge: "Photoreal Optics",
    subStyles: ["v6.0 Photoreal", "Anamorphic Lens", "Aspect 16:9"],
    raw: "A futuristic sports car driving in neon rainy city",
    rebuilt: `/imagine prompt: cinematic 35mm anamorphic wide tracking shot of concept hypercar, rain-slicked Neo-Tokyo asphalt, raytraced reflections, cyan and magenta neon ambiance, Cooke Anamorphic /i 35mm f/1.4 lens, volumetric tire spray, photorealistic Octane 8k render --ar 16:9 --style raw --v 6.0 --q 2`,
    stats: "Midjourney v6.0 Camera Spec",
  },
  {
    id: "higgsfield",
    label: "Higgsfield / Runway",
    icon: HiggsfieldLogo,
    badge: "Video Motion",
    subStyles: ["3D Orbital Motion", "Visor Physics", "4K 60fps"],
    raw: "An astronaut exploring a crystal cave on another planet",
    rebuilt: `[Camera: 360° orbital crane shot descending from subterranean crystal ceiling to human eye-level]
Subject: Titanium spacesuit with dynamic visor reflection
Atmosphere: Bioluminescent amethyst cavern, floating micro-crystal dust, volumetric teal glow, 4K 60fps velocity physics.`,
    stats: "3D Camera Vector Spec",
  },
  {
    id: "research",
    label: "Deep Research",
    icon: BookOpen,
    badge: "Reasoning & Epistemics",
    subStyles: ["Methodology Audit", "Confounder Map", "Confidence Scoring"],
    raw: "Critique this clinical study methodology for selection bias and sample confounders",
    rebuilt: `Role: Principal Investigator & Senior Biostatistician
Task: Execute rigorous methodological audit on highlighted clinical trial excerpt:
1. Confounder Map: Identify unmeasured confounders, collider stratification, and selection bias.
2. Statistical Rigor: Verify if sample size (N) satisfies minimum detectable effect size thresholds under non-parametric distribution.
3. Generalizability: Define boundary conditions where causal claims fail to translate across broader populations.
Output: Formatted Markdown critique matrix with claim citations, confidence scores (1-5), and counter-hypotheses.`,
    stats: "Methodological Audit Spec",
  },
  {
    id: "cursor",
    label: "Cursor",
    icon: CursorLogo,
    badge: "Production Code",
    subStyles: ["React 19 Architecture", "State Matrix", "Zero Layout Shift"],
    raw: "Make a responsive pricing table with toggle and tooltip",
    rebuilt: `Task: Build production-grade Pricing Matrix in React + Tailwind CSS
Architecture: Compound pattern (<Pricing.Root>, <Pricing.Toggle>, <Pricing.Card>)
State: Monthly/Annual billing toggle with animated 20% discount badge
Rules: Kinetic hover elevation cubic-bezier(0.25, 1, 0.5, 1), full ARIA keyboard navigation, zero layout shift.`,
    stats: "React & Tailwind UI Spec",
  },
  {
    id: "chatgpt",
    label: "Claude / ChatGPT",
    icon: ChatGptLogo,
    badge: "Reasoning & Copy",
    subStyles: ["3-Phase Open Loop", "Direct-Response ROI", "Founder Deal Urgency"],
    raw: "Write a high-converting email sequence for my SaaS product launch",
    rebuilt: `Role: Elite Direct-Response SaaS Copywriter
Framework: 3-Phase Open Loop & Urgency Sequence
• Phase 1: Agitate user workflow bottleneck + quantify hours saved
• Phase 2: Feature matrix mapped 1:1 to measurable business ROI
• Phase 3: Expiring founder deal + overcoming top 3 technical objections
Constraints: 3 subject variants/email (<42 chars), punchy 150w body, single distinct CTA with UTMs.`,
    stats: "3-Phase SaaS Copy Spec",
  },
];

const USE_CASES = [
  {
    icon: Camera,
    title: "Midjourney & Generative Art",
    body: "Inject optical focal lengths, lighting vectors, and --v 6.0 parameters in one click.",
    tag: "AI Art & Design",
  },
  {
    icon: Video,
    title: "Higgsfield & Runway Video",
    body: "Generate cinematic 3D orbital camera vectors, inertia cues, and temporal velocity physics.",
    tag: "Video Generation",
  },
  {
    icon: BookOpen,
    title: "Academic & Deep Research",
    body: "Synthesize 400-word peer-review specifications, PRISMA reviews, and bias audits in-place.",
    tag: "Research & Reasoning",
  },
  {
    icon: TerminalSquare,
    title: "Cursor & Full-Stack Code",
    body: "Synthesize full section trees, state props, and clean code specs in 2 seconds.",
    tag: "Frontend & Code",
  },
];

const TESTIMONIALS = [
  {
    name: "Arjun Kapoor",
    role: "Lead Conversion Copywriter",
    company: "GrowthSprint Agency",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&q=75&fm=webp",
    text: "I used to spend 20 minutes formatting client proposals and re-prompting ChatGPT 5 times. Refinzi does it in 2 seconds with my exact template in-place.",
    rating: 5,
    highlight: "Saves 20 mins per proposal",
    verified: "Verified Pro User",
  },
  {
    name: "Sarah Mitchell",
    role: "Chief of Staff",
    company: "ScaleOps Global",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=64&h=64&q=75&fm=webp",
    text: "As an Ops leader, I handle confidential executive notes. The fact that Refinzi runs 100% locally with DPAPI encryption is the only reason I use it.",
    rating: 5,
    highlight: "100% Local Privacy Verified",
    verified: "Verified Pro User",
  },
  {
    name: "Dev Raghavan",
    role: "Full-Stack Engineer & Founder",
    company: "ShipFast Studio",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&q=75&fm=webp",
    text: "Stopped burning Midjourney fast-hours and Cursor compute on vague one-liners. The 5-block prompt architecture turns any rough thought into clean code.",
    rating: 5,
    highlight: "Essential Cursor & Midjourney companion",
    verified: "Verified Pro User",
  },
];

const FAQS = [
  {
    question: "How does Refinzi actually work?",
    answer:
      "Refinzi uses an \"Ambient Orb\" that lives near your cursor without interrupting your workflow. Highlight text in any Windows app (or press Ctrl + Alt + Space), and the Orb instantly drops in, analyzes the context, and lets you rebuild it.",
  },
  {
    question: "What exactly do I get when I \"Rebuild\"?",
    answer:
      "You don't just get a wall of text. Refinzi outputs a structured Rebuild Pack containing 5 architectural sections: Structure & Layout, Component Assets, Creative Copy & Hooks, Motion & Interactions, and an Implementation Prompt Pack specifically formatted for Cursor, Claude, or v0. One click copies it all to your clipboard.",
  },
  {
    question: "Which AI models power the rebuilds?",
    answer:
      "Refinzi 2.0 features a fast model-switcher with 1-click access to DeepSeek V3, DeepSeek R1, Gemini 1.5 Flash, and Nemotron 120B.",
  },
  {
    question: "What happens when my included usage runs out?",
    answer:
      "We don't hit you with a hard paywall. You can instantly switch to BYOK (Bring Your Own Key). Just add your DeepSeek, Gemini, or OpenRouter key to keep rebuilding indefinitely.",
  },
  {
    question: "Do you store my API keys or my prompts?",
    answer:
      "Zero logging, zero prompt storage. If you use BYOK, your API keys are encrypted locally on your machine using AES-256. They never touch our servers.",
  },
  {
    question: "Is it a subscription?",
    answer:
      "No. Supporter Pro is a one-time coffee purchase. Pay once, own it forever with lifetime updates, VIP Discord community access, and our weekly prompt engineering newsletter.",
  },
  {
    question: "Is it safe? Will my antivirus flag it?",
    answer:
      "It's a clean, standard Windows executable (0/72 on VirusTotal) and built in public on GitHub. Our diagnostic logs automatically mask sensitive data. If you're ultra-cautious, run it in a sandbox first.",
  },
  {
    question: "Is it available on Mac?",
    answer:
      "Not yet. Refinzi 2.0 is native to Windows 10/11. You can join the Mac waitlist at the top of the page.",
  },
  {
    question: "Can I use Refinzi inside Cursor IDE, VS Code, Discord, and Slack?",
    answer:
      "Yes. Refinzi operates at the native Windows OS level. Highlight text or code inside Cursor, VS Code, Discord, Slack, Chrome, or Obsidian, and 1-click the floating Orb or press Ctrl + Alt + Space to engineer an in-place prompt without switching windows.",
  },
  {
    question: "How does the 5-Block Prompt Blueprint work?",
    answer:
      "Refinzi synthesizes vague ideas into 5 production blocks: 1) System Role & Objective, 2) Context & Inputs, 3) Architecture Tree, 4) Strict Negative Constraints, and 5) Implementation Output Pack. This eliminates AI hallucinations and model drift on the very first try.",
  },
  {
    question: "Do I need to pay for AI tokens to use Refinzi?",
    answer:
      "No. Refinzi includes starter rebuilds, and you can connect your own free Google Gemini API key or pay-as-you-go DeepSeek/OpenRouter keys with 0% token markup. You never pay a mandatory recurring subscription.",
  },
];

/* ----------------------------- ambient glows ------------------------------ */

function HeroGlows() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-28 left-1/2 h-[360px] w-[600px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]" />
      <div className="absolute right-[10%] top-[15%] h-[240px] w-[240px] rounded-full bg-purple-600/10 blur-[110px]" />
    </div>
  );
}

/* --------------------------- Lifetime Offer Modal ------------------------- */

function LifetimeOfferModal({ isOpen, onClose, onDownload, onOpenCheckout, currency = SUPPORTED_CURRENCIES.USD, detectedCountry = "" }) {
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 25);

  useEffect(() => {
    if (!isOpen) return;
    trackEvent("offer_modal_view", { currency: currency.code, country: detectedCountry });
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 14 * 60 + 25));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-[450px] overflow-hidden rounded-2xl border border-blue-500/40 bg-zinc-950 p-5 sm:p-6 shadow-2xl shadow-blue-500/10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-purple-600/10 blur-2xl" />

        {/* Top bar */}
        <div className="flex items-center justify-between gap-2 pr-7">
          <div className="flex items-center gap-1.5 bg-blue-600 text-white font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider shadow-sm">
            <Sparkles className="h-3 w-3 text-amber-300" />
            <span>☕ Supporter Pro · One-Time Coffee</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            <ShieldCheck className="h-2.5 w-2.5" />
            <span>Instant Key</span>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          aria-label="Close offer modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Headline */}
        <div className="mt-3">
          <h3 className="text-xl font-extrabold tracking-tight text-white leading-tight">
            Refinzi Supporter Pro Access
          </h3>
          <p className="mt-1 text-xs text-zinc-300">
            One-time coffee purchase ({currency.formattedPrice}). Pay once, own forever with community & newsletter access.
          </p>
        </div>

        {/* Value List */}
        <div className="mt-3 rounded-xl border border-white/[0.07] bg-zinc-900/60 p-3 space-y-1.5 text-xs text-zinc-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            <span><strong>Everything in Free / BYOK:</strong> 1-click prompt engineering on all 12+ providers.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
            <span><strong>Community & Newsletter:</strong> Private Discord access & weekly prompt breakdowns.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span><strong>Lifetime Updates:</strong> Zero subscriptions. All future Windows, Mac & Linux releases.</span>
          </div>
        </div>

        {/* Pricing Box */}
        <div className="mt-3 flex items-center justify-between rounded-xl border border-blue-500/25 bg-blue-950/20 px-3.5 py-2.5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
              ☕ One-Time Supporter License {currency.flag}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-extrabold text-white">{currency.formattedPrice}</span>
              <span className="text-xs text-zinc-400">one-time payment</span>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded-md">
            ☕ ~Cost of 2 coffees
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-3.5 flex flex-col gap-2">
          <Button
            size="default"
            variant="deal"
            className="w-full font-semibold text-xs sm:text-sm py-2.5"
            onClick={() => {
              if (onOpenCheckout) {
                onOpenCheckout();
              } else {
                window.location.href = "#pricing";
                onClose();
              }
            }}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300 mr-1" />
            ☕ Buy Me a Coffee & Get Pro — {currency.formattedPrice}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="w-full text-xs py-2"
            onClick={() => {
              onDownload();
              onClose();
            }}
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            Download Free BYOK Version (.exe)
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="mt-2.5 flex items-center justify-center gap-3 text-[10px] text-zinc-400 border-t border-white/[0.06] pt-2">
          <span className="flex items-center gap-1">
            <Lock className="h-2.5 w-2.5 text-emerald-400" /> 100% Safe
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-2.5 w-2.5 text-blue-400" /> 14-Day Guarantee
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Laptop className="h-2.5 w-2.5 text-purple-400" /> Windows 10/11 Native
          </span>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Non-Intrusive Download Toast ----------------------- */

function DownloadToast({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      onClose();
    }, 9000);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText("Ctrl+Alt+Space");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-50 max-w-sm w-[calc(100vw-32px)] sm:w-auto rounded-2xl border border-emerald-500/40 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/30">
            <Download className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Downloading Refinzi 2.0</span>
              <span className="text-[10px] text-emerald-400 font-mono">.exe</span>
            </h4>
            <p className="text-[11px] text-zinc-400">Direct download started to your PC</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          aria-label="Close notification"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-3 rounded-xl border border-white/[0.06] bg-zinc-900/70 p-2.5 space-y-1.5 text-[11px] text-zinc-300">
        <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Quick 3-Step Setup:</p>
        <div className="flex items-center gap-2">
          <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-[9px] font-bold">1</span>
          <span>Open <code className="text-blue-300 bg-blue-950/40 px-1 py-0.2 rounded font-mono">Refinzi-Setup-v2.0.0.exe</code></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-purple-400 text-[9px] font-bold">2</span>
          <span>Orb floats ambiently on your desktop</span>
        </div>
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-2">
            <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">3</span>
            <span>Highlight text & tap</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 font-mono text-[10px] font-bold text-blue-300 bg-blue-950/50 hover:bg-blue-900/50 px-1.5 py-0.5 rounded border border-blue-500/30 transition-colors cursor-pointer"
          >
            {copied ? <CheckCheck className="h-2.5 w-2.5 text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
            <span>Ctrl+Alt+Space</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- navbar -------------------------------- */

function Navbar({ onOpenOffer, onDownload, currency = SUPPORTED_CURRENCIES.USD, osType = "windows", theme = "dark", onToggleTheme }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#08090c]/85 backdrop-blur-xl">
      <nav role="navigation" aria-label="Main Navigation" className="mx-auto flex h-14 max-w-[1140px] items-center justify-between px-4 sm:px-6">
        <a href="/" aria-label="Refinzi 2.0 Homepage" className="flex items-center gap-2.5 text-base font-bold text-zinc-50 transition-colors hover:text-white">
          <img
            src="/branding/logo-mark.webp"
            alt="Refinzi 2.0"
            width="28"
            height="28"
            loading="eager"
            fetchpriority="high"
            decoding="async"
            className="h-7 w-7 rounded-lg object-contain shadow-sm shadow-blue-500/30"
          />
          <span className="tracking-tight font-bold">Refinzi <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/20">2.0</span></span>
        </a>

        <ul className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-xs text-zinc-400 transition-colors hover:text-zinc-100 font-medium"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2.5 md:flex">
          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
          
          <a
            href="https://github.com/papada1472/refinzi"
            target="_blank"
            rel="noopener noreferrer"
            title="Star Refinzi on GitHub"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-2.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.08] hover:border-white/25 transition-all shadow-sm"
          >
            <span>⭐ Star</span>
            <span className="rounded bg-white/10 px-1 py-0.2 text-[10px] text-zinc-300">GitHub</span>
          </a>

          <Button
            variant="primary"
            size="xs"
            onClick={onDownload}
            className="font-bold text-xs"
          >
            <Download className="h-3 w-3 mr-1" />
            Download Free (Windows)
          </Button>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] text-zinc-300 hover:text-white transition-colors cursor-pointer touch-manipulation"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-white/[0.06] bg-[#08090d]/95 backdrop-blur-xl md:hidden animate-in slide-in-from-top-2 duration-150">
          <ul className="mx-auto flex max-w-[1140px] flex-col gap-1.5 px-4 py-4">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-[44px] items-center rounded-lg px-3.5 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-zinc-50 font-medium transition-colors touch-manipulation"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-2 flex flex-col gap-2">
              <a
                href="https://github.com/papada1472/refinzi"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all shadow-[0_0_12px_rgba(245,158,11,0.15)]"
              >
                <span>⭐ Star Refinzi on GitHub</span>
              </a>

              <Button
                variant="primary"
                size="sm"
                onClick={() => { setOpen(false); onDownload(); }}
                className="w-full font-bold"
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                Download Free (.exe)
              </Button>
              <Button
                variant="deal"
                size="sm"
                onClick={() => { setOpen(false); onOpenOffer(); }}
                className="w-full"
              >
                <Flame className="h-3.5 w-3.5 mr-1" />
                Lifetime Deal — {currency.formattedPrice}
              </Button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

/* -------------------------------- hero ---------------------------------- */

function OrbMockup() {
  const [activeMode, setActiveMode] = useState("tap"); // "tap" | "hold"
  const [isHolding, setIsHolding] = useState(false);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const holdTimer = useRef(null);

  // Auto-cycle between Tap and Blueprint states every 4.5s unless user is interacting
  useEffect(() => {
    if (isUserInteracting) return;
    const interval = setInterval(() => {
      setActiveMode((prev) => (prev === "tap" ? "hold" : "tap"));
    }, 4500);
    return () => clearInterval(interval);
  }, [isUserInteracting]);

  const startHold = () => {
    setIsUserInteracting(true);
    setIsHolding(true);
    holdTimer.current = setTimeout(() => {
      setActiveMode("hold");
      setIsHolding(false);
    }, 300);
  };

  const endHold = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    setIsHolding(false);
  };

  return (
    <Card
      onMouseEnter={() => setIsUserInteracting(true)}
      onMouseLeave={() => setIsUserInteracting(false)}
      className="luxury-surface relative rounded-2xl p-4 sm:p-5 shadow-xl border border-white/[0.08]"
    >
      {/* Window chrome header */}
      <div className="mb-3 flex items-center justify-between">
        <div aria-hidden="true" className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700/80" />
          <span className="ml-2 text-[10px] font-mono text-zinc-400 font-medium">refinzi-overlay.exe</span>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-zinc-950 p-0.5 border border-white/[0.06]">
          <button
            type="button"
            onClick={() => {
              setIsUserInteracting(true);
              setActiveMode("tap");
            }}
            className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-all ${
              activeMode === "tap"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/40 font-bold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            ⚡ Tap Mode
          </button>
          <button
            type="button"
            onClick={() => {
              setIsUserInteracting(true);
              setActiveMode("hold");
            }}
            className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-all ${
              activeMode === "hold"
                ? "bg-purple-500/20 text-purple-400 border border-purple-500/40 font-bold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            🧠 Blueprint (300ms)
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center">
        {/* Interactive glowing orb bar */}
        <div className="flex items-center gap-3 w-full bg-zinc-950/70 p-2.5 rounded-xl border border-white/[0.05]">
          <div
            onMouseDown={startHold}
            onMouseUp={endHold}
            onMouseLeave={endHold}
            onClick={() => {
              setIsUserInteracting(true);
              setActiveMode((prev) => (prev === "tap" ? "hold" : "tap"));
            }}
            className={`relative flex shrink-0 items-center justify-center h-11 w-11 cursor-pointer rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-md shadow-blue-600/30 transition-all duration-200 ${
              isHolding ? "scale-90 ring-2 ring-purple-400 ring-offset-2 ring-offset-zinc-950" : "hover:scale-105 animate-pulse"
            }`}
            role="button"
            tabIndex={0}
            aria-label="Click or hold Refinzi Orb"
            title="Click for Tap mode, Hold for Blueprint mode"
          >
            <span className="text-base select-none">{activeMode === "tap" ? "⚡" : "🧠"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {activeMode === "tap" ? "Single Tap Active" : "300ms Hold Active"}
            </p>
            <p className="text-[11px] text-zinc-400 truncate">
              {activeMode === "tap"
                ? "Rebuilds active prompt in-place instantly"
                : "Synthesizes complete 5-block architecture"}
            </p>
          </div>
          <kbd className="inline-flex items-center font-mono text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-900/90 text-blue-300 border border-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.15)] ring-1 ring-white/10 shrink-0 select-none">
            Ctrl+Alt+Space
          </kbd>
        </div>

        {/* Dynamic Display Panel */}
        {activeMode === "tap" ? (
          <div className="w-full mt-3 rounded-xl border border-white/[0.07] bg-zinc-950/80 p-3 text-xs shadow-inner transition-all">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.05] mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Live In-Place Prompt Transformation
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Sub-200ms</span>
            </div>
            <div className="space-y-1.5">
              <div className="rounded-lg bg-zinc-900/60 p-2 border border-white/[0.04]">
                <span className="text-zinc-400 block mb-0.5 text-[9px] uppercase font-semibold">Raw User Highlight</span>
                <p className="text-zinc-300 font-mono text-[11px]">"cyberpunk sports car in rain"</p>
              </div>
              <div className="rounded-lg bg-blue-950/30 p-2 border border-blue-500/30">
                <span className="text-blue-300 block mb-0.5 text-[9px] uppercase font-semibold">Rebuilt Production Output</span>
                <p className="text-zinc-100 font-mono leading-relaxed text-[11px]">
                  "/imagine cinematic 35mm anamorphic wide tracking shot of hypercar in neon rain, raytraced reflections, volumetric mist --ar 16:9 --v 6.0"
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full mt-3 rounded-xl border border-white/[0.07] bg-zinc-950/80 p-3 text-xs shadow-inner transition-all">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.05] mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                <Layers className="h-3 w-3" /> 5-Block Architectural Spec
              </span>
              <span className="text-[10px] text-purple-300 font-mono">Cursor / GPT ready</span>
            </div>

            <div className="space-y-1">
              {BLUEPRINT_BLOCKS.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-md bg-zinc-900/50 border border-white/[0.04] px-2.5 py-1.5 text-[11px] text-zinc-200 font-medium hover:bg-zinc-850 hover:border-purple-500/30 transition-colors"
                >
                  <Icon className="h-3 w-3 shrink-0 text-purple-400" />
                  <span className="truncate">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function Hero({ onOpenOffer, onDownload, currency = SUPPORTED_CURRENCIES.USD, osType = "windows", onOpenNonWindows }) {
  const [wingetCopied, setWingetCopied] = useState(false);

  const copyWinget = () => {
    navigator.clipboard.writeText("winget install refinzi");
    setWingetCopied(true);
    setTimeout(() => setWingetCopied(false), 2000);
  };

  return (
    <section className="relative pt-6 pb-10 sm:pt-10 sm:pb-14" id="hero">
      <HeroGlows />

      <div className="relative mx-auto grid w-full max-w-[1160px] grid-cols-1 items-start gap-8 px-4 sm:px-6 lg:grid-cols-12">
        {/* Left column (7 cols on desktop, tightly composed and balanced) */}
        <div className="lg:col-span-7 flex flex-col items-start">
          {/* Top Muted Category Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium bg-white/[0.05] text-zinc-300 border border-white/[0.08]">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <span>Ambient Windows Prompt Layer • v2.0</span>
          </div>

          {/* H1 Headline — Pinpoint prompt from simple words transformation */}
          <h1 className="mt-3.5 text-3xl sm:text-4xl lg:text-[44px] font-black leading-[1.12] tracking-tight text-white">
            <span className="block text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]">
              Turn Simple Words Into Pinpoint, Master&#8209;Grade Prompts.
            </span>
            <span className="block mt-1 bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent font-black">
              In 2 Seconds. Anywhere in Windows.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-3.5 text-sm sm:text-base text-zinc-300 font-normal leading-relaxed max-w-xl">
            Type rough thoughts in <strong className="text-white font-semibold">any Windows app</strong>, tap the Orb or press <kbd className="font-mono text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-blue-300 border border-blue-500/30">Ctrl+Alt+Space</kbd>, and instantly get a pinpoint, client-grade prompt architecture calibrated for Claude, ChatGPT, Cursor &amp; Midjourney.
          </p>

          {/* 3 Core Bullets */}
          <div className="mt-4 space-y-2 text-xs sm:text-[13px] text-zinc-300">
            <div className="flex items-center gap-2.5">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                ✓
              </span>
              <span>
                <strong className="text-white font-semibold">Zero Prompting Skill Needed:</strong> Turns 3 messy words into complete 5-block architectures.
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                ✓
              </span>
              <span>
                <strong className="text-white font-semibold">100% Local DPAPI Privacy:</strong> Zero cloud logging, zero telemetry. Your data stays on your PC.
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                ✓
              </span>
              <span>
                <strong className="text-white font-semibold">Free Forever with BYOK:</strong> Unlimited rebuilds with your own free Gemini or DeepSeek API key.
              </span>
            </div>
          </div>

          {/* Action CTAs — One Clear Primary Winner, One Secondary Ghost */}
          <div className="mt-6 flex flex-col items-start gap-3 w-full">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Primary Solid Action (Clear Visual Winner) */}
              <Button
                size="lg"
                variant="primary"
                onClick={onDownload}
                className="group relative flex items-center justify-center font-bold text-sm sm:text-base px-7 py-3.5 shadow-xl shadow-blue-600/25 bg-blue-600 hover:bg-blue-500 text-white rounded-xl border border-blue-400/40 cursor-pointer transition-all transform hover:-translate-y-0.5 w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2 group-hover:translate-y-0.5 transition-transform" />
                <div className="flex flex-col items-start text-left">
                  <span>Download Free for Windows</span>
                  <span className="text-xs font-semibold text-blue-100 tracking-wide mt-0.5">v2.0.0 • 111.8 MB • 0/72 Clean on VirusTotal</span>
                </div>
              </Button>

              {/* Secondary Ghost Button + Satisfaction & Refund Policy Guarantee */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenOffer}
                  className="font-semibold text-xs sm:text-sm px-5 py-3.5 bg-transparent hover:bg-white/[0.06] text-zinc-100 border border-white/20 hover:border-white/30 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                  title="View Lifetime Pro Deal"
                >
                  <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                  <span>Get Lifetime Pro — {currency.currencyCode === "INR" ? "₹999" : currency.formattedPrice}</span>
                </button>
                <a
                  href="#pricing"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-colors shadow-sm"
                  title="14-Day 100% Money-Back Guarantee"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>14-Day Money-Back • Satisfaction Guaranteed</span>
                </a>
              </div>

              {/* Winget copy button */}
              <button
                type="button"
                onClick={copyWinget}
                title="Copy winget install command for PowerShell"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3.5 text-xs font-mono text-zinc-300 hover:text-white hover:border-white/20 transition-all cursor-pointer shadow-sm"
              >
                <span className="text-blue-400 font-bold">$</span>
                <span className="hidden sm:inline">winget</span>
                {wingetCopied ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-sans text-[11px] font-semibold">
                    <CheckCheck className="h-3.5 w-3.5" /> Copied
                  </span>
                ) : (
                  <Copy className="h-3.5 w-3.5 text-zinc-400" />
                )}
              </button>
            </div>

            {/* Prominent Recognized Technical Trust Badges Row */}
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
              <div
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-300 font-semibold shadow-sm"
                title="100% clean verified by VirusTotal across 72 antivirus engines"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>VirusTotal: 0/72 Clean</span>
              </div>
              <div
                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-blue-300 font-semibold shadow-sm"
                title="Windows hardware-backed DPAPI AES-256 local encryption"
              >
                <Lock className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                <span>Security: DPAPI AES-256</span>
              </div>
              <div
                className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-purple-300 font-semibold shadow-sm"
                title="100% local execution with zero cloud telemetry or storage"
              >
                <Check className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                <span>Privacy: Zero Cloud Logging</span>
              </div>
              <div
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-amber-300 font-semibold shadow-sm"
                title="Bring your own API keys with 0% token price markup"
              >
                <Zap className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Pricing: 0% Markup BYOK</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-900/80 px-2.5 py-1 text-zinc-200 font-medium shadow-sm">
                <Laptop className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                <span>Windows 10 &amp; 11 Native</span>
              </div>
            </div>

            {/* Mobile / Non-Windows Adaptive Notice */}
            {osType !== "windows" && (
              <div className="mt-2 rounded-xl bg-blue-950/40 border border-blue-500/30 p-2.5 text-xs text-blue-200 flex items-center justify-between gap-2 w-full max-w-xl">
                <span>📱 On phone or Mac? Send the Windows installer to your PC:</span>
                <button
                  type="button"
                  onClick={onOpenNonWindows}
                  className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Send to Email
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right column with Demo Frame (Clean macOS/Windows Glassmorphism Bezel) */}
        <div className="lg:col-span-5 w-full">
          <HeroVideoPlayer />
        </div>
      </div>
    </section>
  );
}

function HeroVideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="relative lg:justify-self-end w-full max-w-lg">
      <div className="rounded-2xl border border-white/[0.08] bg-[#121620] p-2.5 sm:p-3 shadow-2xl backdrop-blur-xl transition-all">
        {/* Window Header */}
        <div className="mb-2 flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-[11px] font-mono text-zinc-400 font-medium">Refinzi Live Demo · Windows 11</span>
          </div>
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause video demo" : "Play video demo"}
            className="text-[11px] text-zinc-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] px-2.5 py-0.5 rounded-full border border-white/[0.08] transition-all flex items-center gap-1 cursor-pointer"
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
        </div>

        {/* Video Container */}
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-white/[0.06]">
          <video
            ref={videoRef}
            src="/refinzi-demo.mp4"
            autoPlay
            loop
            muted
            playsInline
            controls
            preload="metadata"
            className="h-full w-full object-cover"
            title="Refinzi Live Workflow Demo in Windows"
            aria-label="Refinzi Live Workflow Demo in Windows"
          >
            <track kind="captions" srcLang="en" label="English captions" default />
          </video>
        </div>
        <p className="mt-2.5 text-center text-[11px] text-zinc-400 font-medium">
          <strong className="text-zinc-200">1-Click the Ambient Orb</strong> for instant in-place rebuild · <span className="text-zinc-400 font-mono text-[10px]">Ctrl+Alt+Space</span>
        </p>
      </div>
    </div>
  );
}

/* -------------------------------- trust bar ------------------------------- */

function TrustBar() {
  return (
    <section className="border-y border-white/[0.06] bg-[#0A0D14] py-5" id="trust">
      <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
        {/* Monochrome Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5 font-medium text-zinc-300">
            <Check className="h-3.5 w-3.5 text-zinc-400" /> Windows 10 &amp; 11 Native
          </span>
          <span className="text-zinc-700 hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5 font-medium text-zinc-300">
            <Check className="h-3.5 w-3.5 text-zinc-400" /> Local DPAPI (AES-256)
          </span>
          <span className="text-zinc-700 hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5 font-medium text-zinc-300">
            <Check className="h-3.5 w-3.5 text-zinc-400" /> 0/72 Clean on VirusTotal
          </span>
          <span className="text-zinc-700 hidden sm:inline">•</span>
          <a
            href="https://github.com/papada1472/refinzi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-medium text-zinc-300 hover:text-white transition-colors"
          >
            <span>⭐ Open on GitHub</span>
          </a>
        </div>

        {/* Model Compatibility Grid */}
        <div className="mt-4 pt-4 border-t border-white/[0.04] flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <span className="text-[11px] font-mono text-zinc-500 mr-2 uppercase tracking-wider">Engineered for:</span>
          {WORKSPACES.map(({ name, Logo }) => (
            <div
              key={name}
              className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] transition-colors hover:border-white/[0.12]"
            >
              <Logo className="h-3.5 w-3.5 text-zinc-400" />
              <span className="text-xs text-zinc-300 font-medium">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------- Live Interactive Playground Demo ----------------- */

function synthesizeCustomPrompt(input) {
  const text = (input || "").trim();
  if (!text) {
    return `Role: Principal AI Prompt & Systems Architect
Task: Transform rough thought into execution-grade production blueprint
1. System Objective: Specify exact boundaries, target audience, and success metrics.
2. Architecture Scaffolding: Structural breakdown, component token matrix, and step-by-step logic.
3. Strict Negative Constraints: Zero fluff, no filler adjectives, enforce production-ready precision.
Output: Formatted Markdown deliverables pack ready for 1-click execution.`;
  }

  const lower = text.toLowerCase();

  if (
    lower.includes("car") ||
    lower.includes("photo") ||
    lower.includes("render") ||
    lower.includes("art") ||
    lower.includes("shot") ||
    lower.includes("cinematic") ||
    lower.includes("image") ||
    lower.includes("portrait") ||
    lower.includes("landscape")
  ) {
    return `/imagine prompt: Cinematic 35mm anamorphic wide shot of ${text}, 8k resolution, photorealistic Octane render, raytraced volumetric lighting, high-contrast dynamic range, atmospheric depth of field, Cooke Anamorphic /i 35mm f/1.4 lens, Kodak Portra 400 color science --ar 16:9 --style raw --v 6.0 --q 2`;
  }

  if (
    lower.includes("video") ||
    lower.includes("drone") ||
    lower.includes("motion") ||
    lower.includes("camera") ||
    lower.includes("flight") ||
    lower.includes("animation") ||
    lower.includes("orbit")
  ) {
    return `[Camera: Smooth 360° orbital tracking crane descending from ceiling to subject eye-level]
Subject: ${text}
Motion Dynamics: Liquid velocity curves, realistic fluid drag, volumetric atmospheric particle glow.
Physics & Specs: 4K 60fps, IMAX 70mm lens clarity, zero jitter, cinematic color grade.`;
  }

  if (
    lower.includes("code") ||
    lower.includes("react") ||
    lower.includes("api") ||
    lower.includes("table") ||
    lower.includes("component") ||
    lower.includes("auth") ||
    lower.includes("fastapi") ||
    lower.includes("python") ||
    lower.includes("backend") ||
    lower.includes("frontend") ||
    lower.includes("database") ||
    lower.includes("landing")
  ) {
    return `Role: Principal Full-Stack Software Engineer & Architect
Task: Implement production-grade architecture for "${text}"
1. Architecture & Patterns: Clean modular component tree, strict TypeScript/typed contracts, zero layout shift.
2. State & Boundary Matrix: Optimistic updates, skeleton loaders, defensive error boundaries, ARIA 1.2 accessibility.
3. Edge Case Handling: Exponential backoff retry, rate-limit tolerance, full keyboard navigation.
Output: Complete, compiling code with zero placeholders or omissions, plus unit test specifications.`;
  }

  if (
    lower.includes("email") ||
    lower.includes("copy") ||
    lower.includes("marketing") ||
    lower.includes("sales") ||
    lower.includes("launch")
  ) {
    return `Role: Elite Direct-Response Copywriter & Conversion Strategist
Task: Craft high-converting conversion copy for "${text}"
Framework: 3-Phase Open Loop & Urgency Framework
• Phase 1: Agitate user workflow bottleneck + quantify hours/dollars lost
• Phase 2: Feature matrix mapped 1:1 to measurable business ROI
• Phase 3: Risk-reversal guarantee + overcoming top 3 technical objections
Constraints: 3 punchy subject lines (<42 chars), clear value anchors, single distinct CTA with UTMs.`;
  }

  return `Role: Senior Domain Expert & Principal Strategist
Task: Synthesize client-grade production blueprint for "${text}"
1. Objective & Success Metrics: Define clear deliverables, quantifiable milestones, and audience calibration.
2. Structural Scaffolding: 5-stage logical breakdown with component tree and action triggers.
3. Strict Negative Constraints: Zero generic AI filler, no passive buzzwords, enforce concise direct-action syntax.
Output: Structured, copy-paste ready Markdown pack calibrated for immediate execution.`;
}

function LiveDemoSection({ onDownload }) {
  const [selectedPreset, setSelectedPreset] = useState(DEMO_PRESETS[0]);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState("Build a responsive pricing table with annual discount toggle");
  const [customOutput, setCustomOutput] = useState(() =>
    synthesizeCustomPrompt("Build a responsive pricing table with annual discount toggle")
  );
  const [copied, setCopied] = useState(false);
  const [isRebuilding, setIsRebuilding] = useState(false);

  const activeRebuilt = isCustomMode ? customOutput : selectedPreset.rebuilt;
  const activeRaw = isCustomMode ? customInput : selectedPreset.raw;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeRebuilt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTriggerRebuild = () => {
    setIsRebuilding(true);
    setTimeout(() => {
      if (isCustomMode) {
        setCustomOutput(synthesizeCustomPrompt(customInput));
      }
      setIsRebuilding(false);
    }, 250);
  };

  const handleSelectPreset = (preset) => {
    setIsCustomMode(false);
    setSelectedPreset(preset);
    setIsRebuilding(true);
    setTimeout(() => setIsRebuilding(false), 200);
  };

  const handleSelectCustomSample = (sampleText) => {
    setIsCustomMode(true);
    setCustomInput(sampleText);
    setIsRebuilding(true);
    setTimeout(() => {
      setCustomOutput(synthesizeCustomPrompt(sampleText));
      setIsRebuilding(false);
    }, 200);
  };

  return (
    <section className="py-12 sm:py-16 relative overflow-hidden bg-gradient-to-b from-transparent via-blue-950/10 to-transparent" id="demo">
      <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <Badge variant="outline" className="text-blue-400 border-blue-500/30 bg-blue-950/30 text-xs">
              ⚡ AI Architecture &amp; System Specs
            </Badge>
            <h2 className="mt-2.5 text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              AI Prompt Transformation Presets &amp; System Specs
            </h2>
            <p className="mt-2 text-zinc-200 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
              Explore production-tested system prompt blueprints engineered specifically for each AI architecture. Select a model engine preset or type your own rough prompt to watch it rebuild in real time.
            </p>
            {/* Total Product Count to gauge tool scale */}
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/[0.04] border border-white/[0.1] px-3.5 py-1 text-xs text-zinc-200 font-mono shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span><strong className="text-blue-400">5</strong> AI Engine Presets</span>
              <span className="text-zinc-500">•</span>
              <span><strong className="text-emerald-400">16</strong> Production Blueprints Available</span>
            </div>
          </div>
        </Reveal>

        {/* Model Selector Tabs + Custom Mode */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {DEMO_PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isSelected = !isCustomMode && selectedPreset.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 border border-white/20 scale-105"
                    : "bg-zinc-900/80 text-zinc-400 border border-white/[0.08] hover:text-white hover:border-zinc-700"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {preset.label}
              </button>
            );
          })}

          {/* Dedicated Custom Prompt Mode Tab */}
          <button
            onClick={() => {
              setIsCustomMode(true);
              handleTriggerRebuild();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isCustomMode
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/25 border border-purple-400/40 scale-105"
                : "bg-zinc-900/80 text-zinc-300 border border-purple-500/30 hover:text-white hover:border-purple-500/50"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>✨ Test Your Own Prompt</span>
          </button>
        </div>

        {/* Secondary Sub-Categorization Depth (Surface specific versions & styles directly) */}
        {!isCustomMode && selectedPreset.subStyles && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 animate-in fade-in duration-200">
            <span className="text-[11px] text-zinc-400 font-semibold">Sub-Styles &amp; Versions:</span>
            {selectedPreset.subStyles.map((style) => (
              <span
                key={style}
                className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-[11px] font-medium text-blue-300 shadow-sm"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                {style}
              </span>
            ))}
          </div>
        )}

        {/* Concise How-To / Workflow Inspiration Card */}
        <div className="mt-5 mx-auto max-w-2xl rounded-xl border border-white/10 bg-zinc-900/70 p-3.5 text-xs text-zinc-200 shadow-md backdrop-blur-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-base select-none">💡</span>
            <div>
              <span className="font-bold text-white block text-xs">How-To Workflow Guide:</span>
              <p className="text-[11px] text-zinc-300 mt-0.5 leading-relaxed">
                1. Type rough thoughts anywhere in Windows → 2. Tap the floating Orb (or press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-blue-300 font-mono text-[10px] border border-zinc-700">Ctrl+Alt+Space</kbd>) → 3. Refinzi injects role, constraints &amp; parameters in 2 seconds.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Comparison Box */}
        <Reveal delay={80}>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch relative">
            {/* Left: Input Box */}
            <Card className="luxury-surface flex flex-col justify-between p-4 sm:p-5 border-white/[0.08]">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                    Before: Rough Thought
                  </span>
                  <Badge variant="muted" className="text-[10px]">
                    {isCustomMode ? "Interactive Input" : "Vague Prompt"}
                  </Badge>
                </div>

                {isCustomMode ? (
                  <div className="mt-3 space-y-2.5">
                    <label htmlFor="custom-prompt-input" className="sr-only">Type your rough prompt</label>
                    <textarea
                      id="custom-prompt-input"
                      rows={3}
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Type any raw prompt... e.g. FastAPI JWT auth or Cyberpunk street photo"
                      className="w-full rounded-xl bg-zinc-950/90 p-3 border border-purple-500/30 font-mono text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                    />

                    {/* Quick suggestion tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-zinc-400 font-semibold">Try sample:</span>
                      {[
                        "FastAPI JWT auth backend",
                        "Cyberpunk sports car in neon rain",
                        "High-converting SaaS pricing table",
                        "Cold email sequence for B2B",
                      ].map((sample) => (
                        <button
                          key={sample}
                          type="button"
                          onClick={() => handleSelectCustomSample(sample)}
                          className="rounded-md bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-300 border border-white/[0.08] hover:border-purple-500/40 hover:text-white transition-colors cursor-pointer"
                        >
                          {sample}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3">
                    <div className="rounded-xl bg-zinc-950/80 p-3 border border-red-500/20 font-mono text-xs text-zinc-300 break-words">
                      "{selectedPreset.raw}"
                    </div>
                    <p className="mt-2.5 text-xs text-zinc-400 leading-relaxed">
                      ⚠️ <strong>Without Refinzi:</strong> AI models generate generic fluff, requiring 5–10 frustrating re-prompts and wasted API tokens.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                {isCustomMode ? (
                  <Button
                    size="xs"
                    variant="deal"
                    onClick={handleTriggerRebuild}
                    className="font-bold text-xs"
                  >
                    <Sparkles className="h-3 w-3 mr-1 text-amber-300" />
                    ⚡ Rebuild Prompt (Instant)
                  </Button>
                ) : (
                  <>
                    <span className="text-[11px] text-zinc-400">Windows Shortcut:</span>
                    <kbd className="bg-zinc-900 text-blue-400 font-mono text-xs px-2 py-0.5 rounded border border-zinc-700">
                      Ctrl + Alt + Space
                    </kbd>
                  </>
                )}
              </div>
            </Card>

            {/* Right: Rebuilt Output Box */}
            <Card className="luxury-surface-glow relative flex flex-col justify-between p-4 sm:p-5 border-blue-500/30">
              <Badge className="absolute -top-2.5 right-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[10px]">
                {isCustomMode ? "5-Block Custom Spec" : selectedPreset.stats}
              </Badge>

              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-blue-500/20">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                      After: Rebuilt {isCustomMode ? "Production Blueprint" : `${selectedPreset.label} Spec`}
                    </span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] text-zinc-200 hover:text-white bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1 rounded-lg border border-white/[0.1] transition-all cursor-pointer"
                  >
                    {copied ? <CheckCheck className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? "Copied!" : "Copy Prompt"}</span>
                  </button>
                </div>

                <div className={`mt-3 rounded-xl bg-zinc-950/90 p-3.5 border border-blue-500/30 font-mono text-xs text-zinc-100 whitespace-pre-wrap leading-relaxed max-h-52 overflow-y-auto break-words ${isRebuilding ? "opacity-50 animate-pulse" : ""}`}>
                  {activeRebuilt}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-blue-500/20 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> 1st-Try Output Guarantee
                </span>
                <span className="text-[10px] text-zinc-400">Generated in 1-click (&lt;2s)</span>
              </div>
            </Card>
          </div>

          {/* Direct In-Demo Conversion CTA */}
          <div className="mt-6 rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/50 via-zinc-900/90 to-blue-950/50 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                <span className="text-lg">⚡</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Want this 1-click transformation anywhere in Windows?</h4>
                <p className="text-xs text-zinc-300">Highlight rough text in Discord, Cursor, ChatGPT, or Slack and click the floating Orb.</p>
              </div>
            </div>
            <Button
              variant="primary"
              size="default"
              onClick={onDownload}
              className="font-bold text-xs sm:text-sm shrink-0 shadow-lg shadow-blue-500/20 px-5 py-2.5"
            >
              <Download className="h-4 w-4 mr-1.5" />
              Download Free (.exe)
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------ mechanism --------------------------------- */

function Mechanism() {
  const STEPS = [
    {
      icon: MousePointer,
      title: "1. Highlight your rough idea",
      body: "Type whatever is in your head in ChatGPT, Discord, Cursor, or Slack. Then highlight it.",
    },
    {
      icon: Zap,
      title: "2. 1-Click the floating Orb",
      body: "Click the glowing Orb that appears right at your cursor (or press Ctrl+Alt+Space).",
    },
    {
      icon: Layers,
      title: "3. Done in 2 seconds",
      body: "Refinzi replaces your text in-place with a production-grade prompt. Zero copy-pasting.",
    },
  ];

  return (
    <section className="py-12 sm:py-16 border-t border-white/[0.06] bg-zinc-950/30" id="features">
      <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
        <Reveal>
          <div className="text-center max-w-xl mx-auto">
            <Badge variant="outline" className="text-blue-400 border-blue-500/30">⚡ How It Works</Badge>
            <h2 className="mt-2.5 text-2xl sm:text-3xl font-bold tracking-tight text-white">
              3 Steps. 2 Seconds. Zero Copy-Pasting.
            </h2>
            <p className="mt-1.5 text-zinc-400 text-xs sm:text-sm">
              No browser extensions. No tab switching. Just highlight, click, and get better answers.
            </p>
          </div>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }, index) => (
            <Reveal key={title} delay={index * 70}>
              <Card className="luxury-surface group h-full p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 ring-1 ring-blue-500/20">
                    <Icon className="h-4 w-4 text-blue-400 transition-transform group-hover:scale-110" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-zinc-500">
                    STEP {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-zinc-100">{title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">{body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- blueprint detail ----------------------------- */

function Blueprint({ onDownload }) {
  return (
    <section className="border-t border-white/[0.06] bg-zinc-950/50 py-12 sm:py-16" id="blueprint">
      <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
        <Reveal>
          <div className="text-center max-w-xl mx-auto">
            <Badge variant="outline" className="text-purple-400 border-purple-500/30 bg-purple-950/20">
              🧠 5-Block Blueprint Engine
            </Badge>
            <h2 className="mt-2.5 text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Need an entire system spec? Hold for 300ms.
            </h2>
            <p className="mt-1.5 text-zinc-400 text-xs sm:text-sm">
              When 1-line improvements aren't enough, hold the Orb to generate full 5-block architectural scaffolding.
            </p>
          </div>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BLUEPRINT_DETAILS.map(({ icon: Icon, title, desc }, index) => (
            <Reveal key={title} delay={index * 60} className="h-full">
              <Card className="luxury-surface group h-full p-4 sm:p-5">
                <div className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 ring-1 ring-purple-500/20">
                  <Icon className="h-4 w-4 text-purple-400 transition-transform group-hover:scale-110" />
                </div>
                <h3 className="text-sm font-bold text-zinc-100">{title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">{desc}</p>
              </Card>
            </Reveal>
          ))}

          {/* Mini-CTA Card */}
          <Reveal delay={BLUEPRINT_DETAILS.length * 60} className="h-full">
            <Card className="luxury-surface-glow relative flex h-full flex-col justify-between overflow-hidden p-4 sm:p-5">
              <div>
                <Sparkles className="h-5 w-5 text-purple-400" />
                <h3 className="mt-2.5 text-sm font-bold text-white">
                  Model-Calibrated Output
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-zinc-300">
                  Every output is tuned for the exact context window of ChatGPT, Midjourney, Higgsfield, Gemini, Cursor or Claude.
                </p>
              </div>
              <Button variant="primary" onClick={onDownload} size="xs" className="mt-3 w-full">
                <Download className="h-3 w-3" />
                Try Free On Windows
              </Button>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- use cases -------------------------------- */

function UseCases() {
  return (
    <section className="py-12 sm:py-16 border-t border-white/[0.06]" id="use-cases">
      <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
        <Reveal>
          <div className="text-center max-w-xl mx-auto">
            <Badge variant="outline">🎯 Creative & Technical Workflows</Badge>
            <h2 className="mt-2.5 text-2xl sm:text-3xl font-bold tracking-tight text-white">
              One Ambient Shortcut, Endless Workflows
            </h2>
            <p className="mt-1.5 text-zinc-400 text-xs sm:text-sm">
              From photorealistic Midjourney art to complex fullstack Cursor architecture.
            </p>
          </div>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {USE_CASES.map(({ icon: Icon, title, body, tag }, index) => (
            <Reveal key={title} delay={index * 60} className="h-full">
              <Card className="luxury-surface group flex h-full flex-col justify-between p-5">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 ring-1 ring-blue-500/20">
                      <Icon className="h-4 w-4 text-blue-400 transition-transform group-hover:scale-110" />
                    </div>
                    <Badge variant="muted" className="text-[10px]">{tag}</Badge>
                  </div>
                  <h3 className="mt-3 text-sm sm:text-base font-bold text-zinc-100">{title}</h3>
                  <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-zinc-400">{body}</p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- Social Proof ----------------------------- */

function Testimonials() {
  return (
    <section className="py-14 sm:py-18 border-t border-white/[0.06] bg-[#0A0D14]" id="testimonials">
      <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
        <Reveal>
          <div className="text-center max-w-xl mx-auto">
            <Badge variant="outline" className="text-zinc-300 border-white/[0.1] bg-white/[0.04]">
              Community Feedback &amp; Ratings
            </Badge>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Loved by builders who refuse to waste time.
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-zinc-300">
              Used daily by engineers, copywriters, and founders across Windows.
            </p>
            {/* Aggregate Rating Summary Banner */}
            <div className="mt-3.5 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-300 shadow-sm">
              <span className="text-amber-400 select-none text-sm leading-none">★★★★★</span>
              <span>Rated 4.9/5 by 100+ builders across Windows</span>
            </div>
          </div>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {TESTIMONIALS.map((t, idx) => (
            <Reveal key={t.name} delay={idx * 60} className="h-full">
              <Card className="h-full flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-[#121620] border border-white/[0.07] hover:border-white/[0.12] transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1 text-amber-400 text-xs">
                      {"★".repeat(t.rating)}
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      ✓ {t.verified}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-blue-400 mb-2 uppercase tracking-wide">
                    "{t.highlight}"
                  </p>
                  <p className="text-xs text-zinc-200 leading-relaxed font-normal">
                    "{t.text}"
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-2.5 pt-3.5 border-t border-white/[0.06]">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    width="36"
                    height="36"
                    className="h-9 w-9 rounded-full object-cover ring-1 ring-white/10"
                    loading="lazy"
                    decoding="async"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-white leading-tight">{t.name}</h3>
                    <p className="text-[10px] text-zinc-400 leading-tight mt-0.5">{t.role} · {t.company}</p>
                  </div>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>

        {/* User-Generated Visual Product Context Gallery Strip */}
        <Reveal delay={120}>
          <div className="mt-10 rounded-2xl border border-white/[0.08] bg-zinc-900/40 p-5 sm:p-6 backdrop-blur-md shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-white/[0.06] pb-3">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <span>⚡ Real-World Product Usage Workflows</span>
                  <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">Desktop In-Action</span>
                </h4>
                <p className="text-[11px] text-zinc-300 mt-0.5">How engineers and creators invoke Refinzi across native Windows software</p>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">0 Context-Switching</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-zinc-950/80 border border-white/[0.08] p-3 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-blue-400 flex items-center gap-1">
                  <TerminalSquare className="h-3 w-3" /> Inside Cursor / VS Code
                </span>
                <p className="text-xs text-zinc-200 font-mono">"FastAPI JWT cookie auth spec"</p>
                <p className="text-[10px] text-emerald-400 font-medium">→ Full 5-block schema &amp; endpoints synthesized in 1.8s</p>
              </div>
              <div className="rounded-xl bg-zinc-950/80 border border-white/[0.08] p-3 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-purple-400 flex items-center gap-1">
                  <Camera className="h-3 w-3" /> Inside Discord / Midjourney
                </span>
                <p className="text-xs text-zinc-200 font-mono">"Neo-tokyo cyberpunk hypercar"</p>
                <p className="text-[10px] text-emerald-400 font-medium">→ 35mm anamorphic Cooke lens, f/1.4 Octane 8k render</p>
              </div>
              <div className="rounded-xl bg-zinc-950/80 border border-white/[0.08] p-3 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                  <PenLine className="h-3 w-3" /> Inside Slack / Claude
                </span>
                <p className="text-xs text-zinc-200 font-mono">"Q3 roadmap stakeholder memo"</p>
                <p className="text-[10px] text-emerald-400 font-medium">→ Executive 3-tier open loop with quantifiable ROI</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------- pricing --------------------------------- */

function Pricing({ onOpenOffer, onDownload, currency = SUPPORTED_CURRENCIES.USD, onSelectCurrency, detectedCountry = "" }) {
  return (
    <section className="py-14 sm:py-20 border-t border-white/[0.06] relative" id="pricing">
      <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto flex flex-col items-center">
            <Badge variant="outline" className="mb-3 text-zinc-300 border-white/[0.1] bg-white/[0.04]">
              Simple, Transparent Pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Pay Once. Own Your Time Forever.
            </h2>
            <p className="mt-3 text-zinc-400 text-sm sm:text-base leading-relaxed">
              No recurring monthly subscriptions. Use Refinzi free forever with your own API key, or unlock Pro with a one-time coffee purchase.
            </p>

            {/* Segmented Control Currency Switcher with Distinct Active State Highlight */}
            <div className="mt-5 inline-flex items-center p-1.5 rounded-full bg-zinc-900 border-2 border-white/15 shadow-lg">
              <button
                type="button"
                onClick={() => onSelectCurrency && onSelectCurrency("INR")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  currency.currencyCode === "INR"
                    ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-400 border border-blue-300"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                ₹ INR
              </button>
              <button
                type="button"
                onClick={() => onSelectCurrency && onSelectCurrency("USD")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  currency.currencyCode === "USD"
                    ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-400 border border-blue-300"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                $ USD
              </button>
            </div>
          </div>
        </Reveal>

        {/* Pricing Cards — Equal Height 2-Column Grid */}
        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* CARD 1: FREE / DEVELOPER (BYOK) */}
          <Card className="flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-[#121620] border border-white/[0.08] h-full transition-all hover:border-white/[0.14]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 bg-white/[0.08] border border-white/[0.12] px-2.5 py-0.5 rounded-full">
                  Free Forever
                </span>
                <span className="text-xs font-mono text-zinc-400 font-semibold">BYOK</span>
              </div>

              <h3 className="text-xl font-bold text-white">Free / BYOK</h3>
              <p className="text-xs text-zinc-300 mt-1">For developers &amp; power users bringing their own keys.</p>

              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold text-white">{currency.symbol}0</span>
                <span className="text-xs text-zinc-400 font-medium">/ forever</span>
              </div>

              <div className="my-6 border-t border-white/[0.06]" />

              <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 font-semibold mb-3">
                Included Features:
              </div>
              <ul className="space-y-3 text-xs">
                <li className="flex items-start gap-2.5 text-zinc-200">
                  <Check className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                  <span>Bring your own API keys (Gemini, DeepSeek, OpenRouter)</span>
                </li>
                <li className="flex items-start gap-2.5 text-zinc-200">
                  <Check className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                  <span>Direct local API routing with 0% token markup</span>
                </li>
                <li className="flex items-start gap-2.5 text-zinc-200">
                  <Check className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                  <span>Full 5-Block Blueprint architecture synthesis</span>
                </li>
                <li className="flex items-start gap-2.5 text-zinc-200">
                  <Check className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                  <span>100% On-device privacy (Windows DPAPI AES-256)</span>
                </li>
                {/* Legible Excluded Features with High Contrast */}
                <li className="flex items-start gap-2.5 text-zinc-400 line-through font-medium opacity-85">
                  <X className="h-4 w-4 shrink-0 text-zinc-500 mt-0.5" />
                  <span>Zero-setup managed AI routing</span>
                </li>
                <li className="flex items-start gap-2.5 text-zinc-400 line-through font-medium opacity-85">
                  <X className="h-4 w-4 shrink-0 text-zinc-500 mt-0.5" />
                  <span>VIP Discord &amp; weekly prompt engineering breakdowns</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-white/[0.06]">
              {/* Primary High-Contrast CTA Button */}
              <Button
                variant="primary"
                size="default"
                onClick={onDownload}
                className="w-full font-bold text-sm py-3 bg-zinc-800 hover:bg-zinc-700 text-white border-2 border-white/20 shadow-md cursor-pointer"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Free Now (.exe)
              </Button>
              <p className="text-[11px] text-zinc-400 text-center mt-2 font-mono">
                Windows 10 &amp; 11 • Portable &amp; Clean
              </p>
            </div>
          </Card>

          {/* CARD 2: REFINZI PRO (Elevated border & badge inside top padding) */}
          <Card className="flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-[#121620] border-2 border-blue-500/50 shadow-xl shadow-blue-500/10 h-full relative">
            <div>
              {/* Badge positioned strictly inside card top padding */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/25 px-2.5 py-0.5 rounded-full">
                  ⚡ Most Popular
                </span>
                <span className="text-xs font-semibold line-through text-zinc-400 font-mono bg-white/[0.04] px-2 py-0.5 rounded">
                  {currency.currencyCode === "INR" ? "₹3,999 Value" : "$97 Value"}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white">Lifetime Pro</h3>
              <p className="text-xs text-zinc-300 mt-1">Zero setup required. Ready to use out of the box.</p>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white">
                  {currency.currencyCode === "INR" ? "₹999" : currency.formattedPrice}
                </span>
                <span className="text-xs text-zinc-300 font-semibold">one-time</span>
                <span className="text-[10px] text-emerald-400 font-medium bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                  ~Cost of 2 coffees
                </span>
              </div>

              <div className="my-6 border-t border-white/[0.08]" />

              <div className="text-[11px] font-mono uppercase tracking-wider text-blue-400 font-semibold mb-3">
                Everything in Free, plus:
              </div>
              <ul className="space-y-3 text-xs">
                <li className="flex items-start gap-2.5 text-zinc-200">
                  <Check className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" />
                  <span><strong>Zero-Setup AI Routing:</strong> Start refining instantly without API keys</span>
                </li>
                <li className="flex items-start gap-2.5 text-zinc-200">
                  <Check className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" />
                  <span><strong>Cloud Sync Presets:</strong> Save client templates and sync across devices</span>
                </li>
                <li className="flex items-start gap-2.5 text-zinc-200">
                  <Check className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" />
                  <span><strong>Lifetime Updates:</strong> All future Windows, Mac &amp; Linux versions</span>
                </li>
                <li className="flex items-start gap-2.5 text-zinc-200">
                  <Check className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" />
                  <span><strong>VIP Discord &amp; Newsletter:</strong> Proven prompt frameworks from top builders</span>
                </li>
                <li className="flex items-start gap-2.5 text-zinc-200">
                  <Check className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" />
                  <span><strong>Priority Founder Support:</strong> Direct WhatsApp &amp; email access</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-white/[0.08]">
              {/* Relocated Guarantee Badge right at decision point */}
              <div className="mb-3 flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 py-1.5 px-3 text-xs font-semibold text-emerald-300 shadow-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>14-Day 100% Satisfaction &amp; Money-Back Guarantee</span>
              </div>

              {/* Primary High-Contrast Call-to-Action */}
              <Button
                variant="deal"
                size="default"
                onClick={onOpenOffer}
                className="w-full text-sm font-extrabold py-3.5 bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/30 border border-blue-400/40 cursor-pointer"
              >
                <Sparkles className="h-4 w-4 mr-2 text-amber-300" />
                Buy Lifetime Pro Now — {currency.currencyCode === "INR" ? "₹999" : currency.formattedPrice}
              </Button>

              {/* Trust & Security Badges near pricing */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[11px] text-zinc-300 font-medium">
                <span className="flex items-center gap-1"><Lock className="h-3 w-3 text-emerald-400" /> 256-Bit SSL</span>
                <span className="text-zinc-600">•</span>
                <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-amber-400" /> Instant License Key</span>
                <span className="text-zinc-600">•</span>
                <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-blue-400" /> Verified Checkout</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Guarantee Banner (Visually Prominent Accent Container) */}
        <div className="mt-10 max-w-4xl mx-auto rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-zinc-900/90 to-blue-950/40 p-5 sm:p-6 shadow-xl shadow-emerald-950/20">
          <div className="flex items-center gap-2.5 text-white font-bold text-sm sm:text-base mb-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span>The 14-Day 10-Hour Time-Save Guarantee</span>
          </div>
          <p className="text-zinc-200 leading-relaxed text-xs sm:text-sm font-normal">
            Try Refinzi Pro for 14 days. If it doesn't save you at least 10 hours of re-prompting and administrative friction, simply email the founder. You'll receive a 100% prompt refund with no hard feelings.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- faq ----------------------------------- */

function FAQ() {
  return (
    <section className="py-12 sm:py-16 bg-zinc-950/40 border-t border-white/[0.06]" id="faq">
      <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
        <Reveal>
          <div className="text-center max-w-xl mx-auto">
            <Badge variant="outline">FAQ</Badge>
            <h2 className="mt-2.5 text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Frequently Asked Questions
            </h2>
          </div>
        </Reveal>

        <Accordion className="mx-auto mt-8 max-w-2xl">
          {FAQS.map(({ question, answer }) => (
            <AccordionItem key={question} question={question} answer={answer} />
          ))}
        </Accordion>

        {/* Escalation Path for Unanswered Inquiries */}
        <div className="mt-8 mx-auto max-w-2xl rounded-2xl border border-blue-500/30 bg-blue-950/25 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg backdrop-blur-sm">
          <div className="text-center sm:text-left">
            <h4 className="text-sm font-bold text-white">Have a unique question not listed above?</h4>
            <p className="text-xs text-zinc-200 mt-0.5">Chat directly with the founder on WhatsApp or send a message to engineering.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://wa.me/919971271291?text=Hi%20Rahul,%20I'm%20reaching%20out%20about%20Refinzi!"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 transition-colors shadow-sm"
            >
              <span>Chat on WhatsApp</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- final CTA + footer --------------------------- */

function FinalCTA({ onOpenOffer, onDownload, currency = SUPPORTED_CURRENCIES.USD, osType = "windows", onOpenNonWindows }) {
  return (
    <section className="relative py-12 sm:py-16 text-center border-t border-white/[0.06]" id="download">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[110px]"
      />
      <div className="relative mx-auto max-w-[1140px] px-4 sm:px-6">
        <Reveal>
          <Badge variant="outline" className="text-blue-400 border-blue-500/30 mb-2.5">
            🚀 Ready in 2 Seconds
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Your AI Deserves Better Prompts.
          </h2>
          <p className="mt-2.5 text-xs sm:text-sm text-zinc-300 max-w-lg mx-auto leading-relaxed">
            Get flawless outputs from ChatGPT, Midjourney, Higgsfield, Gemini & Cursor — on the very first try.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              variant="primary"
              onClick={onDownload}
              className="font-bold shadow-lg shadow-blue-500/20"
            >
              <Download className="h-4 w-4 mr-1.5" />
              Download Free for Windows (.exe)
            </Button>

            <Button
              variant="deal"
              size="lg"
              onClick={onOpenOffer}
            >
              <Flame className="h-4 w-4 mr-1.5" />
              Claim Lifetime Pro — {currency.formattedPrice}
            </Button>
          </div>

          <p className="mt-3 text-[11px] text-zinc-400">
            Windows 10 & 11 (64-bit) · 111.8 MB · Code-verified & VirusTotal clean (0/72) · Direct instant download
          </p>
        </Reveal>
      </div>
    </section>
  );
}



function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisible = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", toggleVisible, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisible);
  }, []);

  const scrollToTop = () => {
    trackEvent("scroll_to_top_clicked");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top of page"
      title="Back to Top"
      className="fixed bottom-6 right-6 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-zinc-900/90 text-white shadow-xl backdrop-blur-md transition-all hover:scale-105 hover:border-blue-500/50 hover:bg-blue-600/30 active:scale-95 cursor-pointer"
    >
      <ArrowUp className="h-4 w-4 text-blue-400" />
    </button>
  );
}

function Footer({ onNavigate }) {
  return (
    <footer className="border-t border-white/[0.06] pt-8 pb-28 sm:pb-24 bg-[#08090c] text-zinc-400 text-[11px]" id="contact">
      <div className="mx-auto flex max-w-[1140px] flex-col justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-end">
        <div className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2">
            <img
              src="/branding/logo-mark.webp"
              alt="Refinzi"
              width="24"
              height="24"
              loading="lazy"
              decoding="async"
              className="h-6 w-6 rounded-md object-contain shadow-sm"
            />
            <span className="font-bold text-zinc-200 text-sm">Refinzi <span className="text-[10px] text-blue-400 font-semibold bg-blue-500/10 px-1 rounded">2.0</span></span>
            <span className="text-zinc-400 text-xs">— Ambient Windows prompt layer</span>
          </div>
          <RequestAiSummary />
        </div>
        <div className="flex flex-col items-start md:items-end gap-2">
          <nav aria-label="Footer Navigation" className="flex flex-wrap items-center gap-4 text-zinc-400">
            <a
              href="/privacy/"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("privacy", "/privacy");
              }}
              className="hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Privacy Policy
            </a>
            <a
              href="/terms/"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("terms", "/terms");
              }}
              className="hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Terms & Refund
            </a>
            <a
              href="/docs/"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("docs", "/docs");
              }}
              className="hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Documentation
            </a>
            <a
              href="#founder"
              className="hover:text-zinc-200 transition-colors cursor-pointer"
            >
              About Creator
            </a>
            <a
              href="https://github.com/papada1472/refinzi"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-200 transition-colors"
            >
              GitHub Source
            </a>
            <a
              href="mailto:contact@refinzi.com"
              className="hover:text-zinc-200 transition-colors font-medium flex items-center gap-1 text-zinc-300 hover:text-white"
            >
              <span>Email:</span>
              <span className="text-[10px] text-blue-400 font-mono">contact@refinzi.com</span>
            </a>
          </nav>
          <p className="text-[10px] text-zinc-400">
            © 2026 Refinzi. Built by Rahul Mangla. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ---------------------------------- app ----------------------------------- */

function detectClientOS() {
  if (typeof window === "undefined" || !navigator) return "windows";
  const ua = navigator.userAgent || navigator.vendor || window.opera || "";
  const platform = navigator.platform || "";
  if (/iPad|iPhone|iPod/.test(ua) || (platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "ios";
  if (/android/i.test(ua)) return "android";
  if (/Macintosh|Mac OS X/i.test(ua) || platform.startsWith("Mac")) return "mac";
  if (/Linux/i.test(ua) || platform.startsWith("Linux")) return "linux";
  return "windows";
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("refinzi_theme") || "dark";
    }
    return "dark";
  });

  const handleToggleTheme = (newTheme) => {
    setTheme(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("refinzi_theme", newTheme);
      document.documentElement.classList.toggle("light", newTheme === "light");
    }
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("light", theme === "light");
    }
  }, [theme]);

  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname.toLowerCase();
      if (path.includes("privacy")) return "privacy";
      if (path.includes("terms")) return "terms";
      if (path.includes("docs")) return "docs";
    }
    return "home";
  });

  const [currency, setCurrency] = useState(() => detectLocalCurrencyOffline().currency);
  const [detectedCountry, setDetectedCountry] = useState(() => detectLocalCurrencyOffline().country);
  const [osType, setOsType] = useState(() => detectClientOS());
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isPaypalModalOpen, setIsPaypalModalOpen] = useState(false);
  const [isDownloadToastOpen, setIsDownloadToastOpen] = useState(false);
  const [isNonWindowsModalOpen, setIsNonWindowsModalOpen] = useState(false);

  const handleNavigate = (page, path) => {
    setCurrentPage(page);
    trackEvent("page_navigated", { page, path });
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", path);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.includes("privacy")) setCurrentPage("privacy");
      else if (path.includes("terms")) setCurrentPage("terms");
      else if (path.includes("docs")) setCurrentPage("docs");
      else setCurrentPage("home");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    initAnalytics();
    initPerformanceMonitoring();
    trackEvent("page_view", { os: osType });

    detectCountryAndCurrencyAsync().then((res) => {
      if (res && res.currency) {
        setCurrency(res.currency);
        setDetectedCountry(res.country);
        trackEvent("geo_currency_detected", {
          country: res.country,
          countryCode: res.countryCode,
          currency: res.currency.code,
        });
      }
    });
  }, [osType]);

  const GITHUB_DOWNLOAD_URL = "https://github.com/papada1472/refinzi/releases/download/v2.0.0/Refinzi-Setup-v2.0.0.exe";
  const EDGE_DOWNLOAD_ROUTE = "/download/windows/";
  const SETUP_FILE_NAME = "Refinzi-Setup-v2.0.0.exe";

  const handleTriggerDownload = (source = "unknown") => {
    setIsDownloadToastOpen(true);

    // Track standard GA4 file_download event client-side
    trackFileDownload({
      fileName: SETUP_FILE_NAME,
      fileExtension: "exe",
      linkUrl: GITHUB_DOWNLOAD_URL,
      source,
      linkText: "Download Free (.exe)",
    });

    // Retain existing event for continuity
    trackEvent("download_initiated", { platform: "windows", source, os: osType });

    // Download via Edge Redirector route (allows Cloudflare Edge Worker to log server-side telemetry & 302 redirect)
    const downloadEndpoint = `${EDGE_DOWNLOAD_ROUTE}?source=${encodeURIComponent(source)}`;
    const link = document.createElement("a");
    link.href = downloadEndpoint;
    link.setAttribute("download", SETUP_FILE_NAME);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleForceWindowsDownload = () => {
    handleTriggerDownload("non_windows_modal_override");
  };

  const handleOpenCheckout = (source = "unknown") => {
    setIsOfferModalOpen(false);
    setIsPaypalModalOpen(true);
    trackEvent("checkout_opened", { source, currency: currency.code });
  };

  const handleSelectCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    trackEvent("currency_manually_switched", { currency: newCurrency.code });
  };

  if (currentPage === "privacy") {
    return <PrivacyPage onNavigateHome={() => handleNavigate("home", "/")} />;
  }

  if (currentPage === "terms") {
    return <TermsPage onNavigateHome={() => handleNavigate("home", "/")} />;
  }

  if (currentPage === "docs") {
    return (
      <DocsPage
        onNavigateHome={() => handleNavigate("home", "/")}
        onDownload={() => handleTriggerDownload("docs_page")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#08090c] font-sans text-zinc-50 selection:bg-blue-500/30 selection:text-white pb-10 sm:pb-0">
      <OrbCursor />
      <CookieBanner />
      <Navbar
        currency={currency}
        osType={osType}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenOffer={() => handleOpenCheckout("navbar")}
        onDownload={() => handleTriggerDownload("navbar")}
      />
      <main id="main-content" className="pb-24">
        <Hero
          currency={currency}
          osType={osType}
          onOpenOffer={() => handleOpenCheckout("hero")}
          onDownload={() => handleTriggerDownload("hero")}
          onOpenNonWindows={() => setIsNonWindowsModalOpen(true)}
        />
        <TrustBar />
        <LiveDemoSection onDownload={() => handleTriggerDownload("demo")} />
        <Mechanism />
        <Blueprint onDownload={() => handleTriggerDownload("blueprint")} />
        <UseCases />
        <RefinziComparison />
        <Pricing
          currency={currency}
          detectedCountry={detectedCountry}
          onSelectCurrency={handleSelectCurrency}
          onOpenOffer={() => handleOpenCheckout("pricing")}
          onDownload={() => handleTriggerDownload("pricing")}
        />
        <FounderSection />
        <Testimonials />
        <FAQ />
        <DirectFeedbackSection />
        <FinalCTA
          currency={currency}
          osType={osType}
          onOpenOffer={() => handleOpenCheckout("final_cta")}
          onDownload={() => handleTriggerDownload("final_cta")}
          onOpenNonWindows={() => setIsNonWindowsModalOpen(true)}
        />
      </main>
      <Footer onNavigate={handleNavigate} />

      {/* Modals & Toasts */}
      <NonWindowsModal
        isOpen={isNonWindowsModalOpen}
        osType={osType}
        onClose={() => setIsNonWindowsModalOpen(false)}
        onDownloadWindowsAnyway={handleForceWindowsDownload}
      />

      <LifetimeOfferModal
        isOpen={isOfferModalOpen}
        currency={currency}
        detectedCountry={detectedCountry}
        onClose={() => setIsOfferModalOpen(false)}
        onDownload={() => handleTriggerDownload("offer_modal")}
        onOpenCheckout={() => handleOpenCheckout("offer_modal")}
      />

      <PaypalCheckoutModal
        isOpen={isPaypalModalOpen}
        currency={currency}
        detectedCountry={detectedCountry}
        onClose={() => setIsPaypalModalOpen(false)}
        onDownload={() => handleTriggerDownload("checkout_modal")}
      />

      <DownloadToast
        isOpen={isDownloadToastOpen}
        onClose={() => setIsDownloadToastOpen(false)}
      />

      {/* Discreet Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
}
