#!/usr/bin/env python3
from dataclasses import dataclass
from typing import Optional


@dataclass
class Rule1Result:
    triggered: bool
    direction: str
    entry_signal: str
    invalidation: str
    trigger_event_time: Optional[str]
    evidence: list[str]


@dataclass
class ComplianceResult:
    compliant: bool
    blocked_reasons: list[str]
    warnings: list[str]
    rr_values: list[float]


def is_true(value: object) -> bool:
    return value is True


def _risk_per_unit(intent: dict) -> float:
    if intent["direction"] == "long":
        return intent["entry_price"] - intent["stop_loss"]
    return intent["stop_loss"] - intent["entry_price"]


def _rr_for_tp(intent: dict, tp: float, risk_per_unit: float) -> float:
    if intent["direction"] == "long":
        reward = tp - intent["entry_price"]
    else:
        reward = intent["entry_price"] - tp
    return reward / risk_per_unit


def evaluate_compliance(session: dict) -> ComplianceResult:
    intent = session["trade_intent"]
    external = session["external_program_rules"]

    blocked: list[str] = []
    warnings: list[str] = []
    rr_values: list[float] = []

    if not intent["order_is_bracket"]:
        blocked.append("Bracket order required (entry+stop+target).")

    if intent["entry_zone_type"] == "midrange":
        blocked.append("Midrange entries are prohibited.")
    elif intent["entry_zone_type"] not in {"support_edge", "resistance_edge", "session_edge"}:
        blocked.append("Entry zone must be a recognized structure edge.")

    if intent["discretionary_override"]:
        blocked.append("Discretionary override is prohibited.")

    if not intent["tape_confirmed"]:
        blocked.append("Tape/context confirmation is required.")

    risk_per_unit = _risk_per_unit(intent)
    if risk_per_unit <= 0:
        blocked.append("Stop placement is invalid for trade direction.")
    else:
        for tp in intent["take_profits"]:
            rr = _rr_for_tp(intent, tp, risk_per_unit)
            rr_values.append(round(rr, 4))
            if rr <= 1.0:
                blocked.append(f"TP {tp} violates RR>1.0 minimum.")
        if not any(rr >= 1.5 for rr in rr_values):
            blocked.append("No take-profit meets 1.5R requirement.")
        if not any(rr >= 2.0 for rr in rr_values):
            blocked.append("No take-profit meets 2.0R requirement.")

    max_risk = intent["account_size"] * 0.0025
    if intent["risk_dollars"] > max_risk:
        blocked.append("Per-trade risk exceeds 0.25% of account.")

    scaling_allowed = intent.get("scaling_allowed_by_program", False)
    max_contracts = intent.get("max_contracts_allowed", 1 if not scaling_allowed else 2)
    if not scaling_allowed and intent["contracts"] > 1:
        blocked.append("One contract default violated without scaling permission.")
    if intent["contracts"] > max_contracts:
        blocked.append("Contracts exceed max contracts allowed.")

    if intent["move_stop_to_breakeven_after_points"] != 35:
        warnings.append("Stop-to-breakeven threshold differs from 35-point protocol.")

    external_verified = all(
        [
            external["daily_max_loss_verified"],
            external["drawdown_verified"],
            external["contract_limits_verified"],
            external["source_text_provided"],
        ]
    )
    if not external_verified:
        blocked.append("External funded-program limits are UNCONFIRMED; trading blocked.")

    return ComplianceResult(
        compliant=len(blocked) == 0,
        blocked_reasons=blocked,
        warnings=warnings,
        rr_values=rr_values,
    )


def evaluate_rule1(session: dict) -> Rule1Result:
    flags = session["derived_flags"]
    events = session["events"]

    bearish_trigger = (
        is_true(flags["ibh_rejected_with_wick"])
        and is_true(flags["vwap_orbl_lost_after_ibh_rejection"])
    )
    bullish_trigger = (
        is_true(flags["ibl_rejected_with_wick"])
        and is_true(flags["vwap_reclaimed_after_ibl_rejection"])
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
