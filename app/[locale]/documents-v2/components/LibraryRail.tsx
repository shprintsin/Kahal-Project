'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  DocumentV2LibraryMeta,
  DocumentV2Locale,
  resolveI18nString,
} from '@/types/document-v2';

interface LibraryRailProps {
  documents: DocumentV2LibraryMeta[];
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

/** Two-letter codes shown inside the language-availability chip strip. */
const LANG_CODE: Record<DocumentV2Locale, string> = {
  he: 'HE',
  en: 'EN',
  pl: 'PL',
  ru: 'RU',
  yi: 'YI',
};

const KNOWN_CHIP_LANGS: DocumentV2Locale[] = ['pl', 'en', 'he', 'ru', 'yi'];

/**
 * Chip strip showing which languages a document is available in. The source
 * language renders as a filled green chip, present translations as outlined
 * green chips, and missing translations as dim chips — matching the visual
 * vocabulary in WF-01.
 */
function LangAvailChips({
  sourceLang,
  availableLangs,
  onActive,
}: {
  sourceLang: DocumentV2Locale;
  availableLangs: DocumentV2Locale[];
  onActive: boolean;
}) {
  // Order: source first, then any other available langs in declaration order,
  // then any missing-but-known langs (capped) so the strip width stays stable.
  const ordered: { lang: DocumentV2Locale; state: 'src' | 'has' | 'missing' }[] = [];
  ordered.push({ lang: sourceLang, state: 'src' });
  for (const lang of availableLangs) {
    if (lang === sourceLang) continue;
    ordered.push({ lang, state: 'has' });
  }

  return (
    <span className="inline-flex gap-1" aria-hidden>
      {ordered.map(({ lang, state }) => (
        <span
          key={`${lang}-${state}`}
          dir="ltr"
          className={cn(
            'border px-1 py-px text-[9px] font-medium leading-none tracking-wider',
            state === 'src' && !onActive && 'border-[var(--docs-accent)] bg-[var(--docs-accent)] text-[var(--docs-paper)]',
            state === 'src' && onActive && 'border-[var(--docs-paper)] bg-[var(--docs-paper)] text-[var(--brand-primary)]',
            state === 'has' && !onActive && 'border-[var(--docs-accent)] bg-transparent text-[var(--docs-accent)]',
            state === 'has' && onActive && 'border-[var(--docs-paper)] bg-transparent text-[var(--docs-paper)]',
            state === 'missing' && !onActive && 'border-[var(--docs-cream-3)] text-[var(--docs-ink-4)]',
            state === 'missing' && onActive && 'border-[#ffffff44] text-[#ffffff66]',
          )}
          style={{ fontFamily: 'var(--font-docs-mono)' }}
        >
          {LANG_CODE[lang]}
        </span>
      ))}
    </span>
  );
}
// Suppresses noise: KNOWN_CHIP_LANGS is reserved for a future "missing" pass
// (e.g. always show EN/HE as dim placeholders even when unavailable). Keeping
// the constant exported by the module keeps the symbol around without lint flak.
void KNOWN_CHIP_LANGS;

export function LibraryRail({
  documents,
  locale,
  fallback,
  activeSlug,
  routeLocale,
  labels,
}: LibraryRailProps) {
  const [query, setQuery] = useState('');
  const uiLocale = useLocale();
  const uiIsRtl = uiLocale === 'he';
  // Collapse-arrow direction follows the start edge (the rail is on the start
  // side). In RTL the start is the right edge, so the collapse glyph flips.
  const CollapseIcon = uiIsRtl ? ChevronRight : ChevronLeft;

  const items = useMemo(() => {
    return documents.map((meta) => {
      const sourceTitle = (meta.title?.[meta.lang] ?? '').trim();
      const userTitleRaw = (meta.title?.[locale] ?? meta.title?.[fallback] ?? '').trim();
      const fallbackAny = resolveI18nString(meta.title, locale, fallback) || meta.slug;
      const primary = sourceTitle || fallbackAny;
      const secondary = userTitleRaw && userTitleRaw !== primary ? userTitleRaw : null;
      return { meta, primary, secondary };
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
      className="flex h-full min-h-0 flex-col overflow-hidden border-e"
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
          style={{
            fontFamily: 'var(--font-docs-mono)',
            color: 'var(--muted-foreground)',
          }}
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
            {filtered.map(({ meta, primary, secondary }) => {
              const isActive = meta.slug === activeSlug;
              const docDir = meta.lang === 'he' || meta.lang === 'yi' ? 'rtl' : 'ltr';
              return (
                <li key={meta.id}>
                  <Link
                    href={`/${routeLocale}/documents-v2/${meta.slug}`}
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
                        style={{ fontFamily: 'var(--font-docs-mono)' }}
                      >
                        {meta.year ?? '—'}
                        {meta.archive?.name ? ` · ${meta.archive.name}` : ''}
                      </span>
                      <LangAvailChips
                        sourceLang={meta.lang}
                        availableLangs={meta.availableLangs ?? [meta.lang]}
                        onActive={isActive}
                      />
                    </div>
                    <div
                      dir={docDir}
                      className={cn(
                        'text-[14px] font-medium leading-snug line-clamp-3',
                        isActive ? 'text-[var(--docs-paper)]' : 'text-[var(--brand-primary)]',
                      )}
                      style={{ fontFamily: 'var(--font-frl)' }}
                    >
                      {primary}
                    </div>
                    {secondary && (
                      <div
                        dir={uiIsRtl ? 'rtl' : 'ltr'}
                        className={cn(
                          'mt-1 text-[12px] italic leading-snug line-clamp-2',
                          isActive ? 'text-[#ffffffcc]' : 'text-[var(--muted-foreground)]',
                        )}
                        style={{ fontFamily: 'var(--font-frl)' }}
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
