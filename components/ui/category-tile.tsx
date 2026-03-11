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
        "no-underline bg-[var(--dark-green)] p-8 rounded-md text-center cursor-pointer",
        "h-[165px] w-[220px] transition-shadow duration-300 hover:shadow-lg",
        "grid place-content-center",
        className
      )}
    >
      <div className="text-white text-5xl mx-auto mb-4">{icon}</div>
      <h3 className="text-white text-2xl font-bold">{title}</h3>
    </Link>
  )
}
