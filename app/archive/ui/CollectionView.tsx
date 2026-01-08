'use client';

import { PageTitle, PageSubtitle, Card } from '@/app/components/layout/ui/Components';
import { CollectionWithSeries } from '@/types/collections';
import { SeriesCard } from './SeriesCard';

interface CollectionViewProps {
  collection: CollectionWithSeries;
  collectionSlug: string;
  onSelectSeries?: (seriesSlug: string) => void;
}

export function CollectionView({ collection, collectionSlug, onSelectSeries }: CollectionViewProps) {
  const name = collection.nameI18n?.he || collection.nameI18n?.en || collection.name;
  const description = collection.descriptionI18n?.he || collection.descriptionI18n?.en || collection.description;

  return (
    <div className="space-y-6">
      {/* Collection Header */}
      <div>
        <PageTitle>{name}</PageTitle>
        {description && (
          <PageSubtitle>{description}</PageSubtitle>
        )}
      </div>

      {/* Series Grid */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-right">
          סדרות באוסף ({collection.series?.length || 0})
        </h3>
        
        {collection.series && collection.series.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collection.series.map(series => (
              <SeriesCard 
                key={series.slug} 
                series={series}
                href={`/archive/${collectionSlug}/${series.slug}`}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-8">
            <p className="text-gray-500">אין סדרות באוסף זה</p>
          </Card>
        )}
      </div>
    </div>
  );
}
