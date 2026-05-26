#!/usr/bin/env python3
from dataclasses import dataclass
from typing import Literal

SourceTier = Literal["official", "macro_api", "trusted_news", "vetted_research"]
SourceType = Literal["rss", "json_api", "web_page"]


@dataclass(frozen=True)
class SourceDefinition:
    source_id: str
    source_name: str
    source_type: SourceType
    tier: SourceTier
    author_type: str
    endpoint: str
    domain: str
    verified: bool = True


DEFAULT_SOURCE_CATALOG: tuple[SourceDefinition, ...] = (
    SourceDefinition(
        source_id="fomc_press_releases",
        source_name="Federal Reserve Press Releases",
        source_type="rss",
        tier="official",
        author_type="central_bank",
        endpoint="https://www.federalreserve.gov/feeds/press_monetary.xml",
        domain="federalreserve.gov",
        verified=True,
    ),
    SourceDefinition(
        source_id="cme_economic_calendar",
        source_name="CME Economic Releases",
        source_type="web_page",
        tier="macro_api",
        author_type="exchange",
        endpoint="https://www.cmegroup.com/markets/equities.html",
        domain="cmegroup.com",
        verified=True,
    ),
    SourceDefinition(
        source_id="stlouisfed_research",
        source_name="St. Louis Fed Research",
        source_type="rss",
        tier="vetted_research",
        author_type="research_desk",
        endpoint="https://www.stlouisfed.org/on-the-economy/rss",
        domain="stlouisfed.org",
        verified=True,
    ),
)


ALLOWED_TIERS: set[SourceTier] = {"official", "macro_api", "trusted_news", "vetted_research"}


TRUST_WEIGHTS: dict[SourceTier, float] = {
    "official": 1.0,
    "macro_api": 0.9,
    "trusted_news": 0.75,
    "vetted_research": 0.85,
}


def source_is_allowed(source: SourceDefinition) -> tuple[bool, str]:
    if source.tier not in ALLOWED_TIERS:
        return False, f"source tier '{source.tier}' is not approved"
    if not source.verified:
        return False, "source is unverified and rejected by default"
    return True, "source verified"


def build_provenance(
    *,
    source: SourceDefinition,
    source_url: str,
    fetched_at: str,
    evidence_text: str,
    confidence: float,
) -> dict:
    is_allowed, reason = source_is_allowed(source)
    verification_status = "verified" if is_allowed else "rejected"
    return {
        "source_id": source.source_id,
        "source_name": source.source_name,
        "source_url": source_url,
        "fetched_at": fetched_at,
        "author_type": source.author_type,
        "source_type": source.source_type,
        "source_tier": source.tier,
        "confidence": round(max(0.0, min(1.0, confidence)), 4),
        "verification_status": verification_status,
        "verification_reason": reason,
        "evidence_text": evidence_text.strip()[:500],
    }
