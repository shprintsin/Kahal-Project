import CollectionDetailView from '@/app/components/collections/browse/CollectionDetailView';
import type { Collection } from '@/types/collections';
import { notFound } from 'next/navigation';

function getApiUrl(): string {
  if (process.env.NEXT_PUBLIC_ADMIN_API_URL) return process.env.NEXT_PUBLIC_ADMIN_API_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

async function getCollection(id: string): Promise<Collection | null> {
  try {
    const res = await fetch(`${getApiUrl()}/api/collections/${id}`, {
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
