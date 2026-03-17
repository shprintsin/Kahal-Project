import { SiteShell, SiteMain } from '@/components/ui/site-shell'
import { MapPreview } from './components/MapPreview'
import { TagPill, TagPillList } from '@/components/ui/tag-pill'
import { DlField, DlGroup } from '@/components/ui/dl-field'
import { PageTitle } from '@/components/ui/typography'
import { Calendar, Tag as TagIcon, MapPin, Download, ExternalLink, Layers } from 'lucide-react'
import { VersionHistory } from './components/VersionHistory'
import { LayerDownloadButton } from './components/LayerDownloadButton'
import ReactMarkdown from 'react-markdown'
import type { Map } from '@/types/api-types'
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
  map: Map;
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
            {map.category && (
              <p className="text-emerald-700 text-base mb-3 font-semibold uppercase tracking-wide">
                {map.category.title}
              </p>
            )}
            <PageTitle>{map.title}</PageTitle>
          </div>

          <div className="mb-8">
            <MapPreview map={map} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {map.description && (
                <div className="bg-stone-50 dark:bg-stone-900/30 p-6 sm:p-8 lg:p-10 border border-stone-200 dark:border-stone-700/50 h-full">
                  <h3 className="text-xl font-bold text-foreground mb-5 font-display">{t('public.datasets.description', 'תיאור')}</h3>
                  <div
                    className="prose prose-lg prose-stone max-w-none leading-relaxed"
                    dir="auto"
                    style={{ fontSize: '16px', lineHeight: '1.8' }}
                  >
                    <ReactMarkdown>{map.description}</ReactMarkdown>
                  </div>
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
                      <div
                        key={layer.id}
                        className="flex items-center gap-3 p-3 sm:p-4 bg-white border border-border-strong shadow-sm"
                      >
                        <div className="text-brand-primary">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div className="flex-1 text-right">
                          <div className="text-sm font-semibold text-foreground mb-1">{layer.name}</div>
                          <div className="text-xs text-muted-foreground">GeoJSON</div>
                        </div>
                        <LayerDownloadButton layer={layer} />
                      </div>
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
