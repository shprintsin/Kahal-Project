"use client";

import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useViewer } from '@/contexts/ViewerContext';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import type { IVolumeEntry, ViewMode } from '@/types/collections';

interface LSidebarProps {
  volume: IVolumeEntry;
}

export default function LSidebar({ volume }: LSidebarProps) {
  const metadata = volume.metadata;
  const [isExpanded, setIsExpanded] = useState(true);

  const { 
    state, 
    setMode, 
    setCurrentPage, 
    totalPages 
  } = useViewer();

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value, 10);
    if (!isNaN(page) && page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const pages = volume.pages ?? [];

  return (
    <div className={`relative bg-white border-l border-gray-300 flex flex-col transition-all duration-300 ${
      isExpanded ? 'w-64' : 'w-0'
    }`}>
      {/* Expand/Collapse Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -left-8 top-4 bg-white border border-gray-300 rounded-l-md p-2 hover:bg-gray-50 transition-colors shadow-sm z-10"
        title={isExpanded ? 'Hide sidebar' : 'Show sidebar'}
      >
        {isExpanded ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        )}
      </button>

      {/* Sidebar Content - Only visible when expanded */}
      {isExpanded && (
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6" dir="rtl">
            {/* Table of Contents */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-gray-900 text-right">תוכן עניינים</h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {pages.map((page, index) => (
                  <button
                    key={page.page_id ?? index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`w-full text-right px-3 py-2 rounded text-sm transition-colors ${
                      state.currentPage === index + 1
                        ? 'bg-[#e8f5e9] text-[#1a472a] font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    עמוד {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Volume Metadata */}
            {metadata && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold mb-3 text-gray-900 text-right">מידע על הכרך</h3>
                <div className="space-y-2 text-sm text-right">
                  {metadata.title && (
                    <div>
                      <span className="text-gray-600">כותרת:</span>
                      <p className="font-medium text-gray-900 mt-1">{metadata.title}</p>
                    </div>
                  )}
                  
                  {metadata.description && (
                    <div>
                      <span className="text-gray-600">תיאור:</span>
                      <p className="text-gray-700 mt-1">{metadata.description}</p>
                    </div>
                  )}

                  {metadata.language && (
                    <div>
                      <span className="text-gray-600">שפה:</span>
                      <p className="text-gray-700 mt-1">{metadata.language}</p>
                    </div>
                  )}

                  {metadata.year && (
                    <div>
                      <span className="text-gray-600">שנה:</span>
                      <p className="text-gray-700 mt-1">{metadata.year}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Page Navigation */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm" dir="rtl">
                <span className="text-gray-600">עמוד</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={state.currentPage}
                  onChange={handlePageInput}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-[#1a472a]"
                />
                <span className="text-gray-600">מתוך {totalPages}</span>
              </div>
            </div>

            {/* Download Button */}
            <div className="pt-4 border-t border-gray-200">
              <button className="flex items-center gap-2 px-3 py-2 bg-[#131e1e] text-white rounded-md hover:shadow-md transition-all text-sm font-medium w-full justify-center">
                <Download className="w-4 h-4" />
                הורדה
              </button>
            </div>
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
