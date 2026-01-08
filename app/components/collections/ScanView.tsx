"use client";

import { useRef, useState, useEffect } from 'react';
import { useViewer } from '@/contexts/ViewerContext';
import PageImage from './PageImage';

interface ScanViewProps {
  volume: any;
}

/**
 * Scan View - displays page images with manipulation controls
 * Shows two pages side-by-side as per instructions
 */
export default function ScanView({ volume }: ScanViewProps) {
  const { state } = useViewer();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [rotation, setRotation] = useState(0);
  const [inverted, setInverted] = useState(false);

  // Get current and next pages
  const currentPageIndex = state.currentPage - 1;
  const currentPage = volume.pages?.[currentPageIndex];
  const nextPage = volume.pages?.[currentPageIndex + 1];

  // Measure container width for fit-to-width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.parentElement?.clientWidth || window.innerWidth;
        const width = (parentWidth - 64) / 2 - 16;
        setContainerWidth(width);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Get image URL from page (new Prisma structure)
  const getImageUrl = (page: any): string | null => {
    if (!page) return null;
    return page.imageUrl || page.thumbnailUrl || null;
  };

  const currentImageUrl = getImageUrl(currentPage);
  const nextImageUrl = nextPage ? getImageUrl(nextPage) : null;

  return (
    <div className="relative h-full w-full flex flex-col">
      {/* Fixed-size container - NO SCROLLING */}
      <div className="flex-1 flex items-center justify-center gap-4 overflow-hidden">
        {/* Current Page - Fits to container */}
        {currentImageUrl ? (
          <div className="flex-1 h-full flex items-center justify-center">
            <PageImage
              imageUrl={currentImageUrl}
              pageLabel={currentPage?.label || `Page ${state.currentPage}`}
              zoom={state.zoom}
              rotation={rotation}
              inverted={inverted}
            />
          </div>
        ) : (
          <div className="flex-1 h-full bg-gray-800 flex items-center justify-center rounded-md">
            <div className="text-center text-gray-400">
              <p className="text-lg font-medium">אין סריקה זמינה</p>
              <p className="text-sm mt-2">עמוד {state.currentPage}</p>
            </div>
          </div>
        )}

        {/* Next Page - Fits to container */}
        {nextPage && (
          nextImageUrl ? (
            <div className="flex-1 h-full flex items-center justify-center">
              <PageImage
                imageUrl={nextImageUrl}
                pageLabel={nextPage?.label || `Page ${state.currentPage + 1}`}
                zoom={state.zoom}
                rotation={rotation}
                inverted={inverted}
              />
            </div>
          ) : (
            <div className="flex-1 h-full bg-gray-800 flex items-center justify-center rounded-md">
              <div className="text-center text-gray-400">
                <p className="text-lg font-medium">אין סריקה זמינה</p>
                <p className="text-sm mt-2">עמוד {state.currentPage + 1}</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
