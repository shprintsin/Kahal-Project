import { cn } from '@/lib/utils'
import Link from "next/link"
import { ReactNode } from "react"

interface CategoryTileProps {
  href: string
  icon: ReactNode
  title: string
  className?: string
}

export function CategoryTile({ href, icon, title, className }: CategoryTileProps) {
  return (
    <Link
      href={href}
      className={cn(
        "no-underline bg-[var(--dark-green)] p-4 sm:p-6 lg:p-8 rounded-md text-center cursor-pointer",
        "h-[120px] w-full sm:h-[140px] sm:w-[180px] lg:h-[165px] lg:w-[220px]",
        "transition-shadow duration-300 hover:shadow-lg",
        "grid place-content-center",
        className
      )}
    >
      <div className="text-white text-3xl sm:text-4xl lg:text-5xl mx-auto mb-2 sm:mb-4">{icon}</div>
      <h3 className="text-white text-lg sm:text-xl lg:text-2xl font-bold">{title}</h3>
    </Link>
  )
}
