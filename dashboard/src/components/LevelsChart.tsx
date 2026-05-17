import {
  ComposedChart, ReferenceLine, CartesianGrid,
  YAxis, XAxis, ResponsiveContainer, ReferenceArea, Tooltip
} from 'recharts';
import type { NormalizedSession, CsvOrbRow } from '../types';

interface Props {
  session: NormalizedSession | null;
  csvRows: CsvOrbRow[];
  selectedDate: string;
  selectedTf: '15m' | '30m' | '60m';
}

export function LevelsChart({ session, csvRows, selectedDate, selectedTf }: Props) {
  const csvRow = csvRows.find(r => r.date === selectedDate && r.tf === selectedTf);

  if (!session && !csvRow) {
    return (
      <div className="panel">
        <div className="panel-title">Levels Chart</div>
        <div style={{ color: 'var(--text-muted)', padding: 20, textAlign: 'center' }}>No data available</div>
      </div>
    );
  }

  const ibh = session?.levels.ibh;
  const ibl = session?.levels.ibl;
  const vwap = session?.levels.vwap_ref;
  const orbh = csvRow?.orbh;
  const orbl = csvRow?.orbl;

  const allValues = [ibh, ibl, vwap, orbh, orbl].filter((v): v is number => v !== undefined);
  if (allValues.length === 0) return null;

  const minVal = Math.min(...allValues) - 100;
  const maxVal = Math.max(...allValues) + 100;
  const mid = (minVal + maxVal) / 2;

  const data = [{ x: 0, y: minVal }, { x: 1, y: mid }, { x: 2, y: maxVal }];

  const parseZone = (zone: string): [number, number] | null => {
    const clean = zone.replace(/\s/g, '');
    if (clean.includes('-')) {
      const parts = clean.split('-').map(Number);
      return [Math.min(...parts), Math.max(...parts)];
    }
    if (clean.includes('/')) {
      const parts = clean.split('/').map(Number);
      return [Math.min(...parts), Math.max(...parts)];
    }
    const v = Number(clean);
    return isNaN(v) ? null : [v - 2, v + 2];
  };

  return (
    <div className="panel">
      <div className="panel-title">Levels Chart — {selectedDate} ({selectedTf})</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        {orbh && <span className="badge badge-red">ORBH {orbh.toLocaleString()}</span>}
        {orbl && <span className="badge badge-amber">ORBL {orbl.toLocaleString()}</span>}
        {ibh && <span className="badge badge-red">IBH {ibh.toLocaleString()}</span>}
        {ibl && <span className="badge badge-amber">IBL {ibl.toLocaleString()}</span>}
        {vwap && <span className="badge badge-yellow">VWAP {vwap.toLocaleString()}</span>}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" vertical={false} />
          <XAxis dataKey="x" hide />
          <YAxis
            domain={[minVal, maxVal]}
            tickFormatter={(v: number) => v.toLocaleString()}
            stroke="#2a2d3a"
            tick={{ fill: '#8a90a8', fontSize: 10 }}
            width={65}
          />
          <Tooltip
            formatter={(v: unknown) => String(v)}
            contentStyle={{ background: '#151820', border: '1px solid #2a2d3a', color: '#e0e4ef', fontSize: 11 }}
          />

          {session?.levels.support_zones.map((zone, i) => {
            const parsed = parseZone(zone);
            if (!parsed) return null;
            return (
              <ReferenceArea
                key={`sup-${i}`}
                y1={parsed[0]}
                y2={parsed[1]}
                fill="rgba(0,230,118,0.08)"
                stroke="rgba(0,230,118,0.3)"
                strokeWidth={1}
              />
            );
          })}

          {session?.levels.resistance_zones.map((zone, i) => {
            const parsed = parseZone(zone);
            if (!parsed) return null;
            return (
              <ReferenceArea
                key={`res-${i}`}
                y1={parsed[0]}
                y2={parsed[1]}
                fill="rgba(255,82,82,0.08)"
                stroke="rgba(255,82,82,0.3)"
                strokeWidth={1}
              />
            );
          })}

          {orbh && (
            <ReferenceLine y={orbh} stroke="#ff5252" strokeDasharray="6 3" strokeWidth={2}
              label={{ value: `ORBH ${orbh.toLocaleString()}`, position: 'right', fill: '#ff5252', fontSize: 10 }} />
          )}
          {orbl && (
            <ReferenceLine y={orbl} stroke="#ffab40" strokeDasharray="6 3" strokeWidth={2}
              label={{ value: `ORBL ${orbl.toLocaleString()}`, position: 'right', fill: '#ffab40', fontSize: 10 }} />
          )}
          {ibh && ibh !== orbh && (
            <ReferenceLine y={ibh} stroke="#ff5252" strokeWidth={2}
              label={{ value: `IBH ${ibh.toLocaleString()}`, position: 'right', fill: '#ff5252', fontSize: 10 }} />
          )}
          {ibl && ibl !== orbl && (
            <ReferenceLine y={ibl} stroke="#ffab40" strokeWidth={2}
              label={{ value: `IBL ${ibl.toLocaleString()}`, position: 'right', fill: '#ffab40', fontSize: 10 }} />
          )}
          {vwap && (
            <ReferenceLine y={vwap} stroke="#ffd740" strokeWidth={2}
              label={{ value: `VWAP ${vwap.toLocaleString()}`, position: 'right', fill: '#ffd740', fontSize: 10 }} />
          )}
        </ComposedChart>
      </ResponsiveContainer>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
        <span style={{ color: 'rgba(0,230,118,0.7)' }}>■</span> Support zones &nbsp;
        <span style={{ color: 'rgba(255,82,82,0.7)' }}>■</span> Resistance zones
      </div>
    </div>
  );
}
