"use client"

import { type ReactNode, useState } from "react"
import type { SiteShellData } from "@/app/lib/get-navigation"
import { SiteShell, SiteMain } from "@/components/ui/site-shell"
import Pagination from "@/app/components/views/Pagination"
import Sidebar, { type SidebarCategory, type SidebarRecentPost } from "@/app/components/views/Sidebar"

interface ContentListLayoutProps<T> {
  shellData: SiteShellData
  title: string
  icon?: ReactNode
  items: T[]
  renderCard: (item: T) => ReactNode
  getItemKey: (item: T) => string | number
  itemsPerPage?: number
  emptyIcon?: ReactNode
  emptyText?: string
  categories?: SidebarCategory[]
  recentPosts?: SidebarRecentPost[]
  highlightCard?: ReactNode
  contentCardClassName?: string
}

export function ContentListLayout<T>({
  shellData,
  title,
  icon,
  items,
  renderCard,
  getItemKey,
  itemsPerPage = 5,
  emptyIcon,
  emptyText = "לא נמצאו פריטים.",
  categories = [],
  recentPosts = [],
  highlightCard,
  contentCardClassName,
}: ContentListLayoutProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(items.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = items.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <SiteShell {...shellData}>
      <SiteMain>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            <h1 className="secular text-3xl md:text-4xl text-[var(--dark-green)] mb-8 flex items-center gap-3">
              {icon}
              {title}
            </h1>

            {currentItems.length > 0 ? (
              <>
                <div className={contentCardClassName ?? "space-y-10 bg-white p-6 md:p-8 rounded-none shadow-sm"}>
                  {currentItems.map((item) => (
                    <div key={getItemKey(item)}>{renderCard(item)}</div>
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
                {emptyIcon && <div className="mx-auto mb-4 flex justify-center">{emptyIcon}</div>}
                <p className="text-gray-500 text-base sm:text-lg">{emptyText}</p>
              </div>
            )}
          </div>

          <div className="w-full lg:w-1/3">
            <Sidebar categories={categories} tags={[]} recentPosts={recentPosts} />
            {highlightCard}
          </div>
        </div>
      </SiteMain>
    </SiteShell>
  )
}
