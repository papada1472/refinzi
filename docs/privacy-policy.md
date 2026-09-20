# Refinzi Privacy Policy

**Effective Date:** September 19, 2026  
**Product:** Refinzi — AI Prompt Calibration Browser Extension  
**Version:** 2.1.0  
**Website:** https://refinzi.com  
**Contact:** privacy@refinzi.com

---

## 1. Overview

Refinzi ("we", "our", "the extension") is a browser extension that calibrates and enhances AI prompts directly inside your browser. Your privacy is foundational to the product's design. Refinzi was built as a **local-first, zero-telemetry** tool. We do not collect, transmit, or store your prompts, AI conversations, or personal information on our servers.

---

## 2. Data We Do NOT Collect

Refinzi **does not**:

- Collect, read, transmit, or store the content of your prompts or AI conversations on any Refinzi server.
- Log your browsing history, the websites you visit, or the text you type on any website.
- Track your identity, IP address, usage patterns, or behavioral analytics.
- Sell or share any data with third parties for advertising or marketing purposes.
- Use cookies, fingerprinting, or cross-site tracking technologies.

---

## 3. Data Stored Locally on Your Device

All user preferences and history are stored **exclusively on your local device** using the browser's built-in `chrome.storage.local` API. This data never leaves your browser unless you explicitly configure a third-party AI provider.

Data stored locally includes:

| Data | Purpose | Where |
|------|----------|--------|
| Provider preference (e.g., Gemini, OpenAI) | Determines which AI model to use | `chrome.storage.local` |
| BYOK API key (if configured) | Authenticates requests to your chosen provider | `chrome.storage.local` |
| Hold-threshold setting (ms) | Controls the click vs. hold timing | `chrome.storage.local` |
| Theme preference (dark/light/auto) | Visual appearance | `chrome.storage.local` |
| Local usage count & prompt history (up to 50 entries) | Powers the in-extension metrics dashboard | `chrome.storage.local` |
| Onboarding seen flag | Prevents re-showing the first-run walkthrough | `chrome.storage.local` |
| Free usage count | Tracks complimentary Gemini uses | `chrome.storage.local` |

You can clear all locally stored data at any time from the extension popup under **Settings → Clear All Data**.

---

## 4. Network Requests & Third-Party AI Providers

Refinzi makes **outbound network requests** only when generating a calibrated prompt. The request behavior depends on your chosen provider:

### 4.1 Default Free Tier (Google Gemini — Included API Key)

When you use Refinzi without configuring your own API key, the extension uses a bundled Google AI Studio key to send your **raw prompt text** directly to Google's Gemini API (`generativelanguage.googleapis.com`). This request is made directly from your browser's background service worker to Google's servers — Refinzi's servers are not in the request path.

**What is sent:** Only the text currently in the active AI composer input.  
**What is NOT sent:** Your identity, browser history, conversation context, or any metadata.

This is subject to [Google's Privacy Policy](https://policies.google.com/privacy) and [Google AI Studio Terms of Service](https://ai.google.dev/gemini-api/terms).

### 4.2 Bring Your Own Key (BYOK) Providers

If you configure your own API key (OpenAI, DeepSeek, OpenRouter, or another provider), requests are made **directly** from your browser to that provider's official API endpoint. Refinzi's servers are **not** in the request path. Your API key is stored locally in `chrome.storage.local` and is never transmitted to Refinzi's servers.

Network destinations used:
- `https://generativelanguage.googleapis.com` (Google Gemini)
- `https://api.openai.com` (OpenAI, if configured)
- `https://api.deepseek.com` (DeepSeek, if configured)
- `https://openrouter.ai` (OpenRouter, if configured)

### 4.3 Optional Refinzi Gateway

If you explicitly choose the "Refinzi Gateway" provider in Settings, your prompt text is sent to `https://refinzi.com/api/v1/refine`. This is an opt-in proxy service. In this mode, Refinzi acts as an intermediary and the prompt text transits our server. We process the request and return the calibrated prompt but do not log or store the prompt content beyond the lifecycle of the request. Gateway usage is disabled by default.

---

## 5. Permissions Explanation

Refinzi requests the following browser permissions:

| Permission | Why It's Required |
|------------|-------------------|
| `storage` | Stores user preferences, API keys, and history locally on your device. |
| `host_permissions: http://*/*, https://*/*` | Allows Refinzi to inject the Ambient Orb UI and read/replace text in `<textarea>` and `contenteditable` fields across any website the user navigates to. This is required for the "Universal Surface" feature — Refinzi cannot predict which websites users will use for AI prompting. |
| `commands` | Registers the `Ctrl+Shift+B` (Better) and `Ctrl+Shift+E` (Expert) keyboard shortcuts. |

Refinzi does **not** request or use:
- `tabs` (cannot read your tab history or URLs programmatically)
- `history` (no access to browsing history)
- `cookies` (no access to session cookies or login state)
- `identity` (no access to your Google or browser account)
- `webRequest` (does not intercept or modify network traffic)

---

## 6. Children's Privacy

Refinzi is not directed at children under 13. We do not knowingly collect data from children. If you believe a child has used this extension and data has been stored locally, you may clear it via **Settings → Clear All Data**.

---

## 7. Changes to This Policy

We may update this Privacy Policy to reflect changes in the extension's functionality. The "Effective Date" at the top of this document will reflect the latest revision. Material changes will be noted in the extension's release notes.

---

## 8. Contact

For privacy questions or data deletion requests:  
**Email:** privacy@refinzi.com  
**Website:** https://refinzi.com

---

*Refinzi is open-source. You can audit the complete source code at [github.com/papada1472/refinzi](https://github.com/papada1472/refinzi).*
