'use client';

import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { DocumentV2Locale, DocumentV2Meta, TocEntry } from '@/types/document-v2';
import { cn } from '@/lib/utils';
import type { DocHighlight } from '../lib/highlights/types';
import { NotesPanel } from './NotesPanel';

export interface DownloadVariant {
  lang: DocumentV2Locale;
  /** Human-readable label, e.g. "Original (Hebrew)" or "English". */
  label: string;
  markdown: string;
}

interface InspectorTabsProps {
  title: string;
  meta: DocumentV2Meta;
  toc: TocEntry[];
  activeId: string | null;
  onJump: (id: string) => void;
  /** Language currently being viewed — drives TOC direction and text alignment. */
  activeLang: DocumentV2Locale;
  /** Markdown variants available for download (original + translations). */
  downloads: DownloadVariant[];
  /** User highlights for the current (slug, lang). Drives the Notes tab and
   *  the count badge on its trigger. */
  highlights: DocHighlight[];
  noteEditingId: string | null;
  onClearNoteEditing: () => void;
  onJumpToHighlight: (id: string) => void;
  onRemoveHighlight: (id: string) => void;
  onSetHighlightNote: (id: string, note: string) => void;
  pageCount: number;
  side?: 'left' | 'right';
  labels: {
    contents: string;
    details: string;
    notes: string;
    notesEmpty: string;
    highlightLabel: string;
    noteLabel: string;
    notePagePrefix: (n: number) => string;
    noteEditPlaceholder: string;
    addNote: string;
    removeHighlight: string;
    sectionsCount: (n: number) => string;
    archive: string;
    license: string;
    year: string;
    pages: string;
    downloads: string;
    downloadMarkdownTitle: (lang: string) => string;
  };
}

type Tab = 'contents' | 'details' | 'notes';

function downloadBlob(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Right-rail inspector matching WF-01: a tab strip swaps three panels —
 * **Contents** (TOC), **Details** (metadata + downloads), and **Notes**
 * (placeholder for the WF-05 feature which is out of scope for now).
 *
 * Carries forward the existing TOC/metadata behaviour from `SmartIndex`; the
 * tab structure makes room for notes without sacrificing TOC visibility.
 */
export function InspectorTabs({
  title,
  meta,
  toc,
  activeId,
  onJump,
  activeLang,
  downloads,
  highlights,
  noteEditingId,
  onClearNoteEditing,
  onJumpToHighlight,
  onRemoveHighlight,
  onSetHighlightNote,
  pageCount,
  side = 'right',
  labels,
}: InspectorTabsProps) {
  const [tab, setTab] = useState<Tab>('contents');
  // Auto-jump to the Notes tab when the user requests inline note editing
  // from the canvas's context menu, so the editor is actually visible.
  React.useEffect(() => {
    if (noteEditingId !== null) setTab('notes');
  }, [noteEditingId]);
  const isRtl = activeLang === 'he' || activeLang === 'yi';
  const borderClass = side === 'right' ? 'border-s' : 'border-e';

  return (
    <aside
      dir={isRtl ? 'rtl' : 'ltr'}
      className={cn(
        'flex h-full min-h-0 flex-col overflow-hidden',
        borderClass,
      )}
      style={{
        background: 'var(--docs-cream)',
        borderColor: 'var(--docs-cream-3)',
      }}
    >
      {/* Sticky title block — keeps the document name visible while the TOC scrolls. */}
      <div
        className="flex-none border-b px-4 py-4"
        style={{ borderColor: 'var(--docs-cream-3)' }}
      >
        <div
          className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]"
          style={{ fontFamily: 'var(--font-docs-mono)' }}
        >
          {meta.year ?? '—'}
        </div>
        <h2
          className="mt-1.5 text-[16px] font-medium leading-snug text-[var(--brand-primary)]"
          dir={meta.lang === 'he' || meta.lang === 'yi' ? 'rtl' : 'ltr'}
          style={{ fontFamily: 'var(--font-frl)' }}
        >
          {title}
        </h2>
      </div>

      {/* Tab strip */}
      <div
        className="flex flex-none border-b"
        style={{ borderColor: 'var(--docs-cream-3)' }}
        role="tablist"
      >
        <TabButton current={tab} value="contents" onSelect={setTab}>{labels.contents}</TabButton>
        <TabButton current={tab} value="details" onSelect={setTab}>{labels.details}</TabButton>
        <TabButton current={tab} value="notes" onSelect={setTab} count={highlights.length}>
          {labels.notes}
        </TabButton>
      </div>

      {/* Content panel */}
      {tab === 'contents' && (
        <ContentsPanel
          toc={toc}
          activeId={activeId}
          onJump={onJump}
          sectionsLabel={labels.sectionsCount}
        />
      )}
      {tab === 'details' && (
        <DetailsPanel
          meta={meta}
          pageCount={pageCount}
          downloads={downloads}
          labels={labels}
        />
      )}
      {tab === 'notes' && (
        <NotesPanel
          highlights={highlights}
          emptyText={labels.notesEmpty}
          noteEditingId={noteEditingId}
          onClearNoteEditing={onClearNoteEditing}
          onJumpTo={onJumpToHighlight}
          onRemove={onRemoveHighlight}
          onSetNote={onSetHighlightNote}
          labels={{
            highlightLabel: labels.highlightLabel,
            noteLabel: labels.noteLabel,
            pagePrefix: labels.notePagePrefix,
            notePlaceholder: labels.noteEditPlaceholder,
            addNote: labels.addNote,
            remove: labels.removeHighlight,
          }}
        />
      )}
    </aside>
  );
}

function TabButton({
  current,
  value,
  onSelect,
  children,
  count,
}: {
  current: Tab;
  value: Tab;
  onSelect: (t: Tab) => void;
  children: React.ReactNode;
  /** Optional small badge — used by the Notes tab to show a highlight count. */
  count?: number;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => onSelect(value)}
      className={cn(
        'inline-flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-[11px] uppercase tracking-[0.12em] transition-colors',
        active
          ? 'border-b-2 font-semibold text-[var(--brand-primary)]'
          : 'border-b-2 border-transparent text-[var(--muted-foreground)] hover:text-[var(--brand-primary)]',
      )}
      style={{
        fontFamily: 'var(--font-docs-mono)',
        borderBottomColor: active ? 'var(--docs-accent)' : undefined,
      }}
    >
      <span>{children}</span>
      {count !== undefined && count > 0 && (
        <span
          aria-hidden
          className="inline-flex min-w-[16px] items-center justify-center rounded-full px-1 py-px text-[9px] font-semibold leading-none text-[var(--docs-paper)]"
          style={{ background: 'var(--docs-accent)', fontFamily: 'var(--font-docs-mono)' }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function ContentsPanel({
  toc,
  activeId,
  onJump,
  sectionsLabel,
}: {
  toc: TocEntry[];
  activeId: string | null;
  onJump: (id: string) => void;
  sectionsLabel: (n: number) => string;
}) {
  return (
    <>
      <div
        className="flex flex-none items-center gap-2 border-b px-4 py-2"
        style={{ borderColor: 'var(--docs-cream-3)' }}
      >
        <span
          className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]"
          style={{ fontFamily: 'var(--font-docs-mono)' }}
        >
          {sectionsLabel(toc.length)}
        </span>
      </div>
      <div className="docs-scroll-y min-h-0 flex-1 px-4 py-3">
        <nav className="space-y-0.5">
          {toc.length === 0 && (
            <div className="text-[var(--muted-foreground)]/60">—</div>
          )}
          {toc.map((entry) => {
            const isActive = entry.id === activeId;
            // The WF-01 TOC has three logical levels: lvl-0 = uppercase mono section
            // header, lvl-1 = serif item, lvl-2 = indented small caption.
            const lvl0 = entry.level === 1;
            const lvl1 = entry.level === 2;
            const lvl2 = entry.level === 3;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => onJump(entry.id)}
                className={cn(
                  'block w-full cursor-pointer border-s-2 py-1.5 text-start leading-snug transition-colors',
                  'hover:text-[var(--brand-primary)]',
                  isActive
                    ? 'font-semibold text-[var(--brand-primary)]'
                    : 'text-[var(--muted-foreground)]',
                  lvl1 && 'ps-3',
                  lvl2 && 'ps-6 text-[12px]',
                )}
                style={{
                  borderInlineStartColor: isActive ? 'var(--docs-accent)' : 'transparent',
                  fontFamily: lvl0 ? 'var(--font-docs-mono)' : 'var(--font-frl)',
                  fontSize: lvl0 ? 10 : undefined,
                  letterSpacing: lvl0 ? '0.12em' : undefined,
                  textTransform: lvl0 ? 'uppercase' : undefined,
                  paddingTop: lvl0 ? 12 : undefined,
                  paddingInlineStart: lvl0 ? 8 : undefined,
                  color: lvl0 ? 'var(--foreground)' : undefined,
                }}
              >
                {entry.text}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}

function DetailsPanel({
  meta,
  pageCount,
  downloads,
  labels,
}: {
  meta: DocumentV2Meta;
  pageCount: number;
  downloads: DownloadVariant[];
  labels: InspectorTabsProps['labels'];
}) {
  return (
    <div className="docs-scroll-y min-h-0 flex-1 px-4 py-4">
      <dl className="space-y-2 text-[12px]">
        {meta.archive?.name && (
          <Row
            label={labels.archive}
            value={
              meta.archive.url ? (
                <a
                  href={meta.archive.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-[var(--brand-primary)]"
                >
                  {meta.archive.name}
                  {meta.archive.reference ? ` · ${meta.archive.reference}` : ''}
                </a>
              ) : (
                <>
                  {meta.archive.name}
                  {meta.archive.reference ? ` · ${meta.archive.reference}` : ''}
                </>
              )
            }
          />
        )}
        {meta.license && <Row label={labels.license} value={meta.license} />}
        {meta.year !== undefined && <Row label={labels.year} value={String(meta.year)} />}
        <Row label={labels.pages} value={String(pageCount)} />
      </dl>

      {downloads.length > 0 && (
        <div className="mt-5 border-t pt-4" style={{ borderColor: 'var(--docs-cream-3)' }}>
          <div
            className="mb-2 text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]"
            style={{ fontFamily: 'var(--font-docs-mono)' }}
          >
            {labels.downloads}
          </div>
          <div className="flex flex-col gap-1.5">
            {downloads.map((variant) => {
              const filename =
                variant.lang === meta.lang
                  ? `${meta.slug}.md`
                  : `${meta.slug}.${variant.lang}.md`;
              return (
                <button
                  key={variant.lang}
                  type="button"
                  title={labels.downloadMarkdownTitle(variant.label)}
                  onClick={() => downloadBlob(filename, variant.markdown)}
                  className={cn(
                    'inline-flex items-center justify-between gap-2 border bg-[var(--docs-paper)] px-3 py-2 text-[12px]',
                    'text-[var(--foreground)] transition-colors',
                    'hover:border-[var(--docs-accent)] hover:text-[var(--brand-primary)]',
                  )}
                  style={{ borderColor: 'var(--docs-cream-3)' }}
                >
                  <span className="inline-flex items-center gap-2">
                    <Download className="h-3.5 w-3.5" aria-hidden />
                    <span>{variant.label}</span>
                  </span>
                  <span
                    aria-hidden
                    dir="ltr"
                    className="rounded-sm px-1 py-px text-[9px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]"
                    style={{
                      background: 'var(--docs-cream-2)',
                      fontFamily: 'var(--font-docs-mono)',
                    }}
                  >
                    .md
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt
        className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted-foreground)]"
        style={{ fontFamily: 'var(--font-docs-mono)' }}
      >
        {label}
      </dt>
      <dd className="text-end text-[var(--foreground)]">{value}</dd>
    </div>
  );
}
