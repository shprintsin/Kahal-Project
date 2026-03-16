import CollectionsBrowse from '@/app/components/collections/browse/CollectionsBrowse';
import { getAllCollectionsWithSeries, getAllSeries } from '@/app/actions/collections';
import { getSiteShellData } from '@/app/lib/get-navigation';
import { Suspense } from 'react';

export const revalidate = 60;

export default async function CollectionsPageView() {
  const [collections, allSeries, shellData] = await Promise.all([
    getAllCollectionsWithSeries(),
    getAllSeries(),
    getSiteShellData(),
  ]);

  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">טוען אוספים...</div>}>
      <CollectionsBrowse collections={collections} allSeries={allSeries} siteShellData={shellData} />
    </Suspense>
  );
}
