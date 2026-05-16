# Extraction Templates

The three structured prompts used to produce every session record in this repo.

---

## 1. Pre-Market Extraction (ShurmeAi)

Extract only the pre-market plan and structure for the upcoming YM session. Fields:

- **Session header:** date, valid RTH day, phase
- **YM structure:** current price, prior session H/L/settle, ON H/L, opening print, 15m/30m ORBH/ORBL, IBH/IBL, VWAP, support/resistance zones, wick & pivot shelves, acceptance/rejection, structure persistence, fragile/proven/broken levels
- **ORB / IB:** scenario, mechanical context, IB range, classification, contained/extended, failed IBH/IBL break
- **Tape / context:** ES, NQ, RTY, VIX, TLT, DXY, $TICK, tape bias, helped/fought YM
- **Session decision:** YM bias, best support, best resistance, decision point, active levels, setup type, confidence, no-trade/wait

**Rules:** missing → `missing`, uncertain → `uncertain`, prefer zones over lines, no speculation.

---

## 2. After-Market Extraction (ShurmeAi)

Extract only the actual completed-session results, outcomes, and lessons. Sections:

- Session header, price action, ORB/IB behavior, tape/context
- **Bias accuracy:** pre-market bias, correct / partially correct / wrong
- **S/R outcomes:** held / failed / pivots created / fragile-proven-broken
- **What mattered, what failed, what succeeded**
- **Lessons learned** (1, 2, 3, + additional)
- **Carry-forward block** (levels, regime, ORB/IB, fragile/proven/broken, setups)
- **Invalidations / surprises / next-session watch**
- **Rule output:** new rules, updates, deletions

---

## 3. Session Merger (ShurmeAi)

Merges pre-market + after-market into one canonical record.

**Authority rules:**
- After-market = source of truth for outcomes.
- Pre-market = source of truth for the original plan.
- Conflicts → keep both, label `planned` vs `actual`.
- Never merge uncertain → certain.
- Prefer exact numerics & zones.

Sections: Session Header • Plan vs Actual • YM Structure • ORB/IB • Tape • Session Decision • Outcome Summary • Lessons/Rules • Carry-Forward Block • Quality Flags.
