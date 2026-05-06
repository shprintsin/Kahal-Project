import { notFound } from 'next/navigation'
import { CategoryPageClient } from './CategoryPageClient'
import { getSiteShellData } from '@/app/lib/get-navigation'
import { getDateLocale, type Locale } from '@/lib/i18n/config'
import { pickI18n } from '@/app/lib/pick-i18n'

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

  const loc = locale as Locale;
  const posts = (postsData.posts || []).map((p) => ({
    id: p.id,
    title: pickI18n(p.title, loc),
    excerpt: typeof p.excerpt === 'string' ? p.excerpt : pickI18n(p.excerpt, loc) || undefined,
    thumbnail: p.thumbnail?.url ?? null,
    slug: `/posts/${p.slug}`,
    date: p.createdAt ? new Date(p.createdAt).toLocaleDateString(dateLocale) : null,
  }));

  const categories = (categoriesData.categories || []).map((c) => ({
    name: pickI18n(c.title, loc),
    count: c.usageCount?.total || 0,
    slug: `/categories/${c.slug}`,
  }));

  const recentPosts = (postsData.posts || []).slice(0, 3).map((p) => ({
    title: pickI18n(p.title, loc),
    slug: `/posts/${p.slug}`,
  }));

  const category = {
    id: categoryData.id,
    title: pickI18n(categoryData.title, loc),
    slug: categoryData.slug,
    postsCount: categoryData.usageCount?.total ?? 0,
  };

  return <CategoryPageClient
    category={category}
    initialPosts={posts}
    categories={categories}
    recentPosts={recentPosts}
    shellData={shellData}
    locale={locale}
  />;
}
