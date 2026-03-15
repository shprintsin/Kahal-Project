import { cx } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ReactNode } from "react"

interface SectionProps {
  children: ReactNode
  className?: string
}

export const Section = ({ children, className }: SectionProps) => (
  <div className={cx("bg-white shadow-sm p-5 sm:p-6 lg:p-8 flex flex-col", className)}>
    {children}
  </div>
)

export const RowSection = ({ children, className }: SectionProps) => (
  <div className={cx("bg-white shadow-sm p-8 flex flex-row", className)}>
    {children}
  </div>
)

export const NoteCard = ({ children, className }: SectionProps) => (
  <div className={cx("mt-8 bg-gray-100 w-full shadow-sm p-8 flex flex-col", className)}>
    {children}
  </div>
)

export const ContentCard = ({ children, className }: SectionProps) => (
  <div className={cn("bg-white p-8 shadow-sm border border-gray-100", className)}>
    {children}
  </div>
)

export const SidebarInfoCard = ({ children, className }: SectionProps) => (
  <div className={cn("bg-white p-6 shadow-sm border border-gray-100 sticky top-4", className)}>
    {children}
  </div>
)

export const HighlightCard = ({ children, className }: SectionProps) => (
  <div className={cn("bg-emerald-900 text-white p-6 rounded-xl shadow-lg", className)}>
    {children}
  </div>
)
