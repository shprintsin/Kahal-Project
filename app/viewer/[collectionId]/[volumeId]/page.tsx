import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { ViewerProvider } from '@/contexts/ViewerContext';
import StandaloneViewer from '@/app/components/collections/StandaloneViewer';
import { getVolumeWithPagesById } from '@/app/admin/actions/collections';
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

export default async function StandaloneViewerPage({ params, searchParams }: PageProps) {
  const { collectionId, volumeId } = await params;
  const { page, pageRange } = await searchParams;

  const volume = await getVolumeWithPagesById(volumeId);

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
          volume={volume as unknown as IVolumeEntry}
          collectionId={collectionId}
          volumeId={volumeId}
        />
      </Suspense>
    </ViewerProvider>
  );
}
