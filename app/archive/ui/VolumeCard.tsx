'use client';

import { VolumeGridItem as Volume } from '@/types/collections';
import Link from 'next/link';
import { FileText } from 'lucide-react';

interface VolumeCardProps {
  volume: Volume;
  collectionSlug: string;
  seriesSlug: string;
}

export function VolumeCard({ volume, collectionSlug, seriesSlug }: VolumeCardProps) {
  const title = (volume.titleI18n as any)?.he || (volume.titleI18n as any)?.en || volume.slug;
  const thumbnailUrl = volume.thumbnail?.url;
  const href = `/archive/${collectionSlug}/${seriesSlug}/${volume.slug}`;

  return (
    <Link href={href}>
      <div 
        className="bg-white shadow-sm rounded-md overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      >
      {/* Thumbnail */}
      <div className="w-full aspect-[2/3] bg-gray-100 relative">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 text-right">
        <h4 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">
          {title}
        </h4>
        <div className="flex justify-between text-xs text-gray-500">
          {volume.indexNumber !== undefined && (
            <span>כרך {volume.indexNumber}</span>
          )}
          <span>{volume.pageCount} עמ׳</span>
        </div>
        {volume.year && (
          <div className="text-xs text-gray-500 mt-1">{volume.year}</div>
        )}
      </div>
      </div>
    </Link>
  );
}
