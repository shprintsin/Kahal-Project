'use client';

import { createContext, useContext } from 'react';
import type { DocumentLibraryMeta } from '@/types/document-v2';

interface DocsV2LibraryContextValue {
  library: DocumentLibraryMeta[];
  /** The library entry for the active route segment (the current `[slug]`),
   *  or null when we're on the index route or the slug isn't in the list. */
  activeMeta: DocumentLibraryMeta | null;
}

const DocsV2LibraryContext = createContext<DocsV2LibraryContextValue | null>(null);

export const DocsV2LibraryProvider = DocsV2LibraryContext.Provider;

export function useDocsV2Library(): DocsV2LibraryContextValue {
  const ctx = useContext(DocsV2LibraryContext);
  if (!ctx) {
    throw new Error('useDocsV2Library must be used inside <DocsV2LibraryProvider>');
  }
  return ctx;
}

/** Non-throwing variant for consumers that may render outside the shell
 *  (e.g. the index route or fallback skeletons). */
export function useDocsV2LibraryOptional(): DocsV2LibraryContextValue | null {
  return useContext(DocsV2LibraryContext);
}
