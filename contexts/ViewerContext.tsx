"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { ViewMode, ViewerState, PageRange } from '@/types/collections';

interface ViewerContextType {
  state: ViewerState;
  setMode: (mode: ViewMode) => void;
  setCurrentPage: (page: number) => void;
  setZoom: (zoom: number) => void;
  setLanguage: (language: ViewerState['language']) => void;
  setPageRange: (range?: PageRange) => void;
  setRotation: (rotation: number) => void;
  setInversion: (inversion: boolean) => void;
  nextPage: () => void;
  previousPage: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  fitToWidth: () => void;
  totalPages: number;
  setTotalPages: (total: number) => void;
  showTwoPages: boolean;
  toggleTwoPages: () => void;
}

const ViewerContext = createContext<ViewerContextType | undefined>(undefined);

interface ViewerProviderProps {
  children: React.ReactNode;
  initialPage?: number;
  initialMode?: ViewMode;
  initialPageRange?: PageRange;
}

export function ViewerProvider({ 
  children, 
  initialPage = 1,
  initialMode = 'scan',
  initialPageRange
}: ViewerProviderProps) {
  const [state, setState] = useState<ViewerState>({
    mode: initialMode,
    currentPage: initialPage,
    zoom: 100,
    language: 'he',
    pageRange: initialPageRange,
    rotation: 0,
    inversion: false,
  });

  const [totalPages, setTotalPages] = useState(0);
  const [showTwoPages, setShowTwoPages] = useState(false);
  
  // Use refs to avoid recreating callbacks on every state change
  const stateRef = useRef(state);
  const totalPagesRef = useRef(totalPages);
  
  // Update refs when state changes
  stateRef.current = state;
  totalPagesRef.current = totalPages;

  const setMode = useCallback((mode: ViewMode) => {
    setState(prev => prev.mode === mode ? prev : { ...prev, mode });
  }, []);

  const setCurrentPage = useCallback((page: number) => {
    setState(prev => {
      const newPage = Math.max(1, Math.min(page, totalPagesRef.current || page));
      return prev.currentPage === newPage ? prev : { ...prev, currentPage: newPage };
    });
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setState(prev => {
      const newZoom = Math.max(25, Math.min(zoom, 400));
      return prev.zoom === newZoom ? prev : { ...prev, zoom: newZoom };
    });
  }, []);

  const setLanguage = useCallback((language: ViewerState['language']) => {
    setState(prev => prev.language === language ? prev : { ...prev, language });
  }, []);

  const setPageRange = useCallback((range?: PageRange) => {
    setState(prev => {
      if (!range && !prev.pageRange) return prev;
      if (range && prev.pageRange && 
          range.start === prev.pageRange.start && 
          range.end === prev.pageRange.end) return prev;
      return { ...prev, pageRange: range };
    });
  }, []);

  const setRotation = useCallback((rotation: number) => {
    setState(prev => prev.rotation === rotation ? prev : { ...prev, rotation });
  }, []);

  const setInversion = useCallback((inversion: boolean) => {
    setState(prev => prev.inversion === inversion ? prev : { ...prev, inversion });
  }, []);

  const toggleTwoPages = useCallback(() => {
    setShowTwoPages(prev => !prev);
  }, []);

  // Fix: Use functional updates to avoid dependency on state
  const nextPage = useCallback(() => {
    setState(prev => {
      const newPage = Math.min(prev.currentPage + 1, totalPagesRef.current || prev.currentPage + 1);
      return prev.currentPage === newPage ? prev : { ...prev, currentPage: newPage };
    });
  }, []);

  const previousPage = useCallback(() => {
    setState(prev => {
      const newPage = Math.max(prev.currentPage - 1, 1);
      return prev.currentPage === newPage ? prev : { ...prev, currentPage: newPage };
    });
  }, []);

  const zoomIn = useCallback(() => {
    setState(prev => {
      const newZoom = Math.min(prev.zoom + 25, 400);
      return prev.zoom === newZoom ? prev : { ...prev, zoom: newZoom };
    });
  }, []);

  const zoomOut = useCallback(() => {
    setState(prev => {
      const newZoom = Math.max(prev.zoom - 25, 25);
      return prev.zoom === newZoom ? prev : { ...prev, zoom: newZoom };
    });
  }, []);

  const resetZoom = useCallback(() => {
    setState(prev => prev.zoom === 100 ? prev : { ...prev, zoom: 100 });
  }, []);

  const fitToWidth = useCallback(() => {
    // This will be calculated by the component based on container width
    setState(prev => prev.zoom === -1 ? prev : { ...prev, zoom: -1 }); // -1 signals "fit to width"
  }, []);

  const value: ViewerContextType = React.useMemo(() => ({
    state,
    setMode,
    setCurrentPage,
    setZoom,
    setLanguage,
    setPageRange,
    setRotation,
    setInversion,
    nextPage,
    previousPage,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToWidth,
    totalPages,
    setTotalPages,
    showTwoPages,
    toggleTwoPages,
  }), [
    state,
    setMode,
    setCurrentPage,
    setZoom,
    setLanguage,
    setPageRange,
    setRotation,
    setInversion,
    nextPage,
    previousPage,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToWidth,
    totalPages,
    setTotalPages,
    showTwoPages,
    toggleTwoPages,
  ]);

  return (
    <ViewerContext.Provider value={value}>
      {children}
    </ViewerContext.Provider>
  );
}

export function useViewer() {
  const context = useContext(ViewerContext);
  if (context === undefined) {
    throw new Error('useViewer must be used within a ViewerProvider');
  }
  return context;
}
