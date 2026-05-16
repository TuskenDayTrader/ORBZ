# ORB Strategy — Index

> **Version:** 0.1 | **Created:** 2026-05-16 | **Status:** 🔧 placeholder — no strategy rules written yet

---

## What Goes Here

This folder will contain the **core strategy specification** for the
Opening Range Breakout (ORB) system, organized by timeframe and topic.

Planned contents:

| File | Purpose | Status |
|------|---------|--------|
| `orb-strategy-spec-template.md` | Blank template for documenting any ORB timeframe variant | ✅ scaffolded |
| `orb-5min-spec.md` | 5-minute ORB rules, entries, stops, targets | 🔧 TODO |
| `orb-15min-spec.md` | 15-minute ORB rules, entries, stops, targets | 🔧 TODO |
| `orb-30min-spec.md` | 30-minute ORB rules, entries, stops, targets | 🔧 TODO |
| `orb-60min-spec.md` | 60-minute ORB / Initial Balance rules | 🔧 TODO |
| `session-confluence.md` | How Asia / London / NY sessions interact with ORB setups | 🔧 TODO |
| `false-breakout-rules.md` | How to identify and filter false ORB breakouts | 🔧 TODO |
| `volume-confirmation.md` | Volume rules for confirming breakout quality | 🔧 TODO |

---

## Planned Strategy Sections (per timeframe)

Each timeframe spec file will follow the template in
`orb-strategy-spec-template.md` and include:

1. **Definition** — what this ORB variant is and why it works
2. **Opening range formation rules** — exactly how the range is drawn
3. **Entry rules (long)** — step-by-step buy setup
4. **Entry rules (short)** — step-by-step sell setup
5. **Stop loss options** — at minimum three clearly defined options
6. **Take profit / target rules** — R:R ratios and extension targets
7. **Filters** — what conditions must be true before taking a trade
8. **False breakout rules** — how to avoid common traps
9. **Volume confirmation** — what volume behavior confirms the setup
10. **Instruments and markets** — where this variant applies
11. **Examples** — at least two annotated trade examples (long + short)

---

## TODO

- [ ] Write `orb-5min-spec.md`
- [ ] Write `orb-15min-spec.md`
- [ ] Write `orb-30min-spec.md`
- [ ] Write `orb-60min-spec.md`
- [ ] Write `session-confluence.md`
- [ ] Write `false-breakout-rules.md`
- [ ] Write `volume-confirmation.md`
- [ ] Add examples with annotated charts or ASCII diagrams

---

*See the top-level `orb/README.md` for the full collection index.*
