import { cn } from '@/lib/utils'
import { ReactNode } from "react"

interface CardProps {
  children: ReactNode
  className?: string
}

export const SiteCard = ({ children, className }: CardProps) => (
  <div className={cn("bg-white shadow-sm p-6 flex flex-col", className)}>
    {children}
  </div>
)

export const SiteCardHeader = ({ children, className }: CardProps) => (
  <h3 className={cn("text-xl font-display text-brand-primary", className)}>{children}</h3>
)

export const SiteCardContent = ({ children, className }: CardProps) => (
  <p className={cn("text-body-secondary leading-relaxed flex-grow", className)}>{children}</p>
)

export const SiteCardFooter = ({ children, className }: CardProps) => (
  <div className={cn("flex justify-between text-muted-foreground text-sm mt-auto", className)}>{children}</div>
)
