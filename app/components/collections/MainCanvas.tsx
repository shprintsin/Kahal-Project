"use client";

import { useViewer } from '@/contexts/ViewerContext';
import { FileImage, FileText, Columns } from 'lucide-react';
import ScanView from './ScanView';
import TextView from './TextView';
import ComparisonView from './ComparisonView';
import ProgressBar from './ProgressBar';
import type { IVolumeEntry, ViewMode } from '@/types/collections';

interface MainCanvasProps {
  volume: IVolumeEntry;
}

export default function MainCanvas({ volume }: MainCanvasProps) {
  const { 
    state, 
    setMode, 
    totalPages 
  } = useViewer();

  const handleModeChange = (mode: ViewMode) => {
    setMode(mode);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-200 p-4">
      {/* Viewer App Container - Fixed Size, Minimal Padding */}
      <div className="bg-[#2a2a2a] rounded-md shadow-sm overflow-hidden flex flex-col" style={{ height: '800px' }}>
        
        {/* Content Area - Maximum Space */}
        <div className="flex-1 bg-[#1e1e1e] overflow-hidden flex items-center justify-center p-2">
          <div className="w-full h-full flex items-center justify-center">
            {state.mode === 'scan' && <ScanView volume={volume} />}
            {state.mode === 'text' && <TextView volume={volume} />}
            {state.mode === 'comparison' && <ComparisonView volume={volume} />}
          </div>
        </div>

        {/* Bottom Controls Bar - Mode Buttons + Progress */}
        <div className="bg-[#1a1a1a] border-t border-gray-700 px-4 py-2">
          <div className="flex items-center gap-4">
            {/* Mode Buttons - Left Side with Icons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleModeChange('scan')}
                className={`p-2 rounded-md transition-all ${
                  state.mode === 'scan'
                    ? 'bg-[#1a472a] text-white shadow-md'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title="תצוגת סריקה"
              >
                <FileImage className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleModeChange('text')}
                className={`p-2 rounded-md transition-all ${
                  state.mode === 'text'
                    ? 'bg-[#1a472a] text-white shadow-md'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title="תצוגת טקסט"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleModeChange('comparison')}
                className={`p-2 rounded-md transition-all ${
                  state.mode === 'comparison'
                    ? 'bg-[#1a472a] text-white shadow-md'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title="תצוגת השוואה"
              >
                <Columns className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Bar - Center */}
            <div className="flex-1">
              <ProgressBar totalPages={totalPages} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
