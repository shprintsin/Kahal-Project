import { listLayersAPI } from '@/app/admin/actions/layers';
import { listCategoriesAPI } from '@/app/admin/actions/categories';
import { LayersPageClient } from './LayersPageClient';

export const revalidate = 60;

export default async function LayersPage() {
  
  const [layersData, categoriesData] = await Promise.all([
    listLayersAPI({ status: 'published', limit: 100 }),
    listCategoriesAPI({}),
  ]);

  const layers = (layersData.layers || []).map((l: any) => ({
    id: l.id,
    name: l.name,
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
    count: 0,
    slug: `/categories/${c.slug}`,
  }));

  return <LayersPageClient 
    initialLayers={layers}
    categories={categories}
  />;
}
