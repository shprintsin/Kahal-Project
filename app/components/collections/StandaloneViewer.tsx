"use client";

import { useEffect } from 'react';
import { useViewer } from '@/contexts/ViewerContext';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { usePageNavigation } from '@/hooks/usePageNavigation';
import ModeSwitcher from '@/app/components/collections/ModeSwitcher';
import MainCanvas from '@/app/components/collections/MainCanvas';
import NavigationBar from '@/app/components/collections/NavigationBar';
import type { IVolumeEntry } from '@/types/collections';

interface StandaloneViewerProps {
  volume: IVolumeEntry;
  collectionId: string;
  volumeId: string;
}

/**
 * Standalone Viewer Component
 * 
 * A minimal viewer that includes only:
 * - Mode switcher (Scan/Text/Comparison)
 * - Viewer canvas (fit-to-page)
 * - Navigation bar (page controls + two-page toggle)
 * 
 * Excludes:
 * - Global header/footer
 * - Breadcrumbs
 * - Volume details section
 */
export default function StandaloneViewer({ 
  volume, 
  collectionId, 
  volumeId 
}: StandaloneViewerProps) {
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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Mode Switcher */}
      <ModeSwitcher />

      {/* Main Viewer Canvas - Fit to Page */}
      <MainCanvas volume={volume} />

      {/* Navigation Bar */}
      <NavigationBar />
    </div>
  );
}
