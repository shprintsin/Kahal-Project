import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getPostBySlug, listPostsAPI } from '@/app/admin/actions/posts';
import PostPage from '@/app/components/pages_components/PostPage';
import { getSiteShellData } from '@/app/lib/get-navigation';
import { SiteShell } from '@/components/ui/site-shell';
import { SetEditUrl } from '@/components/ui/admin-toolbar';
import { getDateLocale, locales, type Locale } from '@/lib/i18n/config';
import { getTranslations } from 'next-intl/server';
import { createLocaleAlternates } from '@/lib/i18n/metadata';
import { serializeLexical } from '@/lib/lexical';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug);
  const t = await getTranslations({ locale });
  const siteName = t('public.site.name');
  const title = post ? `${post.title} | ${siteName}` : siteName;
  return {
    title,
    alternates: createLocaleAlternates(`/posts/${slug}`),
  };
}

export async function generateStaticParams() {
    try {
        const { posts } = await listPostsAPI({ limit: 1000, status: 'published' });
        const params = [];
        for (const locale of locales) {
            for (const post of posts) {
                params.push({ locale, slug: post.slug });
            }
        }
        return params;
    } catch {
        return [];
    }
}

export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) {
    const { locale, slug } = await params;
    const [post, shellData] = await Promise.all([
        getPostBySlug(slug),
        getSiteShellData(locale),
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
        date: post.createdAt ? new Date(post.createdAt).toLocaleDateString(getDateLocale(locale as Locale)) : "",
        imageUrl: post.thumbnail?.url || "",
        tags: post.tags?.map(t => t.name) || [],
        sources: [],
        status: post.status as any,
        thumbnail: (post.thumbnail || undefined) as any,
    };

    return (
        <SiteShell {...shellData} locale={locale} bg="bg-white">
            <SetEditUrl url={`/admin/posts/${post.id}`} />
            <div className="flex-grow">
                <PostPage post={viewPost} locale={locale} />
            </div>
        </SiteShell>
    );
}
