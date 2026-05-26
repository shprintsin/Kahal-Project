import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getPageBySlug } from '@/app/admin/actions/pages';
import { getSiteShellData } from '@/app/lib/get-navigation';
import { SiteMain, SiteShell } from '@/components/ui/site-shell';
import { getTranslations } from 'next-intl/server';
import { createLocaleAlternates } from '@/lib/i18n/metadata';
import { serializeLexical } from '@/lib/lexical';
import { pickI18n } from '@/app/lib/pick-i18n';
import type { Locale } from '@/lib/i18n/config';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getPageBySlug(slug);
  const t = await getTranslations({ locale });
  const siteName = t('public.site.name');
  const title = page ? `${pickI18n(page.title, locale as Locale)} | ${siteName}` : siteName;
  return {
    title,
    alternates: createLocaleAlternates(`/${slug}`),
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) {
    const { locale, slug } = await params;
    const [page, shellData] = await Promise.all([
        getPageBySlug(slug),
        getSiteShellData(locale),
    ]);

    if (!page) {
        notFound();
    }

    const localizedContent = pickI18n(page.content, locale as Locale);
    const htmlContent = serializeLexical(localizedContent);

    return (
        <SiteShell {...shellData} bg="bg-white" locale={locale}>
            <SiteMain>
                <div className="w-full lg:w-10/12 mx-auto">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 font-display text-foreground border-b pb-4">{pickI18n(page.title, locale as Locale)}</h1>
                    <div
                        className="prose prose-lg max-w-none"
                        dir="auto"
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                </div>
            </SiteMain>
        </SiteShell>
    );
}
