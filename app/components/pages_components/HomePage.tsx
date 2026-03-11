'use client';

import PostSection from "../layout/homepage/PostSection";
import CreditSection from "../layout/homepage/CreditSection";
import { ActionButton, CategoryButton, FooterItem, HeroText, Post, Source, Author, CitationInfo, NavItem } from "@/app/types";
import GlobalFooter from "../layout/GlobalFooter";
import { footerLinksMockData, copyrightTextMockData } from "@/app/Data";
import { GetIcons } from "@/app/Data";
import ActionButtons from "../layout/homepage/ActionButtons";
import Header from "../layout/header/Header";
import UpdateSection from "../layout/homepage/UpdateSection";
import Link from "next/link";
import { Col, Row } from "@/components/ui/flex";
import { CategoryTile } from "@/components/ui/category-tile";
import { HeroFooter, FooterLink } from "@/components/ui/page-layout";
import { getIcon } from "../utils/icons";

export default function HomePageComponent({
  heroText,
  actionItems,
  categories,
  footerItems,
  posts,
  sources,
  authors,
  citationInfo,
  navigation
}: {
  heroText: HeroText;
  actionItems: Record<string, ActionButton>;
  categories: CategoryButton[];
  footerItems: FooterItem[];
  posts: Post[];
  sources: Source[];
  authors: Author[];
  citationInfo: CitationInfo;
  navigation: NavItem[];
}) {
  return (
    <>
      <div>
        <div className="fixed top-0 left-0 w-full h-screen bg-[url('/images/historical-map.png')] bg-cover bg-center bg-no-repeat pointer-events-none -z-10"></div>
        <div className="fixed inset-0 bg-[#48680E] opacity-70 pointer-events-none"></div>

        <Col className="relative z-10 rtl">
          <main className="flex flex-col">
            <section className="min-h-screen flex flex-col">
              <Header navigation={navigation} />
              <Col className="flex-1 justify-around items-center w-10/12 mx-auto">
                <Row className="gap-10 justify-around">
                  <Col className="w-6/12">
                    <div className="text-right font-['Secular_One'] mb-12 mt-8">
                      <h1 className="text-white text-8xl font-bold mb-2">{heroText.title}</h1>
                      <h2 className="text-white text-4xl mb-6">{heroText.subtitle}</h2>
                    </div>
                    <ActionButtons items={actionItems} />
                  </Col>

                  <div className="mx-10 w-6/12 flex flex-col justify-around">
                    <div className="grid grid-cols-2 gap-10 justify-items-center">
                      {categories.map((category) => (
                        <CategoryTile
                          key={category.id}
                          href={category.href}
                          icon={<GetIcons icon={typeof category.icon === 'string' ? category.icon : "FaHome"} className={`text-white text-5xl mx-auto transition-all duration-300 hover:${category.hoverColor}`} />}
                          title={category.title}
                        />
                      ))}
                    </div>
                  </div>
                </Row>
              </Col>

              <HeroFooter>
                {footerItems.map((item, index) => (
                  <FooterLink
                    key={index}
                    href={item.href}
                    label={item.label}
                    icon={getIcon({ name: item.icon })}
                  />
                ))}
              </HeroFooter>
            </section>

            <div className='flex flex-row mx-auto w-full items-center justify-center bg-gray-50'>
              <Col className="gap-10 w-10/12 py-10">
                <Row><PostSection posts={posts} sources={sources} /></Row>
                <Row><UpdateSection posts={posts} sources={sources} /></Row>
                <Row><CreditSection authors={authors} citationInfo={citationInfo} /></Row>
              </Col>
            </div>
            <GlobalFooter links={footerLinksMockData} copyrightText={copyrightTextMockData} />
          </main>
        </Col>
      </div>
    </>
  );
}
