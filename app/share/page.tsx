import { decodeDataFromUrl } from '@/lib/codec';
import type { CuratedItem } from '@/lib/types';

export default function SharePage({ searchParams }: { searchParams: { d?: string } }) {
  const items: CuratedItem[] = (() => {
    try { return decodeDataFromUrl(searchParams.d || '') as CuratedItem[]; } catch { return []; }
  })();

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="card" style={{ padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Shared Curation</h2>
        <p className="sub">A read-only view of curated cards.</p>
      </div>
      <div className="grid">
        {items.map((it) => (
          <article key={it.id} className="card" style={{ padding: 16, display: 'grid', gap: 10 }}>
            <div className="cardMeta"><span className="badge">{it.source}</span></div>
            <h3 className="cardTitle" style={{ margin: 0 }}>{it.title}</h3>
            <p className="cardExcerpt">{it.excerpt}</p>
            <a className="link" href={it.url} target="_blank" rel="noreferrer">Open</a>
          </article>
        ))}
        {items.length === 0 && (
          <div className="card" style={{ padding: 16 }}>
            <p>No items provided. Go back and curate first.</p>
          </div>
        )}
      </div>
    </div>
  );
}
