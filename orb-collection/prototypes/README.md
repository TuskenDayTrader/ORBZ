# ORB Prototype Workspace

## Files

- `rule_engine.py` — shared Rule 1 and compliance helpers for prototype validators/rankers.
- `rule1_validator.py` — Python replay validator for Rule 1 + mechanical compliance enforcement.
- `opportunity_ranker.py` — Python prototype for selected-ticker opportunity ranking from structured screenshot extraction.
- `tradingview-rule1-prototype.pine` — TradingView indicator prototype for Rule 1 with compliance gate.
- `examples/screenshot-opportunity-batch-v1.json` — structured screenshot-analysis input example for the ranker.
- `parity-check-2026-04-22-YM.md` — parity criteria and expected outcome.
- `results/` — Python validator outputs.

## Mechanical enforcement coverage

- Bracket-only entries.
- Zone-edge-only entries (midrange blocked).
- Deterministic/non-discretionary gating.
- Tape/context confirmation required.
- RR checks (`>1.0`, plus strategy tier checks for `>=1.5` and `>=2.0`).
- Risk cap check (`0.25%` of account).
- One-contract default unless scaling permission is explicit.
- Stop-to-breakeven threshold check (`+35 points`).
- Mandatory block when external funded-program limits are UNCONFIRMED.

## Run Python validator

From repository root:

```bash
python3 /home/runner/work/ORBZ/ORBZ/orb-collection/prototypes/rule1_validator.py
```

## Run screenshot opportunity ranker

From repository root:

```bash
python3 /home/runner/work/ORBZ/ORBZ/orb-collection/prototypes/opportunity_ranker.py
```
