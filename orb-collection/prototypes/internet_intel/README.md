# Internet Intelligence Prototype Module

Deterministic ingestion and scoring layer for internet-derived ORBZ context.

## What this module covers

- Source policy with tiered whitelist and default rejection of unverified sources.
- Deterministic adapters for RSS, JSON API, and web page extraction.
- Immutable snapshot ingestion under `data/internet-intel/raw/<timestamp>/`.
- Normalization to ORBZ-aligned schema with provenance fields.
- Validation gate using existing ORBZ compliance checks before actionable status.
- Ranking layer for relevance/reliability/recency/rule-alignment.
- Drift monitoring and feedback-based source quality metrics.

## Commands

From repository root:

```bash
python3 orb-collection/prototypes/internet_intel/ingest.py --fixture orb-collection/prototypes/examples/raw-internet-intel-snapshot-v1.json --timestamp 2026-05-26T000000Z
python3 orb-collection/prototypes/internet_intel/normalize.py
python3 orb-collection/prototypes/internet_intel/ranker.py
python3 orb-collection/prototypes/internet_intel/drift_monitor.py
```
