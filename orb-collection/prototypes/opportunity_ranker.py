#!/usr/bin/env python3
import argparse
import json
from pathlib import Path

from rule_engine import evaluate_compliance, evaluate_rule1, is_true


SELECTION_PROMPT = (
    "Which of the 8 tickers do you want analyzed for the strongest ORBZ long "
    "and short opportunities?"
)


def _build_selection_response(batch: dict, status: str, reason: str) -> dict:
    return {
        "status": status,
        "reason": reason,
        "selection_prompt": {
            "message": SELECTION_PROMPT,
            "choices": batch["detected_tickers"],
            "allow_analyze_all": True,
            "selection_required": True,
        },
    }


def _active_tickers(batch: dict) -> tuple[str, list[str]] | tuple[None, None]:
    selection_mode = batch["selection_mode"]
    detected = batch["detected_tickers"]
    selected = batch.get("selected_tickers", [])

    if selection_mode == "pending_user_selection" or not selected and selection_mode != "analyze_all":
        return None, None

    if selection_mode == "analyze_all":
        return selection_mode, detected

    unknown = sorted(set(selected) - set(detected))
    if unknown:
        return "invalid_selection", unknown

    return selection_mode, selected


def _build_session(ticker_analysis: dict, candidate: dict) -> dict:
    return {
        "session_id": f"{ticker_analysis['ticker']}-{candidate['direction']}",
        "events": ticker_analysis["events"],
        "derived_flags": ticker_analysis["derived_flags"],
        "trade_intent": {
            "direction": candidate["direction"],
            "entry_price": candidate["entry_price"],
            "stop_loss": candidate["stop_loss"],
            "take_profits": candidate["take_profits"],
            "order_is_bracket": candidate["order_is_bracket"],
            "entry_zone_type": candidate["entry_zone_type"],
            "discretionary_override": candidate["discretionary_override"],
            "tape_confirmed": candidate["tape_confirmed"],
            "account_size": candidate["account_size"],
            "risk_dollars": candidate["risk_dollars"],
            "contracts": candidate["contracts"],
            "move_stop_to_breakeven_after_points": candidate["move_stop_to_breakeven_after_points"],
            "scaling_allowed_by_program": candidate.get("scaling_allowed_by_program", False),
            "max_contracts_allowed": candidate.get("max_contracts_allowed", 1),
        },
        "external_program_rules": ticker_analysis["external_program_rules"],
    }


def _directional_alignment(direction: str, rule1_result: dict, flags: dict) -> tuple[bool, list[str]]:
    reasons: list[str] = []

    if direction == "long":
        structural_alignment = (
            is_true(flags["ibl_rejected_with_wick"])
            and is_true(flags["vwap_reclaimed_after_ibl_rejection"])
        )
        if rule1_result.triggered and rule1_result.direction == "bullish":
            reasons.append("Rule 1 bullish branch triggered.")
        if structural_alignment:
            reasons.append("IBL rejection plus VWAP reclaim supports long continuation.")
        return (
            (rule1_result.triggered and rule1_result.direction == "bullish")
            or structural_alignment,
            reasons,
        )

    structural_alignment = (
        is_true(flags["ibh_rejected_with_wick"])
        and is_true(flags["vwap_orbl_lost_after_ibh_rejection"])
    )
    if rule1_result.triggered and rule1_result.direction == "bearish":
        reasons.append("Rule 1 bearish branch triggered.")
    if structural_alignment:
        reasons.append("IBH rejection plus VWAP/ORBL loss supports short continuation.")
    return (
        (rule1_result.triggered and rule1_result.direction == "bearish")
        or structural_alignment,
        reasons,
    )


def _evaluate_candidate(ticker_analysis: dict, candidate: dict) -> dict:
    session = _build_session(ticker_analysis, candidate)
    compliance = evaluate_compliance(session)
    rule1 = evaluate_rule1(session)
    aligned, alignment_reasons = _directional_alignment(
        candidate["direction"], rule1, ticker_analysis["derived_flags"]
    )

    reasons: list[str] = []
    evidence = candidate.get("evidence", [])
    missing = candidate.get("missing_or_uncertain_evidence", [])
    why_qualified = candidate.get("why_qualified", [])

    if ticker_analysis["extraction_status"] != "complete":
        reasons.append("Ticker extraction is not complete.")
    if candidate["confidence"] < 0.5:
        reasons.append("Confidence is below the 0.50 minimum.")
    if len(evidence) < 2:
        reasons.append("Candidate requires at least two evidence points.")
    if not aligned:
        reasons.append("Candidate does not align with the deterministic long/short trigger rules.")
    if not compliance.compliant:
        reasons.extend(compliance.blocked_reasons)

    if reasons:
        return {
            "status": "no_qualified_opportunity",
            "ticker": ticker_analysis["ticker"],
            "direction": candidate["direction"],
            "setup_name": candidate["setup_name"],
            "reasons": reasons,
            "missing_or_uncertain_evidence": missing,
        }

    score = round(
        candidate["confidence"] * 60
        + min(len(evidence), 5) * 5
        + min(len(why_qualified), 3) * 4
        + (10 if candidate["tape_confirmed"] else 0)
        + (10 if rule1.triggered else 0)
        - min(len(missing), 3) * 5,
        2,
    )

    qualifies_because = alignment_reasons + why_qualified + [
        "Compliance gates passed.",
    ]

    return {
        "status": "qualified",
        "ticker": ticker_analysis["ticker"],
        "direction": candidate["direction"],
        "setup_name": candidate["setup_name"],
        "entry_signal": candidate["entry_signal"],
        "score": score,
        "score_breakdown": {
            "confidence_component": round(candidate["confidence"] * 60, 2),
            "evidence_component": min(len(evidence), 5) * 5,
            "qualification_component": min(len(why_qualified), 3) * 4,
            "tape_component": 10 if candidate["tape_confirmed"] else 0,
            "rule1_component": 10 if rule1.triggered else 0,
            "missing_penalty": min(len(missing), 3) * 5,
        },
        "exact_levels_or_zones_used": candidate["levels_used"],
        "why_it_qualifies_under_orbz_rules": qualifies_because,
        "what_would_invalidate_it": candidate["invalidation"],
        "confidence": candidate["confidence"],
        "missing_or_uncertain_evidence": missing,
        "evidence": evidence + rule1.evidence,
        "rr_values": compliance.rr_values,
        "warnings": compliance.warnings,
    }


def _rank_candidates(qualified: list[dict], ranking_mode: str) -> list[dict]:
    ranked = sorted(qualified, key=lambda item: item["score"], reverse=True)

    if ranking_mode == "top_2_longs_and_top_2_shorts":
        longs = [item for item in ranked if item["direction"] == "long"][:2]
        shorts = [item for item in ranked if item["direction"] == "short"][:2]
        ranked = longs + shorts
    else:
        ranked = ranked[:2]

    for index, item in enumerate(ranked, start=1):
        item["rank"] = index
    return ranked


def rank_batch(batch: dict) -> dict:
    selection_mode, active_tickers = _active_tickers(batch)
    if selection_mode is None:
        return _build_selection_response(
            batch,
            status="awaiting_user_selection",
            reason="Ticker selection is required before ranking opportunities.",
        )

    if selection_mode == "invalid_selection":
        return _build_selection_response(
            batch,
            status="awaiting_valid_selection",
            reason=f"Unknown tickers selected: {', '.join(active_tickers)}.",
        )

    per_ticker: dict[str, dict] = {}
    qualified: list[dict] = []

    for ticker_analysis in batch["ticker_analyses"]:
        ticker = ticker_analysis["ticker"]
        if ticker not in active_tickers:
            continue

        directional_results: dict[str, dict] = {}
        for direction in ("long", "short"):
            candidate = next(
                (
                    item
                    for item in ticker_analysis["candidates"]
                    if item["direction"] == direction
                ),
                None,
            )
            if candidate is None:
                directional_results[direction] = {
                    "status": "no_qualified_opportunity",
                    "reasons": ["No candidate was extracted for this direction."],
                }
                continue

            result = _evaluate_candidate(ticker_analysis, candidate)
            directional_results[direction] = result
            if result["status"] == "qualified":
                qualified.append(result)

        per_ticker[ticker] = directional_results

    if not qualified:
        return {
            "status": "no_qualified_opportunities",
            "ranking_mode": batch["ranking_mode"],
            "analyzed_tickers": active_tickers,
            "per_ticker": per_ticker,
            "ranked_opportunities": [],
        }

    return {
        "status": "ranked",
        "ranking_mode": batch["ranking_mode"],
        "analyzed_tickers": active_tickers,
        "per_ticker": per_ticker,
        "ranked_opportunities": _rank_candidates(qualified, batch["ranking_mode"]),
    }


def main() -> None:
    repo = Path(__file__).resolve().parents[2]
    parser = argparse.ArgumentParser(description="Rank ORBZ opportunities from structured screenshot extraction.")
    parser.add_argument(
        "--input",
        default=str(repo / "orb-collection/prototypes/examples/screenshot-opportunity-batch-v1.json"),
        help="Path to the structured screenshot batch JSON.",
    )
    parser.add_argument(
        "--output",
        default=str(repo / "orb-collection/prototypes/results/screenshot-opportunity-ranking-v1.json"),
        help="Path to write ranking results.",
    )
    args = parser.parse_args()

    batch = json.loads(Path(args.input).read_text(encoding="utf-8"))
    result = rank_batch(batch)

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
