import type { SessionEvent } from '../types';

interface Props {
  events: SessionEvent[];
}

function formatTime(ts: string): string {
  try {
    const d = new Date(ts);
    const h = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/New_York' });
    return h + ' EST';
  } catch {
    return ts;
  }
}

function formatEventType(et: string): string {
  return et.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function eventTypeColor(et: string): string {
  if (et.includes('ibh_rejection') || et.includes('ibh_wick')) return 'var(--red)';
  if (et.includes('vwap_orbl_loss')) return 'var(--amber)';
  if (et.includes('support_test')) return 'var(--green)';
  if (et.includes('vwap_reclaim') || et.includes('ibl_rejection')) return '#7cfc00';
  return 'var(--blue)';
}

export function EventTimeline({ events }: Props) {
  if (!events || events.length === 0) {
    return (
      <div className="panel">
        <div className="panel-title">Event Timeline</div>
        <div style={{ color: 'var(--text-muted)' }}>No events</div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-title">Event Timeline</div>
      <div style={{ maxHeight: 280, overflowY: 'auto' }}>
        {events.map((evt, i) => (
          <div key={i} className="timeline-item">
            <div className="timeline-time">{formatTime(evt.timestamp_est)}</div>
            <div className="timeline-type" style={{ color: eventTypeColor(evt.event_type) }}>
              {formatEventType(evt.event_type)}
            </div>
            <div className="timeline-level">{evt.level.toLocaleString()}</div>
            <div className="timeline-note">{evt.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
