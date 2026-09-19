# REFINZI — Privacy Policy & Data Protection Disclosure

**Effective Date:** September 19, 2026  
**Product:** Refinzi WebExtension 2.1.0 (Chrome, Edge, Firefox)  
**Public Policy URL:** https://refinzi.com/privacy/

## Reviewer Declarations
- **Refinzi does not collect, store, or transmit user keystrokes, passwords, or prompt history to external servers.**
- **Refinzi is a user-initiated productivity tool. It only modifies text when the user explicitly clicks the Orb or uses a keyboard shortcut. It does not auto-submit forms or scrape AI outputs.**

## 1. Zero Prompt Storage & Local Processing
Refinzi is built on a strict privacy-first architecture:
- By default, prompt synthesis runs 100% locally on-device inside your browser.
- We **never** store your raw prompts on external servers.
- We **never** log or store generated prompt outputs.
- We **never** train AI models on your inputs.
- Your prompts remain in volatile memory in your browser and are deleted upon tab/panel closure.

## 2. API Key Security (BYOK)
- When you provide an optional API key (OpenAI, Gemini, Anthropic, DeepSeek, or OpenRouter), it is stored exclusively in your browser's private local extension storage (`chrome.storage.local`).
- API keys are never transmitted to Refinzi servers.
- All requests using your API key are dispatched directly from your browser's background service worker to the respective AI provider's official endpoints over HTTPS.

## 3. Permissions & Justifications
- `storage`: Used strictly to store user preferences, theme, auto-apply toggle, recent transformation history, and locally saved BYOK credentials on the device.
- `host_permissions` (`http://*/*`, `https://*/*`): Required to detect editable text areas across ChatGPT, Claude, Google Gemini, Perplexity, GitHub, Gmail, and custom web composers, and inject the floating calibration Orb UI directly adjacent to the active input. It does not read, scrape, or transmit general page content.

## 4. Telemetry & Analytics
Refinzi does **not** collect conversational telemetry. No user text, prompt content, URL parameters, or personal identifiers are ever collected or transmitted.

## 5. Contact
For privacy inquiries, contact: `contact@refinzi.com`
Open-source repository: `https://github.com/papada1472/refinzi`
