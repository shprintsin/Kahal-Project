import type { Metadata } from 'next';

import { searchContent } from "@/app/admin/actions/search";
import { getSiteShellData } from "@/app/lib/get-navigation";
import { createPageMetadata } from "@/lib/i18n/metadata";
import SearchPageClient from "./SearchPageClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return createPageMetadata(locale, 'common.search', '/search');
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  const [results, shellData] = await Promise.all([
    searchContent(q || ""),
    getSiteShellData(locale),
  ]);

  return <SearchPageClient results={results} query={q || ""} shellData={shellData} locale={locale} />;
}
