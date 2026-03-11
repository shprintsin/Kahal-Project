"use client"

import { useState } from "react"
import Header from '@/app/components/layout/header/Header'
import GlobalFooter from '@/app/components/layout/GlobalFooter'
import { navigation, footerLinksMockData, copyrightTextMockData } from '@/app/Data'
import Pagination from "@/app/components/views/Pagination"
import Sidebar, { SidebarCategory } from "@/app/components/views/Sidebar"
import { Layers, Calendar, Eye } from "lucide-react"
import { StatusBadge } from "@/components/ui/status-badge"
import { ContentCard, HighlightCard } from "@/components/ui/sections"
import { EmptyState } from "@/components/ui/empty-state"
import { PageLayout, PageMain } from "@/components/ui/page-layout"

interface LayerSummary {
  id: string
  name: string
  description?: string
  slug: string
  type: string
  category?: string
  minYear?: number
  maxYear?: number
  mapCount?: number
  thumbnail?: string
  createdAt: string
}

function LayerCard({ layer }: { layer: LayerSummary }) {
  return (
    <div className="flex flex-col md:flex-row gap-6 pb-8 border-b border-gray-200">
      {layer.thumbnail && (
        <div className="w-full md:w-1/3 flex-shrink-0">
          <img
            src={layer.thumbnail}
            alt={layer.name}
            className="w-full h-48 object-cover rounded-lg shadow-sm"
          />
        </div>
      )}

      <div className="w-full flex flex-col">
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2 rtl-dir flex-wrap">
          <StatusBadge variant="blue" className="uppercase">{layer.type}</StatusBadge>
          {layer.category && (
            <StatusBadge variant="emerald">{layer.category}</StatusBadge>
          )}
          {(layer.minYear || layer.maxYear) && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {layer.minYear || '?'} - {layer.maxYear || '?'}
            </span>
          )}
          {layer.mapCount !== undefined && layer.mapCount > 0 && (
            <span className="flex items-center gap-1 font-medium text-emerald-700">
              <Eye className="w-3.5 h-3.5" />
              בשימוש ב-{layer.mapCount} מפות
            </span>
          )}
        </div>
        <h2 className="secular text-2xl text-[var(--dark-green)] mb-3 group transition-colors">
          <a href={`/layers/${layer.slug}`} className="hover:text-emerald-700">
            {layer.name}
          </a>
        </h2>
        {layer.description && (
          <p className="text-gray-600 line-clamp-3 mb-4 leading-relaxed">
            {layer.description}
          </p>
        )}
        <div className="mt-auto flex gap-4">
          <a
            href={`/layers/${layer.slug}`}
            className="inline-flex items-center gap-2 text-emerald-700 font-bold secular"
          >
            צפה בשכבה
            <Layers className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  )
}

export function LayersPageClient({
  initialLayers,
  categories,
}: {
  initialLayers: LayerSummary[];
  categories: SidebarCategory[];
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = initialLayers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(initialLayers.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <PageLayout>
      <Header navigation={navigation} />
      <PageMain>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            <h1 className="secular text-3xl md:text-4xl text-[var(--dark-green)] mb-8 flex items-center gap-3">
              <Layers className="w-8 h-8" />
              שכבות מידע גיאוגרפי
            </h1>

            {currentItems.length > 0 ? (
              <>
                <ContentCard className="space-y-10 p-6 md:p-8 rounded-xl">
                  {currentItems.map((layer) => (
                    <LayerCard key={layer.id} layer={layer} />
                  ))}
                </ContentCard>
                {totalPages > 1 && (
                  <div className="mt-10 flex justify-center">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={<Layers className="w-16 h-16 text-gray-200" />}
                message="לא נמצאו שכבות מידע כרגע."
              />
            )}
          </div>

          <div className="w-full lg:w-1/3">
            <Sidebar
                categories={categories}
                tags={[]}
                recentPosts={[]}
            />

            <HighlightCard className="mt-8">
                <h3 className="text-xl font-bold mb-4 secular">אודות המאגר</h3>
                <p className="text-emerald-100 text-sm leading-relaxed mb-4">
                    מאגר השכבות הגיאוגרפיות מאפשר גישה לנתונים הגולמיים המשמשים במפות ההיסטוריות.
                    ניתן לצפות בנתונים, להוריד קבצי GeoJSON ולעיין בתיעוד המלא.
                </p>
            </HighlightCard>
          </div>
        </div>
      </PageMain>
      <GlobalFooter links={footerLinksMockData} copyrightText={copyrightTextMockData} />
    </PageLayout>
  );
}
