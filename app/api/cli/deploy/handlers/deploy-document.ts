import { z } from 'zod';
import { ContentStatus, type Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import {
  extractToc,
  extractMarkers,
} from '@/app/[locale]/documents-v2/lib/parse-document';
import { derivePages } from '@/app/[locale]/documents-v2/lib/derive-pages';
import { DOCUMENT_V2_LOCALES } from '@/types/document-v2';

import type { DeployHandlerResult } from './deploy-map';

const I18nRecord = z.record(z.string(), z.string());
const LocaleSchema = z.enum(DOCUMENT_V2_LOCALES);

const ArchiveSchema = z
  .object({
    name: z.string().min(1),
    reference: z.string().optional(),
    url: z.string().url().optional(),
  })
  .optional();

const ScansSchema = z
  .object({
    baseUrl: z.string().min(1),
    extension: z.string().optional(),
    placeholder: z.string().optional(),
  })
  .optional();

const TranslationSchema = z.object({
  lang: LocaleSchema,
  markdown: z.string(),
});

export const DocumentDeployV2Schema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'slug must be lowercase alphanumeric with hyphens'),
  primaryLang: LocaleSchema,
  status: z.nativeEnum(ContentStatus).default('draft'),
  titleI18n: I18nRecord.refine((v) => Object.keys(v).length > 0, {
    message: 'titleI18n must have at least one locale entry',
  }),
  descriptionI18n: I18nRecord.optional(),
  year: z.number().int().optional(),
  archive: ArchiveSchema,
  scans: ScansSchema,
  license: z.string().optional(),
  downloadable: z.boolean().optional(),
  translations: z.array(TranslationSchema).min(1),
});
export type DocumentDeployV2Input = z.infer<typeof DocumentDeployV2Schema>;

export async function deployDocument(
  body: unknown,
): Promise<DeployHandlerResult<{ id: string; slug: string; action: 'created' | 'updated' }>> {
  const parsed = DocumentDeployV2Schema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid document deploy payload', issues: parsed.error.issues };
  }
  const input = parsed.data;

  const langs = input.translations.map((t) => t.lang);
  if (!langs.includes(input.primaryLang)) {
    return {
      ok: false,
      error: `translations[] must include the primaryLang "${input.primaryLang}"`,
    };
  }
  const dupLangs = langs.filter((l, i) => langs.indexOf(l) !== i);
  if (dupLangs.length > 0) {
    return { ok: false, error: `duplicate translation lang: ${dupLangs.join(', ')}` };
  }

  // Render derived per-page artifacts (markdown→HTML, heading paths, char
  // offsets, content hashes) outside any DB transaction. Doing this up-front
  // also fails the deploy fast on malformed markdown — before we touch the DB.
  const enriched = await Promise.all(
    input.translations.map(async (t) => {
      const toc = extractToc(t.markdown);
      const markers = extractMarkers(t.markdown, input.scans);
      const pages = await derivePages(t.markdown);
      return { ...t, toc, markers, pages };
    }),
  );
  const primary = enriched.find((t) => t.lang === input.primaryLang)!;

  const existing = await prisma.documentV2.findUnique({
    where: { slug: input.slug },
    select: { id: true, currentVersion: true },
  });

  // Bump the version monotonically so every derived row carries a stamp
  // matching the deploy that produced it. New docs start at 1.
  const nextVersion = existing ? existing.currentVersion + 1 : 1;

  const docData = {
    primaryLang: input.primaryLang,
    titleI18n: input.titleI18n as Prisma.InputJsonValue,
    descriptionI18n: (input.descriptionI18n ?? null) as Prisma.InputJsonValue | null,
    year: input.year ?? null,
    archive: (input.archive ?? null) as Prisma.InputJsonValue | null,
    scans: (input.scans ?? null) as Prisma.InputJsonValue | null,
    license: input.license ?? null,
    pageCount: primary.markers.length,
    headingCount: primary.toc.length,
    currentVersion: nextVersion,
    status: input.status,
  };

  let doc: { id: string; slug: string };
  let action: 'created' | 'updated';

  if (existing) {
    doc = await prisma.documentV2.update({
      where: { id: existing.id },
      data: docData,
      select: { id: true, slug: true },
    });
    action = 'updated';
  } else {
    doc = await prisma.documentV2.create({
      data: { slug: input.slug, ...docData },
      select: { id: true, slug: true },
    });
    action = 'created';
  }

  const pageRows = enriched.flatMap((t) =>
    t.pages.map((p) => ({
      documentId: doc.id,
      lang: t.lang,
      pageNumber: p.pageNumber,
      version: nextVersion,
      filename: p.filename,
      text: p.text,
      html: p.html,
      headingPath: p.headingPath as unknown as Prisma.InputJsonValue,
      charStart: p.charStart,
      charEnd: p.charEnd,
      contentHash: p.contentHash,
    })),
  );

  await prisma.$transaction([
    prisma.documentV2Translation.deleteMany({
      where: { documentId: doc.id, lang: { notIn: langs } },
    }),
    ...enriched.map((t) =>
      prisma.documentV2Translation.upsert({
        where: { documentId_lang: { documentId: doc.id, lang: t.lang } },
        update: {
          markdown: t.markdown,
          toc: t.toc as unknown as Prisma.InputJsonValue,
          markers: t.markers as unknown as Prisma.InputJsonValue,
          version: nextVersion,
        },
        create: {
          documentId: doc.id,
          lang: t.lang,
          markdown: t.markdown,
          toc: t.toc as unknown as Prisma.InputJsonValue,
          markers: t.markers as unknown as Prisma.InputJsonValue,
          version: nextVersion,
        },
      }),
    ),
    // Replace prior versions of this doc's pages atomically. Once Step 4 lands
    // (rolling-window retention) we'll keep the last K versions instead of
    // wiping the table.
    prisma.documentV2PageText.deleteMany({ where: { documentId: doc.id } }),
    ...(pageRows.length > 0
      ? [prisma.documentV2PageText.createMany({ data: pageRows })]
      : []),
  ]);

  return { ok: true, result: { id: doc.id, slug: doc.slug, action } };
}

