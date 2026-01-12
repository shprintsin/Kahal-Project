import { listPostsAPI } from '@/app/admin/actions/posts';
import Header from '@/app/components/layout/header/Header';
import GlobalFooter from '@/app/components/layout/GlobalFooter';
import { navigation, footerLinksMockData, copyrightTextMockData } from '@/app/Data';
import { Card, CardHeader, CardContent, CardFooter } from '@/app/components/layout/ui/Components';
import Link from 'next/link';
import { FaDownload } from 'react-icons/fa';

export const dynamic = 'force-dynamic'; // Since we might want fresh data or if static generation isn't enough

export default async function PostsPage() {
    const { posts } = await listPostsAPI({ status: 'published', limit: 100 });

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 bg-opacity-50" dir="rtl">
            <Header navigation={navigation} />
            <main className="container mx-auto px-4 py-8 flex-grow">
                <h1 className="text-4xl font-bold mb-8 font-['Secular_One'] text-gray-900 border-b pb-4">מאגר הנתונים</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <Link key={post.id} href={`/posts/${post.slug}`} className="block h-full group">
                            <Card className="h-full hover:shadow-lg transition-shadow bg-white flex flex-col cursor-pointer">
                                <CardHeader className='flex items-center gap-2 font-bold text-lg text-gray-800 group-hover:text-[#0d4d2c] transition-colors'>
                                    {post.title}
                                </CardHeader>
                                <CardContent className="text-gray-600 custom-truncate flex-grow">
                                    {post.excerpt || "לחץ לקריאה נוספת..."}
                                </CardContent>
                                <CardFooter className="mt-auto flex justify-between items-center text-sm text-gray-500 pt-4 border-t border-gray-100">
                                    <span>{new Date(post.publishedAt || "").toLocaleDateString("he-IL")}</span>
                                    <FaDownload className="text-gray-400 group-hover:text-[#0d4d2c] transition-colors" />
                                </CardFooter>
                            </Card>
                        </Link>
                    ))}
                </div>
            </main>
            <GlobalFooter links={footerLinksMockData} copyrightText={copyrightTextMockData} />
        </div>
    )
}
