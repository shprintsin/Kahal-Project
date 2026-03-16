"use client"

import { SiteShell, SiteMain } from '@/components/ui/site-shell'
import { MapPreview } from './components/MapPreview'
import { TagPill, TagPillList } from '@/components/ui/tag-pill'
import { DlField, DlGroup } from '@/components/ui/dl-field'
import { InfoPanel, DownloadLink, ExternalLinkItem, VersionBadge } from '@/components/ui/info-panel'
import { PageTitle } from '@/components/ui/typography'
import { Calendar, Tag as TagIcon, MapPin } from 'lucide-react'
import type { Map } from '@/types/api-types'
import type { SiteShellData } from '@/app/lib/get-navigation'

interface MapViewerClientProps {
  map: Map;
  shellData: SiteShellData;
}

export function MapViewerClient({ map, shellData }: MapViewerClientProps) {
  return (
    <SiteShell {...shellData}>
      <main className="flex-grow w-full">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-10 text-right">
            {map.category && (
              <p className="text-emerald-700 text-base mb-3 font-semibold uppercase tracking-wide">
                {map.category.title}
              </p>
            )}
            <PageTitle>{map.title}</PageTitle>
            {map.description && (
              <p className="text-gray-600 text-lg leading-relaxed max-w-4xl">
                {map.description}
              </p>
            )}
          </div>

          <div className="mb-8">
            <MapPreview map={map} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-white p-8 shadow-sm border border-gray-200">
              <DlGroup>
                {(map.year || map.period) && (
                  <DlField label="תקופה">
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
                  <DlField label="אזורים">
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
                  <DlField label="תגיות">
                    <TagPillList>
                      {map.tags.map((tag) => (
                        <TagPill key={tag.id} variant="tag" icon={<TagIcon className="w-3 h-3" />}>
                          {tag.name}
                        </TagPill>
                      ))}
                    </TagPillList>
                  </DlField>
                )}

                {map.layers && map.layers.length > 0 && (
                  <DlField label="שכבות" border={false}>
                    {map.layers.length} שכבות גיאוגרפיות
                  </DlField>
                )}
              </DlGroup>
            </div>

            <div className="flex flex-col gap-6">
              {map.resources && map.resources.length > 0 && (
                <InfoPanel title="הורדות">
                  {map.resources.map((resource) => (
                    <DownloadLink
                      key={resource.id}
                      href={resource.url}
                      name={resource.name}
                      format={resource.format}
                    />
                  ))}
                </InfoPanel>
              )}

              {map.referenceLinks && Array.isArray(map.referenceLinks) && map.referenceLinks.length > 0 && (
                <InfoPanel title="קישורים">
                  {map.referenceLinks.map((link: any, index: number) => (
                    <ExternalLinkItem key={index} href={link.url} title={link.title} />
                  ))}
                </InfoPanel>
              )}

              {map.version && <VersionBadge version={map.version} />}
            </div>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
