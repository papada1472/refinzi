# Refinzi 2.1.0

> **"Grammarly for prompts."**  
> *"It doesn't just rewrite your words. It understands what you're trying to accomplish and turns that rough thought into a prompt the AI can execute better."*

[![Version](https://img.shields.io/badge/version-2.1.0-indigo.svg)](package.json)
[![Manifest](https://img.shields.io/badge/Manifest-V3-emerald.svg)](extension/manifest.json)
 [![Browsers](https://img.shields.io/badge/Browsers-Chrome%20%7C%20Edge%20%7C%20Firefox-blue.svg)](dist/)
[![Tests](https://img.shields.io/badge/Tests-39%20Passed-brightgreen.svg)](extension/test/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Refinzi is a cross-browser native WebExtension (Manifest V3) for Chrome, Edge, and Firefox. 

---

## ◉ The Frozen Product Flow

```text
                 VAGUE PROMPT
                      ◉
                    /   \
               CLICK     HOLD
                 ↓         ↓
              BETTER     EXPERT
              PROMPT     PROMPT
                 \         /
                  ↓       ↓
                   NEW PROMPT
                       ↓
                    AI OUTPUT
```

### What the user experiences:
1. **User writes naturally** into ChatGPT, Claude, Gemini, or Perplexity:
   > *"GTM to enter in US market"*  
   Zero prompt-engineering knowledge required.
2. **Click Orb (< 350ms) $\rightarrow$ ⚡ Better Mode**:  
   Refinzi understands the actual task and intent, identifies high-value missing dimensions, and calibrates the instruction.
3. **Hold Orb ($\ge$ 350ms) $\rightarrow$ 🧠 Expert Mode**:  
   Refinzi performs deep task reconstruction (*Understand $\rightarrow$ Infer $\rightarrow$ Assume $\rightarrow$ Execute*), assembling an expert-grade briefing with defensible assumptions. **Never asks the user questions.**
4. **Automatic In-Place Replacement**:  
   The prompt is automatically replaced in-place directly inside the AI composer (Grammarly-style).
   - No separate window.
   - No questionnaire.
   - No mandatory Apply clicks.
   - Preserves original draft with a floating `[↩ Undo]` toast.
5. **Send to AI normally**:  
   User simply presses Enter / Send in their AI tool to receive superior AI output.

---

## 🏗️ Architecture

```text
Natural Thought in AI Composer
            ↓
       Refinzi Core
            ↓
   Intent Understanding & Granular Task Detection
            ↓
       Better / Expert Calibration Engine
            ↓
     BYOK Background Provider (OpenAI, Gemini, DeepSeek, Local)
            ↓
       New Calibrated Prompt
            ↓
  Automatic In-Place Injection (ProseMirror / Lexical / Textarea)
            ↓
     Floating [↩ Undo] Toast Feedback
            ↓
         Target AI
```

### Core Principles:
- **Ambient Orb**: Primary interface docked near the active AI composer. Movable by dragging (> 6px); double-click resets position.
- **Click = Better, Hold = Expert**: Single unified physical control.
- **Direct In-Place Replacement**: Grammarly-style zero-friction text substitution with instant undo.
- **Zero Questions**: Never pauses to interrogate the user. Makes defensible assumptions autonomously.
- **Bring-Your-Own-Key (BYOK)**: User API keys and network calls are isolated inside the background service worker. Webpages never see raw credentials.
- **Zero Drop**: Legacy file drops, questionnaires, and upload zones have been completely removed.
- **Zero Generic Templates**: Better Mode dynamically tailors dimensions for the exact prompt, never outputting generic marketing/coding boilerplate.

---

## 🌐 Supported AI Platforms

| Platform | Composer Target | In-Place Injection Strategy |
| :--- | :--- | :--- |
| **ChatGPT** (`chatgpt.com`) | ProseMirror contenteditable & textareas | Caret range insertion + input prototype setter |
| **Claude** (`claude.ai`) | ProseMirror & fieldset wrapped contenteditable | Synthetic selection + execCommand & input events |
| **Gemini** (`gemini.google.com`) | rich-textarea & Quill contenteditable | Subtree element selection + prototype setter |
| **Perplexity** (`perplexity.ai`) | Query textareas & follow-up inputs | Native value descriptor setter + input/change dispatch |
| **Generic Web** | Any web textarea or `contenteditable` | Automatic fallback adapter |

---

## 🎛️ Extension Control Center

Clicking the browser extension icon opens a compact control center (380px $\times$ 560px, Raycast $\times$ Linear $\times$ Arc design):
- **Home**: Today's Better/Expert usage counters, active BYOK engine status, and recent calibrations.
- **History**: Searchable log of past prompt transformations with a prompt inspection drawer and 1-click copy.
- **Settings**: Provider & model selection, secure API key entry with inline verification, hold duration adjustment (300–600ms), auto-apply toggle, and privacy controls.

---

## 💻 Building & Testing

### Automated Test Suite
```bash
# Run the complete test suite (39 unit & integration tests)
npx vitest run extension/test

# Run TypeScript typecheck
npm run typecheck

# Build all browser extension targets (Chrome, Edge, Firefox)
npm run build

# Verify release packages
node scripts/verify-release.js
```

### Loading Unpacked in Chrome / Edge / Brave
1. Open `chrome://extensions/` (or `edge://extensions/`, `brave://extensions/`).
2. Enable **Developer mode** in the top-right corner.
3. Click **Load unpacked**.
4. Select `dist/chrome/` (or `dist/edge/`).
5. Open ChatGPT, Claude, Gemini, or Perplexity to see the Refinzi Orb.

---

## 🔒 Privacy & Security

- **Direct HTTPS**: All BYOK API requests are sent directly to the configured provider endpoint from the extension background service worker.
- **Zero Prompt Storage**: User prompts are never sent to external servers or logged.
- **Client-Side History**: History is saved exclusively in `chrome.storage.local` on your machine and can be cleared with one click.

---

## 📄 License

MIT License. Copyright (c) 2026 Refinzi Team.
