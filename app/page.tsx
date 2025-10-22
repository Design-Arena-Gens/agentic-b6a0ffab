"use client";
import { useMemo, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { encodeDataForUrl, decodeDataFromUrl } from '@/lib/codec';
import type { CuratedItem } from '@/lib/types';

type DiscoverResponse = { items: CuratedItem[] };

export default function HomePage() {
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [items, setItems] = useState<CuratedItem[]>([]);
  const [index, setIndex] = useState<number>(0);
  const [selected, setSelected] = useState<CuratedItem[]>([]);
  const [messages, setMessages] = useState<{ role: 'system' | 'assistant' | 'user'; content: string }[]>([
    { role: 'assistant', content: 'Tell me what you want to discover. I will search and curate.' }
  ]);

  const current = items[index];

  const fetchResults = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/discover?q=${encodeURIComponent(q)}`);
      const data: DiscoverResponse = await res.json();
      setItems(data.items);
      setIndex(0);
      setSelected([]);
      setMessages((prev) => [...prev, { role: 'assistant', content: `I found ${data.items.length} items for "${q}". Swipe to curate.` }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'There was an error discovering content.' }]);
    } finally {
      setLoading(false);
    }
  }, []);

  const onSubmit = useCallback(async () => {
    if (!query.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', content: query }]);
    // simple autonomous expansion: search the full phrase first
    await fetchResults(query.trim());
  }, [query, fetchResults]);

  const swipe = useCallback((accept: boolean) => {
    if (!current) return;
    if (accept) {
      setSelected((prev) => [...prev, current]);
    }
    setIndex((i) => i + 1);
  }, [current]);

  const shareUrl = useMemo(() => {
    if (selected.length === 0) return '';
    const d = encodeDataForUrl(selected);
    return `/share?d=${encodeURIComponent(d)}`;
  }, [selected]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') swipe(false);
      if (e.key === 'ArrowRight') swipe(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [swipe]);

  return (
    <div>
      <div className="card inputRow">
        <input
          className="input"
          placeholder="e.g. AI agents for product management"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        />
        <button className="button" onClick={onSubmit} disabled={loading}>{loading ? 'Searching…' : 'Discover'}</button>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'grid', gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ color: m.role === 'user' ? '#c7f9cc' : '#c9d4e5' }}>
                <span className="badge">{m.role}</span> {m.content}
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div className="shareRow" style={{ justifyContent: 'space-between' }}>
            <div className="shareRow" style={{ gap: 8 }}>
              <span className="badge">selected</span>
              <strong>{selected.length}</strong>
            </div>
            <div className="shareRow">
              <Link className="link" href={shareUrl || '#'} onClick={(e) => { if (!shareUrl) e.preventDefault(); }}>Share curated link</Link>
            </div>
          </div>
        </div>

        <div className="deck">
          {loading && (
            <div className="cardItem" style={{ alignItems: 'center', justifyContent: 'center' }}>
              <div className="spinner" />
            </div>
          )}

          {!loading && current && (
            <div className="cardItem">
              <div className="card cardInner">
                <div>
                  <div className="cardMeta">
                    <span className="badge">{current.source}</span>
                    <span className="badge">{index + 1} / {items.length}</span>
                  </div>
                  <h3 className="cardTitle">{current.title}</h3>
                </div>
                <div>
                  <p className="cardExcerpt">{current.excerpt}</p>
                </div>
                <div>
                  <div className="actions">
                    <button className="actionBtn reject" onClick={() => swipe(false)}>Skip ⬅</button>
                    <a className="actionBtn" href={current.url} target="_blank" rel="noreferrer">Open Link</a>
                    <button className="actionBtn accept" onClick={() => swipe(true)}>Keep ➡</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && !current && (
            <div className="cardItem">
              <div className="card cardInner" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <h3 className="cardTitle">{items.length ? 'You reached the end' : 'No results yet'}</h3>
                  <p className="cardExcerpt">{items.length ? 'Share your curated set or try another query.' : 'Start with a topic to discover content to curate.'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
