#!/usr/bin/env python3
import json
from pathlib import Path

from rule_engine import evaluate_compliance, evaluate_rule1


def main() -> None:
    repo = Path(__file__).resolve().parents[2]
    input_path = repo / "sessions/2026-04-22-YM/normalized-session-v1.json"
    output_path = repo / "orb-collection/prototypes/results/2026-04-22-rule1-validation.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)

    session = json.loads(input_path.read_text(encoding="utf-8"))
    result = evaluate_rule1(session)
    compliance = evaluate_compliance(session)

    output = {
        "session_id": session["session_id"],
        "rule": "Rule 1 — Two-Step Reversal Trigger",
        "triggered": result.triggered,
        "tradable": result.triggered and compliance.compliant,
        "direction": result.direction,
        "entry_signal": result.entry_signal,
        "invalidation": result.invalidation,
        "trigger_event_time": result.trigger_event_time,
        "evidence": result.evidence,
        "compliance": {
            "compliant": compliance.compliant,
            "blocked_reasons": compliance.blocked_reasons,
            "warnings": compliance.warnings,
            "rr_values": compliance.rr_values,
        },
        "source_input": str(input_path),
    }
    output_path.write_text(json.dumps(output, indent=2), encoding="utf-8")
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
