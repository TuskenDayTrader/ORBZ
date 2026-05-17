#!/usr/bin/env python3
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Optional


@dataclass
class Rule1Result:
    triggered: bool
    direction: str
    entry_signal: str
    invalidation: str
    trigger_event_time: Optional[str]
    evidence: list[str]


def evaluate_rule1(session: dict) -> Rule1Result:
    flags = session["derived_flags"]
    events = session["events"]

    bearish_trigger = (
        flags["ibh_rejected_with_wick"]
        and flags["vwap_orbl_lost_after_ibh_rejection"]
    )
    bullish_trigger = (
        flags["ibl_rejected_with_wick"]
        and flags["vwap_reclaimed_after_ibl_rejection"]
    )

    if bearish_trigger:
        trigger_time = next(
            (
                e["timestamp_est"]
                for e in events
                if e["event_type"] == "vwap_orbl_loss"
            ),
            None,
        )
        return Rule1Result(
            triggered=True,
            direction="bearish",
            entry_signal="short_on_vwap_orbl_loss_or_retest_failure",
            invalidation="reclaim_and_hold_above_vwap_orbl",
            trigger_event_time=trigger_time,
            evidence=[
                "ibh_rejected_with_wick=true",
                "vwap_orbl_lost_after_ibh_rejection=true",
            ],
        )

    if bullish_trigger:
        trigger_time = next(
            (
                e["timestamp_est"]
                for e in events
                if e["event_type"] == "vwap_reclaim"
            ),
            None,
        )
        return Rule1Result(
            triggered=True,
            direction="bullish",
            entry_signal="long_on_vwap_reclaim_or_retest_hold",
            invalidation="lose_vwap_after_reclaim",
            trigger_event_time=trigger_time,
            evidence=[
                "ibl_rejected_with_wick=true",
                "vwap_reclaimed_after_ibl_rejection=true",
            ],
        )

    return Rule1Result(
        triggered=False,
        direction="neutral",
        entry_signal="none",
        invalidation="none",
        trigger_event_time=None,
        evidence=["no_complete_rule1_sequence"],
    )


def main() -> None:
    repo = Path(__file__).resolve().parents[2]
    input_path = repo / "sessions/2026-04-22-YM/normalized-session-v1.json"
    output_path = repo / "orb-collection/prototypes/results/2026-04-22-rule1-validation.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)

    session = json.loads(input_path.read_text(encoding="utf-8"))
    result = evaluate_rule1(session)

    output = {
        "session_id": session["session_id"],
        "rule": "Rule 1 — Two-Step Reversal Trigger",
        "triggered": result.triggered,
        "direction": result.direction,
        "entry_signal": result.entry_signal,
        "invalidation": result.invalidation,
        "trigger_event_time": result.trigger_event_time,
        "evidence": result.evidence,
        "source_input": str(input_path),
    }
    output_path.write_text(json.dumps(output, indent=2), encoding="utf-8")
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
