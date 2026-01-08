"use client";

import { useState } from 'react';
import { useViewer } from '@/contexts/ViewerContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { IVolumeEntry, ViewMode } from '@/types/collections';

interface LeftControlSidebarProps {
  volume: IVolumeEntry;
}

export default function LeftControlSidebar({ volume }: LeftControlSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { 
    state, 
    setMode, 
    setCurrentPage,
    nextPage,
    previousPage,
    totalPages 
  } = useViewer();

  const handleModeChange = (mode: ViewMode) => {
    setMode(mode);
  };

  const progress = totalPages > 1 ? ((state.currentPage - 1) / (totalPages - 1)) * 100 : 0;

  return (
    <div className={`relative bg-white border-r border-gray-300 flex flex-col transition-all duration-300 ${
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
        <>
          {/* Mode Tabs */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleModeChange('scan')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  state.mode === 'scan'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Scan View
              </button>
              <button
                onClick={() => handleModeChange('text')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  state.mode === 'text'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Text View
              </button>
              <button
                onClick={() => handleModeChange('comparison')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  state.mode === 'comparison'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Comparison
              </button>
            </div>
          </div>

      {/* Navigation Controls - Bottom */}
      <div className="mt-auto p-4 border-t border-gray-200 space-y-3">
        {/* Page Navigation */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={previousPage}
            disabled={state.currentPage <= 1}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span className="text-sm font-medium text-gray-700">
            {state.currentPage} / {totalPages}
          </span>
          
          <button
            onClick={nextPage}
            disabled={state.currentPage >= totalPages}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
}
