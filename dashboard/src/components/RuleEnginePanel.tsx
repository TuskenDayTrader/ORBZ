import type { NormalizedSession } from '../types';
import { evaluateRule1, evaluateRule2, evaluateRule3, evaluateRule4 } from '../engine/ruleEngine';

interface Props {
  session: NormalizedSession | null;
}

function formatTime(ts: string | null): string {
  if (!ts) return 'N/A';
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/New_York' }) + ' EST';
  } catch {
    return ts;
  }
}

export function RuleEnginePanel({ session }: Props) {
  if (!session) {
    return (
      <div className="panel">
        <div className="panel-title">Rule Engine</div>
        <div style={{ color: 'var(--text-muted)' }}>No session loaded</div>
      </div>
    );
  }

  const rule1 = evaluateRule1(session);
  const rule2 = evaluateRule2(session.tape);
  const rule3 = evaluateRule3(session.derived_flags);
  const rule4 = evaluateRule4(session.levels.vwap_ref, session.levels.orbl_15m);

  return (
    <div className="panel">
      <div className="panel-title">Rule Engine</div>

      <div style={{ marginBottom: 12 }}>
        {rule1.triggered && rule1.direction === 'bearish' && (
          <div className="banner banner-red" style={{ fontSize: 14, letterSpacing: 0.5 }}>
            🔴 RULE 1 BEARISH TRIGGERED
          </div>
        )}
        {rule1.triggered && rule1.direction === 'bullish' && (
          <div className="banner banner-green" style={{ fontSize: 14, letterSpacing: 0.5 }}>
            🟢 RULE 1 BULLISH TRIGGERED
          </div>
        )}
        {!rule1.triggered && (
          <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: '6px 0' }}>
            ⬜ No Rule 1 sequence active
          </div>
        )}

        {rule1.triggered && (
          <div style={{ marginTop: 6, fontSize: 11 }}>
            <div><span className="label">Entry Signal: </span><span style={{ color: 'var(--blue)' }}>{rule1.entry_signal}</span></div>
            <div><span className="label">Invalidation: </span><span style={{ color: 'var(--amber)' }}>{rule1.invalidation}</span></div>
            <div><span className="label">Trigger Time: </span><span style={{ color: 'var(--yellow)' }}>{formatTime(rule1.trigger_event_time)}</span></div>
            <div style={{ marginTop: 4 }}>
              {rule1.evidence.map((e, i) => (
                <span key={i} className="score-tag">{e}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="panel-title" style={{ marginTop: 8 }}>Rules Status</div>
      <div className="grid-2">
        <div className={`rule-status ${rule1.triggered ? (rule1.direction === 'bearish' ? 'active-bearish' : 'active-bullish') : 'inactive'}`}>
          <div style={{ fontWeight: 'bold', marginBottom: 2 }}>Rule 1 — ORB Sequence</div>
          <div>{rule1.triggered ? `${rule1.direction.toUpperCase()} TRIGGERED` : 'No sequence'}</div>
        </div>

        <div className={`rule-status ${rule2.regimeTag !== 'neutral' ? 'active-bearish' : 'inactive'}`}>
          <div style={{ fontWeight: 'bold', marginBottom: 2 }}>Rule 2 — Tape Regime</div>
          <div>{rule2.regimeTag === 'fade_ym_rallies' ? 'FADE YM RALLIES' : 'Neutral'}</div>
        </div>

        <div className={`rule-status ${rule3 ? 'active-warn' : 'inactive'}`}>
          <div style={{ fontWeight: 'bold', marginBottom: 2 }}>Rule 3 — Reversal Branch</div>
          <div>{rule3 ? 'BOTH BRANCHES REQUIRED' : 'Not triggered'}</div>
        </div>

        <div className={`rule-status ${rule4.pivotActive ? 'active-info' : 'inactive'}`}>
          <div style={{ fontWeight: 'bold', marginBottom: 2 }}>Rule 4 — VWAP/ORBL Pivot</div>
          <div>{rule4.pivotActive ? `ACTIVE @ ${rule4.pivotLevel.toLocaleString()}` : 'Inactive'}</div>
        </div>
      </div>
    </div>
  );
}
