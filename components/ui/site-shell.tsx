import { cn } from "@/lib/utils"
import { ReactNode } from "react"
import Header from "@/app/components/layout/header/Header"
import GlobalFooter from "@/app/components/layout/GlobalFooter"
import { footerLinksMockData, copyrightTextMockData } from "@/app/Data"
import { NavItem } from "@/app/types"

interface SiteShellProps {
  children: ReactNode
  navigation: NavItem[]
  className?: string
  bg?: string
}

export function SiteShell({ children, navigation, className, bg = "bg-gray-50" }: SiteShellProps) {
  return (
    <div className={cn("flex flex-col min-h-screen", bg, className)} dir="rtl">
      <Header navigation={navigation} />
      {children}
      <GlobalFooter links={footerLinksMockData} copyrightText={copyrightTextMockData} />
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
