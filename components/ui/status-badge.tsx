"use client"

import { cn } from '@/lib/utils'
import { ReactNode } from "react"
import { useTranslations } from "next-intl"

interface StatusBadgeProps {
  children: ReactNode
  variant?: 'blue' | 'emerald' | 'green' | 'yellow' | 'gray' | 'orange'
  className?: string
}

const variantStyles = {
  blue: 'bg-blue-100 text-blue-800',
  emerald: 'bg-surface-brand-light text-brand-primary-dark',
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

const maturityVariants = {
  verified: 'green',
  provisional: 'yellow',
  raw: 'gray',
  experimental: 'orange',
} as const

export function MaturityBadge({ maturity }: { maturity: string }) {
  const t = useTranslations('public.datasets')
  const key = (maturity in maturityVariants ? maturity : 'raw') as keyof typeof maturityVariants
  return (
    <span className={cn("px-3 py-1.5 text-sm font-semibold border-2", variantStyles[maturityVariants[key]])}>
      {t(key)}
    </span>
  )
}

const statusVariants = {
  published: 'green',
  draft: 'gray',
  archived: 'blue',
} as const

export function PublishStatusBadge({ status }: { status: string }) {
  const t = useTranslations('public.datasets')
  const key = (status in statusVariants ? status : 'draft') as keyof typeof statusVariants
  return (
    <span className={cn("px-3 py-1.5 text-sm font-semibold border-2", variantStyles[statusVariants[key]])}>
      {t(key)}
    </span>
  )
}
