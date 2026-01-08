import { notFound } from 'next/navigation';
import { MapViewerClient } from './MapViewerClient';
import { getMap } from '@/lib/api';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function MapPage({ params }: PageProps) {
  const { slug } = await params;
  const apiMap = await getMap(slug);

  if (!apiMap) {
    notFound();
  }

  return <MapViewerClient map={apiMap} />;
}
