import type { ReactNode } from "react"
import type { SidebarItem } from "@/lib/docs/types"
import { DocsSidebar } from "./docs-sidebar"

interface DocsLayoutShellProps {
  sidebar: SidebarItem[]
  children: ReactNode
}

export function DocsLayoutShell({ sidebar, children }: DocsLayoutShellProps) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex gap-8 py-6 min-h-[calc(100vh-200px)]">
        <DocsSidebar items={sidebar} />
        <div className="flex-1 min-w-0 flex gap-8">
          {children}
        </div>
      </div>
    </div>
  )
}
