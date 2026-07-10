import { useState, useEffect } from 'react';
import './App.css';
import type { CsvOrbRow, InstrumentCode, NormalizedSession, OpportunityBatch, InternetIntelligenceFeed } from './types';
import { parseOrbCsv, getUniqueDates } from './data/parseOrbCsv';
import { SessionSelector } from './components/SessionSelector';
import { LevelsPanel } from './components/LevelsPanel';
import { LevelsChart } from './components/LevelsChart';
import { TapePanel } from './components/TapePanel';
import { RuleEnginePanel } from './components/RuleEnginePanel';
import { CompliancePanel } from './components/CompliancePanel';
import { ForecastPanel } from './components/ForecastPanel';
import { EventTimeline } from './components/EventTimeline';
import { InternetIntelligencePanel } from './components/InternetIntelligencePanel';

const INSTRUMENT_DETAILS: Record<InstrumentCode, { title: string; subtitle: string }> = {
  YM: {
    title: 'ORBZ DASHBOARD — YM FUTURES ANALYSIS',
    subtitle: 'Opening Range Breakout System · E-mini Dow (YM) · Real-Time Rule Engine · Compliance Verification',
  },
  NQ: {
    title: 'ORBZ DASHBOARD — NQ FUTURES ANALYSIS',
    subtitle: 'Opening Range Breakout System · E-mini Nasdaq-100 (NQ) · Real-Time Rule Engine · Compliance Verification',
  },
  ES: {
    title: 'ORBZ DASHBOARD — ES FUTURES ANALYSIS',
    subtitle: 'Opening Range Breakout System · E-mini S&P 500 (ES) · Real-Time Rule Engine · Compliance Verification',
  },
};

function App() {
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentCode>('YM');
  const [csvRows, setCsvRows] = useState<CsvOrbRow[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTf, setSelectedTf] = useState<'15m' | '30m' | '60m'>('15m');
  const [session, setSession] = useState<NormalizedSession | null>(null);
  const [batch, setBatch] = useState<OpportunityBatch | null>(null);
  const [internetFeed, setInternetFeed] = useState<InternetIntelligenceFeed | null>(null);

  useEffect(() => {
    const csvPath = `/data/${selectedInstrument.toLowerCase()}-orb-levels.csv`;

    fetch(csvPath)
      .then(r => {
        if (!r.ok) throw new Error(`CSV not found: ${csvPath}`);
        return r.text();
      })
      .then(raw => {
        const rows = parseOrbCsv(raw);
        setCsvRows(rows);
        const dates = getUniqueDates(rows);
        if (dates.length === 0) {
          setSession(null);
        }
        setSelectedDate(dates[dates.length - 1] ?? '');
      })
      .catch(error => {
        console.error(error);
        setCsvRows([]);
        setSelectedDate('');
        setSession(null);
      });
  }, [selectedInstrument]);

  useEffect(() => {
    fetch('/data/screenshot-opportunity-batch-v1.json')
      .then(r => r.json())
      .then(setBatch)
      .catch(console.error);

    fetch('/data/internet-intelligence-ranked-v1.json')
      .then(r => r.json())
      .then(setInternetFeed)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    const sessionId = `${selectedDate}-${selectedInstrument}`;
    fetch(`/data/sessions/${sessionId}.json`)
      .then(r => {
        if (!r.ok) throw new Error('Session not found');
        return r.json();
      })
      .then(setSession)
      .catch(() => setSession(null));
  }, [selectedDate, selectedInstrument]);

  const details = INSTRUMENT_DETAILS[selectedInstrument];

  return (
    <div className="app">
      <div className="app-header">
        <h1>{details.title}</h1>
        <div className="subtitle">{details.subtitle}</div>
      </div>

      <SessionSelector
        selectedInstrument={selectedInstrument}
        rows={csvRows}
        selectedDate={selectedDate}
        selectedTf={selectedTf}
        onInstrumentChange={setSelectedInstrument}
        onDateChange={setSelectedDate}
        onTfChange={setSelectedTf}
      />

      <div className="row">
        <LevelsPanel
          session={session}
          csvRows={csvRows}
          selectedDate={selectedDate}
          selectedTf={selectedTf}
          selectedInstrument={selectedInstrument}
        />
        <TapePanel session={session} />
      </div>

      <LevelsChart
        session={session}
        csvRows={csvRows}
        selectedDate={selectedDate}
        selectedTf={selectedTf}
        selectedInstrument={selectedInstrument}
      />

      <div className="row">
        <RuleEnginePanel session={session} />
        <CompliancePanel session={session} />
      </div>

      <ForecastPanel batch={batch} />

      <InternetIntelligencePanel feed={internetFeed} />

      <EventTimeline events={session?.events ?? []} />
    </div>
  );
}

export default App;
