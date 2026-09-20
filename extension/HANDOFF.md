# Refinzi Extension — Complete Engineering & Product Handoff

> For the comprehensive handoff and architectural documentation, see [EXTENSION_HANDOFF.md](file:///e:/Antigravity%20Projects/Refinezy/Refinzi%202.0/docs/EXTENSION_HANDOFF.md).

## Quick Reference

### Core Interaction Paradigm
- **Click (<350ms):** ⚡ **Better Prompt** — In-place prompt calibration (~500ms).
- **Hold (≥350ms):** 🧠 **Expert Prompt** — Autonomous deep calibration (Semantic Intent Object synthesis, zero user interrogation).
- **In-Place Replacement:** Replaces text directly inside the composer; displays floating Undo toast.
- **Universal Surface:** Works in ChatGPT, Claude, Gemini, Perplexity, plus *any* `<textarea>`, `<input>`, or `contenteditable` across the web.

### Key Directories
- `src/ui/orb.ts`: Ambient Orb component, hold progress ring, drag logic.
- `src/ui/controller.ts`: Content script lifecycle orchestrator.
- `src/engine/`: Intelligence calibration pipelines (`better.ts`, `expert.ts`, `surface/`, `calibration/`, `expert/`).
- `src/providers/`: BYOK LLM execution clients (`gemini.ts`, `openai.ts`, `deepseek.ts`, `openrouter.ts`, `manager.ts`).
- `src/adapters/`: AI platform composer adapters (`chatgpt.ts`, `claude.ts`, `gemini.ts`, `perplexity.ts`, `registry.ts`).
- `src/background.ts`: Secure service worker, credential isolation, request deduplication.
- `popup/`: Glassmorphic 4-tab popover (Dashboard metrics, Provider BYOK setup, History, Settings).

### Commands
```bash
npm test            # Run 719 Vitest tests (15 test suites)
npm run build       # Build Chrome, Edge, and Firefox bundles + release ZIPs
npm run typecheck   # Typecheck TypeScript (tsc --noEmit)
```

### Store & Compliance Artifacts
- **Privacy Policy:** [privacy-policy.md](file:///e:/Antigravity%20Projects/Refinezy/Refinzi%202.0/docs/privacy-policy.md)
- **CWS Submission Guide:** [CWS_SUBMISSION_GUIDE.md](file:///e:/Antigravity%20Projects/Refinezy/Refinzi%202.0/store/CWS_SUBMISSION_GUIDE.md)
- **Free Tier:** 25 prompt calibrations bundled with default Gemini key; degrades gracefully to local offline engine.
