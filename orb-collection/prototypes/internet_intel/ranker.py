#!/usr/bin/env python3
import argparse
import json
from datetime import UTC, datetime
from pathlib import Path

from rule_engine import evaluate_compliance

TIER_WEIGHTS = {
    "official": 1.0,
    "macro_api": 0.9,
    "trusted_news": 0.75,
    "vetted_research": 0.85,
}


def _recency_score(minutes: int) -> float:
    if minutes <= 30:
        return 1.0
    if minutes <= 120:
        return 0.75
    if minutes <= 360:
        return 0.5
    return 0.25


def _build_session_from_trade_candidate(candidate: dict) -> dict:
    return {
        "session_id": "internet-intel-validation",
        "events": [],
        "derived_flags": {
            "ibh_rejected_with_wick": True,
            "vwap_orbl_lost_after_ibh_rejection": True,
            "ibl_rejected_with_wick": True,
            "vwap_reclaimed_after_ibl_rejection": True,
            "vwap_orbl_converged_within_5": True,
            "open_near_on_low": False,
            "prior_day_strong_up": False,
        },
        "trade_intent": candidate["trade_intent"],
        "external_program_rules": candidate["external_program_rules"],
    }


def _validate_actionability(insight: dict) -> tuple[str, list[str]]:
    candidate = insight.get("trade_candidate")
    if candidate is None:
        return "informational", ["No trade candidate attached; insight remains informational."]

    compliance = evaluate_compliance(_build_session_from_trade_candidate(candidate))
    if not compliance.compliant:
        return "blocked", compliance.blocked_reasons
    return "rule_qualified", ["Trade candidate passed ORBZ compliance gates."]


def _score(insight: dict) -> tuple[float, dict]:
    relevance = max(0.0, min(1.0, insight.get("orb_relevance", 0.0)))
    confidence = max(0.0, min(1.0, insight["provenance"].get("confidence", 0.0)))
    tier_weight = TIER_WEIGHTS.get(insight["provenance"].get("source_tier", "trusted_news"), 0.6)
    recency = _recency_score(int(insight.get("recency_minutes", 360)))
    rule_alignment = insight.get("rule_alignment", {})
    alignment = 1.0 if all(bool(v) for v in rule_alignment.values()) else 0.4

    weighted = (relevance * 35) + (confidence * tier_weight * 30) + (recency * 20) + (alignment * 15)
    breakdown = {
        "relevance_component": round(relevance * 35, 2),
        "reliability_component": round(confidence * tier_weight * 30, 2),
        "recency_component": round(recency * 20, 2),
        "rule_alignment_component": round(alignment * 15, 2),
    }
    return round(weighted, 2), breakdown


def rank_internet_batch(batch: dict) -> dict:
    ranked: list[dict] = []
    blocked: list[dict] = []
    informational: list[dict] = []

    for insight in batch.get("insights", []):
        status, reasons = _validate_actionability(insight)
        score, score_breakdown = _score(insight)
        payload = {
            "insight_id": insight["insight_id"],
            "title": insight["title"],
            "source_name": insight["provenance"]["source_name"],
            "source_url": insight["provenance"]["source_url"],
            "verification_status": insight["provenance"]["verification_status"],
            "confidence": insight["provenance"]["confidence"],
            "score": score,
            "score_breakdown": score_breakdown,
            "status": status,
            "reasons": reasons,
            "evidence_text": insight["provenance"]["evidence_text"],
            "fetched_at": insight["provenance"]["fetched_at"],
        }
        if status == "rule_qualified":
            ranked.append(payload)
        elif status == "blocked":
            blocked.append(payload)
        else:
            informational.append(payload)

    ranked.sort(key=lambda item: item["score"], reverse=True)
    for idx, item in enumerate(ranked, start=1):
        item["rank"] = idx

    return {
        "batch_id": batch.get("batch_id", "internet-intel"),
        "generated_at": datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "rule_qualified": ranked,
        "blocked": blocked,
        "informational": informational,
    }


def main() -> None:
    repo = Path(__file__).resolve().parents[3]
    parser = argparse.ArgumentParser(description="Rank normalized internet intelligence records for ORBZ.")
    parser.add_argument(
        "--input",
        default=str(repo / "data/internet-intel/normalized/internet-intelligence-batch-v1.json"),
    )
    parser.add_argument(
        "--output",
        default=str(repo / "data/internet-intel/normalized/internet-intelligence-ranked-v1.json"),
    )
    args = parser.parse_args()

    batch = json.loads(Path(args.input).read_text(encoding="utf-8"))
    ranked = rank_internet_batch(batch)
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(ranked, indent=2), encoding="utf-8")
    print(json.dumps({"status": "ok", "output": str(output)}, indent=2))


if __name__ == "__main__":
    main()
