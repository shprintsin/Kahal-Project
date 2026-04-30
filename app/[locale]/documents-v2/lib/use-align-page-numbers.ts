'use client';

import { useEffect, type RefObject } from 'react';

const BLOCK_TAGS = new Set([
  'P',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'TABLE',
  'UL',
  'OL',
  'BLOCKQUOTE',
  'FIGURE',
  'PRE',
  'DIV',
]);

function firstBlockAfter(
  ref: HTMLElement,
  candidates: HTMLElement[],
): HTMLElement | null {
  for (const c of candidates) {
    if (ref.contains(c) || c.contains(ref)) continue;
    const pos = ref.compareDocumentPosition(c);
    if (!(pos & Node.DOCUMENT_POSITION_FOLLOWING)) continue;
    if (c.offsetHeight === 0) continue;
    return c;
  }
  return null;
}

export function useAlignPageNumbers(
  containerRef: RefObject<HTMLElement | null>,
  contentVersion: unknown,
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const article = container.querySelector<HTMLElement>('article');
    if (!article) return;

    let rafId: number | null = null;

    const align = () => {
      rafId = null;
      const markers = Array.from(article.querySelectorAll<HTMLElement>('.page-marker'));
      if (markers.length === 0) return;
      const candidates = Array.from(
        article.querySelectorAll<HTMLElement>(
          'p, h1, h2, h3, h4, h5, h6, table, ul, ol, blockquote, figure, pre',
        ),
      ).filter((el) => BLOCK_TAGS.has(el.tagName));
      const articleRect = article.getBoundingClientRect();
      const articleTop = articleRect.top;
      const articlePaddingTop = parseFloat(
        getComputedStyle(article).paddingTop || '0',
      );

      for (let i = 0; i < markers.length; i++) {
        const marker = markers[i];
        const num = marker.querySelector<HTMLAnchorElement>('.page-marker-num');
        if (!num) continue;
        // Marker N is the END boundary of page N. Page N's TOP = right after marker N-1
        // (or article top for the first page).
        const ref: HTMLElement | null = i === 0 ? null : markers[i - 1];
        const target = firstBlockAfter(ref ?? article, candidates);
        const top = target
          ? target.getBoundingClientRect().top - articleTop
          : articlePaddingTop;
        num.style.top = `${top}px`;
      }
    };

    const schedule = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(align);
    };

    // Initial alignment + a follow-up after fonts/images settle.
    schedule();
    const t = window.setTimeout(schedule, 250);

    const ro = new ResizeObserver(schedule);
    ro.observe(article);
    window.addEventListener('resize', schedule);

    return () => {
      window.clearTimeout(t);
      ro.disconnect();
      window.removeEventListener('resize', schedule);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, contentVersion]);
}
