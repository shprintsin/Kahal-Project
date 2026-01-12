import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { ViewerProvider } from '@/contexts/ViewerContext';
import StandaloneViewer from '@/app/components/collections/StandaloneViewer';
import type { IVolumeEntry } from '@/types/collections';

interface PageProps {
  params: Promise<{
    collectionId: string;
    volumeId: string;
  }>;
  searchParams: Promise<{
    page?: string;
    pageRange?: string;
  }>;
}

function getApiUrl(): string {
  if (process.env.NEXT_PUBLIC_ADMIN_API_URL) return process.env.NEXT_PUBLIC_ADMIN_API_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

async function getVolumeData(
  collectionId: string,
  volumeId: string
): Promise<IVolumeEntry | null> {
  try {
    const res = await fetch(`${getApiUrl()}/api/collections/${collectionId}/volumes/${volumeId}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching volume:', error);
    return null;
  }
}

export default async function StandaloneViewerPage({ params, searchParams }: PageProps) {
  const { collectionId, volumeId } = await params;
  const { page, pageRange } = await searchParams;
  
  const volume = await getVolumeData(collectionId, volumeId);
  
  if (!volume) {
    notFound();
  }

  const initialPage = page ? parseInt(page, 10) : 1;
  
  let initialPageRange;
  if (pageRange) {
    const match = pageRange.match(/^(\d+)-(\d+)$/);
    if (match) {
      const start = parseInt(match[1], 10);
      const end = parseInt(match[2], 10);
      if (start <= end) {
        initialPageRange = { start, end };
      }
    }
  }

  return (
    <ViewerProvider 
      initialPage={initialPage}
      initialPageRange={initialPageRange}
    >
      <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
        <StandaloneViewer 
          volume={volume}
          collectionId={collectionId}
          volumeId={volumeId}
        />
      </Suspense>
    </ViewerProvider>
  );
}
