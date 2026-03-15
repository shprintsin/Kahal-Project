import { cn } from '@/lib/utils'
import { ReactNode } from "react"

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string
  className?: string
}

export function StatCard({ icon, label, value, className }: StatCardProps) {
  return (
    <div className={cn("bg-white shadow-sm p-4 sm:p-5 flex flex-row items-center gap-3 sm:gap-4", className)}>
      <div className="w-10 h-10 bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-xl sm:text-2xl font-bold text-emerald-900 secular leading-none">{value}</div>
        <div className="text-gray-500 text-xs mt-0.5">{label}</div>
      </div>
    </div>
  )
}
