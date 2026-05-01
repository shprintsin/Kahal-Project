'use client';

import React from 'react';
import Link from 'next/link';
import { resolveI18nString, type DocumentV2Locale } from '@/types/document-v2';
import { fallbackLocale, type Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';

export interface SearchResult {
  slug: string;
  title: Record<string, string> | null;
  chapterSlug: string;
  chapterIndex: number;
  chapterTitle: Record<string, string> | null;
  lang: string;
  snippet: string;
  rank: number;
}

interface Props {
  results: SearchResult[];
  query: string;
  scope: 'doc' | 'all';
  currentSlug: string;
  routeLocale: Locale;
  markOpen: string;
  markClose: string;
  onJumpToChapter: (chapterSlug: string, lang: string) => void;
  labels: {
    title: string;
    empty: (q: string) => string;
    chapter: string;
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function snippetHtml(snippet: string, markOpen: string, markClose: string): string {
  const safe = escapeHtml(snippet);
  const openEsc = escapeHtml(markOpen);
  const closeEsc = escapeHtml(markClose);
  return safe.split(openEsc).join('<mark>').split(closeEsc).join('</mark>');
}

export function SearchResultsPanel({
  results,
  query,
  scope,
  currentSlug,
  routeLocale,
  markOpen,
  markClose,
  onJumpToChapter,
  labels,
}: Props) {
  const docLocale = routeLocale as unknown as DocumentV2Locale;
  const docFallback = fallbackLocale as unknown as DocumentV2Locale;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-background">
      <div className="mx-auto max-w-[80ch] px-4 py-6 sm:px-8 sm:py-8">
        <header className="mb-4 flex items-baseline gap-3">
          <h2 className="font-serif text-lg tracking-tight">{labels.title}</h2>
          <span className="font-mono text-[11px] text-muted-foreground">
            "{query}" · {scope === 'doc' ? 'doc' : 'all'} · {results.length}
          </span>
        </header>

        {results.length === 0 ? (
          <p className="text-sm text-muted-foreground">{labels.empty(query)}</p>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {results.map((r, i) => {
              const docTitle =
                resolveI18nString(r.title ?? undefined, docLocale, docFallback) || r.slug;
              const chTitle =
                resolveI18nString(r.chapterTitle ?? undefined, docLocale, docFallback) ||
                r.chapterSlug;
              const sameDoc = r.slug === currentSlug;
              const meta = `${docTitle} · ${r.lang} · ${labels.chapter} ${r.chapterIndex}: ${chTitle}`;
              const html = snippetHtml(r.snippet, markOpen, markClose);

              const Body = (
                <div className="space-y-1">
                  <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.15em]">
                    {meta}
                  </div>
                  <div
                    className={cn(
                      'text-sm leading-snug',
                      r.lang === 'he' || r.lang === 'yi' ? 'text-right' : 'text-left',
                    )}
                    dir={r.lang === 'he' || r.lang === 'yi' ? 'rtl' : 'ltr'}
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                </div>
              );

              return (
                <li key={`${r.slug}-${r.chapterSlug}-${r.lang}-${i}`}>
                  {sameDoc ? (
                    <button
                      type="button"
                      onClick={() => onJumpToChapter(r.chapterSlug, r.lang)}
                      className="block w-full text-start px-3 py-3 transition-colors hover:bg-muted/40"
                    >
                      {Body}
                    </button>
                  ) : (
                    <Link
                      href={`/${routeLocale}/documents-v2/${r.slug}?chapter=${encodeURIComponent(r.chapterSlug)}${r.lang ? `&lang=${r.lang}` : ''}`}
                      className="block px-3 py-3 transition-colors hover:bg-muted/40"
                    >
                      {Body}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
