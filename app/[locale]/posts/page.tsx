import type { Metadata } from 'next';

import { listCategoriesAPI } from '@/app/admin/actions/categories';
import { listPostsAPI } from '@/app/admin/actions/posts';
import { getSiteShellData } from '@/app/lib/get-navigation';
import { getDateLocale, type Locale } from '@/lib/i18n/config';
import { createPageMetadata } from '@/lib/i18n/metadata';
import { PostsPageClient } from './PostsPageClient';
import { pickI18n } from '@/app/lib/pick-i18n';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return createPageMetadata(locale, 'public.posts.title', '/posts');
}

export default async function PostsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [postsData, categoriesData, shellData] = await Promise.all([
    listPostsAPI({ status: 'published', limit: 100 }),
    listCategoriesAPI({}),
    getSiteShellData(locale),
  ]);

  const loc = locale as Locale;
  const posts = (postsData.posts || []).map((p) => ({
    id: p.id,
    title: pickI18n(p.title, loc),
    excerpt: typeof p.excerpt === 'string' ? p.excerpt : pickI18n(p.excerpt, loc) || undefined,
    thumbnail: p.thumbnail?.url || null,
    slug: p.slug,
    date: p.createdAt ? new Date(p.createdAt).toLocaleDateString(getDateLocale(loc)) : null,
    category: p.categories?.[0]?.title ? pickI18n(p.categories[0].title, loc) : null,
  }));

  const categories = (categoriesData.categories || []).map((c) => ({
    name: pickI18n(c.title, loc),
    count: c.usageCount?.posts || 0,
    slug: `/${locale}/categories/${c.slug}`,
  }));

  return (
    <PostsPageClient
      initialPosts={posts}
      categories={categories}
      shellData={shellData}
    />
  );
}
