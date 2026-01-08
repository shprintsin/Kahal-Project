"use client";

import { useEffect } from 'react';
import { useViewer } from '@/contexts/ViewerContext';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { usePageNavigation } from '@/hooks/usePageNavigation';
import TopToolbar from '@/app/components/collections/TopToolbar';
import RSidebar from '@/app/components/collections/LeftSidebar';
import LSidebar from '@/app/components/collections/RightSidebar';
import MainCanvas from '@/app/components/collections/MainCanvas';
import VolumeDetailsSection from '@/app/components/collections/VolumeDetailsSection';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

import type { IVolumeEntry } from '@/types/collections';

interface VolumeViewerProps {
  volume: IVolumeEntry;
  collectionId: string;
  volumeId: string;
}

export default function VolumeViewer({ 
  volume, 
  collectionId, 
  volumeId 
}: VolumeViewerProps) {
  const { setTotalPages } = useViewer();
  
  // Initialize total pages
  useEffect(() => {
    setTotalPages(volume.total_pages || (volume.pages ? volume.pages.length : 0));
  }, [volume, setTotalPages]);

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Enable page navigation with URL sync
  usePageNavigation({ collectionId, volumeId });

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex flex-col min-h-screen w-full bg-[#f4f4f4]">
        {/* Top Toolbar */}
        <TopToolbar 
          collectionId={collectionId}
          volumeId={volumeId}
          volumeTitle={volume.metadata.title}
        />

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - */}
          <LSidebar volume={volume} />

          {/* Main Canvas */}
          <MainCanvas volume={volume} />

          {/* Right Sidebar - Hidden by default */}
          <RSidebar volume={volume} />
        </div>

        {/* Volume Details Section - Below Viewer */}
        <VolumeDetailsSection 
          volume={volume}
          collectionId={collectionId}
          volumeId={volumeId}
        />
      </div>
    </SidebarProvider>
  );
}
