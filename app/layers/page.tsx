import { LayersPageClient } from './LayersPageClient'

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';

export default async function LayersPage() {
  const { getLayers, getCategories } = await import('@/lib/api');
  
  const [layersData, categoriesData] = await Promise.all([
    getLayers(),
    getCategories(),
  ]);

  const layers = (layersData.docs || []).map((l: any) => ({
    id: l.id,
    name: l.name,
    description: l.description,
    slug: l.slug,
    type: l.type,
    category: l.category?.title,
    minYear: l.minYear,
    maxYear: l.maxYear,
    mapCount: l._count?.maps || 0,
    thumbnail: l.thumbnail,
    createdAt: l.createdAt
  }));

  const categories = (categoriesData.docs || []).map((c) => ({
    name: c.title,
    count: 0,
    slug: `/categories/${c.slug}`,
  }));

  return <LayersPageClient 
    initialLayers={layers}
    categories={categories}
  />;
}
