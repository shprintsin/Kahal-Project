"use client"

import { useState } from "react"
import Header from '@/app/components/layout/header/Header'
import GlobalFooter from '@/app/components/layout/GlobalFooter'
import { navigation, footerLinksMockData, copyrightTextMockData } from '@/app/Data'
import PostCard from "@/app/components/views/PostCard"
import Pagination from "@/app/components/views/Pagination"
import Sidebar, {
  SidebarCategory,
  SidebarRecentPost,
} from "@/app/components/views/Sidebar"

interface PostSummary {
  id: string | number
  title: string
  excerpt?: string
  thumbnail?: string | null
  slug: string
  date?: string | null
}

interface ApiCategory {
  id: string
  title: string
  slug: string
  postsCount?: number
}

export function CategoryPageClient({ 
  category, 
  initialPosts,
  categories,
  recentPosts 
}: { 
  category: ApiCategory;
  initialPosts: PostSummary[];
  categories: SidebarCategory[];
  recentPosts: SidebarRecentPost[];
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 3;

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = initialPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(initialPosts.length / postsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 bg-opacity-50" dir="rtl">
      <Header navigation={navigation} />
      <main className="container mx-auto py-8 px-4 md:px-6 lg:px-8 flex-grow">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            <h1 className="secular text-3xl md:text-4xl text-[var(--dark-green)] mb-8">
              קטגוריה: {category.title}
            </h1>
            {currentPosts.length > 0 ? (
              <>
                <div className="space-y-8">
                  {currentPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-10 flex justify-center">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-lg text-center py-20">לא נמצאו פריטים בקטגוריה זו.</p>
            )}
          </div>
          <div className="w-full lg:w-1/3">
            <Sidebar categories={categories} tags={[]} recentPosts={recentPosts} />
          </div>
        </div>
      </main>
      <GlobalFooter links={footerLinksMockData} copyrightText={copyrightTextMockData} />
    </div>
  );
}
