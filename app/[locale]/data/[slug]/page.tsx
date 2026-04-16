import { notFound } from 'next/navigation';
import { getMapBySlug, getMapDeployments } from '@/app/admin/actions/maps';
import { getSiteShellData } from '@/app/lib/get-navigation';
import { MapViewerClient } from '@/app/[locale]/maps/[slug]/MapViewerClient';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function DatasetPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const [apiDataset, shellData, deployments] = await Promise.all([
    getMapBySlug(slug, { lang: locale, includeLayers: true, includeResources: true }),
    getSiteShellData(locale),
    getMapDeployments(slug),
  ]);

  if (!apiDataset) {
    notFound();
  }

  return <MapViewerClient map={apiDataset as any} shellData={shellData} deployments={deployments} locale={locale} />;
}
