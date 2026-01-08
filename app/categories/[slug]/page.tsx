import { notFound } from 'next/navigation'
import { CategoryPageClient } from './CategoryPageClient'

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Fetch data server-side
  const { getCategory, getPostsByCategory, getCategories } = await import('@/lib/api');
  
  const [categoryData, postsData, categoriesData] = await Promise.all([
    getCategory(slug),
    getPostsByCategory(slug),
    getCategories(),
  ]);

  if (!categoryData) {
    notFound();
  }

  const posts = (postsData.docs || []).map((p) => ({
    id: p.id,
    title: p.title,
    excerpt: p.excerpt,
    thumbnail: p.thumbnail?.url,
    slug: `/posts/${p.slug}`,
    date: p.createdAt ? new Date(p.createdAt).toLocaleDateString("he-IL") : null,
  }));

  const categories = (categoriesData.docs || []).map((c) => ({
    name: c.title,
    count: 0,
    slug: `/categories/${c.slug}`,
  }));

  const recentPosts = (postsData.docs || []).slice(0, 3).map((p) => ({
    title: p.title,
    slug: `/posts/${p.slug}`,
  }));

  return <CategoryPageClient 
    category={categoryData} 
    initialPosts={posts}
    categories={categories}
    recentPosts={recentPosts}
  />;
}
