import CollectionsBrowse from '@/app/components/collections/browse/CollectionsBrowse';
import { getAllCollectionsWithSeries, getAllSeries } from '@/app/actions/collections';
import { Suspense } from 'react';

export const revalidate = 60;

export default async function CollectionsPageView() {
  const [collections, allSeries] = await Promise.all([
    getAllCollectionsWithSeries(),
    getAllSeries(),
  ]);

  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">טוען אוספים...</div>}>
      <CollectionsBrowse collections={collections} allSeries={allSeries} />
    </Suspense>
  );
}
