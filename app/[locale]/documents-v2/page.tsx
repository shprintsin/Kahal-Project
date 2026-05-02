import React from 'react';
import { getTranslations } from 'next-intl/server';
import { getChapterCatalog } from './lib/repository';
import { type DocumentV2Locale } from '@/types/document-v2';
import { fallbackLocale, type Locale } from '@/lib/i18n/config';
import { ChapterCatalog } from './components/ChapterCatalog';

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function DocumentsV2IndexPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'documentsV2' });
  const rows = await getChapterCatalog();
  const docLocale = locale as unknown as DocumentV2Locale;
  const docFallback = fallbackLocale as unknown as DocumentV2Locale;

  return (
    <ChapterCatalog
      rows={rows}
      locale={docLocale}
      fallback={docFallback}
      routeLocale={locale}
      labels={{
        searchPlaceholder: t('catalogSearchPlaceholder'),
        empty: t('catalogEmpty'),
        chapter: t('toolbarChapter'),
        of: t('toolbarOf'),
        mentionsJews: t('mentionsJews'),
        clear: t('catalogClear'),
        resultsTemplate: t.raw('catalogResults') as string,
      }}
    />
  );
}
