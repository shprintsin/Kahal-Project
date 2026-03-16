import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ReactNode } from "react"

interface IconListItemProps {
  href: string
  icon: ReactNode
  title: string
  subtitle?: string
  trailing?: ReactNode
  className?: string
}

export function IconListItem({ href, icon, title, subtitle, trailing, className }: IconListItemProps) {
  return (
    <li className={cn(className)}>
      <Link href={href} className="flex items-start gap-3 group">
        <span className="mt-1 shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <h4 className="text-foreground text-sm group-hover:text-brand-primary-dark transition-colors">{title}</h4>
          {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
        </div>
        {trailing && <span className="mt-1 shrink-0">{trailing}</span>}
      </Link>
    </li>
  )
}
