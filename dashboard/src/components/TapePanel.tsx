import type { NormalizedSession } from '../types';
import { evaluateRule2, evaluateRule3, evaluateRule4 } from '../engine/ruleEngine';

interface Props {
  session: NormalizedSession | null;
}

export function TapePanel({ session }: Props) {
  if (!session) {
    return (
      <div className="panel">
        <div className="panel-title">Tape / Macro Context</div>
        <div style={{ color: 'var(--text-muted)' }}>No session loaded</div>
      </div>
    );
  }

  const tape = session.tape;
  const rule2 = evaluateRule2(tape);
  const rule3 = evaluateRule3(session.derived_flags);
  const rule4 = evaluateRule4(session.levels.vwap_ref, session.levels.orbl_15m);

  const tapeItems: Array<{ label: string; value: boolean }> = [
    { label: 'NQ New HOD', value: tape.nq_new_hod },
    { label: 'YM Lagging', value: tape.ym_lagging },
    { label: 'RTY Lagging', value: tape.rty_lagging },
    { label: 'DXY Firming', value: tape.dxy_firming },
    { label: 'TLT Weakening', value: tape.tlt_weakening },
  ];

  return (
    <div className="panel">
      <div className="panel-title">Tape / Macro Context</div>

      <div style={{ marginBottom: 10 }}>
        <div
          className={`banner ${rule2.regimeTag === 'fade_ym_rallies' ? 'banner-red' : 'banner-gray'}`}
          style={{ fontSize: 13, letterSpacing: 1 }}
        >
          REGIME: {rule2.regimeTag === 'fade_ym_rallies' ? '🔴 FADE YM RALLIES' : '⬜ NEUTRAL'}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{rule2.description}</div>
      </div>

      {rule3 && (
        <div className="banner banner-amber" style={{ marginBottom: 8 }}>
          ⚠️ PRE-MARKET: BOTH LONG &amp; SHORT BRANCHES REQUIRED
        </div>
      )}

      {rule4.pivotActive && (
        <div className="banner banner-yellow" style={{ marginBottom: 8 }}>
          ⚡ VWAP/ORBL PIVOT ACTIVE — High Alert Zone ({rule4.pivotLevel.toLocaleString()})
        </div>
      )}

      <table>
        <tbody>
          {tapeItems.map(({ label, value }) => (
            <tr key={label}>
              <td className="label">{label}</td>
              <td>
                <span className={value ? 'check' : 'cross'}>{value ? '✅' : '❌'}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
