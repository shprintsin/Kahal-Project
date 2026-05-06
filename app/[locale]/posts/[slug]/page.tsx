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
import { pickI18n } from '@/app/lib/pick-i18n';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug);
  const t = await getTranslations({ locale });
  const siteName = t('public.site.name');
  const title = post ? `${pickI18n(post.title, locale as Locale)} | ${siteName}` : siteName;
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

    const loc = locale as Locale;
    const viewPost = {
        ...post,
        title: pickI18n(post.title, loc),
        content: serializedContent,
        subtitle: '',
        excerpt: pickI18n(post.excerpt, loc) || '',
        author: post.author?.name?.trim() || t('public.posts.anonymousAuthor'),
        category: post.categories && post.categories.length > 0 ? pickI18n(post.categories[0].title, loc) : t('public.content.defaultCategory'),
        date: post.createdAt ? new Date(post.createdAt).toLocaleDateString(getDateLocale(loc)) : "",
        imageUrl: post.thumbnail?.url || "",
        tags: (post.tags?.map((tag: { name: unknown }) => pickI18n(tag.name, loc)) || []).filter(Boolean) as string[],
        sources: post.sources ?? null,
        status: post.status,
        thumbnail: (post.thumbnail || undefined) as never,
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
