import Link from 'next/link';
import { FileText } from 'lucide-react';
import type { ICollectionEntry, IVolumeEntry } from '@/types/collections';

interface VolumeWithCollection extends IVolumeEntry {
  collectionId: string;
  collectionName: string;
}

interface BlocksViewProps {
  data: (ICollectionEntry | VolumeWithCollection)[];
  browseMode: 'volumes' | 'collections';
  onCollectionClick: (id: string) => void;
}

export default function BlocksView({ data, browseMode, onCollectionClick }: BlocksViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-right">
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
              <div className="bg-gray-100 h-48 flex items-center justify-center border-b border-gray-200">
                <FileText className="w-16 h-16 text-gray-400" />
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-[#1a472a] mb-2 line-clamp-2 group-hover:text-[#131e1e] font-['Secular_One']">
                  {volume.metadata.title}
                </h3>
                <p className="text-sm text-gray-600 italic mb-3">
                  {pageCount} קבצים
                </p>
                {volume.metadata.description && (
                  <p className="text-sm text-gray-700 line-clamp-3">{volume.metadata.description}</p>
                )}
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
              <div className="bg-gray-100 h-48 flex items-center justify-center border-b border-gray-200">
                <FileText className="w-16 h-16 text-gray-400" />
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-[#1a472a] mb-2 font-['Secular_One']">
                  {collection.id}
                </h3>
                <p className="text-sm text-gray-600 italic">
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
