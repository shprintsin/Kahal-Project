import { NextRequest, NextResponse } from 'next/server';
import { authenticateCli } from '../../../middleware';
import prisma from '@/lib/prisma';
import type { DocumentV2Locale, I18nString } from '@/types/document-v2';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const auth = await authenticateCli(req);
  if (auth instanceof NextResponse) return auth;

  const { slug } = await params;

  const row = await prisma.documentV2.findUnique({
    where: { slug },
    include: {
      chapters: {
        orderBy: { index: 'asc' },
        include: {
          translations: { select: { lang: true, text: true } },
        },
      },
    },
  });
  if (!row) {
    return NextResponse.json({ ok: false, error: 'document not found' }, { status: 404 });
  }

  const name = row.nameI18n as I18nString;
  const excerpt = (row.excerptI18n ?? null) as I18nString | null;

  const documents = row.chapters.map((ch) => {
    const title = ch.titleI18n as I18nString;
    const ex = (ch.excerptI18n ?? null) as I18nString | null;
    const translation: Partial<Record<DocumentV2Locale, string>> = {};
    for (const t of ch.translations) translation[t.lang as DocumentV2Locale] = t.text;
    return {
      chapter_slug: ch.slug,
      index: ch.index,
      title: title.en ?? title.source ?? '',
      title_he: title.he,
      date: ch.date ?? undefined,
      excerpt: ex?.en,
      excerpt_he: ex?.he,
      mention_jews: ch.mentionJews,
      text: ch.text,
      translation,
    };
  });

  return NextResponse.json({
    ok: true,
    result: {
      file_id: row.fileId ?? undefined,
      slug: row.slug,
      source_lang: row.sourceLang as DocumentV2Locale,
      name: name.en ?? name.source ?? '',
      name_he: name.he,
      original_name: name.source,
      excerpt_en: excerpt?.en,
      excerpt_he: excerpt?.he,
      citation: row.citation ?? undefined,
      url: row.url ?? undefined,
      date_start: row.dateStart ?? undefined,
      date_end: row.dateEnd ?? undefined,
      toc_model: row.tocModel ?? undefined,
      trans_model: row.translateModel ?? undefined,
      status: row.status,
      documents,
    },
  });
}
