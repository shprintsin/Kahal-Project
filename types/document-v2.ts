export const DOCUMENT_V2_LOCALES = ['he', 'en', 'pl', 'yi', 'ru'] as const;
export type DocumentV2Locale = (typeof DOCUMENT_V2_LOCALES)[number];

export type I18nString = Partial<Record<DocumentV2Locale, string>>;

export interface DocumentV2Archive {
  name: string;
  reference?: string;
  url?: string;
}

export interface DocumentV2Scans {
  baseUrl: string;
  extension?: string;
  placeholder?: string;
}

export interface DocumentV2Frontmatter {
  slug: string;
  title: I18nString;
  description?: I18nString;
  lang: DocumentV2Locale;
  year?: number;
  archive?: DocumentV2Archive;
  scans?: DocumentV2Scans;
  license?: string;
}

export interface DocumentV2Meta extends DocumentV2Frontmatter {
  id: string;
  updatedAt: string;
}

/** Library-listing variant that carries the set of languages this document
 *  actually has content for (source + every translation row). Used to render
 *  language-availability chips on `LibraryRail` cards without a second fetch. */
export interface DocumentV2LibraryMeta extends DocumentV2Meta {
  availableLangs: DocumentV2Locale[];
}

export interface PageMarker {
  /** Source-order page number, 1-based. */
  pageNumber: number;
  /** Identifier from the `@@@ File: NAME @@@` separator (may repeat across the document). */
  filename: string;
  imageUrl: string;
  domId: string;
}

export interface TocEntry {
  id: string;
  text: string;
  level: 1 | 2 | 3;
}

/** Precomputed render artifact for a single page within a translation.
 *  The reader feeds `html` directly into `dangerouslySetInnerHTML`; the
 *  char offsets and content hash anchor highlights against the rendered DOM. */
export interface DocumentV2PageRender {
  pageNumber: number;
  filename: string;
  html: string;
  charStart: number;
  charEnd: number;
  contentHash: string;
  headingPath: string[];
}

export interface DocumentV2Translation {
  lang: DocumentV2Locale;
  markdown: string;
  toc: TocEntry[];
  markers: PageMarker[];
  /** Server-rendered per-page HTML pulled from `document_v2_page_text`. */
  pages: DocumentV2PageRender[];
}

export interface ParsedDocumentV2 {
  meta: DocumentV2Meta;
  /** Source markdown for the primary language. Kept on the wire as a fallback
   *  while the reader is mid-migration to consuming `pages` only. */
  markdown: string;
  toc: TocEntry[];
  markers: PageMarker[];
  /** Server-rendered pages for the primary language. */
  pages: DocumentV2PageRender[];
  translations: DocumentV2Translation[];
}

export function resolveI18nString(
  value: I18nString | undefined,
  locale: DocumentV2Locale,
  fallback: DocumentV2Locale,
): string {
  if (!value) return '';
  return value[locale] ?? value[fallback] ?? Object.values(value).find(Boolean) ?? '';
}

export function markerDomId(filename: string, pageNumber: number): string {
  const stem = filename.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-');
  return `tripwire-${pageNumber}-${stem}`;
}

export function resolveMarkerImageUrl(
  scans: DocumentV2Scans | undefined,
  filename: string,
): string {
  if (!scans?.baseUrl) return '';
  const base = scans.baseUrl.endsWith('/') ? scans.baseUrl : `${scans.baseUrl}/`;
  const stem = filename.replace(/\.md$/i, '');
  const ext = scans.extension ?? 'jpg';
  const cleanExt = ext.startsWith('.') ? ext.slice(1) : ext;
  return `${base}${stem}.${cleanExt}`;
}
