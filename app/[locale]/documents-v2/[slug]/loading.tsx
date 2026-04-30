import React from 'react';
import { DocumentReaderSkeleton } from '../components/DocumentSkeleton';

// Next.js renders this while a sibling `page.tsx` is fetching. Because the
// segment's `layout.tsx` owns the persistent chrome (top bar + library rail),
// only the centre column + inspector get replaced with placeholders during
// doc-to-doc navigation.
export default function DocumentsV2SlugLoading() {
  return <DocumentReaderSkeleton />;
}
