import React from "react";
import { ArrowLeft, FileText, CheckCircle, ShieldAlert } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#08090c] text-zinc-300 font-sans selection:bg-indigo-500/30 selection:text-white">
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#08090c]/90 backdrop-blur-xl px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-[900px] items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-indigo-400" />
            <span>Back to Home</span>
          </a>
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            <span>Refinzi 2.1.0</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[900px] px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
          <FileText className="h-4 w-4" />
          <span>Legal Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Terms of Service — Refinzi 2.1.0
        </h1>
        <p className="mt-2 text-xs text-zinc-500 font-mono">
          Last Updated: September 19, 2026 • License: MIT Open Source
        </p>

        <div className="my-8 border-t border-white/[0.08]" />

        <div className="space-y-8 text-sm leading-relaxed">
          <section className="rounded-2xl border border-white/[0.08] bg-[#14151F] p-6 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              1. Open Source License (MIT)
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300">
              Refinzi is open-source software released under the MIT License. You are free to inspect, run, modify, and distribute the software subject to the terms of the MIT License.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. Acceptable Use</h2>
            <p className="text-xs sm:text-sm text-zinc-300">
              Refinzi is provided to enhance prompt creation in web-based text environments. You agree not to use the software for any unlawful activities or to generate malicious prompts intended to bypass security safeguards of third-party AI models.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. Third-Party AI Services</h2>
            <p className="text-xs sm:text-sm text-zinc-300">
              Refinzi connects directly to third-party services (such as OpenAI, Anthropic, Google Gemini, and OpenRouter) when configured by the user via BYOK. Your use of these services is subject to their respective terms of service and acceptable use policies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              4. Disclaimer of Warranties
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300">
              The software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and noninfringement.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">5. Contact</h2>
            <p className="text-xs sm:text-sm text-zinc-300">
              If you have any questions regarding these terms, please contact us at <a href="mailto:contact@refinzi.com" className="text-indigo-400 underline">contact@refinzi.com</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
