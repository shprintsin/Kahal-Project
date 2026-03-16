import { cn } from "@/lib/utils"
import { ReactNode } from "react"
import Header from "@/app/components/layout/header/Header"
import { SiteFooter } from "@/components/ui/site-footer"
import { NavItem } from "@/app/types"
import type { FooterColumn } from "@/app/admin/types/menus"

interface SiteShellProps {
  children: ReactNode
  navigation: NavItem[]
  footerColumns?: FooterColumn[]
  copyrightText?: string
  className?: string
  bg?: string
}

export function SiteShell({
  children,
  navigation,
  footerColumns = [],
  copyrightText = "© 2024 פרויקט הקהל. כל הזכויות שמורות.",
  className,
  bg = "bg-surface-light",
}: SiteShellProps) {
  return (
    <div className={cn("flex flex-col min-h-screen", bg, className)} dir="rtl">
      <Header navigation={navigation} />
      {children}
      <SiteFooter columns={footerColumns} copyrightText={copyrightText} />
    </div>
  )
}

export function SiteMain({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main className={cn("flex-grow container mx-auto py-6 px-4 sm:py-8 sm:px-6 lg:px-8", className)}>
      {children}
    </main>
  )
}
