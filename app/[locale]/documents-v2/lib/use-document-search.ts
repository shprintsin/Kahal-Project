'use client';

import { useCallback, useEffect, useState, type RefObject } from 'react';

export interface SearchMatch {
  node: Text;
  start: number;
  end: number;
}

interface UseDocumentSearchResult {
  matches: SearchMatch[];
  activeIndex: number;
  next: () => void;
  prev: () => void;
}

const HIGHLIGHT_NAME = 'docSearch';
const HIGHLIGHT_ACTIVE_NAME = 'docSearchActive';

function normalizeWithMap(s: string): { normalized: string; map: number[] } {
  let normalized = '';
  const map: number[] = [];
  for (let i = 0; i < s.length; i++) {
    const norm = s[i].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    for (let j = 0; j < norm.length; j++) {
      normalized += norm[j];
      map.push(i);
    }
  }
  map.push(s.length);
  return { normalized, map };
}

function normalizeQuery(q: string): string {
  return q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

export function useDocumentSearch(
  containerRef: RefObject<HTMLElement | null>,
  query: string,
  contentVersion: unknown,
): UseDocumentSearchResult {
  const [state, setState] = useState<{ matches: SearchMatch[]; activeIndex: number }>({
    matches: [],
    activeIndex: 0,
  });
  const { matches, activeIndex } = state;

  useEffect(() => {
    const container = containerRef.current;
    const q = normalizeQuery(query);
    if (!container || !q) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ matches: [], activeIndex: 0 });
      return;
    }

    const found: SearchMatch[] = [];
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => {
        const parent = (n as Text).parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest('.page-marker')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const text = (node as Text).nodeValue ?? '';
      if (!text) continue;
      const { normalized, map } = normalizeWithMap(text);
      let start = 0;
      while (start <= normalized.length) {
        const idx = normalized.indexOf(q, start);
        if (idx === -1) break;
        const origStart = map[idx] ?? 0;
        const origEnd = map[idx + q.length] ?? text.length;
        if (origEnd > origStart) {
          found.push({ node: node as Text, start: origStart, end: origEnd });
        }
        start = idx + q.length;
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ matches: found, activeIndex: 0 });
  }, [containerRef, query, contentVersion]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const css = CSS as unknown as {
      highlights?: Map<string, Highlight>;
    };
    if (!css.highlights || typeof Highlight === 'undefined') return;

    if (matches.length === 0) {
      css.highlights.delete(HIGHLIGHT_NAME);
      css.highlights.delete(HIGHLIGHT_ACTIVE_NAME);
      return;
    }

    const passive: Range[] = [];
    let active: Range | null = null;
    matches.forEach((m, i) => {
      try {
        const r = document.createRange();
        r.setStart(m.node, m.start);
        r.setEnd(m.node, m.end);
        if (i === activeIndex) active = r;
        else passive.push(r);
      } catch {
        // node might have been unmounted between effect runs; ignore
      }
    });
    css.highlights.set(HIGHLIGHT_NAME, new Highlight(...passive));
    if (active) css.highlights.set(HIGHLIGHT_ACTIVE_NAME, new Highlight(active));
    else css.highlights.delete(HIGHLIGHT_ACTIVE_NAME);

    return () => {
      // keep highlights mounted; cleared by guards above on next change
    };
  }, [matches, activeIndex]);

  // Scroll the active match into view
  useEffect(() => {
    if (matches.length === 0) return;
    const m = matches[activeIndex];
    if (!m) return;
    const container = containerRef.current;
    if (!container) return;
    try {
      const range = document.createRange();
      range.setStart(m.node, m.start);
      range.setEnd(m.node, m.end);
      const rect = range.getBoundingClientRect();
      const cRect = container.getBoundingClientRect();
      if (rect.top < cRect.top + 80 || rect.bottom > cRect.bottom - 80) {
        const top =
          container.scrollTop + (rect.top - cRect.top) - cRect.height / 2 + rect.height / 2;
        container.scrollTo({ top, behavior: 'smooth' });
      }
    } catch {
      // ignore
    }
  }, [activeIndex, matches, containerRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const css = CSS as unknown as { highlights?: Map<string, Highlight> };
      css.highlights?.delete(HIGHLIGHT_NAME);
      css.highlights?.delete(HIGHLIGHT_ACTIVE_NAME);
    };
  }, []);

  const next = useCallback(() => {
    setState((s) =>
      s.matches.length === 0
        ? s
        : { ...s, activeIndex: (s.activeIndex + 1) % s.matches.length },
    );
  }, []);

  const prev = useCallback(() => {
    setState((s) =>
      s.matches.length === 0
        ? s
        : {
            ...s,
            activeIndex: (s.activeIndex - 1 + s.matches.length) % s.matches.length,
          },
    );
  }, []);

  return { matches, activeIndex, next, prev };
}
