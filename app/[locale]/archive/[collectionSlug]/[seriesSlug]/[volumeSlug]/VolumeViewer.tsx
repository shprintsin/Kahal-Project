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
import { SidebarProvider } from '@/components/ui/sidebar';
import { SiteShell } from '@/components/ui/site-shell';
import type { SiteShellData } from '@/app/lib/get-navigation';

interface VolumeViewerProps {
  volume: any;
  collectionSlug: string;
  seriesSlug: string;
  volumeSlug: string;
  siteShellData: SiteShellData;
}

export default function VolumeViewer({
  volume,
  collectionSlug,
  seriesSlug,
  volumeSlug,
  siteShellData
}: VolumeViewerProps) {
  const { setTotalPages } = useViewer();
  
  // Initialize total pages
  useEffect(() => {
    setTotalPages(volume.total_pages || volume.pages?.length || 0);
  }, [volume, setTotalPages]);

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Enable page navigation with URL sync
  // Use archive route structure instead of collections
  usePageNavigation({ 
    collectionId: collectionSlug, 
    volumeId: volumeSlug,
    basePath: `/archive/${collectionSlug}/${seriesSlug}`
  });

  return (
    <SiteShell {...siteShellData}>
      <SidebarProvider defaultOpen={false}>
        <div className="flex flex-col min-h-screen w-full bg-gray-50">
          {/* Top Toolbar */}
          <TopToolbar 
            collectionId={collectionSlug}
            volumeId={volumeSlug}
            volumeTitle={volume.metadata?.title || volume.titleI18n?.he || volume.slug}
          />

          {/* Main Content Area */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar */}
            <LSidebar volume={volume} />

            {/* Main Canvas */}
            <MainCanvas volume={volume} />

            {/* Right Sidebar - Hidden by default */}
            <RSidebar volume={volume} />
          </div>

          {/* Volume Details Section - Below Viewer */}
          <VolumeDetailsSection 
            volume={volume}
            collectionId={collectionSlug}
            volumeId={volumeSlug}
          />
        </div>
      </SidebarProvider>
    </SiteShell>
  );
}
