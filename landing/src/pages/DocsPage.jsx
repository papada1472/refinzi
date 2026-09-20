import React from "react";
import { ArrowLeft, BookOpen, Zap, Brain, Key, Undo2, ShieldCheck } from "lucide-react";

export default function DocsPage() {
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
            <span>Refinzi Docs</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[900px] px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
          <BookOpen className="h-4 w-4" />
          <span>User Manual &amp; Architecture Guide</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Refinzi Documentation
        </h1>
        <p className="mt-2 text-xs text-zinc-500 font-mono">
          Universal Browser Prompt Layer • Manifest V3
        </p>

        <div className="my-8 border-t border-white/[0.08]" />

        <div className="space-y-8 text-sm leading-relaxed">
          {/* Quick Overview */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">How Refinzi Works</h2>
            <p className="text-xs sm:text-sm text-zinc-300">
              Refinzi docks a subtle Orb next to any active text input or composer across ChatGPT, Claude, Gemini, Perplexity, GitHub, Notion, Gmail, and custom web applications. The Orb has two distinct interaction modes:
            </p>
            <div className="grid gap-4 sm:grid-cols-2 mt-4">
              <div className="p-5 rounded-xl bg-[#14151F] border border-white/[0.06]">
                <div className="flex items-center gap-2 font-bold text-white text-sm mb-2">
                  <Zap className="w-4 h-4 text-indigo-400" />
                  <span>Click (&lt; 350ms): Better Mode</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Extracts raw objective, fixes ambiguity, and structures deliverables with zero questionnaires. Instant 1-click execution.
                </p>
              </div>
              <div className="p-5 rounded-xl bg-[#14151F] border border-white/[0.06]">
                <div className="flex items-center gap-2 font-bold text-white text-sm mb-2">
                  <Brain className="w-4 h-4 text-emerald-400" />
                  <span>Hold (≥ 350ms): Expert Mode</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Performs deep task reconstruction (Understand → Infer → Assume → Execute). Locks scope, states operational assumptions, and outputs practitioner briefings.
                </p>
              </div>
            </div>
          </section>

          {/* Undo and Hotkeys */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Undo2 className="h-5 w-5 text-indigo-400" />
              Undo &amp; Keyboard Shortcuts
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300">
              Refinzi modifies text using native <code className="text-indigo-300 font-mono">insertText</code> API calls, keeping the browser's native Undo stack intact.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-zinc-300">
              <li><strong>Undo:</strong> Standard <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono text-xs">Ctrl+Z</kbd> or click the floating <code className="text-zinc-200 font-mono">[↩ Undo]</code> toast.</li>
              <li><strong>Better Prompt Shortcut:</strong> <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono text-xs">Ctrl+Shift+B</kbd> (Mac: <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono text-xs">Cmd+Shift+B</kbd>)</li>
              <li><strong>Expert Prompt Shortcut:</strong> <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono text-xs">Ctrl+Shift+E</kbd> (Mac: <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono text-xs">Cmd+Shift+E</kbd>)</li>
            </ul>
          </section>

          {/* BYOK Configuration */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Key className="h-5 w-5 text-amber-400" />
              Bring-Your-Own-Key (BYOK) Setup
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300">
              By default, Refinzi runs 100% on-device with zero API keys. To connect your own preferred AI model:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm text-zinc-300">
              <li>Click the Refinzi extension icon in your browser toolbar to open the control panel.</li>
              <li>Navigate to <strong>Settings</strong>.</li>
              <li>Select your provider: <em>OpenAI, Anthropic, Google Gemini, DeepSeek, or OpenRouter</em>.</li>
              <li>Paste your API key and click <strong>Verify &amp; Save</strong>.</li>
              <li>Your key is encrypted in local extension storage and used strictly for your prompt requests over direct HTTPS.</li>
            </ol>
          </section>

          {/* Privacy Note */}
          <section className="rounded-2xl border border-white/[0.08] bg-[#14151F] p-6 flex items-start gap-4">
            <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-white text-sm">Privacy &amp; Security Assurance</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Refinzi does not operate external prompt storage servers. Read our full <a href="/privacy/" className="text-indigo-400 underline">Privacy Policy</a> to review our data guarantees and permissions specifications.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
