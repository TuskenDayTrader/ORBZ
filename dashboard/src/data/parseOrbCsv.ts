import type { CsvOrbRow } from '../types';

export function parseOrbCsv(raw: string): CsvOrbRow[] {
  const lines = raw.trim().split('\n');
  const rows: CsvOrbRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(',');
    if (parts.length < 4) continue;
    const date = parts[0].trim();
    const tf = parts[1].trim() as '15m' | '30m' | '60m';
    const orbh = parseInt(parts[2].trim(), 10);
    const orbl = parseInt(parts[3].trim(), 10);
    const notes = parts.slice(4).join(',').trim();
    rows.push({ date, tf, orbh, orbl, notes });
  }
  return rows;
}

export function getUniqueDates(rows: CsvOrbRow[]): string[] {
  const seen = new Set<string>();
  const dates: string[] = [];
  for (const row of rows) {
    if (!seen.has(row.date)) {
      seen.add(row.date);
      dates.push(row.date);
    }
  }
  return dates;
}

const INSTRUMENT_RANGES: Record<string, [number, number]> = {
  YM: [40000, 60000],
  NQ: [15000, 25000],
  ES: [4000, 7000],
  SPY: [300, 700],
};

export function validateInstrumentScale(instrument: string, level: number): boolean {
  const ticker = instrument.split(' ')[0].toUpperCase();
  const range = INSTRUMENT_RANGES[ticker];
  if (!range) return true;
  return level >= range[0] && level <= range[1];
}
