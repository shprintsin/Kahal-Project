'use client';

import PostSection from "../layout/homepage/PostSection";
import CreditSection from "../layout/homepage/CreditSection";
import { NavItem } from "@/app/types";
import Header from "../layout/header/Header";
import Link from "next/link";
import { Col } from "@/components/ui/flex";
import { CategoryTile } from "@/components/ui/category-tile";
import { HeroFooter, FooterLink } from "@/components/ui/page-layout";
import { GetIcons, authorsMockData, citationInfoMockData } from "@/app/Data";
import { getIcon } from "../utils/icons";
import { ActionButton as ActionButtonUI } from "@/components/ui/action-button";
import { SiteFooter } from "@/components/ui/site-footer";
import type { FooterColumn } from "@/app/admin/types/menus";

interface HomePageProps {
  navigation: NavItem[];
  heroGrid: { id: string; title: string; icon: string; href: string; hoverColor: string }[];
  heroActions: { id: string; title: string; icon: string; href: string }[];
  heroStrip: { label: string; icon: string; href: string }[];
  posts: { id: string; title: string; excerpt: string; date: string; author: string; imageUrl: string; slug: string }[];
  datasets: { id: string; title: string; description: string; slug: string; url: string }[];
  copyrightText: string;
  footerColumns: FooterColumn[];
}

export default function HomePageComponent({
  navigation,
  heroGrid,
  heroActions,
  heroStrip,
  posts,
  datasets,
  copyrightText,
  footerColumns,
}: HomePageProps) {
  return (
    <div>
      <div className="fixed top-0 left-0 w-full h-screen bg-[url('/images/historical-map.png')] bg-cover bg-center bg-no-repeat pointer-events-none -z-10" />
      <div className="fixed inset-0 bg-[#48680E] opacity-70 pointer-events-none" />

      <Col className="relative z-10 rtl">
        <main className="flex flex-col">
          <section className="min-h-screen flex flex-col">
            <Header navigation={navigation} />
            <Col className="flex-1 justify-around items-center w-full px-4 sm:px-6 lg:w-10/12 mx-auto">
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 justify-around w-full py-6 sm:py-0">
                <Col className="w-full lg:w-6/12">
                  <div className="text-right font-['Secular_One'] mb-6 sm:mb-12 mt-4 sm:mt-8">
                    <h1 className="text-white text-4xl sm:text-6xl lg:text-8xl font-bold mb-2">1000 שנות היסטוריה</h1>
                    <h2 className="text-white text-xl sm:text-3xl lg:text-4xl mb-4 sm:mb-6">פרויקט קהילות מזרח אירופה</h2>
                  </div>
                  {heroActions.length > 0 && (
                    <div className="flex flex-col sm:flex-row mb-8 sm:mb-16 justify-end gap-3 sm:gap-6">
                      {heroActions.map((action) => (
                        <ActionButtonUI
                          key={action.id}
                          href={action.href}
                          icon={action.icon ? <GetIcons icon={action.icon} className="text-white" /> : undefined}
                          iconPosition="start"
                        >
                          {action.title}
                        </ActionButtonUI>
                      ))}
                    </div>
                  )}
                </Col>

                {heroGrid.length > 0 && (
                  <div className="w-full lg:w-6/12 flex flex-col justify-around">
                    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-10 justify-items-center">
                      {heroGrid.map((category) => (
                        <CategoryTile
                          key={category.id}
                          href={category.href}
                          icon={<GetIcons icon={category.icon} className="text-white text-3xl sm:text-4xl lg:text-5xl mx-auto transition-all duration-300" />}
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
          </section>

          <div className="flex flex-row mx-auto w-full items-center justify-center bg-gray-50">
            <Col className="gap-6 sm:gap-10 w-full px-4 sm:px-6 lg:w-10/12 py-6 sm:py-10">
              {posts.length > 0 && (
                <PostSection
                  posts={posts}
                  sources={datasets.map(d => ({ id: d.id, title: d.title, url: d.url }))}
                />
              )}
              <CreditSection authors={authorsMockData} citationInfo={citationInfoMockData} />
            </Col>
          </div>

          <SiteFooter columns={footerColumns} copyrightText={copyrightText} />
        </main>
      </Col>
    </div>
  );
}
