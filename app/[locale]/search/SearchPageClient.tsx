"use client"

import PostCard from "@/app/components/views/PostCard";
import { SearchResult } from "@/app/admin/actions/search";
import type { SiteShellData } from "@/app/lib/get-navigation";
import { SiteShell, SiteMain } from "@/components/ui/site-shell";
import { useLanguage } from "@/lib/i18n/language-provider";
import { getDateLocale } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/config";

export default function SearchPageClient({
  results,
  query,
  shellData,
  locale,
}: {
  results: SearchResult[];
  query: string;
  shellData: SiteShellData;
  locale?: string;
}) {
  const { t, locale: ctxLocale } = useLanguage();
  const effectiveLocale = locale || ctxLocale;
  const dateLocale = getDateLocale(effectiveLocale as Locale);

  return (
    <SiteShell {...shellData} locale={locale}>
      <SiteMain>
        <div className="flex flex-col gap-6 sm:gap-8">
          <div className="w-full lg:w-2/3 mx-auto">
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-brand-primary mb-6 sm:mb-8 text-center">
              {query}
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
                      date: result.date ? new Date(result.date).toLocaleDateString(dateLocale) : null
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-base sm:text-lg text-center py-12 sm:py-20">
                {t('public.content.noResults', 'לא נמצאו תוצאות')}
              </p>
            )}
          </div>
        </div>
      </SiteMain>
    </SiteShell>
  );
}
