import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getMapBySlug, getMapDeployments } from '@/app/admin/actions/maps';
import { getSiteShellData } from '@/app/lib/get-navigation';
import { getTranslations } from 'next-intl/server';
import { createLocaleAlternates } from '@/lib/i18n/metadata';
import { MapViewerClient } from './MapViewerClient';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const map = await getMapBySlug(slug, { lang: locale });
  const t = await getTranslations({ locale });
  const siteName = t('public.site.name');
  const title = map ? `${map.title} | ${siteName}` : siteName;
  return {
    title,
    alternates: createLocaleAlternates(`/maps/${slug}`),
  };
}

export default async function MapPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const [apiMap, shellData, deployments] = await Promise.all([
    getMapBySlug(slug, { lang: locale, includeLayers: true, includeResources: true }),
    getSiteShellData(locale),
    getMapDeployments(slug),
  ]);

  if (!apiMap) {
    notFound();
  }

  return <MapViewerClient map={apiMap as any} shellData={shellData} deployments={deployments} locale={locale} />;
}
