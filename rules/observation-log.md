# ORB Observation Log

Rules derived **only from confirmed real-session outcomes**. Each rule cites the session(s) that produced it.

---

## Rule 1 — Two-Step Reversal Trigger

> When **IBH (60m ORBH) is rejected with a clear wick** AND **VWAP / ORBL is lost** in the same session, treat it as a confirmed two-step reversal. **Mandatory bias flip to bearish.** Do not maintain neutral.

- **Inverse** also applies: IBL rejected + VWAP reclaimed = mandatory bullish flip.
- Source: [`sessions/2026-04-22-YM`](../sessions/2026-04-22-YM/06-merged-canonical.md)
- Confirmation: 49,810 wick rejection → 49,616 VWAP loss → flush to 49,500.

---

## Rule 2 — NQ-Only Leadership Regime

> When **NQ leads alone** (new HOD) while **YM and RTY lag**, AND **DXY is firming** + **TLT is weakening**, tag the regime as **"fade YM rallies"**.

- The tape is fighting YM, not helping it.
- Mega-cap tech is absorbing flow that would normally lift YM.
- Source: [`sessions/2026-04-22-YM`](../sessions/2026-04-22-YM/06-merged-canonical.md)

---

## Rule 3 — Pre-Market Reversal Branch (Mandatory)

> When YM opens **near the ON low after a strong prior up-day**, the pre-market plan **must include an explicit reversal scenario** — not just a neutral-to-long default.

- A neutral bias defaulted to long is insufficient given the asymmetric reversal risk.
- Source: [`sessions/2026-04-22-YM`](../sessions/2026-04-22-YM/06-merged-canonical.md)

---

## Rule 4 — VWAP / ORBL Convergence = High-Conviction Pivot

> When session **VWAP and ORBL converge** to within ~5 points, treat that level as a **single high-conviction pivot**. Its loss auto-triggers the bearish-setup checklist; its reclaim auto-triggers the bullish-setup checklist.

- Source: [`sessions/2026-04-22-YM`](../sessions/2026-04-22-YM/06-merged-canonical.md) — 49,615 (ORBL) / 49,616 (VWAP) convergence.

---

## Rule Template (for future additions)

```
## Rule N — <name>

> <one-sentence rule>

- Conditions:
- Action:
- Source: sessions/<folder>
- Confirmation: <what proved it>
```
