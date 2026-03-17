"use client"

import type { SiteShellData } from "@/app/lib/get-navigation"
import type { SidebarCategory } from "@/app/components/views/Sidebar"
import { ContentListLayout } from "@/app/components/views/ContentListLayout"
import { MapCard, type MapItem } from "@/app/components/views/content-cards"
import { Map as MapIcon } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-provider"

export function MapsPageClient({
  initialMaps,
  categories,
  shellData,
}: {
  initialMaps: MapItem[]
  categories: SidebarCategory[]
  shellData: SiteShellData
}) {
  const { t } = useLanguage()
  return (
    <ContentListLayout
      shellData={shellData}
      title={t('public.maps.title', 'מפות אינטראקטיביות')}
      icon={<MapIcon className="w-8 h-8" />}
      items={initialMaps}
      renderCard={(item) => <MapCard item={item} />}
      getItemKey={(item) => item.id}
      categories={categories}
      emptyIcon={<MapIcon className="w-16 h-16 text-border" />}
      emptyText={t('public.maps.empty', 'לא נמצאו מפות כרגע.')}
    />
  )
}
