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

  // The query has to use the same analyser the row was indexed with — running
  // `to_tsquery('english', …)` against a Hebrew-indexed row matches nothing.
  // Both the row's `search_tsv_lang` and the query's tsquery dispatch on the
  // same `lang`-keyed CASE so they stay in lockstep with the migration.
  //
  // For `scope=all` (no lang filter) the per-language vectors still match the
  // per-row tsquery because each row's `search_tsv_lang` was built with the
  // analyser for *its own* `lang`, and the CASE below recomputes the tsquery
  // with the same analyser when joined against that row.
  const rows = await prisma.$queryRaw<SearchRow[]>(Prisma.sql`
    SELECT
      d.slug,
      d.title_i18n,
      pt.lang,
      pt.page_number,
      pt.filename,
      ts_headline(
        CASE pt.lang WHEN 'en' THEN 'english' ELSE 'simple' END::regconfig,
        CASE
          WHEN pt.lang IN ('he', 'yi') THEN hebrew_normalize(pt.text)
          WHEN pt.lang IN ('en', 'pl', 'ru') THEN immutable_unaccent(pt.text)
          ELSE pt.text
        END,
        CASE
          WHEN pt.lang = 'en' THEN websearch_to_tsquery('english', immutable_unaccent(${q}))
          WHEN pt.lang IN ('he', 'yi') THEN websearch_to_tsquery('simple', hebrew_normalize(${q}))
          WHEN pt.lang IN ('pl', 'ru') THEN websearch_to_tsquery('simple', immutable_unaccent(${q}))
          ELSE websearch_to_tsquery('simple', ${q})
        END,
        ${headlineOpts}
      ) AS snippet,
      ts_rank(
        pt.search_tsv_lang,
        CASE
          WHEN pt.lang = 'en' THEN websearch_to_tsquery('english', immutable_unaccent(${q}))
          WHEN pt.lang IN ('he', 'yi') THEN websearch_to_tsquery('simple', hebrew_normalize(${q}))
          WHEN pt.lang IN ('pl', 'ru') THEN websearch_to_tsquery('simple', immutable_unaccent(${q}))
          ELSE websearch_to_tsquery('simple', ${q})
        END
      ) AS rank
    FROM document_v2_page_text pt
    JOIN documents_v2 d ON d.id = pt.document_id
    WHERE pt.version = d.current_version
      AND pt.search_tsv_lang @@ (
        CASE
          WHEN pt.lang = 'en' THEN websearch_to_tsquery('english', immutable_unaccent(${q}))
          WHEN pt.lang IN ('he', 'yi') THEN websearch_to_tsquery('simple', hebrew_normalize(${q}))
          WHEN pt.lang IN ('pl', 'ru') THEN websearch_to_tsquery('simple', immutable_unaccent(${q}))
          ELSE websearch_to_tsquery('simple', ${q})
        END
      )
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
