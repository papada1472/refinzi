import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, "../dist");
const indexPath = path.join(distDir, "index.html");

const ROUTE_METADATA = {
  docs: {
    title: "Documentation & User Manual — Refinzi",
    description: "Complete user manual, the 1-Click Refinzi Orb workflow, Click versus Hold modes, and Bring-Your-Own-Key (BYOK) setup for OpenAI, Anthropic, Gemini, and OpenRouter.",
    canonical: "https://refinzi.com/docs/",
    bodyHtml: `
      <main id="main-content" class="mx-auto max-w-[900px] px-4 py-12 sm:px-6 sm:py-16 text-zinc-300">
        <div class="mb-3 text-xs font-semibold text-blue-400 uppercase tracking-widest">User Manual &amp; Architecture Guide</div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Refinzi Documentation</h1>
        <p class="mt-2 text-xs text-zinc-500 font-mono">Universal Browser Prompt Layer • Manifest V3</p>
        <div class="my-8 border-t border-white/[0.08]"></div>
        <div class="space-y-6 text-sm leading-relaxed">
          <h2 class="text-xl font-bold text-white">How Refinzi Works</h2>
          <p>Refinzi docks a subtle Orb next to any active text input across ChatGPT, Claude, Gemini, Perplexity, GitHub, Notion, Gmail, and custom web composers.</p>
          <ul class="list-disc pl-5 space-y-2">
            <li><strong>Click (&lt; 350ms) — Better Mode:</strong> Extracts raw objective, fixes ambiguity, and structures deliverables with zero questionnaires. Instant 1-click execution.</li>
            <li><strong>Hold (≥ 350ms) — Expert Mode:</strong> Performs deep task reconstruction (Understand → Infer → Assume → Execute). Locks scope, states operational assumptions, and outputs senior practitioner briefings.</li>
            <li><strong>In-Place Replacement &amp; Undo:</strong> Uses native <code>insertText</code> API calls to preserve the browser's native Undo stack (<kbd>Ctrl+Z</kbd>) and provides a floating <kbd>[↩ Undo]</kbd> toast.</li>
            <li><strong>Shortcuts:</strong> <kbd>Ctrl+Shift+B</kbd> for Better Mode, <kbd>Ctrl+Shift+E</kbd> for Expert Mode.</li>
          </ul>
        </div>
      </main>
    `,
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "TechArticle",
          "headline": "Refinzi Official Documentation & User Manual",
          "url": "https://refinzi.com/docs/",
          "description": "User guide covering the 1-Click Refinzi Orb, Click for Better vs Hold for Expert modes, and Bring-Your-Own-Key (BYOK) setup for OpenAI, Anthropic, Gemini, and OpenRouter.",
          "author": {
            "@type": "Person",
            "name": "Rahul Mangla"
          }
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://refinzi.com/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Documentation",
              "item": "https://refinzi.com/docs/"
            }
          ]
        }
      ]
    }
  },
  privacy: {
    title: "Privacy Policy — Refinzi",
    description: "Refinzi Privacy Policy. Learn about our local-first architecture, on-device synthesis, zero prompt logging, and BYOK data safety guarantees.",
    canonical: "https://refinzi.com/privacy/",
    bodyHtml: `
      <main id="main-content" class="mx-auto max-w-[900px] px-4 py-12 sm:px-6 sm:py-16 text-zinc-300">
        <div class="mb-3 text-xs font-semibold text-blue-400 uppercase tracking-widest">Chrome Web Store &amp; User Data Compliance</div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Privacy Policy — Refinzi</h1>
        <p class="mt-2 text-xs text-zinc-500 font-mono">Effective Date: September 19, 2026 • Version: 2.1.0 (WebExtension MV3)</p>
        <div class="my-8 border-t border-white/[0.08]"></div>

        <div class="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 space-y-3 mb-8">
          <h2 class="text-emerald-400 font-bold text-base">Core Privacy Guarantees &amp; Reviewer Declarations</h2>
          <p class="text-white text-sm font-medium"><strong>Refinzi does not collect, store, or transmit user keystrokes, passwords, or prompt history to external servers.</strong></p>
          <p class="text-zinc-300 text-xs sm:text-sm"><strong>Refinzi is a user-initiated productivity tool. It only modifies text when the user explicitly clicks the Orb or uses a keyboard shortcut. It does not auto-submit forms or scrape AI outputs.</strong></p>
        </div>

        <section class="space-y-4 text-sm leading-relaxed">
          <h2 class="text-xl font-bold text-white">1. Single Purpose Specification</h2>
          <p>Refinzi operates strictly under Chrome Web Store's Single Purpose Policy: to serve as a user-initiated in-composer prompt layer. It reads user-entered drafts solely when the user clicks or holds the Refinzi Orb, replaces the text in-place with a structured prompt, and provides an instant undo affordance.</p>

          <h2 class="text-xl font-bold text-white">2. Information We Do NOT Collect or Transmit</h2>
          <ul class="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-zinc-300">
            <li><strong>No Keystroke Logging:</strong> Refinzi does not listen to or record keystrokes. It only detects user interaction when the cursor focuses on an editable input element or when the Orb is explicitly clicked.</li>
            <li><strong>No Password or Sensitive Field Access:</strong> Password fields (<code>type="password"</code>), credit card inputs, hidden fields, and sensitive forms are completely excluded from detection.</li>
            <li><strong>No Prompt Database on External Servers:</strong> Default prompt synthesis runs entirely locally on-device inside your browser using bundled logic. Your text never leaves your machine unless you explicitly configure an external BYOK API key.</li>
            <li><strong>No Automated Scraping or Auto-Submission:</strong> Refinzi never automatically submits forms, never presses "Send", and never scrapes web pages or AI model answers.</li>
            <li><strong>No Analytics or Content Telemetry:</strong> We do not track what you write, who you talk to, or your prompt topics.</li>
          </ul>

          <h2 class="text-xl font-bold text-white">3. Extension Permissions &amp; Technical Justifications</h2>
          <p>Refinzi adheres to the principle of least privilege:</p>
          <ul class="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-zinc-300">
            <li><strong>storage:</strong> Used strictly to store the user's local preferences (theme, hold duration, auto-apply toggle), recent prompt transformation history, and locally encrypted Bring-Your-Own-Key (BYOK) API credentials on the device. Data is stored in <code>chrome.storage.local</code> and is never synced to external servers.</li>
            <li><strong>host_permissions (http://*/*, https://*/*):</strong> Required to detect user-focused editable text areas across ChatGPT, Claude, Google Gemini, Perplexity, GitHub, Notion, Gmail, and custom web composers, and inject the floating calibration Orb UI directly adjacent to the active input. It does not read, scrape, or transmit page content.</li>
          </ul>

          <h2 class="text-xl font-bold text-white">4. Bring-Your-Own-Key (BYOK) Data Flow</h2>
          <p>When an optional BYOK API key is configured (OpenAI, Anthropic, Gemini, DeepSeek, OpenRouter), HTTPS API requests travel directly between the browser's background service worker and the chosen provider's official API endpoint. Host web pages and DOM scripts never have access to your credentials.</p>

          <h2 class="text-xl font-bold text-white">5. Data Retention &amp; User Control</h2>
          <p>Users can delete individual prompt history entries or clear all local extension storage with a single click inside the popup settings. Uninstalling the extension immediately purges all local keys and stored data.</p>

          <h2 class="text-xl font-bold text-white">6. Contact &amp; Privacy Inquiries</h2>
          <p>For any questions regarding this Privacy Policy or Chrome Web Store compliance, contact: <a href="mailto:contact@refinzi.com" class="text-blue-400 underline">contact@refinzi.com</a> or visit our open-source repository at <a href="https://github.com/papada1472/refinzi" class="text-blue-400 underline">GitHub</a>.</p>
        </section>
      </main>
    `,
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "name": "Privacy Policy — Refinzi",
          "url": "https://refinzi.com/privacy/",
          "description": "Refinzi Privacy Policy explaining local-first architecture, on-device synthesis, zero prompt logs, and Bring-Your-Own-Key data safety."
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://refinzi.com/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Privacy Policy",
              "item": "https://refinzi.com/privacy/"
            }
          ]
        }
      ]
    }
  },
  terms: {
    title: "Terms of Service — Refinzi",
    description: "Refinzi Terms of Service, software licensing details, and extension usage terms.",
    canonical: "https://refinzi.com/terms/",
    bodyHtml: `
      <main id="main-content" class="mx-auto max-w-[900px] px-4 py-12 sm:px-6 sm:py-16 text-zinc-300">
        <div class="mb-3 text-xs font-semibold text-blue-400 uppercase tracking-widest">Legal Agreement</div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Terms of Service — Refinzi</h1>
        <p class="mt-2 text-xs text-zinc-500 font-mono">Last Updated: September 19, 2026 • License: MIT Open Source</p>
        <div class="my-8 border-t border-white/[0.08]"></div>
        <div class="space-y-6 text-sm leading-relaxed">
          <h2 class="text-xl font-bold text-white">1. Open Source License (MIT)</h2>
          <p>Refinzi is open-source software released under the MIT License. You are free to inspect, run, modify, and distribute the software subject to the terms of the MIT License.</p>
          <h2 class="text-xl font-bold text-white">2. Acceptable Use</h2>
          <p>Refinzi is provided to enhance prompt creation in web-based text environments. You agree not to use the software for any unlawful activities.</p>
          <h2 class="text-xl font-bold text-white">3. Third-Party AI Services</h2>
          <p>Refinzi connects directly to third-party services (such as OpenAI, Anthropic, Google Gemini, and OpenRouter) when configured by the user via BYOK. Your use of these services is subject to their respective terms.</p>
        </div>
      </main>
    `,
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "name": "Terms of Service — Refinzi",
          "url": "https://refinzi.com/terms/",
          "description": "Refinzi Terms of Service and Software License Agreement."
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://refinzi.com/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Terms of Service",
              "item": "https://refinzi.com/terms/"
            }
          ]
        }
      ]
    }
  },
};

if (fs.existsSync(indexPath)) {
  const baseHtml = fs.readFileSync(indexPath, "utf8");

  for (const [route, meta] of Object.entries(ROUTE_METADATA)) {
    const routeDir = path.join(distDir, route);
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }

    let customHtml = baseHtml
      .replace(/<title>[\s\S]*?<\/title>/i, `<title>${meta.title}</title>`)
      .replace(
        /<meta\s+[^>]*?name=["']description["'][^>]*?>/i,
        `<meta name="description" content="${meta.description}" />`
      )
      .replace(
        /<meta\s+[^>]*?property=["']og:title["'][^>]*?>/i,
        `<meta property="og:title" content="${meta.title}" />`
      )
      .replace(
        /<meta\s+[^>]*?property=["']og:description["'][^>]*?>/i,
        `<meta property="og:description" content="${meta.description}" />`
      )
      .replace(
        /<meta\s+[^>]*?name=["']twitter:title["'][^>]*?>/i,
        `<meta name="twitter:title" content="${meta.title}" />`
      )
      .replace(
        /<meta\s+[^>]*?name=["']twitter:description["'][^>]*?>/i,
        `<meta name="twitter:description" content="${meta.description}" />`
      )
      .replace(
        /<meta\s+[^>]*?property=["']og:url["'][^>]*?>/i,
        `<meta property="og:url" content="${meta.canonical}" />`
      )
      .replace(
        /<link\s+[^>]*?rel=["']canonical["'][^>]*?>/i,
        `<link rel="canonical" href="${meta.canonical}" />`
      );

    if (meta.schema) {
      customHtml = customHtml.replace(
        /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
        `<script type="application/ld+json">\n${JSON.stringify(meta.schema, null, 2)}\n    </script>`
      );
    }

    if (meta.bodyHtml) {
      customHtml = customHtml.replace(
        /<main id="main-content">[\s\S]*?<\/main>/,
        meta.bodyHtml.trim()
      );
    }

    fs.writeFileSync(path.join(routeDir, "index.html"), customHtml, "utf8");
    console.log(`Generated customized static route: /${route}/index.html`);
  }

  // Generate dist/404.html
  fs.writeFileSync(path.join(distDir, "404.html"), baseHtml, "utf8");
  console.log("Generated dist/404.html");
}