'use client';

import React, { useState } from 'react';
import {
  type ChapterFull,
  type DocumentMeta,
  type DocumentV2Locale,
  resolveI18nString,
} from '@/types/document-v2';
import { cn } from '@/lib/utils';

interface InspectorTabsProps {
  title: string;
  meta: DocumentMeta;
  chapters: ChapterFull[];
  activeSlug: string | null;
  onJumpToChapter: (slug: string) => void;
  displayLocale: DocumentV2Locale;
  fallbackLocale: DocumentV2Locale;
  labels: {
    contents: string;
    details: string;
    citation: string;
    url: string;
    dateRange: string;
    chaptersCount: (n: number) => string;
  };
}

type Tab = 'contents' | 'details';

/** Right-rail inspector. Two tabs: chapter list ("Contents") and document
 *  metadata ("Details"). */
export function InspectorTabs({
  title,
  meta,
  chapters,
  activeSlug,
  onJumpToChapter,
  displayLocale,
  fallbackLocale,
  labels,
}: InspectorTabsProps) {
  const [tab, setTab] = useState<Tab>('contents');
  const isRtl = displayLocale === 'he' || displayLocale === 'yi';

  return (
    <aside
      className="flex h-full min-h-0 flex-col overflow-hidden border-s"
      style={{
        background: 'var(--docs-cream)',
        borderColor: 'var(--docs-cream-3)',
      }}
    >
      <div
        className="flex shrink-0 items-stretch border-b"
        style={{ borderColor: 'var(--docs-cream-3)' }}
      >
        {(['contents', 'details'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              'flex-1 border-b-2 px-3 py-2 text-[11px] uppercase tracking-[0.18em]',
              tab === key
                ? 'border-[var(--docs-accent)] bg-[var(--docs-paper)]'
                : 'border-transparent text-muted-foreground',
            )}
            style={{ fontFamily: 'var(--font-docs-mono)' }}
          >
            {key === 'contents' ? labels.contents : labels.details}
          </button>
        ))}
      </div>

      {tab === 'contents' ? (
        <div className="docs-scroll-y flex-1 px-3 py-3">
          <div
            className="mb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
            style={{ fontFamily: 'var(--font-docs-mono)' }}
          >
            {labels.chaptersCount(chapters.length)}
          </div>
          <ol className="space-y-1">
            {chapters.map((ch) => {
              const chTitle =
                resolveI18nString(ch.titleI18n, displayLocale, fallbackLocale) || ch.slug;
              const isActive = ch.slug === activeSlug;
              return (
                <li key={ch.slug}>
                  <button
                    type="button"
                    onClick={() => onJumpToChapter(ch.slug)}
                    dir={isRtl ? 'rtl' : 'ltr'}
                    className={cn(
                      'flex w-full items-start gap-2 border px-2 py-1.5 text-left text-[12px] leading-snug',
                      isActive
                        ? 'border-[var(--docs-accent)] bg-[var(--docs-paper)]'
                        : 'border-transparent hover:bg-[var(--docs-cream-2)]',
                    )}
                  >
                    <span
                      className="shrink-0 tabular-nums text-muted-foreground"
                      style={{ fontFamily: 'var(--font-docs-mono)' }}
                    >
                      {ch.index}.
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block">{chTitle}</span>
                      {ch.date && (
                        <span
                          className="mt-0.5 block text-[10px] uppercase tracking-[0.15em] text-muted-foreground"
                          style={{ fontFamily: 'var(--font-docs-mono)' }}
                        >
                          {ch.date}
                        </span>
                      )}
                    </span>
                    {ch.mentionJews && (
                      <span
                        className="shrink-0 self-center border border-[var(--docs-accent)] px-1 py-px text-[9px] uppercase tracking-wider text-[var(--docs-accent)]"
                        title="mentions Jews"
                      >
                        ★
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      ) : (
        <div className="docs-scroll-y flex-1 px-4 py-3 text-[12px] leading-relaxed">
          <div
            className="mb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
            style={{ fontFamily: 'var(--font-docs-mono)' }}
          >
            {labels.details}
          </div>
          <h2 className="mb-2 font-serif text-base leading-snug">{title}</h2>
          {(meta.dateStart || meta.dateEnd) && (
            <Detail label={labels.dateRange}>
              {[meta.dateStart, meta.dateEnd].filter(Boolean).join(' — ')}
            </Detail>
          )}
          {meta.citation && (
            <Detail label={labels.citation}>
              <span className="italic">{meta.citation}</span>
            </Detail>
          )}
          {meta.url && (
            <Detail label={labels.url}>
              <a
                href={meta.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                {meta.url}
              </a>
            </Detail>
          )}
          {meta.excerptI18n && (
            <p
              dir={isRtl ? 'rtl' : 'ltr'}
              className="mt-3 text-muted-foreground"
            >
              {resolveI18nString(meta.excerptI18n, displayLocale, fallbackLocale)}
            </p>
          )}
        </div>
      )}
    </aside>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <div
        className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
        style={{ fontFamily: 'var(--font-docs-mono)' }}
      >
        {label}
      </div>
      <div className="mt-0.5 break-words">{children}</div>
    </div>
  );
}
