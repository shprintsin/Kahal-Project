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
import {
  type ChapterFull,
  type DocumentV2Locale,
  chapterDomId,
  resolveI18nString,
} from '@/types/document-v2';

interface ReadingCanvasProps extends React.HTMLAttributes<HTMLDivElement> {
  chapters: ChapterFull[];
  /** Source language of the parent document — its body lives on `chapter.text`. */
  sourceLang: DocumentV2Locale;
  /** Translation language to display alongside the source body. When equal to
   *  `sourceLang` only the source pane is rendered. */
  translationLang: DocumentV2Locale;
  /** When true, render the source body and translation side-by-side. When
   *  false (default), render only the translation body — and fall back to the
   *  source if no translation is available. */
  splitView: boolean;
  /** Reader-display locale, used to pick title/excerpt strings. */
  displayLocale: DocumentV2Locale;
  fallbackLocale: DocumentV2Locale;
  displayIsRtl: boolean;
  zoom?: number;
  labels: {
    chapter: string;
    mentionsJews: string;
    noTranslation: string;
  };
}

const READING_FONT = 'var(--docs-font-serif)';

const PROSE = cn(
  '[&_h1]:font-semibold [&_h1]:text-[1.4em] [&_h1]:leading-[1.25] [&_h1]:my-[0.6em]',
  '[&_h2]:font-semibold [&_h2]:text-[1.2em] [&_h2]:leading-[1.3] [&_h2]:mt-[1.3em] [&_h2]:mb-[0.45em]',
  '[&_h3]:font-semibold [&_h3]:text-[1.08em] [&_h3]:leading-[1.35] [&_h3]:mt-[1.2em] [&_h3]:mb-[0.4em]',
  '[&_p]:my-[1em]',
  '[&_strong]:font-semibold [&_strong]:text-foreground',
  '[&_em]:italic',
  '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:opacity-80',
  '[&_ul]:my-[1em] [&_ul]:ps-[1.6em] [&_ul]:list-disc',
  '[&_ol]:my-[1em] [&_ol]:ps-[1.6em] [&_ol]:list-decimal',
  '[&_li]:my-[0.4em] [&_li]:ps-[0.25em]',
  '[&_blockquote]:my-[1.2em] [&_blockquote]:ps-[1em] [&_blockquote]:border-s-4 [&_blockquote]:border-border [&_blockquote]:italic [&_blockquote]:text-muted-foreground',
  '[&_code]:font-mono [&_code]:text-[0.9em] [&_code]:px-[0.35em] [&_code]:py-[0.1em] [&_code]:rounded [&_code]:bg-muted',
  '[&_table]:font-mono [&_table]:text-[14px] [&_table]:my-0 [&_table]:border [&_table]:border-border',
  '[&_th]:bg-muted [&_th]:text-foreground [&_th]:font-semibold [&_th]:p-2 [&_th]:border [&_th]:border-border',
  '[&_td]:align-top [&_td]:p-2 [&_td]:border [&_td]:border-border',
);

function isRtlLocale(loc: DocumentV2Locale): boolean {
  return loc === 'he' || loc === 'yi';
}

/** Strip lines that start with `@@@` (page-scan markers, e.g. `@@@ File: X @@@`).
 *  These are useful as anchors during enrichment but visual noise in the reader. */
function stripMarkerLines(md: string): string {
  return md
    .split('\n')
    .filter((line) => !/^\s*@@@/.test(line))
    .join('\n');
}

function ChapterBody({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
      rehypePlugins={[rehypeRaw, rehypeSlug, rehypePageMarkers, rehypeKatex]}
      components={{
        table: ({ ...props }) => (
          <div className="my-6 overflow-x-auto border border-border">
            <table {...props} className="w-full border-collapse" />
          </div>
        ),
      }}
    >
      {stripMarkerLines(markdown)}
    </ReactMarkdown>
  );
}

export const ReadingCanvas = forwardRef<HTMLDivElement, ReadingCanvasProps>(
  function ReadingCanvas(
    {
      chapters,
      sourceLang,
      translationLang,
      splitView,
      displayLocale,
      fallbackLocale,
      displayIsRtl,
      zoom = 100,
      className,
      style,
      labels,
      ...rest
    },
    ref,
  ) {
    const showSplit = splitView && translationLang !== sourceLang;
    const sourceIsRtl = isRtlLocale(sourceLang);
    const translationIsRtl = isRtlLocale(translationLang);
    const baseFontPx = showSplit ? 16 : 18;

    return (
      <div
        ref={ref}
        {...rest}
        className={cn('docs-scroll-y--paper flex-1 min-h-0', className)}
        style={{ background: 'var(--docs-paper)', ...style }}
      >
        <article
          dir={displayIsRtl ? 'rtl' : 'ltr'}
          className={cn(
            'mx-auto px-4 py-8 sm:px-8 sm:py-10 text-foreground',
            showSplit ? 'max-w-[1200px]' : 'max-w-[72ch]',
          )}
          style={{
            fontFamily: READING_FONT,
            fontSize: `${(baseFontPx * zoom) / 100}px`,
          }}
        >
          {chapters.map((ch) => {
            const title = resolveI18nString(ch.titleI18n, displayLocale, fallbackLocale);
            const excerpt = resolveI18nString(ch.excerptI18n, displayLocale, fallbackLocale);
            const translationBody =
              translationLang === sourceLang ? ch.text : ch.translations[translationLang];
            return (
              <section
                key={ch.slug}
                id={chapterDomId(ch.slug)}
                data-chapter-slug={ch.slug}
                data-chapter-index={ch.index}
                className={cn(
                  'border-t border-[var(--docs-cream-3)] pt-10 first:border-t-0 first:pt-0',
                  'mb-12',
                )}
              >
                <header className="mb-6">
                  <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    <span>
                      {labels.chapter} {ch.index}
                    </span>
                    {ch.date && <span>· {ch.date}</span>}
                    {/* {ch.mentionJews && (
                      <span className="border border-[var(--docs-accent)] px-1.5 py-px text-[var(--docs-accent)]">
                        {labels.mentionsJews}
                      </span>
                    )} */}
                  </div>
                  <h2
                    className="mt-2 text-2xl font-semibold leading-snug"
                    dir={displayIsRtl ? 'rtl' : 'ltr'}
                  >
                    {title || ch.slug}
                  </h2>
                  {excerpt && (
                    <p
                      className="mt-2 text-sm italic text-muted-foreground"
                      dir={displayIsRtl ? 'rtl' : 'ltr'}
                    >
                      {excerpt}
                    </p>
                  )}
                </header>

                {showSplit ? (
                  <div className="grid gap-8 md:grid-cols-2 leading-[1.75]">
                    <div
                      dir={sourceIsRtl ? 'rtl' : 'ltr'}
                      className={cn(PROSE, sourceIsRtl ? 'text-right' : 'text-left')}
                    >
                      <ChapterBody markdown={ch.text} />
                    </div>
                    <div
                      dir={translationIsRtl ? 'rtl' : 'ltr'}
                      className={cn(
                        PROSE,
                        translationIsRtl ? 'text-right' : 'text-left',
                        'border-s ps-8 border-[var(--docs-cream-3)]',
                      )}
                    >
                      {translationBody ? (
                        <ChapterBody markdown={translationBody} />
                      ) : (
                        <p className="italic text-muted-foreground">{labels.noTranslation}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  (() => {
                    const single = translationBody ?? ch.text;
                    const singleIsRtl =
                      translationBody ? translationIsRtl : sourceIsRtl;
                    return (
                      <div
                        dir={singleIsRtl ? 'rtl' : 'ltr'}
                        className={cn(
                          PROSE,
                          singleIsRtl ? 'text-right' : 'text-left',
                          'leading-[1.75]',
                        )}
                      >
                        {translationBody || translationLang === sourceLang ? (
                          <ChapterBody markdown={single} />
                        ) : (
                          <p className="italic text-muted-foreground">{labels.noTranslation}</p>
                        )}
                      </div>
                    );
                  })()
                )}
              </section>
            );
          })}
        </article>
      </div>
    );
  },
);
