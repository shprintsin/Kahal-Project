import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getPostBySlug } from '@/app/admin/actions/posts';
import PostPage from '@/app/components/pages_components/PostPage';
import { getSiteShellData } from '@/app/lib/get-navigation';
import { SiteShell } from '@/components/ui/site-shell';
import { SetEditUrl } from '@/components/ui/admin-toolbar';
import { getDateLocale, type Locale } from '@/lib/i18n/config';
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

export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) {
    const { locale, slug } = await params;
    const [post, shellData] = await Promise.all([
        getPostBySlug(slug),
        getSiteShellData(locale),
    ]);

    if (!post) {
        notFound();
    }

    const t = await getTranslations({ locale });
    const serializedContent = serializeLexical(post.content);

    const viewPost = {
        ...post,
        content: serializedContent,
        subtitle: '',
        excerpt: post.excerpt || '',
        author: post.author?.name?.trim() || t('public.posts.anonymousAuthor'),
        category: post.categories && post.categories.length > 0 ? post.categories[0].title : t('public.content.defaultCategory'),
        date: post.createdAt ? new Date(post.createdAt).toLocaleDateString(getDateLocale(locale as Locale)) : "",
        imageUrl: post.thumbnail?.url || "",
        tags: post.tags?.map(t => t.name) || [],
        sources: post.sources ?? null,
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
