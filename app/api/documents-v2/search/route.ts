import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const MAX_QUERY_LEN = 200;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

// Sentinels we wrap matches in inside ts_headline output. The client HTML-escapes
// the snippet then replaces these with <mark>/</mark>. Keeps user text safe.
const MARK_OPEN = '«MARK»';
const MARK_CLOSE = '«/MARK»';

interface SearchRow {
  slug: string;
  title_i18n: Record<string, string> | null;
  lang: string;
  page_number: number;
  filename: string;
  snippet: string;
  rank: number;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') ?? '').trim();
  const slug = url.searchParams.get('slug') || null;
  const langParam = url.searchParams.get('lang');
  const lang = langParam && langParam.length > 0 ? langParam : null;
  const scopeParam = url.searchParams.get('scope');
  const scope: 'doc' | 'all' =
    scopeParam === 'all' ? 'all' : scopeParam === 'doc' ? 'doc' : slug ? 'doc' : 'all';
  const limitRaw = Number.parseInt(url.searchParams.get('limit') ?? '', 10);
  const limit = Number.isFinite(limitRaw)
    ? Math.max(1, Math.min(MAX_LIMIT, limitRaw))
    : DEFAULT_LIMIT;

  if (!q) {
    return NextResponse.json({ ok: true, query: '', results: [], total: 0 });
  }
  if (q.length > MAX_QUERY_LEN) {
    return NextResponse.json(
      { ok: false, error: `query too long (max ${MAX_QUERY_LEN} chars)` },
      { status: 400 },
    );
  }

  let documentId: string | null = null;
  if (scope === 'doc') {
    if (!slug) {
      return NextResponse.json(
        { ok: false, error: 'scope=doc requires slug' },
        { status: 400 },
      );
    }
    const doc = await prisma.documentV2.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!doc) {
      return NextResponse.json({ ok: true, query: q, results: [], total: 0 });
    }
    documentId = doc.id;
  }

  const headlineOpts = `StartSel=${MARK_OPEN},StopSel=${MARK_CLOSE},MaxWords=30,MinWords=15,MaxFragments=2,FragmentDelimiter= … `;

  const rows = await prisma.$queryRaw<SearchRow[]>(Prisma.sql`
    WITH q AS (SELECT websearch_to_tsquery('simple', ${q}) AS tq)
    SELECT
      d.slug,
      d.title_i18n,
      pt.lang,
      pt.page_number,
      pt.filename,
      ts_headline('simple', pt.text, q.tq, ${headlineOpts}) AS snippet,
      ts_rank(pt.search_tsv, q.tq) AS rank
    FROM document_v2_page_text pt
    JOIN documents_v2 d ON d.id = pt.document_id
    CROSS JOIN q
    WHERE pt.search_tsv @@ q.tq
      AND d.status = 'published'
      AND (${documentId}::uuid IS NULL OR pt.document_id = ${documentId}::uuid)
      AND (${lang}::text IS NULL OR pt.lang = ${lang}::text)
    ORDER BY rank DESC, d.slug, pt.lang, pt.page_number
    LIMIT ${limit}
  `);

  const results = rows.map((r) => ({
    slug: r.slug,
    title: r.title_i18n,
    lang: r.lang,
    pageNumber: r.page_number,
    filename: r.filename,
    snippet: r.snippet,
    rank: r.rank,
  }));

  return NextResponse.json({
    ok: true,
    query: q,
    scope,
    slug: slug ?? null,
    lang,
    total: results.length,
    results,
    markOpen: MARK_OPEN,
    markClose: MARK_CLOSE,
  });
}
