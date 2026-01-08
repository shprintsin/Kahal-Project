"use client";

import { useViewer } from '@/contexts/ViewerContext';
import type { ViewMode } from '@/types/collections';

export default function ModeSwitcher() {
  const { state, setMode } = useViewer();

  const handleModeChange = (mode: ViewMode) => {
    setMode(mode);
  };

  return (
    <div className="px-8 py-2 border-b border-gray-300 flex gap-3 justify-start">
      <button
        onClick={() => handleModeChange('scan')}
        className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
          state.mode === 'scan'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Scan View
      </button>
      <button
        onClick={() => handleModeChange('text')}
        className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
          state.mode === 'text'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Text View
      </button>
      <button
        onClick={() => handleModeChange('comparison')}
        className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
          state.mode === 'comparison'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Comparison
      </button>
    </div>
  );
}
