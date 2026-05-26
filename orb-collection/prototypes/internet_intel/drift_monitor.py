#!/usr/bin/env python3
import argparse
import json
from collections import defaultdict
from datetime import UTC, datetime
from pathlib import Path


def _load_jsonl(path: Path) -> list[dict]:
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def record_feedback(
    feedback_path: Path,
    *,
    insight_id: str,
    source_id: str,
    accepted: bool,
    conflict_observed: bool,
    note: str,
) -> dict:
    entry = {
        "recorded_at": datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "insight_id": insight_id,
        "source_id": source_id,
        "accepted": accepted,
        "conflict_observed": conflict_observed,
        "note": note,
    }
    feedback_path.parent.mkdir(parents=True, exist_ok=True)
    with feedback_path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(entry) + "\n")
    return entry


def compute_source_metrics(entries: list[dict]) -> dict:
    totals = defaultdict(int)
    accepted = defaultdict(int)
    conflicts = defaultdict(int)

    for entry in entries:
        source = entry["source_id"]
        totals[source] += 1
        accepted[source] += int(bool(entry["accepted"]))
        conflicts[source] += int(bool(entry["conflict_observed"]))

    metrics = {}
    for source in sorted(totals):
        total = totals[source]
        precision = accepted[source] / total if total else 0.0
        conflict_rate = conflicts[source] / total if total else 0.0
        auto_flagged = total >= 5 and (precision < 0.4 or conflict_rate > 0.5)
        metrics[source] = {
            "samples": total,
            "precision": round(precision, 4),
            "conflict_rate": round(conflict_rate, 4),
            "auto_flagged": auto_flagged,
        }
    return metrics


def main() -> None:
    repo = Path(__file__).resolve().parents[3]
    parser = argparse.ArgumentParser(description="Track internet source drift and quality metrics.")
    parser.add_argument("--insight-id")
    parser.add_argument("--source-id")
    parser.add_argument("--accepted", action="store_true")
    parser.add_argument("--conflict-observed", action="store_true")
    parser.add_argument("--note", default="")
    parser.add_argument(
        "--feedback-path",
        default=str(repo / "data/internet-intel/feedback/feedback-log.jsonl"),
    )
    parser.add_argument(
        "--metrics-output",
        default=str(repo / "data/internet-intel/feedback/source-metrics.json"),
    )
    args = parser.parse_args()

    feedback_path = Path(args.feedback_path)
    if args.insight_id and args.source_id:
        record_feedback(
            feedback_path,
            insight_id=args.insight_id,
            source_id=args.source_id,
            accepted=args.accepted,
            conflict_observed=args.conflict_observed,
            note=args.note,
        )

    entries = _load_jsonl(feedback_path)
    metrics = compute_source_metrics(entries)
    metrics_payload = {
        "generated_at": datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "metrics": metrics,
    }
    output = Path(args.metrics_output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(metrics_payload, indent=2), encoding="utf-8")
    print(json.dumps(metrics_payload, indent=2))


if __name__ == "__main__":
    main()
