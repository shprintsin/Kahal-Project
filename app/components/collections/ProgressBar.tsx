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
  const totalPagesRef = useRef(totalPages);
  const [inverted, setInverted] = useState(false);

  useEffect(() => {
    totalPagesRef.current = totalPages;
  }, [totalPages]);

  const progress = totalPages > 0 ? ((state.currentPage - 1) / (totalPages - 1)) * 100 : 0;

  const updatePage = (clientX: number) => {
    if (!barRef.current) return;

    const rect = barRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const pages = totalPagesRef.current;
    const newPage = Math.round(percentage * (pages - 1)) + 1;

    setCurrentPage(Math.max(1, Math.min(newPage, pages)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    updatePage(e.clientX);
  };

  // Add global mouse listeners (registered once, uses refs for latest values)
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      updatePage(e.clientX);
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

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
          className="absolute top-0 left-0 h-full bg-brand-primary rounded-full transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Invert Button - Right Side */}
      <button
        onClick={() => setInverted(!inverted)}
        className={`p-2 rounded-md transition-colors ${
          inverted ? 'bg-brand-primary text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
        title="היפוך צבעים"
      >
        <Circle className="w-4 h-4" fill={inverted ? 'white' : 'none'} />
      </button>
    </div>
  );
}
