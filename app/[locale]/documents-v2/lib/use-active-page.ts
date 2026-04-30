'use client';

import { useEffect, useRef, useState } from 'react';
import { PageMarker } from '@/types/document-v2';

interface UseActivePageResult {
  /** 1-based source-order index of the marker nearest the viewport center, or 0 before any marker is observed. */
  activePageNumber: number;
  /** Filename declared on that marker (may repeat across the document). */
  activeFilename: string | null;
  activeImageUrl: string | null;
}

export function useActivePage(
  containerRef: React.RefObject<HTMLElement | null>,
  markers: PageMarker[],
): UseActivePageResult {
  const initial = markers[0]?.pageNumber ?? 0;
  const [activePage, setActivePage] = useState<number>(initial);
  const lastActiveRef = useRef<number>(initial);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || markers.length === 0) return;

    let observer: IntersectionObserver | null = null;
    let cancelled = false;
    const visible = new Set<HTMLElement>();
    let rafId: number | null = null;

    const recompute = () => {
      rafId = null;
      if (visible.size === 0) return;
      const centerY = window.innerHeight / 2;
      let best: { page: number; dist: number } | null = null;
      for (const el of visible) {
        const idxAttr = el.getAttribute('data-page-index');
        if (!idxAttr) continue;
        const page = Number(idxAttr);
        if (!Number.isFinite(page)) continue;
        const r = el.getBoundingClientRect();
        const dist = Math.abs(r.top - centerY);
        if (!best || dist < best.dist) best = { page, dist };
      }
      if (best && best.page !== lastActiveRef.current) {
        lastActiveRef.current = best.page;
        setActivePage(best.page);
      }
    };

    const attach = () => {
      if (cancelled) return;
      const tripwires = Array.from(
        container.querySelectorAll<HTMLElement>('[data-page-index]'),
      );
      if (tripwires.length === 0) {
        requestAnimationFrame(attach);
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const el = entry.target as HTMLElement;
            if (entry.isIntersecting) visible.add(el);
            else visible.delete(el);
          }
          if (rafId === null) rafId = requestAnimationFrame(recompute);
        },
        {
          root: null,
          rootMargin: '-45% 0px -45% 0px',
          threshold: 0,
        },
      );
      tripwires.forEach((el) => observer!.observe(el));
    };

    attach();
    return () => {
      cancelled = true;
      observer?.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [containerRef, markers]);

  const marker = markers.find((m) => m.pageNumber === activePage) ?? markers[0] ?? null;
  return {
    activePageNumber: activePage,
    activeFilename: marker?.filename ?? null,
    activeImageUrl: marker?.imageUrl ?? null,
  };
}
