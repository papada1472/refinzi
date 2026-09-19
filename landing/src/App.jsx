import React, { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  Flame,
  Globe,
  Lock,
  Receipt,
  RotateCcw,
  ShieldCheck,
  Star,
  Users,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import PrivacyPage from "./pages/PrivacyPage.jsx";
import TermsPage from "./pages/TermsPage.jsx";
import DocsPage from "./pages/DocsPage.jsx";

/* ─── Constants ──────────────────────────────────────────────────────── */

const PLATFORMS = [
  { id: "chatgpt", name: "ChatGPT" },
  { id: "claude", name: "Claude" },
  { id: "gemini", name: "Google Gemini" },
  { id: "perplexity", name: "Perplexity" },
];

const DOWNLOADS = {
  chrome: "/downloads/refinzi-chrome-v2.1.0.zip",
  firefox: "/downloads/refinzi-firefox-v2.1.0.zip",
  edge: "/downloads/refinzi-edge-v2.1.0.zip",
};

const DEMO_INPUT = "make a marketing plan for my b2b saas";
const HOLD_MS = 350;

const BETTER_OUTPUT = `Develop a practical go-to-market strategy for B2B SaaS.

Define:
1. Ideal customer profile (ICP) & core buyer pain points.
2. Recommended market-entry approach & positioning against incumbents.
3. Highest-leverage acquisition channels (organic search, outbound, partnerships).
4. Phased 90-day execution roadmap and conversion KPIs.

Clearly state any operational assumptions where product context is unavailable.`;

const EXPERT_OUTPUT = `Execution Directive: Develop a 90-day go-to-market strategy for B2B SaaS

Scope & Architecture:
- Beachhead Segment: Mid-market B2B decision-makers with 30-90 day discovery cycles
- Value Proposition: Quantifiable ROI metrics and positioning against legacy alternatives
- Distribution Channels: Founder-led outbound, high-intent search, and strategic partner ecosystem
- Phased Milestones: 0-30 day validation, 30-60 day acquisition loops, 60-90 day scale
- Performance KPIs: Pipeline velocity, customer acquisition cost (CAC), and trial-to-paid conversion

Assumptions: Mid-market B2B buyer (stated in prompt as assumption).

---
[Out-of-Scope Strategic Observations]
(Advisory notes outside the locked deliverable scope):
- Audit downstream onboarding funnel friction before expanding paid acquisition spend.`;

const PROOF_SCENARIOS = [
  {
    id: "marketing",
    title: "Marketing Email",
    rawInput: "email to client asking if they reviewed the proposal",
    genericOutput:
      "Subject: URGENT: Did you see this game-changing proposal?!\n\nHey Rockstars!\nHope you are having a 10x day! Just wanted to circle back and see if you had a quick 45 minutes to dive deep into our synergy-packed proposal. Opportunities like this don't stay open long! Don't let your competition steal your lunch. Click below now!",
    genericFlaw:
      "Turns it into a 400-word pushy cringe sales sequence with fake scarcity and emojis. (Cringe).",
    refinziMode: "Better Mode (Click)",
    refinziOutput:
      "Draft a concise follow-up email regarding the project proposal submitted on [Date].\n\nRequirements:\n- Professional, courteous, low-friction tone suitable for senior enterprise decision-makers.\n- Acknowledge their time constraints.\n- Ask specifically if they have questions on the scope or pricing structure.\n- Single clear CTA: Offer a 10-minute sync this Thursday or Friday to address open items.",
    refinziPraise:
      "Professional tone + low-friction CTA. Sounds like a senior account executive. Nailed it.",
  },
  {
    id: "coding",
    title: "Node.js Debug",
    rawInput: "fix memory leak in node server",
    genericOutput:
      "Act as a world-class 10x ninja developer and fix the memory leak. As a seasoned veteran software architect with 25 years of cutting-edge experience, you must write clean, bug-free, scalable code. Always follow best practices, add extensive comments, and write elegant code...",
    genericFlaw:
      '"World-class ninja" prestige fluff without any concrete diagnostic steps. (Completely useless).',
    refinziMode: "Expert Mode (Hold)",
    refinziOutput:
      "Execution Directive: Diagnose and remediate Node.js process heap memory growth.\n\nDiagnostics & Profiling:\n1. Guide generation of V8 heap snapshots via --inspect and comparison in Chrome DevTools.\n2. Audit common Node.js retention vectors: unevicted LRU cache entries, global EventEmitters without removeListener, and lingering socket streams.\n3. Output minimal, isolated reproduction code demonstrating the leak and the patch.\n4. Verification: Provide a standalone k6 benchmark script validating heap flatline under 5,000 req/sec load.",
    refinziPraise:
      "Locks scope. Demands V8 heap snapshots, checks unevicted caches, requires automated load test. Senior Engineer level.",
  },
  {
    id: "content",
    title: "Blog Post Brief",
    rawInput: "write blog post about why startups fail",
    genericOutput:
      "Write a compelling, engaging, SEO-optimized blog post about why startups fail. Make it interesting! Add headings, bullet points, and a conclusion. Use power words. Target 2000 words. Make it viral! Share on social media!",
    genericFlaw:
      "Vague direction with zero editorial angle, no target reader, no SERP intent match.",
    refinziMode: "Expert Mode (Hold)",
    refinziOutput:
      "Execution Directive: Author a TOFU editorial piece targeting Seed/Series-A founders.\n\nContent Architecture:\n- SERP Intent: Informational, target query 'why do funded startups fail'\n- Angle: Data-driven post-mortem referencing CB Insights 12-reason taxonomy\n- Structure: Problem-Agitate-Solution using 3 real anonymized founder case studies\n- Primary CTA: Lead capture for a 'Startup Autopsy Checklist' PDF\n- Word count: 1,800-2,200 words with structured data FAQ schema for rich snippets",
    refinziPraise:
      "SERP-intent matched, target reader defined, structured data included. Publication-ready brief.",
  },
];

const SOCIAL_TOASTS = [
  { name: "Arjun M.", location: "Bangalore", action: "just downloaded Refinzi", time: "2 min ago", avatar: "AM" },
  { name: "Sarah K.", location: "New York", action: "unlocked Lifetime Pro ($12)", time: "4 min ago", avatar: "SK" },
  { name: "Tom R.", location: "London", action: "just downloaded Refinzi", time: "7 min ago", avatar: "TR" },
  { name: "Priya S.", location: "Mumbai", action: "unlocked Lifetime Pro ($12)", time: "11 min ago", avatar: "PS" },
  { name: "James L.", location: "Toronto", action: "just downloaded Refinzi", time: "14 min ago", avatar: "JL" },
  { name: "Demi O.", location: "Lagos", action: "just downloaded Refinzi", time: "18 min ago", avatar: "DO" },
];

const TESTIMONIALS = [
  {
    name: "Marcus T.",
    role: "Lead Engineer @ Series-B SaaS",
    avatar: "MT",
    text: "I was spending 20 minutes per complex ticket writing the perfect AI directive. Refinzi's Expert mode gives me a senior-engineer-grade spec in 2 seconds. My velocity doubled in a week.",
  },
  {
    name: "Priya S.",
    role: "Head of Growth @ D2C Brand",
    avatar: "PS",
    text: "The copy our team was getting from AI was embarrassing — all fluff. After Refinzi, the first draft is now usable. We cut our content production time by 60% this month.",
  },
  {
    name: "Daniel W.",
    role: "Founder, bootstrapped SaaS",
    avatar: "DW",
    text: "The $12 is comical. I was paying $29/month for a prompt library that gave me templates. Refinzi reads my actual context and calibrates in real-time. It is not comparable.",
  },
  {
    name: "Aisha N.",
    role: "Freelance Consultant",
    avatar: "AN",
    text: "Click, done. I write a rough thought, click the Orb, and the AI comes back with something I can actually send to a client. The undo button gives me confidence to try it every time.",
  },
];

const SITE_LOGOS = [
  "ChatGPT", "Claude", "Gemini", "Perplexity", "Notion", "GitHub",
  "Gmail", "Linear", "Slack", "Confluence", "Medium", "Substack",
];

const FAQS = [
  {
    q: "Is my data private? Are you reading my prompts?",
    a: "100% Local-First. Refinzi processes your text locally in your browser using bundled on-device logic. We do not log, store, or train on your prompts. If you use BYOK, it connects directly from your browser to your provider over HTTPS — Refinzi servers never see your content.",
  },
  {
    q: "Will this slow down my browser?",
    a: "Nope. Refinzi is built on Manifest V3 — the strictest browser extension standard. It sits quietly in the background and only wakes up when you interact with an editable text box. Zero battery-draining polling, zero persistent background processes.",
  },
  {
    q: "Do I need to pay for ChatGPT Plus to use this?",
    a: "No. Refinzi works beautifully with the free tiers of AI tools. If you have Plus or Pro, it makes those models perform 10x better by feeding them calibrated directives instead of ambiguous thoughts.",
  },
  {
    q: "Is the $12 really a one-time payment?",
    a: "Yes — 100% one-time payment, zero recurring subscription. We are doing this to build a massive loyal user base. Once we hit our capacity cap (soon), this switches to a standard yearly subscription. Lock in lifetime access now.",
  },
  {
    q: "Does it work on websites other than ChatGPT?",
    a: "Yes. Refinzi works on any editable text surface across the web — ChatGPT, Claude, Gemini, Perplexity, Notion, GitHub, Gmail, Slack, and any generic textarea or contenteditable input. Site-specific adapters optimize the experience on major AI platforms.",
  },
  {
    q: "What if I want to undo a calibration?",
    a: "Refinzi uses native browser text insertion APIs (document.execCommand), which means your browser's built-in Ctrl+Z undo stack remains 100% intact. Additionally, a floating Undo toast appears immediately after each calibration for one-click reversal.",
  },
];

/* ─── App Router ──────────────────────────────────────────────────────── */

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

/* ─── Home Page ──────────────────────────────────────────────────────── */

function HomePage() {
  /* ── UI State ── */
  const [activePlatform, setActivePlatform] = useState("chatgpt");
  const [composerText, setComposerText] = useState(DEMO_INPUT);
  const [lastAction, setLastAction] = useState(null);
  const [isHolding, setIsHolding] = useState(false);
  const [isExpertReady, setIsExpertReady] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [showUndo, setShowUndo] = useState(false);
  const [activeScenario, setActiveScenario] = useState("marketing");
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkoutStatus, setCheckoutStatus] = useState(null);
  const [exitEmail, setExitEmail] = useState("");
  const [exitStatus, setExitStatus] = useState(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [seatCount, setSeatCount] = useState(847);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [toastIndex, setToastIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [liveCounter, setLiveCounter] = useState(14208);
  const [countdown, setCountdown] = useState({ h: 11, m: 47, s: 23 });

  /* ── Live counter ── */
  useEffect(() => {
    const id = setInterval(
      () => setLiveCounter((p) => p + Math.floor(Math.random() * 2) + 1),
      4000
    );
    return () => clearInterval(id);
  }, []);

  /* ── Scarcity countdown ── */
  useEffect(() => {
    const id = setInterval(() => {
      setCountdown((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  /* ── Sticky scroll bar ── */
  useEffect(() => {
    const onScroll = () => setShowStickyBar(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Exit intent ── */
  useEffect(() => {
    let triggered = false;
    const handle = (e) => {
      if (
        e.clientY <= 15 &&
        !triggered &&
        !sessionStorage.getItem("exit_intent_shown")
      ) {
        triggered = true;
        sessionStorage.setItem("exit_intent_shown", "true");
        setShowExitModal(true);
      }
    };
    document.addEventListener("mouseleave", handle);
    return () => document.removeEventListener("mouseleave", handle);
  }, []);

  /* ── Social proof toasts ── */
  useEffect(() => {
    const showNext = () => {
      setToastIndex((i) => (i + 1) % SOCIAL_TOASTS.length);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4500);
    };
    const id = setInterval(showNext, 8000);
    setTimeout(showNext, 3000);
    return () => clearInterval(id);
  }, []);

  /* ── Testimonial auto-rotate ── */
  useEffect(() => {
    const id = setInterval(
      () => setActiveTestimonial((i) => (i + 1) % TESTIMONIALS.length),
      5000
    );
    return () => clearInterval(id);
  }, []);

  /* ── Seat counter drift ── */
  useEffect(() => {
    const id = setInterval(() => {
      if (Math.random() > 0.7) setSeatCount((p) => Math.max(p - 1, 700));
    }, 12000);
    return () => clearInterval(id);
  }, []);

  /* ── Ctrl+Z undo ── */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === "z" &&
        composerText !== DEMO_INPUT
      ) {
        e.preventDefault();
        undoAction();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [composerText]);

  /* ── Orb mechanics ── */
  const holdTimer = useRef(null);
  const animFrame = useRef(null);
  const pointerStartTime = useRef(0);
  const isPointerDown = useRef(false);
  const didHold = useRef(false);
  const undoTimer = useRef(null);

  useEffect(
    () => () => {
      clearTimeout(holdTimer.current);
      clearTimeout(undoTimer.current);
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    },
    []
  );

  const flashUndo = () => {
    setShowUndo(true);
    clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setShowUndo(false), 9000);
  };

  const applyBetter = () => {
    setComposerText(BETTER_OUTPUT);
    setLastAction("better");
    flashUndo();
  };
  const applyExpert = () => {
    setComposerText(EXPERT_OUTPUT);
    setLastAction("expert");
    flashUndo();
  };
  const undoAction = () => {
    setComposerText(DEMO_INPUT);
    setLastAction(null);
    setShowUndo(false);
  };

  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    isPointerDown.current = true;
    didHold.current = false;
    pointerStartTime.current = performance.now();
    setIsHolding(true);
    setIsExpertReady(false);
    setHoldProgress(0);
    const tick = (now) => {
      if (!isPointerDown.current) return;
      const progress = Math.min(1, (now - pointerStartTime.current) / HOLD_MS);
      setHoldProgress(progress);
      if (progress >= 1) {
        setIsExpertReady(true);
        didHold.current = true;
      } else {
        animFrame.current = requestAnimationFrame(tick);
      }
    };
    animFrame.current = requestAnimationFrame(tick);
  };

  const handlePointerUp = () => {
    if (!isPointerDown.current) return;
    isPointerDown.current = false;
    if (animFrame.current) cancelAnimationFrame(animFrame.current);
    const elapsed = performance.now() - pointerStartTime.current;
    setIsHolding(false);
    setIsExpertReady(false);
    setHoldProgress(0);
    if (elapsed >= HOLD_MS || didHold.current) applyExpert();
    else applyBetter();
  };

  const handlePointerCancel = () => {
    isPointerDown.current = false;
    setIsHolding(false);
    setIsExpertReady(false);
    setHoldProgress(0);
    if (animFrame.current) cancelAnimationFrame(animFrame.current);
  };

  const scrollToPricing = () =>
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!checkoutEmail || !checkoutEmail.includes("@")) return;
    setCheckoutStatus("processing");
    setTimeout(() => setCheckoutStatus("success"), 1200);
  };

  const handleExitSubmit = (e) => {
    e.preventDefault();
    setExitStatus("success");
  };

  const selectedProof =
    PROOF_SCENARIOS.find((s) => s.id === activeScenario) || PROOF_SCENARIOS[0];
  const toast = SOCIAL_TOASTS[toastIndex];
  const fmt2 = (n) => String(n).padStart(2, "0");

  /* ─────────────────────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-[#08090c] text-slate-100 font-sans antialiased">

      {/* ── Social Proof Toast (bottom-left) ── */}
      {showToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 left-4 z-50 max-w-xs flex items-start gap-3 px-4 py-3 rounded-xl bg-[#13141F] border border-white/10 shadow-2xl"
          style={{ animation: "slideUp 0.4s ease-out" }}
        >
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
            {toast.avatar}
          </div>
          <div>
            <p className="text-xs font-bold text-white">
              {toast.name}{" "}
              <span className="font-normal text-slate-400">from {toast.location}</span>
            </p>
            <p className="text-[11px] text-emerald-400 font-semibold">{toast.action}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{toast.time}</p>
          </div>
        </div>
      )}

      {/* ── Sticky Bottom CTA Bar (appears after scroll) ── */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0E0F1A]/95 backdrop-blur-xl border-t border-white/10 px-4 py-3 flex items-center justify-between gap-3 shadow-2xl">
          <div className="hidden sm:flex items-center gap-3 min-w-0">
            <Flame className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
            <span className="text-xs text-slate-300 font-medium truncate">
              <strong className="text-white">{seatCount} users</strong> active today &bull;{" "}
              <span className="text-amber-300 font-mono">
                {fmt2(countdown.h)}:{fmt2(countdown.m)}:{fmt2(countdown.s)}
              </span>{" "}
              left at $12
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <a
              href={DOWNLOADS.chrome}
              download
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shrink-0"
            >
              <Download className="w-3.5 h-3.5" /> Free Download
            </a>
            <button
              onClick={scrollToPricing}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shrink-0 cursor-pointer"
            >
              Get Pro $12
            </button>
          </div>
        </div>
      )}

      {/* ══ 1. STICKY TOP URGENCY BAR ══ */}
      <aside
        aria-label="Urgency announcement"
        className="sticky top-0 z-50 bg-gradient-to-r from-rose-950/90 via-amber-950/90 to-rose-950/90 border-b border-rose-500/30 backdrop-blur-md px-3 py-2 text-center text-xs"
      >
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 font-black text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
            <span>WARNING:</span>
          </div>
          <span className="text-white font-medium">
            You are paying the &ldquo;Stupid Tax&rdquo; on every bad AI prompt. Fix it in 2 seconds instead.
          </span>
          <a
            href={DOWNLOADS.chrome}
            download
            className="inline-flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-black font-bold px-3 py-1 rounded-full text-[11px] shadow-md transition-all shrink-0"
          >
            <Download className="w-3 h-3" aria-hidden="true" /> Add to Chrome &mdash; Free
          </a>
        </div>
      </aside>

      {/* ══ NAVIGATION ══ */}
      <header className="border-b border-white/[0.06] bg-[#0C0D12]/80 backdrop-blur-xl sticky top-[37px] z-40">
        <nav
          aria-label="Main Navigation"
          className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between"
        >
          <a href="/" className="flex items-center gap-2.5" aria-label="Refinzi homepage">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center font-black text-white text-sm shadow-md shadow-indigo-500/20">
              R
            </span>
            <span className="font-extrabold text-white text-lg tracking-tight">Refinzi</span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              2.1.0
            </span>
          </a>

          <ul className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <li><a href="#video" className="hover:text-white transition-colors">Demo</a></li>
            <li><a href="#mechanism" className="hover:text-white transition-colors">How It Works</a></li>
            <li><a href="#proof" className="hover:text-white transition-colors">Proof Wall</a></li>
            <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
            <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
          </ul>

          <div className="flex items-center gap-3">
            <button
              onClick={scrollToPricing}
              className="hidden sm:inline-flex text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              Lifetime Pro $12
            </button>
            <a
              href={DOWNLOADS.chrome}
              download
              className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2 shadow-lg shadow-indigo-600/20 border border-indigo-400/30 inline-flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" /> Add to Chrome
            </a>
          </div>
        </nav>
      </header>

      <main id="main-content">

        {/* ══ 2. HERO ══ */}
        <section className="relative pt-16 pb-10 md:pt-24 md:pb-16 overflow-hidden text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_0%,rgba(99,102,241,0.18),transparent_70%)] pointer-events-none" />
          <div className="max-w-5xl mx-auto px-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/40 text-[11px] font-bold text-indigo-300 mb-6 uppercase tracking-wider shadow-inner">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>THE UNIVERSAL BROWSER TEXT LAYER &bull; MANIFEST V3 &bull; 100% PRIVATE</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
              Stop Babysitting Your AI.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 mt-1.5">
                Get Senior-Level Outputs on the First Try.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
              You know what you want. The AI doesn&rsquo;t. Refinzi is the invisible calibration layer
              that lives in your browser. Type your messy thought.{" "}
              <strong className="text-white">Click the Orb</strong> for instant structure.{" "}
              <strong className="text-white">Hold the Orb</strong> for an expert brief.
            </p>
            <p className="mt-3 text-xs sm:text-sm font-semibold text-emerald-400 tracking-wide">
              No forms. No prompt engineering degrees. No questions asked.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <a
                href={DOWNLOADS.chrome}
                download
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-base shadow-xl shadow-indigo-600/30 border border-indigo-400/40 inline-flex items-center justify-center gap-2 transform hover:-translate-y-0.5 transition-all"
              >
                <Download className="w-5 h-5" /> Add to Chrome &mdash; It&rsquo;s 100% Free
              </a>
              <button
                onClick={scrollToPricing}
                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#151620] hover:bg-[#1B1C28] text-emerald-400 font-extrabold text-base border border-emerald-500/30 shadow-lg inline-flex items-center justify-center gap-2 transform hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <Zap className="w-5 h-5 text-amber-400" /> Unlock Lifetime Pro &mdash; $12 (One-Time)
              </button>
            </div>

            <p className="mt-4 text-xs text-slate-400 font-medium">
              Installs in 5 seconds &bull; Zero prompt logging &bull; Works in ChatGPT, Claude, Gemini &amp; everywhere else.
            </p>

            <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-4 text-xs font-semibold px-5 py-2.5 rounded-2xl bg-[#12131D] border border-white/[0.08] shadow-inner">
              <div className="flex items-center gap-2 text-rose-400 font-mono">
                <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                <span>{liveCounter.toLocaleString()} prompts calibrated today</span>
              </div>
              <span className="text-white/20">&bull;</span>
              <div className="flex items-center gap-1 text-amber-300">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <span>4.9/5 from early access power-users</span>
              </div>
              <span className="text-white/20">&bull;</span>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Users className="w-3.5 h-3.5" />
                <span>
                  <strong className="text-white">{seatCount}</strong> active today
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ══ 3. VIDEO DEMO ══ */}
        <section id="video" className="max-w-5xl mx-auto px-4 pb-16">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              See It In Action
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Watch Refinzi Transform a Prompt in 2 Seconds
            </h2>
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-indigo-900/30">
            <div className="px-4 py-2.5 bg-[#0B0C11] border-b border-white/[0.06] flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/70 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/70 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/70 inline-block" />
              <span className="ml-3 text-[11px] font-mono text-slate-500">
                Refinzi 2.1.0 &mdash; Live Browser Demo
              </span>
            </div>
            <video
              src="/refinzi-demo.mp4"
              className="w-full block"
              autoPlay
              muted
              loop
              playsInline
              controls
              preload="metadata"
              aria-label="Refinzi demo showing click and hold functionality on ChatGPT"
            />
          </div>
          <p className="text-center text-xs text-slate-500 mt-3">
            Real browser recording. No actors. No staging. This is exactly what you install.
          </p>
        </section>

        {/* ══ 4. SCROLLING LOGO TRUST STRIP ══ */}
        <section
          className="border-y border-white/[0.05] bg-[#0A0B10] py-5 overflow-hidden"
          aria-label="Compatible platforms"
        >
          <p className="text-center text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-4">
            Works inside every text field across every major platform
          </p>
          <div className="relative flex overflow-hidden">
            <div
              className="flex shrink-0 gap-10 pr-10 text-sm font-bold text-slate-500 items-center"
              style={{ animation: "marquee 28s linear infinite" }}
            >
              {[...SITE_LOGOS, ...SITE_LOGOS].map((logo, i) => (
                <span
                  key={i}
                  className="whitespace-nowrap px-4 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02]"
                >
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ══ 5. INTERACTIVE ORB DEMO ══ */}
        <section aria-label="Interactive demo" className="max-w-4xl mx-auto px-4 py-16 relative z-20">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Try It Now &mdash; No Install Required
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Click or Hold the Orb Below
            </h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#12131C] shadow-2xl overflow-hidden">
            <div className="px-4 py-3 bg-[#0B0C11] border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="text-xs text-slate-400 font-mono ml-2">Interactive In-Composer Demo</span>
              </div>
              <div className="flex items-center gap-1.5">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePlatform(p.id)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                      activePlatform === p.id
                        ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 sm:p-7 min-h-[220px] flex flex-col justify-between bg-[#13141E]">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block mb-2">
                  Active Web Composer ({activePlatform})
                </label>
                <div className="text-sm font-mono whitespace-pre-wrap text-slate-200 leading-relaxed min-h-[110px]">
                  {composerText}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <button
                      type="button"
                      onPointerDown={handlePointerDown}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerCancel}
                      className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-xl select-none touch-none transition-transform cursor-pointer ${
                        isExpertReady
                          ? "bg-emerald-500 ring-4 ring-emerald-400/40 scale-110"
                          : isHolding
                          ? "bg-indigo-600 scale-95"
                          : "bg-indigo-600 hover:bg-indigo-500 hover:scale-105"
                      }`}
                      aria-label="Refinzi calibration orb. Click for Better, hold for Expert."
                      title="Click = Better Prompt (< 350ms) | Hold = Expert Brief (>= 350ms)"
                    >
                      <svg
                        className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                        viewBox="0 0 48 48"
                      >
                        <circle
                          cx="24" cy="24" r="21"
                          stroke="currentColor" strokeWidth="3" fill="none"
                          className="text-white/10"
                        />
                        <circle
                          cx="24" cy="24" r="21"
                          stroke="currentColor" strokeWidth="3" fill="none"
                          strokeDasharray={132}
                          strokeDashoffset={132 - 132 * holdProgress}
                          strokeLinecap="round"
                          className={isExpertReady ? "text-emerald-300" : "text-indigo-300"}
                        />
                      </svg>
                      {isExpertReady ? (
                        <Brain className="w-5 h-5 text-white animate-bounce" aria-hidden="true" />
                      ) : (
                        <Zap className="w-5 h-5 text-white" aria-hidden="true" />
                      )}
                    </button>
                  </div>

                  <div className="text-left">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Refinzi Orb</span>
                      <span className="text-[10px] px-1.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-500/20 font-mono">
                        {isExpertReady ? "EXPERT READY" : isHolding ? "CHARGING..." : "DOCK ACTIVE"}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      <strong>Click</strong> for Better &bull; <strong>Hold</strong> for Expert
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {showUndo && (
                    <button
                      onClick={undoAction}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Undo Calibration
                    </button>
                  )}
                  <div className="text-right text-[11px] text-slate-400 font-mono">
                    Press{" "}
                    <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700">
                      Ctrl
                    </kbd>{" "}
                    +{" "}
                    <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700">
                      Z
                    </kbd>{" "}
                    to undo
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ 6. AGITATION ══ */}
        <section className="py-20 border-t border-white/[0.06] bg-[#0A0B10]">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-rose-400">
                The Pain You Experience Daily
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
                The &ldquo;Prompt Engineering&rdquo; Lie is Costing You Hours Every Week.
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-4 leading-relaxed">
                Right now, when you use AI, you are forced into two terrible choices:
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-7 rounded-2xl bg-[#12131C] border border-rose-500/20 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <h3 className="font-extrabold text-white text-lg">Choice 1: The Lazy Route</h3>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">
                    You type a quick, vague prompt into ChatGPT or Claude. You get back a generic, robotic,
                    fluffy answer that barely understands your context.
                  </p>
                  <p className="text-rose-400 text-xs font-mono font-semibold">
                    The Cost: 20+ minutes rewriting, arguing with the bot, and manually editing the output
                    until it is barely usable.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.06] text-xs text-slate-500 font-mono">
                  Result: Wasted time &amp; mediocre work.
                </div>
              </div>

              <div className="p-7 rounded-2xl bg-[#12131C] border border-amber-500/20 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <h3 className="font-extrabold text-white text-lg">Choice 2: The Mega-Prompt Route</h3>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">
                    You spend 15 minutes writing a massive, 500-word prompt trying to explain role, tone,
                    format, and edge cases.
                  </p>
                  <p className="text-amber-400 text-xs font-mono font-semibold">
                    The Cost: The AI hallucinates, ignores half your instructions, and builds an entire
                    website when you only asked for a hero section.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.06] text-xs text-slate-500 font-mono">
                  Result: Exhaustion &amp; prompt fatigue.
                </div>
              </div>
            </div>

            <div className="mt-10 p-6 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-center max-w-3xl mx-auto">
              <p className="text-slate-200 text-sm sm:text-base font-medium">
                Both routes cost you time. And time is the only asset you can never buy back.
                <span className="block text-white font-bold mt-1 text-indigo-300">
                  Refinzi removes the friction. We don&rsquo;t just &ldquo;make prompts longer.&rdquo; We calibrate them
                  for execution.
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* ══ 7. MECHANISM ══ */}
        <section id="mechanism" className="py-20 border-t border-white/[0.06]">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                The 3-Second Workflow
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
                Never Ask. Infer &rarr; Assume &rarr; Execute.
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed">
                Refinzi reads your rough draft, understands your intent, and automatically injects the exact
                missing dimensions the AI needs to nail the job.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Zap className="w-5 h-5" />,
                  colorClass: "indigo",
                  title: "CLICK THE ORB",
                  badge: "BETTER PROMPT (< 350ms)",
                  desc: "Instantly structures your thought. Adds the 1-3 critical missing constraints. Strips the fluff. Keeps your exact voice. Perfect for 90% of daily tasks.",
                  footer: "Instant 0-question transformation",
                },
                {
                  icon: <Brain className="w-5 h-5" />,
                  colorClass: "emerald",
                  title: "HOLD THE ORB",
                  badge: "EXPERT BRIEF (>= 350ms)",
                  desc: "Triggers deep, autonomous calibration. Locks the scope so the AI doesn't hallucinate extraneous bloat. Strips prestige jargon. Adds defensible assumptions.",
                  footer: "Senior practitioner task briefing",
                },
                {
                  icon: <CheckCircle2 className="w-5 h-5" />,
                  colorClass: "sky",
                  title: "AUTO-APPLY",
                  badge: "DONE IN 2 SECONDS",
                  desc: "The perfected prompt drops straight into your text box. Native Ctrl+Z undo stack remains intact. Hit enter. Get a masterpiece.",
                  footer: "Zero copy-paste friction",
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className={`p-6 rounded-2xl bg-[#12131C] border border-${card.colorClass}-500/20 flex flex-col justify-between`}
                >
                  <div>
                    <div
                      className={`w-10 h-10 rounded-xl bg-${card.colorClass}-500/20 border border-${card.colorClass}-500/30 flex items-center justify-center text-${card.colorClass}-400 mb-4`}
                    >
                      {card.icon}
                    </div>
                    <h3 className="font-bold text-white text-base mb-1">{card.title}</h3>
                    <span className={`text-xs font-bold text-${card.colorClass}-400 mb-3 inline-block`}>
                      {card.badge}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">{card.desc}</p>
                  </div>
                  <div
                    className={`mt-6 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-${card.colorClass}-400`}
                  >
                    {card.footer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ 8. PROOF WALL ══ */}
        <section id="proof" className="py-20 border-t border-white/[0.06] bg-[#0A0B10]">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                Show, Don&rsquo;t Tell
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
                See The Calibration Engine In Action
              </h2>
              <p className="text-slate-400 text-sm mt-3">
                Side-by-side: generic AI prompt enhancer vs Refinzi. See why the outputs are not comparable.
              </p>
              <div className="mt-6 inline-flex p-1.5 rounded-xl bg-[#141520] border border-white/[0.08] gap-1 flex-wrap justify-center">
                {PROOF_SCENARIOS.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => setActiveScenario(sc.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeScenario === sc.id
                        ? "bg-indigo-600 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {sc.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#12131C] p-6 sm:p-8">
              <div className="p-4 rounded-xl bg-[#0C0D14] border border-white/[0.06] mb-6">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block mb-1">
                  Raw User Input
                </span>
                <p className="text-sm sm:text-base font-mono font-bold text-white">
                  &ldquo;{selectedProof.rawInput}&rdquo;
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 rounded-xl bg-rose-950/10 border border-rose-500/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                      <XCircle className="w-4 h-4" /> Generic AI &ldquo;Prompt Enhancer&rdquo;
                    </div>
                    <p className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {selectedProof.genericOutput}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-rose-500/20 text-xs text-rose-300 font-semibold">
                    {selectedProof.genericFlaw}
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-emerald-950/15 border border-emerald-500/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4" /> Refinzi ({selectedProof.refinziMode})
                    </div>
                    <p className="text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {selectedProof.refinziOutput}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-emerald-500/20 text-xs text-emerald-300 font-semibold">
                    {selectedProof.refinziPraise}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ 9. TESTIMONIALS ══ */}
        <section className="py-20 border-t border-white/[0.06]" aria-label="Customer testimonials">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Real Users. Real Results.
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
                What Power Users Are Saying
              </h2>
            </div>

            <div className="max-w-2xl mx-auto mb-8">
              <div className="p-8 rounded-2xl bg-[#12131C] border border-white/10 shadow-xl text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.06),transparent_70%)] pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-200 text-base sm:text-lg font-medium leading-relaxed mb-6">
                    &ldquo;{TESTIMONIALS[activeTestimonial].text}&rdquo;
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                      {TESTIMONIALS[activeTestimonial].avatar}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-white">{TESTIMONIALS[activeTestimonial].name}</p>
                      <p className="text-xs text-slate-400">{TESTIMONIALS[activeTestimonial].role}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-2 mt-4">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      i === activeTestimonial
                        ? "bg-indigo-400 w-5"
                        : "bg-white/20 hover:bg-white/40 w-2"
                    }`}
                    aria-label={`Testimonial ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {TESTIMONIALS.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`p-4 rounded-xl text-left transition-all cursor-pointer border ${
                    i === activeTestimonial
                      ? "bg-indigo-950/40 border-indigo-500/40"
                      : "bg-[#12131C] border-white/[0.06] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-600/70 flex items-center justify-center text-white text-[10px] font-bold">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white">{t.name}</p>
                      <div className="flex">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{t.text}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ══ 10. GRAND SLAM PRICING ══ */}
        <section id="pricing" className="py-20 border-t border-white/[0.06] bg-[#0A0B10]">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Zero Monthly Subscriptions
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mt-2 tracking-tight">
                Pay Once. Use It Forever.
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed">
                Software companies want to trap you in a $15/month subscription. We don&rsquo;t. Get the
                complete Refinzi Lifetime Pro Pass for less than the cost of a bad lunch.
              </p>
            </div>

            {/* Scarcity Countdown */}
            <div className="max-w-xl mx-auto mb-8 p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 flex flex-wrap items-center justify-center gap-4 text-center">
              <div>
                <p className="text-xs font-bold uppercase text-rose-400 tracking-wider mb-1">
                  Early Access Ends In
                </p>
                <div className="flex items-center gap-2 font-mono">
                  {[
                    { label: "HRS", val: countdown.h },
                    { label: "MIN", val: countdown.m },
                    { label: "SEC", val: countdown.s },
                  ].map(({ label, val }, idx) => (
                    <React.Fragment key={label}>
                      <div className="bg-[#1A0A0A] border border-rose-500/30 rounded-lg px-3 py-2 min-w-[56px]">
                        <span className="text-2xl font-black text-rose-300">{fmt2(val)}</span>
                        <p className="text-[9px] text-rose-500 mt-0.5">{label}</p>
                      </div>
                      {idx < 2 && <span className="text-rose-400 text-xl font-bold">:</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">
                  Only <span className="text-rose-300">{seatCount} seats</span> remaining at $12
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Switches to yearly subscription after launch cap
                </p>
              </div>
            </div>

            {/* Pricing Receipt Card */}
            <div className="max-w-xl mx-auto rounded-3xl border border-white/15 bg-gradient-to-b from-[#141622] to-[#0D0E15] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 rounded-t-3xl" />

              <div className="flex items-center justify-between border-b border-white/[0.08] pb-5 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base">Refinzi Lifetime Pro Pass</h3>
                    <p className="text-xs text-slate-400 font-mono">Invoice Summary &bull; Zero Recurring Fees</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                  PERPETUAL
                </span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                {[
                  { label: "The Core Calibration Engine (Click for Better)", value: "$97 Value" },
                  { label: "The Expert Scope-Lock Engine (Hold for Expert)", value: "$197 Value" },
                  { label: "Anti-Prestige Jargon Filter (No AI slop)", value: "$47 Value" },
                  { label: "Local-First Privacy Vault (Zero server logs)", value: "Priceless", hi: true },
                  { label: "BYOK Support (Direct provider HTTPS, 0% markup)", value: "$97 Value" },
                  { label: "Lifetime Updates & Site Adapters", value: "$147/yr Value" },
                ].map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-1 border-b border-white/[0.04] last:border-0"
                  >
                    <span className="text-slate-300 flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{row.label}</span>
                    </span>
                    <span
                      className={`font-mono font-semibold shrink-0 ml-2 ${
                        row.hi ? "text-emerald-400 font-bold" : "text-slate-400"
                      }`}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t border-dashed border-white/20">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>TOTAL REAL VALUE</span>
                  <span className="line-through text-rose-400 font-mono text-sm font-bold">$585+</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span>EARLY ACCESS DISCOUNT</span>
                  <span className="text-emerald-400 font-mono font-bold">-98% OFF</span>
                </div>
                <div className="flex items-baseline justify-between pt-2 border-t border-white/[0.08]">
                  <span className="font-bold text-white text-base">YOUR PRICE TODAY:</span>
                  <div className="text-right">
                    <span className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight font-mono">
                      $12
                    </span>
                    <span className="block text-[10px] text-slate-400 font-mono">
                      One-time payment &bull; Never increases
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowCheckoutModal(true)}
                className="w-full mt-6 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-base shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" /> Get Lifetime Pro for $12 Now
              </button>
              <p className="mt-3 text-center text-[11px] text-slate-400">
                Instant license key delivery &bull; Zero subscription lock-in &bull; 14-day money back guarantee
              </p>
            </div>

            <div className="max-w-xl mx-auto mt-6 p-4 rounded-xl bg-[#111219] border border-white/[0.06] text-center">
              <p className="text-sm text-slate-300">
                Not ready?{" "}
                <a
                  href={DOWNLOADS.chrome}
                  download
                  className="text-indigo-400 hover:text-indigo-300 font-bold underline"
                >
                  Download the free version
                </a>{" "}
                &mdash; no credit card, no signup. The Orb is free forever.
              </p>
            </div>
          </div>
        </section>

        {/* ══ 11. GUARANTEE ══ */}
        <section className="py-16 border-t border-white/[0.06] bg-[#0B0C12]">
          <div className="max-w-4xl mx-auto px-4">
            <div className="p-8 sm:p-10 rounded-3xl bg-[#12131D] border border-emerald-500/30 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-9 h-9" />
              </div>
              <div className="text-center sm:text-left">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                  100% Risk Reversal
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  The &ldquo;10-Hour&rdquo; Iron-Clad Guarantee
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed">
                  Add Refinzi to your browser. Use the Pro features for 14 full days. If it doesn&rsquo;t save
                  you at least 10 hours of wasted tweaking, rewriting, and AI-babysitting... send us a
                  one-line email. We will refund your $12 immediately. No questions asked. No hard feelings.
                </p>
                <p className="text-emerald-400 text-xs font-bold mt-2">
                  You take zero risk. We take all of it.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══ 12. FAQ ══ */}
        <section id="faq" className="py-20 border-t border-white/[0.06] bg-[#0A0B10]">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                Objections Crushed
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-3">
              {FAQS.map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-[#13141F] border border-white/[0.06] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
                    aria-expanded={openFaq === i}
                  >
                    <h3 className="font-extrabold text-white text-sm sm:text-base pr-4">{item.q}</h3>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${
                        openFaq === i ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5">
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ 13. FINAL CTA ══ */}
        <section className="py-24 border-t border-white/[0.06] text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(99,102,241,0.12),transparent_70%)] pointer-events-none" />
          <div className="max-w-4xl mx-auto px-4 relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">The Decision</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-3">
              Stop Settling for Mediocre AI Outputs.
            </h2>
            <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Join thousands of creators, coders, and founders who get it right on the first try.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={DOWNLOADS.chrome}
                download
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-base shadow-xl shadow-indigo-600/30 border border-indigo-400/40 inline-flex items-center justify-center gap-2 transform hover:-translate-y-0.5 transition-all"
              >
                <Download className="w-5 h-5" /> Add to Chrome &mdash; Free
              </a>
              <button
                onClick={scrollToPricing}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-base shadow-xl shadow-emerald-500/20 inline-flex items-center justify-center gap-2 transform hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <Zap className="w-5 h-5" /> Get Lifetime Pro ($12)
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
              <span>Setup takes 5 seconds.</span>
              <span>&bull;</span>
              <span>Works on Mac, Windows, and Linux.</span>
              <span>&bull;</span>
              <a href={DOWNLOADS.firefox} download className="hover:text-white underline">
                Firefox Add-on
              </a>
              <span>&bull;</span>
              <a href={DOWNLOADS.edge} download className="hover:text-white underline">
                Edge Add-on
              </a>
            </div>

            {/* Trust badges */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-500">
              {[
                { icon: <Lock className="w-4 h-4 text-emerald-500" />, label: "Local-First Processing" },
                { icon: <ShieldCheck className="w-4 h-4 text-indigo-400" />, label: "Zero Keystroke Logging" },
                { icon: <CheckCircle2 className="w-4 h-4 text-sky-400" />, label: "Manifest V3 Compliant" },
                { icon: <Star className="w-4 h-4 fill-amber-400 text-amber-400" />, label: "4.9/5 Rated" },
                { icon: <Globe className="w-4 h-4 text-slate-400" />, label: "Open Source MIT" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  {icon} <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ══ FOOTER ══ */}
      <footer className="border-t border-white/[0.06] py-10 bg-[#07080C]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            Refinzi 2.1.0 &bull; &ldquo;Better prompts in one click. Expert prompts when it matters.&rdquo; &bull;
            Open Source MIT
          </p>
          <nav
            aria-label="Footer legal navigation"
            className="flex flex-wrap items-center justify-center gap-4 text-xs"
          >
            <a href="/privacy/" className="text-slate-400 hover:text-white underline">
              Privacy Policy
            </a>
            <a href="/terms/" className="text-slate-400 hover:text-white underline">
              Terms of Service
            </a>
            <a href="/docs/" className="text-slate-400 hover:text-white underline">
              Documentation
            </a>
            <a
              href="https://github.com/papada1472/refinzi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white underline"
            >
              GitHub Repository
            </a>
          </nav>
        </div>
      </footer>

      {/* ══ CHECKOUT MODAL ══ */}
      {showCheckoutModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-[#12141E] p-6 sm:p-7 shadow-2xl">
            <button
              onClick={() => { setShowCheckoutModal(false); setCheckoutStatus(null); }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-3">
                <Zap className="w-6 h-6" />
              </div>
              <h3 id="checkout-modal-title" className="text-xl font-extrabold text-white">
                Unlock Lifetime Pro Pass
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                One-time payment of <strong>$12</strong>. No subscriptions. Delivered instantly.
              </p>
            </div>

            {checkoutStatus === "success" ? (
              <div className="p-5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-sm font-bold text-white">Order Confirmed!</p>
                <p className="text-xs text-slate-300">
                  Your Pro License Key has been sent to{" "}
                  <strong className="text-emerald-300">{checkoutEmail}</strong>.
                </p>
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="w-full mt-2 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="checkout-email-input"
                    className="block text-xs font-bold text-slate-300 mb-1.5"
                  >
                    Where should we send your License Key?
                  </label>
                  <input
                    id="checkout-email-input"
                    type="email"
                    required
                    value={checkoutEmail}
                    onChange={(e) => setCheckoutEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-4 py-3 rounded-xl bg-[#090A10] border border-white/10 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] text-slate-400 space-y-1">
                  <div className="flex justify-between text-white font-semibold">
                    <span>Refinzi Pro Perpetual License</span>
                    <span className="font-mono text-emerald-400">$12.00</span>
                  </div>
                  <div>Zero account registration required &bull; 3-click checkout</div>
                </div>
                <button
                  type="submit"
                  disabled={checkoutStatus === "processing"}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm shadow-xl shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {checkoutStatus === "processing" ? "Processing..." : "Complete Order ($12)"}
                </button>
                <p className="text-[10px] text-center text-slate-500">
                  256-bit encrypted checkout &bull; 14-day 10-hour guarantee
                </p>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ══ EXIT INTENT MODAL ══ */}
      {showExitModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="relative w-full max-w-md rounded-2xl border border-indigo-500/30 bg-[#12141F] p-6 sm:p-7 shadow-2xl">
            <button
              onClick={() => setShowExitModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-center mb-5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2.5 py-0.5 rounded-full inline-block mb-3">
                Wait! Free Resource Before You Go
              </span>
              <h3 id="exit-modal-title" className="text-xl font-extrabold text-white">
                Grab Our 50 Expert Prompt Frameworks
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Get our curated Notion swipe file with 50 senior-level prompt specifications for coding,
                strategy, and marketing. 100% free.
              </p>
            </div>
            {exitStatus === "success" ? (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2">
                <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-white">Swipe File Sent!</p>
                <p className="text-[11px] text-slate-300">Check your inbox for the Notion template link.</p>
              </div>
            ) : (
              <form onSubmit={handleExitSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  value={exitEmail}
                  onChange={(e) => setExitEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 rounded-xl bg-[#090A10] border border-white/10 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
                >
                  Send Me The 50 Frameworks
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── CSS Animations ── */}
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}
