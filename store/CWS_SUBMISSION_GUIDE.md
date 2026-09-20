# Refinzi — Chrome Web Store Submission Guide

> **Version:** 2.1.0  
> **Build artifacts:** `dist/refinzi-chrome-v2.1.0.zip`  
> **Store URL (once live):** https://chromewebstore.google.com/detail/refinzi

---

## Pre-Submission Checklist

- [x] All 397 Vitest tests passing (`npm test`)
- [x] Production build clean for Chrome, Edge, Firefox (`npm run build`)
- [x] TypeScript clean (`npm run typecheck`)
- [x] Privacy Policy hosted at `https://refinzi.com/privacy` (or GitHub Pages equivalent)
- [x] Extension works on first install with **zero API key setup** (free Gemini tier, 25 prompts)
- [x] Onboarding fires on first site visit after install
- [x] CSP meta tags present in `popup/popup.html`
- [x] No remote code execution (no `eval`, no `new Function`, no external script injection)
- [x] Manifest V3 compliant

---

## Step 1: Chrome Web Store Developer Dashboard

1. Go to https://chrome.google.com/webstore/devconsole
2. Click **"New item"** → Upload `dist/refinzi-chrome-v2.1.0.zip`
3. Fill in all required fields (below)

---

## Step 2: Store Listing Copy

### Name
```
Refinzi — Better AI Prompts
```

### Short Description (132 chars max)
```
Click for a better prompt. Hold for an expert one. Works in ChatGPT, Claude, Gemini & Perplexity.
```

### Detailed Description
```
Refinzi is a browser-native AI prompt calibration layer. It docks an intelligent ambient Orb beside any text box across the web — no copy-pasting, no tab switching.

⚡ CLICK = Better Prompt
Instantly calibrates your raw input: fixes vagueness, specifies output format, clarifies intent. Done in ~500ms.

🧠 HOLD = Expert Prompt  
Hold the Orb for 350ms to trigger a deep calibration. Refinzi autonomously synthesizes a Semantic Intent Object — infers domain constraints, adds defensible assumptions, and builds a multi-step execution brief. Zero follow-up questions.

🔄 GRAMMARLY-STYLE IN-PLACE REPLACEMENT
Your calibrated prompt replaces the raw text directly inside the composer. A floating undo toast lets you instantly revert with one click or Ctrl+Z.

🌐 WORKS EVERYWHERE
Specialized adapters for ChatGPT, Claude, Gemini, and Perplexity. Universal fallback for any <textarea>, <input>, or contenteditable across the web (Gmail, Notion, Jira, Reddit, GitHub, and more).

🔑 FREE TIER INCLUDED — NO SETUP REQUIRED
25 free prompt calibrations included from install. No API key needed. To unlock unlimited use, add your own free Google AI Studio key (takes 30 seconds).

🔒 PRIVACY-FIRST
Zero prompt logging. All data stored locally on your device. Network requests go directly from your browser to your chosen AI provider — Refinzi never proxies your data.

Supported AI providers (Bring Your Own Key):
• Google Gemini (gemini-flash-latest → Gemini 3.8 Flash, default)
• OpenAI (GPT-5.6 Luna / Terra / Sol)
• DeepSeek (deepseek-flash, deepseek-v4-pro)
• OpenRouter (1000+ models, free tier supported)

Privacy Policy: https://refinzi.com/privacy
```

### Category
```
Productivity
```

### Language
```
English (United States)
```

---

## Step 3: Privacy Tab — Data Usage Disclosure

Navigate to the **Privacy practices** tab in the CWS dashboard and fill in:

### Data Collection Declaration

For each data type listed, select **"No"** (not collected) for all, EXCEPT:

| Data Type | Declare | Notes |
|-----------|---------|-------|
| Personally identifiable information | ❌ No | Not collected |
| Health information | ❌ No | Not collected |
| Financial & payment information | ❌ No | Not collected |
| Authentication information | ✅ Yes | API keys stored **locally only**, never transmitted to Refinzi |
| Personal communications | ❌ No | Prompt text sent directly to the AI provider the user selected |
| Location | ❌ No | Not collected |
| Web history | ❌ No | Not collected |
| User activity | ⚠️ App activity (local) | Usage count and history stored locally; never transmitted |
| Website content | ❌ No | DOM text read to enable in-place replacement, never stored or transmitted by Refinzi |

### Certifications to check
- [x] This extension does not sell personal data
- [x] This extension does not use data for purposes unrelated to core functionality
- [x] This extension does not use data for creditworthiness or lending purposes

### Privacy Policy URL
```
https://refinzi.com/privacy
```

---

## Step 4: Permission Justifications

When prompted for justification (or during review), use the following pre-written responses:

### Host Permissions (`http://*/*` and `https://*/*`)

> **Justification:**  
> Refinzi is a universal prompt calibration layer that must operate on any website where users draft text for AI tools — including Gmail, Notion, Jira, Reddit, GitHub, and other sites where users frequently copy prompts. Broad host permissions are required to:
> 1. Inject the Ambient Orb UI (rendered inside an isolated Shadow DOM) adjacent to text editing surfaces.
> 2. Read the text content of the currently focused `<textarea>`, `<input>`, or `contenteditable` element to extract the raw prompt.
> 3. Write the calibrated prompt back in-place using framework-safe DOM events.
>
> We cannot enumerate the specific URLs our users will draft text on, as this varies per user and per workflow. The extension does NOT read page content outside of the active focused text input, does NOT inject into iframes on unrelated origins, and does NOT monitor browsing activity.

### `storage` Permission

> **Justification:**  
> `chrome.storage.local` is used to persist:
> - User preferences (theme, hold-threshold, auto-apply setting)
> - BYOK API credentials (stored locally, never transmitted to Refinzi servers)
> - Local usage metrics and prompt history (for the in-extension dashboard)
> - Onboarding completion state (to prevent re-showing the first-run modal)
>
> No data stored via this permission is ever transmitted to Refinzi's servers or any third party.

### `commands` Permission

> **Justification:**  
> Used to register two global keyboard shortcuts:  
> - `Ctrl+Shift+B` (Mac: `⌘+Shift+B`) — triggers the "Better Prompt" calibration  
> - `Ctrl+Shift+E` (Mac: `⌘+Shift+E`) — triggers the "Expert Prompt" calibration  
>
> These shortcuts are user-configurable and allow power users to calibrate prompts without clicking the Orb.

---

## Step 5: Single-Purpose Policy Defense

If a CWS reviewer flags the extension for "multiple unrelated purposes," use this statement:

> **Refinzi's single, unified purpose is: AI Prompt Calibration & Enhancement.**
>
> Every feature in the extension directly serves this single purpose:
> - **Better Mode** — calibrates raw prompts with one click
> - **Expert Mode** — generates deep, structured expert briefs
> - **Dashboard** — shows users how much time and money they've saved through prompt calibration
> - **History tab** — lets users review and reuse past calibrated prompts
> - **Settings tab** — configures the provider and calibration behavior
>
> There are no unrelated features (no ad blocker, no scraper, no tab manager). All functionality is in service of the core prompt calibration use case.

---

## Step 6: Reviewer Test Flow

The CWS review team may test your extension in a sandboxed environment without personal API keys. This is how they'll experience Refinzi:

1. **Install the extension** → Onboarding modal appears immediately on the first page they visit.
2. **Onboarding Step 1** → Explains Click = Better, Hold = Expert, with an interactive demo simulator.
3. **Onboarding Step 2** → "You're ready!" screen confirms the extension is active and includes a **"Try it on ChatGPT →"** button.
4. **Go to ChatGPT** → The Ambient Orb appears docked beside the composer.
5. **Type "write me a marketing email"** → Click the Orb → prompt is replaced in-place with a calibrated version.
6. **The free tier uses the bundled Gemini key** — No API key setup required. First 25 prompts work out of the box.

### What to verify
- [ ] Orb appears on ChatGPT, Claude, Gemini, Perplexity (enabled by default)
- [ ] Click generates a Better prompt in-place
- [ ] Hold (350ms) generates an Expert prompt in-place
- [ ] Undo toast appears and Ctrl+Z works
- [ ] Popup opens and shows Dashboard metrics
- [ ] Settings tab allows provider/key entry

---

## Step 7: Screenshots & Promotional Assets

Prepare the following for the listing:

| Asset | Size | Content |
|-------|------|---------|
| Icon | 128×128 | Refinzi logo (gold lightning bolt) |
| Screenshot 1 | 1280×800 | Orb docked on ChatGPT with Better prompt in-place |
| Screenshot 2 | 1280×800 | Expert mode result with assumptions panel |
| Screenshot 3 | 1280×800 | Extension popup — Dashboard metrics view |
| Screenshot 4 | 1280×800 | Universal surface: Orb on a generic textarea (Gmail) |
| Promotional tile | 440×280 | Brand hero: "Better Prompts in One Click" |

---

## Step 8: Edge & Firefox Store Submission

Use the same store listing text. Submit browser-specific builds:

- **Microsoft Edge Add-ons:** `dist/refinzi-edge-v2.1.0.zip` → https://partner.microsoft.com/en-us/dashboard/microsoftedge/
- **Mozilla Add-ons (AMO):** `dist/refinzi-firefox-v2.1.0.zip` → https://addons.mozilla.org/developers/

For Firefox AMO, additionally:
- Specify source code availability (open source, link to GitHub)
- The manifest uses `browser.background.scripts` format (already handled by `build-extension.js`)

---

## Common Rejection Reasons & Mitigations

| Rejection Reason | Mitigation |
|------------------|------------|
| "Broad host permissions not justified" | Use the exact justification text in Step 4 |
| "Extension doesn't work without setup" | Free 25-prompt Gemini tier — zero setup required |
| "Privacy policy missing or incomplete" | Host at `https://refinzi.com/privacy` before submission |
| "Multiple unrelated purposes" | Use single-purpose defense in Step 5 |
| "Remote code execution" | No `eval`, no external scripts — Vitest `security.test.ts` verifies this |
| "Broken functionality for reviewer" | The onboarding now triggers on install; reviewer sees it immediately |
