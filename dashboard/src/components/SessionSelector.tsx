import type { CsvOrbRow, InstrumentCode } from '../types';
import { getUniqueDates } from '../data/parseOrbCsv';

interface Props {
  selectedInstrument: InstrumentCode;
  rows: CsvOrbRow[];
  selectedDate: string;
  selectedTf: '15m' | '30m' | '60m';
  onInstrumentChange: (instrument: InstrumentCode) => void;
  onDateChange: (date: string) => void;
  onTfChange: (tf: '15m' | '30m' | '60m') => void;
}

const INSTRUMENTS: InstrumentCode[] = ['YM', 'NQ', 'ES'];

export function SessionSelector({
  selectedInstrument,
  rows,
  selectedDate,
  selectedTf,
  onInstrumentChange,
  onDateChange,
  onTfChange,
}: Props) {
  const dates = getUniqueDates(rows);

  return (
    <div className="panel">
      <div className="panel-title">Session Selector</div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>INSTRUMENT</span>
          {INSTRUMENTS.map(instrument => (
            <button
              key={instrument}
              className={`tf-button${selectedInstrument === instrument ? ' active' : ''}`}
              onClick={() => onInstrumentChange(instrument)}
            >{instrument}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ color: 'var(--text-muted)', fontSize: 11, whiteSpace: 'nowrap' }}>DATE</label>
          <select
            value={selectedDate}
            onChange={e => onDateChange(e.target.value)}
            style={{ width: 160 }}
          >
            {dates.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>TIMEFRAME</span>
          {(['15m', '30m', '60m'] as const).map(tf => (
            <button
              key={tf}
              className={`tf-button${selectedTf === tf ? ' active' : ''}`}
              onClick={() => onTfChange(tf)}
            >{tf}</button>
          ))}
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: 11, marginLeft: 8 }}>
          Selected: <span style={{ color: 'var(--green)' }}>{selectedInstrument}</span>
          {' '}<span style={{ color: 'var(--yellow)' }}>{selectedDate}</span>
          {' '}<span style={{ color: 'var(--blue)' }}>{selectedTf}</span>
        </span>
      </div>
    </div>
  );
}
