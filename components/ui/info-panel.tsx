import { cn } from "@/lib/utils"
import { Download, ExternalLink } from "lucide-react"
import { ReactNode } from "react"

interface InfoPanelProps {
  title: string
  children: ReactNode
  className?: string
}

export function InfoPanel({ title, children, className }: InfoPanelProps) {
  return (
    <div className={cn("bg-white p-6 shadow-sm border border-border", className)}>
      <h3 className="text-xl font-bold text-foreground mb-5 font-display text-right">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

interface DownloadLinkProps {
  href: string
  name: string
  format?: string
  className?: string
}

export function DownloadLink({ href, name, format, className }: DownloadLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "flex items-center gap-3 p-4 bg-white border border-border-strong shadow-sm",
        "hover:border-brand-primary hover:bg-brand-primary-light transition-all group",
        className
      )}
      download
    >
      <Download className="w-5 h-5 text-brand-primary group-hover:text-brand-primary-dark" />
      <div className="flex-1 text-right">
        <div className="text-base font-semibold text-foreground mb-1">{name}</div>
        {format && <div className="text-sm text-muted-foreground">{format}</div>}
      </div>
    </a>
  )
}

interface ExternalLinkItemProps {
  href: string
  title: string
  className?: string
}

export function ExternalLinkItem({ href, title, className }: ExternalLinkItemProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-3 p-4 bg-white border border-border-strong shadow-sm",
        "hover:border-brand-primary hover:bg-brand-primary-light transition-all",
        className
      )}
    >
      <ExternalLink className="w-5 h-5 text-brand-primary" />
      <span className="text-base font-semibold text-foreground">{title}</span>
    </a>
  )
}

interface VersionBadgeProps {
  version: string
  className?: string
}

export function VersionBadge({ version, className }: VersionBadgeProps) {
  return (
    <div className={cn("bg-muted p-4 rounded border border-border", className)}>
      <div className="text-sm text-body-secondary text-right">
        <div className="font-semibold mb-1">גרסה</div>
        <div className="font-mono">{version}</div>
      </div>
    </div>
  )
}
