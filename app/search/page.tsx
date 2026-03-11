import { searchContent } from "@/app/admin/actions/search";
import SearchPageClient from "./SearchPageClient";
import { getSiteShellData } from "@/app/lib/get-navigation";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>;
}) {
  const { q } = await searchParams;
  const [results, shellData] = await Promise.all([
    searchContent(q || ""),
    getSiteShellData(),
  ]);

  return <SearchPageClient results={results} query={q || ""} shellData={shellData} />;
}
