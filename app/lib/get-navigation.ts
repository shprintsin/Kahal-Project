import { cache } from "react";
import { getMenuByLocation, getFooterColumns, getSiteSettings } from "@/app/admin/actions/menus";
import { NavItem } from "@/app/types";
import { MenuItem, FooterColumn } from "@/app/admin/types/menus";
import { navigation as fallbackNavigation } from "@/app/Data";
import { getContentTranslation } from "@/lib/i18n/content-translation";
import { defaultLocale } from "@/lib/i18n/config";

function resolveLocalizedText(
  label: { default: string; translations: Record<string, string> },
  locale: string
): string {
  const translated = label.translations?.[locale];
  if (translated) return translated;
  return label.default || "";
}

function mapMenuItemToNavItem(item: MenuItem, locale: string): NavItem {
  return {
    label: resolveLocalizedText(item.label, locale),
    icon: item.icon || null,
    href: item.url || "#",
    subItems: item.children && item.children.length > 0
      ? item.children.map(child => mapMenuItemToNavItem(child, locale))
      : undefined
  };
}

export const getNavigation = cache(async (locale: string = defaultLocale): Promise<NavItem[]> => {
  try {
    const headerMenu = await getMenuByLocation("HEADER");
    if (headerMenu && headerMenu.items.length > 0) {
      return headerMenu.items.map(item => mapMenuItemToNavItem(item, locale));
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

export const getSiteShellData = cache(async (locale: string = defaultLocale): Promise<SiteShellData> => {
  const [navigation, footerColumns, siteSettings] = await Promise.all([
    getNavigation(locale),
    getFooterColumns().catch(() => []),
    getSiteSettings().catch(() => null),
  ]);

  const copyrightText = siteSettings?.copyrightText
    ? getContentTranslation(siteSettings.copyrightText.translations, locale, siteSettings.copyrightText.default)
    : "© 2024 פרויקט הקהל. כל הזכויות שמורות.";

  return {
    navigation,
    footerColumns,
    copyrightText,
  };
});
