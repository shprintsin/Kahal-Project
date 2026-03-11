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
    <div className={cn("bg-white p-6 shadow-sm border border-gray-200", className)}>
      <h3 className="text-xl font-bold text-gray-900 mb-5 secular text-right">{title}</h3>
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
        "flex items-center gap-3 p-4 bg-white border border-gray-300 shadow-sm",
        "hover:border-emerald-600 hover:bg-emerald-50 transition-all group",
        className
      )}
      download
    >
      <Download className="w-5 h-5 text-emerald-700 group-hover:text-emerald-800" />
      <div className="flex-1 text-right">
        <div className="text-base font-semibold text-gray-900 mb-1">{name}</div>
        {format && <div className="text-sm text-gray-500">{format}</div>}
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
        "flex items-center gap-3 p-4 bg-white border border-gray-300 shadow-sm",
        "hover:border-emerald-600 hover:bg-emerald-50 transition-all",
        className
      )}
    >
      <ExternalLink className="w-5 h-5 text-emerald-700" />
      <span className="text-base font-semibold text-gray-900">{title}</span>
    </a>
  )
}

interface VersionBadgeProps {
  version: string
  className?: string
}

export function VersionBadge({ version, className }: VersionBadgeProps) {
  return (
    <div className={cn("bg-gray-100 p-4 rounded border border-gray-200", className)}>
      <div className="text-sm text-gray-600 text-right">
        <div className="font-semibold mb-1">גרסה</div>
        <div className="font-mono">{version}</div>
      </div>
    </div>
  )
}
