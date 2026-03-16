import { getMenuByLocation } from "@/app/admin/actions/menus"
import { getFooterColumns } from "@/app/admin/actions/menus"
import { NavItem } from "@/app/types"
import { MenuItem } from "@/app/admin/types/menus"
import { navigation as fallbackNavigation, footerLinksMockData, copyrightTextMockData } from "@/app/Data"
import Header from "./header/Header"
import GlobalFooter from "./GlobalFooter"

function mapMenuItemToNavItem(item: MenuItem): NavItem {
  return {
    label: item.label.default,
    icon: item.icon || null,
    href: item.url || "#",
    subItems: item.children?.length
      ? item.children.map(mapMenuItemToNavItem)
      : undefined,
  }
}

export default async function SiteLayout({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  let navigation = fallbackNavigation
  try {
    const headerMenu = await getMenuByLocation("HEADER")
    if (headerMenu?.items?.length) {
      navigation = headerMenu.items.map(mapMenuItemToNavItem)
    }
  } catch {}


  return (
    <div className={`flex flex-col min-h-screen bg-gray-50 ${className || ""}`} dir="rtl">
      <Header navigation={navigation} />
      <main className="flex-grow">{children}</main>
      <GlobalFooter links={footerLinksMockData} copyrightText={copyrightTextMockData} />
    </div>
  )
}
