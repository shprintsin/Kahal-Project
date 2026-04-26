import { cn } from '@/lib/utils'
import { ReactNode } from "react"

interface ActionButtonProps {
  children: ReactNode
  href?: string
  className?: string
  icon?: ReactNode
  iconPosition?: 'start' | 'end'
  onClick?: () => void
}

export function ActionButton({ children, href, className, icon, iconPosition = 'start', onClick }: ActionButtonProps) {
  const content = (
    <>
      {icon && iconPosition === 'start' && <span className="me-2">{icon}</span>}
      {children}
      {icon && iconPosition === 'end' && <span className="ms-3">{icon}</span>}
    </>
  )

  const classes = cn(
    "bg-brand-dark text-white px-6 py-3 rounded-md flex items-center font-semibold",
    "transition-all duration-300 hover:shadow-lg",
    className
  )

  if (href) {
    return <a href={href} className={classes}>{content}</a>
  }

  return <button onClick={onClick} className={classes}>{content}</button>
}

export function DownloadButton({ children, href, className }: { children: ReactNode; href: string; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center justify-center gap-2 w-full",
        "bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-3 px-4",
        "rounded-lg transition-colors shadow-lg hover:shadow-xl",
        className
      )}
    >
      {children}
    </a>
  )
}

export function CopyButton({ children, onClick, className }: { children: ReactNode; onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "bg-brand-primary-darker text-white px-4 py-2 rounded flex items-center gap-2",
        "hover:bg-brand-dark transition-colors",
        className
      )}
    >
      {children}
    </button>
  )
}
