import type { Metadata } from 'next';

import { getAllCollectionsWithSeries } from '@/app/actions/collections';
import { getSiteShellData } from '@/app/lib/get-navigation';
import { SiteShell } from '@/components/ui/site-shell';
import { getTranslation, loadTranslations } from '@/lib/i18n/load-translations';
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
  const translations = loadTranslations(locale);
  const t = (key: string) => getTranslation(translations, key);

  try {
    const [collections, shellData] = await Promise.all([
      getAllCollectionsWithSeries(),
      getSiteShellData(locale),
    ]);

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
  } catch (error) {
    console.error('Error in ArchivePage:', error);
    const fallbackShell = await getSiteShellData(locale).catch(() => ({
      navigation: [],
      footerColumns: [],
      copyrightText: "",
    }));
    return (
      <SiteShell {...fallbackShell} locale={locale}>
        <div className="flex-1 p-4 sm:p-8 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">{t('public.archive.error')}</h1>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : t('public.archive.unknownError')}
          </p>
        </div>
      </SiteShell>
    );
  }
}
