'use client';

import React, { useDeferredValue, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react';
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
  availableLangs: DocumentV2Locale[];
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
    colDate: string;
    colTitle: string;
    colDocument: string;
    colLangs: string;
    colJews: string;
    /** Template with `{col}` placeholder. */
    sortByTemplate: string;
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

type SortKey = 'date' | 'title';
interface SortState {
  key: SortKey;
  dir: 'asc' | 'desc';
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
  const [sort, setSort] = useState<SortState>({ key: 'date', dir: 'asc' });

  const updateQuery = (next: string) => {
    setQuery(next);
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = next.trim();
    if (trimmed) params.set('q', trimmed);
    else params.delete('q');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // Search overrides manual sorting: when a query is active, rows rank by
  // relevance and the column headers are inert.
  const searching = Boolean(deferredQuery);

  const toggleSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' },
    );
  };

  const list = useMemo<ScoredRow[]>(() => {
    const titleOf = (r: ChapterCatalogRow) => resolveI18nString(r.titleI18n, locale, fallback);

    if (searching) {
      const docTitleOf = (r: ChapterCatalogRow) =>
        resolveI18nString(r.documentTitleI18n, locale, fallback);
      const scored: ScoredRow[] = [];
      for (const row of rows) {
        const score = Math.max(
          fuzzyScore(titleOf(row), deferredQuery) * 3,
          fuzzyScore(resolveI18nString(row.excerptI18n, locale, fallback), deferredQuery),
          fuzzyScore(docTitleOf(row), deferredQuery) * 1.5,
          fuzzyScore(row.chapterSlug, deferredQuery),
        );
        if (score > 0) scored.push({ row, score });
      }
      scored.sort((a, b) => b.score - a.score);
      return scored;
    }

    // No query: sort by the active column.
    const factor = sort.dir === 'asc' ? 1 : -1;
    const tie = (a: ChapterCatalogRow, b: ChapterCatalogRow) =>
      a.documentSlug < b.documentSlug
        ? -1
        : a.documentSlug > b.documentSlug
          ? 1
          : a.chapterIndex - b.chapterIndex;

    const scored = rows.map((row) => ({ row, score: 1 }));
    scored.sort((x, y) => {
      const a = x.row;
      const b = y.row;
      // Date column: undated rows always sink to the bottom, regardless of
      // sort direction (so the `factor` must not touch that decision).
      if (sort.key === 'date') {
        if (a.date && b.date) {
          if (a.date !== b.date) return (a.date < b.date ? -1 : 1) * factor;
        } else if (a.date || b.date) {
          return a.date ? -1 : 1;
        }
        return tie(a, b);
      }
      let cmp = 0;
      switch (sort.key) {
        case 'title':
          cmp = norm(titleOf(a)).localeCompare(norm(titleOf(b)));
          break;
      }
      if (cmp !== 0) return cmp * factor;
      return tie(a, b);
    });
    return scored;
  }, [rows, deferredQuery, searching, sort, locale, fallback]);

  const matchedCount = list.length;

  const buildHref = (row: ChapterCatalogRow) => {
    const params = new URLSearchParams({ chapter: row.chapterSlug });
    if (deferredQuery) params.set('q', deferredQuery);
    return `/${routeLocale}/documents-v2/${row.documentSlug}?${params.toString()}`;
  };

  const headerSort = (key: SortKey, label: string, className: string, align: 'start' | 'center') => {
    const active = !searching && sort.key === key;
    const Arrow = sort.dir === 'asc' ? ChevronUp : ChevronDown;
    return (
      <th
        className={`${className} border-b px-3 py-2 font-medium text-muted-foreground`}
        style={{ background: 'var(--docs-cream)', borderColor: 'var(--docs-cream-3)' }}
        aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
      >
        <button
          type="button"
          disabled={searching}
          onClick={() => toggleSort(key)}
          aria-label={labels.sortByTemplate.replace('{col}', label)}
          className={`inline-flex items-center gap-1 ${
            align === 'center' ? 'justify-center' : ''
          } ${searching ? 'cursor-default opacity-60' : 'hover:text-foreground'}`}
        >
          <span>{label}</span>
          {active && <Arrow className="h-3 w-3" aria-hidden />}
        </button>
      </th>
    );
  };

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
        {list.length === 0 ? (
          <div className="mx-auto max-w-[60ch] px-4 py-8">
            <p
              className="border border-dashed p-8 text-center text-sm text-muted-foreground"
              style={{ borderColor: 'var(--docs-cream-3)' }}
            >
              {labels.empty}
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse text-[13px]">
            <thead className="sticky top-0 z-10 text-[10px] uppercase tracking-[0.14em]">
              <tr>
                {headerSort('date', labels.colDate, 'w-28 text-end', 'start')}
                <th
                  className="hidden w-px whitespace-nowrap border-b px-3 py-2 text-start font-medium text-muted-foreground md:table-cell"
                  style={{ background: 'var(--docs-cream)', borderColor: 'var(--docs-cream-3)' }}
                >
                  {labels.colLangs}
                </th>
                {headerSort('title', labels.colTitle, 'text-start', 'start')}
              </tr>
            </thead>
            <tbody>
              {list.map(({ row }) => {
                const title =
                  resolveI18nString(row.titleI18n, locale, fallback) || row.chapterSlug;
                const docTitle =
                  resolveI18nString(row.documentTitleI18n, locale, fallback) || row.documentSlug;
                const href = buildHref(row);
                return (
                  <tr
                    key={`${row.documentSlug}/${row.chapterSlug}`}
                    role="link"
                    tabIndex={0}
                    onClick={() => router.push(href)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        router.push(href);
                      }
                    }}
                    className="cursor-pointer border-b align-top transition-colors even:bg-[var(--docs-cream)] hover:bg-[var(--docs-cream-2)] focus:bg-[var(--docs-cream-2)] focus:outline-none"
                    style={{ borderColor: 'var(--docs-cream-3)' }}
                  >
                    <td
                      dir="ltr"
                      className="w-28 whitespace-nowrap px-3 py-1.5 text-end tabular-nums text-[11px] text-muted-foreground"
                    >
                      {row.date ?? ''}
                    </td>
                    <td className="hidden whitespace-nowrap px-3 py-1.5 text-end md:table-cell">
                      <LangAvailChips
                        sourceLang={row.sourceLang}
                        availableLangs={row.availableLangs}
                      />
                    </td>
                    <td dir="auto" className="px-3 py-1.5 leading-snug">
                      <span className="block text-[13px] font-medium">
                        {title}
                      </span>
                      <span className="mt-0.5 flex items-baseline gap-1 text-[11px] leading-snug text-muted-foreground">
                        <span className="min-w-0 truncate" title={docTitle}>
                          {docTitle}
                        </span>
                        <span className="shrink-0 whitespace-nowrap">
                          · {labels.chapter} {row.chapterIndex}
                        </span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
