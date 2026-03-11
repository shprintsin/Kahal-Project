import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface FlexProps {
  className?: string
  children: ReactNode
}

export function Row({ className, children }: FlexProps) {
  return (
    <div className={cn("flex flex-row", className)}>
      {children}
    </div>
  )
}

export function Col({ className, children }: FlexProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      {children}
    </div>
  )
}
