import type { ReactNode } from "react"
import { SiteShell } from "@/components/ui/site-shell"
import { getSiteShellData } from "@/app/lib/get-navigation"
import { buildSidebarTree } from "@/lib/docs/sidebar"
import { DocsLayoutShell } from "@/app/components/docs/docs-layout-shell"
import { defaultLocale } from "@/lib/i18n/config"

export default async function DocsLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const [shellData, sidebarItems] = await Promise.all([
    getSiteShellData(locale || defaultLocale),
    Promise.resolve(buildSidebarTree()),
  ])

  return (
    <SiteShell {...shellData} bg="bg-white" locale={locale}>
      <DocsLayoutShell sidebar={sidebarItems}>
        {children}
      </DocsLayoutShell>
    </SiteShell>
  )
}
