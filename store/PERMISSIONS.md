# REFINZI — Permissions Justification

This document details the necessity of each requested permission across Chrome, Edge, and Firefox WebExtension manifests:

| Permission | Scope | Justification |
| :--- | :--- | :--- |
| `storage` | Local extension storage | Required to persist user configuration (default mode: Better vs Expert, selected AI provider, custom API keys, hold threshold, and privacy preferences). |
| `commands` | Keyboard shortcuts | Enables users to trigger prompt calibration instantly via `Ctrl+Shift+B` (Better) and `Ctrl+Shift+E` (Expert) without needing to click the Orb. |
| `host_permissions` (`http://*/*`, `https://*/*`) | Webpage editable text surfaces | **Universal Browser Text Layer**: Refinzi operates across any website where users draft text (e.g. Gmail, Outlook, LinkedIn, X, Notion, Slack, Jira, Zendesk, CRMs, internal company portals, and AI platforms). Broad host permission is required to detect focused editable surfaces (`textarea`, `input`, `contenteditable`) and mount the single ambient Orb. |
| `host_permissions` (API endpoints) | AI provider APIs | Required for background service worker connectivity to selected AI backends (`api.openai.com`, `generativelanguage.googleapis.com`, `api.deepseek.com`, `openrouter.ai`, `refinzi.com`). |

### Strict Privacy & Safety Boundaries
While Refinzi operates across arbitrary websites, it adheres to strict zero-surveillance principles:
1. **Never Scrapes Background Webpages**: Refinzi does NOT read page text, background DOM, or other tabs.
2. **Explicit User Invocations Only**: No text is transmitted or processed while the user types. Text is calibrated ONLY when the user explicitly triggers Refinzi via Click (Better) or Hold (Expert).
3. **Strict Safety Exclusions**: Refinzi hard-excludes password fields, hidden inputs, 2FA/OTP tokens, credit card / payment fields, and disabled/readonly elements.
4. **Secure Credential Isolation**: All API keys and model calls execute exclusively inside the background service worker, completely isolated from webpage scripts and untrusted third-party DOM.
