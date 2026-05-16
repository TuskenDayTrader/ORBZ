# ORB Strategy Specification — [TIMEFRAME] Variant

> **Version:** (not yet defined) | **Created:** YYYY-MM-DD | **Status:** 🔧 template / placeholder

> **Instrument(s):** (not yet defined)
> **Session:** (not yet defined — e.g., U.S. RTH, Globex, London)
> **Timeframe:** (not yet defined — e.g., 5m, 15m, 30m, 60m)

---

## 1. Definition

> What is the [TIMEFRAME] ORB? Why does this opening window matter?

(not yet defined)

### Opening range window

| Field | Value |
|-------|-------|
| Start time | (not yet defined) |
| End time | (not yet defined) |
| Duration | (not yet defined) |
| Range definition | High of first [N] candles / Low of first [N] candles |
| Re-draw rules | (not yet defined) |

---

## 2. Opening Range Formation Rules

> Exactly how is the opening range drawn on this timeframe?

- (not yet defined)

### What invalidates the range?

- (not yet defined)

---

## 3. Entry Rules — Long (Buy)

> Step-by-step conditions that must all be true before entering a long trade.

- [ ] Price has broken **above** the opening range high
- [ ] (additional conditions — not yet defined)
- [ ] (additional conditions — not yet defined)
- [ ] Volume confirmation: (not yet defined)
- [ ] Higher-timeframe context check: (not yet defined)

**Entry trigger:** (not yet defined — e.g., candle close above ORB high, first pullback, etc.)

---

## 4. Entry Rules — Short (Sell)

> Step-by-step conditions that must all be true before entering a short trade.

- [ ] Price has broken **below** the opening range low
- [ ] (additional conditions — not yet defined)
- [ ] (additional conditions — not yet defined)
- [ ] Volume confirmation: (not yet defined)
- [ ] Higher-timeframe context check: (not yet defined)

**Entry trigger:** (not yet defined)

---

## 5. Stop Loss Options

> Three clearly defined stop loss placement options. Use the one that fits your risk tolerance.

### Option A — Tight Stop
- Placement: (not yet defined)
- Distance from entry: (not yet defined)
- Use when: (not yet defined)

### Option B — Standard Stop
- Placement: (not yet defined)
- Distance from entry: (not yet defined)
- Use when: (not yet defined)

### Option C — Wide Stop
- Placement: (not yet defined)
- Distance from entry: (not yet defined)
- Use when: (not yet defined)

---

## 6. Take Profit / Target Rules

> Where to exit. Minimum and extended targets.

| Target | Level | R:R Ratio | Notes |
|--------|-------|-----------|-------|
| T1 (minimum) | (not yet defined) | 1:1 | (not yet defined) |
| T2 (standard) | (not yet defined) | 1:1.5 | (not yet defined) |
| T3 (extended) | (not yet defined) | 1:2+ | (not yet defined) |

**Partial exits:** (not yet defined)

---

## 7. Filters

> Conditions that must be present for the setup to qualify. If any filter fails, skip the trade.

- [ ] (not yet defined)
- [ ] (not yet defined)
- [ ] (not yet defined)

---

## 8. False Breakout Rules

> How to identify and avoid common false breakouts on this timeframe.

- (not yet defined)

**Key signs a breakout is failing:**
- (not yet defined)

---

## 9. Volume Confirmation

> What volume behavior confirms the breakout is real?

- (not yet defined)

**Volume red flags (do not trade if):**
- (not yet defined)

---

## 10. Instruments and Markets

> Where this timeframe variant applies.

| Instrument | Market | Session | Notes |
|------------|--------|---------|-------|
| (not yet defined) | | | |

---

## 11. Session Confluence Notes

> How Asia / London / New York session behavior affects this setup.

- (not yet defined)

---

## 12. Examples

> At least two annotated examples. Mark as ⚠️ NOT YET WRITTEN until filled.

### Example 1 — Long Setup

⚠️ NOT YET WRITTEN

### Example 2 — Short Setup

⚠️ NOT YET WRITTEN

---

## 13. Known Edge Cases and Warnings

- (not yet defined)

---

## 14. Version History

| Version | Date | Change |
|---------|------|--------|
| 0.1 | 2026-05-16 | Template scaffolded — all fields empty |

---

*Template file. Copy and rename for each timeframe variant.*
*Part of the `orb/strategy/` collection. See `orb/README.md` for the full index.*
