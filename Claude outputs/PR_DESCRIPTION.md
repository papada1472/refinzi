# Fix dashboard metric integrity, offline-engine counting, and orb hold gesture

## Summary

Addresses a review of the dashboard, the logic-output engine, and the click-and-hold
interaction. The theme of the findings was that the **presentation layer over-claimed
what the logic layer delivered** — success toasts on uncounted events, "zero latency"
with a 380 ms floor, tooltips describing math that didn't exist, and "lifetime" totals
that silently capped. This PR fixes the correctness, UX, and honesty bugs; two
design-level items are intentionally deferred (see *Deliberately out of scope*).

All **815 unit tests pass** (up from 813 — two regression tests added), `tsc --noEmit`
is **clean** (also fixes a pre-existing type error), and the Chrome bundles are rebuilt.

---

## Fixes

### P0 — Offline / local-engine calibrations were recorded as *failures*
`background.ts` set `success = !response.isFallback && !response.providerFailure`, and
the dashboard counts only `success` events. Any prompt served by the offline engine —
including the entire **"Instant Local Engine"** provider — recorded `success:false`, so
the dashboard read **0** while the success toast said it worked. Now a delivered prompt
is the value: `success` is true whenever a non-empty prompt was produced
(`producedUsablePrompt()`); genuine throws still record `false`.

### P0 — "Est. Cost Saved" was permanently blank for the default install
`calculateCostSaved()` only fell back for `openai/claude/gemini/deepseek/openrouter`,
excluding the default `bai`, `gateway`, and `groq` providers, and `background.ts` left
`model` undefined for them. The default configuration therefore showed `—` forever. Now
`bai/groq/gateway` are included in the estimable set, and the destination AI's
representative model (`TARGET_AI_DEFAULT_MODELS`) is used when no per-provider model is
set. `local` still resolves to `—` (no API cost to save) — verified by test.

### P1 — "Lifetime total" silently under-counted past the event cap
Period math keeps a bounded rolling window (`refinzi_events`), which truncated the
"All Time" / "lifetime total" figures for heavy users. Added an unbounded
`refinzi_lifetime_totals` tally (incremented on each successful calibration, decremented
on delete, reset on clear). `computeMetricsSummary()` uses it for the All Time view so
lifetime figures never regress. Window raised 500 → 1000 for better cost coverage.

### P1 — Hold-vs-drag gesture conflict cancelled deliberate Expert holds
On a trackpad a held Expert gesture drifts a few pixels; the 6 px drag threshold flipped
it into a reposition-drag and silently cancelled the trigger. A page scroll during a hold
also hard-reset the gesture. Raised `DRAG_THRESHOLD` 6 → 12 and made scroll a no-op during
an active hold (pointer capture + `pointerup`/`pointercancel` already resolve the gesture).

### P1 — Dashboard tooltips described non-existent math
The Time-Saved tooltip claimed "default 4 min" (actual default 2.5) and the Cost-Saved
tooltip claimed "value per hour (default $50/hr)" (no hourly model exists). Both now
describe the real calculation. Regression assertions in `popup_dom.test.ts` updated.

### P1 — "Zero latency" claim contradicted the 380 ms perceived-craft floor
The offline checklist claimed "Zero latency" while the controller floors every
calibration at 380 ms. Dropped the false claim ("Instant local calibration applied").

### P2 — Mojibake in shipped user-facing strings
The extension-context-invalidated fallback path rendered `âš¡ Better calibrated`,
`ðŸ§  Expert briefing applied`, and `â†© Original prompt restored`. Re-encoded UTF-8 clean
(plus comment em-dashes) in `controller.ts`.

### P2 — Lost-update race in the shared storage batch
Two concurrent generations shared one module-global `pendingWrites`, so a rapid
Better→Expert could clobber one event write. Post-generation persistence is now
serialized (`serializePersistence`) so each batch flushes before the next begins.

### Pre-existing — `tsc` failure
`DEFAULT_SETTINGS` was missing the required `enabled` field, failing `npm run typecheck`.
Added `enabled: true`.

---

## Deliberately out of scope (documented, not silently dropped)

- **Offline-engine boilerplate** — the deterministic `promptBuilder.ts`/`expertBuilder.ts`
  emit category templates, which contradicts the engine's own anti-generic principle. A
  correct fix is an input-grounded rewrite that would churn the calibration snapshot
  suite and needs product decisions. Tracked as a follow-up rather than bundled here.
- **Scope-gate negation fragility** — `expertValidator.ts` flags scope expansion on a bare
  keyword match, so a prompt that says "no pricing" *could* misfire. The current builders
  never emit the trigger words (enforced by `expert.test.ts`), so this is latent, not
  active; left untouched to avoid modifying a passing safety gate.
- **Double-click-reset stray Better**, **manifest `all_frames`/broad host perms**, and the
  **Week/Month "trailing-N-days vs calendar" label** — each is a product/UX trade-off or is
  locked by existing test expectations; noted for a separate decision.

---

## Testing

```
npm run typecheck   # clean
npm test            # 815 passed | 1 skipped
npm run build       # chrome/edge/firefox bundles rebuilt
```

New regression tests: cost-saved populates for default cloud providers while `local`
stays `—`; lifetime-totals override drives the All Time view when the window truncates.

## Rebuilt artifacts

`extension/content.js`, `extension/background.js`, `extension/popup/popup.js` regenerated
from source via `npm run build:chrome` so the committed bundles match the fixed source.
