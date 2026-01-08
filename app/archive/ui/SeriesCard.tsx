'use client';

import { Card, CardHeader, CardContent, CardFooter } from '@/app/components/layout/ui/Components';
import { Series, SeriesWithVolumes } from '@/types/collections';
import Link from 'next/link';

interface SeriesCardProps {
  series: Series | SeriesWithVolumes;
  href: string;
}

export function SeriesCard({ series, href }: SeriesCardProps) {
  const name = series.nameI18n?.he || series.nameI18n?.en || series.name;
  const description = series.descriptionI18n?.he || series.descriptionI18n?.en || series.description;
  const thumbnailUrl = series.thumbnail?.url;

  return (
    <Link href={href}>
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
      >
        {thumbnailUrl && (
          <div className="w-full h-48 bg-gray-100 mb-4 rounded-md overflow-hidden">
            <img 
              src={thumbnailUrl} 
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <CardHeader>{name}</CardHeader>
        
        {description && (
          <CardContent className="line-clamp-2 text-sm">
            {description}
          </CardContent>
        )}
        
        <CardFooter>
          <span>{series.volumes?.length || series.volumeCount || 0} כרכים</span>
          {series.yearMin && series.yearMax && (
            <span>{series.yearMin}-{series.yearMax}</span>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
