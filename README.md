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
    └── meta/
        └── mining-prompt-v1.0.md     ← cross-session reconstruction prompt
```

## Quick Links

- [Collection index](./orb-collection/README.md)
- [Rules registry](./orb-collection/rules/rules-registry.md)
- [ORB glossary](./orb-collection/reference/orb-glossary.md)
- [Latest session: 2026-04-21](./orb-collection/sessions/2026-04-21/)

## Status

🔧 **Seed commit** — collection initialized from chat artifacts on 2026-05-16.
Many planned ORB-education components (5m/15m/30m/60m strategy guides, checklist, journal, accessibility framework) are **not yet written**. See [`meta/mining-prompt-v1.0.md`](./orb-collection/meta/mining-prompt-v1.0.md) for the full roadmap.
