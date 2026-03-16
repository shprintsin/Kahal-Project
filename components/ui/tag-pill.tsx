import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { ReactNode } from "react"

const tagPillVariants = cva(
  "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm",
  {
    variants: {
      variant: {
        default: "bg-muted text-body",
        region: "bg-blue-100 text-blue-800",
        tag: "bg-muted text-body",
        category: "bg-surface-brand-light text-brand-primary-dark",
        type: "bg-indigo-100 text-indigo-800 uppercase",
        interactive: "bg-muted text-foreground hover:bg-muted cursor-pointer",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface TagPillProps extends VariantProps<typeof tagPillVariants> {
  children: ReactNode
  icon?: ReactNode
  href?: string
  className?: string
}

export function TagPill({ children, icon, href, variant, className }: TagPillProps) {
  const classes = cn(tagPillVariants({ variant }), className)

  if (href) {
    return (
      <a href={href} className={classes}>
        {icon}
        {children}
      </a>
    )
  }

  return (
    <span className={classes}>
      {icon}
      {children}
    </span>
  )
}

export function TagPillList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {children}
    </div>
  )
}
