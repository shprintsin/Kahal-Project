import { ContentStatus, type Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import {
  DocstudioDocumentSchema,
  buildI18nName,
  buildI18nExcerpt,
  buildI18nChapterTitle,
  buildI18nChapterExcerpt,
  extractBodyTranslations,
} from '@/app/[locale]/documents-v2/lib/parse-document';

import type { DeployHandlerResult } from './deploy-map';

export const DocumentDeployV2Schema = DocstudioDocumentSchema;
export type DocumentDeployV2Input = Parameters<typeof DocstudioDocumentSchema.parse>[0];

export async function deployDocument(
  body: unknown,
): Promise<DeployHandlerResult<{ id: string; slug: string; action: 'created' | 'updated'; chapterCount: number }>> {
  const parsed = DocstudioDocumentSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid document deploy payload', issues: parsed.error.issues };
  }
  const input = parsed.data;

  // Reject duplicate chapter_slugs / index collisions early — the unique
  // constraints would catch them, but we want a friendly error before we open
  // a transaction.
  const slugs = new Set<string>();
  const indexes = new Set<number>();
  for (const ch of input.documents) {
    if (slugs.has(ch.chapter_slug)) {
      return { ok: false, error: `Duplicate chapter_slug: ${ch.chapter_slug}` };
    }
    if (indexes.has(ch.index)) {
      return { ok: false, error: `Duplicate chapter index: ${ch.index}` };
    }
    slugs.add(ch.chapter_slug);
    indexes.add(ch.index);
  }

  const status = input.status as ContentStatus;
  const nameI18n = buildI18nName(input);
  const excerptI18n = buildI18nExcerpt(input);

  const docData = {
    fileId: input.file_id ?? null,
    sourceLang: input.source_lang,
    nameI18n: nameI18n as Prisma.InputJsonValue,
    excerptI18n: (excerptI18n ?? null) as Prisma.InputJsonValue | null,
    citation: input.citation ?? null,
    url: input.url ?? null,
    dateStart: input.date_start ?? null,
    dateEnd: input.date_end ?? null,
    tocModel: input.toc_model ?? null,
    translateModel: input.trans_model ?? null,
    status,
  };

  const existing = await prisma.documentV2.findUnique({
    where: { slug: input.slug },
    select: { id: true },
  });

  let docId: string;
  let docSlug: string;
  let action: 'created' | 'updated';

  if (existing) {
    const updated = await prisma.documentV2.update({
      where: { id: existing.id },
      data: docData,
      select: { id: true, slug: true },
    });
    docId = updated.id;
    docSlug = updated.slug;
    action = 'updated';
  } else {
    const created = await prisma.documentV2.create({
      data: { slug: input.slug, ...docData },
      select: { id: true, slug: true },
    });
    docId = created.id;
    docSlug = created.slug;
    action = 'created';
  }

  // Replace chapters atomically. The simplest correct approach for a small
  // archival unit (≤ a few hundred chapters) is to wipe and re-create — this
  // also clears stale ChapterTranslation rows via cascade. Existing chapter
  // ids are not preserved across deploys; the stable identity is the
  // (documentId, chapter_slug) tuple.
  await prisma.$transaction([
    prisma.chapter.deleteMany({ where: { documentId: docId } }),
    ...input.documents.map((ch) =>
      prisma.chapter.create({
        data: {
          documentId: docId,
          slug: ch.chapter_slug,
          index: ch.index,
          titleI18n: buildI18nChapterTitle(ch) as Prisma.InputJsonValue,
          excerptI18n: (buildI18nChapterExcerpt(ch) ?? null) as Prisma.InputJsonValue | null,
          date: ch.date ?? null,
          mentionJews: ch.mention_jews ?? false,
          text: ch.text,
          translations: {
            create: extractBodyTranslations(ch, input.source_lang).map((t) => ({
              lang: t.lang,
              text: t.text,
            })),
          },
        },
      }),
    ),
  ]);

  return {
    ok: true,
    result: {
      id: docId,
      slug: docSlug,
      action,
      chapterCount: input.documents.length,
    },
  };
}
