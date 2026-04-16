"use client"

import { useState } from 'react'
import { SiteShell, SiteMain } from '@/components/ui/site-shell'
import { MapPreview } from './components/MapPreview'
import { TagPill, TagPillList } from '@/components/ui/tag-pill'
import { DlField, DlGroup } from '@/components/ui/dl-field'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageTitle } from '@/components/ui/typography'
import { Calendar, Tag as TagIcon, MapPin, Download, ExternalLink, Eye, FileSpreadsheet, FileJson, FileText, AlertCircle } from 'lucide-react'
import { VersionHistory } from './components/VersionHistory'
import { LayerDownloadButton } from './components/LayerDownloadButton'
import { SidebarCard } from './components/SidebarCard'
import { InteractiveRow } from './components/InteractiveRow'
import { MaturityBadge, PublishStatusBadge } from '@/components/ui/status-badge'
import { CsvViewerDialog } from '@/app/admin/components/content/csv-viewer-dialog'
import { useDownloadTerms } from '@/components/ui/download-terms-provider'
import { triggerBrowserDownload } from '@/lib/downloadGeoJson'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import type { MapDataset } from '@/lib/view-types'
import type { SiteShellData } from '@/app/lib/get-navigation'
import { SetEditUrl } from '@/components/ui/admin-toolbar'
import { useTranslations } from 'next-intl'
import { getDateLocale, type Locale } from '@/lib/i18n/config'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getResourceIcon(format: string) {
  switch ((format || '').toUpperCase()) {
    case 'XLSX':
    case 'CSV':
      return <FileSpreadsheet className="w-5 h-5" />
    case 'JSON':
    case 'GEOJSON':
      return <FileJson className="w-5 h-5" />
    case 'PDF':
    case 'TXT':
    case 'MD':
      return <FileText className="w-5 h-5" />
    default:
      return <Download className="w-5 h-5" />
  }
}

function normalizeMaturity(m?: string): string | undefined {
  if (!m) return undefined
  if (m === 'Validated') return 'verified'
  if (m === 'Preliminary') return 'provisional'
  return m.toLowerCase()
}

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
  const t = useTranslations()
  const [csvPreview, setCsvPreview] = useState<{ url: string; name: string } | null>(null)
  const { requestDownload } = useDownloadTerms()
  const dateLocale = getDateLocale(locale as Locale)
  return (
    <SiteShell {...shellData} locale={locale}>
      <SetEditUrl url={`/admin/maps/${map.id}`} />
      <main className="flex-grow w-full">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-10 text-right">
            <div className="flex items-center gap-2 mb-3 text-sm" dir="rtl">
              <a href={`/${locale}/maps`} className="text-muted-foreground hover:text-brand-primary transition-colors"> {t('public.maps.title')} </a>
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
                        <TabsTrigger value="description">{t('public.datasets.description')}</TabsTrigger>
                        <TabsTrigger value="codebook">{t('public.map.codebook')}</TabsTrigger>
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
                        {map.description ? t('public.datasets.description') : t('public.map.codebook')}
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
              <SidebarCard title={t('public.map.details')}>
                <DlGroup>
                  <DlField label={t('public.datasets.status')}>
                    <span className="flex gap-2 flex-wrap">
                      <PublishStatusBadge status={map.status} />
                      {map.maturity && <MaturityBadge maturity={normalizeMaturity(map.maturity) as any} />}
                    </span>
                  </DlField>

                  {(map.year || map.period) && (
                    <DlField label={t('public.datasets.period')}>
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
                    <DlField label={t('pages.regions.title')}>
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
                    <DlField label={t('nav.tags')}>
                      <TagPillList>
                        {map.tags.map((tag) => (
                          <TagPill key={tag.id} variant="tag" icon={<TagIcon className="w-3 h-3" />}>
                            {tag.name}
                          </TagPill>
                        ))}
                      </TagPillList>
                    </DlField>
                  )}

                  {map.updatedAt && (
                    <DlField label={t('public.datasets.lastUpdated')}>
                      <span className="text-sm text-foreground">
                        {new Date(map.updatedAt).toLocaleDateString(dateLocale)}
                      </span>
                    </DlField>
                  )}

                  <VersionHistory
                    version={map.version}
                    deployments={deployments}
                  />

                  {map.license && (
                    <DlField label={t('public.datasets.license')}>
                      <span className="text-sm text-foreground font-mono">{map.license}</span>
                    </DlField>
                  )}
                  
                </DlGroup>
              </SidebarCard>

              {map.layers && map.layers.length > 0 && (
                <SidebarCard title={t('public.map.dataLayers')}>
                  <div className="space-y-3">
                    {map.layers.map((layer) => (
                      <LayerDownloadButton
                        key={layer.id}
                        layer={layer}
                      >
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 ${
                          layer.type === 'POINTS'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {layer.type === 'POINTS' ? t('public.map.points') : t('public.map.polygons')}
                        </span>
                        <div className="flex-1 text-right min-w-0">
                          <div className="text-sm font-semibold text-foreground mb-1">{layer.name}</div>
                          <div className="text-xs text-muted-foreground truncate" dir="ltr">{layer.filename || `${layer.slug}.geojson`}</div>
                        </div>
                      </LayerDownloadButton>
                    ))}
                  </div>
                </SidebarCard>
              )}

              {map.resources && map.resources.length > 0 && (
                <SidebarCard title={t('public.map.downloads')}>
                  <div className="space-y-3">
                    {map.resources.map((resource) => (
                      <div key={resource.id} className="flex items-stretch border border-border-strong shadow-sm bg-white hover:border-brand-primary transition-all">
                        <button
                          type="button"
                          onClick={() => requestDownload(() => triggerBrowserDownload(resource.url, resource.filename || resource.name))}
                          className="flex items-center gap-3 p-3 sm:p-4 flex-1 hover:bg-brand-primary-light transition-colors cursor-pointer min-w-0 text-right"
                          title={`${t('public.map.download')} ${resource.name}`}
                        >
                          <div className="text-brand-primary shrink-0">
                            {getResourceIcon(resource.format)}
                          </div>
                          <div className="flex-1 text-right min-w-0">
                            <div className="text-xs sm:text-sm font-semibold text-foreground mb-1">{resource.name}</div>
                            {resource.filename && (
                              <div className="text-[11px] sm:text-xs text-muted-foreground font-mono truncate" dir="ltr">{resource.filename}</div>
                            )}
                            <div className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                              {resource.format}{resource.sizeBytes && resource.sizeBytes > 0 ? ` • ${formatFileSize(resource.sizeBytes)}` : ''}
                            </div>
                          </div>
                          <Download className="h-4 w-4 text-brand-primary shrink-0" />
                        </button>
                        {(resource.format || '').toUpperCase() === 'CSV' && (
                          <>
                            <div className="w-px bg-border-strong self-stretch" />
                            <button
                              type="button"
                              onClick={() => setCsvPreview({ url: resource.url, name: resource.name })}
                              className="px-3 sm:px-4 hover:bg-brand-primary-light transition-colors flex items-center"
                              title={t('public.datasets.preview')}
                            >
                              <Eye className="w-5 h-5 text-brand-primary" />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </SidebarCard>
              )}

              {map.referenceLinks && Array.isArray(map.referenceLinks) && map.referenceLinks.length > 0 && (
                <SidebarCard title={t('public.map.links')}>
                  <div className="space-y-3">
                    {map.referenceLinks.map((link: any, index: number) => (
                      <InteractiveRow
                        key={index}
                        as="a"
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className="text-brand-primary">
                          <ExternalLink className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-semibold text-foreground">{link.title}</span>
                      </InteractiveRow>
                    ))}
                  </div>
                </SidebarCard>
              )}

              <div className="bg-white p-4 border border-border shadow-sm">
                <a
                  href={`/${locale}/contact?subject=${encodeURIComponent(`דיווח על שגיאה: ${map.title}`)}`}
                  className="flex items-center gap-2 text-xs text-body-secondary hover:text-brand-primary transition-colors justify-center py-1"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{t('public.map.reportError')}</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </main>
      {csvPreview && (
        <CsvViewerDialog
          open={!!csvPreview}
          onOpenChange={(open) => { if (!open) setCsvPreview(null); }}
          url={csvPreview.url}
          name={csvPreview.name}
        />
      )}
    </SiteShell>
  );
}
