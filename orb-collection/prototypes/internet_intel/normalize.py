#!/usr/bin/env python3
import argparse
import json
from datetime import UTC, datetime
from pathlib import Path

from source_policy import DEFAULT_SOURCE_CATALOG, TRUST_WEIGHTS, build_provenance


def _confidence_for_record(source_tier: str, evidence_text: str) -> float:
    base = TRUST_WEIGHTS.get(source_tier, 0.5)
    evidence_bonus = 0.1 if len(evidence_text) >= 80 else 0.0
    return min(0.99, base + evidence_bonus)


def normalize_snapshot(snapshot: dict) -> dict:
    catalog = {source.source_id: source for source in DEFAULT_SOURCE_CATALOG}
    analyses = []

    for source_payload in snapshot.get("sources", []):
        source_id = source_payload["source_id"]
        source = catalog.get(source_id)
        if source is None:
            continue

        for idx, record in enumerate(source_payload.get("records", []), start=1):
            title = record.get("title") or record.get("snippet") or record.get("headline") or "untitled"
            summary = record.get("summary") or record.get("snippet") or json.dumps(record, ensure_ascii=False)
            source_url = record.get("link") or source_payload.get("endpoint") or source.endpoint
            published = record.get("published_at") or snapshot.get("fetched_at")

            confidence = _confidence_for_record(source.tier, summary)
            provenance = build_provenance(
                source=source,
                source_url=source_url,
                fetched_at=snapshot.get("fetched_at", datetime.now(UTC).isoformat()),
                evidence_text=summary,
                confidence=confidence,
            )

            analyses.append(
                {
                    "insight_id": f"{source_id}-{idx}",
                    "title": title,
                    "signal_type": "macro_context",
                    "direction_bias": "neutral",
                    "orb_relevance": 0.6,
                    "recency_minutes": 30,
                    "rule_alignment": {
                        "deterministic": True,
                        "zone_edge_only": True,
                        "tape_confirmed": True,
                    },
                    "trade_candidate": None,
                    "provenance": provenance,
                }
            )

    return {
        "$schema": "./internet-intelligence-batch-v1.schema.json",
        "batch_id": f"internet-intel-{snapshot.get('fetched_at', 'unknown')}",
        "fetched_at": snapshot.get("fetched_at", datetime.now(UTC).isoformat()),
        "sources_seen": sorted({item["provenance"]["source_id"] for item in analyses}),
        "insights": analyses,
    }


def main() -> None:
    repo = Path(__file__).resolve().parents[3]
    parser = argparse.ArgumentParser(description="Normalize internet snapshots into ORBZ intelligence schema.")
    parser.add_argument(
        "--input",
        default=str(repo / "data/internet-intel/raw/2026-05-26T000000Z/internet-snapshot-v1.json"),
        help="Raw internet snapshot JSON path.",
    )
    parser.add_argument(
        "--output",
        default=str(repo / "data/internet-intel/normalized/internet-intelligence-batch-v1.json"),
        help="Normalized intelligence output path.",
    )
    args = parser.parse_args()

    snapshot = json.loads(Path(args.input).read_text(encoding="utf-8"))
    normalized = normalize_snapshot(snapshot)
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(normalized, indent=2), encoding="utf-8")
    print(json.dumps({"status": "ok", "output": str(output)}, indent=2))


if __name__ == "__main__":
    main()
