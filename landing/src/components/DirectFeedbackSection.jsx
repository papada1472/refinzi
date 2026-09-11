import React, { useState } from "react";
import { Lightbulb, Phone, Calendar, Send, CheckCircle2, Sparkles, ExternalLink, MessageSquare, X } from "lucide-react";
import { Reveal } from "./Reveal.jsx";
import { Badge } from "./ui/badge.jsx";

const CAL_LINK = "https://cal.com/rahul-mangla-ub8se9/30min";
const WHATSAPP_URL = "https://wa.me/919971271291?text=Hi%20Rahul,%20I'm%20reaching%20out%20about%20Refinzi!";
const WHATSAPP_NUMBER = "+91-9971271291";

export function DirectFeedbackSection() {
  const [feedbackType, setFeedbackType] = useState("feature");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSubmitting(true);

    const payload = {
      _subject: `[Refinzi Feedback] ${feedbackType.toUpperCase()} - ${new Date().toLocaleDateString()}`,
      category: feedbackType.toUpperCase(),
      message: message.trim(),
      email: email.trim() || "Anonymous",
      submittedAt: new Date().toLocaleString(),
      _template: "table",
      _captcha: "false"
    };

    try {
      await fetch("https://formsubmit.co/ajax/contact@refinzi.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });
    } catch (_) {}

    try {
      const existing = JSON.parse(localStorage.getItem("refinzi_user_feedback") || "[]");
      existing.push(payload);
      localStorage.setItem("refinzi_user_feedback", JSON.stringify(existing));
    } catch (_) {}

    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      setMessage("");
      setSubmitted(false);
      setIsModalOpen(false);
    }, 2500);
  };

  const handleOpenCal = () => {
    if (typeof window !== "undefined" && window.Cal) {
      try {
        window.Cal.ns["30min"]("modal", {
          calLink: "rahul-mangla-ub8se9/30min",
          config: { layout: "month_view", useSlotsViewOnSmallScreen: "true" },
        });
        return;
      } catch (_) {}
    }
    window.open(CAL_LINK, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="py-10 sm:py-14 border-t border-white/[0.06] bg-zinc-950/40 relative overflow-hidden" id="feedback">
      <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
        <Reveal>
          <div className="text-center max-w-lg mx-auto">
            <Badge variant="outline" className="text-blue-400 border-blue-500/30 bg-blue-950/20 text-[11px]">
              ⚡ Direct Line
            </Badge>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-white">
              Direct Feedback &amp; Founder Channels
            </h2>
            <p className="mt-1 text-zinc-300 text-xs sm:text-sm">
              We ship weekly. Tell us what to build or connect with the architect directly.
            </p>
          </div>
        </Reveal>

        {/* 3-Block Matching Grid */}
        <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          
          {/* Block 1: Fast Direct Feedback Action Card */}
          <Reveal delay={0}>
            <div className="luxury-surface rounded-2xl p-4 sm:p-5 border border-white/[0.08] hover:border-blue-500/30 transition-all flex flex-col justify-between h-full group">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                      <Lightbulb className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-bold text-white">Engineering Feedback</span>
                  </div>
                  <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                    Direct Review
                  </span>
                </div>

                <div className="mt-3 space-y-2.5">
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Have a feature request, found an edge case, or want support for a new model architecture? We read every submission.
                  </p>
                  
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] bg-white/[0.04] border border-white/[0.08] text-zinc-300 px-2 py-0.5 rounded-md font-medium">
                      💡 Feature Requests
                    </span>
                    <span className="text-[10px] bg-white/[0.04] border border-white/[0.08] text-zinc-300 px-2 py-0.5 rounded-md font-medium">
                      🐛 Bug Reports
                    </span>
                    <span className="text-[10px] bg-white/[0.04] border border-white/[0.08] text-zinc-300 px-2 py-0.5 rounded-md font-medium">
                      ⚡ Prompt Blueprints
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600/15 hover:bg-blue-600/25 text-blue-300 border border-blue-500/30 hover:border-blue-400/50 transition-all cursor-pointer touch-manipulation shadow-sm"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Send Product Feedback</span>
                </button>
              </div>
            </div>
          </Reveal>

          {/* Block 2: WhatsApp Instant Line */}
          <Reveal delay={70}>
            <div className="luxury-surface rounded-2xl p-4 sm:p-5 border border-white/[0.08] hover:border-emerald-500/30 transition-all flex flex-col justify-between h-full group">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                      <Phone className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-bold text-white">Instant WhatsApp</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Live
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Chat directly with Rahul. Get quick onboarding help, request custom API models, or report issues.
                  </p>
                  <div className="rounded-xl bg-zinc-950/70 p-2.5 border border-emerald-500/20 text-xs font-mono text-emerald-300 flex items-center justify-between">
                    <span>{WHATSAPP_NUMBER}</span>
                    <span className="text-[10px] text-zinc-400">Avg &lt; 10m</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/[0.06]">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600/15 hover:bg-blue-600/25 text-blue-300 border border-blue-500/30 hover:border-blue-400/50 transition-all touch-manipulation cursor-pointer shadow-sm"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Chat on WhatsApp</span>
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </a>
              </div>
            </div>
          </Reveal>

          {/* Block 3: Cal.com 30-Min 1-on-1 */}
          <Reveal delay={140}>
            <div className="luxury-surface rounded-2xl p-4 sm:p-5 border border-white/[0.08] hover:border-purple-500/30 transition-all flex flex-col justify-between h-full group">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                      <Calendar className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-bold text-white">1-on-1 Walkthrough</span>
                  </div>
                  <span className="text-[10px] font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                    30 Min
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Book a video session with the founder. We will optimize your workflow, configure your custom models, and demo power tips.
                  </p>
                  <div className="rounded-xl bg-zinc-950/70 p-2.5 border border-purple-500/20 text-xs text-zinc-300 space-y-1">
                    <div className="flex items-center gap-1 text-zinc-300 font-medium text-[11px]">
                      <Sparkles className="h-3 w-3 text-purple-400" />
                      <span>Workflow &amp; Model Optimization</span>
                    </div>
                    <div className="text-[10px] text-zinc-400">Instant Google Meet invite</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={handleOpenCal}
                  className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600/15 hover:bg-blue-600/25 text-blue-300 border border-blue-500/30 hover:border-blue-400/50 transition-all cursor-pointer touch-manipulation shadow-sm"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Book 30-Min Call</span>
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </button>
              </div>
            </div>
          </Reveal>

        </div>
      </div>

      {/* Spacious Feedback Modal to eliminate card crowding */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#10141e] p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close feedback dialog"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-8 w-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Send Direct Engineering Feedback</h3>
                <p className="text-xs text-zinc-400">Submitted directly to Rahul &amp; the engineering roadmap</p>
              </div>
            </div>

            {/* Category Pills */}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setFeedbackType("feature")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  feedbackType === "feature"
                    ? "bg-blue-600 text-white shadow-md ring-1 ring-blue-400"
                    : "bg-zinc-900 text-zinc-300 hover:text-white border border-white/10"
                }`}
              >
                💡 Feature
              </button>
              <button
                type="button"
                onClick={() => setFeedbackType("bug")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  feedbackType === "bug"
                    ? "bg-purple-600 text-white shadow-md ring-1 ring-purple-400"
                    : "bg-zinc-900 text-zinc-300 hover:text-white border border-white/10"
                }`}
              >
                🐛 Bug Report
              </button>
              <button
                type="button"
                onClick={() => setFeedbackType("general")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  feedbackType === "general"
                    ? "bg-emerald-600 text-white shadow-md ring-1 ring-emerald-400"
                    : "bg-zinc-900 text-zinc-300 hover:text-white border border-white/10"
                }`}
              >
                💬 Custom Idea
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label htmlFor="modal-feedback-message" className="block text-xs font-semibold text-zinc-300 mb-1">
                  Your Message or Request
                </label>
                <textarea
                  id="modal-feedback-message"
                  name="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder={
                    feedbackType === "feature"
                      ? "Describe the feature or workflow that would make Refinzi 10x better..."
                      : feedbackType === "bug"
                      ? "Describe the issue or error you encountered..."
                      : "Share any prompt templates, models, or suggestions..."
                  }
                  className="w-full rounded-xl bg-zinc-950 p-3.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 border border-white/15 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none font-sans"
                  required
                />
              </div>

              <div>
                <label htmlFor="modal-feedback-email" className="block text-xs font-semibold text-zinc-300 mb-1">
                  Your Email (Optional, for direct response)
                </label>
                <input
                  id="modal-feedback-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl bg-zinc-950 px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 border border-white/15 focus:border-blue-400 focus:outline-none font-sans"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || submitted || !message.trim()}
                  className={`min-h-[42px] flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    submitted
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30 disabled:opacity-50"
                  }`}
                >
                  {submitted ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Received! Thank you.</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>{isSubmitting ? "Sending..." : "Submit to Engineering"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default DirectFeedbackSection;
