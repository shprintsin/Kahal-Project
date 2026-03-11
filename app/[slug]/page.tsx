import { getPageBySlug, listPagesAPI } from '@/app/admin/actions/pages';
import { notFound } from 'next/navigation';
import { serializeLexical } from '@/lib/lexical';
import { getNavigation } from '@/app/lib/get-navigation';
import { SiteShell, SiteMain } from '@/components/ui/site-shell';

export async function generateStaticParams() {
    const { pages } = await listPagesAPI({ limit: 1000, status: 'published' });
    return pages.map((page) => ({
        slug: page.slug,
    }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const [page, navigation] = await Promise.all([
        getPageBySlug(slug),
        getNavigation(),
    ]);

    if (!page) {
        notFound();
    }

    const htmlContent = serializeLexical(page.content);

    return (
        <SiteShell navigation={navigation} bg="bg-white">
            <SiteMain>
                <div className="w-full lg:w-10/12 mx-auto">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 font-['Secular_One'] text-gray-900 border-b pb-4">{page.title}</h1>
                    <div
                        className="prose prose-lg max-w-none text-right"
                        dir="rtl"
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                </div>
            </SiteMain>
        </SiteShell>
    );
}
