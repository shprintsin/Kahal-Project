'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { fallbackLocale } from '@/lib/i18n/config';
import { resolveI18nString, type DocumentV2Locale } from '@/types/document-v2';
import { cn } from '@/lib/utils';
import { useDocsV2LibraryOptional } from './DocsV2LibraryContext';

type LineWidth = 'short' | 'med' | 'long';

/** Single skeleton bar matching the WF-01 `.placeholder-line` design. */
export function PlaceholderLine({
  width = 'long',
  dark = false,
  className,
}: {
  width?: LineWidth;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        'docs-placeholder-line',
        width === 'short' && 'is-short',
        width === 'med' && 'is-med',
        width === 'long' && 'is-long',
        dark && 'is-dark',
        className,
      )}
    />
  );
}

/**
 * Loading skeleton for the per-document segment. The persistent chrome (top
 * bar + library rail) lives in the segment layout and is preserved across
 * navigation. The inspector's *header* (title, year, archive, license) is
 * known from the library context as soon as the user clicks a card, so we
 * render it from real data here — only the parts that genuinely depend on
 * the per-doc fetch (TOC, page count, downloads) stay as placeholder bars.
 */
export function DocumentReaderSkeleton() {
  const ctx = useDocsV2LibraryOptional();
  const routeLocale = useLocale();
  const t = useTranslations('documentsV2');
  const docLocale = routeLocale as unknown as DocumentV2Locale;
  const docFallback = fallbackLocale as unknown as DocumentV2Locale;
  const meta = ctx?.activeMeta ?? null;
  const title = meta ? resolveI18nString(meta.nameI18n, docLocale, docFallback) || meta.slug : '';
  const isRtl =
    meta && (meta.sourceLang === 'he' || meta.sourceLang === 'yi') ? true : false;

  return (
    <>
      {/* Centre column: toolbar shape + paper body with paragraph stubs */}
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-b px-3 py-2"
          style={{
            background: 'var(--docs-paper)',
            borderColor: 'var(--docs-cream-3)',
          }}
        >
          <div className="h-7 w-44 bg-[var(--docs-cream-2)]" />
          <div className="h-7 w-48 bg-[var(--docs-cream-2)]" />
          <div className="h-7 w-32 bg-[var(--docs-cream-2)]" />
        </div>
        <div
          className="flex-1 min-h-0 overflow-hidden"
          style={{ background: 'var(--docs-paper)' }}
        >
          <article className="mx-auto max-w-[760px] px-4 py-8 sm:px-8 sm:py-12 md:px-16 md:py-16">
            <PlaceholderLine width="med" />
            <div className="h-6" />
            <PlaceholderLine width="long" />
            <PlaceholderLine width="long" />
            <PlaceholderLine width="med" />
            <div className="h-6" />
            <PlaceholderLine width="short" dark />
            <PlaceholderLine width="long" />
            <PlaceholderLine width="long" />
            <PlaceholderLine width="med" />
            <div className="h-6" />
            <PlaceholderLine width="long" />
            <PlaceholderLine width="med" />
            <PlaceholderLine width="long" />
            <PlaceholderLine width="short" />
          </article>
        </div>
      </div>

      {/* Inspector: real header from library context, skeleton tab content */}
      <aside
        dir={isRtl ? 'rtl' : 'ltr'}
        className="hidden h-full min-h-0 flex-col border-s md:flex"
        style={{
          background: 'var(--docs-cream)',
          borderColor: 'var(--docs-cream-3)',
        }}
      >
        <div
          className="flex-none border-b px-4 py-4"
          style={{ borderColor: 'var(--docs-cream-3)' }}
        >
          {meta ? (
            <>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                {meta.dateStart?.slice(0, 4) ?? '—'}
                {meta.citation ? ` · ${meta.citation.slice(0, 60)}` : ''}
              </div>
              <h2
                className="mt-1.5 text-[16px] font-medium leading-snug text-[var(--brand-primary)]"
                style={{ fontFamily: 'var(--docs-font-serif)' }}
              >
                {title}
              </h2>
            </>
          ) : (
            <>
              <PlaceholderLine width="short" dark className="!w-12" />
              <div className="h-2" />
              <PlaceholderLine width="long" />
              <PlaceholderLine width="med" />
            </>
          )}
        </div>

        {/* Tab strip — the labels are i18n-static so we can show them for real */}
        <div
          className="flex flex-none border-b"
          style={{ borderColor: 'var(--docs-cream-3)' }}
        >
          {[t('inspectorContents'), t('inspectorDetails'), t('inspectorNotes')].map(
            (label, i) => (
              <div
                key={label}
                className={cn(
                  'flex-1 px-3 py-2.5 text-center text-[11px] uppercase tracking-[0.12em]',
                  i === 0
                    ? 'border-b-2 font-semibold text-[var(--brand-primary)]'
                    : 'border-b-2 border-transparent text-[var(--muted-foreground)]',
                )}
                style={{
                  borderBottomColor: i === 0 ? 'var(--docs-accent)' : undefined,
                }}
              >
                {label}
              </div>
            ),
          )}
        </div>

        {/* TOC content — genuinely waiting for the doc */}
        <div className="flex-1 px-4 py-3">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="py-1.5">
              <PlaceholderLine
                width={i % 3 === 0 ? 'short' : i % 2 === 0 ? 'med' : 'long'}
                dark={i % 3 === 0}
              />
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
