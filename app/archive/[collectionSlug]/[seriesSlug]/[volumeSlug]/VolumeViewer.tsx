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
import { SidebarProvider } from '@/app/components/ui/sidebar';
import Header from '@/app/components/layout/header/Header';
import GlobalFooter from '@/app/components/layout/GlobalFooter';
import { navigation, footerLinksMockData, copyrightTextMockData } from '@/app/Data';

interface VolumeViewerProps {
  volume: any;
  collectionSlug: string;
  seriesSlug: string;
  volumeSlug: string;
}

export default function VolumeViewer({ 
  volume, 
  collectionSlug,
  seriesSlug,
  volumeSlug
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
    <>
      <Header navigation={navigation} />
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
      <GlobalFooter links={footerLinksMockData} copyrightText={copyrightTextMockData} />
    </>
  );
}
