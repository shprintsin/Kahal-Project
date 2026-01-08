"use client"

import { useState } from "react"
import Header from '@/app/components/layout/header/Header'
import GlobalFooter from '@/app/components/layout/GlobalFooter'
import { navigation, footerLinksMockData, copyrightTextMockData } from '@/app/Data'
import Pagination from "@/app/components/views/Pagination"
import Sidebar, {
  SidebarCategory,
} from "@/app/components/views/Sidebar"
import { Database, FileText, Calendar } from "lucide-react"

interface DatasetSummary {
  id: string | number
  title: string
  excerpt?: string
  thumbnail?: string | null
  slug: string
  date?: string | null
  category?: string
  resourceCount?: number
}

function DatasetCard({ dataset }: { dataset: DatasetSummary }) {
  return (
    <div className="flex flex-col md:flex-row gap-6 pb-8 border-b border-gray-200">
      <div className="w-full md:w-1/3 h-48 md:h-auto">
        <img
          src={dataset.thumbnail || "/placeholder.svg"}
          alt={dataset.title}
          className="w-full h-full object-cover rounded-none shadow-sm"
        />
      </div>
      <div className="w-full md:w-2/3 flex flex-col">
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2 rtl-dir">
          {dataset.category && (
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-none text-xs font-semibold">
              {dataset.category}
            </span>
          )}
          {dataset.date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {dataset.date}
            </span>
          )}
          {dataset.resourceCount !== undefined && (
            <span className="flex items-center gap-1 font-medium text-emerald-700">
              <FileText className="w-3.5 h-3.5" />
              {dataset.resourceCount} קבצים
            </span>
          )}
        </div>
        <h2 className="secular text-2xl text-[var(--dark-green)] mb-3 group transition-colors">
          <a href={dataset.slug} className="hover:text-emerald-700">
            {dataset.title}
          </a>
        </h2>
        {dataset.excerpt && (
          <p className="text-gray-600 line-clamp-3 mb-4 leading-relaxed">
            {dataset.excerpt}
          </p>
        )}
        <div className="mt-auto">
          <a
            href={dataset.slug}
            className="inline-flex items-center gap-2 text-emerald-700 font-bold secular hover:translate-x-[-4px] transition-transform duration-200"
          >
            צפה במאגר המלא
            <Database className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  )
}

export function DatasetsPageClient({ 
  initialDatasets,
  categories,
}: { 
  initialDatasets: DatasetSummary[];
  categories: SidebarCategory[];
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = initialDatasets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(initialDatasets.length / itemsPerPage);

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
              <Database className="w-8 h-8" />
              מאגרי מידע ומחקר
            </h1>
            
            {currentItems.length > 0 ? (
              <>
                <div className="space-y-10 bg-white p-6 md:p-8 rounded-none shadow-sm ">
                  {currentItems.map((dataset) => (
                    <DatasetCard key={dataset.id} dataset={dataset} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-10 flex justify-center">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-none shadow-sm border border-gray-100">
                <Database className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">לא נמצאו מאגרי מידע כרגע.</p>
              </div>
            )}
          </div>
          
          <div className="w-full lg:w-1/3">
            <Sidebar 
                categories={categories} 
                tags={[]} 
                recentPosts={[]} 
            />
            
            <div className="mt-8 bg-emerald-900 text-white p-6 rounded-none shadow-lg">
                <h3 className="text-xl font-bold mb-4 secular">שימוש בנתונים</h3>
                <p className="text-emerald-100 text-sm leading-relaxed mb-4">
                    כל מאגרי המידע בפרויקט זמינים לשימוש מחקרי תחת רישיונות שימוש חופשיים.
                    אנא הקפידו על ציטוט נאות של המאגרים בעבודתכם.
                </p>
                <a href="/about/citation" className="text-white font-bold text-sm underline hover:text-emerald-200">
                    מדריך ציטוט נתונים
                </a>
            </div>
          </div>
        </div>
      </main>
      <GlobalFooter links={footerLinksMockData} copyrightText={copyrightTextMockData} />
    </div>
  );
}
