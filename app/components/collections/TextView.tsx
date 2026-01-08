"use client";

import { useRef } from 'react';
import { useViewer } from '@/contexts/ViewerContext';
import MarkdownRenderer from './MarkdownRenderer';

interface TextViewProps {
  volume: any;
}

/**
 * Text View - displays markdown transcriptions
 * Shows two pages side-by-side for easier reading
 */
export default function TextView({ volume }: TextViewProps) {
  const { state, setLanguage } = useViewer();
  const containerRef = useRef<HTMLDivElement>(null);

  // Get current and next pages
  const currentPageIndex = state.currentPage - 1;
  const currentPage = volume.pages?.[currentPageIndex];
  const nextPage = volume.pages?.[currentPageIndex + 1];

  // Get text content for the current language
  const getTextContent = (page: any): string | null => {
    if (!page || !page.texts || page.texts.length === 0) return null;
    
    // Try to find text in the current language
    let text = page.texts.find((t: any) => 
      t.language === state.language && t.type === 'TRANSCRIPTION'
    );
    
    // Fallback to any transcription if current language not found
    if (!text) {
      text = page.texts.find((t: any) => t.type === 'TRANSCRIPTION');
    }
    
    return text?.content || null;
  };

  const currentText = getTextContent(currentPage);
  const nextText = nextPage ? getTextContent(nextPage) : null;

  return (
    <div className="relative h-full w-full bg-gray-100">
      {/* Language Toggle */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-white rounded-md shadow-sm p-1 flex gap-1">
        {(['he', 'en', 'pl'] as const).map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
              state.language === lang
                ? 'bg-[#1a472a] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {lang === 'he' ? 'עברית' : lang === 'en' ? 'English' : 'Polski'}
          </button>
        ))}
      </div>

      {/* Two-page vertical scroll container */}
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-auto overflow-x-hidden"
      >
        <div className="min-h-full flex items-start justify-center gap-8 px-8 py-8">
          {/* Use CSS Grid for equal heights */}
          <div className="grid grid-cols-2 gap-8 w-full max-w-[1800px]">
            {/* Current Page */}
            <div className="flex flex-col">
              {currentText ? (
                <div className="bg-white shadow-lg rounded-lg p-8 h-full">
                  <MarkdownRenderer
                    content={currentText}
                    pageLabel={currentPage?.label || `Page ${state.currentPage}`}
                  />
                </div>
              ) : (
                <div className="bg-white shadow-sm rounded-md p-8 flex items-center justify-center h-full min-h-[600px]">
                  <div className="text-center text-gray-500">
                    <p className="text-lg font-medium">אין תמלול זמין</p>
                    <p className="text-sm mt-2">עמוד זה טרם תומלל</p>
                    <p className="text-xs mt-4 text-gray-400">עמוד {state.currentPage}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Next Page */}
            {nextPage && (
              <div className="flex flex-col">
                {nextText ? (
                  <div className="bg-white shadow-lg rounded-lg p-8 h-full">
                    <MarkdownRenderer
                      content={nextText}
                      pageLabel={nextPage?.label || `Page ${state.currentPage + 1}`}
                    />
                  </div>
                ) : (
                  <div className="bg-white shadow-sm rounded-md p-8 flex items-center justify-center h-full min-h-[600px]">
                    <div className="text-center text-gray-500">
                      <p className="text-lg font-medium">אין תמלול זמין</p>
                      <p className="text-sm mt-2">עמוד זה טרם תומלל</p>
                      <p className="text-xs mt-4 text-gray-400">עמוד {state.currentPage + 1}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
