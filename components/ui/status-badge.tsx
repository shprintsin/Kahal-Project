import { cn } from '@/lib/utils'
import { ReactNode } from "react"

interface StatusBadgeProps {
  children: ReactNode
  variant?: 'blue' | 'emerald' | 'green' | 'yellow' | 'gray' | 'orange'
  className?: string
}

const variantStyles = {
  blue: 'bg-blue-100 text-blue-800',
  emerald: 'bg-emerald-100 text-emerald-800',
  green: 'bg-green-100 text-green-800 border-green-400',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-400',
  gray: 'bg-gray-100 text-gray-800 border-gray-400',
  orange: 'bg-orange-100 text-orange-800 border-orange-400',
}

export function StatusBadge({ children, variant = 'blue', className }: StatusBadgeProps) {
  return (
    <span className={cn(
      "px-2 py-0.5 rounded text-xs font-semibold",
      variantStyles[variant],
      className
    )}>
      {children}
    </span>
  )
}

export function StatusBadgeLarge({ children, variant = 'blue', className }: StatusBadgeProps) {
  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-sm font-semibold",
      variantStyles[variant],
      className
    )}>
      {children}
    </span>
  )
}

const maturityMap = {
  verified: { label: 'מאומת', variant: 'green' as const },
  provisional: { label: 'זמני', variant: 'yellow' as const },
  raw: { label: 'גולמי', variant: 'gray' as const },
  experimental: { label: 'ניסיוני', variant: 'orange' as const },
}

export function MaturityBadge({ maturity }: { maturity: string }) {
  const config = maturityMap[maturity as keyof typeof maturityMap] || maturityMap.raw
  return (
    <span className={cn("px-3 py-1.5 text-sm font-semibold border-2", variantStyles[config.variant])}>
      {config.label}
    </span>
  )
}

const statusMap = {
  published: { label: 'פורסם', variant: 'green' as const },
  draft: { label: 'טיוטה', variant: 'gray' as const },
  archived: { label: 'מאורכב', variant: 'blue' as const },
}

export function PublishStatusBadge({ status }: { status: string }) {
  const config = statusMap[status as keyof typeof statusMap] || statusMap.draft
  return (
    <span className={cn("px-3 py-1.5 text-sm font-semibold border-2", variantStyles[config.variant])}>
      {config.label}
    </span>
  )
}
