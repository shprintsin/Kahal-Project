'use client';

import React, { useEffect, useRef, useState } from 'react';
import { NotebookPen, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DocHighlight } from '../lib/highlights/types';

interface NotesPanelProps {
  highlights: DocHighlight[];
  emptyText: string;
  /** ID requested for inline note editing (from the context menu's
   *  "Add note" action). When set, that card auto-focuses its textarea. */
  noteEditingId: string | null;
  onClearNoteEditing: () => void;
  onJumpTo: (id: string) => void;
  onRemove: (id: string) => void;
  onSetNote: (id: string, note: string) => void;
  labels: {
    highlightLabel: string;
    noteLabel: string;
    pagePrefix: (n: number) => string;
    notePlaceholder: string;
    addNote: string;
    remove: string;
  };
}

export function NotesPanel({
  highlights,
  emptyText,
  noteEditingId,
  onClearNoteEditing,
  onJumpTo,
  onRemove,
  onSetNote,
  labels,
}: NotesPanelProps) {
  if (highlights.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-10 text-center">
        <p
          className="text-[12px] italic text-[var(--muted-foreground)]"
          style={{ fontFamily: 'var(--font-frl)' }}
        >
          {emptyText}
        </p>
      </div>
    );
  }
  return (
    <div className="docs-scroll-y min-h-0 flex-1 px-3 py-3">
      <ul className="flex flex-col gap-2">
        {highlights.map((h) => (
          <NoteCard
            key={h.id}
            highlight={h}
            isEditing={noteEditingId === h.id}
            onDoneEditing={onClearNoteEditing}
            onJumpTo={() => onJumpTo(h.id)}
            onRemove={() => onRemove(h.id)}
            onSetNote={(note) => onSetNote(h.id, note)}
            labels={labels}
          />
        ))}
      </ul>
    </div>
  );
}

function NoteCard({
  highlight,
  isEditing,
  onDoneEditing,
  onJumpTo,
  onRemove,
  onSetNote,
  labels,
}: {
  highlight: DocHighlight;
  isEditing: boolean;
  onDoneEditing: () => void;
  onJumpTo: () => void;
  onRemove: () => void;
  onSetNote: (note: string) => void;
  labels: NotesPanelProps['labels'];
}) {
  const [draft, setDraft] = useState(highlight.note ?? '');
  const [editing, setEditing] = useState(isEditing);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Sync external "please open the editor for this card" requests — fired
  // by the canvas's context menu's "Add note" item via DocumentReader.
  useEffect(() => {
    if (isEditing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditing(true);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft(highlight.note ?? '');
    }
  }, [isEditing, highlight.note]);

  useEffect(() => {
    if (editing) taRef.current?.focus();
  }, [editing]);

  const commit = () => {
    if (draft !== (highlight.note ?? '')) onSetNote(draft);
    setEditing(false);
    onDoneEditing();
  };

  return (
    <li
      className="group border bg-[var(--docs-paper)]"
      style={{ borderColor: 'var(--docs-cream-3)' }}
    >
      <div className="flex items-center justify-between px-3 pt-2.5">
        <span
          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-[var(--docs-accent)]"
          style={{ fontFamily: 'var(--font-docs-mono)' }}
        >
          <span aria-hidden>⏐</span>
          {highlight.note ? labels.noteLabel : labels.highlightLabel}
        </span>
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]"
            style={{ fontFamily: 'var(--font-docs-mono)' }}
          >
            {labels.pagePrefix(highlight.page)}
          </span>
          <button
            type="button"
            aria-label={labels.remove}
            title={labels.remove}
            onClick={onRemove}
            className={cn(
              'opacity-0 transition-opacity group-hover:opacity-100',
              'inline-flex h-5 w-5 items-center justify-center text-[var(--muted-foreground)] hover:text-[#a73a3a]',
            )}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onJumpTo}
        className="block w-full px-3 py-2 text-start"
        style={{ fontFamily: 'var(--font-frl)' }}
      >
        <span
          className="inline px-1 py-px text-[12px] leading-snug text-[var(--foreground)]"
          style={{ background: '#ede4b8' }}
        >
          &ldquo;{highlight.text}&rdquo;
        </span>
      </button>

      <div className="px-3 pb-2.5">
        {editing ? (
          <textarea
            ref={taRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setDraft(highlight.note ?? '');
                setEditing(false);
                onDoneEditing();
              }
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                commit();
              }
            }}
            placeholder={labels.notePlaceholder}
            className={cn(
              'min-h-[44px] w-full resize-y border bg-transparent px-2 py-1 text-[12px] leading-snug',
              'focus:outline-none focus:ring-1 focus:ring-[var(--docs-accent)]',
            )}
            style={{
              borderColor: 'var(--docs-cream-3)',
              fontFamily: 'var(--font-frl)',
            }}
            rows={2}
          />
        ) : highlight.note ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="block w-full text-start text-[13px] italic leading-snug text-[var(--brand-primary)]"
            style={{ fontFamily: 'var(--font-frl)' }}
          >
            → {highlight.note}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)] hover:text-[var(--brand-primary)]"
            style={{ fontFamily: 'var(--font-docs-mono)' }}
          >
            <NotebookPen className="h-3 w-3" />
            {labels.addNote}
          </button>
        )}
      </div>
    </li>
  );
}
