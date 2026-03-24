import type { Metadata } from 'next';

import { getAllSiteSettings } from "@/app/admin/actions/menus";
import HomePageComponent from "@/app/components/pages_components/HomePage";
import { getSiteShellData } from "@/app/lib/get-navigation";
import type { Locale } from "@/lib/i18n/config";
import { getContentTranslation } from "@/lib/i18n/content-translation";
import { getTranslation, loadTranslations } from "@/lib/i18n/load-translations";
import { createPageMetadata } from "@/lib/i18n/metadata";
import { getContentBlocksData } from "@/lib/get-content-blocks-data";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return createPageMetadata(locale, 'public.hero.subtitle', '/');
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = loadTranslations(locale);

  const [siteSettings, contentBlocksData, shellData] = await Promise.all([
    getAllSiteSettings(),
    getContentBlocksData().catch(() => undefined),
    getSiteShellData(locale),
  ]);

  const heroGrid = siteSettings.heroGrid?.items.map(item => ({
    id: item.id || item.order.toString(),
    title: getContentTranslation(item.label.translations, locale, item.label.default),
    icon: item.icon || "FaHome",
    href: item.url || "#",
    hoverColor: "text-yellow-300",
  })) || [];

  const heroActions = siteSettings.heroActions?.items.map(item => ({
    id: item.id || item.order.toString(),
    title: getContentTranslation(item.label.translations, locale, item.label.default),
    icon: item.icon || "",
    href: item.url || "#",
  })) || [];

  const heroStrip = siteSettings.heroStrip?.items.map(item => ({
    label: getContentTranslation(item.label.translations, locale, item.label.default),
    icon: item.icon || "FaCode",
    href: item.url || "#",
  })) || [];

  const heroTitle = getTranslation(t, "public.hero.title", "1000 שנות היסטוריה");
  const heroSubtitle = getTranslation(t, "public.hero.subtitle", "פרויקט קהילות מזרח אירופה");

  return (
    <HomePageComponent
      navigation={shellData.navigation}
      heroGrid={heroGrid}
      heroActions={heroActions}
      heroStrip={heroStrip}
      contentBlocks={contentBlocksData}
      copyrightText={shellData.copyrightText}
      footerColumns={shellData.footerColumns}
      heroTitle={heroTitle}
      heroSubtitle={heroSubtitle}
      locale={locale}
    />
  );
}
