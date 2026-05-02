'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  DocumentLibraryMeta,
  DocumentV2Locale,
  resolveI18nString,
} from '@/types/document-v2';
import { LangAvailChips } from './LangAvailChips';

interface LibraryRailProps {
  documents: DocumentLibraryMeta[];
  locale: DocumentV2Locale;
  fallback: DocumentV2Locale;
  activeSlug?: string;
  routeLocale: string;
  labels: {
    library: string;
    librarySectionLabel: (n: number) => string;
    searchPlaceholder: string;
    empty: string;
    collapse: string;
  };
}

export function LibraryRail({
  documents,
  locale,
  fallback,
  activeSlug,
  routeLocale,
  labels,
}: LibraryRailProps) {
  const [query, setQuery] = useState('');
  const searchParams = useSearchParams();
  const catalogQuery = searchParams.get('q') ?? '';
  const uiLocale = useLocale();
  const uiIsRtl = uiLocale === 'he';
  // Collapse-arrow direction follows the start edge (the rail is on the start
  // side). In RTL the start is the right edge, so the collapse glyph flips.
  const CollapseIcon = uiIsRtl ? ChevronRight : ChevronLeft;

  const items = useMemo(() => {
    return documents.map((meta) => {
      const sourceTitle = (meta.nameI18n?.source ?? meta.nameI18n?.[meta.sourceLang] ?? '').trim();
      const userTitleRaw = (meta.nameI18n?.[locale] ?? meta.nameI18n?.[fallback] ?? '').trim();
      const fallbackAny = resolveI18nString(meta.nameI18n, locale, fallback) || meta.slug;
      const primary = userTitleRaw || fallbackAny;
      const secondary = sourceTitle && sourceTitle !== primary ? sourceTitle : null;
      const year = meta.dateStart ? meta.dateStart.slice(0, 4) : null;
      return { meta, primary, secondary, year, userTitleRaw };
    });
  }, [documents, locale, fallback]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (it) =>
        it.primary.toLowerCase().includes(q) ||
        (it.secondary?.toLowerCase().includes(q) ?? false) ||
        it.meta.slug.toLowerCase().includes(q),
    );
  }, [items, query]);

  return (
    <aside
      className="chapters-sidebar flex h-full min-h-0 flex-col overflow-hidden border-e"
      style={{
        background: 'var(--docs-cream)',
        borderColor: 'var(--docs-cream-3)',
      }}
    >
      <div
        className="flex items-center gap-2 border-b px-3 py-2.5"
        style={{ borderColor: 'var(--docs-cream-3)' }}
      >
        <span
          className="text-[11px] uppercase tracking-[0.18em]"
          style={{ color: 'var(--muted-foreground)' }}
        >
          {labels.librarySectionLabel(documents.length)}
        </span>
        <div className="flex-1" />
        <button
          type="button"
          aria-label={labels.collapse}
          // Visual affordance only for now — collapse behaviour can be wired up
          // in a follow-up; the icon matches the WF-01 design.
          className="inline-flex h-6 w-6 items-center justify-center border text-[var(--muted-foreground)] hover:bg-[var(--docs-cream-2)]"
          style={{ borderColor: 'var(--docs-cream-3)' }}
        >
          <CollapseIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="px-3 py-2.5">
        <label
          className="flex items-center gap-2 border bg-[var(--docs-paper)] px-2.5 py-1.5"
          style={{ borderColor: 'var(--docs-cream-3)' }}
        >
          <Search className="h-3.5 w-3.5 text-[var(--muted-foreground)]" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={labels.searchPlaceholder}
            className="min-w-0 flex-1 bg-transparent text-[12px] focus:outline-none"
          />
        </label>
      </div>

      <div className="docs-scroll-y flex-1 px-3 pb-3">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-xs text-[var(--muted-foreground)]">
            {labels.empty}
          </div>
        ) : (
          <ul className="space-y-2.5">
            {filtered.map(({ meta, primary, secondary, year, userTitleRaw }) => {
              const isActive = meta.slug === activeSlug;
              const docDir = meta.sourceLang === 'he' || meta.sourceLang === 'yi' ? 'rtl' : 'ltr';
              // Primary title dir: follow the displayed text's script, not the source doc lang.
              const primaryIsRtl = userTitleRaw && (locale === 'he' || locale === 'yi');
              const primaryDir = primaryIsRtl ? 'rtl' : docDir;
              return (
                <li key={meta.id}>
                  <Link
                    href={`/${routeLocale}/documents-v2/${meta.slug}${catalogQuery ? `?q=${encodeURIComponent(catalogQuery)}` : ''}`}
                    dir={uiIsRtl ? 'rtl' : 'ltr'}
                    className={cn(
                      'block border px-3.5 py-3 transition-colors no-underline',
                      isActive
                        ? 'bg-[var(--docs-accent)] text-[var(--docs-paper)] border-[var(--docs-accent)]'
                        : 'bg-[var(--docs-paper)] hover:border-[var(--docs-accent)]',
                    )}
                    style={{
                      borderColor: isActive ? 'var(--docs-accent)' : 'var(--docs-cream-3)',
                    }}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          'text-[10px] uppercase tracking-[0.18em]',
                          isActive ? 'text-[#ffffffcc]' : 'text-[var(--muted-foreground)]',
                        )}
                      >
                        {year ?? '—'} · {meta.chapterCount} ch
                      </span>
                      <LangAvailChips
                        sourceLang={meta.sourceLang}
                        availableLangs={meta.availableLangs ?? [meta.sourceLang]}
                        onActive={isActive}
                      />
                    </div>
                    <div
                      dir={primaryDir}
                      className={cn(
                        'text-[14px] font-medium leading-snug line-clamp-3',
                        isActive ? 'text-[var(--docs-paper)]' : 'text-[var(--brand-primary)]',
                      )}
                    >
                      {primary}
                    </div>
                    {secondary && (
                      <div
                        dir={docDir}
                        className={cn(
                          'mt-1 text-[12px] italic leading-snug line-clamp-2',
                          isActive ? 'text-[#ffffffcc]' : 'text-[var(--muted-foreground)]',
                        )}
                      >
                        {secondary}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
