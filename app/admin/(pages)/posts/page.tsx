import { getPosts } from "@/app/admin/actions/posts";
import { pickI18n } from "@/lib/i18n/fallback";
import { PostsClientPage } from "./posts-client-page";

export default async function PostsPage() {
  const posts = await getPosts();
  const normalized = posts.map((p: any) => ({
    ...p,
    title: pickI18n(p.title, 'en'),
    categories: (p.categories || []).map((c: any) => ({ ...c, title: pickI18n(c.title, 'en') })),
  }));

  return <PostsClientPage initialPosts={normalized} />;
}
