import { listPostsAPI } from '@/app/admin/actions/posts';
import { listCategoriesAPI } from '@/app/admin/actions/categories';
import { getSiteShellData } from '@/app/lib/get-navigation';
import { PostsPageClient } from './PostsPageClient';

export const revalidate = 60;

export default async function PostsPage() {
  const [postsData, categoriesData, shellData] = await Promise.all([
    listPostsAPI({ status: 'published', limit: 100 }),
    listCategoriesAPI({}),
    getSiteShellData(),
  ]);

  const posts = (postsData.posts || []).map((p) => ({
    id: p.id,
    title: p.title,
    excerpt: p.excerpt || undefined,
    thumbnail: p.thumbnail?.url || null,
    slug: p.slug,
    date: p.createdAt ? new Date(p.createdAt).toLocaleDateString("he-IL") : null,
    category: p.categories?.[0]?.title,
  }));

  const categories = (categoriesData.categories || []).map((c) => ({
    name: c.title,
    count: 0,
    slug: `/categories/${c.slug}`,
  }));

  return (
    <PostsPageClient
      initialPosts={posts}
      categories={categories}
      shellData={shellData}
    />
  );
}
