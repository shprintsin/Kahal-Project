export const DOCUMENT_V2_LOCALES = ['he', 'en', 'pl', 'yi', 'ru'] as const;
export type DocumentV2Locale = (typeof DOCUMENT_V2_LOCALES)[number];

/** I18n maps for short metadata fields. The `source` slot carries the
 *  original-language string (e.g. the Polish title from the source archive)
 *  so we can display it next to the curated en/he versions. */
export type I18nString = Partial<Record<DocumentV2Locale | 'source', string>>;

export interface DocumentMeta {
  id: string;
  fileId: string | null;
  slug: string;
  sourceLang: DocumentV2Locale;
  nameI18n: I18nString;
  excerptI18n?: I18nString;
  citation?: string;
  url?: string;
  dateStart?: string;
  dateEnd?: string;
  tocModel?: string;
  translateModel?: string;
  status: 'draft' | 'published' | 'archived';
  chapterCount: number;
  updatedAt: string;
}

/** Library-listing variant — surfaces the set of languages the document has
 *  *any* chapter content for (source + every translation lang seen). Used for
 *  language-availability chips on `LibraryRail` cards without a second fetch. */
export interface DocumentLibraryMeta extends DocumentMeta {
  availableLangs: DocumentV2Locale[];
}

export interface ChapterMeta {
  id: string;
  slug: string;
  index: number;
  titleI18n: I18nString;
  excerptI18n?: I18nString;
  date?: string;
  mentionJews: boolean;
}

export interface ChapterFull extends ChapterMeta {
  /** Source-language body. `@@@ File: X @@@` markers are preserved as inline
   *  scan-page anchors and rendered by `rehype-page-markers`. */
  text: string;
  /** Body translations keyed by locale (excluding the document's `sourceLang`,
   *  whose body lives in `text`). */
  translations: Partial<Record<DocumentV2Locale, string>>;
}

export interface ParsedDocument {
  meta: DocumentMeta;
  chapters: ChapterFull[];
}

export function resolveI18nString(
  value: I18nString | undefined,
  locale: DocumentV2Locale,
  fallback: DocumentV2Locale,
): string {
  if (!value) return '';
  return value[locale] ?? value[fallback] ?? value.source ?? Object.values(value).find(Boolean) ?? '';
}

/** Stable DOM id for an inline scan-page marker. Matches the rehype plugin. */
export function markerDomId(filename: string, occurrence: number): string {
  const stem = filename.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-');
  return `tripwire-${occurrence}-${stem}`;
}

/** Stable DOM id for a chapter section in the reader. */
export function chapterDomId(slug: string): string {
  return `chapter-${slug.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}

export function isLocale(value: unknown): value is DocumentV2Locale {
  return typeof value === 'string' && (DOCUMENT_V2_LOCALES as readonly string[]).includes(value);
}
