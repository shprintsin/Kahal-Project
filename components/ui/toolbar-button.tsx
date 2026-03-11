import { cn } from '@/lib/utils'
import { ReactNode } from "react"

interface ToolbarButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  title?: string
  'aria-label'?: string
}

export function ToolbarButton({ children, onClick, disabled, className, title, ...props }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

interface ViewModeToggleProps {
  options: { value: string; icon: ReactNode; title: string }[]
  activeValue: string
  onChange: (value: string) => void
  className?: string
}

export function ViewModeToggle({ options, activeValue, onChange, className }: ViewModeToggleProps) {
  return (
    <div className={cn("flex items-center bg-gray-100 rounded-lg p-0.5", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "p-1.5 rounded-md transition-all",
            activeValue === option.value
              ? 'bg-white shadow-sm text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          )}
          title={option.title}
        >
          {option.icon}
        </button>
      ))}
    </div>
  )
}
