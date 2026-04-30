'use client';

import React, { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSelectedLayoutSegment } from 'next/navigation';
import { cn } from '@/lib/utils';
import { fallbackLocale, type Locale } from '@/lib/i18n/config';
import {
  resolveI18nString,
  type DocumentV2LibraryMeta,
  type DocumentV2Locale,
} from '@/types/document-v2';
import { DocsV2LibraryProvider } from './DocsV2LibraryContext';
import { DocumentTopBar } from './DocumentTopBar';
import { LibraryRail } from './LibraryRail';

interface DocsV2ShellProps {
  library: DocumentV2LibraryMeta[];
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
  const activeTitle = activeMeta
    ? resolveI18nString(activeMeta.title, docLocale, docFallback) || activeMeta.slug
    : '';

  // The index route (`/documents-v2`) is itself a catalog view, so showing
  // the library rail beside it is redundant and squeezes the catalog into a
  // narrow column. When there's no active slug we drop the rail and collapse
  // the grid to a single full-width column for the index page's children.
  const isIndex = activeSlug === null;

  return (
    <DocsV2LibraryProvider value={{ library, activeMeta }}>
      <div className="flex h-[calc(100vh-64px)] w-full flex-col overflow-hidden bg-background">
        <DocumentTopBar
          title={activeTitle}
          archiveName={activeMeta?.archive?.name}
          routeLocale={routeLocale}
          labels={{
            library: t('topbarLibrary'),
            searchPlaceholder: t('topbarSearchPlaceholder'),
            searchHint: t('topbarSearchHint'),
          }}
        />
        <div
          className={cn(
            'min-h-0 flex-1 w-full overflow-hidden',
            isIndex
              ? 'block overflow-y-auto'
              : cn(
                  'grid grid-cols-1',
                  'md:grid-cols-[minmax(0,1fr)_320px]',
                  'xl:grid-cols-[280px_minmax(0,1fr)_320px]',
                ),
          )}
        >
          {!isIndex && (
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
          )}
          {children}
        </div>
      </div>
    </DocsV2LibraryProvider>
  );
}
