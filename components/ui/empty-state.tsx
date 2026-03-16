import { cn } from '@/lib/utils'
import { ReactNode } from "react"

interface EmptyStateProps {
  icon?: ReactNode
  message: string
  className?: string
}

export function EmptyState({ icon, message, className }: EmptyStateProps) {
  return (
    <div className={cn("text-center py-20 bg-white rounded-xl shadow-sm border border-border", className)}>
      {icon && <div className="mx-auto mb-4">{icon}</div>}
      <p className="text-muted-foreground text-lg">{message}</p>
    </div>
  )
}
