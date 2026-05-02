'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useSelectedLayoutSegment } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fallbackLocale, type Locale } from '@/lib/i18n/config';
import type { DocumentLibraryMeta, DocumentV2Locale } from '@/types/document-v2';
import { DocsV2LibraryProvider } from './DocsV2LibraryContext';
import { LibraryRail } from './LibraryRail';

interface DocsV2ShellProps {
  library: DocumentLibraryMeta[];
  children: React.ReactNode;
}

/**
 * Persistent chrome for `/documents-v2`. Lives in the segment layout, so it
 * survives doc-to-doc navigation: only `{children}` (the slug-specific
 * reader pane + inspector) sits inside the loading boundary. The active
 * library card and top-bar breadcrumbs update from already-loaded library
 * data, no skeleton needed.
 */
export function DocsV2Shell({ library, children }: DocsV2ShellProps) {
  const routeLocale = useLocale() as Locale;
  const t = useTranslations('documentsV2');
  const tSite = useTranslations('public.site');
  // The active doc's slug is the next segment under this layout, e.g. for
  // `/[locale]/documents-v2/foo` this returns `'foo'`. On the index route
  // (`/[locale]/documents-v2`) it returns null and we render with no active
  // card / no breadcrumb tail.
  const activeSlug = useSelectedLayoutSegment();
  const activeMeta = useMemo(
    () => (activeSlug ? library.find((m) => m.slug === activeSlug) ?? null : null),
    [activeSlug, library],
  );

  const docLocale = routeLocale as unknown as DocumentV2Locale;
  const docFallback = fallbackLocale as unknown as DocumentV2Locale;

  // Same shell on both routes. On the index there is no active document, so
  // we omit the right-hand inspector column and let the centre catalog pane
  // expand to fill its slot. The library rail stays in place across both
  // routes so the chrome doesn't shift between catalog and reader views.
  const isIndex = activeSlug === null;
  const shellIsRtl = routeLocale === 'he';
  const BackArrow = shellIsRtl ? ArrowRight : ArrowLeft;

  return (
    <DocsV2LibraryProvider value={{ library, activeMeta }}>
      <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
        <div
          dir={shellIsRtl ? 'rtl' : 'ltr'}
          className="flex shrink-0 items-center border-b px-3 py-1.5 text-[12px]"
          style={{
            background: 'var(--brand-dark)',
            borderColor: 'var(--docs-cream-3)',
            color: 'var(--docs-paper)',
          }}
        >
          <Link
            href={`/${routeLocale}`}
            className="inline-flex items-center gap-1.5 text-[var(--docs-paper)] no-underline opacity-80 hover:opacity-100"
          >
            <BackArrow className="h-3.5 w-3.5" aria-hidden />
            <span className="tracking-tight">{tSite('name')}</span>
          </Link>
        </div>
        <div
          dir={shellIsRtl ? 'rtl' : 'ltr'}
          className={cn(
            'min-h-0 flex-1 w-full overflow-hidden grid grid-cols-1',
            isIndex
              ? 'xl:grid-cols-[280px_minmax(0,1fr)]'
              : cn(
                  'md:grid-cols-[minmax(0,1fr)_320px]',
                  'xl:grid-cols-[280px_minmax(0,1fr)_320px]',
                ),
          )}
        >
          <div className="hidden xl:contents">
            <LibraryRail
              documents={library}
              locale={docLocale}
              fallback={docFallback}
              activeSlug={activeSlug ?? undefined}
              routeLocale={routeLocale}
              labels={{
                library: t('library'),
                librarySectionLabel: (n: number) => t('librarySectionLabel', { n }),
                searchPlaceholder: t('searchPlaceholder'),
                empty: t('searchEmpty'),
                collapse: t('libraryCollapse'),
              }}
            />
          </div>
          {children}
        </div>
      </div>
    </DocsV2LibraryProvider>
  );
}
