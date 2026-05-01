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
  name_i18n: Record<string, string> | null;
  chapter_slug: string;
  chapter_index: number;
  chapter_title_i18n: Record<string, string> | null;
  lang: string;
  snippet: string;
  rank: number;
}

/**
 * First-cut chapter search. Uses ILIKE for the WHERE clause (cheap, no index)
 * and `ts_headline` for the snippet. A proper per-language tsvector index on
 * Chapter.text + ChapterTranslation.text is a follow-up; this is enough for
 * the dev-scale corpus (a handful of archival units).
 */
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
  // Naive ranking: occurrence count of the literal query in the body. Cheap;
  // fine for the current corpus size.
  const ilikePattern = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

  const rows = await prisma.$queryRaw<SearchRow[]>(Prisma.sql`
    WITH source_hits AS (
      SELECT
        d.slug,
        d.name_i18n,
        c.slug AS chapter_slug,
        c.index AS chapter_index,
        c.title_i18n AS chapter_title_i18n,
        d.source_lang AS lang,
        c.text AS body
      FROM chapters c
      JOIN documents_v2 d ON d.id = c.document_id
      WHERE c.text ILIKE ${ilikePattern}
        AND d.status = 'published'
        AND (${documentId}::uuid IS NULL OR c.document_id = ${documentId}::uuid)
        AND (${lang}::text IS NULL OR d.source_lang = ${lang}::text)
    ),
    translation_hits AS (
      SELECT
        d.slug,
        d.name_i18n,
        c.slug AS chapter_slug,
        c.index AS chapter_index,
        c.title_i18n AS chapter_title_i18n,
        ct.lang,
        ct.text AS body
      FROM chapter_translations ct
      JOIN chapters c ON c.id = ct.chapter_id
      JOIN documents_v2 d ON d.id = c.document_id
      WHERE ct.text ILIKE ${ilikePattern}
        AND d.status = 'published'
        AND (${documentId}::uuid IS NULL OR c.document_id = ${documentId}::uuid)
        AND (${lang}::text IS NULL OR ct.lang = ${lang}::text)
    ),
    all_hits AS (
      SELECT * FROM source_hits
      UNION ALL
      SELECT * FROM translation_hits
    )
    SELECT
      slug,
      name_i18n,
      chapter_slug,
      chapter_index,
      chapter_title_i18n,
      lang,
      ts_headline(
        CASE lang WHEN 'en' THEN 'english' ELSE 'simple' END::regconfig,
        body,
        websearch_to_tsquery(
          CASE lang WHEN 'en' THEN 'english' ELSE 'simple' END::regconfig,
          ${q}
        ),
        ${headlineOpts}
      ) AS snippet,
      (LENGTH(body) - LENGTH(REPLACE(LOWER(body), LOWER(${q}), '')))::float
        / GREATEST(LENGTH(${q}), 1) AS rank
    FROM all_hits
    ORDER BY rank DESC, slug, chapter_index, lang
    LIMIT ${limit}
  `);

  const results = rows.map((r) => ({
    slug: r.slug,
    title: r.name_i18n,
    chapterSlug: r.chapter_slug,
    chapterIndex: r.chapter_index,
    chapterTitle: r.chapter_title_i18n,
    lang: r.lang,
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
