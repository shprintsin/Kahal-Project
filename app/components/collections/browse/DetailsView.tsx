import Link from 'next/link';
import type { ICollectionEntry, IVolumeEntry } from '@/types/collections';

interface VolumeWithCollection extends IVolumeEntry {
  collectionId: string;
  collectionName: string;
}

interface DetailsViewProps {
  data: (ICollectionEntry | VolumeWithCollection)[];
  browseMode: 'volumes' | 'collections';
  onCollectionClick: (id: string) => void;
}

export default function DetailsView({ data, browseMode, onCollectionClick }: DetailsViewProps) {
  return (
    <div className="bg-white border border-gray-200 divide-y divide-gray-200 text-right">
      {data.map((item, index) => {
        if (browseMode === 'volumes') {
          const volume = item as VolumeWithCollection;
          const pageCount = volume.total_pages || volume.pages?.length || 0;
          
          return (
            <Link
              key={volume.id}
              href={`/collections/${volume.collectionId}/volumes/${volume.id}`}
              className="block p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#1a472a] mb-2 font-['Secular_One']">
                    {volume.metadata.title}
                  </h3>
                  {volume.metadata.title_en && (
                    <p className="text-sm text-gray-600 mb-2">{volume.metadata.title_en}</p>
                  )}
                  <p className="text-sm text-gray-600 italic">
                    {pageCount} קבצים
                  </p>
                  {volume.metadata.description && (
                    <p className="text-gray-700 mt-3 line-clamp-2">{volume.metadata.description}</p>
                  )}
                </div>
              </div>
            </Link>
          );
        } else {
          const collection = item as ICollectionEntry;
          const volumes = collection.volumes || [];
          
          return (
            <Link 
              key={collection.id} 
              href={`/collections/${collection.id}`}
              className="p-6 block hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-xl font-bold text-[#1a472a] mb-2 font-['Secular_One']">
                {collection.id}
              </h3>
              <p className="text-sm text-gray-600 italic mb-3">
                {volumes.length} כרכים
              </p>
              <div className="space-y-2">
                {volumes.slice(0, 3).map((volume) => (
                  <Link
                    key={volume.id}
                    href={`/collections/${collection.id}/volumes/${volume.id}`}
                    className="block text-sm text-[#5c6d3f] hover:text-[#1a472a] hover:underline"
                  >
                    • {volume.metadata.title}
                  </Link>
                ))}
                {volumes.length > 3 && (
                  <p className="text-sm text-gray-500">
                    +{volumes.length - 3} כרכים נוספים
                  </p>
                )}
              </div>
            </Link>
          );
        }
      })}
    </div>
  );
}
