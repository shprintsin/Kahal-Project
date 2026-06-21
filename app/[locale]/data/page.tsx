import type { Metadata } from 'next';

import { listCategoriesAPI } from '@/app/admin/actions/categories';
import { listDatasetsAPI } from '@/app/admin/actions/datasets';
import { getSiteShellData } from '@/app/lib/get-navigation';
import { getDateLocale, type Locale } from '@/lib/i18n/config';
import { createPageMetadata } from '@/lib/i18n/metadata';
import { DatasetsPageClient } from './DatasetsPageClient';
import { pickI18n } from '@/app/lib/pick-i18n';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return createPageMetadata(locale, 'public.datasets.title', '/data');
}

export default async function DatasetsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const [datasetsData, categoriesData, shellData] = await Promise.all([
    listDatasetsAPI({ status: 'published', limit: 100, lang: locale }),
    listCategoriesAPI({ lang: locale }),
    getSiteShellData(locale),
  ]);

  const loc = locale as Locale;
  const datasets = (datasetsData.datasets || []).map((d) => ({
    id: d.id,
    title: d.title,
    excerpt: d.summary || d.description || undefined,
    thumbnail: d.thumbnail?.url ?? null,
    slug: `/data/${d.slug}`,
    date: d.createdAt ? new Date(d.createdAt).toLocaleDateString(getDateLocale(loc)) : null,
    category: d.category?.title || null,
    resourceCount: d.resourceCount
  }));

  const categories = (categoriesData.categories || []).map((c) => ({
    name: pickI18n(c.title, loc),
    count: c.usageCount?.datasets || 0,
    slug: `/categories/${c.slug}`,
  }));

  return <DatasetsPageClient
    initialDatasets={datasets}
    categories={categories}
    shellData={shellData}
  />;
}
