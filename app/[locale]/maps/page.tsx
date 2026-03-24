import type { Metadata } from 'next';

import { listCategoriesAPI } from '@/app/admin/actions/categories';
import { listMapsAPI } from '@/app/admin/actions/maps';
import { getSiteShellData } from '@/app/lib/get-navigation';
import { getDateLocale, type Locale } from '@/lib/i18n/config';
import { createPageMetadata } from '@/lib/i18n/metadata';
import { MapsPageClient } from './MapsPageClient';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return createPageMetadata(locale, 'public.maps.title', '/maps');
}

export default async function MapsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dateLocale = getDateLocale(locale as Locale);

  const [mapsData, categoriesData, shellData] = await Promise.all([
    listMapsAPI({ status: 'published', limit: 100 }),
    listCategoriesAPI({}),
    getSiteShellData(locale),
  ]);

  const maps = (mapsData.maps || []).map((m: any) => ({
    id: m.id,
    title: m.title,
    excerpt: m.description,
    thumbnail: m.thumbnail?.url,
    slug: `/maps/${m.slug}`,
    date: m.createdAt ? new Date(m.createdAt).toLocaleDateString(dateLocale) : null,
    category: m.category?.title,
    year: m.year,
    period: m.period,
    layerCount: m.layerCount,
    layerTypes: m.layerTypes || []
  }));

  const categories = (categoriesData.categories || []).map((c) => ({
    name: c.title,
    count: c.usageCount?.maps || 0,
    slug: `/categories/${c.slug}`,
  }));

  return <MapsPageClient
    initialMaps={maps}
    categories={categories}
    shellData={shellData}
  />;
}
