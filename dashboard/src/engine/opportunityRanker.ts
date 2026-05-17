import type { OpportunityBatch, TickerAnalysis, Candidate, RankedOpportunity, Rule1Result } from '../types';
import { evaluateRule1, evaluateCompliance } from './ruleEngine';

function buildSession(tickerAnalysis: TickerAnalysis, candidate: Candidate) {
  return {
    session_id: `${tickerAnalysis.ticker}-${candidate.direction}`,
    date: '',
    instrument: tickerAnalysis.ticker,
    levels: tickerAnalysis.levels,
    events: tickerAnalysis.events,
    tape: tickerAnalysis.tape,
    derived_flags: tickerAnalysis.derived_flags,
    trade_intent: {
      direction: candidate.direction,
      entry_price: candidate.entry_price,
      stop_loss: candidate.stop_loss,
      take_profits: candidate.take_profits,
      order_is_bracket: candidate.order_is_bracket,
      entry_zone_type: candidate.entry_zone_type,
      discretionary_override: candidate.discretionary_override,
      tape_confirmed: candidate.tape_confirmed,
      account_size: candidate.account_size,
      risk_dollars: candidate.risk_dollars,
      contracts: candidate.contracts,
      move_stop_to_breakeven_after_points: candidate.move_stop_to_breakeven_after_points,
      scaling_allowed_by_program: candidate.scaling_allowed_by_program,
      max_contracts_allowed: candidate.max_contracts_allowed,
    },
    external_program_rules: tickerAnalysis.external_program_rules,
  };
}

function directionalAlignment(direction: string, rule1: Rule1Result, flags: TickerAnalysis['derived_flags']): [boolean, string[]] {
  const reasons: string[] = [];
  if (direction === 'long') {
    const structural = flags.ibl_rejected_with_wick && flags.vwap_reclaimed_after_ibl_rejection;
    if (rule1.triggered && rule1.direction === 'bullish') reasons.push('Rule 1 bullish branch triggered.');
    if (structural) reasons.push('IBL rejection plus VWAP reclaim supports long continuation.');
    return [(rule1.triggered && rule1.direction === 'bullish') || structural, reasons];
  }
  const structural = flags.ibh_rejected_with_wick && flags.vwap_orbl_lost_after_ibh_rejection;
  if (rule1.triggered && rule1.direction === 'bearish') reasons.push('Rule 1 bearish branch triggered.');
  if (structural) reasons.push('IBH rejection plus VWAP/ORBL loss supports short continuation.');
  return [(rule1.triggered && rule1.direction === 'bearish') || structural, reasons];
}

function scoreCandidate(candidate: Candidate, rule1: Rule1Result): number {
  const evidence = candidate.evidence ?? [];
  const whyQualified = candidate.why_qualified ?? [];
  const missing = candidate.missing_or_uncertain_evidence ?? [];
  return Math.round((
    candidate.confidence * 60
    + Math.min(evidence.length, 5) * 5
    + Math.min(whyQualified.length, 3) * 4
    + (candidate.tape_confirmed ? 10 : 0)
    + (rule1.triggered ? 10 : 0)
    - Math.min(missing.length, 3) * 5
  ) * 100) / 100;
}

export function rankOpportunities(batch: OpportunityBatch): { ranked: RankedOpportunity[]; disqualified: Array<{ ticker: string; direction: string; setup_name: string; reasons: string[] }> } {
  const qualified: RankedOpportunity[] = [];
  const disqualified: Array<{ ticker: string; direction: string; setup_name: string; reasons: string[] }> = [];

  for (const tickerAnalysis of batch.ticker_analyses) {
    if (!batch.selected_tickers.includes(tickerAnalysis.ticker)) continue;

    for (const candidate of tickerAnalysis.candidates) {
      const session = buildSession(tickerAnalysis, candidate);
      const rule1 = evaluateRule1(session as Parameters<typeof evaluateRule1>[0]);
      const compliance = evaluateCompliance(session as Parameters<typeof evaluateCompliance>[0]);
      const [aligned, alignmentReasons] = directionalAlignment(candidate.direction, rule1, tickerAnalysis.derived_flags);
      const evidence = candidate.evidence ?? [];
      const missing = candidate.missing_or_uncertain_evidence ?? [];
      const whyQualified = candidate.why_qualified ?? [];

      const disqualifyReasons: string[] = [];
      if (tickerAnalysis.extraction_status !== 'complete') disqualifyReasons.push('Ticker extraction is not complete.');
      if (candidate.confidence < 0.5) disqualifyReasons.push('Confidence is below the 0.50 minimum.');
      if (evidence.length < 2) disqualifyReasons.push('Candidate requires at least two evidence points.');
      if (!aligned) disqualifyReasons.push('Candidate does not align with the deterministic long/short trigger rules.');
      if (!compliance.compliant) disqualifyReasons.push(...compliance.blocked_reasons);

      if (disqualifyReasons.length > 0) {
        disqualified.push({ ticker: tickerAnalysis.ticker, direction: candidate.direction, setup_name: candidate.setup_name, reasons: disqualifyReasons });
        continue;
      }

      const score = scoreCandidate(candidate, rule1);
      qualified.push({
        status: 'qualified',
        ticker: tickerAnalysis.ticker,
        direction: candidate.direction,
        setup_name: candidate.setup_name,
        entry_signal: candidate.entry_signal,
        score,
        score_breakdown: {
          confidence_component: Math.round(candidate.confidence * 60 * 100) / 100,
          evidence_component: Math.min(evidence.length, 5) * 5,
          qualification_component: Math.min(whyQualified.length, 3) * 4,
          tape_component: candidate.tape_confirmed ? 10 : 0,
          rule1_component: rule1.triggered ? 10 : 0,
          missing_penalty: Math.min(missing.length, 3) * 5,
        },
        exact_levels_or_zones_used: candidate.levels_used,
        why_it_qualifies_under_orbz_rules: [...alignmentReasons, ...whyQualified, 'Compliance gates passed.'],
        what_would_invalidate_it: candidate.invalidation,
        confidence: candidate.confidence,
        missing_or_uncertain_evidence: missing,
        evidence: [...evidence, ...rule1.evidence],
        rr_values: compliance.rr_values,
        warnings: compliance.warnings,
      });
    }
  }

  const ranked = [...qualified].sort((a, b) => b.score - a.score).slice(0, 2);
  ranked.forEach((item, i) => { item.rank = i + 1; });

  return { ranked, disqualified };
}
