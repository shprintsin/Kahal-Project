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
        "bg-surface-light p-3 sm:p-4 flex flex-col gap-1.5 hover:bg-muted transition-colors",
        className
      )}
    >
      <h4 className="font-semibold text-foreground text-sm sm:text-base leading-snug">{title}</h4>
      {description && (
        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed flex-grow line-clamp-2 sm:line-clamp-4">{description}</p>
      )}
    </Link>
  )
}
