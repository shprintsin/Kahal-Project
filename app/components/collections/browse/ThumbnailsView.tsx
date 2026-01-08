import Link from 'next/link';
import { FileText } from 'lucide-react';
import type { ICollectionEntry, IVolumeEntry } from '@/types/collections';

interface VolumeWithCollection extends IVolumeEntry {
  collectionId: string;
  collectionName: string;
}

interface ThumbnailsViewProps {
  data: (ICollectionEntry | VolumeWithCollection)[];
  browseMode: 'volumes' | 'collections';
  onCollectionClick: (id: string) => void;
}

export default function ThumbnailsView({ data, browseMode, onCollectionClick }: ThumbnailsViewProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 text-right">
      {data.map((item) => {
        if (browseMode === 'volumes') {
          const volume = item as VolumeWithCollection;
          const pageCount = volume.total_pages || volume.pages?.length || 0;
          
          return (
            <Link
              key={volume.id}
              href={`/collections/${volume.collectionId}/volumes/${volume.id}`}
              className="bg-white border border-gray-200 hover:shadow-md transition-shadow overflow-hidden group"
            >
              {/* Thumbnail Placeholder */}
              <div className="bg-gray-100 aspect-square flex items-center justify-center border-b border-gray-200">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>

              {/* Content */}
              <div className="p-3">
                <h3 className="text-sm font-bold text-[#1a472a] line-clamp-2 group-hover:text-[#131e1e] mb-1 font-['Secular_One']">
                  {volume.metadata.title}
                </h3>
                <p className="text-xs text-gray-600 italic">
                  {pageCount} קבצים
                </p>
              </div>
            </Link>
          );
        } else {
          const collection = item as ICollectionEntry;
          const volumeCount = collection.volumes?.length || 0;
          
          return (
            <Link
              key={collection.id}
              href={`/collections/${collection.id}`}
              className="bg-white border border-gray-200 hover:shadow-md transition-shadow overflow-hidden block"
            >
              {/* Thumbnail Placeholder */}
              <div className="bg-gray-100 aspect-square flex items-center justify-center border-b border-gray-200">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>

              {/* Content */}
              <div className="p-3">
                <h3 className="text-sm font-bold text-[#1a472a] line-clamp-2 mb-1 font-['Secular_One']">
                  {collection.id}
                </h3>
                <p className="text-xs text-gray-600 italic">
                  {volumeCount} כרכים
                </p>
              </div>
            </Link>
          );
        }
      })}
    </div>
  );
}
