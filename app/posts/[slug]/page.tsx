import { getPostBySlug, listPostsAPI } from '@/app/admin/actions/posts';
import { notFound } from 'next/navigation';
import PostPage from '@/app/components/pages_components/PostPage';
import { serializeLexical } from '@/lib/lexical';
import SiteLayout from '@/app/components/layout/SiteLayout';

export async function generateStaticParams() {
    const { posts } = await listPostsAPI({ limit: 1000, status: 'published' });
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const serializedContent = serializeLexical(post.content);

    // Map API Post to PostData (expected by PostPage)
    const viewPost = {
        ...post,
        content: serializedContent,
        subtitle: '',
        excerpt: post.excerpt || '',
        author: post.author?.name || "Unknown",
        category: post.categories && post.categories.length > 0 ? post.categories[0].title : "כללי",
        date: post.createdAt ? new Date(post.createdAt).toLocaleDateString("he-IL") : "",
        imageUrl: post.thumbnail?.url || "",
        tags: post.tags?.map(t => t.name) || [],
        sources: [],
        status: post.status as any,
        thumbnail: (post.thumbnail || undefined) as any,
    };

    return (
        <SiteLayout className="bg-white">
            <PostPage post={viewPost} />
        </SiteLayout>
    );
}
