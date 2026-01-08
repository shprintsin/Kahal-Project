"use client";

import { Download, ExternalLink, Info } from 'lucide-react';
import type { IVolumeEntry } from '@/types/collections';

interface VolumeDetailsSectionProps {
  volume: IVolumeEntry;
  collectionId: string;
  volumeId: string;
}

export default function VolumeDetailsSection({ 
  volume, 
  collectionId, 
  volumeId 
}: VolumeDetailsSectionProps) {
  const metadata = volume.metadata;
  const title = metadata?.title ?? volume.titleI18n?.he ?? 'ללא כותרת';

  return (
    <div className="bg-gray-50 border-t border-gray-300">
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Title Section */}
        <div className="mb-6 text-right">
          <h1 className="text-3xl font-bold text-[#131e1e] mb-2 font-['Secular_One']">
            {title}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-right" dir="rtl">
          {/* Right Column (was Left) - Download Options */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-bold text-[#1a472a] mb-4 flex items-center gap-2 font-['Rubik']">
              <Download className="w-5 h-5" />
              אפשרויות הורדה
            </h2>
            <div className="space-y-2">
              <a
                href="#"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
              >
                <Download className="w-4 h-4 ml-2" />
                PDF
                <span className="mr-auto text-xs text-gray-500">בקרוב</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
              >
                <Download className="w-4 h-4 ml-2" />
                תמונות (ZIP)
                <span className="mr-auto text-xs text-gray-500">בקרוב</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
              >
                <Download className="w-4 h-4 ml-2" />
                טקסט (Markdown)
                <span className="mr-auto text-xs text-gray-500">בקרוב</span>
              </a>
            </div>
          </div>

          {/* Middle Column - Volume Information */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-bold text-[#1a472a] mb-4 flex items-center gap-2 font-['Rubik']">
              <Info className="w-5 h-5" />
              פרטי הכרך
            </h2>
            <dl className="space-y-3 text-sm">
              {metadata?.language && (
                <div>
                  <dt className="text-gray-600 font-medium">שפה</dt>
                  <dd className="text-gray-900 mt-1">{metadata.language}</dd>
                </div>
              )}
              {metadata?.year && (
                <div>
                  <dt className="text-gray-600 font-medium">שנה</dt>
                  <dd className="text-gray-900 mt-1">{metadata.year}</dd>
                </div>
              )}
              {volume.total_pages && (
                <div>
                  <dt className="text-gray-600 font-medium">סך עמודים</dt>
                  <dd className="text-gray-900 mt-1">{volume.total_pages}</dd>
                </div>
              )}
              {metadata?.description && (
                <div>
                  <dt className="text-gray-600 font-medium">תיאור</dt>
                  <dd className="text-gray-700 mt-1">{metadata.description}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Left Column (was Right) - Additional Info */}
          <div className="lg:col-span-1 space-y-6">
            {volume.sources && (
              <div>
                <h3 className="text-sm font-semibold text-[#131e1e] mb-3 font-['Secular_One']">מקורות</h3>
                <p className="text-sm text-gray-700">{volume.sources}</p>
              </div>
            )}
            
            {volume.author && (
              <div>
                <h3 className="text-sm font-semibold text-[#131e1e] mb-3 font-['Secular_One']">מחבר</h3>
                <p className="text-sm text-gray-700">{volume.author}</p>
              </div>
            )}

            {volume.editor && (
              <div>
                <h3 className="text-sm font-semibold text-[#131e1e] mb-3 font-['Secular_One']">עורך</h3>
                <p className="text-sm text-gray-700">{volume.editor}</p>
              </div>
            )}

            {volume.license && (
              <div>
                <h3 className="text-sm font-semibold text-[#131e1e] mb-3 font-['Secular_One']">רישיון</h3>
                <p className="text-sm text-gray-700">{volume.license}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
