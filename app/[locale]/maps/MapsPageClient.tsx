"use client"

import type { SiteShellData } from "@/app/lib/get-navigation"
import type { SidebarCategory } from "@/app/components/views/Sidebar"
import { ContentListLayout } from "@/app/components/views/ContentListLayout"
import { ContentCard, MetaBadge, MetaIconText, useLocalizedHref, type MapItem } from "@/app/components/views/content-cards"
import { Calendar, Layers, Map as MapIcon } from "lucide-react"
import { useTranslations } from "next-intl"

const LAYER_TYPE_LABELS: Record<string, string> = {
  POINTS: 'נקודות',
  POLYGONS: 'גבולות',
  POLYLINES: 'קווים',
  MULTI_POLYGONS: 'גבולות',
}

function MapCardItem({ item }: { item: MapItem }) {
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
          {item.year && <MetaIconText icon={Calendar}>{item.year}</MetaIconText>}
          {item.period && <span className="MetaPeriod text-body-secondary font-medium">{item.period}</span>}
          {item.layerCount !== undefined && (
            <MetaIconText icon={Layers} accent>
              {item.layerCount} {t('public.layers.title')}
            </MetaIconText>
          )}
          {item.layerTypes?.map((type) => (
            <span key={type} className="LayerTypeTag text-[10px] font-medium px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
              {LAYER_TYPE_LABELS[type] ?? type.toLowerCase()}
            </span>
          ))}
        </>
      }
    />
  )
}

export function MapsPageClient({
  initialMaps,
  categories,
  shellData,
}: {
  initialMaps: MapItem[]
  categories: SidebarCategory[]
  shellData: SiteShellData
}) {
  const t = useTranslations()
  return (
    <ContentListLayout
      shellData={shellData}
      title={t('public.maps.title')}
      icon={<MapIcon className="w-8 h-8" />}
      items={initialMaps}
      renderCard={(item) => <MapCardItem item={item} />}
      getItemKey={(item) => item.id}
      categories={categories}
      emptyIcon={<MapIcon className="w-16 h-16 text-border" />}
      emptyText={t('public.maps.empty')}
    />
  )
}
