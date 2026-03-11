import { listPostsAPI } from '@/app/admin/actions/posts';
import { getSiteShellData } from '@/app/lib/get-navigation';
import { SiteCard as Card, SiteCardHeader as CardHeader, SiteCardContent as CardContent, SiteCardFooter as CardFooter } from '@/components/ui/site-card';
import { SiteShell, SiteMain } from '@/components/ui/site-shell';
import Link from 'next/link';
import { FaDownload } from 'react-icons/fa';

export const revalidate = 60;

export default async function PostsPage() {
    const [{ posts }, shellData] = await Promise.all([
        listPostsAPI({ status: 'published', limit: 100 }),
        getSiteShellData(),
    ]);

    return (
        <SiteShell {...shellData}>
            <SiteMain>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 font-['Secular_One'] text-gray-900 border-b pb-4">מאגר הנתונים</h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {posts.map((post) => (
                        <Link key={post.id} href={`/posts/${post.slug}`} className="block h-full group">
                            <Card className="h-full hover:shadow-lg transition-shadow bg-white flex flex-col cursor-pointer">
                                <CardHeader className='flex items-center gap-2 font-bold text-base sm:text-lg text-gray-800 group-hover:text-[#0d4d2c] transition-colors'>
                                    {post.title}
                                </CardHeader>
                                <CardContent className="text-gray-600 custom-truncate flex-grow text-sm sm:text-base">
                                    {post.excerpt || "לחץ לקריאה נוספת..."}
                                </CardContent>
                                <CardFooter className="mt-auto flex justify-between items-center text-sm text-gray-500 pt-4 border-t border-gray-100">
                                    <span>{new Date(post.createdAt || "").toLocaleDateString("he-IL")}</span>
                                    <FaDownload className="text-gray-400 group-hover:text-[#0d4d2c] transition-colors" />
                                </CardFooter>
                            </Card>
                        </Link>
                    ))}
                </div>
            </SiteMain>
        </SiteShell>
    )
}
