'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Filter, Columns2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale } from 'next-intl';
import type { DocumentV2Locale } from '@/types/document-v2';

interface LanguageOption {
  value: DocumentV2Locale;
  label: string;
  isOriginal: boolean;
}

interface ViewerToolbarProps {
  currentIndex: number;
  totalChapters: number;
  onPrev: () => void;
  onNext: () => void;
  zoom: number;
  onZoomChange: (z: number) => void;
  language: DocumentV2Locale;
  languageOptions: LanguageOption[];
  onLanguageChange: (lang: DocumentV2Locale) => void;
  mentionJewsActive: boolean;
  onToggleMentionJews: () => void;
  splitViewActive: boolean;
  splitViewDisabled: boolean;
  onToggleSplitView: () => void;
  labels: {
    chapter: string;
    of: string;
    prev: string;
    next: string;
    zoomIn: string;
    zoomOut: string;
    language: string;
    mentionJews: string;
    splitView: string;
  };
}

export function ViewerToolbar(props: ViewerToolbarProps) {
  const {
    currentIndex,
    totalChapters,
    onPrev,
    onNext,
    zoom,
    onZoomChange,
    language,
    languageOptions,
    onLanguageChange,
    mentionJewsActive,
    onToggleMentionJews,
    splitViewActive,
    splitViewDisabled,
    onToggleSplitView,
    labels,
  } = props;
  const uiLocale = useLocale();
  const uiIsRtl = uiLocale === 'he';
  const PrevIcon = uiIsRtl ? ChevronRight : ChevronLeft;
  const NextIcon = uiIsRtl ? ChevronLeft : ChevronRight;

  return (
    <div
      dir={uiIsRtl ? 'rtl' : 'ltr'}
      className="flex flex-wrap items-center gap-3 border-b px-4 py-2 text-[12px]"
      style={{
        background: 'var(--docs-cream)',
        borderColor: 'var(--docs-cream-3)',
      }}
    >
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={labels.prev}
          onClick={onPrev}
          disabled={currentIndex <= 1}
          className="inline-flex h-7 w-7 items-center justify-center border disabled:opacity-40"
          style={{ borderColor: 'var(--docs-cream-3)' }}
        >
          <PrevIcon className="h-4 w-4" />
        </button>
        <span className="px-2 tabular-nums">
          {labels.chapter} {currentIndex} {labels.of} {totalChapters}
        </span>
        <button
          type="button"
          aria-label={labels.next}
          onClick={onNext}
          disabled={currentIndex >= totalChapters}
          className="inline-flex h-7 w-7 items-center justify-center border disabled:opacity-40"
          style={{ borderColor: 'var(--docs-cream-3)' }}
        >
          <NextIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={labels.zoomOut}
          onClick={() => onZoomChange(Math.max(60, zoom - 10))}
          className="inline-flex h-7 w-7 items-center justify-center border"
          style={{ borderColor: 'var(--docs-cream-3)' }}
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="w-10 text-center tabular-nums">{zoom}%</span>
        <button
          type="button"
          aria-label={labels.zoomIn}
          onClick={() => onZoomChange(Math.min(200, zoom + 10))}
          className="inline-flex h-7 w-7 items-center justify-center border"
          style={{ borderColor: 'var(--docs-cream-3)' }}
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>

      <label className="select-lang flex items-center gap-2">
        <span className="uppercase text-[10px] tracking-[0.18em] text-muted-foreground">
          {labels.language}
        </span>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value as DocumentV2Locale)}
          className="border bg-[var(--docs-paper)] px-2 py-1"
          style={{ borderColor: 'var(--docs-cream-3)' }}
        >
          {languageOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={onToggleSplitView}
        disabled={splitViewDisabled}
        className={cn(
          'split-view inline-flex items-center gap-1 border px-2 py-1 disabled:opacity-40',
          splitViewActive
            ? 'bg-[var(--docs-accent)] text-[var(--docs-paper)] border-[var(--docs-accent)]'
            : 'bg-transparent',
        )}
        style={{
          borderColor: splitViewActive ? 'var(--docs-accent)' : 'var(--docs-cream-3)',
        }}
      >
        <Columns2 className="h-3.5 w-3.5" />
        {/* <span className='splitview-label'>{labels.splitView}</span> */}
      </button>

      {/* <button
        type="button"
        onClick={onToggleMentionJews}
        className={cn(
          'inline-flex items-center gap-1 border px-2 py-1',
          mentionJewsActive
            ? 'bg-[var(--docs-accent)] text-[var(--docs-paper)] border-[var(--docs-accent)]'
            : 'bg-transparent',
        )}
        style={{
          borderColor: mentionJewsActive ? 'var(--docs-accent)' : 'var(--docs-cream-3)',
        }}
      >
        <Filter className="h-3.5 w-3.5" />
        <span>{labels.mentionJews}</span>
      </button> */}
    </div>
  );
}
