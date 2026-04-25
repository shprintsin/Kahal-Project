"use client"

import type { SiteShellData } from "@/app/lib/get-navigation"
import type { SidebarCategory } from "@/app/components/views/Sidebar"
import { ContentListLayout } from "@/app/components/views/ContentListLayout"
import { ContentCard, MetaBadge, MetaIconText, useLocalizedHref, type PostItem } from "@/app/components/views/content-cards"
import { Calendar, FileText } from "lucide-react"
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

export function PostsPageClient({
  initialPosts,
  categories,
  shellData,
}: {
  initialPosts: PostItem[]
  categories: SidebarCategory[]
  shellData: SiteShellData
}) {
  const t = useTranslations()
  return (
    <ContentListLayout
      shellData={shellData}
      title={t('public.posts.title')}
      icon={<FileText className="w-8 h-8" />}
      items={initialPosts}
      renderCard={(item) => <PostCardItem item={item} />}
      getItemKey={(item) => item.id}
      categories={categories}
      emptyIcon={<FileText className="w-16 h-16 text-gray-200" />}
      emptyText={t('public.posts.empty')}
    />
  )
}
