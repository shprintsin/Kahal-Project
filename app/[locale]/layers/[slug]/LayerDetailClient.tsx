"use client"

import { MapPreview } from "../../maps/[slug]/components/MapPreview"
import type { SiteShellData } from "@/app/lib/get-navigation"
import { Calendar, FileText, Link as LinkIcon, Download, Info } from "lucide-react"
import { StatusBadgeLarge } from "@/components/ui/status-badge"
import { ContentCard, SidebarInfoCard } from "@/components/ui/sections"
import { SiteShell, SiteMain } from "@/components/ui/site-shell"
import { SetEditUrl } from "@/components/ui/admin-toolbar"
import { useTranslations } from "next-intl"
import { resolveBasemapTile } from "@/lib/basemaps"
import { useDownloadTerms } from "@/components/ui/download-terms-provider"
import { triggerBrowserDownload } from "@/lib/downloadGeoJson"
import { cn } from "@/lib/utils"

export function LayerDetailClient({ layer, shellData, locale }: { layer: any; shellData: SiteShellData; locale?: string }) {
  const t = useTranslations()
  const { requestDownload } = useDownloadTerms()
  const previewSettings = layer?.styleConfig?.previewSettings || {
    zoom: 6,
    center: [52.0, 20.0] as [number, number]
  };

  const previewMap = {
    id: `preview-${layer.id}`,
    title: layer.name,
    config: {
      center: previewSettings.center,
      zoom: previewSettings.zoom,
      basemap: previewSettings.basemap,
      tile: resolveBasemapTile(previewSettings.basemap, previewSettings.tile),
    },
    layers: [{
        ...layer,
        isVisibleByDefault: true,
        styleConfig: layer.styleConfig || {}
    }]
  };

  return (
    <SiteShell {...shellData} locale={locale}>
      <SetEditUrl url={`/admin/layers/${layer.id}`} />
      <SiteMain>
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                <div>
                     <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <StatusBadgeLarge variant="blue" className="uppercase">
                            {layer.type}
                        </StatusBadgeLarge>
                        {layer.category && (
                             <StatusBadgeLarge variant="emerald">
                                {layer.category.title}
                             </StatusBadgeLarge>
                        )}
                     </div>
                     <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-brand-primary mb-4 sm:mb-6 leading-tight">{layer.name}</h1>

                     <div className="h-[300px] sm:h-[400px] lg:h-[500px] mb-6 sm:mb-8 shadow-md overflow-hidden border border-gray-200 bg-gray-100">
                        <MapPreview map={previewMap as any} />
                     </div>

                     <ContentCard>
                        <h2 className="text-xl sm:text-2xl font-bold mb-4 font-display text-gray-800">{t('public.layer.description')}</h2>
                         <p className="whitespace-pre-wrap text-gray-700 leading-relaxed text-base sm:text-lg">
                            {layer.description || t('public.layer.noDescription')}
                         </p>
                     </ContentCard>
                </div>

                <div className="space-y-6">
                    {(layer.citationText || layer.sources || layer.codebookText) && (
                        <ContentCard className="space-y-6 sm:space-y-8">
                            {layer.citationText && (
                                <div>
                                    <h3 className="text-lg sm:text-xl font-bold mb-3 flex items-center gap-2 text-gray-800 font-display">
                                        <FileText className="w-5 h-5 text-emerald-600"/> {t('public.map.citation')}
                                    </h3>
                                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg text-sm text-gray-700 border border-gray-200 font-mono break-words" dir="ltr">
                                        {layer.citationText}
                                    </div>
                                </div>
                            )}

                            {layer.sources && (
                                <div>
                                    <h3 className="text-lg sm:text-xl font-bold mb-3 flex items-center gap-2 text-gray-800 font-display">
                                        <LinkIcon className="w-5 h-5 text-emerald-600"/> {t('public.map.dataSources')}
                                    </h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">{layer.sources}</p>
                                </div>
                            )}

                            {layer.codebookText && (
                                <div>
                                    <h3 className="text-lg sm:text-xl font-bold mb-3 flex items-center gap-2 text-gray-800 font-display">
                                        <Info className="w-5 h-5 text-emerald-600"/> {t('public.map.codebook')}
                                    </h3>
                                    <div className="prose max-w-none text-gray-700">
                                        <p className="whitespace-pre-wrap">{layer.codebookText}</p>
                                    </div>
                                </div>
                            )}
                        </ContentCard>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                <SidebarInfoCard>
                    <h3 className="text-lg font-bold mb-4 border-b pb-2 text-gray-800 font-display">{t('public.layer.moreDetails')}</h3>
                    <ul className="space-y-4 text-sm">
                        <li className="flex justify-between items-center border-b border-gray-50 pb-2">
                            <span className="text-gray-500 font-medium">{t('public.layer.qualityStatus')}:</span>
                            <span className="font-bold bg-gray-100 px-2 py-1 rounded text-gray-700">{layer.maturity || t('public.layer.notSpecified')}</span>
                        </li>
                        <li className="flex justify-between items-center border-b border-gray-50 pb-2">
                            <span className="text-gray-500 font-medium">{t('public.layer.yearRange')}:</span>
                            <span className="font-bold flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-gray-400"/>
                                {layer.minYear || '?'} - {layer.maxYear || '?'}
                            </span>
                        </li>
                         <li className="flex justify-between items-center border-b border-gray-50 pb-2">
                            <span className="text-gray-500 font-medium">{t('public.layer.license')}:</span>
                            <span className="font-medium text-gray-900">{layer.license || t('public.layer.notSpecified')}</span>
                        </li>
                    </ul>

                    {layer.downloadUrl && (
                        <div className="mt-6 sm:mt-8">
                            <button
                                type="button"
                                onClick={() => requestDownload(() => triggerBrowserDownload(layer.downloadUrl, layer.filename))}
                                className={cn(
                                    "flex items-center justify-center gap-2 w-full",
                                    "bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-3 px-4",
                                    "rounded-lg transition-colors shadow-lg hover:shadow-xl",
                                )}
                            >
                                <Download className="w-4 h-4" />
                                {t('public.layer.downloadFull')}
                            </button>
                        </div>
                    )}
                </SidebarInfoCard>
            </div>

         </div>
      </SiteMain>
    </SiteShell>
  )
}
