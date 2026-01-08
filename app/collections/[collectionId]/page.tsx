import CollectionDetailView from '@/app/components/collections/browse/CollectionDetailView';
import type { Collection } from '@/types/collections';
import { notFound } from 'next/navigation';

async function getCollection(id: string): Promise<Collection | null> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3001';
    const res = await fetch(`${API_URL}/api/collections/${id}`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      return null;
    }
    
    return res.json();
  } catch (error) {
    console.error(`Error fetching collection ${id}:`, error);
    return null;
  }
}

export default async function SelectedCollectionPage({
  params,
}: {
  params: Promise<{ collectionId: string }>;
}) {
  const { collectionId } = await params;
  const collection = await getCollection(collectionId);

  if (!collection) {
    notFound();
  }

  return <CollectionDetailView collection={collection} />;
}
