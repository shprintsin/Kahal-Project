import React from 'react';
import { Frank_Ruhl_Libre } from 'next/font/google';
import { getDocumentMetas } from './lib/repository';
import { DocsV2Shell } from './components/DocsV2Shell';

// Scoped to /documents-v2 only — these fonts are loaded just for this route
// segment. The CSS-vars they expose are consumed via the [data-design] block
// in `app/globals.css`, so they never leak into the rest of the app.
const frankRuhlLibre = Frank_Ruhl_Libre({
  subsets: ['latin', 'hebrew'],
  weight: ['400', '500', '700'],
  variable: '--font-frl',
  display: 'swap',
});

/**
 * Persistent shell for the documents-v2 segment. We fetch the library list
 * here (instead of in `[slug]/page.tsx`) so it survives navigation between
 * documents — Next.js preserves layouts when only a child segment changes,
 * which means the top bar + library rail never re-mount on doc switches and
 * the loading boundary at `[slug]/loading.tsx` only swaps the reader pane.
 */
export default async function DocumentsV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const library = await getDocumentMetas();
  return (
    <div
      data-design="docs-v2"
      className={`${frankRuhlLibre.variable} w-full`}
    >
      <DocsV2Shell library={library}>{children}</DocsV2Shell>
    </div>
  );
}
