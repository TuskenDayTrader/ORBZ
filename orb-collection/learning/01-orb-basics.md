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

## Timeframes and what each one does

| Timeframe | Job |
|---|---|
| 1 hour | Trend and strength filter |
| 15 minute | Structure, support, resistance, and realistic targets |
| 5 minute | Entry timing |
| 5 EMA / 13 EMA / 89 EMA | Momentum and trend filter on the 5-minute chart |

## Session map: when the market often behaves differently

ORB works better when you understand the session.

| Session | Typical behavior |
|---|---|
| Globex | Overnight range building, thin liquidity, sweeps of resting levels |
| Asia | Slow balance, first overnight range, often quiet |
| London | Common expansion window, often attacks overnight highs/lows |
| New York | Highest volume, most important open for ORB validation |

## Important levels to mark before the open

Mark these levels before you trade:

- Previous day high
- Previous day low
- Previous day close
- Globex high
- Globex low
- Asia high
- Asia low
- London high
- London low
- VWAP
- Premarket imbalance
- ORB-5, ORB-15, ORB-30 as they form
- IB-60 as it forms

## How to read the open

The open should be interpreted relative to a hierarchy of levels:

1. Higher-time-frame trend
2. Previous day high/low
3. Overnight high/low
4. Globex range
5. VWAP
6. Premarket imbalance
7. Initial opening range

### Simple open guide

- **Open above previous day high**: bullish only if price holds above it.
- **Open below previous day low**: bearish only if price holds below it.
- **Open inside overnight range**: often choppy, with more fakeouts.
- **Open near VWAP**: balance area, wait for acceptance or rejection.

## What is acceptance and rejection?

- **Acceptance** means price breaks a level and stays there.
- **Rejection** means price breaks a level but quickly comes back.
- **Failed break** means the breakout or breakdown does not hold.

These ideas matter more than the breakout itself.

## EMA scalping framework: when to use it

The EMA system is a **support tool**, not a reason to trade by itself.
It helps only when it strengthens the ORB and session structure.

Use the EMA framework when:

- the higher-time-frame trend is clear
- the market has room to move
- price is not trapped in noisy chop
- the ORB or session structure already makes sense

Do **not** force EMA trades when:

- the 1-hour chart is flat
- price is chopping around the 89 EMA
- ES and NQ are diverging hard without follow-through
- there is a major news event about to hit

## 5 / 13 / 89 EMA meaning

On the 5-minute chart:

- **5 EMA** = fast momentum
- **13 EMA** = short-term structure and pullback line
- **89 EMA** = larger trend filter

### Basic EMA rule

- In an uptrend, price should usually be above the 89 EMA.
- In a downtrend, price should usually be below the 89 EMA.
- In a clean trend, the 5 EMA should be above the 13 EMA for longs and below it for shorts.

## 1-hour trend filter

Use the 1-hour chart first.

### Long bias only
Only look for longs when:

- 1-hour trend is up
- price is above the 1-hour 89 EMA
- the 1-hour 89 EMA is flat-to-rising
- the 1-hour EMA stack supports the move

### Short bias only
Only look for shorts when:

- 1-hour trend is down
- price is below the 1-hour 89 EMA
- the 1-hour 89 EMA is flat-to-falling
- the 1-hour EMA stack supports the move

### No-trade zone
Stand aside when:

- the 1-hour EMAs are tangled
- price is chopping around the 89 EMA
- the market is compressing with no expansion
- the 15-minute and 5-minute charts disagree with the 1-hour bias

## 15-minute structure filter

Use the 15-minute chart to decide whether the trade has room.

For longs, look for:

- higher highs and higher lows
- pullbacks that hold structure
- price recovering above support
- EMA 5 curling back above EMA 13

For shorts, look for:

- lower highs and lower lows
- pullbacks that fail at resistance
- price staying below structure
- EMA 5 curling back below EMA 13

If the 15-minute chart does not support the trade, do not force the 5-minute entry.

## 5-minute entry rules

The 5-minute chart is the main entry chart.

### Long entry
A long setup is stronger when:

- the 1-hour trend is up
- the 15-minute chart is supportive
- price pulls back toward the 5 EMA or 13 EMA on the 5-minute chart
- the 5 EMA crosses back above the 13 EMA
- price closes back above the 5 EMA
- the candle shows strength and not just a tiny bounce
- the move aligns with ORB or a key session level

### Short entry
A short setup is stronger when:

- the 1-hour trend is down
- the 15-minute chart is supportive
- price pulls back toward the 5 EMA or 13 EMA on the 5-minute chart
- the 5 EMA crosses back below the 13 EMA
- price closes back below the 5 EMA
- the candle shows weakness and not just a small dip
- the move aligns with ORB or a key session level

## Simple EMA entry idea

The best EMA trade is usually **not** a chase.

It is usually:

1. trend is already known
2. price pulls back
3. EMA 5 and EMA 13 re-align in the trend direction
4. price confirms with a close
5. entry happens after the pullback holds

## ORB definitions

### ORB-5
The high and low of the first 5-minute candle after 9:30 ET.

### ORB-15
The high and low from 9:30 to 9:45 ET.

### ORB-30
The high and low from 9:30 to 10:00 ET.

### IB-60
The high and low from 9:30 to 10:30 ET.

## ORB rules in simple language

A breakout is only valid if price:

- breaks the range
- closes beyond it
- and holds there

If price only spikes through the level and then comes back, that is a fakeout.

## High-probability breakout conditions

A breakout is stronger when:

- the open is in line with the 1-hour trend
- the 15-minute chart supports the move
- the move is happening during an active session window
- price breaks a real level such as prior day high, overnight high, or ORB
- ES and NQ are confirming each other
- the breakout closes and then holds

## Low-quality breakout conditions

Be careful when:

- the market is inside the overnight range
- price is already extended
- the move happens in dead midday conditions
- the breakout is into obvious resistance or support
- ES and NQ are diverging
- the breakout bar is weak or wick-heavy

## How to use ES and NQ together

ES and NQ often move together.

- **Confirmation** means both are pointing the same way.
- **Divergence** means one is moving harder than the other.

If NQ breaks out but ES does not confirm, be careful.
If both are aligned, the move is more believable.

## Stop loss placement

Your stop loss should be structural, not random.

### Long stop
Place the stop below:

- the breakout level
- the retest low
- or the most recent swing low

### Short stop
Place the stop above:

- the breakdown level
- the retest high
- or the most recent swing high

Do not widen the stop after entry.

## Profit target

Use a target that gives at least a **2.1:1 reward-to-risk** ratio.

### Simple example
If you risk 10 points, the target should be at least 21 points.

If the nearest logical target is too small, skip the trade.

## Risk rules

- Risk only a small amount per trade
- Never widen the stop
- Do not overtrade
- Stop after too many losses
- Avoid major news windows

### News stand-down rule
Do not open a new trade:

- 2 minutes before major news
- 2 minutes after major news

Examples:

- CPI
- PPI
- NFP
- FOMC
- Powell press conference

## Best beginner trade types

### 1) Breakout and retest
Price breaks ORB, returns to test it, and holds.
This is one of the safest beginner entries.

### 2) EMA pullback in trend
In a clear trend, price pulls back to the 5 EMA or 13 EMA and then continues.

### 3) Failed breakout reversal
Price breaks a level, fails, and comes back inside the range.
Then you trade the reversal only if the structure is clear.

## Best market conditions

This strategy works best when:

- the higher timeframe is trending cleanly
- volatility is enough to reach 2.1R
- the market is not in a tight range
- liquidity is strong

Avoid:

- news spikes
- low-volume dead zones
- post-expansion exhaustion
- chop where EMA 5 and EMA 13 keep crossing back and forth

## Simple trade checklist

Before taking a trade, ask:

- Is the 1-hour trend clear?
- Does the 15-minute chart support the idea?
- Is price on the right side of the 89 EMA?
- Is the 5 EMA above or below the 13 EMA in the correct direction?
- Did price break a real level?
- Did price hold that level?
- Is my stop clear?
- Is my target at least 2.1R?

If the answer is mostly no, skip the trade.

## Summary

This lesson combines:

- **1-hour chart** for trend
- **15-minute chart** for structure
- **5-minute chart** for entry
- **5 / 13 / 89 EMAs** for momentum and trend filtering
- **ORB** for breakout logic
- **Asia / London / Globex levels** for session context
- **2.1:1 reward-to-risk** for disciplined profit management

The EMA scalping framework should only be used when it strengthens the ORB and session structure.
If it does not add clarity, stay with the simpler ORB rules.
