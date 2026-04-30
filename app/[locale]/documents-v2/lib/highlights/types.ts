import type { DocumentV2Locale } from '@/types/document-v2';

/** Per-slug localStorage key prefix. The active doc reads/writes a single key. */
export const HIGHLIGHTS_KEY_PREFIX = 'docs-v2:highlights:v1:';

/** Legacy single-key storage we migrate away from on first read. */
export const HIGHLIGHTS_LEGACY_KEY = 'docs-v2:highlights:v1';

/** Browser custom-event name for cross-tab same-browser sync. */
export const HIGHLIGHTS_CHANGED_EVENT = 'docs-v2:highlights:changed';

/** Shape of the `CustomEvent` detail dispatched when a doc's highlights mutate. */
export interface HighlightsChangedDetail {
  slug: string;
  highlights: DocHighlight[];
}

/** Identifier for the CSS Custom Highlight set we register user highlights into. */
export const HIGHLIGHT_NAME = 'docUserHighlight';

export interface DocHighlight {
  id: string;
  slug: string;
  lang: DocumentV2Locale;
  /** Inclusive flat-text offset in the article container's filtered text walk. */
  start: number;
  /** Exclusive flat-text offset. */
  end: number;
  /** Captured selected text — sanity check at restore time, snippet in the
   *  Notes panel. */
  text: string;
  /** Active page when the highlight was created. */
  page: number;
  /** Future palette hook; v1 ships a single colour. */
  color: 'yellow';
  /** Optional free-text note attached to the highlight. */
  note?: string;
  /** ISO timestamp of creation. */
  createdAt: string;
}

export function highlightsKey(slug: string): string {
  return `${HIGHLIGHTS_KEY_PREFIX}${slug}`;
}
