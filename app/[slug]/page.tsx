import { getPageBySlug, listPagesAPI } from '@/app/admin/actions/pages';
import { notFound } from 'next/navigation';
import { serializeLexical } from '@/lib/lexical';
import { Col } from '@/app/components/StyledComponent';
import SiteLayout from '@/app/components/layout/SiteLayout';

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
        <SiteLayout className="bg-white">
            <div className="container mx-auto px-4 py-8">
                <Col className="w-10/12 mx-auto">
                    <h1 className="text-4xl font-bold mb-8 font-display text-gray-900 border-b pb-4">{page.title}</h1>
                    <div
                        className="prose prose-lg max-w-none text-right"
                        dir="rtl"
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                </Col>
            </div>
        </SiteLayout>
    );
}
