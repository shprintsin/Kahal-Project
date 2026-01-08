'use client';

import { useState } from 'react';
import { CollectionWithSeries } from '@/types/collections';
import { ArchiveLayout } from './ui/ArchiveLayout';
import { NavigationSidebar } from './ui/NavigationSidebar';
import { ContentArea } from './ui/ContentArea';

interface ArchiveClientProps {
  initialCollections: CollectionWithSeries[];
}

export function ArchiveClient({ initialCollections }: ArchiveClientProps) {
  const [selectedCollectionSlug, setSelectedCollectionSlug] = useState<string | null>(null);
  const [selectedSeriesSlug, setSelectedSeriesSlug] = useState<string | null>(null);

  return (
    <ArchiveLayout
      sidebar={
        <NavigationSidebar
          collections={initialCollections}
          selectedCollectionSlug={selectedCollectionSlug}
          selectedSeriesSlug={selectedSeriesSlug}
          onSelectCollection={setSelectedCollectionSlug}
          onSelectSeries={setSelectedSeriesSlug}
        />
      }
      content={
        <ContentArea
          collections={initialCollections}
          selectedCollectionSlug={selectedCollectionSlug}
          selectedSeriesSlug={selectedSeriesSlug}
          onSelectSeries={setSelectedSeriesSlug}
        />
      }
    />
  );
}

