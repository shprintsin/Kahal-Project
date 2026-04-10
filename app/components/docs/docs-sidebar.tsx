"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { ChevronDown, ChevronLeft, Menu, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTranslations, useLocale } from "next-intl"
import type { SidebarItem } from "@/lib/docs/types"

function SidebarNode({
  item,
  level,
  currentPath,
  expandedNodes,
  toggleExpand,
}: {
  item: SidebarItem
  level: number
  currentPath: string
  expandedNodes: Set<string>
  toggleExpand: (href: string) => void
}) {
  const isActive = currentPath === item.href
  const isExpanded = expandedNodes.has(item.href)
  const hasChildren = item.children && item.children.length > 0

  return (
    <div>
      <div
        className={`
          flex items-center justify-between px-3 py-2 rounded-md transition-colors text-sm
          ${isActive
            ? "bg-brand-primary text-white font-semibold"
            : "text-gray-700 hover:bg-gray-100"
          }
        `}
        style={{ paddingRight: `${level * 16 + 12}px` }}
      >
        <Link href={item.href} className="flex-1 truncate">
          {item.title}
        </Link>
        {hasChildren && (
          <button
            onClick={(e) => {
              e.preventDefault()
              toggleExpand(item.href)
            }}
            className="p-1 hover:bg-gray-200 rounded mr-1"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div>
          {item.children!.map((child) => (
            <SidebarNode
              key={child.href}
              item={child}
              level={level + 1}
              currentPath={currentPath}
              expandedNodes={expandedNodes}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function DocsSidebar({ items }: { items: SidebarItem[] }) {
  const t = useTranslations()
  const locale = useLocale()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    items.forEach((item) => {
      if (item.children?.some((child) => pathname.startsWith(child.href))) {
        initial.add(item.href)
      }
    })
    return initial
  })

  const [prevPathname, setPrevPathname] = useState(pathname)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setExpandedNodes((prev) => {
      const next = new Set(prev)
      let changed = false
      items.forEach((item) => {
        if (item.children?.some((child) => pathname.startsWith(child.href))) {
          if (!next.has(item.href)) {
            next.add(item.href)
            changed = true
          }
        }
      })
      return changed ? next : prev
    })
    setMobileOpen(false)
  }

  const toggleExpand = (href: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev)
      if (next.has(href)) next.delete(href)
      else next.add(href)
      return next
    })
  }

  const sidebarContent = (
    <nav className="space-y-1 py-4 px-2">
      <Link
        href={`/${locale}/docs`}
        className={`block px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
          pathname === `/${locale}/docs`
            ? "bg-brand-primary text-white"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        {t('public.docs.documentation')}
      </Link>
      <div className="my-2 border-b border-gray-200" />
      {items.map((item) => (
        <SidebarNode
          key={item.href}
          item={item}
          level={0}
          currentPath={pathname}
          expandedNodes={expandedNodes}
          toggleExpand={toggleExpand}
        />
      ))}
    </nav>
  )

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed bottom-4 left-4 z-50 bg-brand-primary text-white p-3 rounded-full shadow-lg"
        aria-label={t('public.docs.navMenu')}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 right-0 z-40 h-full w-64 bg-white border-l border-gray-200 transform transition-transform
          lg:relative lg:translate-x-0 lg:border-l-0 lg:border-l lg:border-gray-200
          ${mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        `}
      >
        <ScrollArea className="h-full">
          {sidebarContent}
        </ScrollArea>
      </aside>
    </>
  )
}
