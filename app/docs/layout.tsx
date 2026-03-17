import type { ReactNode } from "react"
import { SiteShell } from "@/components/ui/site-shell"
import { getSiteShellData } from "@/app/lib/get-navigation"
import { buildSidebarTree } from "@/lib/docs/sidebar"
import { DocsLayoutShell } from "@/app/components/docs/docs-layout-shell"

export default async function DocsLayout({ children }: { children: ReactNode }) {
  const [shellData, sidebarItems] = await Promise.all([
    getSiteShellData(),
    Promise.resolve(buildSidebarTree()),
  ])

  return (
    <SiteShell {...shellData} bg="bg-white">
      <DocsLayoutShell sidebar={sidebarItems}>
        {children}
      </DocsLayoutShell>
    </SiteShell>
  )
}
