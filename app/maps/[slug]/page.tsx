import { notFound } from 'next/navigation';
import { MapViewerClient } from './MapViewerClient';
import { getMapBySlug } from '@/app/admin/actions/maps';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function MapPage({ params }: PageProps) {
  const { slug } = await params;
  const apiMap = await getMapBySlug(slug);

  if (!apiMap) {
    notFound();
  }

  return <MapViewerClient map={apiMap as any} />;
}
