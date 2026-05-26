export interface OrbLevel {
  orbh_15m: number;
  orbl_15m: number;
  orbh_30m: number;
  orbl_30m: number;
  ibh: number;
  ibl: number;
  vwap_ref: number;
  support_zones: string[];
  resistance_zones: string[];
}

export interface SessionEvent {
  timestamp_est: string;
  event_type: string;
  level: number;
  note: string;
}

export interface TapeFlags {
  nq_new_hod: boolean;
  ym_lagging: boolean;
  rty_lagging: boolean;
  dxy_firming: boolean;
  tlt_weakening: boolean;
}

export interface DerivedFlags {
  ibh_rejected_with_wick: boolean;
  vwap_orbl_lost_after_ibh_rejection: boolean;
  ibl_rejected_with_wick: boolean;
  vwap_reclaimed_after_ibl_rejection: boolean;
  vwap_orbl_converged_within_5: boolean;
  open_near_on_low: boolean;
  prior_day_strong_up: boolean;
}

export interface TradeIntent {
  direction: 'long' | 'short';
  entry_price: number;
  stop_loss: number;
  take_profits: number[];
  order_is_bracket: boolean;
  entry_zone_type: string;
  discretionary_override: boolean;
  tape_confirmed: boolean;
  account_size: number;
  risk_dollars: number;
  contracts: number;
  move_stop_to_breakeven_after_points: number;
  scaling_allowed_by_program: boolean;
  max_contracts_allowed: number;
}

export interface ExternalProgramRules {
  daily_max_loss_verified: boolean;
  drawdown_verified: boolean;
  contract_limits_verified: boolean;
  source_text_provided: boolean;
}

export interface NormalizedSession {
  session_id: string;
  date: string;
  instrument: string;
  levels: OrbLevel;
  events: SessionEvent[];
  tape: TapeFlags;
  derived_flags: DerivedFlags;
  trade_intent: TradeIntent;
  external_program_rules: ExternalProgramRules;
}

export interface CsvOrbRow {
  date: string;
  tf: '15m' | '30m' | '60m';
  orbh: number;
  orbl: number;
  notes: string;
}

export interface Candidate {
  direction: 'long' | 'short';
  setup_name: string;
  entry_signal: string;
  entry_price: number;
  stop_loss: number;
  take_profits: number[];
  order_is_bracket: boolean;
  entry_zone_type: string;
  discretionary_override: boolean;
  tape_confirmed: boolean;
  account_size: number;
  risk_dollars: number;
  contracts: number;
  move_stop_to_breakeven_after_points: number;
  scaling_allowed_by_program: boolean;
  max_contracts_allowed: number;
  confidence: number;
  levels_used: string[];
  why_qualified: string[];
  invalidation: string;
  evidence: string[];
  missing_or_uncertain_evidence: string[];
}

export interface TickerAnalysis {
  ticker: string;
  timeframes: string[];
  source_screenshot_ids: string[];
  extraction_status: string;
  levels: OrbLevel;
  events: SessionEvent[];
  tape: TapeFlags;
  derived_flags: DerivedFlags;
  external_program_rules: ExternalProgramRules;
  candidates: Candidate[];
}

export interface OpportunityBatch {
  batch_id: string;
  screenshot_count: number;
  selection_mode: string;
  ranking_mode: string;
  detected_tickers: string[];
  selected_tickers: string[];
  ticker_analyses: TickerAnalysis[];
}

export interface Rule1Result {
  triggered: boolean;
  direction: 'bearish' | 'bullish' | 'neutral';
  entry_signal: string;
  invalidation: string;
  trigger_event_time: string | null;
  evidence: string[];
}

export interface ComplianceResult {
  compliant: boolean;
  blocked_reasons: string[];
  warnings: string[];
  rr_values: number[];
}

export interface RankedOpportunity {
  status: string;
  ticker: string;
  direction: 'long' | 'short';
  setup_name: string;
  entry_signal: string;
  score: number;
  score_breakdown: {
    confidence_component: number;
    evidence_component: number;
    qualification_component: number;
    tape_component: number;
    rule1_component: number;
    missing_penalty: number;
  };
  exact_levels_or_zones_used: string[];
  why_it_qualifies_under_orbz_rules: string[];
  what_would_invalidate_it: string;
  confidence: number;
  missing_or_uncertain_evidence: string[];
  evidence: string[];
  rr_values: number[];
  warnings: string[];
  rank?: number;
}

export interface InternetInsightScoreBreakdown {
  relevance_component: number;
  reliability_component: number;
  recency_component: number;
  rule_alignment_component: number;
}

export interface RankedInternetInsight {
  insight_id: string;
  title: string;
  source_name: string;
  source_url: string;
  verification_status: 'verified' | 'rejected';
  confidence: number;
  score: number;
  score_breakdown: InternetInsightScoreBreakdown;
  status: 'rule_qualified' | 'blocked' | 'informational';
  reasons: string[];
  evidence_text: string;
  fetched_at: string;
  rank?: number;
}

export interface InternetIntelligenceFeed {
  batch_id: string;
  generated_at: string;
  rule_qualified: RankedInternetInsight[];
  blocked: RankedInternetInsight[];
  informational: RankedInternetInsight[];
}
