import { listDatasetsAPI } from '@/app/admin/actions/datasets';
import { listCategoriesAPI } from '@/app/admin/actions/categories';
import { DatasetsPageClient } from './DatasetsPageClient';

export const revalidate = 60;

export default async function DatasetsPage() {
  
  const [datasetsData, categoriesData] = await Promise.all([
    listDatasetsAPI({ status: 'published', limit: 100 }),
    listCategoriesAPI({}),
  ]);

  const datasets = (datasetsData.datasets || []).map((d) => ({
    id: d.id,
    title: d.title,
    excerpt: d.description || undefined,
    thumbnail: d.thumbnail?.url,
    slug: `/data/${d.slug}`,
    date: d.createdAt ? new Date(d.createdAt).toLocaleDateString("he-IL") : null,
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
  />;
}
