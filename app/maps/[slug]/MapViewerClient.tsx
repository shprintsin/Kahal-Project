"use client"

import { useState } from 'react'
import { Calendar, Download, ExternalLink, MapPin, PanelBottom, PanelRight, Tag as TagIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Header from '@/app/components/layout/header/Header'
import GlobalFooter from '@/app/components/layout/GlobalFooter'
import { navigation, footerLinksMockData, copyrightTextMockData } from '@/app/Data'
import { useIsMobile } from '@/lib/hooks/use-mobile'
import { MapPreview } from './components/MapPreview'
import { LayerDownloadButton } from './components/LayerDownloadButton'
import type { Map } from '@/types/api-types'

type PanelPosition = 'side' | 'bottom'

interface MapViewerClientProps {
  map: Map;
}

function InfoPanel({ map }: { map: Map }) {
  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {map.description && (
        <p className="text-gray-600 text-base leading-relaxed">
          {map.description}
        </p>
      )}

      <dl className="space-y-4 text-right">
        {(map.year || map.period) && (
          <div className="flex flex-col gap-2 pb-4 border-b border-gray-200">
            <dt className="text-sm font-semibold text-gray-700 secular">תקופה</dt>
            <dd className="text-gray-900 text-base font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {map.year && <span>{map.year}</span>}
              {map.period && <span className="text-gray-600">• {map.period}</span>}
              {(map.yearMin && map.yearMax) && (
                <span className="text-gray-600">({map.yearMin} - {map.yearMax})</span>
              )}
            </dd>
          </div>
        )}

        {map.regions && map.regions.length > 0 && (
          <div className="flex flex-col gap-2 pb-4 border-b border-gray-200">
            <dt className="text-sm font-semibold text-gray-700 secular">אזורים</dt>
            <dd className="flex flex-wrap gap-2">
              {map.regions.map((region) => (
                <span
                  key={region.id}
                  className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  <MapPin className="w-3 h-3" />
                  {region.name}
                </span>
              ))}
            </dd>
          </div>
        )}

        {map.tags && map.tags.length > 0 && (
          <div className="flex flex-col gap-2 pb-4 border-b border-gray-200">
            <dt className="text-sm font-semibold text-gray-700 secular">תגיות</dt>
            <dd className="flex flex-wrap gap-2">
              {map.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  <TagIcon className="w-3 h-3" />
                  {tag.name}
                </span>
              ))}
            </dd>
          </div>
        )}

        {map.layers && map.layers.length > 0 && (
          <div className="flex flex-col gap-2 pb-4 border-b border-gray-200">
            <dt className="text-sm font-semibold text-gray-700 secular">שכבות</dt>
            <dd className="space-y-2">
              {map.layers.map((layer) => (
                <div key={layer.id} className="flex items-center justify-between gap-2">
                  <span className="text-gray-900 text-sm">{layer.name}</span>
                  <LayerDownloadButton layer={layer} />
                </div>
              ))}
            </dd>
          </div>
        )}
      </dl>

      {map.resources && map.resources.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3 secular text-right">הורדות</h3>
          <div className="space-y-2">
            {map.resources.map((resource) => (
              <a
                key={resource.id}
                href={resource.url}
                className="flex items-center gap-3 p-3 bg-white border border-gray-300 shadow-sm hover:border-emerald-600 hover:bg-emerald-50 transition-all group rounded"
                download
              >
                <Download className="w-4 h-4 text-emerald-700 group-hover:text-emerald-800" />
                <div className="flex-1 text-right">
                  <div className="text-sm font-semibold text-gray-900">{resource.name}</div>
                  <div className="text-xs text-gray-500">{resource.format}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {map.referenceLinks && Array.isArray(map.referenceLinks) && map.referenceLinks.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3 secular text-right">קישורים</h3>
          <div className="space-y-2">
            {map.referenceLinks.map((link: any, index: number) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-white border border-gray-300 shadow-sm hover:border-emerald-600 hover:bg-emerald-50 transition-all rounded"
              >
                <ExternalLink className="w-4 h-4 text-emerald-700" />
                <span className="text-sm font-semibold text-gray-900">{link.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {map.version && (
        <div className="bg-gray-100 p-3 rounded border border-gray-200">
          <div className="text-sm text-gray-600 text-right">
            <span className="font-semibold">גרסה: </span>
            <span className="font-mono">{map.version}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export function MapViewerClient({ map }: MapViewerClientProps) {
  const isMobile = useIsMobile()
  const [panelPosition, setPanelPosition] = useState<PanelPosition>(isMobile ? 'bottom' : 'side')

  const togglePanel = () => {
    setPanelPosition(prev => prev === 'side' ? 'bottom' : 'side')
  }

  const isSide = panelPosition === 'side'

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir="rtl">
      <Header navigation={navigation} />

      <main className="flex-grow w-full">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between mb-6">
            <div className="text-right">
              {map.category && (
                <p className="text-emerald-700 text-base mb-2 font-semibold uppercase tracking-wide">
                  {map.category.title}
                </p>
              )}
              <h1 className="secular text-4xl leading-tight text-[var(--dark-green)]">
                {map.title}
              </h1>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={togglePanel}
              className="shrink-0 mt-1"
              title={isSide ? 'הצג פאנל למטה' : 'הצג פאנל בצד'}
            >
              {isSide ? <PanelBottom className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
              <span className="hidden sm:inline mr-1">{isSide ? 'פאנל תחתון' : 'פאנל צדדי'}</span>
            </Button>
          </div>

          {isSide ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
              <div className="min-h-[600px]">
                <MapPreview map={map} />
              </div>
              <div className="bg-white p-6 shadow-sm border border-gray-200 rounded-lg">
                <InfoPanel map={map} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="min-h-[600px]">
                <MapPreview map={map} />
              </div>
              <div className="bg-white p-6 shadow-sm border border-gray-200 rounded-lg">
                <InfoPanel map={map} />
              </div>
            </div>
          )}
        </div>
      </main>

      <GlobalFooter links={footerLinksMockData} copyrightText={copyrightTextMockData} />
    </div>
  );
}
