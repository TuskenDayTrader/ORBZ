#!/usr/bin/env python3
from typing import Any


REQUIRED_BATCH_KEYS = {"batch_id", "fetched_at", "sources_seen", "insights"}
REQUIRED_INSIGHT_KEYS = {
    "insight_id",
    "title",
    "signal_type",
    "direction_bias",
    "orb_relevance",
    "recency_minutes",
    "rule_alignment",
    "trade_candidate",
    "provenance",
}
REQUIRED_PROVENANCE_KEYS = {
    "source_id",
    "source_name",
    "source_url",
    "fetched_at",
    "author_type",
    "source_type",
    "source_tier",
    "confidence",
    "verification_status",
    "verification_reason",
    "evidence_text",
}


def _require_keys(payload: dict[str, Any], required: set[str], context: str) -> list[str]:
    missing = sorted(required - set(payload.keys()))
    return [f"{context} missing required key '{item}'" for item in missing]


def validate_internet_batch(batch: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    errors.extend(_require_keys(batch, REQUIRED_BATCH_KEYS, "batch"))

    insights = batch.get("insights", [])
    if not isinstance(insights, list):
        errors.append("batch.insights must be a list")
        return errors

    for idx, insight in enumerate(insights):
        if not isinstance(insight, dict):
            errors.append(f"insight[{idx}] must be an object")
            continue
        errors.extend(_require_keys(insight, REQUIRED_INSIGHT_KEYS, f"insight[{idx}]"))

        relevance = insight.get("orb_relevance", 0)
        if not isinstance(relevance, (int, float)) or not (0 <= relevance <= 1):
            errors.append(f"insight[{idx}].orb_relevance must be number between 0 and 1")

        recency = insight.get("recency_minutes", 0)
        if not isinstance(recency, int) or recency < 0:
            errors.append(f"insight[{idx}].recency_minutes must be a non-negative integer")

        provenance = insight.get("provenance")
        if not isinstance(provenance, dict):
            errors.append(f"insight[{idx}].provenance must be an object")
            continue

        errors.extend(_require_keys(provenance, REQUIRED_PROVENANCE_KEYS, f"insight[{idx}].provenance"))

        confidence = provenance.get("confidence", -1)
        if not isinstance(confidence, (int, float)) or not (0 <= confidence <= 1):
            errors.append(f"insight[{idx}].provenance.confidence must be number between 0 and 1")

        verification_status = provenance.get("verification_status")
        if verification_status not in {"verified", "rejected"}:
            errors.append(f"insight[{idx}].provenance.verification_status must be verified|rejected")

    return errors
