import { notFound } from 'next/navigation'
import { DatasetsPageClient } from './DatasetsPageClient'

export default async function DatasetsPage() {
  // Fetch data server-side
  const { getDatasets, getCategories } = await import('@/lib/api');
  
  const [datasetsData, categoriesData] = await Promise.all([
    getDatasets(),
    getCategories(),
  ]);

  const datasets = (datasetsData.docs || []).map((d) => ({
    id: d.id,
    title: d.title,
    excerpt: d.description,
    thumbnail: d.thumbnail?.url,
    slug: `/data/${d.slug}`,
    date: d.createdAt ? new Date(d.createdAt).toLocaleDateString("he-IL") : null,
    category: d.category?.title,
    resourceCount: d.resourceCount
  }));

  const categories = (categoriesData.docs || []).map((c) => ({
    name: c.title,
    count: 0,
    slug: `/categories/${c.slug}`,
  }));

  return <DatasetsPageClient 
    initialDatasets={datasets}
    categories={categories}
  />;
}
