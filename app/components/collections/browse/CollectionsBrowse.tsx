"use client";

import { useState, useMemo, useEffect, useCallback, useTransition } from 'react';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getVolumesBySeriesId } from '@/app/actions/collections';
import { useLanguage } from '@/lib/i18n/language-provider';
import { SiteShell } from '@/components/ui/site-shell';
import type { SiteShellData } from '@/app/lib/get-navigation';
import VolumeGrid from './VolumeGrid';
import Pagination from './Pagination';
import type { CollectionWithSeries, SeriesWithVolumes, VolumeGridItem } from '@/types/collections';
import { SectionTitle } from '@/components/ui/typography';

interface CollectionsBrowseProps {
  collections: CollectionWithSeries[];
  allSeries: SeriesWithVolumes[];
  siteShellData: SiteShellData;
}

type ViewMode = 'list' | 'grid';
type SortMode = 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc';
type BrowseTab = 'collections' | 'series';

export default function CollectionsBrowse({ collections, allSeries, siteShellData }: CollectionsBrowseProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();


  // Helper to get search param with fallback
  const getParam = useCallback((key: string, fallback: string | null = null) => {
    return searchParams.get(key) || fallback;
  }, [searchParams]);

  // State initialized from URL params if present
  const [activeTab, setActiveTab] = useState<BrowseTab>(getParam('tab', 'collections') as BrowseTab);
  const [searchQuery, setSearchQuery] = useState(getParam('q', '') || '');
  const [viewMode, setViewMode] = useState<ViewMode>(getParam('view', 'list') as ViewMode);
  const [sortMode, setSortMode] = useState<SortMode>(getParam('sort', 'name-asc') as SortMode);
  const [itemsPerPage, setItemsPerPage] = useState(parseInt(getParam('per_page', '25') || '25'));
  const [currentPage, setCurrentPage] = useState(parseInt(getParam('page', '1') || '1'));
  
  // Expandable collections state
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
  
  // Selected series for showing volumes
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(
    () => searchParams.get('series') || null
  );
  const [selectedSeriesVolumes, setSelectedSeriesVolumes] = useState<VolumeGridItem[]>([]);
  const [loadingVolumes, setLoadingVolumes] = useState(false);

  const [prevSeriesId, setPrevSeriesId] = useState(selectedSeriesId);
  if (selectedSeriesId !== prevSeriesId) {
    setPrevSeriesId(selectedSeriesId);
    if (!selectedSeriesId) {
      setSelectedSeriesVolumes([]);
      setLoadingVolumes(false);
    } else {
      setLoadingVolumes(true);
    }
  }

  // Sync state back to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update params only if they differ from current values to avoid loops
    const setOrRemove = (key: string, value: string | null, defaultValue: string) => {
      if (value && value !== defaultValue) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    };

    setOrRemove('tab', activeTab, 'collections');
    setOrRemove('q', searchQuery, '');
    setOrRemove('view', viewMode, 'list');
    setOrRemove('sort', sortMode, 'name-asc');
    setOrRemove('per_page', itemsPerPage.toString(), '25');
    setOrRemove('page', currentPage.toString(), '1');
    
    if (selectedSeriesId) {
      params.set('series', selectedSeriesId);
    } else {
      params.delete('series');
    }

    const newQuery = params.toString();
    const currentQuery = searchParams.toString();

    if (newQuery !== currentQuery) {
      router.replace(`${pathname}${newQuery ? `?${newQuery}` : ''}`, { scroll: false });
    }
  }, [activeTab, searchQuery, viewMode, sortMode, itemsPerPage, currentPage, selectedSeriesId, pathname, router, searchParams]);

  useEffect(() => {
    if (!selectedSeriesId) return;
    let cancelled = false;
    getVolumesBySeriesId(selectedSeriesId)
      .then((data) => {
        if (!cancelled) {
          setSelectedSeriesVolumes(Array.isArray(data) ? data : []);
          setLoadingVolumes(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSelectedSeriesVolumes([]);
          setLoadingVolumes(false);
        }
      });
    return () => { cancelled = true; };
  }, [selectedSeriesId]);






  // Toggle collection expand/collapse
  const toggleCollection = (collectionId: string) => {
    setExpandedCollections((prev) => {
      const next = new Set(prev);
      if (next.has(collectionId)) {
        next.delete(collectionId);
      } else {
        next.add(collectionId);
      }
      return next;
    });
  };

  // Filter and sort data
  const filteredCollections = useMemo(() => {
    let data = [...collections];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      data = data.filter((coll) => {
        const nameI18n = coll.nameI18n as any;
        return (
          coll.name?.toLowerCase().includes(query) ||
          nameI18n?.en?.toLowerCase().includes(query) ||
          nameI18n?.he?.toLowerCase().includes(query) ||
          coll.id.toLowerCase().includes(query)
        );
      });
    }

    // Sort
    data.sort((a, b) => {
      const nameA = a.name || a.id;
      const nameB = b.name || b.id;
      
      if (sortMode === 'name-asc') return nameA.localeCompare(nameB);
      if (sortMode === 'name-desc') return nameB.localeCompare(nameA);
      if (sortMode === 'date-asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortMode === 'date-desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });

    return data;
  }, [collections, searchQuery, sortMode]);

  const filteredSeries = useMemo(() => {
    let data = [...allSeries];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      data = data.filter((series) => {
        const nameI18n = series.nameI18n as any;
        return (
          series.name?.toLowerCase().includes(query) ||
          nameI18n?.en?.toLowerCase().includes(query) ||
          nameI18n?.he?.toLowerCase().includes(query) ||
          series.collection?.name?.toLowerCase().includes(query)
        );
      });
    }

    // Sort
    data.sort((a, b) => {
      const nameA = a.name || a.id;
      const nameB = b.name || b.id;
      
      if (sortMode === 'name-asc') return nameA.localeCompare(nameB);
      if (sortMode === 'name-desc') return nameB.localeCompare(nameA);
      if (sortMode === 'date-asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortMode === 'date-desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });

    return data;
  }, [allSeries, searchQuery, sortMode]);

  // Pagination for collections/series
  const currentData = activeTab === 'collections' ? filteredCollections : filteredSeries;
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return currentData.slice(start, start + itemsPerPage);
  }, [currentData, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as BrowseTab);
    setCurrentPage(1);
    setSelectedSeriesId(null); // Clear series selection when switching tabs
  };

  const handleSeriesClick = (seriesId: string) => {
    // console.log('Series clicked:', seriesId, 'Current selected:', selectedSeriesId);
    const newSelectedId = selectedSeriesId === seriesId ? null : seriesId;
    // console.log('Setting selectedSeriesId to:', newSelectedId);
    setSelectedSeriesId(newSelectedId);
  };

  return (
    <SiteShell {...siteShellData}>
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Page Title */}
          <SectionTitle>{t('public.collections.title')}</SectionTitle>

          {/* Tabs for Browse Mode */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6 rounded-none">
            <TabsList className="bg-white border border-border">
              <TabsTrigger value="collections" className="data-[state=active]:bg-brand-primary rounded-none data-[state=active]:text-white">
                {t('public.collections.title')}
              </TabsTrigger>
              <TabsTrigger value="series" className="rounded-none data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                {t('public.collections.series')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6 rounded-none">
              {/* Search Bar */}
              <div className="bg-white border border-border p-4 mb-4 rounded-none">
                <div className="relative">
                  <Search className="absolute rounded-none left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t('public.collections.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 border-border-strong text-right rounded-none"
                  />
                </div>
              </div>

              {/* View Controls */}
              <div className="bg-white border border-border p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
                {/* Sort and Items Per Page */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-body-secondary">{t('public.collections.sort')}:</span>
                    <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
                      <SelectTrigger className="w-[140px] border-border-strong">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name-asc">{t('public.collections.sortNameAsc')}</SelectItem>
                        <SelectItem value="name-desc">{t('public.collections.sortNameDesc')}</SelectItem>
                        <SelectItem value="date-asc">{t('public.collections.sortDateAsc')}</SelectItem>
                        <SelectItem value="date-desc">{t('public.collections.sortDateDesc')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-body-secondary">{t('public.collections.show')}:</span>
                    <Select value={itemsPerPage.toString()} onValueChange={(v) => {
                      setItemsPerPage(parseInt(v));
                      setCurrentPage(1);
                    }}>
                      <SelectTrigger className="w-[100px] border-border-strong">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-body-secondary">{t('public.collections.perPage')}</span>
                  </div>
                </div>
              </div>

              {/* Results */}
              {paginatedData.length === 0 ? (
                <div className="bg-white border border-border p-12 text-center">
                  <p className="text-body-secondary">{t('public.collections.noResults')}</p>
                </div>
              ) : (
                <>
                  {activeTab === 'collections' ? (
                    <div className="bg-white border border-border">
                      {(paginatedData as CollectionWithSeries[]).map((collection) => {
                        const isExpanded = expandedCollections.has(collection.id);
                        const collectionName = (collection.nameI18n?.he || collection.nameI18n?.en || collection.name || t('public.collections.noName'));

                        return (
                          <div key={collection.id} className="border-b border-border last:border-b-0">
                            {/* Collection Row */}
                            <div
                              onClick={() => toggleCollection(collection.id)}
                              className="flex items-center justify-between p-4 hover:bg-surface-light cursor-pointer"
                                                          >
                              <div className="flex items-center gap-3">
                                {isExpanded ? (
                                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                )}
                                <div>
                                  <h3 className="font-bold text-lg font-display">{collectionName}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {collection.seriesCount || collection.series?.length || 0} {t('public.collections.series')}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Expanded Series */}
                            {isExpanded && collection.series && collection.series.length > 0 && (
                              <div className="bg-surface-light px-8 py-4">
                                {collection.series.map((series) => {
                                  const seriesName = (series.nameI18n?.he || series.nameI18n?.en || series.name || t('public.collections.noName'));
                                  
                                  return (
                                    <div
                                      key={series.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSeriesClick(series.id);
                                      }}
                                      className="flex items-center justify-between p-3 mb-2 last:mb-0 bg-white border border-border hover:border-brand-primary cursor-pointer transition-colors"
                                                                          >
                                      <div>
                                        <h4 className="font-bold font-display">{seriesName}</h4>
                                        <p className="text-sm text-muted-foreground">
                                          {series.volumeCount || 0} {t('public.collections.volumes')}
                                        </p>
                                      </div>
                                      {selectedSeriesId === series.id && (
                                        <ChevronDown className="w-5 h-5 text-brand-primary" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white border border-border">
                      {(paginatedData as SeriesWithVolumes[]).map((series) => {
                        const seriesName = (series.nameI18n?.he || series.nameI18n?.en || series.name || t('public.collections.noName'));
                        const collectionName = series.collection ? (series.collection.nameI18n?.he || series.collection.nameI18n?.en || series.collection.name) : '';

                        return (
                          <div
                            key={series.id}
                            onClick={() => handleSeriesClick(series.id)}
                            className="flex items-center justify-between p-4 border-b border-border last:border-b-0 hover:bg-surface-light cursor-pointer"
                                                      >
                            <div>
                              <h3 className="font-bold text-lg font-display">{seriesName}</h3>
                              <p className="text-sm text-muted-foreground">{collectionName}</p>
                              <p className="text-sm text-muted-foreground">
                                {series.volumeCount || 0} {t('public.collections.volumes')}
                              </p>
                            </div>
                            {selectedSeriesId === series.id && (
                              <ChevronDown className="w-5 h-5 text-brand-primary" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Volumes Grid (shown when series selected) */}
                  {selectedSeriesId && (
                    <div className="mt-6">
                      <h2 className="text-xl font-bold mb-4 text-right font-display">{t('public.collections.volumes')}</h2>
                      {loadingVolumes ? (
                        <div className="bg-white border border-border p-12 text-center">
                          <p className="text-body-secondary">{t('public.collections.loading')}</p>
                        </div>
                      ) : (
                        <>
                          {(() => {
                            let collectionId;
                            if (activeTab === 'collections') {
                              const collection = (paginatedData as CollectionWithSeries[]).find(c => 
                                c.series?.some(s => s.id === selectedSeriesId)
                              );
                              collectionId = collection?.id;
                            } else {
                              const series = (paginatedData as SeriesWithVolumes[]).find(s => s.id === selectedSeriesId);
                              collectionId = series?.collectionId;
                            }
                            
                            
                            return (
                              <VolumeGrid 
                                volumes={selectedSeriesVolumes}
                                collectionId={collectionId}
                              />
                            );
                          })()}
                        </>
                      )}
                    </div>
                  )}


                  {/* Pagination */}
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={currentData.length}
                  />
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

    </SiteShell>
  );
}
