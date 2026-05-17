import type { OpportunityBatch, RankedOpportunity } from '../types';
import { rankOpportunities } from '../engine/opportunityRanker';

interface Props {
  batch: OpportunityBatch | null;
}

interface DisqualifiedItem {
  ticker: string;
  direction: string;
  setup_name: string;
  reasons: string[];
}

function OpportunityCard({ opp }: { opp: RankedOpportunity }) {
  const isLong = opp.direction === 'long';
  return (
    <div className={`opportunity-card ${isLong ? 'long' : 'short'}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <span className={`badge ${isLong ? 'badge-green' : 'badge-red'}`}>
            {opp.rank ? `#${opp.rank} ` : ''}{isLong ? '▲ LONG' : '▼ SHORT'} — {opp.ticker}
          </span>
          <span style={{ marginLeft: 8, color: 'var(--text)', fontWeight: 'bold', fontSize: 13 }}>
            {opp.setup_name}
          </span>
        </div>
        <span className="badge badge-blue">Score: {opp.score.toFixed(1)}</span>
      </div>

      <div style={{ fontSize: 11, marginBottom: 6 }}>
        <span className="score-tag">conf: {(opp.confidence * 100).toFixed(0)}% → {opp.score_breakdown.confidence_component.toFixed(1)}pts</span>
        <span className="score-tag">evidence: +{opp.score_breakdown.evidence_component}</span>
        <span className="score-tag">qualified: +{opp.score_breakdown.qualification_component}</span>
        <span className="score-tag">tape: +{opp.score_breakdown.tape_component}</span>
        <span className="score-tag">rule1: +{opp.score_breakdown.rule1_component}</span>
        {opp.score_breakdown.missing_penalty > 0 && (
          <span className="score-tag" style={{ color: 'var(--red)' }}>penalty: -{opp.score_breakdown.missing_penalty}</span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
        <div>
          <div className="label">Entry Signal</div>
          <div style={{ color: 'var(--blue)' }}>{opp.entry_signal}</div>
        </div>
        <div>
          <div className="label">Invalidation</div>
          <div style={{ color: 'var(--amber)' }}>{opp.what_would_invalidate_it}</div>
        </div>
      </div>

      {opp.exact_levels_or_zones_used.length > 0 && (
        <div style={{ marginTop: 6, fontSize: 11 }}>
          <span className="label">Levels: </span>
          {opp.exact_levels_or_zones_used.map((l, i) => (
            <span key={i} className="score-tag" style={{ color: 'var(--yellow)' }}>{l}</span>
          ))}
        </div>
      )}

      {opp.rr_values.length > 0 && (
        <div style={{ marginTop: 6, fontSize: 11 }}>
          <span className="label">R:R — </span>
          {opp.rr_values.map((rr, i) => (
            <span key={i} style={{ marginRight: 8 }}>
              TP{i + 1}: <span className={rr >= 2.0 ? 'rr-green' : rr >= 1.5 ? 'rr-yellow' : 'rr-red'}>{rr.toFixed(2)}R</span>
            </span>
          ))}
        </div>
      )}

      {opp.evidence.length > 0 && (
        <div style={{ marginTop: 6 }}>
          <div className="label" style={{ marginBottom: 3 }}>Evidence:</div>
          {opp.evidence.map((e, i) => (
            <div key={i} style={{ fontSize: 11, color: 'var(--text-muted)', paddingLeft: 8 }}>• {e}</div>
          ))}
        </div>
      )}

      {opp.warnings.length > 0 && (
        <div style={{ marginTop: 6 }}>
          {opp.warnings.map((w, i) => (
            <div key={i} style={{ color: 'var(--amber)', fontSize: 11 }}>⚠ {w}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function DisqualifiedCard({ item }: { item: DisqualifiedItem }) {
  return (
    <div className="opportunity-card disqualified">
      <div style={{ marginBottom: 4 }}>
        <span className="badge badge-gray">❌ {item.direction.toUpperCase()} — {item.ticker}</span>
        <span style={{ marginLeft: 8, color: 'var(--text-muted)', fontSize: 12 }}>{item.setup_name}</span>
      </div>
      {item.reasons.map((r, i) => (
        <div key={i} style={{ fontSize: 11, color: 'var(--text-muted)', paddingLeft: 8 }}>• {r}</div>
      ))}
    </div>
  );
}

export function ForecastPanel({ batch }: Props) {
  if (!batch) {
    return (
      <div className="panel">
        <div className="panel-title">Forecast / Ranked Opportunities</div>
        <div style={{ color: 'var(--text-muted)' }}>No batch data loaded</div>
      </div>
    );
  }

  const { ranked, disqualified } = rankOpportunities(batch);

  return (
    <div className="panel">
      <div className="panel-title">Forecast / Ranked Opportunities — {batch.batch_id}</div>

      {ranked.length === 0 && (
        <div className="banner banner-amber">No qualified opportunities in this batch</div>
      )}

      {ranked.map((opp, i) => (
        <OpportunityCard key={i} opp={opp} />
      ))}

      {disqualified.length > 0 && (
        <>
          <div className="panel-title" style={{ marginTop: 12 }}>Disqualified</div>
          {disqualified.map((item, i) => (
            <DisqualifiedCard key={i} item={item} />
          ))}
        </>
      )}
    </div>
  );
}
