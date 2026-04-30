"use client"

import { type ReactNode, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { SiteShellData } from "@/app/lib/get-navigation"
import { SiteShell, SiteMain } from "@/components/ui/site-shell"
import Pagination from "@/app/components/views/Pagination"
import Sidebar, { type SidebarCategory, type SidebarRecentPost } from "@/app/components/views/Sidebar"
import { useLocale } from "next-intl"

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
  const locale = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1)

  const totalPages = Math.ceil(items.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = items.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete("page")
    } else {
      params.set("page", String(page))
    }
    const qs = params.toString()
    router.push(qs ? `?${qs}` : window.location.pathname)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [router, searchParams])

  return (
    <SiteShell {...shellData} locale={locale}>
      <SiteMain>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            <h1 className="font-display text-3xl md:text-4xl text-brand-primary mb-8 flex items-center gap-3">
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
              <div className="text-center py-20 bg-white rounded-none shadow-sm border border-border">
                {emptyIcon && <div className="mx-auto mb-4 flex justify-center">{emptyIcon}</div>}
                <p className="text-muted-foreground text-base sm:text-lg">{emptyText}</p>
              </div>
            )}
          </div>

          <div className="w-full lg:w-1/3">
            <div className="hidden lg:flex font-display text-3xl md:text-4xl mb-8 invisible items-center gap-3" aria-hidden="true">
              &nbsp;
            </div>
            <Sidebar categories={categories} tags={[]} recentPosts={recentPosts} />
            {highlightCard}
          </div>
        </div>
      </SiteMain>
    </SiteShell>
  )
}
