import { cn } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ReactNode } from "react"

interface ReadMoreLinkProps {
  href: string
  children?: ReactNode
  className?: string
}

export function ReadMoreLink({ href, children = "קרא עוד", className }: ReadMoreLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-between gap-2",
        "text-brand-secondary hover:text-brand-primary transition-colors duration-200",
        "font-display font-bold",
        className
      )}
    >
      <span>{children}</span>
      <ArrowLeft className="h-5 w-5" />
    </Link>
  )
}

interface ViewLinkProps {
  href: string
  children: ReactNode
  icon?: ReactNode
  className?: string
}

export function ViewLink({ href, children, icon, className }: ViewLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 text-emerald-700 font-bold font-display",
        className
      )}
    >
      {children}
      {icon}
    </Link>
  )
}
