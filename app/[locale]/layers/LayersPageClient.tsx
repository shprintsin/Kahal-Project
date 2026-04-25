"use client"

import type { SiteShellData } from "@/app/lib/get-navigation"
import type { SidebarCategory } from "@/app/components/views/Sidebar"
import { ContentListLayout } from "@/app/components/views/ContentListLayout"
import { ContentCard, MetaBadge, MetaIconText, type LayerItem } from "@/app/components/views/content-cards"
import { Calendar, Eye, Layers } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"

function LayerCardItem({ item }: { item: LayerItem }) {
  const t = useTranslations()
  const locale = useLocale()
  const href = `/${locale}/layers/${item.slug}`
  return (
    <ContentCard
      href={href}
      title={item.name}
      alt={item.name}
      excerpt={item.excerpt}
      thumbnail={item.thumbnail}
      linkLabel={t('public.content.readMore')}
      fullWidthBody
      meta={
        <>
          <MetaBadge>{item.type}</MetaBadge>
          {item.category && <MetaBadge>{item.category}</MetaBadge>}
          {(item.minYear || item.maxYear) && (
            <MetaIconText icon={Calendar}>
              {item.minYear || '?'} - {item.maxYear || '?'}
            </MetaIconText>
          )}
          {item.mapCount !== undefined && item.mapCount > 0 && (
            <MetaIconText icon={Eye} accent>
              {item.mapCount} {t('public.maps.title')}
            </MetaIconText>
          )}
        </>
      }
    />
  )
}

export function LayersPageClient({
  initialLayers,
  categories,
  shellData,
}: {
  initialLayers: LayerItem[]
  categories: SidebarCategory[]
  shellData: SiteShellData
}) {
  return (
    <ContentListLayout
      shellData={shellData}
      title="שכבות מידע גיאוגרפי"
      icon={<Layers className="w-8 h-8" />}
      items={initialLayers}
      renderCard={(item) => <LayerCardItem item={item} />}
      getItemKey={(item) => item.id}
      itemsPerPage={10}
      categories={categories}
      emptyIcon={<Layers className="w-16 h-16 text-border" />}
      emptyText="לא נמצאו שכבות מידע כרגע."
      highlightCard={
        <div className="mt-8 bg-brand-primary-darker text-white p-6 rounded-none shadow-lg">
          <h3 className="text-xl font-bold mb-4 font-display">אודות המאגר</h3>
          <p className="text-on-brand-muted text-sm leading-relaxed mb-4">
            מאגר השכבות הגיאוגרפיות מאפשר גישה לנתונים הגולמיים המשמשים במפות ההיסטוריות.
            ניתן לצפות בנתונים, להוריד קבצי GeoJSON ולעיין בתיעוד המלא.
          </p>
        </div>
      }
    />
  )
}
