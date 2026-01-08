"use client";

import { useRef, useEffect, useState } from 'react';
import { useViewer } from '@/contexts/ViewerContext';
import PageImage from './PageImage';
import MarkdownRenderer from './MarkdownRenderer';

interface ComparisonViewProps {
  volume: any;
}

/**
 * Comparison View - side-by-side scan and markdown
 * Left: Scan image, Right: Markdown transcription
 */
export default function ComparisonView({ volume }: ComparisonViewProps) {
  const { state } = useViewer();
  const scanContainerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Get current page
  const currentPageIndex = state.currentPage - 1;
  const currentPage = volume.pages?.[currentPageIndex];

  // Get image URL from page (new Prisma structure)
  const getImageUrl = (): string | null => {
    if (!currentPage) return null;
    return currentPage.imageUrl || currentPage.thumbnailUrl || null;
  };

  // Get text content for the current language
  const getTextContent = (): string | null => {
    if (!currentPage || !currentPage.texts || currentPage.texts.length === 0) return null;
    
    // Try to find text in the current language
    let text = currentPage.texts.find((t: any) => 
      t.language === state.language && t.type === 'TRANSCRIPTION'
    );
    
    // Fallback to any transcription if current language not found
    if (!text) {
      text = currentPage.texts.find((t: any) => t.type === 'TRANSCRIPTION');
    }
    
    return text?.content || null;
  };

  const imageUrl = getImageUrl();
  const textContent = getTextContent();

  // Synchronized scrolling
  useEffect(() => {
    const scanContainer = scanContainerRef.current;
    const textContainer = textContainerRef.current;

    if (!scanContainer || !textContainer) return;

    const handleScanScroll = () => {
      if (isSyncing) return;
      setIsSyncing(true);
      const scrollPercentage = scanContainer.scrollTop / (scanContainer.scrollHeight - scanContainer.clientHeight);
      textContainer.scrollTop = scrollPercentage * (textContainer.scrollHeight - textContainer.clientHeight);
      setTimeout(() => setIsSyncing(false), 50);
    };

    const handleTextScroll = () => {
      if (isSyncing) return;
      setIsSyncing(true);
      const scrollPercentage = textContainer.scrollTop / (textContainer.scrollHeight - textContainer.clientHeight);
      scanContainer.scrollTop = scrollPercentage * (scanContainer.scrollHeight - scanContainer.clientHeight);
      setTimeout(() => setIsSyncing(false), 50);
    };

    scanContainer.addEventListener('scroll', handleScanScroll);
    textContainer.addEventListener('scroll', handleTextScroll);

    return () => {
      scanContainer.removeEventListener('scroll', handleScanScroll);
      textContainer.removeEventListener('scroll', handleTextScroll);
    };
  }, [isSyncing]);

  return (
    <div className="h-full w-full flex">
      {/* Left: Scan */}
      <div
        ref={scanContainerRef}
        className="w-1/2 h-full overflow-y-auto overflow-x-hidden flex items-start justify-center p-4 border-r-2 border-gray-300"
      >
        {imageUrl ? (
          <div className="bg-white shadow-lg">
            <PageImage
              imageUrl={imageUrl}
              pageLabel={currentPage?.label || `Page ${state.currentPage}`}
              zoom={state.zoom}
            />
          </div>
        ) : (
          <div className="text-center text-gray-500 py-16">
            <p className="text-lg font-medium">אין סריקה זמינה</p>
            <p className="text-sm mt-2">לעמוד זה אין תמונת סריקה</p>
          </div>
        )}
      </div>

      {/* Right: Text */}
      <div
        ref={textContainerRef}
        className="w-1/2 h-full overflow-y-auto overflow-x-hidden p-4"
      >
        {textContent ? (
          <div className="bg-white shadow-lg rounded-lg p-4">
            <MarkdownRenderer
              content={textContent}
              pageLabel={currentPage?.label || `Page ${state.currentPage}`}
            />
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-md p-8 flex items-center justify-center min-h-[400px]">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">אין תמלול זמין</p>
              <p className="text-sm mt-2">עמוד זה טרם תומלל</p>
              <p className="text-xs mt-4 text-gray-400">עמוד {state.currentPage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
