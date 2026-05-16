# ORB Templates — Index

> **Version:** 0.1 | **Created:** 2026-05-16 | **Status:** 🔧 partially scaffolded

---

## What Goes Here

This folder contains **reusable templates** for journaling trades,
planning sessions, and tracking performance.

| File | Purpose | Status |
|------|---------|--------|
| `trading-journal-template.md` | Blank journal entry template for recording each trade | ✅ scaffolded |
| `session-plan-template.md` | Template for writing a pre-market session plan | 🔧 TODO |
| `weekly-review-template.md` | Template for end-of-week performance review | 🔧 TODO |
| `monthly-review-template.md` | Template for monthly system audit | 🔧 TODO |

---

## How to Use the Trading Journal Template

1. Open `trading-journal-template.md`.
2. Copy the full contents.
3. Create a new file named `YYYY-MM-DD-trade-N.md` (e.g., `2026-05-16-trade-1.md`).
4. Paste the template and fill in each field.
5. Save it in the relevant `sessions/` folder or in a personal journal folder.

---

## Journal Column Definitions

*(To be fully defined when the strategy spec is complete. Preliminary columns below.)*

| Column | Definition |
|--------|-----------|
| Date | Trading date (ET) |
| Instrument | Ticker or contract (e.g., YM, AAPL) |
| Session | RTH / Pre-market / Globex |
| Direction | Long / Short |
| ORB Timeframe | 5m / 15m / 30m / 60m |
| Entry Price | Actual fill price |
| Stop Price | Stop loss level used |
| Target Price | Take profit level |
| Exit Price | Actual exit price |
| P&L | Dollar gain/loss |
| R Outcome | Result in R units (e.g., +1.5R, -1R) |
| Setup Quality | Pre-trade rating (A / B / C) |
| Execution Quality | Post-trade self-rating |
| Notes | What happened, what you learned |

---

## TODO

- [ ] Write `session-plan-template.md`
- [ ] Write `weekly-review-template.md`
- [ ] Write `monthly-review-template.md`
- [ ] Finalize journal column definitions once strategy spec is complete
- [ ] Add an example filled-in journal entry

---

*See the top-level `orb/README.md` for the full collection index.*
