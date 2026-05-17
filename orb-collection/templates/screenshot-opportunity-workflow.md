# Screenshot Opportunity Workflow v1

Use this workflow when a user uploads screenshot batches and wants the strongest ORBZ opportunities ranked from them.

## Product contract

- Do not skip ticker selection.
- Do not infer user intent from all uploaded screenshots unless the user explicitly chooses `analyze all 8`.
- Do not jump from raw screenshots straight to trade picks.
- Convert screenshots into structured ORBZ fields first.
- Return `no qualified opportunity` when evidence is incomplete or rules fail.

## Phase 1 — Detect and organize screenshots

For every uploaded screenshot:

1. Identify the ticker.
2. Identify the visible timeframe when possible.
3. Group screenshots by ticker.
4. Preserve unreadable or uncertain items as `uncertain` instead of guessing.

Output of Phase 1:

- detected tickers
- screenshot count
- per-ticker screenshot groups
- unreadable / uncertain items

## Phase 2 — Required user selection prompt

After detection and before ranking, ask exactly:

> Which of the 8 tickers do you want analyzed for the strongest ORBZ long and short opportunities?

UI requirements:

- Present the detected tickers as explicit choices.
- Include an `analyze all 8` option.
- Allow one, many, or all tickers.
- Block ranking until the user makes a valid selection.

If the user does not select a ticker:

- repeat the selection prompt
- do not continue to extraction or ranking

## Phase 3 — Structured extraction

For each selected ticker, extract only the ORBZ fields below:

- OR levels: 15m ORBH / ORBL, 30m ORBH / ORBL
- IB levels: IBH / IBL
- VWAP reference
- support zones
- resistance zones
- event timeline
- tape/context state
- derived rule flags
- candidate long setup
- candidate short setup
- confidence
- missing / uncertain evidence

Rules:

- missing data must be written as `missing`
- uncertain data must be written as `uncertain`
- zones are preferred over single lines
- do not invent values not present in screenshots

## Phase 4 — Rule validation and scoring

For each selected ticker:

1. Evaluate the strongest long candidate.
2. Evaluate the strongest short candidate.
3. Reject any candidate that fails compliance or directional trigger alignment.
4. Score only candidates that remain valid after rule validation.
5. Rank the approved candidates using the configured ranking mode.

Validation gates:

- bracket-only
- zone-edge-only
- deterministic/non-discretionary only
- tape/context confirmation required
- risk cap and RR checks
- external-rule verification required
- directional trigger alignment required

## Phase 5 — Final output contract

Each ranked opportunity must include:

- ticker
- direction
- setup name
- entry signal
- exact levels or zones used
- why it qualifies under ORBZ rules
- what would invalidate it
- confidence
- missing or uncertain evidence

Allowed terminal statuses:

- `awaiting_user_selection`
- `awaiting_valid_selection`
- `ranked`
- `no_qualified_opportunities`

## Ranking modes

Support both:

- `top_2_total`
- `top_2_longs_and_top_2_shorts`

The app must receive one of these explicitly instead of assuming.
