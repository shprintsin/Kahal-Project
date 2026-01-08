'use client';

import PostSection from "../layout/homepage/PostSection";
import CreditSection from "../layout/homepage/CreditSection";
import { ActionButton, CategoryButton, FooterItem, HeroText, Post, Source, Author, CitationInfo } from "@/app/types";
import GlobalFooter from "../layout/GlobalFooter";
import { footerLinksMockData, copyrightTextMockData, navigation } from "@/app/Data";
import { getIcon } from "../utils/icons";
import ActionButtons from "../layout/homepage/ActionButtons";
import { cn } from "@/lib/utils";
import Header from "../layout/header/Header";
import { FaBook } from "react-icons/fa"; // Removed others not used directly or use GetIcons
import { GetIcons } from "@/app/Data"; // Import GetIcons from Data
import UpdateSection from "../layout/homepage/UpdateSection";
import { Col, Row } from "../StyledComponent";
import Link from "next/link";


export default function HomePageComponent({
  heroText,
  actionItems,
  categories,
  footerItems,
  posts,
  sources,
  authors,
  citationInfo
}: {
  heroText: HeroText;
  actionItems: Record<string, ActionButton>;
  categories: CategoryButton[];
  footerItems: FooterItem[];
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
        <div className="fixed inset-0 bg-[#48680E] opacity-70 pointer-events-none"></div>

        {/* Page Content */}

        <Col className="relative z-10 rtl">
          <main className="flex flex-col">
            {/* Main Screen Section - Exactly 100vh */}
            <section className="min-h-screen flex flex-col">
              <Header navigation={navigation} />
              {/* Hero Content - Takes remaining space */}
              <Col className="flex-1 justify-around items-center w-10/12 mx-auto">
                <Row className="gap-10 justify-around">
                  {/* Left Column */}
                  <Col className="w-6/12">
                    <div className="text-right font-['Secular_One'] mb-12 mt-8">
                      <h1 className="text-white text-8xl font-bold mb-2">{heroText.title}</h1>
                      <h2 className="text-white text-4xl mb-6">{heroText.subtitle}</h2>
                    </div>
                    <ActionButtons items={actionItems} />
                  </Col>

                  {/* Right Column */}
                  <div className="mx-10 w-6/12 flex flex-col justify-around">
                    <div className="grid grid-cols-2 gap-10 justify-items-center">

                      {categories.map((category) => (
                        <Link key={category.id} href={category.href} className={cn("no-underline bg-[var(--dark-green)] p-8 rounded-md text-center cursor-pointer h-[165px] w-[220px] transition-shadow duration-300 hover:shadow-lg")}>
                          <GetIcons icon={typeof category.icon === 'string' ? category.icon : "FaHome"} className={cn(`text-white text-5xl mx-auto mb-4 transition-all duration-300 hover:${category.hoverColor}`)} />
                          <h3 className="text-white text-2xl font-bold">{category.title}</h3>
                        </Link>
                      ))


                      }



                    </div>
                  </div>
                </Row>

              </Col>
              <footer className="bg-[var(--dark-green)] text-white w-full py-4">
                <div className="flex justify-center items-center">
                  <div className="flex items-center gap-16">
                    {footerItems.map((item, index) => (
                      <a
                        key={index}
                        href={item.href}
                        className="flex transition-opacity duration-200 hover:opacity-80"
                      >
                        <span className="text-base ml-2">{item.label}</span>
                        {getIcon({ name: item.icon })}
                      </a>
                    ))}
                  </div>
                </div>
              </footer>
              {/* Main Screen Footer - Fixed to bottom */}

            </section>

            {/* Rest of the content */}
            <div className='flex flex-row mx-auto w-full items-center justify-center bg-gray-50 '>

              <Col className="gap-10 w-10/12 py-10 ">
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
