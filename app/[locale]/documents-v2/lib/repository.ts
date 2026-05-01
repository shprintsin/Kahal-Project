import 'server-only';
import { prisma } from '@/lib/prisma';
import {
  DOCUMENT_V2_LOCALES,
  type ChapterFull,
  type DocumentLibraryMeta,
  type DocumentMeta,
  type DocumentV2Locale,
  type I18nString,
  type ParsedDocument,
  isLocale,
} from '@/types/document-v2';

function statusLabel(s: string): DocumentMeta['status'] {
  if (s === 'published' || s === 'archived') return s;
  return 'draft';
}

function asMeta(row: {
  id: string;
  fileId: string | null;
  slug: string;
  sourceLang: string;
  nameI18n: unknown;
  excerptI18n: unknown;
  citation: string | null;
  url: string | null;
  dateStart: string | null;
  dateEnd: string | null;
  tocModel: string | null;
  translateModel: string | null;
  status: string;
  updatedAt: Date;
  _count?: { chapters: number };
}): DocumentMeta {
  if (!isLocale(row.sourceLang)) {
    throw new Error(`Document ${row.slug} has invalid source_lang "${row.sourceLang}"`);
  }
  return {
    id: row.id,
    fileId: row.fileId,
    slug: row.slug,
    sourceLang: row.sourceLang,
    nameI18n: (row.nameI18n ?? {}) as I18nString,
    excerptI18n: (row.excerptI18n ?? undefined) as I18nString | undefined,
    citation: row.citation ?? undefined,
    url: row.url ?? undefined,
    dateStart: row.dateStart ?? undefined,
    dateEnd: row.dateEnd ?? undefined,
    tocModel: row.tocModel ?? undefined,
    translateModel: row.translateModel ?? undefined,
    status: statusLabel(row.status),
    chapterCount: row._count?.chapters ?? 0,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export interface DocumentListItem {
  meta: DocumentLibraryMeta;
}

export async function getDocumentList(): Promise<DocumentListItem[]> {
  const rows = await prisma.documentV2.findMany({
    where: { status: 'published' },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      fileId: true,
      slug: true,
      sourceLang: true,
      nameI18n: true,
      excerptI18n: true,
      citation: true,
      url: true,
      dateStart: true,
      dateEnd: true,
      tocModel: true,
      translateModel: true,
      status: true,
      updatedAt: true,
      _count: { select: { chapters: true } },
      // Pull just the langs available across this doc's chapters so library
      // cards can render language-availability chips without a second fetch.
      chapters: {
        select: {
          translations: { select: { lang: true } },
        },
      },
    },
  });
  return rows.map((r) => {
    const base = asMeta(r);
    const langs = new Set<DocumentV2Locale>([base.sourceLang]);
    for (const ch of r.chapters) {
      for (const t of ch.translations) {
        if (isLocale(t.lang)) langs.add(t.lang);
      }
    }
    return {
      meta: { ...base, availableLangs: [...langs] },
    };
  });
}

export async function getDocumentMetas(): Promise<DocumentLibraryMeta[]> {
  const items = await getDocumentList();
  return items.map((i) => i.meta);
}

export async function getDocumentBySlug(slug: string): Promise<ParsedDocument | null> {
  const row = await prisma.documentV2.findUnique({
    where: { slug },
    include: {
      _count: { select: { chapters: true } },
      chapters: {
        orderBy: { index: 'asc' },
        include: {
          translations: { select: { lang: true, text: true } },
        },
      },
    },
  });
  if (!row) return null;
  if (row.status !== 'published') return null;

  const meta = asMeta(row);

  const chapters: ChapterFull[] = row.chapters.map((ch) => {
    const translations: Partial<Record<DocumentV2Locale, string>> = {};
    for (const t of ch.translations) {
      if (isLocale(t.lang)) translations[t.lang] = t.text;
    }
    return {
      id: ch.id,
      slug: ch.slug,
      index: ch.index,
      titleI18n: (ch.titleI18n ?? {}) as I18nString,
      excerptI18n: (ch.excerptI18n ?? undefined) as I18nString | undefined,
      date: ch.date ?? undefined,
      mentionJews: ch.mentionJews,
      text: ch.text,
      translations,
    };
  });

  return { meta, chapters };
}

export async function getPublishedSlugs(): Promise<string[]> {
  const rows = await prisma.documentV2.findMany({
    where: { status: 'published' },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}

export const DOCUMENT_LOCALES = DOCUMENT_V2_LOCALES;
