"use client";

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { VolumeGridItem } from '@/types/collections';

interface VolumeGridProps {
  volumes: VolumeGridItem[];
  collectionId?: string;
}

export default function VolumeGrid({ volumes, collectionId }: VolumeGridProps) {
  const router = useRouter();

  const handleVolumeClick = (volume: VolumeGridItem) => {
    // Navigate to the volume viewer
    const volumePath = `/collections/${collectionId || volume.series?.collectionId}/volumes/${volume.id}`;
    router.push(volumePath);
  };

  // Ensure volumes is an array
  if (!Array.isArray(volumes)) {
    console.error('VolumeGrid: volumes is not an array', volumes);
    return (
      <div className="bg-white border border-gray-200 p-12 text-center">
        <p className="text-gray-600">שגיאה בטעינת כרכים</p>
      </div>
    );
  }

  if (volumes.length === 0) {
    return (
      <div className="bg-white border border-gray-200 p-12 text-center">
        <p className="text-gray-600">אין כרכים זמינים</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4 bg-white border border-gray-200">
      {volumes.map((volume) => {
        const title = (volume.titleI18n?.he || volume.titleI18n?.en || volume.title || 'ללא שם');
        const thumbnailUrl = volume.thumbnail?.url;
        
        return (
          <div
            key={volume.id}
            onClick={() => handleVolumeClick(volume)}
            className="group cursor-pointer bg-white border border-gray-200 hover:border-[#1a472a] hover:shadow-md transition-all duration-200"
          >
            {/* Thumbnail */}
            <div className="aspect-[3/4] relative bg-gray-100 overflow-hidden">
              {thumbnailUrl ? (
                <Image
                  src={thumbnailUrl}
                  alt={title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-3 text-right">
              <h3 className="font-bold text-sm line-clamp-2 mb-1 group-hover:text-[#1a472a] font-['Secular_One']" dir="rtl">
                {title}
              </h3>
              {volume.indexNumber !== undefined && (
                <p className="text-xs text-gray-500" dir="rtl">
                  כרך {volume.indexNumber}
                </p>
              )}
              {volume.pageCount !== undefined && (
                <p className="text-xs text-gray-500" dir="rtl">
                  {volume.pageCount} עמודים
                </p>
              )}
              {volume.year && (
                <p className="text-xs text-gray-500">
                  {volume.year}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
