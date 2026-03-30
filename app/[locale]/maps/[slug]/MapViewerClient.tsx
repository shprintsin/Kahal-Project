"use client"

import { SiteShell, SiteMain } from '@/components/ui/site-shell'
import { MapPreview } from './components/MapPreview'
import { TagPill, TagPillList } from '@/components/ui/tag-pill'
import { DlField, DlGroup } from '@/components/ui/dl-field'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageTitle } from '@/components/ui/typography'
import { Calendar, Tag as TagIcon, MapPin, Download, ExternalLink, Layers } from 'lucide-react'
import { VersionHistory } from './components/VersionHistory'
import { LayerDownloadButton } from './components/LayerDownloadButton'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import type { MapDataset } from '@/types/api-types'
import type { SiteShellData } from '@/app/lib/get-navigation'
import { SetEditUrl } from '@/components/ui/admin-toolbar'
import { useLanguage } from '@/lib/i18n/language-provider'

interface Deployment {
  id: string
  version: string
  changeLog: string | null
  gitSha: string | null
  deployedAt: string | Date
}

interface MapViewerClientProps {
  map: MapDataset;
  shellData: SiteShellData;
  deployments?: Deployment[];
  locale?: string;
}

export function MapViewerClient({ map, shellData, deployments = [], locale }: MapViewerClientProps) {
  const { t } = useLanguage()
  return (
    <SiteShell {...shellData} locale={locale}>
      <SetEditUrl url={`/admin/maps/${map.id}`} />
      <main className="flex-grow w-full">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-10 text-right">
            <div className="flex items-center gap-2 mb-3 text-sm" dir="rtl">
              <a href={`/${locale}/maps`} className="text-muted-foreground hover:text-brand-primary transition-colors">
                {t('public.maps.title', 'מפות')}
              </a>
              {map.category && (
                <>
                  <span className="text-muted-foreground">/</span>
                  <a href={`/${locale}/categories/${map.category.slug}`} className="text-brand-primary font-semibold hover:underline">
                    {map.category.title}
                  </a>
                </>
              )}
            </div>
            <PageTitle>{map.title}</PageTitle>
          </div>

          <div className="mb-8">
            <MapPreview map={map} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {(map.description || map.codebookText) && (
                <div className="bg-stone-50 dark:bg-stone-900/30 p-6 sm:p-8 lg:p-10 border border-stone-200 dark:border-stone-700/50 h-full">
                  {map.description && map.codebookText ? (
                    <Tabs defaultValue="description">
                      <TabsList>
                        <TabsTrigger value="description">{t('public.datasets.description', 'תיאור')}</TabsTrigger>
                        <TabsTrigger value="codebook">{t('public.map.codebook', 'מילון נתונים (Codebook)')}</TabsTrigger>
                      </TabsList>
                      <TabsContent value="description">
                        <div className="markdown-content pt-4" dir="rtl">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{map.description}</ReactMarkdown>
                        </div>
                      </TabsContent>
                      <TabsContent value="codebook">
                        <div className="markdown-content pt-4" dir="rtl">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{map.codebookText}</ReactMarkdown>
                        </div>
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-foreground mb-5 font-display">
                        {map.description ? t('public.datasets.description', 'תיאור') : t('public.map.codebook', 'מילון נתונים (Codebook)')}
                      </h3>
                      <div className="markdown-content" dir="rtl">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{(map.description || map.codebookText)!}</ReactMarkdown>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-white p-4 sm:p-6 shadow-sm border border-border">
                <h3 className="text-lg font-bold text-foreground mb-4 font-display">{t('public.map.details')}</h3>
                <DlGroup>
                  {(map.year || map.period) && (
                    <DlField label={t('public.datasets.period', 'תקופה')}>
                      <span className="flex items-center gap-2 font-medium">
                        <Calendar className="w-4 h-4" />
                        {map.year && <span>{map.year}</span>}
                        {map.period && <span className="text-gray-600">• {map.period}</span>}
                        {(map.yearMin && map.yearMax) && (
                          <span className="text-gray-600">({map.yearMin} - {map.yearMax})</span>
                        )}
                      </span>
                    </DlField>
                  )}

                  {map.regions && map.regions.length > 0 && (
                    <DlField label={t('pages.regions.title', 'אזורים')}>
                      <TagPillList>
                        {map.regions.map((region) => (
                          <TagPill key={region.id} variant="region" icon={<MapPin className="w-3 h-3" />}>
                            {region.name}
                          </TagPill>
                        ))}
                      </TagPillList>
                    </DlField>
                  )}

                  {map.tags && map.tags.length > 0 && (
                    <DlField label={t('nav.tags', 'תגיות')}>
                      <TagPillList>
                        {map.tags.map((tag) => (
                          <TagPill key={tag.id} variant="tag" icon={<TagIcon className="w-3 h-3" />}>
                            {tag.name}
                          </TagPill>
                        ))}
                      </TagPillList>
                    </DlField>
                  )}

                  <VersionHistory
                    version={map.version}
                    deployments={deployments}
                  />
                </DlGroup>
              </div>

              {map.layers && map.layers.length > 0 && (
                <div className="bg-white p-4 sm:p-6 shadow-sm border border-border">
                  <h3 className="text-lg font-bold text-foreground mb-4 font-display">{t('public.map.dataLayers')}</h3>
                  <div className="space-y-3">
                    {map.layers.map((layer) => (
                      <LayerDownloadButton
                        key={layer.id}
                        layer={layer}
                        className="flex items-center gap-3 p-3 sm:p-4 w-full bg-white border border-border-strong shadow-sm hover:border-brand-primary hover:bg-brand-primary-light transition-all cursor-pointer"
                      >
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 ${
                          layer.type === 'POINTS'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {layer.type === 'POINTS' ? t('public.map.points', 'נקודות') : t('public.map.polygons', 'גבולות')}
                        </span>
                        <div className="flex-1 text-right">
                          <div className="text-sm font-semibold text-foreground mb-1">{layer.name}</div>
                          <div className="text-xs text-muted-foreground" dir="ltr">{layer.filename || `${layer.slug}.geojson`}</div>
                        </div>
                      </LayerDownloadButton>
                    ))}
                  </div>
                </div>
              )}

              {map.resources && map.resources.length > 0 && (
                <div className="bg-white p-4 sm:p-6 shadow-sm border border-border">
                  <h3 className="text-lg font-bold text-foreground mb-4 font-display">{t('public.map.downloads')}</h3>
                  <div className="space-y-3">
                    {map.resources.map((resource) => (
                      <a
                        key={resource.id}
                        href={resource.url}
                        download
                        className="flex items-center gap-3 p-3 sm:p-4 bg-white border border-border-strong shadow-sm hover:border-brand-primary hover:bg-brand-primary-light transition-all group"
                      >
                        <div className="text-brand-primary">
                          <Download className="w-5 h-5" />
                        </div>
                        <div className="flex-1 text-right">
                          <div className="text-sm font-semibold text-foreground mb-1">{resource.name}</div>
                          {resource.format && (
                            <div className="text-xs text-muted-foreground">{resource.format}</div>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {map.referenceLinks && Array.isArray(map.referenceLinks) && map.referenceLinks.length > 0 && (
                <div className="bg-white p-4 sm:p-6 shadow-sm border border-border">
                  <h3 className="text-lg font-bold text-foreground mb-4 font-display">{t('public.map.links')}</h3>
                  <div className="space-y-3">
                    {map.referenceLinks.map((link: any, index: number) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 sm:p-4 bg-white border border-border-strong shadow-sm hover:border-brand-primary hover:bg-brand-primary-light transition-all"
                      >
                        <div className="text-brand-primary">
                          <ExternalLink className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-semibold text-foreground">{link.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
