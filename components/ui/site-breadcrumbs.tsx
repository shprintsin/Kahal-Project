import { cn } from "@/lib/utils"
import Link from "next/link"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface SiteBreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function SiteBreadcrumbs({ items, className }: SiteBreadcrumbsProps) {
  return (
    <div className={cn("bg-muted py-2", className)}>
      <div className="container mx-auto px-4">
        <div className="flex items-center text-sm text-body-secondary flex-wrap gap-1">
          {items.map((item, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="mx-1">/</span>}
              {item.href ? (
                <Link href={item.href} className="hover:text-brand-primary-dark">
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground">{item.label}</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
