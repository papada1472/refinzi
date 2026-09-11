import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Download,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  Copy,
  CheckCheck,
  ChevronUp,
} from "lucide-react";

// Pre-packaged objection crusher answers
const OBJECTION_ANSWERS = {
  privacy: {
    title: "100% Local DPAPI Privacy",
    text: "Refinzi runs entirely on your local Windows PC. Zero prompt telemetry, zero cloud logging. Your API keys are encrypted with Windows DPAPI (hardware-backed). Your prompts and code never touch our servers.",
  },
  byok: {
    title: "How Free BYOK Works",
    text: "BYOK means 'Bring Your Own Key'. Google Gemini gives thousands of free requests every month, and DeepSeek costs pennies for millions of tokens. You can use Refinzi 100% free forever without any subscription or credit card.",
  },
  smartscreen: {
    title: "Windows SmartScreen Walkthrough",
    text: "Refinzi is an indie-developed native desktop app verified 100% clean on VirusTotal (0/72 detections). Because we don't pay Microsoft $500/year for an enterprise EV certificate, Windows may show a blue prompt. Simply click 'More Info' → 'Run Anyway' to install.",
  },
  difference: {
    title: "Why Not Just Type in ChatGPT?",
    text: "ChatGPT requires you to switch browser tabs, craft complex prompt instructions manually, and copy-paste back and forth. Refinzi lives at your cursor in any Windows app (via Ctrl+Alt+Space or the Orb) and rebuilds messy thoughts into 5-block production architectures in 2 seconds flat.",
  },
};

export function AiConversionConcierge({ onDownload, onOpenOffer, osType = "windows", currency = "$", hasStickyBar = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [activeNudge, setActiveNudge] = useState(null);
  const [isNudgeDismissed, setIsNudgeDismissed] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const chatBottomRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      sender: "agent",
      id: "welcome",
      text: "👋 Hey! I'm your 24/7 Refinzi Concierge. Got a question about privacy, pricing, or want to see how Refinzi turns your rough prompt into a master-grade output?",
      chips: [
        { label: "🛡️ 100% Private?", key: "privacy" },
        { label: "⚡ Free BYOK?", key: "byok" },
        { label: "💻 SmartScreen Help", key: "smartscreen" },
        { label: "🎯 Test My Prompt", key: "test_prompt" },
        { label: "📞 Talk to Founder", key: "contact_founder" },
      ],
    },
  ]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (isOpen && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]);

  // Context-Aware Proactive Nudge Engine
  useEffect(() => {
    if (isNudgeDismissed || isOpen) return;

    // 1. Mobile/Non-Windows Nudge
    if (osType !== "windows") {
      const timer = setTimeout(() => {
        if (!isNudgeDismissed && !isOpen) {
          setActiveNudge({
            type: "mobile",
            text: "📱 Visiting on mobile or Mac? Refinzi is for Windows. Want us to send the installer to your PC?",
            actionLabel: "Send Installer",
            actionType: "non_windows",
          });
        }
      }, 5000);
      return () => clearTimeout(timer);
    }

    // 2. Hero Dwell Nudge (after 14s idle on page)
    const heroDwellTimer = setTimeout(() => {
      if (!hasInteracted && !isNudgeDismissed && !isOpen) {
        setActiveNudge({
          type: "hero",
          text: "💡 Got 3 rough words? Type them into Refinzi and see a pinpoint prompt built in 2 seconds.",
          actionLabel: "Test a Prompt",
          actionType: "open_chat",
        });
      }
    }, 14000);

    // 3. Scroll position watcher (Pricing dwell)
    const handleScroll = () => {
      if (isNudgeDismissed || isOpen) return;
      const pricingEl = document.getElementById("pricing");
      if (pricingEl) {
        const rect = pricingEl.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.6 && rect.bottom >= window.innerHeight * 0.2) {
          setActiveNudge({
            type: "pricing",
            text: "✨ Unsure which tier? Free BYOK has no limits if you use free Gemini/DeepSeek keys!",
            actionLabel: "Ask a Question",
            actionType: "open_chat",
          });
        }
      }
    };

    // 4. Desktop Exit Intent (mouse leaving viewport top)
    const handleMouseLeave = (e) => {
      if (e.clientY <= 10 && !isNudgeDismissed && !isOpen && !hasInteracted) {
        setActiveNudge({
          type: "exit",
          text: "⚡ Wait! Refinzi is 100% free forever with 0 signup. Download the .exe and test it in 10 seconds.",
          actionLabel: "Download Free (.exe)",
          actionType: "download",
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      clearTimeout(heroDwellTimer);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isNudgeDismissed, isOpen, hasInteracted, osType]);

  const handleOpenChat = () => {
    setIsOpen(true);
    setHasInteracted(true);
    setActiveNudge(null);
  };

  const handleDismissNudge = (e) => {
    e.stopPropagation();
    setActiveNudge(null);
    setIsNudgeDismissed(true);
  };

  const handleNudgeAction = (actionType) => {
    if (actionType === "download") {
      onDownload();
      setActiveNudge(null);
    } else {
      handleOpenChat();
    }
  };

  // Answer objection or rebuild prompt
  const handleChipClick = (chipKey) => {
    setHasInteracted(true);
    if (chipKey === "test_prompt") {
      setMessages((prev) => [
        ...prev,
        {
          sender: "user",
          id: `user-${Date.now()}`,
          text: "Can I test my rough prompt?",
        },
        {
          sender: "agent",
          id: `agent-${Date.now()}`,
          text: "Absolutely! Type a few rough words into the box below (e.g., 'cyberpunk sports car' or 'SaaS pricing table') and watch me synthesize a pinpoint master prompt.",
        },
      ]);
      return;
    }

    if (chipKey === "contact_founder") {
      setMessages((prev) => [
        ...prev,
        {
          sender: "user",
          id: `user-${Date.now()}`,
          text: "Can I connect with the founder directly?",
        },
        {
          sender: "agent",
          id: `agent-${Date.now()}`,
          text: "Rahul (the creator of Refinzi) is available directly. Feel free to book a 30-min call, chat on WhatsApp, or send an email:",
          contactLinks: true,
        },
      ]);
      return;
    }

    const answer = OBJECTION_ANSWERS[chipKey];
    if (answer) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "user",
          id: `user-${Date.now()}`,
          text: `Tell me about: ${answer.title}`,
        },
        {
          sender: "agent",
          id: `agent-${Date.now()}`,
          text: answer.text,
          showCta: true,
        },
      ]);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    const query = inputVal.trim();
    if (!query) return;

    setInputVal("");
    setHasInteracted(true);

    // Append user message
    const userMsg = {
      sender: "user",
      id: `user-${Date.now()}`,
      text: query,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const lower = query.toLowerCase();

      // Check for objection queries
      if (lower.includes("price") || lower.includes("cost") || lower.includes("free") || lower.includes("pay")) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "agent",
            id: `agent-${Date.now()}`,
            text: `Refinzi is 100% Free Forever with BYOK (Bring Your Own Key). You never have to pay a monthly fee. If you want to support development, we also offer a Lifetime Supporter Pro license with priority model presets.`,
            showCta: true,
          },
        ]);
        setIsTyping(false);
        return;
      }

      if (lower.includes("private") || lower.includes("security") || lower.includes("safe") || lower.includes("data")) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "agent",
            id: `agent-${Date.now()}`,
            text: `100% Local DPAPI isolation. Your prompts, source code, and API keys are stored in encrypted Windows credential stores. Refinzi does not operate a central prompt database or cloud telemetry.`,
            showCta: true,
          },
        ]);
        setIsTyping(false);
        return;
      }

      if (lower.includes("smartscreen") || lower.includes("virus") || lower.includes("windows alert") || lower.includes("block")) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "agent",
            id: `agent-${Date.now()}`,
            text: `Refinzi is certified clean on VirusTotal (0/72 detections). Windows SmartScreen may show an alert because we are an indie open-source tool. Click 'More Info' and then 'Run Anyway' to proceed safely.`,
            showCta: true,
          },
        ]);
        setIsTyping(false);
        return;
      }

      // Default: Live Prompt Rebuild Synthesizer
      let synthesizedPrompt = "";
      if (lower.includes("car") || lower.includes("photo") || lower.includes("art") || lower.includes("render") || lower.includes("image")) {
        synthesizedPrompt = `/imagine prompt: cinematic 35mm anamorphic wide tracking shot of ${query}, raytraced volumetric lighting, high-frequency surface detail, photorealistic Octane 8k render, depth of field f/1.4 --ar 16:9 --style raw --v 6.0`;
      } else if (lower.includes("code") || lower.includes("react") || lower.includes("component") || lower.includes("table") || lower.includes("ui") || lower.includes("api")) {
        synthesizedPrompt = `Task: Production-grade implementation for: "${query}"
Architecture: Modular React component tree with TypeScript strict typing
Rules: Tailwind CSS utility classes, kinetic micro-interactions, full ARIA keyboard accessibility, zero layout shift.`;
      } else {
        synthesizedPrompt = `Role: Principal Direct-Response Systems Architect
Task: Transform rough objective: "${query}"
1. Framework: Eliminate ambiguity, define target context, establish primary conversion metric.
2. Architecture Scaffolding: Structural section tree, component tokens, and boundary conditions.
3. Strict Constraints: Zero filler adjectives, enforce execution-grade precision for Claude & ChatGPT.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          id: `agent-${Date.now()}`,
          text: `⚡ Here is how Refinzi transforms "${query}" into an execution-grade prompt:`,
          promptOutput: synthesizedPrompt,
          showCta: true,
        },
      ]);
      setIsTyping(false);
    }, 450);
  };

  const handleCopyPrompt = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className={`fixed ${hasStickyBar ? "bottom-20" : "bottom-6"} right-4 sm:right-6 z-50 flex flex-col items-end transition-all duration-300`}>
      {/* Contextual Proactive Nudge Bubble */}
      {activeNudge && !isOpen && (
        <div className="mb-3 max-w-xs sm:max-w-sm rounded-2xl border border-blue-500/30 bg-zinc-950/95 p-3.5 shadow-2xl shadow-blue-900/30 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
              <Sparkles className="h-3.5 w-3.5 text-blue-300 animate-spin" style={{ animationDuration: "3s" }} />
              <span>Refinzi Concierge</span>
            </div>
            <button
              onClick={handleDismissNudge}
              className="text-zinc-500 hover:text-zinc-300 text-xs p-0.5 rounded cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-1.5 text-xs text-zinc-200 leading-relaxed font-medium">
            {activeNudge.text}
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={() => handleNudgeAction(activeNudge.actionType)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
            >
              <span>{activeNudge.actionLabel}</span>
              <ArrowRight className="h-3 w-3" />
            </button>
            <button
              onClick={handleDismissNudge}
              className="text-[11px] text-zinc-400 hover:text-zinc-200 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main AI Concierge Chat Modal */}
      {isOpen && (
        <div className="mb-3 w-[340px] sm:w-[390px] h-[490px] flex flex-col rounded-2xl border border-white/[0.12] bg-zinc-950/95 shadow-2xl shadow-blue-950/40 backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-zinc-900/60">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 shadow-md shadow-blue-600/30">
                <span className="text-sm">⚡</span>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
              </div>
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  Refinzi AI Concierge
                  <span className="text-[9px] font-normal px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                    Online
                  </span>
                </p>
                <p className="text-[10px] text-zinc-400">24/7 Conversion &amp; Prompt Support</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Close concierge"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Conversation Stream */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
            {messages.map((msg, i) => (
              <div
                key={msg.id || i}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3 leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/20"
                      : "bg-zinc-900/90 text-zinc-200 border border-white/[0.06] rounded-bl-none shadow-sm"
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Synthesized Prompt Box */}
                  {msg.promptOutput && (
                    <div className="mt-2.5 rounded-xl bg-zinc-950/90 border border-blue-500/30 p-2.5 text-[11px] font-mono text-zinc-200 relative group">
                      <div className="flex items-center justify-between pb-1 mb-1 border-b border-white/[0.06] text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                        <span>⚡ Production Output</span>
                        <button
                          onClick={() => handleCopyPrompt(msg.promptOutput, i)}
                          className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedIndex === i ? (
                            <span className="text-emerald-400 flex items-center gap-0.5">
                              <CheckCheck className="h-3 w-3" /> Copied
                            </span>
                          ) : (
                            <span className="flex items-center gap-0.5">
                              <Copy className="h-3 w-3" /> Copy
                            </span>
                          )}
                        </button>
                      </div>
                      <p className="whitespace-pre-wrap select-all">{msg.promptOutput}</p>
                    </div>
                  )}

                  {/* Optional In-Chat CTA */}
                  {msg.showCta && (
                    <div className="mt-2.5 pt-2 border-t border-white/[0.08] flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={onDownload}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-sm"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download Free (.exe)</span>
                      </button>
                      <button
                        onClick={onOpenOffer}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-semibold text-[11px] border border-white/10 transition-colors cursor-pointer"
                      >
                        <Sparkles className="h-3 w-3 text-amber-300" />
                        <span>Supporter Pro</span>
                      </button>
                    </div>
                  )}

                  {/* Founder Direct Contact Links */}
                  {msg.contactLinks && (
                    <div className="mt-2.5 pt-2 border-t border-white/[0.08] flex flex-wrap items-center gap-1.5">
                      <a
                        href="https://cal.com/rahul-mangla-r36uxv/30min"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-colors shadow-sm"
                      >
                        📅 Book 30-Min Call
                      </a>
                      <a
                        href="https://wa.me/917988358485"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-[11px] transition-colors shadow-sm"
                      >
                        💬 WhatsApp Rahul
                      </a>
                      <a
                        href="mailto:contact@refinzi.com"
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] border border-white/10 transition-colors"
                      >
                        ✉️ Email
                      </a>
                    </div>
                  )}

                  {/* Objection Chips */}
                  {msg.chips && (
                    <div className="mt-2.5 pt-2 border-t border-white/[0.08] flex flex-wrap gap-1.5">
                      {msg.chips.map((chip) => (
                        <button
                          key={chip.key}
                          onClick={() => handleChipClick(chip.key)}
                          className="px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/[0.08] text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs pl-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-zinc-500 font-mono">Synthesizing...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSend} className="p-2.5 border-t border-white/[0.08] bg-zinc-900/60">
            <div className="flex items-center gap-2 rounded-xl bg-zinc-950 border border-white/[0.08] px-3 py-1.5 focus-within:border-blue-500/50">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask about privacy or type rough words..."
                className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputVal.trim()}
                className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white transition-colors cursor-pointer shrink-0"
                aria-label="Send message"
              >
                <Send className="h-3 w-3" />
              </button>
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-300 px-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-400" /> 100% Free &amp; Private
              </span>
              <span>Sub-200ms Synthesis</span>
            </div>
          </form>
        </div>
      )}

      {/* Floating Ambient Orb Launcher Trigger */}
      <button
        type="button"
        onClick={handleOpenChat}
        className="group relative flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-3 text-white shadow-xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20"
        title="Chat with Refinzi 24/7 AI Concierge"
        aria-label="Open Refinzi AI Concierge chat"
      >
        <div className="relative flex items-center justify-center">
          <MessageSquare className="h-5 w-5 group-hover:rotate-6 transition-transform" />
          {/* Notification Dot */}
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
          </span>
        </div>
        <span className="hidden sm:inline text-xs font-bold pr-1">Ask Concierge</span>
      </button>
    </div>
  );
}
