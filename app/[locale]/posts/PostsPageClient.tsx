"use client"

import type { SiteShellData } from "@/app/lib/get-navigation"
import type { SidebarCategory } from "@/app/components/views/Sidebar"
import { ContentListLayout } from "@/app/components/views/ContentListLayout"
import { PostCard, type PostItem } from "@/app/components/views/content-cards"
import { FileText } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-provider"

export function PostsPageClient({
  initialPosts,
  categories,
  shellData,
}: {
  initialPosts: PostItem[]
  categories: SidebarCategory[]
  shellData: SiteShellData
}) {
  const { t } = useLanguage()
  return (
    <ContentListLayout
      shellData={shellData}
      title={t('public.posts.title', 'מאמרים ופרסומים')}
      icon={<FileText className="w-8 h-8" />}
      items={initialPosts}
      renderCard={(item) => <PostCard item={item} />}
      getItemKey={(item) => item.id}
      categories={categories}
      emptyIcon={<FileText className="w-16 h-16 text-gray-200" />}
      emptyText={t('public.posts.empty', 'לא נמצאו מאמרים כרגע.')}
    />
  )
}
