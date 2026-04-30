'use client';

import {
  DocHighlight,
  HIGHLIGHTS_CHANGED_EVENT,
  HIGHLIGHTS_LEGACY_KEY,
  HighlightsChangedDetail,
  highlightsKey,
} from './types';

/** Tracks whether we've already attempted the legacy-key migration this
 *  session. It's cheap but only worth doing once per page load. */
let legacyMigrated = false;

function readPerSlug(slug: string): DocHighlight[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(highlightsKey(slug));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DocHighlight[]) : [];
  } catch {
    return [];
  }
}

/** Migrate the old monolithic blob (`docs-v2:highlights:v1`) into per-slug keys.
 *  After migration, deletes the legacy key. Idempotent and safe to run on every
 *  load, but we guard with a module-level flag so it only runs once per session. */
function migrateLegacyIfPresent(): void {
  if (legacyMigrated || typeof window === 'undefined') return;
  legacyMigrated = true;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(HIGHLIGHTS_LEGACY_KEY);
  } catch {
    return;
  }
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      window.localStorage.removeItem(HIGHLIGHTS_LEGACY_KEY);
      return;
    }
    const grouped = new Map<string, DocHighlight[]>();
    for (const h of parsed as DocHighlight[]) {
      if (!h || typeof h !== 'object' || typeof h.slug !== 'string') continue;
      const list = grouped.get(h.slug) ?? [];
      list.push(h);
      grouped.set(h.slug, list);
    }
    for (const [slug, list] of grouped) {
      // Don't clobber per-slug data that's already been written this session.
      const existingRaw = window.localStorage.getItem(highlightsKey(slug));
      if (existingRaw) continue;
      window.localStorage.setItem(highlightsKey(slug), JSON.stringify(list));
    }
    window.localStorage.removeItem(HIGHLIGHTS_LEGACY_KEY);
  } catch {
    // Corrupt JSON in the legacy blob — drop it.
    try {
      window.localStorage.removeItem(HIGHLIGHTS_LEGACY_KEY);
    } catch {
      /* noop */
    }
  }
}

/** Read the highlights for a single document. SSR-safe (returns []).
 *  Triggers the legacy-key migration on the first call per session. */
export function loadHighlightsForSlug(slug: string): DocHighlight[] {
  if (typeof window === 'undefined') return [];
  migrateLegacyIfPresent();
  return readPerSlug(slug);
}

/** Persist a single document's highlights. */
export function saveHighlightsForSlug(slug: string, highlights: DocHighlight[]): void {
  if (typeof window === 'undefined') return;
  try {
    if (highlights.length === 0) {
      window.localStorage.removeItem(highlightsKey(slug));
    } else {
      window.localStorage.setItem(highlightsKey(slug), JSON.stringify(highlights));
    }
    const detail: HighlightsChangedDetail = { slug, highlights };
    window.dispatchEvent(new CustomEvent(HIGHLIGHTS_CHANGED_EVENT, { detail }));
  } catch {
    // Quota exceeded or storage disabled — silently drop. The in-memory state
    // remains correct for the current session.
  }
}
