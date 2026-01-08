"use client"

import { useState } from "react"
import Header from '@/app/components/layout/header/Header'
import GlobalFooter from '@/app/components/layout/GlobalFooter'
import { navigation, footerLinksMockData, copyrightTextMockData } from '@/app/Data'
import Pagination from "@/app/components/views/Pagination"
import Sidebar, {
  SidebarCategory,
} from "@/app/components/views/Sidebar"
import { Map as MapIcon, Layers, Calendar } from "lucide-react"

interface MapSummary {
  id: string | number
  title: string
  excerpt?: string
  thumbnail?: string | null
  slug: string
  date?: string | null
  category?: string
  year?: number
  period?: string
  layerCount?: number
}

function MapCard({ map }: { map: MapSummary }) {
  return (
    <div className="flex flex-col md:flex-row gap-6 pb-8 border-b border-gray-200">
      <div className="w-full md:w-1/3 h-48 md:h-auto">
        <img
          src={map.thumbnail || "/placeholder.svg"}
          alt={map.title}
          className="w-full h-full object-cover rounded-md shadow-sm"
        />
      </div>
      <div className="w-full md:w-2/3 flex flex-col">
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2 rtl-dir">
          {map.category && (
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs font-semibold">
              {map.category}
            </span>
          )}
          {map.year && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {map.year}
            </span>
          )}
          {map.period && (
            <span className="text-gray-600 font-medium">
              {map.period}
            </span>
          )}
          {map.layerCount !== undefined && (
            <span className="flex items-center gap-1 font-medium text-emerald-700">
              <Layers className="w-3.5 h-3.5" />
              {map.layerCount} שכבות
            </span>
          )}
        </div>
        <h2 className="secular text-2xl text-[var(--dark-green)] mb-3 group transition-colors">
          <a href={map.slug} className="hover:text-emerald-700">
            {map.title}
          </a>
        </h2>
        {map.excerpt && (
          <p className="text-gray-600 line-clamp-3 mb-4 leading-relaxed">
            {map.excerpt}
          </p>
        )}
        <div className="mt-auto">
          <a
            href={map.slug}
            className="inline-flex items-center gap-2 text-emerald-700 font-bold secular hover:translate-x-[-4px] transition-transform duration-200"
          >
            צפה במפה
            <MapIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  )
}

export function MapsPageClient({ 
  initialMaps,
  categories,
}: { 
  initialMaps: MapSummary[];
  categories: SidebarCategory[];
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = initialMaps.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(initialMaps.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 bg-opacity-50" dir="rtl">
      <Header navigation={navigation} />
      <main className="container mx-auto py-8 px-4 md:px-6 lg:px-8 flex-grow">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            <h1 className="secular text-3xl md:text-4xl text-[var(--dark-green)] mb-8 flex items-center gap-3">
              <MapIcon className="w-8 h-8" />
              מפות אינטראקטיביות
            </h1>
            
            {currentItems.length > 0 ? (
              <>
                <div className="space-y-10 bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
                  {currentItems.map((map) => (
                    <MapCard key={map.id} map={map} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-10 flex justify-center">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                <MapIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">לא נמצאו מפות כרגע.</p>
              </div>
            )}
          </div>
          
          <div className="w-full lg:w-1/3">
            <Sidebar 
                categories={categories} 
                tags={[]} 
                recentPosts={[]} 
            />
            
            <div className="mt-8 bg-emerald-900 text-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4 secular">אודות המפות</h3>
                <p className="text-emerald-100 text-sm leading-relaxed mb-4">
                    המפות האינטראקטיביות מציגות נתונים גיאוגרפיים היסטוריים על קהילות יהודיות במזרח אירופה.
                    ניתן להוריד את קבצי הנתונים המלאים לשימוש מחקרי.
                </p>
                <a href="/about/maps" className="text-white font-bold text-sm underline hover:text-emerald-200">
                    למד עוד על המפות
                </a>
            </div>
          </div>
        </div>
      </main>
      <GlobalFooter links={footerLinksMockData} copyrightText={copyrightTextMockData} />
    </div>
  );
}
