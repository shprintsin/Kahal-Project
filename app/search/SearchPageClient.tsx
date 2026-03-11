"use client";

import PostCard from "@/app/components/views/PostCard";
import { SearchResult } from "@/app/admin/actions/search";
import type { SiteShellData } from "@/app/lib/get-navigation";
import { SiteShell, SiteMain } from "@/components/ui/site-shell";

export default function SearchPageClient({
  results,
  query,
  shellData,
}: {
  results: SearchResult[];
  query: string;
  shellData: SiteShellData;
}) {
  return (
    <SiteShell {...shellData}>
      <SiteMain>
        <div className="flex flex-col gap-6 sm:gap-8">
          <div className="w-full lg:w-2/3 mx-auto">
            <h1 className="secular text-2xl sm:text-3xl md:text-4xl text-[var(--dark-green)] mb-6 sm:mb-8 text-center">
              תוצאות חיפוש עבור: &ldquo;{query}&rdquo;
            </h1>

            {results.length > 0 ? (
              <div className="space-y-6 sm:space-y-8">
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
              <p className="text-gray-500 text-base sm:text-lg text-center py-12 sm:py-20">
                לא נמצאו תוצאות עבור &ldquo;{query}&rdquo;.
              </p>
            )}
          </div>
        </div>
      </SiteMain>
    </SiteShell>
  );
}
