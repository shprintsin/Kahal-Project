import type { Metadata } from 'next';

import { listCategoriesAPI } from '@/app/admin/actions/categories';
import { listPostsAPI } from '@/app/admin/actions/posts';
import { getSiteShellData } from '@/app/lib/get-navigation';
import { getDateLocale, type Locale } from '@/lib/i18n/config';
import { createPageMetadata } from '@/lib/i18n/metadata';
import { PostsPageClient } from './PostsPageClient';

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

  const posts = (postsData.posts || []).map((p) => ({
    id: p.id,
    title: p.title,
    excerpt: p.excerpt || undefined,
    thumbnail: p.thumbnail?.url || null,
    slug: p.slug,
    date: p.createdAt ? new Date(p.createdAt).toLocaleDateString(getDateLocale(locale as Locale)) : null,
    category: p.categories?.[0]?.title,
  }));

  const categories = (categoriesData.categories || []).map((c) => ({
    name: c.title,
    count: 0,
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
