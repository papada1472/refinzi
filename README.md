# Refinzi 2.0 — The Ambient AI Layer for Windows

> 100% Free, open-source, and local-first. Refinzi sits ambiently on Windows 10 & 11 to transform rough 1-line ideas, polish writing, and scaffold deep 5-block architecture blueprints in under 2 seconds directly in-place across any Windows application.

[![GitHub release](https://img.shields.io/github/v/release/papada1472/refinzi?color=blue&style=flat-square)](https://github.com/papada1472/refinzi/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=flat-square)](LICENSE)
[![VirusTotal Clean](https://img.shields.io/badge/VirusTotal-0%2F72%20Clean-success?style=flat-square)](https://refinzi.com)
[![Platform](https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011-blue?style=flat-square)](https://refinzi.com)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local%20DPAPI-purple?style=flat-square)](docs/TRUST_AND_PRIVACY.md)

[Website](https://refinzi.com) · [Documentation](https://refinzi.com/docs/) · [LLMs Context](https://refinzi.com/llms-full.txt) · [Releases](https://github.com/papada1472/refinzi/releases) · [Issues](https://github.com/papada1472/refinzi/issues) · [Discussions](https://github.com/papada1472/refinzi/discussions)

---

## ⚡ The Problem Refinzi Solves

In modern AI workflows on Windows, users are left with clunky friction:
1. **The Alt-Tab Tax**: Constantly switching away from your work into ChatGPT or Claude web tabs, copy-pasting back and forth, losing creative flow.
2. **Locked Browser Extensions**: Extensions only work inside Chrome/Edge tabs. They cannot touch your desktop IDEs (Cursor, VS Code), Discord, Slack, Obsidian, Notion desktop, or PDF readers.
3. **The Diminishing Prompt Bottleneck**: When you type a vague 1-liner into Midjourney, Runway, Kling, or frontier reasoning models (DeepSeek R1, Claude 3.7 Thinking), you get hallucinations, generic output, or burned render credits because the model lacked camera physics, epistemic boundaries, or structural specs.

**Refinzi 2.0 brings a native, instant ambient execution layer to Windows:**  
Highlight any text in **any** application, 1-click the subtle floating Orb (or press `Ctrl + Alt + Space`), and your text is refined in-place in under 2 seconds.

---

## 🚀 Quick Install

### Method 1: Windows Package Manager (winget)
```powershell
winget install refinzi
```

### Method 2: Direct Setup Binary (.exe)
Download the standalone Windows setup executable:
* **Release Asset:** [`Refinzi-Setup-v2.0.0.exe`](https://github.com/papada1472/refinzi/releases/download/v2.0.0/Refinzi-Setup-v2.0.0.exe)
* **SHA256 Checksum:** `bd2416a3277b56ad1b2a119d8e9536aae0618f45d659c8269dd944f525a1c1e2`

To verify integrity after downloading, run in PowerShell:
```powershell
Get-FileHash .\Refinzi-Setup-v2.0.0.exe -Algorithm SHA256
```
*(The hash must match the SHA256 above)*.

> **Windows SmartScreen Note:** Because Refinzi is an independent, community-backed open-source tool without an expensive commercial EV certificate, Windows Defender SmartScreen may show an informational warning on first install. Click **More info → Run anyway**, or audit the source code and build locally.

### Method 3: Build from Source
```bash
git clone https://github.com/papada1472/refinzi.git
cd refinzi
npm install
npm run dev
```
To compile a standalone `.exe` installer locally:
```bash
npm run dist
```

---

## 🛠️ Core Capabilities

### 1. In-Place Text Rebuilding (`Ctrl + Alt + Space`)
Highlight text in any application (Cursor, Discord, Chrome, Word, Slack, Terminal). The ambient Orb anchors smoothly near your cursor. Tap the Orb or hit the shortcut to replace the selection with a model-calibrated prompt or polished prose.

### 2. 5-Block Architectural & Research Blueprint (`Ctrl + Alt + B` or Hold 300ms)
When a simple prompt isn't enough, holding the Orb generates a structured 5-block blueprint:
* **Block 1: Structure & Epistemic Hierarchy** — Layout grid trees, responsive breakpoints, or core scientific hypotheses.
* **Block 2: Component Assets & Variable Matrix** — Tokenized UI components, states, or cohort variables.
* **Block 3: Conversion Copy & Evidence Claims** — Value headlines, direct-response copy, or literature citations.
* **Block 4: Motion Dynamics & Adversarial Constraints** — Camera physics/vectors, or confounder audits and boundary controls.
* **Block 5: Master Production Prompt Pack** — Formatted execution prompts for Midjourney, Runway, Claude, or Cursor Composer.

### 3. Model Freedom & 0% Markup BYOK
Connect your own API key directly:
* **DeepSeek**: DeepSeek-V3, DeepSeek-R1 (Reasoning)
* **Anthropic**: Claude 3.5 Sonnet, Claude 3.7 Sonnet (Thinking)
* **OpenAI**: GPT-4o, GPT-4o mini, o1, o3-mini
* **Google**: Gemini 2.0 Flash, Gemini 1.5 Pro, Gemini 2.5
* **OpenRouter**: Nemotron 120B, Llama 3.3 70B, Qwen 2.5, Mistral Large
* **Local Offline**: Air-gapped localhost Ollama (`http://localhost:11434`)

### 4. 100% Local-First Privacy (Zero Telemetry)
* **No cloud database**: Your prompts never touch our servers and are never logged or trained on.
* **Native Windows DPAPI**: BYOK API keys are encrypted on-device via Windows Data Protection API (AES-256 GCM) tied to your Windows user account.
* **0/72 Clean**: Completely clean scan on VirusTotal.

---

## ⚖️ Refinzi vs. Alternatives

| Feature / Metric | ❌ Manual Alt-Tab | 🧩 Chrome Extensions | ⚡ Refinzi 2.0 (Windows) |
|---|---|---|---|
| **Platform** | Any | Browser only | **Windows 10 & 11 Native** |
| **Trigger Friction** | Copy, Alt-Tab, paste, copy back | Trapped in browser tabs | **In-Place Orb / Global Hotkey** |
| **Licensing** | N/A | Closed / SaaS | **100% Open Source (MIT)** |
| **Pricing** | Free (wasted time) | $15–$30/mo subscription | **Free BYOK / $12 Lifetime Supporter** |
| **Privacy Model** | Third-party cloud chats | Logged on extension servers | **100% Local DPAPI AES-256** |
| **Execution Latency** | 20–40 seconds | 5–10 seconds | **< 2.0 seconds in-place** |

---

## ☕ Pricing & The Supporter Tier

Refinzi rejects recurring SaaS subscriptions:

* **Free / BYOK Tier ($0 Forever):**  
  Full access to the ambient Orb, 5-Block Blueprint engine, global shortcuts, and unlimited usage with your own Gemini, DeepSeek, Anthropic, OpenAI, or OpenRouter API keys. 0% markup forever.
* **Supporter Pro ($12 USD / ₹999 INR One-Time Coffee):**  
  For users who want to support independent open-source development. Includes **zero-config managed routing** (use Claude 3.5 & GPT-4o without configuring API accounts), cloud preset syncing, VIP Discord community access, and lifetime free updates. Backed by an unconditional 14-day refund guarantee.

---

## 🧪 Testing & Development

Run unit and integration tests:
```bash
npm test
```

Run the local documentation & landing site:
```bash
cd landing
npm install
npm run dev
```

Build the production web bundle:
```bash
npm run build
```

---

## 🤝 Contributing

Contributions are welcome! Whether you are fixing bugs, optimizing Windows native hooks, adding provider integrations, or improving documentation:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License & Contact

* **License**: MIT License. See [LICENSE](LICENSE) for details.
* **Website**: [refinzi.com](https://refinzi.com)
* **Bug Reports**: [GitHub Issues](https://github.com/papada1472/refinzi/issues)
* **Discussions**: [GitHub Discussions](https://github.com/papada1472/refinzi/discussions)
* **Contact**: contact@refinzi.com
