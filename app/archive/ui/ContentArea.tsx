'use client';

import { useEffect, useState } from 'react';
import { CollectionWithSeries, SeriesWithVolumes } from '@/types/collections';
import { getSeriesWithVolumes } from '@/app/actions/collections';
import { EmptyState } from './EmptyState';
import { CollectionView } from './CollectionView';
import { SeriesView } from './SeriesView';
import { Breadcrumbs } from './Breadcrumbs';


interface ContentAreaProps {
  collections: CollectionWithSeries[];
  selectedCollectionSlug: string | null;
  selectedSeriesSlug: string | null;
  onSelectSeries: (seriesSlug: string) => void;
}

export function ContentArea({ 
  collections,
  selectedCollectionSlug, 
  selectedSeriesSlug,
  onSelectSeries 
}: ContentAreaProps) {
  const [seriesData, setSeriesData] = useState<SeriesWithVolumes | null>(null);
  const [loading, setLoading] = useState(false);

  // Find collection by slug from the initial data
  const collection = collections.find(c => c.id === selectedCollectionSlug) || null;

  // Fetch series with volumes when both collection and series are selected
  useEffect(() => {
    if (!selectedCollectionSlug || !selectedSeriesSlug) {
      setSeriesData(null);
      return;
    }

    setLoading(true);
    getSeriesWithVolumes(selectedCollectionSlug, selectedSeriesSlug)
      .then(setSeriesData)
      .catch(err => console.error('Error fetching series volumes:', err))
      .finally(() => setLoading(false));
  }, [selectedCollectionSlug, selectedSeriesSlug]);

  // Determine view state and render
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-600">טוען...</p>
      </div>
    );
  }

  // Series view (with volumes)
  if (selectedSeriesSlug && selectedCollectionSlug && seriesData && collection) {
    return (
      <>
        <Breadcrumbs items={[
          { label: 'ארכיון', href: '/archive', isActive: false },
          { label: collection.nameI18n?.he || collection.name, isActive: false },
          { label: seriesData.nameI18n?.he || seriesData.slug, isActive: true }
        ]} />
        <SeriesView 
          series={seriesData} 
          volumes={seriesData.volumes}
          collectionSlug={selectedCollectionSlug}
          seriesSlug={selectedSeriesSlug}
        />
      </>
    );
  }

  // Collection view (with series grid)
  if (selectedCollectionSlug && collection) {
    return (
      <>
        <Breadcrumbs items={[
          { label: 'ארכיון', href: '/archive', isActive: false },
          { label: collection.nameI18n?.he || collection.name, isActive: true }
        ]} />
        <CollectionView 
          collection={collection}
          collectionSlug={selectedCollectionSlug}
          onSelectSeries={onSelectSeries}
        />
      </>
    );
  }

  // Empty state (nothing selected)
  return <EmptyState />;
}


