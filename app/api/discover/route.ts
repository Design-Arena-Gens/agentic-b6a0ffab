import { NextResponse } from 'next/server';
import type { CuratedItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').slice(0, 120);
  if (!q) {
    return NextResponse.json({ items: [] satisfies CuratedItem[] });
  }

  const hnUrl = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&hitsPerPage=10`;
  const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srsearch=${encodeURIComponent(q)}&srlimit=10&origin=*`;

  try {
    const [hnRes, wikiRes] = await Promise.all([
      fetch(hnUrl, { next: { revalidate: 300 } }),
      fetch(wikiUrl, { next: { revalidate: 300 } })
    ]);

    const hnJson: any = await hnRes.json();
    const wikiJson: any = await wikiRes.json();

    const hnItems: CuratedItem[] = (hnJson.hits || []).map((h: any) => ({
      id: `hn_${h.objectID}`,
      source: 'Hacker News',
      title: h.title || h.story_title || 'Untitled',
      url: h.url || h.story_url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      excerpt: (h._highlightResult?.comment_text?.value || h._highlightResult?.story_text?.value || h._highlightResult?.title?.value || '').replace(/<[^>]+>/g, '').slice(0, 220)
    }));

    const wikiItems: CuratedItem[] = ((wikiJson.query?.search) || []).map((w: any) => ({
      id: `wiki_${w.pageid}`,
      source: 'Wikipedia',
      title: w.title,
      url: `https://en.wikipedia.org/?curid=${w.pageid}`,
      excerpt: (w.snippet || '').replace(/<[^>]+>/g, '').slice(0, 220)
    }));

    const combined = [...hnItems, ...wikiItems].filter((it) => !!it.title && !!it.url);

    return NextResponse.json({ items: combined });
  } catch (e) {
    return NextResponse.json({ items: [] as CuratedItem[] }, { status: 500 });
  }
}
