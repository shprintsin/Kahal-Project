import { cn } from '@/lib/utils'
import { ReactNode } from "react"

interface PageLayoutProps {
  children: ReactNode
  className?: string
  dir?: 'rtl' | 'ltr'
}

export function PageLayout({ children, className, dir = "rtl" }: PageLayoutProps) {
  return (
    <div className={cn("flex flex-col min-h-screen bg-gray-50", className)} dir={dir}>
      {children}
    </div>
  )
}

export function PageMain({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main className={cn("flex-grow container mx-auto py-6 px-4 sm:py-8 sm:px-6 lg:px-8", className)}>
      {children}
    </main>
  )
}

export function HeroFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <footer className={cn("bg-[var(--dark-green)] text-white w-full py-3 sm:py-4", className)}>
      <div className="flex justify-center items-center px-4">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 lg:gap-16">
          {children}
        </div>
      </div>
    </footer>
  )
}

export function FooterLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <a href={href} className="flex transition-opacity duration-200 hover:opacity-80">
      <span className="text-sm sm:text-base ml-2">{label}</span>
      {icon}
    </a>
  )
}
