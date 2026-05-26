#!/usr/bin/env python3
import hashlib
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any

CACHE_TTL_SECONDS = 10 * 60
MAX_RETRIES = 3
BACKOFF_SECONDS = (0.5, 1.0, 2.0)


def _domain_from_url(url: str) -> str:
    return urllib.parse.urlparse(url).netloc.lower()


def _cache_key(url: str) -> str:
    return hashlib.sha256(url.encode("utf-8")).hexdigest()


def _cache_path(cache_dir: Path, url: str) -> Path:
    return cache_dir / f"{_cache_key(url)}.json"


def _read_cache(cache_dir: Path, url: str) -> str | None:
    path = _cache_path(cache_dir, url)
    if not path.exists():
        return None
    payload = json.loads(path.read_text(encoding="utf-8"))
    age = time.time() - payload["cached_at"]
    if age > CACHE_TTL_SECONDS:
        return None
    return payload["body"]


def _write_cache(cache_dir: Path, url: str, body: str) -> None:
    cache_dir.mkdir(parents=True, exist_ok=True)
    payload = {"cached_at": time.time(), "url": url, "body": body}
    _cache_path(cache_dir, url).write_text(json.dumps(payload), encoding="utf-8")


def _allowed_by_robots(url: str, robots_allowlist: set[str]) -> bool:
    domain = _domain_from_url(url)
    return domain in robots_allowlist


def fetch_url(
    *,
    url: str,
    user_agent: str,
    robots_allowlist: set[str],
    cache_dir: Path,
    min_interval_seconds: float,
    last_request_at: dict[str, float],
) -> str:
    if not _allowed_by_robots(url, robots_allowlist):
        raise RuntimeError(f"robots/ToS policy blocked domain: {_domain_from_url(url)}")

    cached = _read_cache(cache_dir, url)
    if cached is not None:
        return cached

    domain = _domain_from_url(url)
    previous = last_request_at.get(domain, 0.0)
    elapsed = time.time() - previous
    if elapsed < min_interval_seconds:
        time.sleep(min_interval_seconds - elapsed)

    req = urllib.request.Request(url, headers={"User-Agent": user_agent})
    for attempt in range(MAX_RETRIES):
        try:
            with urllib.request.urlopen(req, timeout=20) as response:
                body = response.read().decode("utf-8", errors="replace")
                last_request_at[domain] = time.time()
                _write_cache(cache_dir, url, body)
                return body
        except urllib.error.URLError:
            if attempt == MAX_RETRIES - 1:
                raise
            time.sleep(BACKOFF_SECONDS[min(attempt, len(BACKOFF_SECONDS) - 1)])
    raise RuntimeError("unreachable")


def parse_rss_items(rss_text: str, limit: int = 5) -> list[dict[str, Any]]:
    root = ET.fromstring(rss_text)
    items = []
    for node in root.findall(".//item")[:limit]:
        items.append(
            {
                "title": (node.findtext("title") or "").strip(),
                "link": (node.findtext("link") or "").strip(),
                "published_at": (node.findtext("pubDate") or "").strip(),
                "summary": re.sub(r"\s+", " ", (node.findtext("description") or "").strip()),
            }
        )
    return items


def parse_json_payload(payload_text: str, path: str | None = None, limit: int = 5) -> list[dict[str, Any]]:
    payload = json.loads(payload_text)
    if path:
        for segment in path.split("."):
            if segment:
                payload = payload[segment]
    if isinstance(payload, dict):
        payload = [payload]
    if not isinstance(payload, list):
        return []
    normalized: list[dict[str, Any]] = []
    for item in payload[:limit]:
        if isinstance(item, dict):
            normalized.append(item)
        else:
            normalized.append({"value": item})
    return normalized


def parse_web_page_snippets(html_text: str, limit: int = 5) -> list[dict[str, Any]]:
    no_script = re.sub(r"<script\\b[^>]*>.*?</script\\s*>", " ", html_text, flags=re.IGNORECASE | re.DOTALL)
    no_style = re.sub(r"<style\\b[^>]*>.*?</style\\s*>", " ", no_script, flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r"<[^>]+>", " ", no_style)
    lines = [line.strip() for line in re.split(r"[\r\n]+", text)]
    snippets = [line for line in lines if len(line) > 40]
    return [{"snippet": snippet} for snippet in snippets[:limit]]
