import CollectionDetailView from '@/app/components/collections/browse/CollectionDetailView';
import { getCollectionDetail } from '@/app/admin/actions/collections';
import { getSiteShellData } from '@/app/lib/get-navigation';
import { notFound } from 'next/navigation';

export default async function SelectedCollectionPage({
  params,
}: {
  params: Promise<{ collectionId: string }>;
}) {
  const { collectionId } = await params;
  const [collection, siteShellData] = await Promise.all([
    getCollectionDetail(collectionId),
    getSiteShellData(),
  ]);

  if (!collection) {
    notFound();
  }

  return <CollectionDetailView collection={collection as any} siteShellData={siteShellData} />;
}
