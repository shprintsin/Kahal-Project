"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/lib/i18n/language-provider';
import { SiteShell } from '@/components/ui/site-shell';
import type { SiteShellData } from '@/app/lib/get-navigation';
import DetailsView from './DetailsView';
import BlocksView from './BlocksView';
import ThumbnailsView from './ThumbnailsView';
import Pagination from './Pagination';
import type { ICollectionEntry, IVolumeEntry } from '@/types/collections';

interface CollectionDetailViewProps {
  collection: ICollectionEntry;
  siteShellData: SiteShellData;
}

type ViewMode = 'details' | 'blocks' | 'thumbs';
type SortMode = 'name-asc' | 'name-desc';

export default function CollectionDetailView({ collection, siteShellData }: CollectionDetailViewProps) {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getParam = useCallback((key: string, fallback: string | null = null) => {
    return searchParams.get(key) || fallback;
  }, [searchParams]);

  const [searchQuery, setSearchQuery] = useState(getParam('q', '') || '');
  const [viewMode, setViewMode] = useState<ViewMode>(getParam('view', 'blocks') as ViewMode);
  const [sortMode, setSortMode] = useState<SortMode>(getParam('sort', 'name-asc') as SortMode);
  const [itemsPerPage, setItemsPerPage] = useState(parseInt(getParam('per_page', '25') || '25'));
  const [currentPage, setCurrentPage] = useState(parseInt(getParam('page', '1') || '1'));

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const setOrRemove = (key: string, value: string | null, defaultValue: string) => {
      if (value && value !== defaultValue) params.set(key, value);
      else params.delete(key);
    };

    setOrRemove('q', searchQuery, '');
    setOrRemove('view', viewMode, 'blocks');
    setOrRemove('sort', sortMode, 'name-asc');
    setOrRemove('per_page', itemsPerPage.toString(), '25');
    setOrRemove('page', currentPage.toString(), '1');

    const newQuery = params.toString();
    if (newQuery !== searchParams.toString()) {
      router.replace(`${pathname}${newQuery ? `?${newQuery}` : ''}`, { scroll: false });
    }
  }, [searchQuery, viewMode, sortMode, itemsPerPage, currentPage, pathname, router, searchParams]);

  const filteredVolumes = useMemo(() => {
    let data = [...(collection.volumes || [])];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      data = data.filter(vol => 
        vol.metadata.title?.toLowerCase().includes(query) ||
        vol.metadata.title_en?.toLowerCase().includes(query) ||
        vol.metadata.description?.toLowerCase().includes(query)
      );
    }

    data.sort((a, b) => {
      const titleA = a.metadata.title || '';
      const titleB = b.metadata.title || '';
      return sortMode === 'name-asc' ? titleA.localeCompare(titleB) : titleB.localeCompare(titleA);
    });

    return data;
  }, [collection.volumes, searchQuery, sortMode]);

  const totalPages = Math.ceil(filteredVolumes.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVolumes.slice(start, start + itemsPerPage).map(vol => ({
      ...vol,
      collectionId: collection.id,
      collectionName: collection.id
    }));
  }, [filteredVolumes, currentPage, itemsPerPage, collection.id]);

  const volumesCount = (collection.volumes || []).length;

  return (
    <SiteShell {...siteShellData}>

      <main className="flex-1">
        <div className="max-w-7xl w-full px-4 md:w-11/12 mx-auto py-8 md:py-12 space-y-6">
          {/* Breadcrumb / meta */}
          <div className="bg-white shadow-sm p-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-brand-primary text-sm font-medium">
              <Link
                href={`/${locale}/collections`}
                className="inline-flex items-center gap-1 hover:opacity-80 transition"
              >
                {t('public.collections.backToAll')}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="text-xs text-muted-foreground">{volumesCount} {t('public.collections.volumes')}</div>
          </div>

          {/* Page Title */}
          <div className="bg-white shadow-sm p-8 space-y-3">
            <h1 className="text-4xl font-bold text-brand-primary font-display">{collection.id}</h1>
            <p className="text-body-secondary">{t('public.collections.collectionIncludes').replace('{count}', String(volumesCount))}</p>
          </div>

          {/* Search Bar */}
          <div className="bg-white shadow-sm p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                                type="search"
                placeholder={t('public.collections.searchVolumes')}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-10 pr-3 bg-white text-right border-border-strong focus-visible:ring-1 focus-visible:ring-brand-primary"
              />
            </div>
          </div>

          {/* View Controls */}
          <div className="bg-white shadow-sm p-4 md:p-6 flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-body">{t('public.collections.view')}</span>
              <div className="flex gap-2">
                {(['details', 'blocks', 'thumbs'] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`${
                      viewMode === mode
                        ? 'bg-brand-primary text-white shadow-sm'
                        : 'bg-muted text-foreground hover:bg-muted'
                    } px-4 py-2 text-sm rounded-md transition`}
                  >
                    {mode === 'details' ? t('public.collections.viewDetails') : mode === 'blocks' ? t('public.collections.viewBlocks') : t('public.collections.viewThumbs')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-body">{t('public.collections.sort')}</span>
                <Select value={sortMode} onValueChange={(v) => { setSortMode(v as SortMode); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[150px] border-border-strong bg-white text-right"><SelectValue placeholder={t('public.collections.sort')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">{t('public.collections.sortNameAsc')}</SelectItem>
                    <SelectItem value="name-desc">{t('public.collections.sortNameDesc')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-body">{t('public.collections.show')}</span>
                <Select value={itemsPerPage.toString()} onValueChange={(v) => { setItemsPerPage(parseInt(v)); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[110px] border-border-strong bg-white text-right"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-body">{t('public.collections.perPage')}</span>
              </div>
            </div>
          </div>

          {/* Results */}
          {paginatedData.length === 0 ? (
            <div className="bg-white shadow-sm p-12 text-center text-body-secondary">
              {t('public.collections.noVolumesMatch')}
            </div>
          ) : (
            <>
              {viewMode === 'details' && <DetailsView data={paginatedData} browseMode="volumes" onCollectionClick={() => {}} />}
              {viewMode === 'blocks' && <BlocksView data={paginatedData} browseMode="volumes" onCollectionClick={() => {}} />}
              {viewMode === 'thumbs' && <ThumbnailsView data={paginatedData} browseMode="volumes" onCollectionClick={() => {}} />}

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredVolumes.length}
              />
            </>
          )}
        </div>
      </main>
    
    </SiteShell>
  );
}
