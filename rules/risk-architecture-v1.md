# ORB Risk Architecture v1 (Mechanical Enforcement Spec)

This document codifies the provided risk/execution structure into enforceable rules for prototypes.

---

## Confirmed Core Constraints (Enforced)

- Bracket orders required for every trade (`entry + stop + target`).
- Zone-edge trading only (no midrange trades, no chase).
- Deterministic/non-discretionary logic only.
- Tape/context confirmation required.
- Positive risk:reward required, with strategy tiers supporting 1.5R and 2.0R.
- Per-trade risk cap: `0.25%` of account equity (default personal max).
- Stop management: stop-to-breakeven after +35 points (when enabled by plan).
- One contract by default unless explicit scaling permissions are present.

---

## Explicit Rule Translation (Entry / Exit / Invalidation)

### Entry validity

A trade is valid only when all are true:

1. `order_is_bracket == true`
2. `entry_zone_type in {support_edge, resistance_edge, session_edge}`
3. `entry_zone_type != midrange`
4. `discretionary_override == false`
5. `tape_confirmed == true`
6. `risk_dollars <= account_size * 0.0025`
7. Directional stop placement is structurally valid:
   - Long: `stop_loss < entry_price`
   - Short: `stop_loss > entry_price`
8. At least one TP exists and all TPs are on the correct side of entry:
   - Long: `tp > entry_price`
   - Short: `tp < entry_price`

### Exit/R:R validity

1. Every TP must satisfy `RR > 1.0`
2. Strategy-compliance tiers require:
   - At least one TP with `RR >= 1.5`
   - At least one TP with `RR >= 2.0`

### Invalidation (hard block)

If any required compliance condition fails, trade is blocked.

---

## UNCONFIRMED External Program Rules (Mandatory Block Until Supplied)

The following must be verified from official funded-program text:

- Daily max loss (DLL)
- Max drawdown / trailing drawdown
- Program-specific contract scaling limits

Prototype policy:

- If these are not marked verified, set `external_limits_verified = false` and block execution.

---

## Notes

- Multi-target exits (`TP1/TP2/TP3`) are supported by policy and expected in prototype examples.
- No opportunistic or “by feel” trading is allowed.
- Any ambiguous rule should be blocked and surfaced in compliance output.
