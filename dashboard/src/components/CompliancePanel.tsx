import { useState } from 'react';
import type { NormalizedSession, TradeIntent, ExternalProgramRules } from '../types';
import { evaluateCompliance } from '../engine/ruleEngine';

interface Props {
  session: NormalizedSession | null;
}

export function CompliancePanel({ session }: Props) {
  const defaultIntent = session?.trade_intent;

  const [direction, setDirection] = useState<'long' | 'short'>(defaultIntent?.direction ?? 'short');
  const [entryPrice, setEntryPrice] = useState(String(defaultIntent?.entry_price ?? ''));
  const [stopLoss, setStopLoss] = useState(String(defaultIntent?.stop_loss ?? ''));
  const [tp1, setTp1] = useState(String(defaultIntent?.take_profits?.[0] ?? ''));
  const [tp2, setTp2] = useState(String(defaultIntent?.take_profits?.[1] ?? ''));
  const [tp3, setTp3] = useState(String(defaultIntent?.take_profits?.[2] ?? ''));
  const [accountSize, setAccountSize] = useState(String(defaultIntent?.account_size ?? 50000));
  const [riskDollars, setRiskDollars] = useState(String(defaultIntent?.risk_dollars ?? 125));
  const [contracts, setContracts] = useState(String(defaultIntent?.contracts ?? 1));
  const [entryZoneType, setEntryZoneType] = useState(defaultIntent?.entry_zone_type ?? 'session_edge');
  const [result, setResult] = useState<ReturnType<typeof evaluateCompliance> | null>(null);

  if (!session) {
    return (
      <div className="panel">
        <div className="panel-title">Compliance Checker</div>
        <div style={{ color: 'var(--text-muted)' }}>No session loaded</div>
      </div>
    );
  }

  const handleEvaluate = () => {
    const tps = [tp1, tp2, tp3]
      .filter(Boolean)
      .map(Number)
      .filter(v => !isNaN(v));

    const intent: TradeIntent = {
      direction,
      entry_price: Number(entryPrice),
      stop_loss: Number(stopLoss),
      take_profits: tps,
      order_is_bracket: true,
      entry_zone_type: entryZoneType,
      discretionary_override: false,
      tape_confirmed: session.trade_intent.tape_confirmed,
      account_size: Number(accountSize),
      risk_dollars: Number(riskDollars),
      contracts: Number(contracts),
      move_stop_to_breakeven_after_points: 35,
      scaling_allowed_by_program: session.trade_intent.scaling_allowed_by_program,
      max_contracts_allowed: session.trade_intent.max_contracts_allowed,
    };

    const externalRules: ExternalProgramRules = session.external_program_rules;
    const mockSession = { ...session, trade_intent: intent, external_program_rules: externalRules };
    setResult(evaluateCompliance(mockSession));
  };

  const risk = direction === 'long'
    ? Number(entryPrice) - Number(stopLoss)
    : Number(stopLoss) - Number(entryPrice);

  const getRrColor = (rr: number) => rr >= 2.0 ? 'rr-green' : rr >= 1.5 ? 'rr-yellow' : 'rr-red';

  return (
    <div className="panel">
      <div className="panel-title">Compliance Checker</div>

      <div style={{ marginBottom: 10 }}>
        <div className="form-row">
          <label>Direction</label>
          <select value={direction} onChange={e => setDirection(e.target.value as 'long' | 'short')}>
            <option value="short">SHORT</option>
            <option value="long">LONG</option>
          </select>
        </div>
        <div className="form-row">
          <label>Entry Zone Type</label>
          <select value={entryZoneType} onChange={e => setEntryZoneType(e.target.value)}>
            <option value="session_edge">session_edge</option>
            <option value="support_edge">support_edge</option>
            <option value="resistance_edge">resistance_edge</option>
            <option value="midrange">midrange</option>
          </select>
        </div>
        <div className="form-row">
          <label>Entry Price</label>
          <input type="number" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} />
        </div>
        <div className="form-row">
          <label>Stop Loss</label>
          <input type="number" value={stopLoss} onChange={e => setStopLoss(e.target.value)} />
        </div>
        <div className="form-row">
          <label>TP1</label>
          <input type="number" value={tp1} onChange={e => setTp1(e.target.value)} />
        </div>
        <div className="form-row">
          <label>TP2</label>
          <input type="number" value={tp2} onChange={e => setTp2(e.target.value)} />
        </div>
        <div className="form-row">
          <label>TP3 (optional)</label>
          <input type="number" value={tp3} onChange={e => setTp3(e.target.value)} placeholder="optional" />
        </div>
        <div className="form-row">
          <label>Account Size ($)</label>
          <input type="number" value={accountSize} onChange={e => setAccountSize(e.target.value)} />
        </div>
        <div className="form-row">
          <label>Risk ($)</label>
          <input type="number" value={riskDollars} onChange={e => setRiskDollars(e.target.value)} />
        </div>
        <div className="form-row">
          <label>Contracts</label>
          <input type="number" value={contracts} onChange={e => setContracts(e.target.value)} min={1} />
        </div>
        <div style={{ marginTop: 8 }}>
          <button onClick={handleEvaluate}>EVALUATE COMPLIANCE</button>
          {risk > 0 && (
            <span style={{ marginLeft: 12, fontSize: 11, color: 'var(--text-muted)' }}>
              Risk/unit: <span style={{ color: 'var(--yellow)' }}>{risk.toLocaleString()} pts</span>
              {' '} Max allowed: <span style={{ color: 'var(--amber)' }}>${(Number(accountSize) * 0.0025).toFixed(2)}</span>
            </span>
          )}
        </div>
      </div>

      {result && (
        <div style={{ marginTop: 10 }}>
          {result.compliant ? (
            <div className="banner banner-green" style={{ fontSize: 14 }}>✅ COMPLIANT</div>
          ) : (
            <div className="banner banner-red" style={{ fontSize: 14 }}>❌ BLOCKED</div>
          )}

          {result.blocked_reasons.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ color: 'var(--red)', fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>BLOCKED REASONS:</div>
              {result.blocked_reasons.map((r, i) => (
                <div key={i} style={{ color: 'var(--red)', fontSize: 11, paddingLeft: 8, marginBottom: 2 }}>• {r}</div>
              ))}
            </div>
          )}

          {result.warnings.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ color: 'var(--amber)', fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>WARNINGS:</div>
              {result.warnings.map((w, i) => (
                <div key={i} style={{ color: 'var(--amber)', fontSize: 11, paddingLeft: 8, marginBottom: 2 }}>⚠ {w}</div>
              ))}
            </div>
          )}

          {result.rr_values.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 4 }}>R:R RATIOS:</div>
              {result.rr_values.map((rr, i) => (
                <div key={i} style={{ fontSize: 12, paddingLeft: 8, marginBottom: 2 }}>
                  <span className="label">TP{i + 1}: </span>
                  <span className={getRrColor(rr)}>{rr.toFixed(2)}R</span>
                  {rr >= 2.0 && <span style={{ color: 'var(--green)', marginLeft: 6, fontSize: 10 }}>✅ ≥2.0R</span>}
                  {rr >= 1.5 && rr < 2.0 && <span style={{ color: 'var(--yellow)', marginLeft: 6, fontSize: 10 }}>⚠ ≥1.5R</span>}
                  {rr < 1.5 && <span style={{ color: 'var(--red)', marginLeft: 6, fontSize: 10 }}>❌ &lt;1.5R</span>}
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
            Breakeven: +35 pts — Bracket order: Entry → Stop → TP1{result.rr_values.length > 1 ? ' → TP2' : ''}{result.rr_values.length > 2 ? ' → TP3' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
