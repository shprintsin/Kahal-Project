import type { Metadata } from 'next';

import { getAllCollectionsWithSeries } from '@/app/actions/collections';
import { getSiteShellData } from '@/app/lib/get-navigation';
import { SiteShell } from '@/components/ui/site-shell';
import { getTranslations } from 'next-intl/server';
import { createPageMetadata } from '@/lib/i18n/metadata';
import { ArchiveLayout } from './ui/ArchiveLayout';
import { EmptyState } from './ui/EmptyState';
import { NavigationSidebar } from './ui/NavigationSidebar';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return createPageMetadata(locale, 'public.archive.title', '/archive');
}

export default async function ArchivePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  let collections, shellData;
  let fetchError: unknown = null;
  try {
    [collections, shellData] = await Promise.all([
      getAllCollectionsWithSeries(),
      getSiteShellData(locale),
    ]);
  } catch (error) {
    fetchError = error;
  }

  if (fetchError || !shellData) {
    const fallbackShell = shellData ?? await getSiteShellData(locale).catch(() => ({
      navigation: [],
      footerColumns: [],
      copyrightText: "",
    }));
    return (
      <SiteShell {...fallbackShell} locale={locale}>
        <div className="flex-1 p-4 sm:p-8 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">{t('public.archive.error')}</h1>
          <p className="text-gray-600 mb-4">
            {fetchError instanceof Error ? fetchError.message : t('public.archive.unknownError')}
          </p>
        </div>
      </SiteShell>
    );
  }

  if (!collections || collections.length === 0) {
    return (
      <SiteShell {...shellData} locale={locale}>
        <div className="flex-1 p-4 sm:p-8 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">{t('public.archive.noCollections')}</h1>
          <p className="text-gray-600">{t('public.archive.noCollectionsDesc')}</p>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell {...shellData} locale={locale}>
      <div className="flex-1">
        <ArchiveLayout
          sidebar={<NavigationSidebar collections={collections} />}
          content={<EmptyState />}
        />
      </div>
    </SiteShell>
  );
}
