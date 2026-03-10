'use client';

import React from 'react';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Columns, FileText } from 'lucide-react';

interface ViewerToolbarProps {
  currentPage: number;
  totalPages: number;
  zoom: number;
  onPageChange: (page: number) => void;
  onZoomChange: (zoom: number) => void;
  language: 'original' | 'he' | 'en';
  onLanguageChange: (lang: 'original' | 'he' | 'en') => void;
  viewMode: 'single' | 'side-by-side';
  onViewModeChange: (mode: 'single' | 'side-by-side') => void;
  secondaryLanguage: 'he' | 'en' | 'original';
  onSecondaryLanguageChange: (lang: 'he' | 'en' | 'original') => void;
}

export function ViewerToolbar({
  currentPage,
  totalPages,
  zoom,
  onPageChange,
  onZoomChange,
  language,
  onLanguageChange,
  viewMode,
  onViewModeChange,
  secondaryLanguage,
  onSecondaryLanguageChange,
}: ViewerToolbarProps) {
  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b shadow-sm sticky top-0 z-20">
      {/* Page Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-1 text-sm">
          <span>Page</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={handlePageInput}
            className="w-12 px-1 py-0.5 border rounded text-center text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span>of {totalPages}</span>
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

       {/* View Mode & Language Controls */}
       <div className="flex items-center gap-4">
        {/* Main Language */}
         <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Main:</span>
            <select 
              value={language} 
              onChange={(e) => onLanguageChange(e.target.value as any)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="original">Original</option>
              <option value="he">Hebrew</option>
              <option value="en">English</option>
            </select>
         </div>

         <div className="h-4 w-px bg-gray-300"></div>

         {/* View Mode Toggle */}
         <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => onViewModeChange('single')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'single' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="Single View"
            >
              <FileText className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('side-by-side')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'side-by-side' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="Side-by-Side View"
            >
              <Columns className="w-4 h-4" />
            </button>
         </div>

         {viewMode === 'side-by-side' && (
           <div className="flex items-center gap-2 text-sm animate-in fade-in slide-in-from-left-2 duration-200">
              <span className="text-gray-500">Secondary:</span>
              <select 
                value={secondaryLanguage} 
                onChange={(e) => onSecondaryLanguageChange(e.target.value as any)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="original">Original</option>
                <option value="he">Hebrew</option>
                <option value="en">English</option>
              </select>
           </div>
         )}
       </div>

      {/* Zoom Controls */}

      {/* Zoom Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onZoomChange(Math.max(50, zoom - 10))}
          disabled={zoom <= 50}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        
        <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
        
        <button
          onClick={() => onZoomChange(Math.min(200, zoom + 10))}
          disabled={zoom >= 200}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
