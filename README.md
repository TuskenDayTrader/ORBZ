# ORBZ

> It all starts with the ORBZ.

A structured collection of Opening Range Breakout (ORB) trading research, session extractions, level datasets, and observation-derived rules for the YM (E-mini Dow Jones) futures contract.

---

## Repository Layout

```
ORBZ/
├── README.md                       ← you are here
├── sessions/                       ← per-session extractions (pre / mid / power-hour / AAR / merged)
│   └── 2026-04-22-YM/
│       ├── 01-premarket.md
│       ├── 02-midday.md
│       ├── 03-lunch-powerhour-prep.md
│       ├── 04-powerhour-recap.md
│       ├── 05-aftermarket-AAR.md
│       ├── 06-merged-canonical.md
│       └── svg/
│           ├── ym_premarket_plan.svg
│           ├── ym_midday_plan.svg
│           ├── ym_lunch_powerhour_prep.svg
│           └── ym_powerhour_recap.svg
├── data/
│   └── ym-orb-levels.csv           ← rolling 15m / 30m / 60m ORBH-ORBL dataset
├── rules/
│   ├── observation-log.md          ← rules derived from real sessions
│   └── extraction-templates.md     ← the pre-market / after-market / merge prompts
└── docs/
    └── glossary.md                 ← ORB / IB / VWAP terminology used in this repo
```

---

## What this repo IS

- A growing **evidence log** of YM sessions analyzed through an ORB / IB / VWAP lens.
- A **structured dataset** of 15m / 30m / 60m opening-range levels per session.
- A **rule book** that only contains rules confirmed by real session outcomes.

## What this repo is NOT (yet)

- 🔧 No entry / stop / take-profit mechanical strategy guide (planned).
- 🔧 No position-sizing or risk-management framework (planned).
- 🔧 No backtest results or win-rate statistics (planned).
- 🔧 No educational / accessibility scaffolding for beginners (planned).

See [`rules/observation-log.md`](rules/observation-log.md) for the current confirmed rule set.

---

## Conventions

- All times **EST**.
- Instrument: **YM** (E-mini Dow Jones), primary contract month per session.
- Price levels expressed in YM points (e.g. `49,810`).
- Zones preferred over single lines wherever possible.
- `planned` vs `actual` distinction preserved on every merged session record.

---

## Contributing future sessions

1. Create `sessions/YYYY-MM-DD-YM/` folder.
2. Drop the five extraction files (`01`–`05`) plus the merged canonical record (`06`).
3. Append the day's 15m / 30m / 60m ORB levels to `data/ym-orb-levels.csv`.
4. If a new rule is confirmed by the session outcome, add it to `rules/observation-log.md` with a citation back to the session folder.

---

*Maintainer: [@TuskenDayTrader](https://github.com/TuskenDayTrader)*
