import type { NormalizedSession, CsvOrbRow } from '../types';
import { validateInstrumentScale } from '../data/parseOrbCsv';

interface Props {
  session: NormalizedSession | null;
  csvRows: CsvOrbRow[];
  selectedDate: string;
  selectedTf: '15m' | '30m' | '60m';
}

function fmt(n: number | undefined): string {
  if (n === undefined || isNaN(n)) return '—';
  return n.toLocaleString('en-US');
}

export function LevelsPanel({ session, csvRows, selectedDate, selectedTf }: Props) {
  const csvRow = csvRows.find(r => r.date === selectedDate && r.tf === selectedTf);
  const instrument = session?.instrument ?? 'YM JUN26';

  const allLevels = session
    ? [session.levels.ibh, session.levels.ibl, session.levels.vwap_ref,
       csvRow?.orbh, csvRow?.orbl].filter((v): v is number => v !== undefined)
    : [];

  const scaleError = allLevels.some(v => !validateInstrumentScale(instrument, v));

  return (
    <div className="panel">
      <div className="panel-title">Key Levels — {instrument} ({selectedTf})</div>
      {scaleError && (
        <div className="banner banner-red">⚠ PRICE SCALE MISMATCH — check instrument setting</div>
      )}
      <table>
        <thead>
          <tr>
            <th>Level</th>
            <th>Value</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="label">ORBH ({selectedTf})</td>
            <td className="price">{csvRow ? fmt(csvRow.orbh) : '—'}</td>
            <td className="label">CSV</td>
          </tr>
          <tr>
            <td className="label">ORBL ({selectedTf})</td>
            <td className="price">{csvRow ? fmt(csvRow.orbl) : '—'}</td>
            <td className="label">CSV</td>
          </tr>
          <tr>
            <td className="label">IBH</td>
            <td className="price">{session ? fmt(session.levels.ibh) : '—'}</td>
            <td className="label">Session JSON</td>
          </tr>
          <tr>
            <td className="label">IBL</td>
            <td className="price">{session ? fmt(session.levels.ibl) : '—'}</td>
            <td className="label">Session JSON</td>
          </tr>
          <tr>
            <td className="label">VWAP/ORBL Pivot</td>
            <td className="price">{session ? fmt(session.levels.vwap_ref) : '—'}</td>
            <td className="label">Session JSON</td>
          </tr>
          {session && (
            <>
              <tr>
                <td className="label">Support Zones</td>
                <td style={{ color: 'var(--green)', fontSize: 11 }}>
                  {session.levels.support_zones.join(' | ')}
                </td>
                <td className="label">Session JSON</td>
              </tr>
              <tr>
                <td className="label">Resistance Zones</td>
                <td style={{ color: 'var(--red)', fontSize: 11 }}>
                  {session.levels.resistance_zones.join(' | ')}
                </td>
                <td className="label">Session JSON</td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
