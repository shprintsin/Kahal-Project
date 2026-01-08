"use client";

import { useRef, useEffect, useState } from 'react';
import { useViewer } from '@/contexts/ViewerContext';
import { Circle } from 'lucide-react';

interface ProgressBarProps {
  totalPages: number;
}

/**
 * Draggable progress bar for quick page navigation with invert button
 */
export default function ProgressBar({ totalPages }: ProgressBarProps) {
  const { state, setCurrentPage } = useViewer();
  const barRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [inverted, setInverted] = useState(false);

  const progress = totalPages > 0 ? ((state.currentPage - 1) / (totalPages - 1)) * 100 : 0;

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    updatePage(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    updatePage(e.clientX);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const updatePage = (clientX: number) => {
    if (!barRef.current) return;
    
    const rect = barRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const newPage = Math.round(percentage * (totalPages - 1)) + 1;
    
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  // Add global mouse listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [totalPages]);

  return (
    <div className="flex items-center gap-3">
      {/* Page Counter */}
      <span className="text-sm text-gray-300 font-medium whitespace-nowrap">
        עמוד {state.currentPage} מתוך {totalPages}
      </span>
      
      {/* Progress Bar */}
      <div
        ref={barRef}
        className="flex-1 h-2 bg-gray-700 rounded-full cursor-pointer relative"
        onMouseDown={handleMouseDown}
      >
        <div
          className="absolute top-0 left-0 h-full bg-[#1a472a] rounded-full transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Invert Button - Right Side */}
      <button
        onClick={() => setInverted(!inverted)}
        className={`p-2 rounded-md transition-colors ${
          inverted ? 'bg-[#1a472a] text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
        title="היפוך צבעים"
      >
        <Circle className="w-4 h-4" fill={inverted ? 'white' : 'none'} />
      </button>
    </div>
  );
}
