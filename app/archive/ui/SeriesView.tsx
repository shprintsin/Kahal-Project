'use client';

import { PageTitle, MetaRow, MetaItem } from '@/app/components/layout/ui/Components';
import { SeriesWithVolumes, VolumeGridItem } from '@/types/collections';
import { VolumeCard } from './VolumeCard';
import { Calendar, BookOpen } from 'lucide-react';

interface SeriesViewProps {
  series: SeriesWithVolumes;
  volumes: VolumeGridItem[];
  collectionSlug: string;
  seriesSlug: string;
}

export function SeriesView({ series, volumes, collectionSlug, seriesSlug }: SeriesViewProps) {
  const name = series.nameI18n?.he || series.nameI18n?.en || series.slug;
  const description = series.descriptionI18n?.he || series.descriptionI18n?.en;

  return (
    <div className="space-y-6">
      {/* Series Header */}
      <div>
        <PageTitle>{name}</PageTitle>
        
        <MetaRow>
          {series.yearMin && series.yearMax && (
            <MetaItem icon={Calendar}>
              {series.yearMin}-{series.yearMax}
            </MetaItem>
          )}
          <MetaItem icon={BookOpen}>
            {volumes.length} כרכים
          </MetaItem>
        </MetaRow>

        {description && (
          <p className="text-gray-600 mt-4 text-right">{description}</p>
        )}
      </div>

      {/* Volumes Grid */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-right">
          כרכים ({volumes.length})
        </h3>
        
        {volumes.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {volumes.map(volume => (
              <VolumeCard 
                key={volume.id} 
                volume={volume}
                collectionSlug={collectionSlug}
                seriesSlug={seriesSlug}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 p-12 text-center rounded-md">
            <p className="text-gray-600">אין כרכים זמינים</p>
          </div>
        )}
      </div>
    </div>
  );
}
