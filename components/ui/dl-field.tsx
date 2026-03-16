import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface DlFieldProps {
  label: string
  children: ReactNode
  border?: boolean
  className?: string
}

export function DlField({ label, children, border = true, className }: DlFieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", border && "pb-4 border-b border-border", className)}>
      <dt className="text-sm font-semibold text-body font-display">{label}</dt>
      <dd className="text-foreground text-base">{children}</dd>
    </div>
  )
}

interface DlGroupProps {
  children: ReactNode
  className?: string
}

export function DlGroup({ children, className }: DlGroupProps) {
  return (
    <dl className={cn("space-y-4 text-right", className)}>
      {children}
    </dl>
  )
}
