import type { Metadata } from 'next';

import { listCategoriesAPI } from '@/app/admin/actions/categories';
import { listDatasetsAPI } from '@/app/admin/actions/datasets';
import { getSiteShellData } from '@/app/lib/get-navigation';
import { getDateLocale, type Locale } from '@/lib/i18n/config';
import { createPageMetadata } from '@/lib/i18n/metadata';
import { DatasetsPageClient } from './DatasetsPageClient';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return createPageMetadata(locale, 'public.datasets.title', '/data');
}

export default async function DatasetsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const [datasetsData, categoriesData, shellData] = await Promise.all([
    listDatasetsAPI({ status: 'published', limit: 100 }),
    listCategoriesAPI({}),
    getSiteShellData(locale),
  ]);

  const datasets = (datasetsData.datasets || []).map((d) => ({
    id: d.id,
    title: d.title,
    excerpt: d.description || undefined,
    thumbnail: d.thumbnail?.url,
    slug: `/data/${d.slug}`,
    date: d.createdAt ? new Date(d.createdAt).toLocaleDateString(getDateLocale(locale as Locale)) : null,
    category: d.category?.title,
    resourceCount: d.resourceCount
  }));

  const categories = (categoriesData.categories || []).map((c) => ({
    name: c.title,
    count: 0,
    slug: `/categories/${c.slug}`,
  }));

  return <DatasetsPageClient
    initialDatasets={datasets}
    categories={categories}
    shellData={shellData}
  />;
}
