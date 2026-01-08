"use client";

import { useEffect } from 'react';
import { useViewer } from '@/contexts/ViewerContext';

interface KeyboardShortcutsConfig {
  enableNavigation?: boolean;
  enableZoom?: boolean;
  enableModeToggle?: boolean;
}

/**
 * Custom hook for keyboard shortcuts
 * @param config - Configuration for which shortcuts to enable
 */
export function useKeyboardShortcuts(config: KeyboardShortcutsConfig = {}) {
  const {
    enableNavigation = true,
    enableZoom = true,
    enableModeToggle = true,
  } = config;

  const { 
    nextPage, 
    previousPage, 
    zoomIn, 
    zoomOut, 
    setMode, 
    state 
  } = useViewer();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Navigation shortcuts
      if (enableNavigation) {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          nextPage();
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          previousPage();
        }
      }

      // Zoom shortcuts
      if (enableZoom) {
        if (event.key === '+' || event.key === '=') {
          event.preventDefault();
          zoomIn();
        } else if (event.key === '-') {
          event.preventDefault();
          zoomOut();
        }
      }

      // Mode toggle shortcut
      if (enableModeToggle && event.key.toLowerCase() === 'm') {
        event.preventDefault();
        // Cycle through modes: scan -> text -> comparison -> scan
        const modes: Array<typeof state.mode> = ['scan', 'text', 'comparison'];
        const currentIndex = modes.indexOf(state.mode);
        const nextIndex = (currentIndex + 1) % modes.length;
        setMode(modes[nextIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    enableNavigation,
    enableZoom,
    enableModeToggle,
    nextPage,
    previousPage,
    zoomIn,
    zoomOut,
    setMode,
    state.mode,
  ]);
}
