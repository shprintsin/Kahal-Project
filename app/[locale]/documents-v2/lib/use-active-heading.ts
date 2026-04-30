'use client';

import { useEffect, useRef, useState } from 'react';
import { TocEntry } from '@/types/document-v2';

export function useActiveHeading(
  containerRef: React.RefObject<HTMLElement | null>,
  toc: TocEntry[],
): string | null {
  const [active, setActive] = useState<string | null>(toc[0]?.id ?? null);
  const lastRef = useRef<string | null>(active);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || toc.length === 0) return;

    const headings = toc
      .map((entry) => container.querySelector<HTMLElement>(`#${CSS.escape(entry.id)}`))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id && id !== lastRef.current) {
              lastRef.current = id;
              setActive(id);
            }
            return;
          }
        }
      },
      {
        root: null,
        rootMargin: '-30% 0px -65% 0px',
        threshold: 0,
      },
    );

    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [containerRef, toc]);

  return active;
}
