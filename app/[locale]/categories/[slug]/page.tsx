import { notFound } from 'next/navigation'
import { CategoryPageClient } from './CategoryPageClient'
import { getSiteShellData } from '@/app/lib/get-navigation'
import { getDateLocale, type Locale } from '@/lib/i18n/config'

export default async function CategoryPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const dateLocale = getDateLocale(locale as Locale);

  const { getCategoryBySlug, listCategoriesAPI } = await import('@/app/admin/actions/categories');
  const { listPostsAPI } = await import('@/app/admin/actions/posts');

  const [categoryData, postsData, categoriesData, shellData] = await Promise.all([
    getCategoryBySlug(slug, { includeContent: false }),
    listPostsAPI({ categorySlug: slug, limit: 100, status: 'published' }),
    listCategoriesAPI({}),
    getSiteShellData(locale),
  ]);

  if (!categoryData) {
    notFound();
  }

  const posts = (postsData.posts || []).map((p) => ({
    id: p.id,
    title: p.title,
    excerpt: p.excerpt || undefined,
    thumbnail: p.thumbnail?.url,
    slug: `/posts/${p.slug}`,
    date: p.createdAt ? new Date(p.createdAt).toLocaleDateString(dateLocale) : null,
  }));

  const categories = (categoriesData.categories || []).map((c) => ({
    name: c.title,
    count: 0,
    slug: `/categories/${c.slug}`,
  }));

  const recentPosts = (postsData.posts || []).slice(0, 3).map((p) => ({
    title: p.title,
    slug: `/posts/${p.slug}`,
  }));

  return <CategoryPageClient
    category={categoryData}
    initialPosts={posts}
    categories={categories}
    recentPosts={recentPosts}
    shellData={shellData}
    locale={locale}
  />;
}
