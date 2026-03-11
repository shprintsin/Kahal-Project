import HomePageComponent from "@/app/components/pages_components/HomePage";
import {
  actionItems,
  authorsMockData,
  citationInfoMockData,
  footerItems,
  HomeCategories,
  heroText,
  postsMockData,
  sourcesMockData,
} from "@/app/Data";
import { getMenuByLocation } from "@/app/admin/actions/menus";
import { NavItem } from "@/app/types";
import { MenuItem } from "@/app/admin/types/menus";

export default async function HomePage() {
  const headerMenu = await getMenuByLocation("HEADER");
  
  const mapMenuItemToNavItem = (item: MenuItem): NavItem => ({
     label: item.label.default,
     icon: item.icon || null, // UI expects string | null
     href: item.url || "#",
     subItems: item.children && item.children.length > 0 
        ? item.children.map(mapMenuItemToNavItem) 
        : undefined
  });

  const navigation: NavItem[] = headerMenu?.items.map(mapMenuItemToNavItem) || [];

  return (
    <HomePageComponent
      heroText={heroText}
      actionItems={actionItems}
      categories={HomeCategories}
      footerItems={footerItems}
      posts={postsMockData}
      sources={sourcesMockData}
      authors={authorsMockData}
      citationInfo={citationInfoMockData}
      navigation={navigation}
    />
  );
}
