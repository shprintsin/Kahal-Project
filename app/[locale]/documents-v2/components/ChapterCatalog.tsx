'use client';

import React, { useDeferredValue, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import {
  resolveI18nString,
  type DocumentV2Locale,
  type I18nString,
} from '@/types/document-v2';
import { LangAvailChips } from './LangAvailChips';

export interface ChapterCatalogRow {
  documentSlug: string;
  documentTitleI18n: I18nString;
  documentCitation?: string;
  sourceLang: DocumentV2Locale;
  chapterSlug: string;
  chapterIndex: number;
  titleI18n: I18nString;
  excerptI18n?: I18nString;
  date?: string;
  mentionJews: boolean;
}

interface ChapterCatalogProps {
  rows: ChapterCatalogRow[];
  locale: DocumentV2Locale;
  fallback: DocumentV2Locale;
  routeLocale: string;
  labels: {
    searchPlaceholder: string;
    empty: string;
    chapter: string;
    of: string;
    mentionsJews: string;
    clear: string;
    /** Template with `{n}` and `{total}` placeholders. */
    resultsTemplate: string;
  };
}

function norm(s: string): string {
  return s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
}

/** Tiny fuzzy/subsequence scorer. Higher is better. 0 = no match. */
function fuzzyScore(haystack: string, needle: string): number {
  if (!needle) return 1;
  if (!haystack) return 0;
  const h = norm(haystack);
  const n = norm(needle);
  if (h.includes(n)) {
    const idx = h.indexOf(n);
    const wordBoundary = idx === 0 || /\W/.test(h[idx - 1] ?? '');
    return 1000 - idx + (wordBoundary ? 200 : 0);
  }
  let hi = 0;
  let score = 0;
  let lastHit = -1;
  for (const c of n) {
    const found = h.indexOf(c, hi);
    if (found < 0) return 0;
    score += found - lastHit === 1 ? 8 : 2;
    lastHit = found;
    hi = found + 1;
  }
  return score;
}

interface ScoredRow {
  row: ChapterCatalogRow;
  score: number;
}

interface ScoredGroup {
  documentSlug: string;
  documentTitleI18n: I18nString;
  sourceLang: DocumentV2Locale;
  /** Earliest non-empty chapter date string (used as the year hint). */
  yearHint?: string;
  totalChapters: number;
  chapters: ScoredRow[];
  bestScore: number;
}

export function ChapterCatalog({
  rows,
  locale,
  fallback,
  routeLocale,
  labels,
}: ChapterCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(initialQuery);
  const deferredQuery = useDeferredValue(query.trim());

  const updateQuery = (next: string) => {
    setQuery(next);
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = next.trim();
    if (trimmed) params.set('q', trimmed);
    else params.delete('q');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const { groups, matchedCount } = useMemo(() => {
    // Bucket rows by document, preserving first-seen order from `rows`.
    const byDoc = new Map<string, ScoredGroup>();
    let matched = 0;

    for (const row of rows) {
      let score = 1;
      if (deferredQuery) {
        const title = resolveI18nString(row.titleI18n, locale, fallback);
        const excerpt = resolveI18nString(row.excerptI18n, locale, fallback);
        const docTitle = resolveI18nString(row.documentTitleI18n, locale, fallback);
        score = Math.max(
          fuzzyScore(title, deferredQuery) * 3,
          fuzzyScore(excerpt, deferredQuery),
          fuzzyScore(docTitle, deferredQuery) * 1.5,
          fuzzyScore(row.chapterSlug, deferredQuery),
        );
        if (score <= 0) {
          // Still count toward the doc's total but exclude from chapters list.
          let g = byDoc.get(row.documentSlug);
          if (!g) {
            g = {
              documentSlug: row.documentSlug,
              documentTitleI18n: row.documentTitleI18n,
              sourceLang: row.sourceLang,
              yearHint: row.date,
              totalChapters: 0,
              chapters: [],
              bestScore: 0,
            };
            byDoc.set(row.documentSlug, g);
          }
          g.totalChapters += 1;
          if (row.date && (!g.yearHint || row.date < g.yearHint)) g.yearHint = row.date;
          continue;
        }
      }

      let g = byDoc.get(row.documentSlug);
      if (!g) {
        g = {
          documentSlug: row.documentSlug,
          documentTitleI18n: row.documentTitleI18n,
          sourceLang: row.sourceLang,
          yearHint: row.date,
          totalChapters: 0,
          chapters: [],
          bestScore: 0,
        };
        byDoc.set(row.documentSlug, g);
      }
      g.totalChapters += 1;
      g.chapters.push({ row, score });
      if (score > g.bestScore) g.bestScore = score;
      if (row.date && (!g.yearHint || row.date < g.yearHint)) g.yearHint = row.date;
      matched += 1;
    }

    const result = Array.from(byDoc.values()).filter((g) => g.chapters.length > 0);

    if (deferredQuery) {
      // Sort groups by best match; sort chapters within group by score desc.
      result.sort((a, b) => b.bestScore - a.bestScore);
      for (const g of result) g.chapters.sort((a, b) => b.score - a.score);
    } else {
      // Stable: preserve repository order; chapters by index asc.
      for (const g of result) g.chapters.sort((a, b) => a.row.chapterIndex - b.row.chapterIndex);
    }

    return { groups: result, matchedCount: matched };
  }, [rows, deferredQuery, locale, fallback]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div
        className="flex shrink-0 flex-wrap items-center gap-3 border-b px-4 py-2 text-[12px]"
        style={{
          background: 'var(--docs-cream)',
          borderColor: 'var(--docs-cream-3)',
        }}
      >
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            placeholder={labels.searchPlaceholder}
            className="w-full border bg-[var(--docs-paper)] ps-8 pe-8 py-1 text-[12px] outline-none focus:border-foreground/40"
            style={{ borderColor: 'var(--docs-cream-3)' }}
          />
          {query && (
            <button
              type="button"
              aria-label={labels.clear}
              onClick={() => updateQuery('')}
              className="absolute end-1.5 top-1/2 -translate-y-1/2 inline-flex h-5 w-5 items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <span className="shrink-0 uppercase tracking-[0.18em] text-[10px] text-muted-foreground">
          {labels.resultsTemplate
            .replace('{n}', String(matchedCount))
            .replace('{total}', String(rows.length))}
        </span>
      </div>

      <div
        className="docs-scroll-y--paper flex-1 min-h-0"
        style={{ background: 'var(--docs-paper)' }}
      >
        <div className="mx-auto max-w-[80ch] px-4 py-6 sm:px-8 sm:py-8">
          {groups.length === 0 ? (
            <p
              className="border border-dashed p-8 text-center text-sm text-muted-foreground"
              style={{ borderColor: 'var(--docs-cream-3)' }}
            >
              {labels.empty}
            </p>
          ) : (
            <div className="flex flex-col gap-8">
              {groups.map((group) => {
                const docTitle =
                  resolveI18nString(group.documentTitleI18n, locale, fallback) ||
                  group.documentSlug;
                const groupIsRtl = locale === 'he' || locale === 'yi';
                const yearText = group.yearHint?.slice(0, 4);
                return (
                  <section
                    key={group.documentSlug}
                    className="border bg-[var(--docs-paper)]"
                    style={{ borderColor: 'var(--docs-cream-3)' }}
                  >
                    <header
                      dir={groupIsRtl ? 'rtl' : 'ltr'}
                      className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b px-4 py-3"
                      style={{
                        background: 'var(--docs-cream)',
                        borderColor: 'var(--docs-cream-3)',
                      }}
                    >
                      <Link
                        href={`/${routeLocale}/documents-v2/${group.documentSlug}${
                          deferredQuery ? `?q=${encodeURIComponent(deferredQuery)}` : ''
                        }`}
                        className="text-[18px] font-medium leading-snug text-[var(--brand-primary)] no-underline hover:underline"
                        style={{ fontFamily: 'var(--docs-font-serif)' }}
                      >
                        {docTitle}
                      </Link>
                      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        {yearText && <>{yearText} · </>}
                        {group.chapters.length}
                        {deferredQuery && group.chapters.length !== group.totalChapters
                          ? ` / ${group.totalChapters}`
                          : ''}
                        {' '}ch
                      </span>
                      <span className="ms-auto">
                        <LangAvailChips
                          sourceLang={group.sourceLang}
                          availableLangs={[group.sourceLang]}
                        />
                      </span>
                    </header>
                    <ul className="divide-y" style={{ borderColor: 'var(--docs-cream-3)' }}>
                      {group.chapters.map(({ row }) => {
                        const title =
                          resolveI18nString(row.titleI18n, locale, fallback) || row.chapterSlug;
                        const excerpt = resolveI18nString(row.excerptI18n, locale, fallback);
                        const linkParams = new URLSearchParams({ chapter: row.chapterSlug });
                        if (deferredQuery) linkParams.set('q', deferredQuery);
                        const href = `/${routeLocale}/documents-v2/${row.documentSlug}?${linkParams.toString()}`;
                        return (
                          <li key={`${row.documentSlug}/${row.chapterSlug}`}>
                            <Link
                              href={href}
                              dir={groupIsRtl ? 'rtl' : 'ltr'}
                              className="flex gap-3 px-4 py-3 transition-colors hover:bg-[var(--docs-cream-2)]"
                            >
                              <span
                                className="shrink-0 tabular-nums text-[12px] leading-[1.4] text-muted-foreground"
                                title={row.mentionJews ? labels.mentionsJews : undefined}
                              >
                                {row.chapterIndex}
                                {row.mentionJews && (
                                  <span
                                    aria-hidden
                                    className="ms-1 text-[var(--docs-accent)]"
                                  >
                                    ★
                                  </span>
                                )}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-[14px] leading-snug">{title}</span>
                                {row.date && (
                                  <span className="mt-0.5 block text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                                    {row.date}
                                  </span>
                                )}
                                {excerpt && (
                                  <span className="mt-1 block text-[12px] leading-snug text-muted-foreground line-clamp-2">
                                    {excerpt}
                                  </span>
                                )}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
