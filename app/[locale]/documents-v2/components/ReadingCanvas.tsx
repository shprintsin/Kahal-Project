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
  /** Reader-display locale, used to pick title/excerpt strings. */
  displayLocale: DocumentV2Locale;
  fallbackLocale: DocumentV2Locale;
  isRtl: boolean;
  zoom?: number;
  labels: {
    chapter: string;
    mentionsJews: string;
    noTranslation: string;
  };
}

const BASE_FONT_PX = 16;
const READING_FONT =
  "var(--font-frl), 'Frank Ruhl Libre', 'Georgia', 'Noto Serif Hebrew', serif";

const PROSE = cn(
  '[&_h1]:font-serif [&_h1]:font-semibold [&_h1]:text-[1.4em] [&_h1]:leading-[1.25] [&_h1]:my-[0.6em]',
  '[&_h2]:font-serif [&_h2]:font-semibold [&_h2]:text-[1.2em] [&_h2]:leading-[1.3] [&_h2]:mt-[1.3em] [&_h2]:mb-[0.45em]',
  '[&_h3]:font-serif [&_h3]:font-semibold [&_h3]:text-[1.08em] [&_h3]:leading-[1.35] [&_h3]:mt-[1.2em] [&_h3]:mb-[0.4em]',
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
      {markdown}
    </ReactMarkdown>
  );
}

export const ReadingCanvas = forwardRef<HTMLDivElement, ReadingCanvasProps>(
  function ReadingCanvas(
    {
      chapters,
      sourceLang,
      translationLang,
      displayLocale,
      fallbackLocale,
      isRtl,
      zoom = 100,
      className,
      style,
      labels,
      ...rest
    },
    ref,
  ) {
    const showSplit = translationLang !== sourceLang;
    const sourceIsRtl = isRtlLocale(sourceLang);
    const translationIsRtl = isRtlLocale(translationLang);

    return (
      <div
        ref={ref}
        {...rest}
        className={cn('docs-scroll-y--paper flex-1 min-h-0', className)}
        style={{ background: 'var(--docs-paper)', ...style }}
      >
        <article
          dir={isRtl ? 'rtl' : 'ltr'}
          className={cn('mx-auto max-w-[1200px] px-4 py-8 sm:px-8 sm:py-10 text-foreground')}
          style={{
            fontFamily: READING_FONT,
            fontSize: `${(BASE_FONT_PX * zoom) / 100}px`,
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
                  <div
                    className="flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
                    style={{ fontFamily: 'var(--font-docs-mono)' }}
                  >
                    <span>
                      {labels.chapter} {ch.index}
                    </span>
                    {ch.date && <span>· {ch.date}</span>}
                    {ch.mentionJews && (
                      <span className="border border-[var(--docs-accent)] px-1.5 py-px text-[var(--docs-accent)]">
                        {labels.mentionsJews}
                      </span>
                    )}
                  </div>
                  <h2
                    className="mt-2 font-serif text-2xl font-semibold leading-snug"
                    dir={isRtl ? 'rtl' : 'ltr'}
                  >
                    {title || ch.slug}
                  </h2>
                  {excerpt && (
                    <p
                      className="mt-2 text-sm italic text-muted-foreground"
                      dir={isRtl ? 'rtl' : 'ltr'}
                    >
                      {excerpt}
                    </p>
                  )}
                </header>

                <div
                  className={cn(
                    showSplit ? 'grid gap-8 md:grid-cols-2' : '',
                    'leading-[1.75]',
                  )}
                >
                  <div
                    dir={sourceIsRtl ? 'rtl' : 'ltr'}
                    className={cn(PROSE, sourceIsRtl ? 'text-right' : 'text-left')}
                  >
                    <ChapterBody markdown={ch.text} />
                  </div>

                  {showSplit && (
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
                  )}
                </div>
              </section>
            );
          })}
        </article>
      </div>
    );
  },
);
