# ORB Collection

This collection holds all Opening Range Breakout (ORB) related content
extracted from the ShurmeAi YM trading engine workstream.

> **Scope note:** This is *operational* ORB content (session records,
> level classification, IB/ORB mechanics as inputs to a deterministic
> engine). It is **not** an ORB educational curriculum. If/when an ORB
> educational system is built, it should live in a sibling folder
> (e.g. `education/`).

## Structure

```
orb/
├── README.md                          ← you are here
├── concepts/
│   ├── triple-lock.md                 ← ORB/IB triple-lock definition
│   └── ib-classification.md           ← IB width buckets (narrow → very wide)
└── sessions/
    └── 2026-04-17/
        ├── pre-market.md              ← session inputs / plan
        ├── after-market.md            ← session outcomes / actuals
        └── canonical-merger.md        ← plan-vs-actual merged record
```

## Source

All content extracted from a single ShurmeAi session (2026-05-16 chat,
user: @TuskenDayTrader). Instrument: **YM** (Dow Jones futures).
Engine version at time of extraction: **ShurmeAi prompt v7.0** (21 rules).

## Provenance rules

- No invented values.
- Missing fields are explicitly marked `missing`.
- Where plan and actual differ, both are preserved (labeled).
- Numeric values preserved exactly as recorded in the source session.
