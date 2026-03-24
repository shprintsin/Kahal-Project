import type { Metadata } from 'next';

import { listCategoriesAPI } from '@/app/admin/actions/categories';
import { listLayersAPI } from '@/app/admin/actions/layers';
import { getSiteShellData } from '@/app/lib/get-navigation';
import { createPageMetadata } from '@/lib/i18n/metadata';
import { LayersPageClient } from './LayersPageClient';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return createPageMetadata(locale, 'public.layers.title', '/layers');
}

export default async function LayersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [layersData, categoriesData, shellData] = await Promise.all([
    listLayersAPI({ status: 'published', limit: 100 }),
    listCategoriesAPI({}),
    getSiteShellData(locale),
  ]);

  const layers = (layersData.layers || []).map((l: any) => ({
    id: l.id,
    title: l.name,
    name: l.name,
    excerpt: l.description,
    description: l.description,
    slug: l.slug,
    type: l.type,
    category: l.category?.title,
    minYear: l.minYear,
    maxYear: l.maxYear,
    mapCount: l.mapsCount || 0,
    thumbnail: l.thumbnail,
    createdAt: l.createdAt
  }));

  const categories = (categoriesData.categories || []).map((c) => ({
    name: c.title,
    count: c.usageCount?.total || 0,
    slug: `/categories/${c.slug}`,
  }));

  return <LayersPageClient
    initialLayers={layers}
    categories={categories}
    shellData={shellData}
  />;
}
