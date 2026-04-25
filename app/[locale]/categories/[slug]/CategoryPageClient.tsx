"use client"

import { useState } from "react"
import { ContentCard, MetaBadge, MetaIconText, useLocalizedHref, type PostItem } from "@/app/components/views/content-cards"
import { Calendar } from "lucide-react"
import { useTranslations } from "next-intl"

function PostCardItem({ item }: { item: PostItem }) {
  const t = useTranslations()
  const href = useLocalizedHref(item.slug)
  return (
    <ContentCard
      href={href}
      title={item.title}
      excerpt={item.excerpt}
      thumbnail={item.thumbnail}
      linkLabel={t('public.content.readMore')}
      meta={
        <>
          {item.category && <MetaBadge>{item.category}</MetaBadge>}
          {item.date && <MetaIconText icon={Calendar}>{item.date}</MetaIconText>}
        </>
      }
    />
  )
}
import type { SiteShellData } from "@/app/lib/get-navigation"
import Pagination from "@/app/components/views/Pagination"
import Sidebar, {
  SidebarCategory,
  SidebarRecentPost,
} from "@/app/components/views/Sidebar"
import { SiteShell, SiteMain } from "@/components/ui/site-shell"

type PostSummary = PostItem

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
  recentPosts,
  shellData,
  locale,
}: {
  category: ApiCategory;
  initialPosts: PostSummary[];
  categories: SidebarCategory[];
  recentPosts: SidebarRecentPost[];
  shellData: SiteShellData;
  locale?: string;
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
    <SiteShell {...shellData} locale={locale}>
      <SiteMain>
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="w-full lg:w-2/3">
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-brand-primary mb-6 sm:mb-8">
              קטגוריה: {category.title}
            </h1>
            {currentPosts.length > 0 ? (
              <>
                <div className="space-y-6 sm:space-y-8">
                  {currentPosts.map((post) => (
                    <PostCardItem key={post.id} item={post} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-8 sm:mt-10 flex justify-center">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground text-base sm:text-lg text-center py-12 sm:py-20">לא נמצאו פריטים בקטגוריה זו.</p>
            )}
          </div>
          <div className="w-full lg:w-1/3">
            <Sidebar categories={categories} tags={[]} recentPosts={recentPosts} />
          </div>
        </div>
      </SiteMain>
    </SiteShell>
  );
}
