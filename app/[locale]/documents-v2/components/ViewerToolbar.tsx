'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DocumentV2Locale } from '@/types/document-v2';

interface LanguageOption {
  value: DocumentV2Locale;
  label: string;
  isOriginal?: boolean;
}

interface ViewerToolbarProps {
  currentPage: number;
  totalPages: number;
  onJumpToPage: (page: number) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  language: DocumentV2Locale;
  languageOptions: LanguageOption[];
  onLanguageChange: (lang: DocumentV2Locale) => void;
  searchOpen: boolean;
  onToggleSearch: () => void;
  labels: {
    page: string;
    of: string;
    prevPage: string;
    nextPage: string;
    zoomIn: string;
    zoomOut: string;
    language: string;
    searchInDoc: string;
  };
}

const ZOOM_MIN = 50;
const ZOOM_MAX = 200;
const ZOOM_STEP = 10;

const ICON_BUTTON_CLASS = cn(
  'inline-flex h-7 w-7 items-center justify-center border text-[var(--muted-foreground)]',
  'hover:bg-[var(--docs-cream-2)] hover:text-[var(--brand-primary)]',
  'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent',
  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
);

export function ViewerToolbar({
  currentPage,
  totalPages,
  onJumpToPage,
  zoom,
  onZoomChange,
  language,
  languageOptions,
  onLanguageChange,
  searchOpen,
  onToggleSearch,
  labels,
}: ViewerToolbarProps) {
  // The toolbar lives inside the route locale's `dir` context. In RTL the visual
  // "previous" arrow needs to point right and "next" needs to point left, so we
  // swap the chevron components based on the active locale.
  const uiLocale = useLocale();
  const uiIsRtl = uiLocale === 'he';
  const PrevIcon = uiIsRtl ? ChevronRight : ChevronLeft;
  const NextIcon = uiIsRtl ? ChevronLeft : ChevronRight;
  const [draftPage, setDraftPage] = useState(String(currentPage));
  useEffect(() => {
    setDraftPage(String(currentPage));
  }, [currentPage]);

  const commitPage = () => {
    const n = parseInt(draftPage, 10);
    if (Number.isFinite(n) && n >= 1 && n <= totalPages) {
      onJumpToPage(n);
    } else {
      setDraftPage(String(currentPage));
    }
  };

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 border-b px-3 py-2"
      style={{
        background: 'var(--docs-paper)',
        borderColor: 'var(--docs-cream-3)',
      }}
    >
      {/* Language segmented control — replaces the old radio buttons. */}
      {languageOptions.length > 1 ? (
        <div
          role="radiogroup"
          aria-label={labels.language}
          className="inline-flex border"
          style={{ borderColor: 'var(--docs-cream-3)' }}
        >
          {languageOptions.map((opt, idx) => {
            const isActive = opt.value === language;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => onLanguageChange(opt.value)}
                className={cn(
                  'px-3 py-1 text-[11px] uppercase tracking-[0.06em] transition-colors',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                  idx > 0 && 'border-s',
                  isActive
                    ? 'bg-[var(--docs-accent)] text-[var(--docs-paper)]'
                    : 'bg-[var(--docs-paper)] text-[var(--muted-foreground)] hover:text-[var(--brand-primary)]',
                )}
                style={{
                  fontFamily: 'var(--font-docs-mono)',
                  borderColor: 'var(--docs-cream-3)',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      ) : (
        <span
          className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted-foreground)]"
          style={{ fontFamily: 'var(--font-docs-mono)' }}
        >
          {languageOptions[0]?.label ?? ''}
        </span>
      )}

      {/* Page navigation: prev / "Page N of M" field / next. */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onJumpToPage(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          aria-label={labels.prevPage}
          className={ICON_BUTTON_CLASS}
          style={{ borderColor: 'var(--docs-cream-3)' }}
        >
          <PrevIcon className="h-3.5 w-3.5" />
        </button>
        <div
          className="flex items-center gap-1.5 border bg-[var(--docs-paper)] px-2.5 py-1 text-[11px]"
          style={{
            borderColor: 'var(--docs-cream-3)',
            fontFamily: 'var(--font-docs-mono)',
            color: 'var(--muted-foreground)',
          }}
        >
          <span>{labels.page}</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={draftPage}
            onChange={(e) => setDraftPage(e.target.value)}
            onBlur={commitPage}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                commitPage();
              }
            }}
            className="w-10 bg-transparent text-center font-medium text-[var(--foreground)] focus:outline-none"
          />
          <span>
            {labels.of} {totalPages}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onJumpToPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          aria-label={labels.nextPage}
          className={ICON_BUTTON_CLASS}
          style={{ borderColor: 'var(--docs-cream-3)' }}
        >
          <NextIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Zoom + in-doc-search toggle. */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onZoomChange(Math.max(ZOOM_MIN, zoom - ZOOM_STEP))}
          disabled={zoom <= ZOOM_MIN}
          aria-label={labels.zoomOut}
          className={ICON_BUTTON_CLASS}
          style={{ borderColor: 'var(--docs-cream-3)' }}
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <span
          className="inline-flex h-7 w-12 items-center justify-center border bg-[var(--docs-paper)] text-[10px] tabular-nums tracking-wider text-[var(--brand-primary)]"
          style={{
            borderColor: 'var(--docs-cream-3)',
            fontFamily: 'var(--font-docs-mono)',
          }}
        >
          {zoom}%
        </span>
        <button
          type="button"
          onClick={() => onZoomChange(Math.min(ZOOM_MAX, zoom + ZOOM_STEP))}
          disabled={zoom >= ZOOM_MAX}
          aria-label={labels.zoomIn}
          className={ICON_BUTTON_CLASS}
          style={{ borderColor: 'var(--docs-cream-3)' }}
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onToggleSearch}
          aria-label={labels.searchInDoc}
          aria-pressed={searchOpen}
          title={labels.searchInDoc}
          className={cn(
            ICON_BUTTON_CLASS,
            searchOpen && 'bg-[var(--docs-accent)] !text-[var(--docs-paper)] hover:bg-[var(--docs-accent)]',
          )}
          style={{ borderColor: searchOpen ? 'var(--docs-accent)' : 'var(--docs-cream-3)' }}
        >
          <Search className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
