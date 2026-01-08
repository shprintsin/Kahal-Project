"use client";

import { useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useViewer } from '@/contexts/ViewerContext';
import type { PageRange } from '@/types/collections';

interface UsePageNavigationOptions {
  collectionId: string;
  volumeId: string;
  updateUrl?: boolean;
  basePath?: string; // e.g., '/collections' or '/archive/[collection]/[series]'
}

/**
 * Custom hook for page navigation and URL management
 * @param options - Configuration options
 */
export function usePageNavigation({
  collectionId,
  volumeId,
  updateUrl = true,
  basePath,
}: UsePageNavigationOptions) {
  // Default basePath for collections route
  const defaultBasePath = `/collections/${collectionId}/volumes`;
  const finalBasePath = basePath || defaultBasePath;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, setCurrentPage, setPageRange, setMode } = useViewer();

  // Keep refs for state comparison to avoid dependency cycles
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Parse page range from URL parameter (format: "5-10")
  const parsePageRange = useCallback((rangeStr: string): PageRange | undefined => {
    const match = rangeStr.match(/^(\d+)-(\d+)$/);
    if (match) {
      const start = parseInt(match[1], 10);
      const end = parseInt(match[2], 10);
      if (start <= end) {
        return { start, end };
      }
    }
    return undefined;
  }, []);

  // Initialize from URL parameters - ONLY when searchParams change
  useEffect(() => {
    const pageParam = searchParams.get('page');
    const rangeParam = searchParams.get('pageRange');
    const modeParam = searchParams.get('mode');

    if (pageParam) {
      const page = parseInt(pageParam, 10);
      const currentPage = stateRef.current.currentPage;
      if (!isNaN(page) && page > 0 && page !== currentPage) {
        setCurrentPage(page);
      }
    }

    if (rangeParam) {
      const range = parsePageRange(rangeParam);
      if (range) {
        const currentRange = stateRef.current.pageRange;
        const isScanSame = currentRange && currentRange.start === range.start && currentRange.end === range.end;
        if (!isScanSame) {
            setPageRange(range);
        }
      }
    }

    // Sync mode from URL
    if (modeParam && (modeParam === 'scan' || modeParam === 'text' || modeParam === 'comparison')) {
      const currentMode = stateRef.current.mode;
      if (modeParam !== currentMode) {
        setMode(modeParam as 'scan' | 'text' | 'comparison');
      }
    }
  }, [searchParams, setCurrentPage, setPageRange, setMode, parsePageRange]);

  // Update URL when page or mode changes
  useEffect(() => {
    if (!updateUrl) return;

    const currentParams = new URLSearchParams(searchParams.toString());
    const currentPageStr = state.currentPage.toString();
    const currentRangeStr = state.pageRange ? `${state.pageRange.start}-${state.pageRange.end}` : null;
    const currentMode = state.mode;
    
    let needsUpdate = false;

    // Check page param
    if (currentParams.get('page') !== currentPageStr) {
        currentParams.set('page', currentPageStr);
        needsUpdate = true;
    }

    // Check mode param
    if (currentParams.get('mode') !== currentMode) {
        currentParams.set('mode', currentMode);
        needsUpdate = true;
    }

    // Check range param
    const rangeParam = currentParams.get('pageRange');
    if (currentRangeStr && rangeParam !== currentRangeStr) {
        currentParams.set('pageRange', currentRangeStr);
        needsUpdate = true;
    } else if (!currentRangeStr && rangeParam) {
        currentParams.delete('pageRange');
        needsUpdate = true;
    }

    if (needsUpdate) {
        const newUrl = `${finalBasePath}/${volumeId}?${currentParams.toString()}`;
        router.replace(newUrl, { scroll: false });
    }
  }, [
    state.currentPage,
    state.pageRange,
    state.mode,
    collectionId,
    volumeId,
    updateUrl,
    router,
    searchParams,
  ]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, [setCurrentPage]);

  const setRange = useCallback((range?: PageRange) => {
    setPageRange(range);
  }, [setPageRange]);

  return {
    currentPage: state.currentPage,
    pageRange: state.pageRange,
    goToPage,
    setRange,
  };
}
