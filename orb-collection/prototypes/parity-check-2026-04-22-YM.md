# Rule 1 Parity Check — 2026-04-22 YM

## Scope

- Python validator:
  - `/home/runner/work/ORBZ/ORBZ/orb-collection/prototypes/rule1_validator.py`
- TradingView prototype:
  - `/home/runner/work/ORBZ/ORBZ/orb-collection/prototypes/tradingview-rule1-prototype.pine`
- Session input:
  - `/home/runner/work/ORBZ/ORBZ/sessions/2026-04-22-YM/normalized-session-v1.json`

## Expected parity criteria

1. Rule 1 branch selected: bearish.
2. Trigger sequence: IBH wick rejection first, then VWAP/ORBL pivot loss.
3. Directional implication: bearish bias flip.
4. Mechanical compliance gate status must match between Python and TradingView.

## 2026-04-22 YM expected result

- IBH rejection event: present.
- VWAP/ORBL loss event: present after IBH rejection.
- Final Rule 1 signal status: `triggered=true`, `direction=bearish`.
- Tradeability status: `tradable=false` until external program limits are verified.

## Timestamp alignment

- Normalized reference trigger time:
  - `2026-04-22T12:00:00-04:00` (VWAP/ORBL loss event)
- TradingView parity method:
  - Confirm bar timestamp where `bearRule1` first prints equals the pivot-loss bar after IBH rejection state is set.

## Outcome

- Prototype parity status: expected match with this normalized session.
- Expansion gate: proceed to Rules 2–4 only after this parity check stays consistent on additional sessions.
