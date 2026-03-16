import HomePageComponent from "@/app/components/pages_components/HomePage";
import { getAllSiteSettings } from "@/app/admin/actions/menus";
import { getContentBlocksData } from "@/lib/get-content-blocks-data";
import { getNavigation } from "@/app/lib/get-navigation";

export default async function HomePage() {
  const [siteSettings, contentBlocksData, navigation] = await Promise.all([
    getAllSiteSettings(),
    getContentBlocksData().catch(() => undefined),
    getNavigation(),
  ]);

  const heroGrid = siteSettings.heroGrid?.items.map(item => ({
    id: item.id || item.order.toString(),
    title: item.label.default,
    icon: item.icon || "FaHome",
    href: item.url || "#",
    hoverColor: "text-yellow-300",
  })) || [];

  const heroActions = siteSettings.heroActions?.items.map(item => ({
    id: item.id || item.order.toString(),
    title: item.label.default,
    icon: item.icon || "",
    href: item.url || "#",
  })) || [];

  const heroStrip = siteSettings.heroStrip?.items.map(item => ({
    label: item.label.default,
    icon: item.icon || "FaCode",
    href: item.url || "#",
  })) || [];

  const copyrightText = siteSettings.copyrightText?.default || "© 2024 פרויקט הקהל. כל הזכויות שמורות.";
  const footerColumns = siteSettings.footerColumns || [];

  return (
    <HomePageComponent
      navigation={navigation}
      heroGrid={heroGrid}
      heroActions={heroActions}
      heroStrip={heroStrip}
      contentBlocks={contentBlocksData}
      copyrightText={copyrightText}
      footerColumns={footerColumns}
    />
  );
}
