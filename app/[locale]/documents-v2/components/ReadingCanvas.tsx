'use client';

import React, { forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { rehypePageMarkers } from '../lib/rehype-page-markers';
import { cn } from '@/lib/utils';
import type { DocumentV2PageRender } from '@/types/document-v2';

interface ReadingCanvasProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Source markdown for the active language. Used as a fallback when the
   *  per-page HTML hasn't been backfilled (legacy rows pre-Step 1). */
  markdown: string;
  /** Server-rendered per-page HTML, in source order. When non-empty the
   *  reader stops parsing markdown on the client and just inlines these. */
  pages: DocumentV2PageRender[];
  isRtl: boolean;
  /** Zoom percentage (e.g. 100, 120). Scales font-size; prose styles are em-based so headings/lists scale too. */
  zoom?: number;
}

const BASE_FONT_PX = 16;

// Use Frank Ruhl Libre (loaded by the route layout) as the editorial face for
// historical documents, with system Hebrew/Latin serifs as a fallback chain.
const READING_FONT =
  "var(--font-frl), 'Frank Ruhl Libre', 'Georgia', 'Noto Serif Hebrew', serif";

export const ReadingCanvas = forwardRef<HTMLDivElement, ReadingCanvasProps>(
  function ReadingCanvas(
    { markdown, pages, isRtl, zoom = 100, className, style, ...rest },
    ref,
  ) {
    // Hot path: server-rendered HTML chunks. The reader keeps the client-side
    // ReactMarkdown branch as a fallback for any legacy row that didn't pass
    // through the Step 1 backfill (html column null) — once GC removes those,
    // the fallback can be deleted along with the markdown plugins import.
    const useServerHtml = pages.length > 0;
    return (
      <div
        ref={ref}
        {...rest}
        className={cn('docs-scroll-y--paper flex-1 min-h-0', className)}
        style={{ background: 'var(--docs-paper)', ...style }}
      >
        <article
          dir={isRtl ? 'rtl' : 'ltr'}
          className={cn(
            'relative mx-auto px-4 py-8 sm:px-8 sm:py-12 md:px-16 md:py-16 leading-[1.75]',
            // Fixed pixel max-width (not `ch`), so zooming the font scales only the text:
            // shrinking the font lets more characters fit per line instead of also
            // shrinking the column the same amount.
            'max-w-[760px] text-foreground',
            // Headings
            // Each non-first H1 gets a light-gray top border that acts as a section divider
            // between top-level chapters. `first:` resets it for the document's opening H1.
            '[&_h1]:font-serif [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-[1.4em] [&_h1]:leading-[1.25] [&_h1]:mt-[2em] [&_h1]:pt-[1.2em] [&_h1]:mb-[0.5em] [&_h1]:border-t [&_h1]:border-[lightgray] [&_h1]:first:mt-0 [&_h1]:first:pt-0 [&_h1]:first:border-t-0',
            '[&_h2]:font-serif [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-[1.2em] [&_h2]:leading-[1.3] [&_h2]:mt-[1.3em] [&_h2]:mb-[0.45em]',
            '[&_h3]:font-serif [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3]:text-[1.08em] [&_h3]:leading-[1.35] [&_h3]:mt-[1.2em] [&_h3]:mb-[0.4em]',
            '[&_h4]:font-serif [&_h4]:font-semibold [&_h4]:text-[1em] [&_h4]:mt-[1.1em] [&_h4]:mb-[0.35em]',
            '[&_h5]:font-serif [&_h5]:font-semibold [&_h5]:text-[0.95em] [&_h5]:uppercase [&_h5]:tracking-wide [&_h5]:mt-[1.1em] [&_h5]:mb-[0.35em]',
            '[&_h6]:font-serif [&_h6]:font-semibold [&_h6]:text-[0.85em] [&_h6]:uppercase [&_h6]:tracking-wide [&_h6]:text-muted-foreground [&_h6]:mt-[1em] [&_h6]:mb-[0.3em]',
            // Strip any inherited heading decoration
            '[&_h2]:border-0 [&_h3]:border-0 [&_h4]:border-0 [&_h5]:border-0 [&_h6]:border-0',
            '[&_h1]:shadow-none [&_h2]:shadow-none [&_h3]:shadow-none [&_h4]:shadow-none [&_h5]:shadow-none [&_h6]:shadow-none',
            '[&_h1]:[text-shadow:none] [&_h2]:[text-shadow:none] [&_h3]:[text-shadow:none] [&_h4]:[text-shadow:none] [&_h5]:[text-shadow:none] [&_h6]:[text-shadow:none]',
            // Paragraphs and inline text
            '[&_p]:my-[1em]',
            '[&_strong]:font-semibold [&_strong]:text-foreground',
            '[&_em]:italic',
            '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:opacity-80',
            // Lists
            '[&_ul]:my-[1em] [&_ul]:ps-[1.6em] [&_ul]:list-disc',
            '[&_ol]:my-[1em] [&_ol]:ps-[1.6em] [&_ol]:list-decimal',
            '[&_li]:my-[0.4em] [&_li]:ps-[0.25em]',
            '[&_li>p]:my-[0.4em]',
            // Blockquote
            '[&_blockquote]:my-[1.2em] [&_blockquote]:ps-[1em] [&_blockquote]:border-s-4 [&_blockquote]:border-border [&_blockquote]:italic [&_blockquote]:text-muted-foreground',
            // Code
            '[&_code]:font-mono [&_code]:text-[0.9em] [&_code]:px-[0.35em] [&_code]:py-[0.1em] [&_code]:rounded [&_code]:bg-muted',
            '[&_pre]:my-[1.2em] [&_pre]:p-4 [&_pre]:rounded [&_pre]:bg-muted [&_pre]:overflow-x-auto',
            '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
            // Horizontal rule
            '[&_hr]:hidden',
            // Tables
            '[&_table]:font-mono [&_table]:text-[14px] [&_table]:my-0 [&_table]:border [&_table]:border-border',
            '[&_th]:bg-muted [&_th]:text-foreground [&_th]:font-semibold [&_th]:p-2 [&_th]:border [&_th]:border-border',
            '[&_td]:align-top [&_td]:p-2 [&_td]:border [&_td]:border-border',
            // Images
            '[&_img]:my-[1.2em] [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded',
            isRtl ? 'text-right' : 'text-left',
          )}
          style={{
            fontFamily: READING_FONT,
            fontSize: `${(BASE_FONT_PX * zoom) / 100}px`,
          }}
        >
          {useServerHtml ? (
            // Each page is rendered as its own block with `data-doc-page` so
            // the highlight + active-page hooks can find page boundaries
            // without re-parsing the markdown source. Order is guaranteed
            // (sorted by `pageNumber` upstream).
            pages.map((p) => (
              <div
                key={`${p.pageNumber}-${p.filename}`}
                data-doc-page={p.pageNumber}
                data-doc-filename={p.filename}
                dangerouslySetInnerHTML={{ __html: p.html }}
              />
            ))
          ) : (
            <ReactMarkdown
              // `remarkBreaks` converts single `\n` into hard line breaks so the
              // reader respects the line layout of historical transcriptions
              // verbatim, instead of the CommonMark default of collapsing
              // single newlines into spaces.
              remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
              rehypePlugins={[rehypeRaw, rehypeSlug, rehypePageMarkers, rehypeKatex]}
              components={{
                table: ({ node, ...props }) => (
                  <div className="my-6 overflow-x-auto border border-border">
                    <table {...props} className="w-full border-collapse" />
                  </div>
                ),
              }}
            >
              {markdown}
            </ReactMarkdown>
          )}
        </article>
      </div>
    );
  },
);
