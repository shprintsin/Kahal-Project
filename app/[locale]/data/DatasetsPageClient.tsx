"use client"

import type { SiteShellData } from "@/app/lib/get-navigation"
import type { SidebarCategory } from "@/app/components/views/Sidebar"
import { ContentListLayout } from "@/app/components/views/ContentListLayout"
import { DatasetCard, type DatasetItem } from "@/app/components/views/content-cards"
import { Database } from "lucide-react"
import { useTranslations } from "next-intl"

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
      renderCard={(item) => <DatasetCard item={item} />}
      getItemKey={(item) => item.id}
      categories={categories}
      emptyIcon={<Database className="w-16 h-16 text-border" />}
      emptyText={t('public.datasets.empty')}
    />
  )
}
