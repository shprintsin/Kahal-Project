"use client"

import type { SiteShellData } from "@/app/lib/get-navigation"
import type { SidebarCategory } from "@/app/components/views/Sidebar"
import { ContentListLayout } from "@/app/components/views/ContentListLayout"
import { LayerCard, type LayerItem } from "@/app/components/views/content-cards"
import { Layers } from "lucide-react"

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
      renderCard={(item) => <LayerCard item={item} />}
      getItemKey={(item) => item.id}
      itemsPerPage={10}
      categories={categories}
      emptyIcon={<Layers className="w-16 h-16 text-gray-200" />}
      emptyText="לא נמצאו שכבות מידע כרגע."
      highlightCard={
        <div className="mt-8 bg-emerald-900 text-white p-6 rounded-none shadow-lg">
          <h3 className="text-xl font-bold mb-4 font-display">אודות המאגר</h3>
          <p className="text-emerald-100 text-sm leading-relaxed mb-4">
            מאגר השכבות הגיאוגרפיות מאפשר גישה לנתונים הגולמיים המשמשים במפות ההיסטוריות.
            ניתן לצפות בנתונים, להוריד קבצי GeoJSON ולעיין בתיעוד המלא.
          </p>
        </div>
      }
    />
  )
}
