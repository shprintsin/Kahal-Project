'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import type { DocumentV2Locale } from '@/types/document-v2';
import { getIndex, offsetsToRange, rangeToOffsets } from './anchor';
import { loadHighlightsForSlug, saveHighlightsForSlug } from './storage';
import {
  DocHighlight,
  HIGHLIGHTS_CHANGED_EVENT,
  HIGHLIGHT_NAME,
  HighlightsChangedDetail,
} from './types';

interface UseHighlightsArgs {
  slug: string;
  lang: DocumentV2Locale;
  containerRef: RefObject<HTMLElement | null>;
  /** Bumped when the rendered article content changes (e.g. lang switch). */
  contentVersion: unknown;
  /** Page number that should be attached to a freshly-created highlight. */
  currentPage: number;
}

export interface UseHighlightsResult {
  highlights: DocHighlight[];
  addFromSelection: (selection: Selection | null) => DocHighlight | null;
  remove: (id: string) => void;
  setNote: (id: string, note: string) => void;
  rangesById: Map<string, Range>;
  scrollToHighlight: (id: string) => void;
  findHighlightAtPoint: (clientX: number, clientY: number) => DocHighlight | null;
}

const NOTE_DEBOUNCE_MS = 200;

/**
 * Local-state hook for the active document's highlights. One owner:
 * `DocumentReader`. Performance shape:
 *
 * - Hydrates from `localStorage` keyed by slug only (per-slug storage layout).
 * - Builds the article's flat-text index once per content version, cached in
 *   `anchor.ts`'s `WeakMap`. Range conversions are O(log M).
 * - Rebuild effect diffs against a `Map<id, Range>` ref so unchanged
 *   highlights reuse their existing `Range` objects; only added or
 *   structurally-mutated highlights pay the rebuild cost.
 * - Note edits debounce the `localStorage` write so typing doesn't block.
 * - `findHighlightAtPoint` y-culls before the precise per-line hit-test.
 */
export function useHighlights({
  slug,
  lang,
  containerRef,
  contentVersion,
  currentPage,
}: UseHighlightsArgs): UseHighlightsResult {
  // Active doc's highlights only — per-slug storage means the rest of the
  // library never enters this hook's memory or write path.
  const [docHighlights, setDocHighlights] = useState<DocHighlight[]>([]);
  // Keep a ref synced with state so callbacks don't need it in their dep arrays
  // (avoids recreating addFromSelection on every render after a mutation).
  const docHighlightsRef = useRef<DocHighlight[]>([]);
  docHighlightsRef.current = docHighlights;

  // Range cache survives renders; the rebuild effect mutates this Map in place
  // and exposes a snapshot via state so consumers (Notes panel, hit-test) see
  // the current ranges without forcing a deep re-render.
  const rangesRef = useRef<Map<string, Range>>(new Map());
  const fingerprintsRef = useRef<Map<string, string>>(new Map());
  const [rangesById, setRangesById] = useState<Map<string, Range>>(new Map());

  // Hydrate when the slug changes (or on first mount).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDocHighlights(loadHighlightsForSlug(slug));
    const onChanged = (e: Event) => {
      const detail = (e as CustomEvent<HighlightsChangedDetail>).detail;
      if (detail?.slug === slug) setDocHighlights(detail.highlights);
    };
    window.addEventListener(HIGHLIGHTS_CHANGED_EVENT, onChanged);
    return () => window.removeEventListener(HIGHLIGHTS_CHANGED_EVENT, onChanged);
  }, [slug]);

  // Filter to active language + sort. Cheap.
  const highlights = useMemo(
    () =>
      docHighlights
        .filter((h) => h.lang === lang)
        .sort((a, b) => a.page - b.page || a.start - b.start),
    [docHighlights, lang],
  );

  // Diff-based rebuild: only build new ranges for highlights whose
  // (start, end, contentVersion) fingerprint changed. Note-only edits skip
  // the rebuild entirely because their start/end are unchanged.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const css = CSS as unknown as { highlights?: Map<string, Highlight> };
    if (!css.highlights || typeof Highlight === 'undefined') return;
    const container = containerRef.current;

    if (!container || highlights.length === 0) {
      css.highlights.delete(HIGHLIGHT_NAME);
      rangesRef.current = new Map();
      fingerprintsRef.current = new Map();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRangesById(new Map());
      return;
    }

    const idx = getIndex(container, contentVersion);
    const next = new Map<string, Range>();
    const nextFp = new Map<string, string>();
    for (const h of highlights) {
      const fp = `${h.start}-${h.end}-${String(contentVersion)}`;
      const prev = rangesRef.current.get(h.id);
      const prevFp = fingerprintsRef.current.get(h.id);
      if (prev && prevFp === fp) {
        next.set(h.id, prev);
        nextFp.set(h.id, fp);
        continue;
      }
      const range = offsetsToRange(container, h.start, h.end, idx);
      if (!range) continue;
      // Sanity check — drop silently if the captured text drifted.
      const live = range.toString();
      if (live && h.text && live.replace(/\s+/g, '') !== h.text.replace(/\s+/g, '')) {
        continue;
      }
      next.set(h.id, range);
      nextFp.set(h.id, fp);
    }
    rangesRef.current = next;
    fingerprintsRef.current = nextFp;
    if (next.size === 0) {
      css.highlights.delete(HIGHLIGHT_NAME);
    } else {
      css.highlights.set(HIGHLIGHT_NAME, new Highlight(...next.values()));
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRangesById(new Map(next));
  }, [highlights, containerRef, contentVersion]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      const css = CSS as unknown as { highlights?: Map<string, Highlight> };
      css.highlights?.delete(HIGHLIGHT_NAME);
    };
  }, []);

  // Debounced write timer for note edits.
  const noteWriteTimerRef = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (noteWriteTimerRef.current !== null) {
        window.clearTimeout(noteWriteTimerRef.current);
      }
    };
  }, []);

  /** Update in-memory state and (eventually) localStorage. The write is
   *  immediate by default; notes pass `debounce=true` to coalesce keystroke
   *  bursts into a single 200 ms write. */
  const persist = useCallback(
    (next: DocHighlight[], debounce: boolean) => {
      setDocHighlights(next);
      docHighlightsRef.current = next;
      if (!debounce) {
        if (noteWriteTimerRef.current !== null) {
          window.clearTimeout(noteWriteTimerRef.current);
          noteWriteTimerRef.current = null;
        }
        saveHighlightsForSlug(slug, next);
        return;
      }
      if (noteWriteTimerRef.current !== null) {
        window.clearTimeout(noteWriteTimerRef.current);
      }
      noteWriteTimerRef.current = window.setTimeout(() => {
        noteWriteTimerRef.current = null;
        saveHighlightsForSlug(slug, docHighlightsRef.current);
      }, NOTE_DEBOUNCE_MS);
    },
    [slug],
  );

  const addFromSelection = useCallback(
    (selection: Selection | null): DocHighlight | null => {
      const container = containerRef.current;
      if (!container || !selection || selection.rangeCount === 0) return null;
      const range = selection.getRangeAt(0);
      if (range.collapsed) return null;
      const idx = getIndex(container, contentVersion);
      const offsets = rangeToOffsets(container, range, idx);
      if (!offsets) return null;
      const text = selection.toString().trim();
      if (!text) return null;
      const newHighlight: DocHighlight = {
        id:
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `h_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        slug,
        lang,
        start: offsets.start,
        end: offsets.end,
        text,
        page: currentPage,
        color: 'yellow',
        createdAt: new Date().toISOString(),
      };
      persist([...docHighlightsRef.current, newHighlight], false);
      // Clear the user's selection so the new yellow highlight isn't masked
      // by the OS selection colour.
      selection.removeAllRanges();
      return newHighlight;
    },
    [containerRef, contentVersion, currentPage, lang, persist, slug],
  );

  const remove = useCallback(
    (id: string) => {
      persist(
        docHighlightsRef.current.filter((h) => h.id !== id),
        false,
      );
    },
    [persist],
  );

  const setNote = useCallback(
    (id: string, note: string) => {
      const trimmed = note.trim();
      persist(
        docHighlightsRef.current.map((h) =>
          h.id === id ? { ...h, note: trimmed.length > 0 ? trimmed : undefined } : h,
        ),
        true,
      );
    },
    [persist],
  );

  const scrollToHighlight = useCallback(
    (id: string) => {
      const container = containerRef.current;
      const range = rangesRef.current.get(id);
      if (!container || !range) return;
      try {
        const rect = range.getBoundingClientRect();
        const cRect = container.getBoundingClientRect();
        const top =
          container.scrollTop + (rect.top - cRect.top) - cRect.height / 2 + rect.height / 2;
        container.scrollTo({ top, behavior: 'smooth' });
      } catch {
        // Range disconnected mid-scroll — nothing to do.
      }
    },
    [containerRef],
  );

  const findHighlightAtPoint = useCallback(
    (clientX: number, clientY: number): DocHighlight | null => {
      const container = containerRef.current;
      if (container) {
        const cRect = container.getBoundingClientRect();
        if (clientY < cRect.top || clientY > cRect.bottom) return null;
      }
      // Iterate the active subset only — `rangesRef` matches `highlights`
      // because they're rebuilt together. A coarse y-cull via
      // `getBoundingClientRect` keeps off-screen highlights cheap.
      for (const h of highlights) {
        const range = rangesRef.current.get(h.id);
        if (!range) continue;
        const box = range.getBoundingClientRect();
        if (box.bottom < clientY - 4 || box.top > clientY + 4) continue;
        const rects = range.getClientRects();
        for (const rect of Array.from(rects)) {
          if (
            clientX >= rect.left &&
            clientX <= rect.right &&
            clientY >= rect.top &&
            clientY <= rect.bottom
          ) {
            return h;
          }
        }
      }
      return null;
    },
    [containerRef, highlights],
  );

  return useMemo(
    () => ({
      highlights,
      addFromSelection,
      remove,
      setNote,
      rangesById,
      scrollToHighlight,
      findHighlightAtPoint,
    }),
    [
      highlights,
      addFromSelection,
      remove,
      setNote,
      rangesById,
      scrollToHighlight,
      findHighlightAtPoint,
    ],
  );
}
