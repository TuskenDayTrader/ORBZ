#!/usr/bin/env python3
import argparse
import json
from datetime import UTC, datetime
from pathlib import Path

from adapters import fetch_url, parse_json_payload, parse_rss_items, parse_web_page_snippets
from source_policy import DEFAULT_SOURCE_CATALOG, source_is_allowed


def _snapshot_path(data_root: Path, timestamp: str) -> Path:
    base = data_root / "data/internet-intel/raw" / timestamp
    base.mkdir(parents=True, exist_ok=True)
    path = base / "internet-snapshot-v1.json"
    if not path.exists():
        return path
    counter = 1
    while True:
        candidate = base / f"internet-snapshot-v1-{counter}.json"
        if not candidate.exists():
            return candidate
        counter += 1


def _ingest_source(source, cache_dir: Path, robots_allowlist: set[str], last_request_at: dict[str, float]) -> dict:
    body = fetch_url(
        url=source.endpoint,
        user_agent="ORBZ-InternetIntelligence/1.0",
        robots_allowlist=robots_allowlist,
        cache_dir=cache_dir,
        min_interval_seconds=1.0,
        last_request_at=last_request_at,
    )
    if source.source_type == "rss":
        records = parse_rss_items(body)
    elif source.source_type == "json_api":
        records = parse_json_payload(body)
    else:
        records = parse_web_page_snippets(body)

    return {
        "source_id": source.source_id,
        "source_name": source.source_name,
        "source_type": source.source_type,
        "source_tier": source.tier,
        "author_type": source.author_type,
        "endpoint": source.endpoint,
        "verification_status": "verified",
        "records": records,
    }


def main() -> None:
    repo = Path(__file__).resolve().parents[3]
    parser = argparse.ArgumentParser(description="Ingest internet intelligence sources into immutable ORBZ snapshots.")
    parser.add_argument("--timestamp", help="UTC timestamp folder name. Defaults to current minute.")
    parser.add_argument("--fixture", help="Optional local fixture JSON to bypass network ingestion.")
    args = parser.parse_args()

    if args.fixture:
        fixture = Path(args.fixture)
        payload = json.loads(fixture.read_text(encoding="utf-8"))
        timestamp = args.timestamp or payload.get("fetched_at", datetime.now(UTC).strftime("%Y-%m-%dT%H%M%SZ"))
    else:
        timestamp = args.timestamp or datetime.now(UTC).strftime("%Y-%m-%dT%H%M%SZ")
        cache_dir = repo / "data/internet-intel/cache"
        robots_allowlist = {source.domain for source in DEFAULT_SOURCE_CATALOG}
        last_request_at: dict[str, float] = {}

        sources: list[dict] = []
        for source in DEFAULT_SOURCE_CATALOG:
            allowed, reason = source_is_allowed(source)
            if not allowed:
                sources.append(
                    {
                        "source_id": source.source_id,
                        "source_name": source.source_name,
                        "verification_status": "rejected",
                        "verification_reason": reason,
                        "records": [],
                    }
                )
                continue
            sources.append(_ingest_source(source, cache_dir, robots_allowlist, last_request_at))

        payload = {
            "snapshot_id": f"internet-snapshot-{timestamp}",
            "fetched_at": timestamp,
            "sources": sources,
        }

    output = _snapshot_path(repo, timestamp)
    output.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(json.dumps({"status": "ok", "snapshot": str(output)}, indent=2))


if __name__ == "__main__":
    main()
