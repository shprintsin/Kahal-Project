"use client"

import type { SiteShellData } from "@/app/lib/get-navigation"
import type { SidebarCategory } from "@/app/components/views/Sidebar"
import { ContentListLayout } from "@/app/components/views/ContentListLayout"
import { MapCard, type MapItem } from "@/app/components/views/content-cards"
import { Map as MapIcon } from "lucide-react"

export function MapsPageClient({
  initialMaps,
  categories,
  shellData,
}: {
  initialMaps: MapItem[]
  categories: SidebarCategory[]
  shellData: SiteShellData
}) {
  return (
    <ContentListLayout
      shellData={shellData}
      title="מפות אינטראקטיביות"
      icon={<MapIcon className="w-8 h-8" />}
      items={initialMaps}
      renderCard={(item) => <MapCard item={item} />}
      getItemKey={(item) => item.id}
      categories={categories}
      emptyIcon={<MapIcon className="w-16 h-16 text-gray-200" />}
      emptyText="לא נמצאו מפות כרגע."
      highlightCard={
        <div className="mt-8 bg-emerald-900 text-white p-6 rounded-none shadow-lg">
          <h3 className="text-xl font-bold mb-4 secular">אודות המפות</h3>
          <p className="text-emerald-100 text-sm leading-relaxed mb-4">
            המפות האינטראקטיביות מציגות נתונים גיאוגרפיים היסטוריים על קהילות יהודיות במזרח אירופה.
            ניתן להוריד את קבצי הנתונים המלאים לשימוש מחקרי.
          </p>
          <a href="/about/maps" className="text-white font-bold text-sm underline hover:text-emerald-200">
            למד עוד על המפות
          </a>
        </div>
      }
    />
  )
}
