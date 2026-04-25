"use client"

import type { SiteShellData } from "@/app/lib/get-navigation"
import type { SidebarCategory } from "@/app/components/views/Sidebar"
import { ContentListLayout } from "@/app/components/views/ContentListLayout"
import { ContentCard, MetaBadge, MetaIconText, useLocalizedHref, type DatasetItem } from "@/app/components/views/content-cards"
import { Calendar, Database, FileText } from "lucide-react"
import { useTranslations } from "next-intl"

function DatasetCardItem({ item }: { item: DatasetItem }) {
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
          {item.resourceCount !== undefined && (
            <MetaIconText icon={FileText} accent>
              {item.resourceCount} {t('public.datasets.resources')}
            </MetaIconText>
          )}
        </>
      }
    />
  )
}

export function DatasetsPageClient({
  initialDatasets,
  categories,
  shellData,
}: {
  initialDatasets: DatasetItem[]
  categories: SidebarCategory[]
  shellData: SiteShellData
}) {
  const t = useTranslations()
  return (
    <ContentListLayout
      shellData={shellData}
      title={t('public.datasets.title')}
      icon={<Database className="w-8 h-8" />}
      items={initialDatasets}
      renderCard={(item) => <DatasetCardItem item={item} />}
      getItemKey={(item) => item.id}
      categories={categories}
      emptyIcon={<Database className="w-16 h-16 text-border" />}
      emptyText={t('public.datasets.empty')}
    />
  )
}
