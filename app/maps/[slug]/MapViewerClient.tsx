"use client"

import Header from '@/app/components/layout/header/Header'
import GlobalFooter from '@/app/components/layout/GlobalFooter'
import { navigation, footerLinksMockData, copyrightTextMockData } from '@/app/Data'
import { MapPreview } from './components/MapPreview'
import { Calendar, Tag as TagIcon, MapPin, Download, ExternalLink } from 'lucide-react'
import type { Map } from '@/types/api-types'

interface MapViewerClientProps {
  map: Map;
}

export function MapViewerClient({ map }: MapViewerClientProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir="rtl">
      <Header navigation={navigation} />
      
      <main className="flex-grow w-full">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Page Header */}
          <div className="mb-10 text-right">
            {map.category && (
              <p className="text-emerald-700 text-base mb-3 font-semibold uppercase tracking-wide">
                {map.category.title}
              </p>
            )}
            <h1 className="secular text-5xl leading-tight text-[var(--dark-green)] mb-4">
              {map.title}
            </h1>
            {map.description && (
              <p className="text-gray-600 text-lg leading-relaxed max-w-4xl">
                {map.description}
              </p>
            )}
          </div>

          {/* Map Preview - Full Width */}
          <div className="mb-8">
            <MapPreview map={map} />
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Left Column - Metadata (2/3 width) */}
            <div className="lg:col-span-2 bg-white p-8 shadow-sm border border-gray-200">
              <dl className="space-y-4 text-right">
                {/* Year/Period */}
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

                {/* Regions */}
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

                {/* Tags */}
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

                {/* Layers Info */}
                {map.layers && map.layers.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <dt className="text-sm font-semibold text-gray-700 secular">שכבות</dt>
                    <dd className="text-gray-900 text-base">
                      {map.layers.length} שכבות גיאוגרפיות
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Right Column - Sidebar (1/3 width) */}
            <div className="flex flex-col gap-6">
              {/* Downloads Section */}
              {map.resources && map.resources.length > 0 && (
                <div className="bg-white p-6 shadow-sm border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-5 secular text-right">הורדות</h3>
                  <div className="space-y-3">
                    {map.resources.map((resource) => (
                      <a
                        key={resource.id}
                        href={resource.url}
                        className="flex items-center gap-3 p-4 bg-white border border-gray-300 shadow-sm hover:border-emerald-600 hover:bg-emerald-50 transition-all group"
                        download
                      >
                        <Download className="w-5 h-5 text-emerald-700 group-hover:text-emerald-800" />
                        <div className="flex-1 text-right">
                          <div className="text-base font-semibold text-gray-900 mb-1">{resource.name}</div>
                          <div className="text-sm text-gray-500">{resource.format}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Reference Links */}
              {map.referenceLinks && Array.isArray(map.referenceLinks) && map.referenceLinks.length > 0 && (
                <div className="bg-white p-6 shadow-sm border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-5 secular text-right">קישורים</h3>
                  <div className="space-y-3">
                    {map.referenceLinks.map((link: any, index: number) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-white border border-gray-300 shadow-sm hover:border-emerald-600 hover:bg-emerald-50 transition-all"
                      >
                        <ExternalLink className="w-5 h-5 text-emerald-700" />
                        <span className="text-base font-semibold text-gray-900">{link.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Version Info */}
              {map.version && (
                <div className="bg-gray-100 p-4 rounded border border-gray-200">
                  <div className="text-sm text-gray-600 text-right">
                    <div className="font-semibold mb-1">גרסה</div>
                    <div className="font-mono">{map.version}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <GlobalFooter links={footerLinksMockData} copyrightText={copyrightTextMockData} />
    </div>
  );
}
