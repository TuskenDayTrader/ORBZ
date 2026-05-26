import type { InternetIntelligenceFeed, RankedInternetInsight } from '../types';

interface Props {
  feed: InternetIntelligenceFeed | null;
}

function InsightCard({ insight }: { insight: RankedInternetInsight }) {
  return (
    <div className="opportunity-card disqualified">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span className="badge badge-blue">{insight.rank ? `#${insight.rank} ` : ''}{insight.source_name}</span>
        <span className="badge badge-gray">score {insight.score.toFixed(1)}</span>
      </div>
      <div style={{ fontSize: 12, marginBottom: 4 }}>{insight.title}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
        confidence {(insight.confidence * 100).toFixed(0)}% · {insight.fetched_at}
      </div>
      <div style={{ fontSize: 11, marginBottom: 4 }}>
        <a href={insight.source_url} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)' }}>{insight.source_url}</a>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{insight.evidence_text}</div>
      {insight.reasons.map((reason, index) => (
        <div key={index} style={{ fontSize: 11, color: 'var(--amber)', paddingLeft: 8 }}>• {reason}</div>
      ))}
    </div>
  );
}

function InsightSection({
  title,
  bannerClass,
  items,
}: {
  title: string;
  bannerClass: string;
  items: RankedInternetInsight[];
}) {
  return (
    <div style={{ marginTop: 8 }}>
      <div className={`banner ${bannerClass}`}>{title} ({items.length})</div>
      {items.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>none</div>
      ) : (
        items.map(item => <InsightCard key={item.insight_id} insight={item} />)
      )}
    </div>
  );
}

export function InternetIntelligencePanel({ feed }: Props) {
  if (!feed) {
    return (
      <div className="panel">
        <div className="panel-title">Internet Intelligence Feed</div>
        <div style={{ color: 'var(--text-muted)' }}>No internet intelligence data loaded</div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-title">Internet Intelligence Feed — {feed.batch_id}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
        Generated: {feed.generated_at} · Rule-qualified signals are actionable; informational and blocked signals are context only.
      </div>

      <InsightSection title="Rule-Qualified" bannerClass="banner-green" items={feed.rule_qualified} />
      <InsightSection title="Blocked by Validation Gate" bannerClass="banner-red" items={feed.blocked} />
      <InsightSection title="Informational Only" bannerClass="banner-gray" items={feed.informational} />
    </div>
  );
}
