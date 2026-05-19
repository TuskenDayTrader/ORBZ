# Prompt Patch Log

This file collects canonical prompt patches and propagation notes applied to the master prompt and related mentor/system prompts.

## 2026-05-19 — Shift-to-Stop Bracket-Entry Rule (Canonical)

Applied system-wide: all references to position entry, bracket logic, ORB trigger, risk, and backtest scenarios must implement the Shift-to-Stop rule. Text added to mentor prompts, canonical patches, and backtest specs.

Exact canonical rule (copy/paste):

> When an entry zone/edge is identified, do NOT enter at that initial price. Instead, compute your bracket structure (e.g., 75-point TP, 35-point SL), and set your actual entry at the price where the stop would have been. Bracket orders then cover 75 up / 35 down from this new entry.
>
> If price moves 25 points favorably, move the stop to entry+25. Optionally adjust the TP higher as profit potential develops.
>
> Legacy code, prompts, or backtest configs referencing old entry logic must be refactored to match this default.

Notes:
- This patch is canonical and system-wide. Any module that references entry logic must be updated to use Shift-to-Stop before being used for backtesting or live/sim execution.
- Examples in backtest specs should reflect the Shift-to-Stop entry offset and stop movement rule.
