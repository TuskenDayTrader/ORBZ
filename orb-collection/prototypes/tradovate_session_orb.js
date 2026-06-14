const predef = require("./tools/predef");
const meta = require("./tools/meta");
const { du, op, px } = require("./tools/graphics");

/*
 * Tradovate session ORB overlay.
 * - NY PM removed on purpose.
 * - Session windows are interpreted in America/New_York time.
 * - ORB values are accumulated from each session open for 5/15/30/60 minutes,
 *   then the last computed value is returned on every later bar so the line extends.
 * - Sweep markers use simple deterministic logic:
 *   high sweep = bar trades above a reference and closes back below it;
 *   low sweep = bar trades below a reference and closes back above it.
 * - GLOBEX session (18:00–09:30 ET) tracks the overnight range high/low and
 *   provides sweep reference levels used as key pre-NY context (see learning docs:
 *   "Globex high" / "Globex low" are marked before every trading day).
 * - Backend signal engine (not plotted — no UI clutter):
 *   - IBH/IBL + VWAP/ORB-5 convergence detection (Rules 1 & 4)
 *   - ORB-5 fast breakout detection against NY AM session open
 *   These are available in `this.signals` for downstream alert or filter use and
 *   are designed to remain prop-firm compliant (bracket-only, zone-edge-only).
 */

// 5-minute ORB added as the fastest entry-timing frame (see 02-timeframe-playbooks).
const DURATIONS = [5, 15, 30, 60];

const SESSION_DEFS = {
    // Overnight Globex session: CME equity futures open at 18:00 ET, run until NY AM open.
    // Tracks the full overnight range high/low — these are primary pre-market reference levels.
    globex: {
        key: "globex",
        title: "Globex",
        shortLabel: "GBX",
        showKey: "showGlobex",
        colorKey: "globexColor",
        startHourKey: "globexStartHour",
        startMinuteKey: "globexStartMinute",
        endHourKey: "globexEndHour",
        endMinuteKey: "globexEndMinute"
    },
    asia: {
        key: "asia",
        title: "Asia",
        shortLabel: "AS",
        showKey: "showAsia",
        colorKey: "asiaColor",
        startHourKey: "asiaStartHour",
        startMinuteKey: "asiaStartMinute",
        endHourKey: "asiaEndHour",
        endMinuteKey: "asiaEndMinute"
    },
    london: {
        key: "london",
        title: "London",
        shortLabel: "LDN",
        showKey: "showLondon",
        colorKey: "londonColor",
        startHourKey: "londonStartHour",
        startMinuteKey: "londonStartMinute",
        endHourKey: "londonEndHour",
        endMinuteKey: "londonEndMinute"
    },
    nyam: {
        key: "nyam",
        title: "NY AM",
        shortLabel: "NY",
        showKey: "showNyAm",
        colorKey: "nyAmColor",
        startHourKey: "nyAmStartHour",
        startMinuteKey: "nyAmStartMinute",
        endHourKey: "nyAmEndHour",
        endMinuteKey: "nyAmEndMinute"
    }
};

function sessionPlotName(sessionKey, duration, side) {
    return `${sessionKey}${duration}${side}`;
}

function sessionPlotTitle(sessionTitle, duration, side) {
    return `${sessionTitle} ${duration}m ORB ${side}`;
}

function buildPlots() {
    const plots = {};

    Object.values(SESSION_DEFS).forEach((session) => {
        DURATIONS.forEach((duration) => {
            plots[sessionPlotName(session.key, duration, "High")] = {
                title: sessionPlotTitle(session.title, duration, "High")
            };
            plots[sessionPlotName(session.key, duration, "Low")] = {
                title: sessionPlotTitle(session.title, duration, "Low")
            };
        });
    });

    return plots;
}

function buildSchemeStyles(isLightTheme) {
    const styles = {};

    Object.values(SESSION_DEFS).forEach((session) => {
        DURATIONS.forEach((duration) => {
            // 5m = thinnest/most transparent; 60m = thickest/most opaque
            const width = duration === 5 ? 1 : duration === 15 ? 1 : duration === 30 ? 2 : 3;
            const opacity = duration === 5 ? 1.0 : duration === 15 ? 0.95 : duration === 30 ? 0.8 : 0.65;
            const baseColor =
                session.key === "globex"
                    ? (isLightTheme ? "#2e8b57" : "#50c878")
                    : session.key === "asia"
                        ? (isLightTheme ? "#6b5cff" : "#8c7cff")
                        : session.key === "london"
                            ? (isLightTheme ? "#0b7fab" : "#3ec1f3")
                            : (isLightTheme ? "#b85c00" : "#ffb14e");

            styles[sessionPlotName(session.key, duration, "High")] = {
                color: baseColor,
                lineWidth: width,
                opacity
            };
            styles[sessionPlotName(session.key, duration, "Low")] = {
                color: baseColor,
                lineWidth: width,
                opacity
            };
        });
    });

    return styles;
}

function buildParams() {
    const params = {
        showSweeps: predef.paramSpecs.bool(true),
        // Controls how far sweep labels sit away from the swept price level.
        sweepOffsetTicks: predef.paramSpecs.number(6, 1, 1)
    };

    Object.values(SESSION_DEFS).forEach((session) => {
        params[session.showKey] = predef.paramSpecs.bool(true);
        // ORB duration toggles — 5m added as the fastest entry-timing frame.
        params[`${session.key}5`] = predef.paramSpecs.bool(true);
        params[`${session.key}15`] = predef.paramSpecs.bool(true);
        params[`${session.key}30`] = predef.paramSpecs.bool(true);
        params[`${session.key}60`] = predef.paramSpecs.bool(true);
        params[session.colorKey] = predef.paramSpecs.color(
            session.key === "globex"
                ? "#50c878"
                : session.key === "asia"
                    ? "#8c7cff"
                    : session.key === "london"
                        ? "#3ec1f3"
                        : "#ffb14e"
        );
    });

    // Globex: CME equity futures overnight session, 18:00–09:30 ET.
    // This spans midnight so endHour < startHour (handled by isInSession).
    params.globexStartHour = predef.paramSpecs.number(18, 1, 0);
    params.globexStartMinute = predef.paramSpecs.number(0, 1, 0);
    params.globexEndHour = predef.paramSpecs.number(9, 1, 0);
    params.globexEndMinute = predef.paramSpecs.number(30, 1, 0);

    params.asiaStartHour = predef.paramSpecs.number(20, 1, 0);
    params.asiaStartMinute = predef.paramSpecs.number(0, 1, 0);
    params.asiaEndHour = predef.paramSpecs.number(3, 1, 0);
    params.asiaEndMinute = predef.paramSpecs.number(0, 1, 0);

    params.londonStartHour = predef.paramSpecs.number(3, 1, 0);
    params.londonStartMinute = predef.paramSpecs.number(0, 1, 0);
    params.londonEndHour = predef.paramSpecs.number(9, 1, 0);
    params.londonEndMinute = predef.paramSpecs.number(30, 1, 0);

    params.nyAmStartHour = predef.paramSpecs.number(9, 1, 0);
    params.nyAmStartMinute = predef.paramSpecs.number(30, 1, 0);
    params.nyAmEndHour = predef.paramSpecs.number(12, 1, 0);
    params.nyAmEndMinute = predef.paramSpecs.number(0, 1, 0);

    return params;
}

function createOrbState() {
    return DURATIONS.reduce((acc, duration) => {
        acc[duration] = {
            high: undefined,
            low: undefined,
            complete: false
        };
        return acc;
    }, {});
}

function createSessionState() {
    return {
        active: false,
        startMinuteId: undefined,
        sessionHigh: undefined,
        sessionLow: undefined,
        orbs: createOrbState()
    };
}

function createSweepRef(label) {
    return {
        label,
        high: undefined,
        low: undefined,
        highSwept: false,
        lowSwept: false
    };
}

function toMinuteOfDay(hour, minute) {
    return hour * 60 + minute;
}

function pad(value) {
    return String(value).padStart(2, "0");
}

function getNyParts(date) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
    }).formatToParts(date);

    const values = {};
    parts.forEach((part) => {
        if (part.type !== "literal") {
            values[part.type] = part.value;
        }
    });

    const dayOfWeekMap = {
        Sun: 0,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6
    };

    const year = Number(values.year);
    const month = Number(values.month);
    const day = Number(values.day);
    const hour = Number(values.hour);
    const minute = Number(values.minute);
    const weekday = dayOfWeekMap[values.weekday];
    const dayKey = `${values.year}-${values.month}-${values.day}`;
    const weekAnchor = new Date(Date.UTC(year, month - 1, day));
    const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
    weekAnchor.setUTCDate(weekAnchor.getUTCDate() + mondayOffset);
    const weekKey = `${weekAnchor.getUTCFullYear()}-${pad(weekAnchor.getUTCMonth() + 1)}-${pad(weekAnchor.getUTCDate())}`;

    return {
        dayKey,
        weekKey,
        hour,
        minute,
        minuteOfDay: toMinuteOfDay(hour, minute)
    };
}

function isInSession(minuteOfDay, startMinute, endMinute) {
    if (startMinute === endMinute) {
        return false;
    }

    if (startMinute < endMinute) {
        return minuteOfDay >= startMinute && minuteOfDay < endMinute;
    }

    return minuteOfDay >= startMinute || minuteOfDay < endMinute;
}

class TradovateSessionOrb {
    init() {
        this.sessions = Object.keys(SESSION_DEFS).reduce((acc, key) => {
            acc[key] = createSessionState();
            return acc;
        }, {});

        this.sweepRefs = {
            priorDay: createSweepRef("PD"),
            priorWeek: createSweepRef("PW"),
            globex: createSweepRef("GBX"),
            asia: createSweepRef("AS"),
            london: createSweepRef("LDN"),
            nyam: createSweepRef("NY")
        };

        this.currentDayKey = undefined;
        this.currentDayHigh = undefined;
        this.currentDayLow = undefined;
        this.currentWeekKey = undefined;
        this.currentWeekHigh = undefined;
        this.currentWeekLow = undefined;

        /*
         * Backend signal engine — not plotted, no UI clutter.
         * Implements Rule 1 (IBH/IBL wick rejection + VWAP/ORB convergence) and
         * Rule 4 (VWAP/ORBL convergence pivot) from rules/rule-set-v1.md.
         * ORB-5 breakout state is reset each NY AM session.
         * These values are available for alert conditions or future filter use
         * without cluttering the visible indicator.
         */
        this.signals = {
            // Rule 1 state
            ibhWickRejected: false,
            iblWickRejected: false,
            rule1BearActive: false,
            rule1BullActive: false,
            // Rule 4 VWAP/ORB5 convergence (updated each NY AM bar)
            vwapOrbConvergence: false,
            vwapOrbConvergenceLevel: undefined,
            // ORB-5 breakout tracking (NY AM)
            orb5High: undefined,
            orb5Low: undefined,
            orb5BreakoutLong: false,
            orb5BreakoutShort: false,
            // Simple VWAP accumulator (price * volume sum / volume sum)
            _vwapPriceVolSum: 0,
            _vwapVolSum: 0,
            _vwapDayKey: undefined,
            vwap: undefined
        };
    }

    map(d, index, history) {
        const currentTime = d.timestamp();
        const currentNy = getNyParts(currentTime);
        const previousBar = index > 0 ? history.prior() : undefined;
        const previousNy = previousBar ? getNyParts(previousBar.timestamp()) : undefined;

        this.updateDayAndWeekRefs(d, currentNy);
        this.updateSessions(d, currentNy, previousNy);
        this.updateBackendSignals(d, currentNy);

        const result = {
            style: {}
        };

        Object.values(SESSION_DEFS).forEach((session) => {
            const state = this.sessions[session.key];
            DURATIONS.forEach((duration) => {
                const showDuration = this.props[session.showKey] && this.props[`${session.key}${duration}`];
                const highPlot = sessionPlotName(session.key, duration, "High");
                const lowPlot = sessionPlotName(session.key, duration, "Low");

                result[highPlot] = showDuration ? state.orbs[duration].high : undefined;
                result[lowPlot] = showDuration ? state.orbs[duration].low : undefined;
                result.style[highPlot] = { color: this.props[session.colorKey] };
                result.style[lowPlot] = { color: this.props[session.colorKey] };
            });
        });

        const graphicsItems = this.props.showSweeps ? this.buildSweepGraphics(d, index) : [];
        if (graphicsItems.length > 0) {
            result.graphics = { items: graphicsItems };
        }

        return result;
    }

    updateDayAndWeekRefs(d, currentNy) {
        if (this.currentDayKey === undefined) {
            this.currentDayKey = currentNy.dayKey;
            this.currentDayHigh = d.high();
            this.currentDayLow = d.low();
        } else if (currentNy.dayKey !== this.currentDayKey) {
            this.setSweepRef(this.sweepRefs.priorDay, this.currentDayHigh, this.currentDayLow);
            this.currentDayKey = currentNy.dayKey;
            this.currentDayHigh = d.high();
            this.currentDayLow = d.low();
        } else {
            this.currentDayHigh = Math.max(this.currentDayHigh, d.high());
            this.currentDayLow = Math.min(this.currentDayLow, d.low());
        }

        if (this.currentWeekKey === undefined) {
            this.currentWeekKey = currentNy.weekKey;
            this.currentWeekHigh = d.high();
            this.currentWeekLow = d.low();
        } else if (currentNy.weekKey !== this.currentWeekKey) {
            this.setSweepRef(this.sweepRefs.priorWeek, this.currentWeekHigh, this.currentWeekLow);
            this.currentWeekKey = currentNy.weekKey;
            this.currentWeekHigh = d.high();
            this.currentWeekLow = d.low();
        } else {
            this.currentWeekHigh = Math.max(this.currentWeekHigh, d.high());
            this.currentWeekLow = Math.min(this.currentWeekLow, d.low());
        }
    }

    updateSessions(d, currentNy, previousNy) {
        Object.values(SESSION_DEFS).forEach((session) => {
            const state = this.sessions[session.key];
            const startMinute = toMinuteOfDay(this.props[session.startHourKey], this.props[session.startMinuteKey]);
            const endMinute = toMinuteOfDay(this.props[session.endHourKey], this.props[session.endMinuteKey]);
            const currentInSession = isInSession(currentNy.minuteOfDay, startMinute, endMinute);
            const previousInSession = previousNy ? isInSession(previousNy.minuteOfDay, startMinute, endMinute) : false;
            const sessionStarted = currentInSession && !previousInSession;
            const sessionEnded = !currentInSession && previousInSession;

            if (sessionStarted) {
                state.active = true;
                state.startMinuteId = this.absoluteMinuteId(d.timestamp());
                state.sessionHigh = d.high();
                state.sessionLow = d.low();
                state.orbs = createOrbState();

                // The opening bar seeds every ORB bucket.
                DURATIONS.forEach((duration) => {
                    state.orbs[duration].high = d.high();
                    state.orbs[duration].low = d.low();
                });
            }

            if (currentInSession && state.active) {
                state.sessionHigh = Math.max(state.sessionHigh, d.high());
                state.sessionLow = Math.min(state.sessionLow, d.low());

                const elapsedMinutes = this.absoluteMinuteId(d.timestamp()) - state.startMinuteId;
                DURATIONS.forEach((duration) => {
                    const orb = state.orbs[duration];
                    // Keep updating until the bucket is complete, then stop mutating it.
                    if (elapsedMinutes < duration) {
                        orb.high = Math.max(orb.high, d.high());
                        orb.low = Math.min(orb.low, d.low());
                    } else {
                        orb.complete = true;
                    }
                });
            }

            if (sessionEnded && state.active) {
                this.setSweepRef(this.sweepRefs[session.key], state.sessionHigh, state.sessionLow);
                state.active = false;
                state.startMinuteId = undefined;
                state.sessionHigh = undefined;
                state.sessionLow = undefined;
            }
        });
    }

    absoluteMinuteId(date) {
        return Math.floor(date.getTime() / 60000);
    }

    setSweepRef(reference, high, low) {
        reference.high = high;
        reference.low = low;
        reference.highSwept = false;
        reference.lowSwept = false;
    }

    buildSweepGraphics(d, index) {
        const events = [];
        const refs = [
            this.sweepRefs.priorDay,
            this.sweepRefs.priorWeek,
            this.sweepRefs.globex,
            this.sweepRefs.asia,
            this.sweepRefs.london,
            this.sweepRefs.nyam
        ];

        refs.forEach((reference) => {
            if (reference.high !== undefined && !reference.highSwept && d.high() > reference.high && d.close() < reference.high) {
                reference.highSwept = true;
                events.push({
                    text: `${reference.label} H SWP`,
                    y: reference.high,
                    color: "#ff6b6b",
                    direction: "high"
                });
            }

            if (reference.low !== undefined && !reference.lowSwept && d.low() < reference.low && d.close() > reference.low) {
                reference.lowSwept = true;
                events.push({
                    text: `${reference.label} L SWP`,
                    y: reference.low,
                    color: "#51cf66",
                    direction: "low"
                });
            }
        });

        const tickOffset = this.contractInfo && this.contractInfo.tickSize
            ? this.contractInfo.tickSize * this.props.sweepOffsetTicks
            : 0;

        return events.map((event, eventIndex) => ({
            tag: "Text",
            key: `sweep-${index}-${eventIndex}-${event.text}`,
            point: {
                x: op(du(index), "-", px(4)),
                y: du(event.direction === "high"
                    ? event.y + tickOffset
                    : event.y - tickOffset)
            },
            text: event.text,
            style: {
                fontSize: 12,
                fontWeight: "bold",
                fill: event.color
            },
            textAlignment: "centerMiddle"
        }));
    }

    /*
     * Backend signal engine — invisible, no chart clutter.
     *
     * Implements the logic from rules/rule-set-v1.md and the learning docs:
     *
     * VWAP (Rule 4 + Rule 1 convergence):
     *   A typical-price VWAP is accumulated per trading day.  When the NY AM
     *   ORB-5 level converges with the running VWAP to within the configured
     *   threshold, the pivot is flagged (vwapOrbConvergence = true).  Loss of
     *   that level is a mandatory bearish bias flip; reclaim is a mandatory
     *   bullish bias flip.
     *
     * IBH/IBL wick-rejection (Rule 1):
     *   Once the NY AM IB-60 high/low levels are set (complete ORB-60), each
     *   bar is checked for a wick-rejection signature at those levels.  The
     *   signal resets only at the start of each NY AM session.
     *
     * ORB-5 breakout (fast-entry timing):
     *   As soon as the NY AM ORB-5 bucket completes, breakout conditions are
     *   evaluated on every subsequent bar: close above ORB-5 high = long signal;
     *   close below ORB-5 low = short signal.  Signals are one-shot per session.
     *
     * All state lives in this.signals and is intentionally separate from the
     * plotted data so it never clutters the indicator surface.
     */
    updateBackendSignals(d, currentNy) {
        const s = this.signals;

        // ---- VWAP accumulation (resets at NY trading-day boundary) ----
        // Use typical price (HLC/3) consistent with standard VWAP definition.
        if (s._vwapDayKey !== currentNy.dayKey) {
            s._vwapDayKey = currentNy.dayKey;
            s._vwapPriceVolSum = 0;
            s._vwapVolSum = 0;
            s.vwap = undefined;
            // Reset session-scoped Rule 1 flags on new day.
            s.ibhWickRejected = false;
            s.iblWickRejected = false;
            s.rule1BearActive = false;
            s.rule1BullActive = false;
            s.vwapOrbConvergence = false;
            s.vwapOrbConvergenceLevel = undefined;
            s.orb5High = undefined;
            s.orb5Low = undefined;
            s.orb5BreakoutLong = false;
            s.orb5BreakoutShort = false;
        }

        const vol = d.volume ? d.volume() : 0;
        if (vol > 0) {
            const typical = (d.high() + d.low() + d.close()) / 3;
            s._vwapPriceVolSum += typical * vol;
            s._vwapVolSum += vol;
            s.vwap = s._vwapVolSum > 0 ? s._vwapPriceVolSum / s._vwapVolSum : undefined;
        }

        // ---- NY AM session backend signals ----
        const nyAmState = this.sessions.nyam;
        if (!nyAmState.active) {
            return;
        }

        const orb5 = nyAmState.orbs[5];
        const orb60 = nyAmState.orbs[60];

        // Capture ORB-5 levels once the 5-minute bucket is complete.
        if (orb5.complete && s.orb5High === undefined) {
            s.orb5High = orb5.high;
            s.orb5Low = orb5.low;
        }

        // Rule 4: VWAP / ORB-5 convergence detection.
        // When VWAP and the ORB-5 high or low are within the configured tick
        // threshold, flag the pivot level for bias logic.
        if (s.vwap !== undefined && s.orb5High !== undefined) {
            const tickSize = (this.contractInfo && this.contractInfo.tickSize) ? this.contractInfo.tickSize : 1;
            const convergenceThreshold = tickSize * 20; // ~5 YM points at 1-tick resolution
            const distHigh = Math.abs(s.vwap - s.orb5High);
            const distLow = Math.abs(s.vwap - s.orb5Low);
            if (distHigh <= convergenceThreshold) {
                s.vwapOrbConvergence = true;
                s.vwapOrbConvergenceLevel = (s.vwap + s.orb5High) / 2;
            } else if (distLow <= convergenceThreshold) {
                s.vwapOrbConvergence = true;
                s.vwapOrbConvergenceLevel = (s.vwap + s.orb5Low) / 2;
            }
        }

        // Rule 1: IBH/IBL wick-rejection detection against the IB-60 levels.
        // Once the 60-minute bucket is complete the IBH and IBL are fixed.
        if (orb60.complete && orb60.high !== undefined && orb60.low !== undefined) {
            const tickSize = (this.contractInfo && this.contractInfo.tickSize) ? this.contractInfo.tickSize : 1;
            const wickThreshold = tickSize * 4; // 4-tick minimum wick (matches Pine prototype)
            const upperWick = d.high() - Math.max(d.open(), d.close());
            const lowerWick = Math.min(d.open(), d.close()) - d.low();

            // IBH rejection: bar spikes above IB high but closes back below it with a real wick.
            if (!s.ibhWickRejected && d.high() > orb60.high && d.close() < orb60.high && upperWick >= wickThreshold) {
                s.ibhWickRejected = true;
            }
            // IBL rejection: bar spikes below IB low but closes back above it with a real wick.
            if (!s.iblWickRejected && d.low() < orb60.low && d.close() > orb60.low && lowerWick >= wickThreshold) {
                s.iblWickRejected = true;
            }

            // Rule 1 bearish: IBH wick rejection already seen AND current close drops below
            // the VWAP/ORB-5 convergence pivot (or raw VWAP if no convergence detected).
            if (s.ibhWickRejected && !s.rule1BearActive && s.vwap !== undefined) {
                const pivotRef = s.vwapOrbConvergence ? s.vwapOrbConvergenceLevel : s.vwap;
                if (pivotRef !== undefined && d.close() < pivotRef) {
                    s.rule1BearActive = true;
                }
            }

            // Rule 1 bullish: IBL wick rejection already seen AND current close climbs above
            // the VWAP/ORB-5 convergence pivot (or raw VWAP if no convergence detected).
            if (s.iblWickRejected && !s.rule1BullActive && s.vwap !== undefined) {
                const pivotRef = s.vwapOrbConvergence ? s.vwapOrbConvergenceLevel : s.vwap;
                if (pivotRef !== undefined && d.close() > pivotRef) {
                    s.rule1BullActive = true;
                }
            }
        }

        // ORB-5 breakout detection (fast entry-timing signal, one-shot per session).
        if (s.orb5High !== undefined && s.orb5Low !== undefined) {
            if (!s.orb5BreakoutLong && d.close() > s.orb5High) {
                s.orb5BreakoutLong = true;
            }
            if (!s.orb5BreakoutShort && d.close() < s.orb5Low) {
                s.orb5BreakoutShort = true;
            }
        }
    }
}

const plots = buildPlots();

module.exports = {
    name: "sessionOrbSweep",
    description: "Globex/Asia/London/NY AM ORB levels (5/15/30/60m) with sweep markers and backend signal engine.",
    calculator: TradovateSessionOrb,
    inputType: meta.InputType.BARS,
    areaChoice: meta.AreaChoice.OVERLAY,
    params: buildParams(),
    plots,
    tags: ["ORB", "Sessions", "Levels", "Globex"],
    schemeStyles: {
        dark: buildSchemeStyles(false),
        light: buildSchemeStyles(true)
    }
};
