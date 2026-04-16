import { cn } from '@/lib/utils'

interface SidebarCardProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export function SidebarCard({ title, children, className }: SidebarCardProps) {
  return (
    <div className={cn('bg-white p-4 sm:p-6 shadow-sm border border-border', className)}>
      {title && (
        <h3 className="text-lg font-bold text-foreground mb-4 font-display">{title}</h3>
      )}
      {children}
    </div>
  )
}
