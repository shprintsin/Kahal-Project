import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { ViewerProvider } from '@/contexts/ViewerContext';
import { getVolumeWithPages } from '@/app/actions/collections';
import VolumeViewer from './VolumeViewer';

interface PageProps {
  params: Promise<{
    collectionSlug: string;
    seriesSlug: string;
    volumeSlug: string;
  }>;
  searchParams: Promise<{
    page?: string;
    pageRange?: string;
  }>;
}

export default async function VolumePage({ params, searchParams }: PageProps) {
  const { collectionSlug, seriesSlug, volumeSlug } = await params;
  const { page, pageRange } = await searchParams;
  
  try {
    const volume = await getVolumeWithPages(collectionSlug, seriesSlug, volumeSlug);
    
    if (!volume) {
      notFound();
    }

    const initialPage = page ? parseInt(page, 10) : 1;
    
    // Parse page range if provided (format: "5-10")
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
          <VolumeViewer 
            volume={volume}
            collectionSlug={collectionSlug}
            seriesSlug={seriesSlug}
            volumeSlug={volumeSlug}
          />
        </Suspense>
      </ViewerProvider>
    );
  } catch (error) {
    console.error('Error loading volume:', error);
    notFound();
  }
}
