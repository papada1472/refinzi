import React from "react";
import { ShieldCheck, Github, Mail, Calendar, Phone, MessageSquare } from "lucide-react";
import { Reveal } from "./Reveal.jsx";

const CAL_LINK = "https://cal.com/rahul-mangla-ub8se9/30min";
const WHATSAPP_URL = "https://wa.me/919971271291?text=Hi%20Rahul,%20I'm%20reaching%20out%20about%20Refinzi!";

export function FounderSection() {
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
    <section className="py-12 sm:py-16 border-t border-white/[0.06] bg-[#0A0D14]" id="founder">
      <div className="mx-auto max-w-[800px] px-4 sm:px-6">
        <Reveal>
          <div className="rounded-2xl border border-white/[0.08] bg-[#121620] p-6 sm:p-8 shadow-xl relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left">
              {/* Founder Avatar with verification badge */}
              <div className="relative shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&crop=faces&q=80"
                  alt="Rahul Mangla"
                  width="80"
                  height="80"
                  className="h-20 w-20 sm:h-22 sm:w-22 rounded-2xl object-cover ring-2 ring-blue-500/30 shadow-md"
                />
                <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-1 ring-2 ring-[#121620]" title="Verified Founder">
                  <ShieldCheck className="h-3 w-3 text-zinc-950" />
                </div>
              </div>

              {/* Bio & Links */}
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">Rahul Mangla</h3>
                    <p className="text-xs text-blue-400 font-medium">Founder &amp; Systems Architect · Refinzi</p>
                  </div>
                  {/* Icon-only secondary links */}
                  <div className="flex items-center gap-2">
                    <a
                      href="https://github.com/papada1472/refinzi"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="GitHub Repository"
                      aria-label="GitHub Repository"
                      className="p-2 text-zinc-400 hover:text-white rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] transition-colors"
                    >
                      <Github className="h-4 w-4" />
                    </a>
                    <a
                      href="mailto:contact@refinzi.com"
                      title="Email Rahul"
                      aria-label="Email Rahul"
                      className="p-2 text-zinc-400 hover:text-white rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="WhatsApp Direct"
                      aria-label="WhatsApp Direct"
                      className="p-2 text-emerald-400 hover:text-emerald-300 rounded-lg border border-emerald-500/20 bg-emerald-950/30 hover:bg-emerald-950/50 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed italic">
                  "I was re-prompting ChatGPT 10 times for every deliverable, and re-rolling Midjourney 20 times per image. I built Refinzi to stop the context switching. Highlight in any app, click the Orb, get client-grade prompts in 2 seconds."
                </p>

                {/* Primary Action Button */}
                <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <button
                    type="button"
                    onClick={handleOpenCal}
                    className="inline-flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Book 15-Min Onboarding Call</span>
                  </button>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 shadow-sm">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>100% Personal 14-Day Refund Guarantee</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default FounderSection;
