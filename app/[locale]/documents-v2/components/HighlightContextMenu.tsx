'use client';

import React, { useCallback, useRef, useState } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Copy, Highlighter, NotebookPen, Trash2 } from 'lucide-react';
import type { DocHighlight } from '../lib/highlights/types';

interface HighlightContextMenuProps {
  /** The reader article — selection must be inside this element. */
  containerRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  /** Hit-test a point against the existing highlights (for "Remove" mode). */
  findHighlightAtPoint: (x: number, y: number) => DocHighlight | null;
  onAddFromSelection: (selection: Selection | null) => DocHighlight | null;
  onRemove: (id: string) => void;
  /** Called with the highlight to focus its inline note editor in NotesPanel. */
  onRequestNote: (id: string) => void;
  labels: {
    highlight: string;
    remove: string;
    addNote: string;
    copy: string;
  };
}

type MenuMode =
  | { kind: 'selection'; text: string }
  | { kind: 'highlight'; highlight: DocHighlight }
  | { kind: 'none' };

/**
 * Wraps the article in a Radix context menu (via shadcn). The menu items are
 * decided at right-click time by inspecting the live selection + the click
 * coordinates: a non-empty selection becomes "Highlight selection"; a click
 * on top of an existing user highlight becomes "Remove" / "Add note". When
 * neither applies, the popover is suppressed and the browser's native menu
 * shows instead.
 */
export function HighlightContextMenu({
  containerRef,
  children,
  findHighlightAtPoint,
  onAddFromSelection,
  onRemove,
  onRequestNote,
  labels,
}: HighlightContextMenuProps) {
  // The ref is read inside `onOpenChange` (bubble phase), so it must be set
  // by the time Radix decides to open. We update it during the capture phase
  // of the same contextmenu event, which always runs first.
  const modeRef = useRef<MenuMode>({ kind: 'none' });
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<MenuMode>({ kind: 'none' });

  const handleContextMenuCapture = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const container = containerRef.current;
      let next: MenuMode = { kind: 'none' };
      if (container) {
        const overHighlight = findHighlightAtPoint(e.clientX, e.clientY);
        if (overHighlight) {
          next = { kind: 'highlight', highlight: overHighlight };
        } else {
          const selection = window.getSelection();
          if (
            selection &&
            selection.rangeCount > 0 &&
            !selection.isCollapsed &&
            container.contains(selection.anchorNode) &&
            container.contains(selection.focusNode)
          ) {
            const text = selection.toString().trim();
            if (text.length > 0) next = { kind: 'selection', text };
          }
        }
      }
      modeRef.current = next;
      setMode(next);
      // When there's nothing to offer, prevent Radix from opening at all by
      // letting the native context menu show instead of stopping the event.
      if (next.kind === 'none') {
        // Don't preventDefault — let the OS menu come up. Radix's open will
        // still fire via onOpenChange, but our suppressor below blocks it.
      }
    },
    [containerRef, findHighlightAtPoint],
  );

  const handleOpenChange = useCallback((next: boolean) => {
    if (next && modeRef.current.kind === 'none') {
      // Suppress: Radix wanted to open, but we have nothing to show.
      return;
    }
    setOpen(next);
  }, []);

  const handleHighlight = useCallback(() => {
    onAddFromSelection(window.getSelection());
    setOpen(false);
  }, [onAddFromSelection]);

  const handleRemove = useCallback(() => {
    if (mode.kind === 'highlight') onRemove(mode.highlight.id);
    setOpen(false);
  }, [mode, onRemove]);

  const handleAddNote = useCallback(() => {
    if (mode.kind === 'highlight') onRequestNote(mode.highlight.id);
    setOpen(false);
  }, [mode, onRequestNote]);

  const handleCopy = useCallback(() => {
    const text =
      mode.kind === 'selection'
        ? mode.text
        : mode.kind === 'highlight'
          ? mode.highlight.text
          : '';
    if (text && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setOpen(false);
  }, [mode]);

  return (
    <ContextMenu open={open} onOpenChange={handleOpenChange}>
      <ContextMenuTrigger asChild onContextMenuCapture={handleContextMenuCapture}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {mode.kind === 'selection' ? (
          <>
            <ContextMenuItem onSelect={handleHighlight}>
              <Highlighter className="h-4 w-4" />
              {labels.highlight}
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onSelect={handleCopy}>
              <Copy className="h-4 w-4" />
              {labels.copy}
            </ContextMenuItem>
          </>
        ) : mode.kind === 'highlight' ? (
          <>
            <ContextMenuItem onSelect={handleAddNote}>
              <NotebookPen className="h-4 w-4" />
              {labels.addNote}
            </ContextMenuItem>
            <ContextMenuItem onSelect={handleCopy}>
              <Copy className="h-4 w-4" />
              {labels.copy}
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onSelect={handleRemove} variant="destructive">
              <Trash2 className="h-4 w-4" />
              {labels.remove}
            </ContextMenuItem>
          </>
        ) : null}
      </ContextMenuContent>
    </ContextMenu>
  );
}
