import { notFound } from 'next/navigation'
import { MapsPageClient } from './MapsPageClient'

export default async function MapsPage() {
  // Fetch data server-side
  const { getMaps, getCategories } = await import('@/lib/api');
  
  const [mapsData, categoriesData] = await Promise.all([
    getMaps(),
    getCategories(),
  ]);

  const maps = (mapsData.docs || []).map((m) => ({
    id: m.id,
    title: m.title,
    excerpt: m.description,
    thumbnail: m.thumbnail?.url,
    slug: `/maps/${m.slug}`,
    date: m.createdAt ? new Date(m.createdAt).toLocaleDateString("he-IL") : null,
    category: m.category?.title,
    year: m.year,
    period: m.period,
    layerCount: m.layerCount
  }));

  const categories = (categoriesData.docs || []).map((c) => ({
    name: c.title,
    count: 0,
    slug: `/categories/${c.slug}`,
  }));

  return <MapsPageClient 
    initialMaps={maps}
    categories={categories}
  />;
}
