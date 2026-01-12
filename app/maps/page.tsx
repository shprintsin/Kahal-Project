import { listMapsAPI } from '@/app/admin/actions/maps';
import { listCategoriesAPI } from '@/app/admin/actions/categories';
import { MapsPageClient } from './MapsPageClient';

export const revalidate = 60;

export default async function MapsPage() {
  
  const [mapsData, categoriesData] = await Promise.all([
    listMapsAPI({ status: 'published', limit: 100 }),
    listCategoriesAPI({}),
  ]);

  const maps = (mapsData.maps || []).map((m: any) => ({
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

  const categories = (categoriesData.categories || []).map((c) => ({
    name: c.title,
    count: 0,
    slug: `/categories/${c.slug}`,
  }));

  return <MapsPageClient 
    initialMaps={maps}
    categories={categories}
  />;
}
