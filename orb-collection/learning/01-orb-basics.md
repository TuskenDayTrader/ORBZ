# 01) ORB Basics

## What is ORB?

ORB means **Opening Range Breakout**.

It uses the high and low of the first part of the market day.
If price breaks above the range, that is a possible long setup.
If price breaks below the range, that is a possible short setup.

## Core idea

1. Mark the opening range high and low.
2. Wait for breakout direction.
3. Confirm with volume and price behavior.
4. Enter with a stop loss.
5. Exit using a target plan.

## Basic setup definitions

| Setup | What you look for |
|---|---|
| Long ORB | Price breaks above range high and holds |
| Short ORB | Price breaks below range low and holds |
| False breakout | Price breaks out, then quickly fails back inside range |

## Long and short entry rules (simple)

### Long entry

- Price closes above opening range high.
- Breakout bar volume is at or above recent average.
- Optional safer entry: wait for retest of range high and bounce.

### Short entry

- Price closes below opening range low.
- Breakout bar volume is at or above recent average.
- Optional safer entry: wait for retest of range low and rejection.

## Advanced (future work)

- Multi-market confirmation (ES/NQ/RTY, etc.)
- News-time exception handling
- Volatility regime filters
