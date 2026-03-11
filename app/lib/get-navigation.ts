import { getMenuByLocation } from "@/app/admin/actions/menus";
import { NavItem } from "@/app/types";
import { MenuItem } from "@/app/admin/types/menus";
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

export async function getNavigation(): Promise<NavItem[]> {
  try {
    const headerMenu = await getMenuByLocation("HEADER");
    if (headerMenu && headerMenu.items.length > 0) {
      return headerMenu.items.map(mapMenuItemToNavItem);
    }
  } catch (e) {
    console.error("Failed to fetch navigation from DB:", e);
  }
  return fallbackNavigation;
}
