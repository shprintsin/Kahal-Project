"use client"

import { useCallback, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search as SearchIcon, FileText, Newspaper, Map as MapIcon, Database, ScrollText, Library } from "lucide-react"

import type { SearchContentType, SearchResponse } from "@/app/admin/actions/search"
import type { SiteShellData } from "@/app/lib/get-navigation"
import { SiteShell, SiteMain } from "@/components/ui/site-shell"
import Pagination from "@/app/components/views/Pagination"
import { SearchResultCard, type SearchResultItem } from "@/app/components/views/content-cards"
import { useTranslations, useLocale } from "next-intl"
import { getDateLocale } from "@/lib/i18n/config"
import type { Locale } from "@/lib/i18n/config"

const TYPE_META: Record<SearchContentType, { icon: typeof FileText; labelKey: string; fallback: string }> = {
  page:     { icon: FileText,   labelKey: 'search.type.page',     fallback: 'דפים' },
  post:     { icon: Newspaper,  labelKey: 'search.type.post',     fallback: 'מאמרים' },
  dataset:  { icon: Database,   labelKey: 'search.type.dataset',  fallback: 'מפות' },
  layer:    { icon: MapIcon,    labelKey: 'search.type.layer',    fallback: 'שכבות' },
  artifact: { icon: ScrollText, labelKey: 'search.type.artifact', fallback: 'מסמכים' },
  series:   { icon: Library,    labelKey: 'search.type.series',   fallback: 'סדרות' },
}

const TYPE_ORDER: SearchContentType[] = ['page', 'post', 'dataset', 'layer', 'artifact', 'series']

interface Props {
  searchResponse: SearchResponse
  query: string
  shellData: SiteShellData
  locale?: string
  activeType: SearchContentType | null
  activeRegion: string | null
  regions: { id: string; slug: string; name: string }[]
}

export default function SearchPageClient({
  searchResponse,
  query,
  shellData,
  locale,
  activeType,
  activeRegion,
  regions,
}: Props) {
  const t = useTranslations()
  const ctxLocale = useLocale()
  const effectiveLocale = locale || ctxLocale
  const dateLocale = getDateLocale(effectiveLocale as Locale)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [inputValue, setInputValue] = useState(query)

  const { results, counts, total } = searchResponse

  const itemsPerPage = 10
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1)
  const totalPages = Math.ceil(results.length / itemsPerPage)
  const currentItems = results.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Map results to SearchResultItem format for the card component
  const cardItems: SearchResultItem[] = currentItems.map(r => ({
    id: r.id,
    title: r.title,
    excerpt: r.description || undefined,
    thumbnail: r.thumbnail,
    slug: r.slug,
    date: r.date ? new Date(r.date).toLocaleDateString(dateLocale) : null,
    type: r.type,
  }))

  function buildUrl(overrides: { q?: string; type?: string | null; region?: string | null; page?: number }) {
    const params = new URLSearchParams()
    const q = overrides.q ?? inputValue
    if (q) params.set('q', q)
    const t = overrides.type !== undefined ? overrides.type : activeType
    if (t) params.set('type', t)
    const r = overrides.region !== undefined ? overrides.region : activeRegion
    if (r) params.set('region', r)
    if (overrides.page && overrides.page > 1) params.set('page', String(overrides.page))
    return `/${effectiveLocale}/search?${params.toString()}`
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (inputValue.trim()) router.push(buildUrl({ q: inputValue.trim(), page: 1 }))
  }

  const handlePageChange = useCallback((page: number) => {
    router.push(buildUrl({ page }))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [router, activeType, activeRegion, inputValue, effectiveLocale])

  return (
    <SiteShell {...shellData} locale={locale}>
      <SiteMain>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content — 2/3 */}
          <div className="w-full lg:w-2/3">
            <h1 className="font-display text-3xl md:text-4xl text-brand-primary mb-8 flex items-center gap-3">
              <SearchIcon className="w-8 h-8" />
              {query
                ? `${t('search.resultsFor')} "${query}"`
                : t('common.search')}
            </h1>

            {/* Search input */}
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={t('public.search.placeholder')}
                  className="flex-1 border border-border rounded-none py-2.5 px-4 text-base bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition shadow-sm"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-brand-primary text-white px-5 py-2.5 rounded-none font-semibold hover:bg-brand-primary/90 transition shadow-sm flex items-center gap-2"
                >
                  <SearchIcon className="w-4 h-4" />
                  {t('public.search.submit')}
                </button>
              </div>
            </form>

            {/* Type filter tabs */}
            {query && (
              <div className="flex flex-wrap gap-2 mb-8">
                <button
                  onClick={() => router.push(buildUrl({ type: null, page: 1 }))}
                  className={`px-3 py-1.5 rounded-none text-sm font-medium border transition ${
                    !activeType
                      ? 'bg-brand-primary text-white border-brand-primary'
                      : 'bg-white text-muted-foreground border-border hover:border-brand-primary/40'
                  }`}
                >
                  {t('search.type.all')} ({total})
                </button>
                {TYPE_ORDER.map(type => {
                  const count = counts[type]
                  if (count === 0) return null
                  const cfg = TYPE_META[type]
                  const Icon = cfg.icon
                  return (
                    <button
                      key={type}
                      onClick={() => router.push(buildUrl({ type, page: 1 }))}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none text-sm font-medium border transition ${
                        activeType === type
                          ? 'bg-brand-primary text-white border-brand-primary'
                          : 'bg-white text-muted-foreground border-border hover:border-brand-primary/40'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {t(cfg.labelKey, cfg.fallback)} ({count})
                    </button>
                  )
                })}
              </div>
            )}

            {/* Results */}
            {cardItems.length > 0 ? (
              <>
                <div className="space-y-10 bg-white p-6 md:p-8 rounded-none shadow-sm">
                  {cardItems.map((item) => (
                    <div key={`${item.type}-${item.id}`}>
                      <SearchResultCard item={item} />
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-10 flex justify-center">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                  </div>
                )}
              </>
            ) : query ? (
              <div className="text-center py-20 bg-white rounded-none shadow-sm border border-border">
                <div className="mx-auto mb-4 flex justify-center">
                  <SearchIcon className="w-16 h-16 text-border" />
                </div>
                <p className="text-muted-foreground text-base sm:text-lg">
                  {t('public.content.noResults')}
                </p>
                <p className="text-sm text-muted-foreground/70 mt-2">
                  {t('search.noResults.hint')}
                </p>
              </div>
            ) : null}
          </div>

          {/* Sidebar — 1/3 */}
          <div className="w-full lg:w-1/3">
            <div className="space-y-8 bg-surface-subtle p-6 rounded-md">
              {/* Region filter */}
              {regions.length > 0 && (
                <div>
                  <h3 className="font-display text-xl text-brand-primary mb-4">
                    {t('search.filter.region')}
                  </h3>
                  <ul className="space-y-3">
                    <li>
                      <button
                        onClick={() => router.push(buildUrl({ region: null, page: 1 }))}
                        className={`flex justify-between items-center w-full text-start transition-colors duration-200 ${
                          !activeRegion ? 'text-brand-primary font-semibold' : 'hover:text-brand-secondary'
                        }`}
                      >
                        <span>{t('search.filter.allRegions')}</span>
                      </button>
                    </li>
                    {regions.map((region) => (
                      <li key={region.id}>
                        <button
                          onClick={() => router.push(buildUrl({ region: region.slug, page: 1 }))}
                          className={`flex justify-between items-center w-full text-start transition-colors duration-200 ${
                            activeRegion === region.slug ? 'text-brand-primary font-semibold' : 'hover:text-brand-secondary'
                          }`}
                        >
                          <span>{region.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Content type summary */}
              {query && total > 0 && (
                <div>
                  <h3 className="font-display text-xl text-brand-primary mb-4">
                    {t('search.filter.contentTypes')}
                  </h3>
                  <ul className="space-y-3">
                    {TYPE_ORDER.map(type => {
                      const count = counts[type]
                      if (count === 0) return null
                      const cfg = TYPE_META[type]
                      const Icon = cfg.icon
                      return (
                        <li key={type}>
                          <button
                            onClick={() => router.push(buildUrl({ type: activeType === type ? null : type, page: 1 }))}
                            className={`flex justify-between items-center w-full text-start transition-colors duration-200 ${
                              activeType === type ? 'text-brand-primary font-semibold' : 'hover:text-brand-secondary'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {t(cfg.labelKey, cfg.fallback)}
                            </span>
                            <span className="text-sm text-muted-foreground">({count})</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </SiteMain>
    </SiteShell>
  )
}
