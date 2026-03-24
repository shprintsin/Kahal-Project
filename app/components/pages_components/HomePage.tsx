import { NavItem } from "@/app/types";
import Header from "../layout/header/Header";
import { Col } from "@/components/ui/flex";
import { CategoryTile } from "@/components/ui/category-tile";
import { ContentBlocks } from "@/components/ui/content-blocks";
import { DynamicIcon as GetIcons } from "@/components/ui/dynamic-icon";
import { HeroFooter, FooterLink } from "@/components/ui/page-layout";
import { ActionButton as ActionButtonUI } from "@/components/ui/action-button";
import { SiteFooter } from "@/components/ui/site-footer";
import { getIcon } from "../utils/icons";
import type { ContentBlocksProps } from "@/components/ui/content-blocks";
import type { FooterColumn } from "@/app/admin/types/menus";

interface HomePageProps {
  navigation: NavItem[];
  heroGrid: { id: string; title: string; icon: string; href: string; hoverColor: string }[];
  heroActions: { id: string; title: string; icon: string; href: string }[];
  heroStrip: { label: string; icon: string; href: string }[];
  contentBlocks?: ContentBlocksProps;
  copyrightText: string;
  footerColumns: FooterColumn[];
  heroTitle?: string;
  heroSubtitle?: string;
  locale?: string;
}

export default function HomePageComponent({
  navigation,
  heroGrid,
  heroActions,
  heroStrip,
  contentBlocks,
  copyrightText,
  footerColumns,
  heroTitle = "1000 שנות היסטוריה",
  heroSubtitle = "פרויקט קהילות מזרח אירופה",
  locale,
}: HomePageProps) {
  return (
    <div>
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/historical-map.webp')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-surface-hero opacity-70" />

        <div className="relative z-10 flex flex-col min-h-screen">
          <Header navigation={navigation} />

          <Col className="flex-1 justify-around items-center w-full px-4 sm:px-6 md:w-11/12 lg:w-10/12 mx-auto">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-10 justify-around w-full py-6 sm:py-0">
              <Col className="w-full md:w-6/12">
                <div className="text-center md:text-start font-display mb-6 sm:mb-10 md:mb-12 mt-4 sm:mt-8">
                  <h1 className="text-white text-5xl sm:text-6xl lg:text-8xl font-bold mb-2">{heroTitle}</h1>
                  <h2 className="text-white text-xl sm:text-2xl lg:text-4xl mb-4 sm:mb-6">{heroSubtitle}</h2>
                </div>
                {heroActions.length > 0 && (
                  <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row mb-8 sm:mb-16 justify-center md:justify-end gap-3 sm:gap-4 font-sans">
                    {heroActions.map((action) => (
                      <ActionButtonUI
                        key={action.id}
                        href={action.href}
                        icon={action.icon ? <GetIcons icon={action.icon} className="text-white" /> : undefined}
                        iconPosition="start"
                        className="justify-center"
                      >
                        {action.title}
                      </ActionButtonUI>
                    ))}
                  </div>
                )}
              </Col>

              {heroGrid.length > 0 && (
                <div className="w-full md:w-6/12 flex flex-col justify-around">
                  <div className="grid grid-cols-2 gap-7 sm:gap-8 lg:gap-10 max-w-sm md:max-w-md mx-auto w-full">
                    {heroGrid.map((category) => (
                      <CategoryTile
                        key={category.id}
                        href={category.href}
                        icon={<GetIcons icon={category.icon} className="text-white w-10 h-10 sm:w-12 sm:h-12 mx-auto transition-all duration-300" />}
                        title={category.title}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Col>

          {heroStrip.length > 0 && (
            <HeroFooter>
              {heroStrip.map((item, index) => (
                <FooterLink
                  key={index}
                  href={item.href}
                  label={item.label}
                  icon={getIcon({ name: item.icon })}
                />
              ))}
            </HeroFooter>
          )}
        </div>
      </section>

      {contentBlocks && (
        <section className="relative z-10 bg-surface-light">
          <div className="flex flex-col gap-6 sm:gap-10 w-full px-4 sm:px-6 lg:w-10/12 mx-auto py-6 sm:py-10">
            <ContentBlocks {...contentBlocks} />
          </div>
        </section>
      )}

      <SiteFooter columns={footerColumns} copyrightText={copyrightText} locale={locale} />
    </div>
  );
}
