import type { Metadata } from 'next';

import { searchContent, getSearchRegions } from "@/app/admin/actions/search";
import type { SearchContentType } from "@/app/admin/actions/search";
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
  searchParams: Promise<{ q?: string; type?: string; region?: string }>;
}) {
  const { locale } = await params;
  const { q, type, region } = await searchParams;

  const validTypes: SearchContentType[] = ['page', 'post', 'layer', 'dataset', 'artifact', 'series'];
  const typeFilter = type && validTypes.includes(type as SearchContentType) ? (type as SearchContentType) : null;

  const [searchResponse, shellData, regions] = await Promise.all([
    searchContent(q || "", { type: typeFilter, region: region || null }),
    getSiteShellData(locale),
    getSearchRegions(),
  ]);

  return (
    <SearchPageClient
      searchResponse={searchResponse}
      query={q || ""}
      shellData={shellData}
      locale={locale}
      activeType={typeFilter}
      activeRegion={region || null}
      regions={regions}
    />
  );
}
