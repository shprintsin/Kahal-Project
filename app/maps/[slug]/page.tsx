import { notFound } from 'next/navigation';
import { MapViewerClient } from './MapViewerClient';
import { getMapBySlug, getMapDeployments } from '@/app/admin/actions/maps';
import { getSiteShellData } from '@/app/lib/get-navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function MapPage({ params }: PageProps) {
  const { slug } = await params;
  const [apiMap, shellData, deployments] = await Promise.all([
    getMapBySlug(slug),
    getSiteShellData(),
    getMapDeployments(slug),
  ]);

  if (!apiMap) {
    notFound();
  }

  return <MapViewerClient map={apiMap as any} shellData={shellData} deployments={deployments} />;
}
