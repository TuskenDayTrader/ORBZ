import type { NormalizedSession, TapeFlags, DerivedFlags, Rule1Result, ComplianceResult } from '../types';

export function evaluateRule1(session: NormalizedSession): Rule1Result {
  const flags = session.derived_flags;
  const events = session.events;

  const bearishTrigger = flags.ibh_rejected_with_wick && flags.vwap_orbl_lost_after_ibh_rejection;
  const bullishTrigger = flags.ibl_rejected_with_wick && flags.vwap_reclaimed_after_ibl_rejection;

  if (bearishTrigger) {
    const triggerEvent = events.find(e => e.event_type === 'vwap_orbl_loss');
    return {
      triggered: true,
      direction: 'bearish',
      entry_signal: 'short_on_vwap_orbl_loss_or_retest_failure',
      invalidation: 'reclaim_and_hold_above_vwap_orbl',
      trigger_event_time: triggerEvent?.timestamp_est ?? null,
      evidence: ['ibh_rejected_with_wick=true', 'vwap_orbl_lost_after_ibh_rejection=true'],
    };
  }

  if (bullishTrigger) {
    const triggerEvent = events.find(e => e.event_type === 'vwap_reclaim');
    return {
      triggered: true,
      direction: 'bullish',
      entry_signal: 'long_on_vwap_reclaim_or_retest_hold',
      invalidation: 'lose_vwap_after_reclaim',
      trigger_event_time: triggerEvent?.timestamp_est ?? null,
      evidence: ['ibl_rejected_with_wick=true', 'vwap_reclaimed_after_ibl_rejection=true'],
    };
  }

  return {
    triggered: false,
    direction: 'neutral',
    entry_signal: 'none',
    invalidation: 'none',
    trigger_event_time: null,
    evidence: ['no_complete_rule1_sequence'],
  };
}

export function evaluateRule2(tape: TapeFlags): { regimeTag: string; description: string } {
  if (tape.nq_new_hod && tape.ym_lagging && tape.rty_lagging && tape.dxy_firming && tape.tlt_weakening) {
    return { regimeTag: 'fade_ym_rallies', description: 'NQ leading, YM/RTY lagging, DXY firming, TLT weakening — fade YM rallies' };
  }
  return { regimeTag: 'neutral', description: 'No dominant tape regime detected' };
}

export function evaluateRule3(flags: DerivedFlags): boolean {
  return flags.open_near_on_low && flags.prior_day_strong_up;
}

export function evaluateRule4(vwap: number, orbl: number): { pivotActive: boolean; pivotLevel: number } {
  if (Math.abs(vwap - orbl) <= 5) {
    return { pivotActive: true, pivotLevel: (vwap + orbl) / 2 };
  }
  return { pivotActive: false, pivotLevel: 0 };
}

function riskPerUnit(intent: NormalizedSession['trade_intent']): number {
  if (intent.direction === 'long') {
    return intent.entry_price - intent.stop_loss;
  }
  return intent.stop_loss - intent.entry_price;
}

function rrForTp(intent: NormalizedSession['trade_intent'], tp: number, risk: number): number {
  const reward = intent.direction === 'long'
    ? tp - intent.entry_price
    : intent.entry_price - tp;
  return reward / risk;
}

export function evaluateCompliance(session: NormalizedSession): ComplianceResult {
  const intent = session.trade_intent;
  const external = session.external_program_rules;

  const blocked: string[] = [];
  const warnings: string[] = [];
  const rrValues: number[] = [];

  if (!intent.order_is_bracket) {
    blocked.push('Bracket order required (entry+stop+target).');
  }

  if (intent.entry_zone_type === 'midrange') {
    blocked.push('Midrange entries are prohibited.');
  } else if (!['support_edge', 'resistance_edge', 'session_edge'].includes(intent.entry_zone_type)) {
    blocked.push('Entry zone must be a recognized structure edge.');
  }

  if (intent.discretionary_override) {
    blocked.push('Discretionary override is prohibited.');
  }

  if (!intent.tape_confirmed) {
    blocked.push('Tape/context confirmation is required.');
  }

  const risk = riskPerUnit(intent);
  if (risk <= 0) {
    blocked.push('Stop placement is invalid for trade direction.');
  } else {
    for (const tp of intent.take_profits) {
      const rr = rrForTp(intent, tp, risk);
      rrValues.push(Math.round(rr * 10000) / 10000);
      if (rr <= 1.0) {
        blocked.push(`TP ${tp} violates RR>1.0 minimum.`);
      }
    }
    if (!rrValues.some(rr => rr >= 1.5)) {
      blocked.push('No take-profit meets 1.5R requirement.');
    }
    if (!rrValues.some(rr => rr >= 2.0)) {
      blocked.push('No take-profit meets 2.0R requirement.');
    }
  }

  const maxRisk = intent.account_size * 0.0025;
  if (intent.risk_dollars > maxRisk) {
    blocked.push('Per-trade risk exceeds 0.25% of account.');
  }

  const scalingAllowed = intent.scaling_allowed_by_program ?? false;
  const maxContracts = intent.max_contracts_allowed ?? (scalingAllowed ? 2 : 1);
  if (!scalingAllowed && intent.contracts > 1) {
    blocked.push('One contract default violated without scaling permission.');
  }
  if (intent.contracts > maxContracts) {
    blocked.push('Contracts exceed max contracts allowed.');
  }

  if (intent.move_stop_to_breakeven_after_points !== 35) {
    warnings.push('Stop-to-breakeven threshold differs from 35-point protocol.');
  }

  const externalVerified = (
    external.daily_max_loss_verified &&
    external.drawdown_verified &&
    external.contract_limits_verified &&
    external.source_text_provided
  );
  if (!externalVerified) {
    blocked.push('External funded-program limits are UNCONFIRMED; trading blocked.');
  }

  return {
    compliant: blocked.length === 0,
    blocked_reasons: blocked,
    warnings,
    rr_values: rrValues,
  };
}
