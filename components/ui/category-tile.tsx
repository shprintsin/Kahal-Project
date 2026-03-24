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
        "no-underline bg-brand-primary p-4 sm:p-5 lg:p-6 rounded-lg text-center cursor-pointer",
        "w-full aspect-square",
        "transition-colors duration-150 hover:bg-brand-primary-darker",
        "grid place-content-center",
        className
      )}
    >
      <div className="text-white mx-auto mb-3">{icon}</div>
      <h3 className="text-white text-base sm:text-lg font-semibold">{title}</h3>
    </Link>
  )
}
