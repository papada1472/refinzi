import React from "react";
import { ArrowLeft, Shield, Lock, EyeOff, Server, Database, Mail, CheckCircle } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#08090c] text-zinc-300 font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Top Header */}
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
            <span>Refinzi</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[900px] px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
          <Shield className="h-4 w-4" />
          <span>Chrome Web Store &amp; User Data Compliance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Privacy Policy — Refinzi
        </h1>
        <p className="mt-2 text-xs text-zinc-500 font-mono">
          Effective Date: September 19, 2026 • Version: 2.1.0 (WebExtension MV3)
        </p>

        <div className="my-8 border-t border-white/[0.08]" />

        <div className="space-y-8 text-sm leading-relaxed">
          {/* Mandatory Chrome Web Store Declarations */}
          <section className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-6 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
              <Lock className="h-5 w-5" />
              <span>Core Privacy Guarantees &amp; Reviewer Declarations</span>
            </div>
            <p className="text-zinc-200 text-sm font-medium">
              <strong>Refinzi does not collect, store, or transmit user keystrokes, passwords, or prompt history to external servers.</strong>
            </p>
            <p className="text-zinc-300 text-xs sm:text-sm">
              <strong>Refinzi is a user-initiated productivity tool. It only modifies text when the user explicitly clicks the Orb or uses a keyboard shortcut. It does not auto-submit forms or scrape AI outputs.</strong>
            </p>
          </section>

          {/* Single Purpose */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-indigo-400" />
              1. Single Purpose Specification
            </h2>
            <p className="text-zinc-300 text-xs sm:text-sm">
              Refinzi operates strictly under Chrome Web Store's Single Purpose Policy: to serve as a user-initiated in-composer prompt layer. It reads user-entered drafts solely when the user clicks or holds the Refinzi Orb, replaces the text in-place with a structured prompt, and provides an instant undo affordance.
            </p>
          </section>

          {/* Information We Do Not Collect */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-purple-400" />
              2. Information We Do NOT Collect or Transmit
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-zinc-300 text-xs sm:text-sm">
              <li>
                <strong>No Keystroke Logging:</strong> Refinzi does not listen to or record keystrokes. It only detects user interaction when the cursor focuses on an input element or when the Orb is explicitly clicked.
              </li>
              <li>
                <strong>No Password or Sensitive Field Access:</strong> Password fields (<code className="font-mono text-indigo-300">type="password"</code>), credit card inputs, hidden fields, and sensitive forms are completely excluded from detection.
              </li>
              <li>
                <strong>No Prompt Database on External Servers:</strong> Default prompt synthesis runs entirely locally on-device inside your browser using bundled logic. Your text never leaves your machine unless you explicitly configure an external BYOK API key.
              </li>
              <li>
                <strong>No Automated Scraping or Auto-Submission:</strong> Refinzi never automatically submits forms, never presses "Send", and never scrapes web pages or AI model answers.
              </li>
              <li>
                <strong>No Analytics or Content Telemetry:</strong> We do not track what you write, who you talk to, or your prompt topics.
              </li>
            </ul>
          </section>

          {/* Permissions Justifications */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Server className="h-4 w-4 text-emerald-400" />
              3. Extension Permissions &amp; Technical Justifications
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300">
              Refinzi adheres to the principle of least privilege. In accordance with Chrome Web Store developer policies, each permission is justified as follows:
            </p>
            <div className="space-y-3 mt-2">
              <div className="p-4 rounded-xl bg-[#14151F] border border-white/[0.06]">
                <p className="font-mono text-xs font-bold text-indigo-400 mb-1">storage</p>
                <p className="text-xs text-zinc-300">
                  Used strictly to store the user's local preferences (theme, hold duration, auto-apply toggle), recent prompt transformation history, and locally encrypted Bring-Your-Own-Key (BYOK) API credentials on the device. Data is stored in <code className="font-mono text-zinc-200">chrome.storage.local</code> and is never synced to external servers.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#14151F] border border-white/[0.06]">
                <p className="font-mono text-xs font-bold text-indigo-400 mb-1">host_permissions (http://*/*, https://*/*)</p>
                <p className="text-xs text-zinc-300">
                  Required to detect user-focused editable text areas across ChatGPT, Claude, Google Gemini, Perplexity, GitHub, Notion, Gmail, and custom web composers, and inject the floating calibration Orb UI directly adjacent to the active input. It does not read, scrape, or transmit page content.
                </p>
              </div>
            </div>
          </section>

          {/* BYOK */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="h-4 w-4 text-amber-400" />
              4. Bring-Your-Own-Key (BYOK) Data Flow
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300">
              Refinzi includes an optional BYOK mode for users who wish to use their own OpenAI, Anthropic, Google Gemini, DeepSeek, or OpenRouter API keys:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-300 text-xs sm:text-sm">
              <li>API keys are stored exclusively in your local browser extension storage.</li>
              <li>Network requests are dispatched directly over encrypted HTTPS from the extension background service worker to the designated provider's official API endpoint.</li>
              <li>Web pages and host DOM contexts never have access to your API keys.</li>
              <li>Refinzi operates zero intermediary proxy servers — there is no man-in-the-middle.</li>
            </ul>
          </section>

          {/* User Rights & Deletion */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">5. Data Retention &amp; User Control</h2>
            <p className="text-xs sm:text-sm text-zinc-300">
              Because all history and settings are stored locally on your device in <code className="font-mono text-indigo-300">chrome.storage.local</code>, you retain 100% control over your data:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-300 text-xs sm:text-sm">
              <li>You can clear your entire prompt transformation history with one click inside the extension popup.</li>
              <li>You can remove stored BYOK API keys at any time.</li>
              <li>Uninstalling Refinzi immediately and permanently removes all stored data from your browser.</li>
            </ul>
          </section>

          {/* Contact */}
          <section className="rounded-2xl border border-white/[0.08] bg-[#14151F] p-6 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold">
              <Mail className="h-4 w-4 text-indigo-400" />
              <span>Contact &amp; Questions</span>
            </div>
            <p className="text-xs text-zinc-400">
              For any questions regarding this Privacy Policy or Chrome Web Store compliance, contact the maintainer:
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <a
                href="mailto:contact@refinzi.com"
                className="text-xs font-mono text-indigo-400 hover:text-indigo-300 underline"
              >
                contact@refinzi.com
              </a>
              <span className="text-zinc-600">•</span>
              <a
                href="https://github.com/papada1472/refinzi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-300 hover:text-white underline"
              >
                GitHub Repository
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
