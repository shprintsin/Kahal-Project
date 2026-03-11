"use client";

import Header from '@/app/components/layout/header/Header';
import GlobalFooter from '@/app/components/layout/GlobalFooter';
import { navigation, footerLinksMockData, copyrightTextMockData } from '@/app/Data';
import PostCard from "@/app/components/views/PostCard";
import { SearchResult } from "@/app/admin/actions/search";
import { NavItem } from "@/app/types";

export default function SearchPageClient({
  results,
  query,
  navigation
}: {
  results: SearchResult[];
  query: string;
  navigation: NavItem[];
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 bg-opacity-50" dir="rtl">
      <Header navigation={navigation} />
      <main className="container mx-auto py-8 px-4 md:px-6 lg:px-8 flex-grow">
        <div className="flex flex-col gap-8">
          <div className="w-full lg:w-2/3 mx-auto">
            <h1 className="secular text-3xl md:text-4xl text-[var(--dark-green)] mb-8 text-center">
              תוצאות חיפוש עבור: "{query}"
            </h1>
            
            {results.length > 0 ? (
              <div className="space-y-8">
                {results.map((result) => (
                  <PostCard 
                    key={`${result.type}-${result.id}`} 
                    post={{
                      id: result.id,
                      title: result.title,
                      excerpt: result.description,
                      thumbnail: result.thumbnail,
                      slug: result.slug,
                      date: result.date ? new Date(result.date).toLocaleDateString("he-IL") : null
                    }} 
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-lg text-center py-20">
                לא נמצאו תוצאות עבור "{query}".
              </p>
            )}
          </div>
        </div>
      </main>
      <GlobalFooter links={footerLinksMockData} copyrightText={copyrightTextMockData} />
    </div>
  );
}
