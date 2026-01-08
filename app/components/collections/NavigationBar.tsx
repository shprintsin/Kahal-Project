"use client";

import { useViewer } from '@/contexts/ViewerContext';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

export default function NavigationBar() {
  const { 
    state, 
    nextPage, 
    previousPage, 
    totalPages,
    showTwoPages,
    toggleTwoPages
  } = useViewer();

  return (
    <div className="bg-white px-8 py-4 border-t border-gray-300 flex items-center justify-between">
      {/* Left: Page Navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={previousPage}
          disabled={state.currentPage <= 1}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <span className="text-sm font-medium text-gray-700 min-w-[100px] text-center">
          Page {state.currentPage} / {totalPages}
        </span>
        
        <button
          onClick={nextPage}
          disabled={state.currentPage >= totalPages}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Right: Two-Page Toggle */}
      <button
        onClick={toggleTwoPages}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          showTwoPages
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        title={showTwoPages ? 'Show single page' : 'Show two pages'}
      >
        <BookOpen className="w-4 h-4" />
        {showTwoPages ? 'Single Page' : 'Two Pages'}
      </button>
    </div>
  );
}
