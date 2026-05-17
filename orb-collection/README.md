# ORB Collection

Canonical collection of all Opening Range Breakout content.

## Structure

| Folder | Purpose |
|---|---|
| `sessions/` | One subfolder per trading day. Holds pre-market extractions, SVG visuals, post-market extractions, and merged canonical records. |
| `templates/` | Reusable ShurmeAi prompt templates for pre-market, post-market, and merger extractions. |
| `rules/` | The cumulative Rules Registry. Numbered, dated, and never deleted (only superseded). |
| `reference/` | Definitions, glossary, and conceptual reference material. |
| `learning/` | Accessibility-first ORB course materials, playbooks, checklist, and journal templates. |
| `meta/` | Prompts and tooling for cross-session continuity and mining. |

## Session Folder Convention

Each `sessions/YYYY-MM-DD/` folder may contain:

- `pre-market-extraction.md` — plan built before RTH open
- `pre-market-visual.svg` — diagram of the pre-market structure
- `post-market-extraction.md` — what actually happened
- `session-merger.md` — canonical merged record (plan vs actual)
- `carry-forward-block.md` — handoff block to the next session

Fields use the standardized ShurmeAi schema (see `templates/`).

## Current Inventory

| Date | Pre-Mkt | Visual | Post-Mkt | Merger | Carry-Fwd | Status |
|------|---------|--------|----------|--------|-----------|--------|
| 2026-04-20 | — | — | — | — | ✅ | source data only (no full extraction) |
| 2026-04-21 | ✅ | ✅ | 🔧 missing | 🔧 partial | — | pre-market complete; awaiting post-market |

## Conventions

- **Missing data** is always written as `missing` — never invented.
- **Uncertain data** is always marked `uncertain` — never promoted to certain.
- **Plan vs actual conflicts** are preserved as both, never collapsed.
- **Levels** are preferred as zones / bands over single lines.
- **Star ratings** (★) denote level lifecycle strength per the carry-forward convention.

## ORB Learning Course

Start here: [ORB Course Home (Accessibility-First)](./learning/README.md)
