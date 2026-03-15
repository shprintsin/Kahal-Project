import { cn } from '@/lib/utils'
import Link from 'next/link'

interface GridTileProps {
  href: string
  title: string
  description?: string
  className?: string
}

export function GridTile({ href, title, description, className }: GridTileProps) {
  return (
    <Link
      href={href}
      className={cn(
        "bg-gray-50 p-3 sm:p-4 flex flex-col gap-1.5 hover:bg-gray-100 transition-colors",
        className
      )}
    >
      <h4 className="font-semibold text-gray-800 text-sm leading-snug">{title}</h4>
      {description && (
        <p className="text-gray-500 text-xs leading-relaxed flex-grow">{description}</p>
      )}
    </Link>
  )
}
