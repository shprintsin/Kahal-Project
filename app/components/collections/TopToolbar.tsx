"use client";

import { useViewer } from '@/contexts/ViewerContext';
import { ChevronRight, Download, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { ViewMode } from '@/types/collections';

interface TopToolbarProps {
  collectionId: string;
  volumeId: string;
  volumeTitle: string;
}

export default function TopToolbar({ 
  collectionId, 
  volumeId, 
  volumeTitle 
}: TopToolbarProps) {
  const { 
    state, 
    setMode, 
    setCurrentPage, 
    zoomIn, 
    zoomOut, 
    resetZoom,
    fitToWidth,
    totalPages 
  } = useViewer();

  const handleModeChange = (mode: ViewMode) => {
    setMode(mode);
  };

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value, 10);
    if (!isNaN(page) && page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-white border-b border-gray-300 px-4 py-3 flex items-center justify-between shadow-sm">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <a href="/archive" className="hover:text-gray-900 transition-colors">
          ארכיון
        </a>
        <ChevronRight className="w-4 h-4 rotate-180" />
        <a 
          href={`/archive/${collectionId}`} 
          className="hover:text-gray-900 transition-colors"
        >
          {collectionId}
        </a>
        <ChevronRight className="w-4 h-4 rotate-180" />
        <span className="font-medium text-gray-900">
          כרך {volumeId}
        </span>
      </div>

      {/* Center: Mode Switcher */}
      
      {/* Right: Controls */}
      <div className="flex items-center gap-4">
        {/* Zoom Controls Removed */ }
        <div className="flex items-center gap-2">
           {/* Controls removed as per request for stable layout only */}
        </div>

        {/* Page Navigation */}
 

        {/* Download Dropdown */}
        
        {/* Sidebar Trigger */}
        <SidebarTrigger />
      </div>
    </div>
  );
}
