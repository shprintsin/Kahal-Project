import 'server-only';
import { prisma } from '@/lib/prisma';
import {
  DOCUMENT_V2_LOCALES,
  type DocumentV2Archive,
  type DocumentV2LibraryMeta,
  type DocumentV2Locale,
  type DocumentV2Meta,
  type DocumentV2PageRender,
  type DocumentV2Scans,
  type DocumentV2Translation,
  type I18nString,
  type PageMarker,
  type ParsedDocumentV2,
  type TocEntry,
} from '@/types/document-v2';

function isLocale(value: string): value is DocumentV2Locale {
  return (DOCUMENT_V2_LOCALES as readonly string[]).includes(value);
}

function asMeta(row: {
  id: string;
  slug: string;
  primaryLang: string;
  titleI18n: unknown;
  descriptionI18n: unknown;
  year: number | null;
  archive: unknown;
  scans: unknown;
  license: string | null;
  updatedAt: Date;
}): DocumentV2Meta {
  if (!isLocale(row.primaryLang)) {
    throw new Error(`Document ${row.slug} has invalid primary_lang "${row.primaryLang}"`);
  }
  return {
    id: row.id,
    slug: row.slug,
    lang: row.primaryLang,
    title: (row.titleI18n ?? {}) as I18nString,
    description: (row.descriptionI18n ?? undefined) as I18nString | undefined,
    year: row.year ?? undefined,
    archive: (row.archive ?? undefined) as DocumentV2Archive | undefined,
    scans: (row.scans ?? undefined) as DocumentV2Scans | undefined,
    license: row.license ?? undefined,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export interface DocumentListItem {
  meta: DocumentV2LibraryMeta;
  pageCount: number;
  headingCount: number;
}

export async function getDocumentList(): Promise<DocumentListItem[]> {
  const rows = await prisma.documentV2.findMany({
    where: { status: 'published' },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      primaryLang: true,
      titleI18n: true,
      descriptionI18n: true,
      year: true,
      archive: true,
      scans: true,
      license: true,
      pageCount: true,
      headingCount: true,
      updatedAt: true,
      // Pull only the `lang` column from each translation row so the library
      // can render language-availability chips without loading markdown bodies.
      translations: { select: { lang: true } },
    },
  });
  return rows.map((r) => {
    const base = asMeta(r);
    const translationLangs = r.translations
      .map((t) => t.lang)
      .filter((l): l is DocumentV2Locale => isLocale(l));
    const availableLangs = Array.from(new Set([base.lang, ...translationLangs]));
    return {
      meta: { ...base, availableLangs },
      pageCount: r.pageCount,
      headingCount: r.headingCount,
    };
  });
}

export async function getDocumentMetas(): Promise<DocumentV2LibraryMeta[]> {
  const items = await getDocumentList();
  return items.map((i) => i.meta);
}

export async function getDocumentBySlug(slug: string): Promise<ParsedDocumentV2 | null> {
  const row = await prisma.documentV2.findUnique({
    where: { slug },
    include: {
      translations: true,
      // Pull only rows that match the doc's current_version — old versions
      // hang around briefly for rollback + drifted-anchor recovery and must
      // never reach the reader.
      pageText: {
        where: {}, // filtered in JS below; Prisma filters on numeric col are awkward
        select: {
          lang: true,
          version: true,
          pageNumber: true,
          filename: true,
          html: true,
          charStart: true,
          charEnd: true,
          contentHash: true,
          headingPath: true,
        },
      },
    },
  });
  if (!row) return null;
  if (row.status !== 'published') return null;

  const meta = asMeta(row);
  const primary = row.translations.find((t) => t.lang === row.primaryLang);
  if (!primary) {
    throw new Error(`Document ${slug} is missing its primary-language translation (${row.primaryLang}).`);
  }

  const pagesByLang = new Map<DocumentV2Locale, DocumentV2PageRender[]>();
  for (const pt of row.pageText) {
    if (pt.version !== row.currentVersion) continue;
    if (!isLocale(pt.lang)) continue;
    if (pt.html == null || pt.charStart == null || pt.charEnd == null || pt.contentHash == null) {
      // Pre-backfill row; skip — the reader's markdown fallback covers this case.
      continue;
    }
    const list = pagesByLang.get(pt.lang) ?? [];
    list.push({
      pageNumber: pt.pageNumber,
      filename: pt.filename,
      html: pt.html,
      charStart: pt.charStart,
      charEnd: pt.charEnd,
      contentHash: pt.contentHash,
      headingPath: Array.isArray(pt.headingPath) ? (pt.headingPath as string[]) : [],
    });
    pagesByLang.set(pt.lang, list);
  }
  for (const list of pagesByLang.values()) list.sort((a, b) => a.pageNumber - b.pageNumber);

  const primaryLocale = row.primaryLang as DocumentV2Locale;
  const others: DocumentV2Translation[] = row.translations
    .filter((t) => t.lang !== row.primaryLang && isLocale(t.lang))
    .map((t) => {
      const lang = t.lang as DocumentV2Locale;
      return {
        lang,
        markdown: t.markdown,
        toc: (t.toc ?? []) as unknown as TocEntry[],
        markers: (t.markers ?? []) as unknown as PageMarker[],
        pages: pagesByLang.get(lang) ?? [],
      };
    });

  return {
    meta,
    markdown: primary.markdown,
    toc: (primary.toc ?? []) as unknown as TocEntry[],
    markers: (primary.markers ?? []) as unknown as PageMarker[],
    pages: pagesByLang.get(primaryLocale) ?? [],
    translations: others,
  };
}

export async function getPublishedSlugs(): Promise<string[]> {
  const rows = await prisma.documentV2.findMany({
    where: { status: 'published' },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}
