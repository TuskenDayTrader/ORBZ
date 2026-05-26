import { useState, useEffect } from 'react';
import './App.css';
import type { CsvOrbRow, NormalizedSession, OpportunityBatch, InternetIntelligenceFeed } from './types';
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

function App() {
  const [csvRows, setCsvRows] = useState<CsvOrbRow[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTf, setSelectedTf] = useState<'15m' | '30m' | '60m'>('15m');
  const [session, setSession] = useState<NormalizedSession | null>(null);
  const [batch, setBatch] = useState<OpportunityBatch | null>(null);
  const [internetFeed, setInternetFeed] = useState<InternetIntelligenceFeed | null>(null);

  useEffect(() => {
    fetch('/data/ym-orb-levels.csv')
      .then(r => r.text())
      .then(raw => {
        const rows = parseOrbCsv(raw);
        setCsvRows(rows);
        const dates = getUniqueDates(rows);
        if (dates.length > 0) {
          setSelectedDate(dates[dates.length - 1]);
        }
      })
      .catch(console.error);

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
    const sessionId = `${selectedDate}-YM`;
    fetch(`/data/sessions/${sessionId}.json`)
      .then(r => {
        if (!r.ok) throw new Error('Session not found');
        return r.json();
      })
      .then(setSession)
      .catch(() => setSession(null));
  }, [selectedDate]);

  return (
    <div className="app">
      <div className="app-header">
        <h1>ORBZ DASHBOARD — YM FUTURES ANALYSIS</h1>
        <div className="subtitle">Opening Range Breakout System · Real-Time Rule Engine · Compliance Verification</div>
      </div>

      <SessionSelector
        rows={csvRows}
        selectedDate={selectedDate}
        selectedTf={selectedTf}
        onDateChange={setSelectedDate}
        onTfChange={setSelectedTf}
      />

      <div className="row">
        <LevelsPanel session={session} csvRows={csvRows} selectedDate={selectedDate} selectedTf={selectedTf} />
        <TapePanel session={session} />
      </div>

      <LevelsChart session={session} csvRows={csvRows} selectedDate={selectedDate} selectedTf={selectedTf} />

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
