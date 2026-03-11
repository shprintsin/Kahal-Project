import { cache } from "react";
import { getMenuByLocation, getFooterColumns, getSiteSettings } from "@/app/admin/actions/menus";
import { NavItem } from "@/app/types";
import { MenuItem, FooterColumn } from "@/app/admin/types/menus";
import { navigation as fallbackNavigation } from "@/app/Data";

function mapMenuItemToNavItem(item: MenuItem): NavItem {
  return {
    label: item.label.default,
    icon: item.icon || null,
    href: item.url || "#",
    subItems: item.children && item.children.length > 0
      ? item.children.map(mapMenuItemToNavItem)
      : undefined
  };
}

export const getNavigation = cache(async (): Promise<NavItem[]> => {
  try {
    const headerMenu = await getMenuByLocation("HEADER");
    if (headerMenu && headerMenu.items.length > 0) {
      return headerMenu.items.map(mapMenuItemToNavItem);
    }
  } catch (e) {
    console.error("Failed to fetch navigation from DB:", e);
  }
  return fallbackNavigation;
});

export interface SiteShellData {
  navigation: NavItem[];
  footerColumns: FooterColumn[];
  copyrightText: string;
}

export const getSiteShellData = cache(async (): Promise<SiteShellData> => {
  const [navigation, footerColumns, siteSettings] = await Promise.all([
    getNavigation(),
    getFooterColumns().catch(() => []),
    getSiteSettings().catch(() => null),
  ]);

  return {
    navigation,
    footerColumns,
    copyrightText: siteSettings?.copyrightText?.default || "© 2024 פרויקט הקהל. כל הזכויות שמורות.",
  };
});
