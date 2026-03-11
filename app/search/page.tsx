import { searchContent } from "@/app/admin/actions/search";
import SearchPageClient from "./SearchPageClient";
import { getMenuByLocation } from "@/app/admin/actions/menus";
import { MenuItem } from "@/app/admin/types/menus";
import { NavItem } from "@/app/types";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>;
}) {
  const { q } = await searchParams;
  const results = await searchContent(q || "");
  const headerMenu = await getMenuByLocation("HEADER");

  // Reusing the mapping logic (should probably be a utility function but keeping inline for now as per previous pattern)
  const mapMenuItemToNavItem = (item: MenuItem): NavItem => ({
     label: item.label.default,
     icon: item.icon || null,
     href: item.url || "#",
     subItems: item.children && item.children.length > 0 
        ? item.children.map(mapMenuItemToNavItem) 
        : undefined
  });

  const navigation: NavItem[] = headerMenu?.items.map(mapMenuItemToNavItem) || [];

  return <SearchPageClient results={results} query={q || ""} navigation={navigation} />;
}
