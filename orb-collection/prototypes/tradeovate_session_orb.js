const predef = require("./tools/predef");
const meta = require("./tools/meta");
const { du, op, px } = require("./tools/graphics");

/*
 * Tradeovate session ORB overlay.
 * - NY PM removed on purpose.
 * - Session windows are interpreted in America/New_York time.
 * - ORB values are accumulated from each session open for 15/30/60 minutes,
 *   then the last computed value is returned on every later bar so the line extends.
 * - Sweep markers use simple deterministic logic:
 *   high sweep = bar trades above a reference and closes back below it;
 *   low sweep = bar trades below a reference and closes back above it.
 */

const DURATIONS = [15, 30, 60];

const SESSION_DEFS = {
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

function buildSchemeStyles(isLight) {
    const styles = {};

    Object.values(SESSION_DEFS).forEach((session) => {
        DURATIONS.forEach((duration) => {
            const width = duration === 15 ? 1 : duration === 30 ? 2 : 3;
            const opacity = duration === 15 ? 0.95 : duration === 30 ? 0.8 : 0.65;
            const baseColor =
                session.key === "asia"
                    ? (isLight ? "#6b5cff" : "#8c7cff")
                    : session.key === "london"
                        ? (isLight ? "#0b7fab" : "#3ec1f3")
                        : (isLight ? "#b85c00" : "#ffb14e");

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
        sweepOffsetTicks: predef.paramSpecs.number(6, 1, 0)
    };

    Object.values(SESSION_DEFS).forEach((session) => {
        params[session.showKey] = predef.paramSpecs.bool(true);
        params[`${session.key}15`] = predef.paramSpecs.bool(true);
        params[`${session.key}30`] = predef.paramSpecs.bool(true);
        params[`${session.key}60`] = predef.paramSpecs.bool(true);
        params[session.colorKey] = predef.paramSpecs.color(
            session.key === "asia" ? "#8c7cff" : session.key === "london" ? "#3ec1f3" : "#ffb14e"
        );
    });

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
        return true;
    }

    if (startMinute < endMinute) {
        return minuteOfDay >= startMinute && minuteOfDay < endMinute;
    }

    return minuteOfDay >= startMinute || minuteOfDay < endMinute;
}

class TradeovateSessionOrb {
    init() {
        this.sessions = Object.keys(SESSION_DEFS).reduce((acc, key) => {
            acc[key] = createSessionState();
            return acc;
        }, {});

        this.sweepRefs = {
            priorDay: createSweepRef("PD"),
            priorWeek: createSweepRef("PW"),
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
    }

    map(d, index, history) {
        const currentTime = d.timestamp();
        const currentNy = getNyParts(currentTime);
        const previousBar = index > 0 ? history.prior() : undefined;
        const previousNy = previousBar ? getNyParts(previousBar.timestamp()) : undefined;

        this.updateDayAndWeekRefs(d, currentNy);
        this.updateSessions(d, currentNy, previousNy);

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
                        orb.high = orb.high === undefined ? d.high() : Math.max(orb.high, d.high());
                        orb.low = orb.low === undefined ? d.low() : Math.min(orb.low, d.low());
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
            this.sweepRefs.asia,
            this.sweepRefs.london,
            this.sweepRefs.nyam
        ];

        refs.forEach((reference) => {
            if (reference.high !== undefined && !reference.highSwept && d.high() > reference.high && d.close() < reference.high) {
                reference.highSwept = true;
                events.push({
                    text: `${reference.label} H SWP`,
                    y: Math.max(d.high(), reference.high),
                    color: "#ff6b6b",
                    direction: "high"
                });
            }

            if (reference.low !== undefined && !reference.lowSwept && d.low() < reference.low && d.close() > reference.low) {
                reference.lowSwept = true;
                events.push({
                    text: `${reference.label} L SWP`,
                    y: Math.min(d.low(), reference.low),
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
}

const plots = buildPlots();

module.exports = {
    name: "sessionOrbSweep",
    description: "Asia/London/NY AM ORB levels with simple sweep markers.",
    calculator: TradeovateSessionOrb,
    inputType: meta.InputType.BARS,
    areaChoice: meta.AreaChoice.OVERLAY,
    params: buildParams(),
    plots,
    tags: ["ORB", "Sessions", "Levels"],
    schemeStyles: {
        dark: buildSchemeStyles(false),
        light: buildSchemeStyles(true)
    }
};
