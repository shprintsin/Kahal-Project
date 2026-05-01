'use client';

import { useEffect, useState, type RefObject } from 'react';

/** Scroll-spy: returns the slug of the chapter section currently nearest the
 *  top of the canvas, observed via IntersectionObserver on
 *  `[data-chapter-slug]` sections. */
export function useActiveChapter(
  containerRef: RefObject<HTMLElement | null>,
  chapterSlugs: string[],
): string | null {
  const [activeSlug, setActiveSlug] = useState<string | null>(
    chapterSlugs[0] ?? null,
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const sections = Array.from(
      container.querySelectorAll<HTMLElement>('[data-chapter-slug]'),
    );
    if (sections.length === 0) return;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const slug = (e.target as HTMLElement).dataset.chapterSlug;
          if (!slug) continue;
          if (e.isIntersecting) {
            visible.set(slug, e.intersectionRatio);
          } else {
            visible.delete(slug);
          }
        }
        let best: string | null = null;
        let bestRatio = -1;
        for (const [slug, ratio] of visible) {
          if (ratio > bestRatio) {
            best = slug;
            bestRatio = ratio;
          }
        }
        if (best) setActiveSlug(best);
      },
      {
        root: container,
        // Trigger when the section enters the top quarter of the canvas.
        rootMargin: '0px 0px -75% 0px',
        threshold: [0, 0.1, 0.5, 1],
      },
    );

    for (const s of sections) observer.observe(s);
    return () => observer.disconnect();
  }, [containerRef, chapterSlugs]);

  return activeSlug;
}
