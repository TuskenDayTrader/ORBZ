# Canonical Master Prompt Patch — Shift-to-Stop Bracket-Entry Rule

Section: Execution Rules / Bracket Entry Adjustment

Exact text to apply to canonical master prompt and all derived mentor prompts:

```
Shift-to-Stop Bracket-Entry Rule (CANONICAL):

When an entry zone/edge is identified, do NOT enter at that initial price. Instead, compute your bracket structure (e.g., 75-point TP, 35-point SL), and set your actual entry at the price where the stop would have been. Bracket orders then cover 75 up / 35 down from this new entry.

If price moves 25 points favorably, move the stop to entry+25. Optionally adjust the TP higher as profit potential develops.

Legacy code, prompts, or backtest configs referencing old entry logic must be refactored to match this default.
```

Usage:
- Add this block verbatim into:
  - prompts/master/canonical_master_prompt.md (Execution Rules section)
  - orb/MENTOR_AGENT_PROMPT.md (Execution Rules or Bracket order enforcement)
  - backtests/specs/* (all backtest configs referencing entry logic)

