import { getPostBySlug, listPostsAPI } from '@/app/admin/actions/posts';
import { notFound } from 'next/navigation';
import PostPage from '@/app/components/pages_components/PostPage';
import { serializeLexical } from '@/lib/lexical';
import { getSiteShellData } from '@/app/lib/get-navigation';
import { SiteShell } from '@/components/ui/site-shell';

export async function generateStaticParams() {
    const { posts } = await listPostsAPI({ limit: 1000, status: 'published' });
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const [post, shellData] = await Promise.all([
        getPostBySlug(slug),
        getSiteShellData(),
    ]);

    if (!post) {
        notFound();
    }

    const serializedContent = serializeLexical(post.content);

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
        <SiteShell {...shellData} bg="bg-white">
            <div className="flex-grow">
                <PostPage post={viewPost} />
            </div>
        </SiteShell>
    );
}
