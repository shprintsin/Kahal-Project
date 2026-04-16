import { type ElementType, type ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'

type InteractiveRowProps<T extends ElementType = 'div'> = {
  as?: T
} & Omit<ComponentPropsWithoutRef<T>, 'as'>

export function InteractiveRow<T extends ElementType = 'div'>({
  as,
  className,
  ...props
}: InteractiveRowProps<T>) {
  const Tag = (as ?? 'div') as ElementType
  return (
    <Tag
      className={cn(
        'flex items-center gap-3 p-3 sm:p-4 bg-white border border-border-strong shadow-sm hover:border-brand-primary hover:bg-brand-primary-light transition-all',
        className
      )}
      {...props}
    />
  )
}
