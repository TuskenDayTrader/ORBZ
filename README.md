# ORBZ

> It all starts with the ORBZ.

This repository is the canonical home for the **Opening Range Breakout (ORB) trading system** developed by [@TuskenDayTrader](https://github.com/TuskenDayTrader) in collaboration with **ShurmeAi**.

It holds live session records, structured extraction templates, the rules registry, reference material, and meta-prompts used to mine and continue work across sessions.

## Repository Map

```
ORBZ/
├── README.md                         ← you are here
└── orb-collection/
    ├── README.md                     ← collection index + conventions
    ├── sessions/                     ← daily YM session records
    │   ├── 2026-04-20/               ← carry-forward block (source)
    │   └── 2026-04-21/               ← pre-market plan + SVG + merger
    ├── templates/                    ← reusable extraction prompts
    │   ├── pre-market-extraction.md
    │   ├── post-market-extraction.md
    │   └── session-merger.md
    ├── rules/
    │   └── rules-registry.md         ← rules 1–26 ledger
    ├── reference/
    │   └── orb-glossary.md           ← ORB / IB / triple-lock terms
    ├── learning/                     ← accessibility-first ORB course
    │   ├── README.md                 ← master course index
    │   ├── 01-orb-basics.md
    │   ├── 02-timeframe-playbooks.md
    │   ├── 03-risk-and-trade-management.md
    │   └── 04-daily-checklist-and-journal.md
    └── meta/
        └── mining-prompt-v1.0.md     ← cross-session reconstruction prompt
```

## Quick Links

- [Collection index](./orb-collection/README.md)
- [ORB Course Home (Accessibility-First)](./orb-collection/learning/README.md)
- [Rules notes](./rules/observation-log.md)
- [ORB glossary](./docs/glossary.md)
- [Latest session: 2026-04-22-YM](./sessions/2026-04-22-YM/)

## Status

✅ **ORB learning course added** — accessibility-first ORB education materials are now available in [`orb-collection/learning/`](./orb-collection/learning/).
