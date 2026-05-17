# ORB Rule Set v1 (Prototype Spec)

Source rules:

- `/home/runner/work/ORBZ/ORBZ/rules/observation-log.md`

This file freezes Rule 1–4 into explicit trigger/action/invalidation logic for prototype validation.

---

## Rule 1 — Two-Step Reversal Trigger

### Bearish branch

- Trigger conditions:
  1. `ibh_rejected_with_wick == true`
  2. `vwap_orbl_lost_after_ibh_rejection == true`
- Entry:
  - `entry_signal = "short_on_vwap_orbl_loss_or_retest_failure"`
- Expected directional implication:
  - `direction = "bearish"`
- Exit framework:
  - Partial at nearest support shelf
  - Runner toward next support zone
- Invalidation:
  - Reclaim and hold above VWAP/ORBL pivot after trigger

### Bullish inverse branch

- Trigger conditions:
  1. `ibl_rejected_with_wick == true`
  2. `vwap_reclaimed_after_ibl_rejection == true`
- Entry:
  - `entry_signal = "long_on_vwap_reclaim_or_retest_hold"`
- Expected directional implication:
  - `direction = "bullish"`
- Invalidation:
  - Lose VWAP after reclaim and fail to recover

---

## Rule 2 — NQ-Only Leadership Regime

- Trigger conditions:
  1. `nq_new_hod == true`
  2. `ym_lagging == true`
  3. `rty_lagging == true`
  4. `dxy_firming == true`
  5. `tlt_weakening == true`
- Action:
  - `regime_tag = "fade_ym_rallies"`
- Directional implication:
  - Prefer bearish YM continuation/fade setups until regime invalidates.
- Invalidation:
  - YM and RTY confirm upside leadership and macro pressure (DXY/TLT) normalizes.

---

## Rule 3 — Pre-Market Reversal Branch Mandatory

- Trigger conditions:
  1. `open_near_on_low == true`
  2. `prior_day_trend == "strong_up"`
- Action:
  - `premarket_requires_reversal_branch = true`
- Directional implication:
  - Do not default to neutral-to-long only.
- Invalidation:
  - Not applicable intraday; planning quality rule.

---

## Rule 4 — VWAP/ORBL Convergence Pivot

- Trigger conditions:
  1. `abs(vwap - orbl) <= 5`
- Action:
  - `pivot_level = mean(vwap, orbl)`
  - On loss: activate bearish setup checklist
  - On reclaim: activate bullish setup checklist
- Directional implication:
  - Pivot governs tactical bias flips.
- Invalidation:
  - Persistent chop around pivot with no acceptance/rejection.
