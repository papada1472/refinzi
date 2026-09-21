# Refinzi — Complete Live Website Specification & Content Document
**Domain:** [https://refinzi.com](https://refinzi.com)  
**Live Status:** Active on GitHub Pages (Built via Vite/React from `landing/` directory)  
**Document Generated:** September 2026

---

## 1. Executive Summary & Site Architecture

Refinzi is marketed as the **browser-native AI prompt layer**. The live website at `refinzi.com` is designed to convert visitors by explaining the friction of prompt engineering and demonstrating how Refinzi’s two modes (**Click = Better**, **Hold = Expert**) eliminate prompt rework directly in the browser.

### Infrastructure & Technology Stack
- **Domain:** `refinzi.com` with CNAME record pointing to GitHub Pages.
- **Framework:** React 18 + Vite (Tailwind CSS for utility styling, Lucide React for iconography).
- **Deployment Pipeline:** GitHub Actions workflow (`.github/workflows/deploy.yml`) triggered on push to branch `main`. Runs `npm ci` in `landing/`, builds the extension package, builds the Vite production bundle to `landing/dist`, and deploys via GitHub Pages artifact uploader.
- **Analytics:** Cloudflare Web Analytics beacon (`d434469361874705bd59d8eb1310d192`).
- **Pre-rendering / Accessibility:** Static semantic HTML shell is present in `index.html` for non-JS clients and search bot indexing, which hydrates into the full React single-page app (`App.jsx`).

---

## 2. Meta Tags, SEO & Structured Data (JSON-LD)

The live site contains full Generative Engine Optimization (GEO) and search engine structured data.

### Meta & Header Tags
- **Title:** `Refinzi — Browser-Native AI Prompt Layer | WebExtension`
- **Description:** `Write naturally. Refinzi is the browser-native AI prompt layer for ChatGPT, Claude, and Gemini. Get expert-level outputs in one click. Free extension.`
- **Keywords:** `Refinzi, AI prompt enhancer, ChatGPT extension, Claude prompt, Gemini prompt, prompt engineering, browser extension`
- **Canonical:** `https://refinzi.com/`
- **AI Agent Directives:**
  - `meta name="ai-agent" content="enabled"`
  - `meta name="ai-content-declaration" content="Refinzi is a free browser extension (Manifest V3) that rewrites rough prompts in-place inside ChatGPT, Claude, Gemini, and Perplexity..."`
- **Alternates:** Links to `llms.txt` and `llms-full.txt`.
- **OpenGraph & Twitter Cards:** Complete 1200x630 banner images, Twitter summary large image card pointing to `@refinzi`.

### Schema.org Graph Entities
1. **WebSite:** Defines `https://refinzi.com/#website`, name `Refinzi`, alternate names `Refinzi AI`, `Refinzi Prompt Layer`.
2. **Organization:** Links official social profiles (GitHub, X/Twitter, LinkedIn).
3. **SoftwareApplication:**
   - Software Version: `2.1.0`
   - Category: `BrowserApplication`
   - Operating System: `Chrome, Microsoft Edge, Mozilla Firefox`
   - Aggregate Rating: `4.9` (128 reviews)
   - Price: `$0` (Free offer)
4. **VideoObject:** Indexes the video demo `refinzi-demo.mp4`.
5. **FAQPage:** Pre-indexes core Q&As for Google Rich Snippets.

---

## 3. Site Navigation & Header

The header is fixed/sticky with a background blur (`backdrop-blur-xl bg-[#090a0f]/90`).

- **Brand Logo:** Square indigo icon `R` with bold typography `Refinzi`.
- **Desktop Navigation Links:**
  - `How it works` (smooth scrolls to `#how`)
  - `Examples` (smooth scrolls to `#proof`)
  - `Pricing` (smooth scrolls to `#pricing`)
  - `FAQ` (smooth scrolls to `#faq`)
- **Primary CTA Button:** Dynamic browser-detecting button:
  - Default: `Add to Chrome — Free` (links to `/downloads/refinzi-chrome-v2.1.0.zip`)
  - On Firefox: `Add to Firefox — Free`
  - On Edge: `Add to Edge — Free`
- **Mobile Menu:** Collapsible hamburger drawer with quick navigation and download link.

---

## 4. Full Page Section Breakdown

### Section 1: Hero (Two-Column Split)
- **Eyebrow:** Sparkles badge: `THE SIMPLE WAY TO GET BETTER AI RESULTS`
- **Headline:**
  > **Write Naturally.**  
  > <span style="color:#818cf8">Get Better AI Results.</span>
- **Body:**
  - *"You don’t need to learn prompt engineering. Just type what you want, then click Refinzi for a better prompt — or hold for an expert one."*
  - *"No forms. No complicated settings. No questions."*
- **Action Buttons:**
  1. `Add to Chrome — Free` (Direct `.zip` bundle download)
  2. `See How It Works →` (Anchors to `#how`)
- **Micro Trust Signals:**
  - 🔒 *Private by design — prompts never leave your browser. [Details →](/privacy/)*
  - ⌨️ *Shortcut:* `<kbd>Ctrl+Shift+B</kbd>`
  - ⭐ *4.9/5 from early users • Works natively in ChatGPT, Claude, Gemini & Perplexity.*
- **Right Column Visual:** Interactive Video Player showing `refinzi-demo.mp4` with custom Play/Pause control and scrubber.

---

### Section 2: Compatible Platform Logo Strip
- **Eyebrow:** `WORKS WHEREVER YOU TYPE`
- **Supported Ecosystem:**
  - 🟢 ChatGPT (OpenAI)
  - 🟠 Claude (Anthropic)
  - 🔵 Google Gemini
  - 🟣 Perplexity
  - ⚪ Notion
  - ⚪ GitHub
  - 🟣 Slack
  - 🔵 Linear

---

### Section 3: Interactive In-Browser Demo (Playground)
An interactive simulation where users can test Refinzi directly on the page without installing the extension.

- **Window Chrome:** Simulates browser card with macOS window dots and `refinzi — browser demo` title.
- **Preset Buttons:**
  - `Marketing`: *"make a marketing plan for my business"*
  - `Email`: *"draft an email to client asking if they reviewed the proposal"*
  - `Code Leak`: *"identify and fix the memory leak in my Node.js application"*
  - `Research`: *"research the main competitors of Notion in India"*
- **Dual Trigger Buttons:**
  - `⚡ Click for Better`: Demonstrates quick clarity and missing context calibration.
  - `🧠 Hold for Expert`: Demonstrates deep role framing, scope constraints, and execution directives.
- **Undo / Reset:** In-place undo button to toggle back to the user's raw prompt.

---

### Section 4: The 3-Step Mechanism (`#how`)
- **Headline:** *3 Steps. A Few Seconds. No Copy-Pasting.*
- **3-Step Grid:**
  1. **Step 1: Write** — *Type your rough thought normally. No special formatting. No prompt templates.*
  2. **Step 2: Click or Hold** — *Click the Orb for Better. Hold it for Expert. That's it — no menus, no settings.*
  3. **Step 3: Send** — *Refinzi replaces your rough prompt in the same text box. You continue exactly where you were.*
- **Tagline:** *Refinzi does the prompt work. You stay focused on the actual work.*

---

### Section 5: The Friction Problem
- **Headline:** *You shouldn’t have to become a prompt engineer to use AI well.*
- **Animated Prompt Struggle Loop:** Cycles through the painful reality of traditional AI prompting:
  - `You write prompt` ➔ `AI misses the point` ➔ `You rephrase` ➔ `AI invents facts` ➔ `You write 500 words of context` ➔ `You give up`
- **Copy:** *You spend more time prompting than doing the actual work. Refinzi gives you a shortcut between "I know what I want" and "AI understands what I need."*

---

### Section 6: Before & After Proof Carousel (`#proof`)
Interactive tabbed carousel comparing raw inputs vs Refinzi outputs across real-world tasks:
1. **Startup Marketing Plan** (Expert Mode)
2. **Client Proposal Follow-up** (Better Mode)
3. **Competitor Research** (Expert Mode)
4. **Code Debugging / Node.js Memory Leak** (Expert Mode)
- Each card shows: **You write**, **Refinzi outputs**, and the **Verified Result**.

---

### Section 7: Better vs. Expert Mode Breakdown
- **Better (Click the Orb):**
  - Adds important missing details
  - Keeps original intent intact
  - Works in under a second
  - Recommended for everyday emails, questions, and research
- **Expert (Hold the Orb):**
  - Thinks deeper about execution requirements
  - Adds defensive constraints and assumptions
  - Structures output formats without turning small asks into bloated projects

---

### Section 8: Real-World Use Cases Grid
6 high-frequency category cards:
1. **Sales & Outreach:** Follow-ups, objection handling, meeting summaries.
2. **Product & Strategy:** PRDs, user story drafting, sprint roadmaps.
3. **Engineering:** Debugging queries, API architecture decisions, refactoring tasks.
4. **Marketing & Copy:** Ad copy iterations, landing page drafts, positioning angles.
5. **Research & Analysis:** Industry landscape scans, competitor breakdowns.
6. **Executive Operations:** Status updates, investor summaries, team alignment notes.

---

### Section 9: Compatible Ecosystem & Philosophy
- **Headline:** *You don’t need another chatbot.*
- **Philosophy:** Emphasizes that Refinzi is not a standalone destination or a new app to open. It sits natively inside your existing text areas.

---

### Section 10: Privacy & Security Guarantee
- **Card:** Green badge 🔒 *Your words are yours.*
- **Commitments:**
  - Prompts are processed local-first on your device.
  - Zero prompt storage or training on user inputs.
  - BYOK (Bring Your Own Key) ensures direct communication between the client browser and AI provider APIs.

---

### Section 11: Pricing Structure (`#pricing`)

| Feature | Free Tier ($0) | Lifetime Pro ($12 One-Time) |
|---|---|---|
| **Cost** | **$0** (No credit card) | **$12** (Single payment, no subscription) |
| **Better Mode** | Included | Included |
| **Browser-Wide Support** | Included | Included |
| **AI Platform Integrations** | Included | Included |
| **Expert Mode** | ❌ | **Included** |
| **Advanced Calibration** | ❌ | **Included** |
| **BYOK Support** | Limited | **Full Custom Providers** |
| **Future Updates** | Standard | **All Future Updates Included** |

---

### Section 12: 14-Day Guarantee
- *Try it without the risk. Try Refinzi for 14 days. If it isn’t useful to you, request a full refund.*

---

### Section 13: Frequently Asked Questions (`#faq`)
Interactive accordion containing answers to:
1. **How does Refinzi work?** (In-composer Orb replaces text in-place)
2. **What is the difference between Click and Hold?** (Better <350ms vs Expert >=350ms)
3. **Do I need an API key to use Refinzi?** (Works out of the box with local engine; BYOK optional)
4. **Which browsers are supported?** (Chrome, Edge, Firefox via WebExtensions MV3)
5. **Is my prompt data private?** (Never stored, logged, or sold)

---

### Section 14: Final Call to Action
- **Headline:** *Stop rewriting prompts. Get on with the work.*
- **Dual Buttons:** `Add to Chrome — Free` and `Get Lifetime Pro — $12`.

---

### Section 15: Footer & Legal Navigation
- **Brand Line:** Refinzi logo with tagline: *Universal Browser Prompt Layer*.
- **Direct Links:**
  - `/privacy/` (Privacy Policy)
  - `/terms/` (Terms of Service)
  - `/docs/` (Documentation)
  - `GitHub` (`https://github.com/papada1472/refinzi`)
  - `X / Twitter` (`https://x.com/refinzi`)
  - `LinkedIn` (`https://linkedin.com/company/refinzi`)

---

## 5. Built-In Growth & Conversion Features

1. **Live Social Proof Notification Toast:**
   - Bottom-left non-intrusive notification ticker.
   - Rotates through realistic activity events (e.g., *"Engineer in Seattle calibrated a Claude prompt"*, *"Founder in Austin unlocked Lifetime Pro ($12)"*).
2. **Lifetime Pro Checkout Modal:**
   - Pop-up modal with simple email field and order confirmation flow.
3. **Exit-Intent Modal:**
   - Triggers when cursor moves to close the browser tab.
   - Lead magnet: *"Get 50 expert prompt frameworks — A Notion swipe file across coding, strategy, and marketing. Free."*

---

## 6. Dedicated Subpages

The live site includes three subpage routes rendered via React state:
- **`PrivacyPage.jsx` (`/privacy/`):** Detailed breakdown of client-side storage (`chrome.storage.local`), API key handling, network communications, and zero-telemetry pledge.
- **`TermsPage.jsx` (`/terms/`):** MIT licensing declaration, acceptable use, and refund terms.
- **`DocsPage.jsx` (`/docs/`):** Installation guide, shortcut key maps (`Ctrl+Shift+B` / `Ctrl+Shift+E`), and BYOK configuration instructions.
