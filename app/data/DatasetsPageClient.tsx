"use client"

import type { SiteShellData } from "@/app/lib/get-navigation"
import type { SidebarCategory } from "@/app/components/views/Sidebar"
import { ContentListLayout } from "@/app/components/views/ContentListLayout"
import { DatasetCard, type DatasetItem } from "@/app/components/views/content-cards"
import { Database } from "lucide-react"

export function DatasetsPageClient({
  initialDatasets,
  categories,
  shellData,
}: {
  initialDatasets: DatasetItem[]
  categories: SidebarCategory[]
  shellData: SiteShellData
}) {
  return (
    <ContentListLayout
      shellData={shellData}
      title="מאגרי מידע ומחקר"
      icon={<Database className="w-8 h-8" />}
      items={initialDatasets}
      renderCard={(item) => <DatasetCard item={item} />}
      getItemKey={(item) => item.id}
      categories={categories}
      emptyIcon={<Database className="w-16 h-16 text-border" />}
      emptyText="לא נמצאו מאגרי מידע כרגע."
      highlightCard={
        <div className="mt-8 bg-brand-primary-darker text-white p-6 rounded-none shadow-lg">
          <h3 className="text-xl font-bold mb-4 font-display">שימוש בנתונים</h3>
          <p className="text-on-brand-muted text-sm leading-relaxed mb-4">
            כל מאגרי המידע בפרויקט זמינים לשימוש מחקרי תחת רישיונות שימוש חופשיים.
            אנא הקפידו על ציטוט נאות של המאגרים בעבודתכם.
          </p>
          <a href="/about/citation" className="text-white font-bold text-sm underline hover:text-on-brand-muted">
            מדריך ציטוט נתונים
          </a>
        </div>
      }
    />
  )
}
