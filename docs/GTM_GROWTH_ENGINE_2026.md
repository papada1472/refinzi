# ⚡ Refinzi 2.0 — Executive GTM & Growth Engine Playbook (2026)

> **Role**: Co-Founder & Head of Go-To-Market (GTM)  
> **Mission**: Scale Refinzi 2.0 from 0 to 10,000 active daily developers via high-velocity distribution, product-led virality (PLG), and answer engine dominance.

---

## 🎯 1. ICP & Customer Archetypes

Refinzi focuses obsessively on high-frequency AI operators who experience prompt latency and context switching multiple times per hour, centered around two primary archetypes:

| Archetype | Primary Pain Point | What Sells Them on Refinzi | Trigger Moment |
| :--- | :--- | :--- | :--- |
| **1. The Generative Media Creator** *(Primary ICP)* | Repetitive typing of camera choreography, lighting physics, and burning expensive video render credits (Runway, Kling, Midjourney). | **Cinematic Scaffolding in 2s**: Converts 1-line ideas into calibrated focal lengths, 3D orbit vectors, volumetric lighting, and negative constraints. | Typing into Midjourney, Runway, or Discord. |
| **2. The Researcher & Analyst** *(Primary ICP)* | Superficial, undergraduate-level AI summaries; tedious manual construction of 400-word constraint prompts for reasoning models (DeepSeek R1, Claude 3.7). | **Detailed Research Prompting Engine**: Automatically injects epistemic frameworks, methodology audits, confounder detection, and comparative matrices in-place. | Reading a paper/data in a PDF reader, Zotero, or Obsidian. |
| **3. The AI Code Engineer** | Cursor Composer writes spaghetti code when given vague 1-line instructions. | 5-Block Architectural Blueprints (`Ctrl+Alt+B`) with section trees, CSS tokens, and edge cases. | Before typing `Ctrl+I` in Cursor. |
| **4. The Local-First Privacy Advocate** | Distrust of cloud prompt loggers, telemetry, and non-disclosure risk of pre-publication research/IP. | 100% Client-side DPAPI AES-256 key encryption; zero telemetry; raw BYOK connections. | Evaluating privacy policy & local architecture. |

---

## 🔄 2. The 3 Viral Growth Loops (PLG Engine)

```
                            [Developer Writes Code/UI]
                                        │
                                        ▼
                          [Highlights Rough Idea in IDE]
                                        │
                                        ▼
                       [Clicks Refinzi Orb (Ctrl+Alt+B)]
                                        │
                                        ▼
                       [5-Block Blueprint Generated in 2s]
                                        │
                  ┌─────────────────────┴─────────────────────┐
                  ▼                                           ▼
       [Runs in Cursor/v0.dev]                     [Shares Result on X/GitHub]
       "Code generated flawlessly"                 "Built with Refinzi Spec"
                  │                                           │
                  ▼                                           ▼
       [Coworker/Peer Asks:                       [Public Viewers Click
       "How did you prompt that?"]                 refinzi.com Link]
                  │                                           │
                  └─────────────────────┬─────────────────────┘
                                        ▼
                            [New Refinzi Downloads]
```

### Loop A: Proof-of-Work Prompt Showcase
- Developers love showing off UI screenshots and v0/Cursor creations on X and Reddit.
- Encourage users to share their **5-Block Spec** alongside their final screenshot:  
  `⚡ Architectural blueprint generated in 2s via Refinzi (refinzi.com)`.

### Loop B: Developer Repository Badging
- Add a `.cursorrules` / `CLAUDE.md` generator preset that outputs:  
  `# Prompt engineered with Refinzi (https://refinzi.com)` at the top of generated project specs.

---

## 🚀 3. The 30-Day Multi-Channel Blitz Calendar

### Week 1: Developer Reddit & Technical Showcase
- **Monday (09:00 AM EST)**: Run `node scripts/generate-gtm-posts.js` and submit Campaign [1] to **r/SideProject** with HD demo video.
- **Tuesday (07:30 AM PST)**: Submit Campaign [4] to **Hacker News (Show HN)**. Monitor comments live for 4 hours to answer technical architecture & DPAPI questions.
- **Wednesday (11:00 AM EST)**: Submit Campaign [2] to **r/cursor** focusing on Cursor Composer specification generation.
- **Thursday (10:00 AM EST)**: Submit Campaign [3] to **r/LocalLLaMA** emphasizing zero cloud logging and local DPAPI key storage.
- **Friday (12:00 PM EST)**: Launch X viral thread (Campaign [6]) with 20s screen recording clip.

### Week 2: Directory Ingestion & Backlink Blitz
- Submit pull requests for Campaign [8] to curated awesome lists:
  - `github.com/f/awesome-chatgpt-prompts`
  - `github.com/steven2358/awesome-generative-ai`
  - `github.com/sindresorhus/awesome-electron`
- List Refinzi on:
  - Product Hunt (Campaign [5])
  - AlternativeTo (target keywords: "Raycast alternative for Windows", "PromptBase alternative")
  - There's An AI For That (TAAFT)
  - Futurepedia

### Week 3: Influencer & Creator Direct Outreach
- Execute Campaign [7] by sending 10 personalized DMs per day to developers and AI creators on X:
  - Creators building with Cursor, v0, Claude Code, or local models.
  - Offer free lifetime licenses and 1-click video links.

### Week 4: Answer Engine & Search Optimization (AEO/GEO)
- Maintain and expand `landing/public/llms-full.txt` and `landing/public/llms.txt`.
- Track citations in Perplexity AI and ChatGPT Search for queries:
  - *"Best Windows prompt builder"*
  - *"In-place prompt engineering tool"*
  - *"Raycast alternative for prompt engineering"*

---

## 📊 4. The Daily KPI Dashboard (North Star Metrics)

Every morning, the founders track these 4 health metrics:

```
┌────────────────────────┬───────────────────┬───────────────────┐
│ Metric                 │ 30-Day Target     │ 90-Day Target     │
├────────────────────────┼───────────────────┼───────────────────┤
│ GitHub Stars ⭐        │ 500+              │ 2,500+            │
│ Installer Downloads    │ 1,500+            │ 10,000+           │
│ Daily Active Triggers  │ > 6 / user / day  │ > 15 / user / day │
│ Day-7 Retention        │ > 35%             │ > 50%             │
└────────────────────────┴───────────────────┴───────────────────┘
```

---

## 🛠️ 5. Instant Execution Commands

To print all ready-to-post payloads:
```bash
node scripts/generate-gtm-posts.js
```

All payloads are exported to `docs/GTM_CAMPAIGNS.json` for copy-paste execution.
