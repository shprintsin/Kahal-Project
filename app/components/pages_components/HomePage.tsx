'use client';

import PostSection from "../layout/homepage/PostSection";
import CreditSection from "../layout/homepage/CreditSection";
import { ActionButton, CategoryButton, FooterItem, HeroText, NavItem, Post, Source, Author, CitationInfo } from "@/app/types";
import GlobalFooter from "../layout/GlobalFooter";
import { footerLinksMockData, copyrightTextMockData } from "@/app/Data";
import { getIcon } from "../utils/icons";
import ActionButtons from "../layout/homepage/ActionButtons";
import { cn } from "@/lib/utils";
import Header from "../layout/header/Header";
import { GetIcons } from "@/app/Data";

import { Col } from "../StyledComponent";
import Link from "next/link";


export default function HomePageComponent({
  heroText,
  actionItems,
  categories,
  footerItems,
  navigation,
  posts,
  sources,
  authors,
  citationInfo
}: {
  heroText: HeroText;
  actionItems: Record<string, ActionButton>;
  categories: CategoryButton[];
  footerItems: FooterItem[];
  navigation: NavItem[];
  posts: Post[];
  sources: Source[];
  authors: Author[];
  citationInfo: CitationInfo;
}) {
  return (
    <>
      {/* Fixed Background + Overlay */}
      <div>
        <div className="fixed top-0 left-0 w-full h-screen bg-[url('/images/historical-map.png')] bg-cover bg-center bg-no-repeat pointer-events-none -z-10"></div>
        <div className="fixed inset-0 bg-surface-hero opacity-70 pointer-events-none"></div>

        {/* Page Content */}

        <Col className="relative z-10 rtl">
          <main className="flex flex-col">
            {/* Main Screen Section - Exactly 100vh */}
            <section className="min-h-screen flex flex-col">
              <Header navigation={navigation} />
              {/* Hero Content - Takes remaining space */}
              <Col className="flex-1 justify-around items-center w-full px-4 md:w-10/12 md:px-0 mx-auto">
                <div className="flex flex-col md:flex-row gap-6 md:gap-10 justify-around">
                  {/* Left Column */}
                  <Col className="w-full md:w-6/12">
                    <div className="text-right font-display mb-6 md:mb-12 mt-4 md:mt-8">
                      <h1 className="text-white text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-bold mb-2">{heroText.title}</h1>
                      <h2 className="text-white text-lg sm:text-2xl md:text-3xl lg:text-4xl mb-4 md:mb-6">{heroText.subtitle}</h2>
                    </div>
                    <ActionButtons items={actionItems} />
                  </Col>

                  {/* Right Column */}
                  <div className="w-full md:w-6/12 flex flex-col justify-around md:mx-10">
                    <div className="grid grid-cols-2 gap-4 md:gap-10 justify-items-center">
                      {categories.map((category) => (
                        <Link key={category.id} href={category.href} className={cn("no-underline bg-[var(--dark-green)] p-4 md:p-8 rounded-md text-center cursor-pointer min-h-[100px] md:min-h-[165px] w-full max-w-[220px] transition-shadow duration-300 hover:shadow-lg flex flex-col items-center justify-center")}>
                          <GetIcons icon={typeof category.icon === 'string' ? category.icon : "FaHome"} className={cn(`text-white text-3xl md:text-5xl mx-auto mb-2 md:mb-4 transition-all duration-300 hover:${category.hoverColor}`)} />
                          <h3 className="text-white text-base md:text-2xl font-bold">{category.title}</h3>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

              </Col>
              <footer className="bg-[var(--dark-green)] text-white w-full py-4">
                <div className="flex justify-center items-center">
                  <div className="flex items-center gap-6 md:gap-16 flex-wrap justify-center">
                    {footerItems.map((item, index) => (
                      <a
                        key={index}
                        href={item.href}
                        className="flex transition-opacity duration-200 hover:opacity-80"
                      >
                        <span className="text-sm md:text-base ml-2">{item.label}</span>
                        {getIcon({ name: item.icon })}
                      </a>
                    ))}
                  </div>
                </div>
              </footer>

            </section>

            {/* Rest of the content */}
            <div className='flex flex-col mx-auto w-full items-center justify-center bg-gray-50'>

              <Col className="gap-6 md:gap-10 w-full px-4 md:w-10/12 md:px-0 py-6 md:py-10">
                <PostSection posts={posts} sources={sources} />
                <CreditSection authors={authors} citationInfo={citationInfo} />
              </Col>

            </div>
            <GlobalFooter links={footerLinksMockData} copyrightText={copyrightTextMockData} />
          </main>
        </Col>
      </div>
    </>
  );
}
