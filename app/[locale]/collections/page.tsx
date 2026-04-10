import type { Metadata } from 'next';
import { Suspense } from 'react';

import { getAllCollectionsWithSeries, getAllSeries } from '@/app/actions/collections';
import CollectionsBrowse from '@/app/components/collections/browse/CollectionsBrowse';
import { getSiteShellData } from '@/app/lib/get-navigation';
import { getTranslations } from 'next-intl/server';
import { createPageMetadata } from '@/lib/i18n/metadata';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return createPageMetadata(locale, 'public.collections.title', '/collections');
}

export default async function CollectionsPageView({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const [collections, allSeries, shellData] = await Promise.all([
    getAllCollectionsWithSeries(),
    getAllSeries(),
    getSiteShellData(locale),
  ]);

  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">{t('public.collections.loading')}</div>}>
      <CollectionsBrowse collections={collections} allSeries={allSeries} siteShellData={shellData} />
    </Suspense>
  );
}
