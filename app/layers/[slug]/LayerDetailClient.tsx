"use client"

import Header from '@/app/components/layout/header/Header'
import GlobalFooter from '@/app/components/layout/GlobalFooter'
import { navigation, footerLinksMockData, copyrightTextMockData } from '@/app/Data'
import { MapPreview } from "@/app/maps/[slug]/components/MapPreview"
import { Calendar, FileText, Link as LinkIcon, Download, Info } from "lucide-react"

export function LayerDetailClient({ layer }: { layer: any }) {
  
  /**
   * Load map preview settings from layer configuration
   * 
   * Preview settings are saved in the admin panel and stored in styleConfig.previewSettings.
   * This includes:
   * - tile: Tile provider configuration (src, maxZoom, subdomains, attribution)
   * - zoom: Default zoom level
   * - center: Map center coordinates [lat, lng]
   * 
   * If no saved settings exist, fall back to sensible defaults.
   */
  const previewSettings = layer?.styleConfig?.previewSettings || {
    tile: {
      src: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      maxZoom: 18,
      subdomains: 'abc',
      attribution: '© OpenStreetMap contributors'
    },
    zoom: 6,
    center: [52.0, 20.0] as [number, number]
  };

  console.log('[Layer Viewer] Using preview settings:', previewSettings);

  // Create a mock map object for the preview because MapPreview expects a Map
  const previewMap = {
    id: `preview-${layer.id}`,
    title: layer.name,
    config: {
      center: previewSettings.center,
      zoom: previewSettings.zoom,
      tile: previewSettings.tile
    },
    // MapPreview expects layers array with config. 
    // Since we're parsing a raw Layer object, we need to adapt it to what MapPreview expects
    // The MapPreview component handles raw layers correctly now since we updated it in Phase 1
    layers: [{
        ...layer,
        isVisibleByDefault: true, // Force visible
        styleConfig: layer.styleConfig || {} // Ensure style config exists
    }]
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir="rtl">
      <Header navigation={navigation} />
      
      <main className="flex-grow container mx-auto py-8 px-4 md:px-6 lg:px-8">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content: Map & Description */ }
            <div className="lg:col-span-2 space-y-8">
                <div>
                     <div className="flex items-center gap-3 mb-4">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold uppercase">
                            {layer.type}
                        </span>
                        {layer.category && (
                             <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold">
                                {layer.category.title}
                             </span>
                        )}
                     </div>
                     <h1 className="secular text-4xl text-[var(--dark-green)] mb-6 leading-tight">{layer.name}</h1>
                     
                     <div className="h-[500px] mb-8 shadow-md rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                        <MapPreview map={previewMap as any} />
                     </div>

                     <div className="prose max-w-none bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold mb-4 secular text-gray-800">תיאור השכבה</h2>
                         <p className="whitespace-pre-wrap text-gray-700 leading-relaxed text-lg">
                            {layer.description || "אין תיאור זמין."}
                         </p>
                     </div>
                </div>

                {/* Metadata Sections */}
                <div className="space-y-6">
                    {(layer.citationText || layer.sources || layer.codebookText) && (
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-8">
                            {layer.citationText && (
                                <div>
                                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-gray-800 secular">
                                        <FileText className="w-5 h-5 text-emerald-600"/> ציטוט מומלץ
                                    </h3>
                                    <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 border border-gray-200 font-mono" dir="ltr">
                                        {layer.citationText}
                                    </div>
                                </div>
                            )}
                            
                            {layer.sources && (
                                <div>
                                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-gray-800 secular">
                                        <LinkIcon className="w-5 h-5 text-emerald-600"/> מקורות הנתונים
                                    </h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">{layer.sources}</p>
                                </div>
                            )}

                            {layer.codebookText && (
                                <div>
                                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-gray-800 secular">
                                        <Info className="w-5 h-5 text-emerald-600"/> מילון נתונים (Codebook)
                                    </h3>
                                    <div className="prose max-w-none text-gray-700">
                                        <p className="whitespace-pre-wrap">{layer.codebookText}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar info */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-4">
                    <h3 className="text-lg font-bold mb-4 border-b pb-2 text-gray-800 secular">פרטים נוספים</h3>
                    <ul className="space-y-4 text-sm">
                        <li className="flex justify-between items-center border-b border-gray-50 pb-2">
                            <span className="text-gray-500 font-medium">סטטוס איכות:</span>
                            <span className="font-bold bg-gray-100 px-2 py-1 rounded text-gray-700">{layer.maturity || 'לא צוין'}</span>
                        </li>
                        <li className="flex justify-between items-center border-b border-gray-50 pb-2">
                            <span className="text-gray-500 font-medium">טווח שנים:</span>
                            <span className="font-bold flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-gray-400"/>
                                {layer.minYear || '?'} - {layer.maxYear || '?'}
                            </span>
                        </li>
                         <li className="flex justify-between items-center border-b border-gray-50 pb-2">
                            <span className="text-gray-500 font-medium">רישיון שימוש:</span>
                            <span className="font-medium text-gray-900">{layer.license || 'לא צוין'}</span>
                        </li>
                    </ul>

                    {layer.downloadUrl && (
                        <div className="mt-8">
                            <a 
                                href={layer.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-emerald-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
                            >
                                <Download className="w-4 h-4" />
                                הורדת נתונים מלאים
                            </a>
                        </div>
                    )}
                </div>
            </div>

         </div>
      </main>
      
      <GlobalFooter links={footerLinksMockData} copyrightText={copyrightTextMockData} />
    </div>
  )
}
