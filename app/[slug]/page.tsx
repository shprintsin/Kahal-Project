import { getPageBySlug, listPagesAPI } from '@/app/admin/actions/pages';
import { notFound } from 'next/navigation';
import { serializeLexical } from '@/lib/lexical';
import Header from '@/app/components/layout/header/Header';
import GlobalFooter from '@/app/components/layout/GlobalFooter';
import { navigation, footerLinksMockData, copyrightTextMockData } from '@/app/Data';
import { Col } from '@/app/components/StyledComponent';

export async function generateStaticParams() {
    const { pages } = await listPagesAPI({ limit: 1000, status: 'published' });
    return pages.map((page) => ({
        slug: page.slug,
    }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const page = await getPageBySlug(slug);

    if (!page) {
        notFound();
    }

    const htmlContent = serializeLexical(page.content);

    return (
        <div className="flex flex-col min-h-screen bg-white" dir="rtl">
            <Header navigation={navigation} />
            <main className="flex-grow container mx-auto px-4 py-8">
                <Col className="w-10/12 mx-auto">
                    <h1 className="text-4xl font-bold mb-8 font-['Secular_One'] text-gray-900 border-b pb-4">{page.title}</h1>
                    <div
                        className="prose prose-lg max-w-none text-right"
                        dir="rtl"
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                </Col>
            </main>
            <GlobalFooter links={footerLinksMockData} copyrightText={copyrightTextMockData} />
        </div>
    );
}
