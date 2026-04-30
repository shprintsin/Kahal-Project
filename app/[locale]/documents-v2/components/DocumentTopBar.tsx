'use client';

import React from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';

interface DocumentTopBarProps {
  /** Resolved title in the user's locale; falls back to slug upstream. */
  title: string;
  /** Archive label (e.g. "TSDIAL"); rendered as a middle breadcrumb when present. */
  archiveName?: string;
  /** Locale for the route — used to build the `/documents-v2` link. */
  routeLocale: string;
  labels: {
    library: string;
    searchPlaceholder: string;
    searchHint: string;
  };
}

/**
 * Black top bar from WF-01 "Balanced Reading Room": brand on the start side,
 * breadcrumb chain (Library / Archive / **Title**) in the middle, and a
 * non-functional global-search stub on the end side. The search is visual-only
 * for now — wiring up a real cross-document search route is a follow-up.
 */
export function DocumentTopBar({
  title,
  archiveName,
  routeLocale,
  labels,
}: DocumentTopBarProps) {
  return (
    <header
      className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3 text-[#c8c0a8]"
      style={{ background: 'var(--brand-dark)', minHeight: 52 }}
    >
      <Link
        href={`/${routeLocale}/documents-v2`}
        className="text-[18px] font-medium tracking-tight text-[var(--docs-paper)] no-underline"
        style={{ fontFamily: 'var(--font-frl)' }}
      >
        archivum
      </Link>

      <nav
        aria-label="breadcrumb"
        className="flex min-w-0 items-center gap-2 text-[11px] uppercase tracking-[0.08em]"
        style={{ fontFamily: 'var(--font-docs-mono)' }}
      >
        <Link
          href={`/${routeLocale}/documents-v2`}
          className="text-[#c8c0a8] no-underline hover:text-[var(--docs-paper)]"
        >
          {labels.library}
        </Link>
        {archiveName && (
          <>
            <span aria-hidden className="text-[#7a7565]">/</span>
            <span className="text-[#c8c0a8]">{archiveName}</span>
          </>
        )}
        <span aria-hidden className="text-[#7a7565]">/</span>
        <span
          className="truncate font-medium text-[var(--docs-paper)]"
          title={title}
        >
          {title}
        </span>
      </nav>

      <div className="flex flex-1 items-center justify-end gap-2">
        <label
          className="flex w-full max-w-[320px] items-center gap-2 border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5 text-xs text-[#a8a298]"
          style={{ fontFamily: 'var(--font-docs-mono)' }}
        >
          <Search className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <input
            type="search"
            placeholder={labels.searchPlaceholder}
            className="min-w-0 flex-1 bg-transparent text-[12px] text-[var(--docs-paper)] placeholder:text-[#7a7565] focus:outline-none"
            // Stub for now — real cross-document search is a follow-up.
            aria-label={labels.searchPlaceholder}
          />
          <span
            aria-hidden
            className="rounded border border-[#3a3a3a] px-1.5 py-px text-[10px] text-[#a8a298]"
          >
            {labels.searchHint}
          </span>
        </label>
      </div>
    </header>
  );
}
