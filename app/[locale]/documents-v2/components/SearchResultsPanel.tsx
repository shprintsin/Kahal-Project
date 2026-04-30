'use client';

import React from 'react';
import Link from 'next/link';
import { resolveI18nString, type DocumentV2Locale } from '@/types/document-v2';
import { fallbackLocale, type Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';

export interface SearchResult {
  slug: string;
  title: Record<string, string> | null;
  lang: string;
  pageNumber: number;
  filename: string;
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
  onJumpToPage: (page: number, lang: string) => void;
  labels: {
    title: string;
    empty: (q: string) => string;
    page: string;
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
  // The DB injected literal sentinel strings around matches; HTML-escape the surrounding
  // text so user content can never break out of the <mark> tags.
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
  onJumpToPage,
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
            “{query}” · {scope === 'doc' ? 'doc' : 'all'} · {results.length}
          </span>
        </header>

        {results.length === 0 ? (
          <p className="text-sm text-muted-foreground">{labels.empty(query)}</p>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {results.map((r, i) => {
              const title =
                resolveI18nString(r.title ?? undefined, docLocale, docFallback) || r.slug;
              const sameDoc = r.slug === currentSlug;
              const meta = `${title} · ${r.lang} · ${labels.page} ${r.pageNumber}`;
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
                <li key={`${r.slug}-${r.lang}-${r.pageNumber}-${i}`}>
                  {sameDoc ? (
                    <button
                      type="button"
                      onClick={() => onJumpToPage(r.pageNumber, r.lang)}
                      className="block w-full text-start px-3 py-3 transition-colors hover:bg-muted/40"
                    >
                      {Body}
                    </button>
                  ) : (
                    <Link
                      href={`/${routeLocale}/documents-v2/${r.slug}?page=${r.pageNumber}${r.lang ? `&lang=${r.lang}` : ''}`}
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
