import CollectionDetailView from '@/app/components/collections/browse/CollectionDetailView';
import { getCollectionDetail } from '@/app/admin/actions/collections';
import { notFound } from 'next/navigation';

export default async function SelectedCollectionPage({
  params,
}: {
  params: Promise<{ collectionId: string }>;
}) {
  const { collectionId } = await params;
  const collection = await getCollectionDetail(collectionId);

  if (!collection) {
    notFound();
  }

  return <CollectionDetailView collection={collection} />;
}
