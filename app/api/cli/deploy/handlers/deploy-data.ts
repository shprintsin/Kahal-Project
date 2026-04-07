import { z } from 'zod';
import {
  ContentStatus,
  DataMaturity,
  ResouceType,
  type Prisma,
} from '@prisma/client';
import prisma from '@/lib/prisma';
import type { DeployHandlerResult } from './deploy-map';

// Frozen v2 dataset deploy schema. Mirrors @kahal/shared DatasetInputSchema
// (lib/shared-schemas/data-input.ts) but uses z.nativeEnum so the values
// stay locked to whatever Prisma actually accepts — no `as any` casts.
const I18nRecord = z.record(z.string(), z.string()).optional();

const DatasetResourceV2Schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  url: z.string().min(1),
  filename: z.string().nullable().optional(),
  mimeType: z.string().nullable().optional(),
  format: z.nativeEnum(ResouceType).default(ResouceType.UNKNOWN),
  sizeBytes: z.number().int().nullable().optional(),
  isMainFile: z.boolean().default(false),
  excerptI18n: z.record(z.string(), z.string()).optional(),
});

export const DataDeployV2Schema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'slug must be lowercase alphanumeric with hyphens'),
  title: z.string().optional(),
  titleI18n: I18nRecord,
  description: z.string().optional(),
  descriptionI18n: I18nRecord,
  summary: z.string().optional(),
  summaryI18n: I18nRecord,
  codebookTextI18n: I18nRecord,
  sourcesI18n: I18nRecord,
  status: z.nativeEnum(ContentStatus).default('draft'),
  maturity: z.nativeEnum(DataMaturity).default(DataMaturity.Provisional),
  version: z.string().optional(),
  license: z.string().nullable().optional(),
  citationText: z.string().nullable().optional(),
  minYear: z.number().int().nullable().optional(),
  maxYear: z.number().int().nullable().optional(),
  isVisible: z.boolean().optional(),
  categorySlug: z.string().optional(),
  regionSlugs: z.array(z.string()).default([]),
  thumbnailId: z.string().optional(),
  resources: z.array(DatasetResourceV2Schema).default([]),
  gitSha: z.string().optional(),
  cliVersion: z.string().optional(),
});
export type DataDeployV2Input = z.infer<typeof DataDeployV2Schema>;

function pickPrimary(i18n: Record<string, string> | undefined, fallback = ''): string {
  if (!i18n) return fallback;
  return i18n.he || i18n.en || Object.values(i18n)[0] || fallback;
}

function bumpPatchVersion(current: string | null | undefined): string {
  const v = current ?? '1.0.0';
  const parts = v.split('.').map(Number);
  if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
    parts[2] += 1;
    return parts.join('.');
  }
  return '1.0.1';
}

export async function deployData(
  body: unknown,
): Promise<DeployHandlerResult<{ id: string; slug: string; action: 'created' | 'updated' }>> {
  const parsed = DataDeployV2Schema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Invalid dataset deploy payload',
      issues: parsed.error.issues,
    };
  }
  const input = parsed.data;

  const resolvedTitle = input.title ?? pickPrimary(input.titleI18n, input.slug);
  const resolvedDescription = input.description ?? pickPrimary(input.descriptionI18n, '');

  // Resolve category slug -> id
  let categoryId: string | undefined;
  if (input.categorySlug) {
    const cat = await prisma.category.findUnique({
      where: { slug: input.categorySlug },
      select: { id: true },
    });
    if (!cat) {
      return { ok: false, error: `Category not found: ${input.categorySlug}` };
    }
    categoryId = cat.id;
  }

  // Resolve region slugs -> ids
  let regionIds: string[] = [];
  if (input.regionSlugs.length > 0) {
    const regions = await prisma.region.findMany({
      where: { slug: { in: input.regionSlugs } },
      select: { id: true, slug: true },
    });
    const foundSlugs = new Set(regions.map((r) => r.slug));
    const missing = input.regionSlugs.filter((s) => !foundSlugs.has(s));
    if (missing.length > 0) {
      return { ok: false, error: `Region(s) not found: ${missing.join(', ')}` };
    }
    regionIds = regions.map((r) => r.id);
  }

  const existing = await prisma.dataset.findUnique({ where: { slug: input.slug } });
  const nextVersion = input.version ?? bumpPatchVersion(existing?.version);

  let dataset: { id: string; slug: string };
  let action: 'created' | 'updated';

  if (existing) {
    const updated = await prisma.dataset.update({
      where: { id: existing.id },
      data: {
        title: resolvedTitle,
        titleI18n: (input.titleI18n ?? existing.titleI18n) as Prisma.InputJsonValue,
        description: resolvedDescription,
        descriptionI18n: (input.descriptionI18n ?? existing.descriptionI18n) as Prisma.InputJsonValue,
        summary: input.summary ?? existing.summary,
        ...(input.summaryI18n
          ? { summaryI18n: input.summaryI18n as Prisma.InputJsonValue }
          : {}),
        ...(input.codebookTextI18n
          ? {
              codebookText: pickPrimary(input.codebookTextI18n) || null,
              codebookTextI18n: input.codebookTextI18n as Prisma.InputJsonValue,
            }
          : {}),
        ...(input.sourcesI18n
          ? {
              sources: pickPrimary(input.sourcesI18n) || null,
              sourcesI18n: input.sourcesI18n as Prisma.InputJsonValue,
            }
          : {}),
        ...(input.thumbnailId ? { thumbnail: { connect: { id: input.thumbnailId } } } : {}),
        ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
        status: input.status,
        maturity: input.maturity,
        version: nextVersion,
        license: input.license ?? existing.license,
        citationText: input.citationText ?? existing.citationText,
        yearMin: input.minYear ?? existing.yearMin,
        yearMax: input.maxYear ?? existing.yearMax,
        isVisible: input.isVisible ?? existing.isVisible,
      },
      select: { id: true, slug: true },
    });
    dataset = updated;
    action = 'updated';
  } else {
    const created = await prisma.dataset.create({
      data: {
        slug: input.slug,
        title: resolvedTitle,
        titleI18n: (input.titleI18n ?? {}) as Prisma.InputJsonValue,
        description: resolvedDescription,
        descriptionI18n: (input.descriptionI18n ?? {}) as Prisma.InputJsonValue,
        summary: input.summary ?? '',
        ...(input.summaryI18n
          ? { summaryI18n: input.summaryI18n as Prisma.InputJsonValue }
          : {}),
        ...(input.codebookTextI18n
          ? {
              codebookText: pickPrimary(input.codebookTextI18n) || null,
              codebookTextI18n: input.codebookTextI18n as Prisma.InputJsonValue,
            }
          : {}),
        ...(input.sourcesI18n
          ? {
              sources: pickPrimary(input.sourcesI18n) || null,
              sourcesI18n: input.sourcesI18n as Prisma.InputJsonValue,
            }
          : {}),
        ...(input.thumbnailId ? { thumbnail: { connect: { id: input.thumbnailId } } } : {}),
        ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
        status: input.status,
        maturity: input.maturity,
        version: nextVersion,
        license: input.license ?? null,
        citationText: input.citationText ?? null,
        yearMin: input.minYear ?? null,
        yearMax: input.maxYear ?? null,
        isVisible: input.isVisible ?? true,
      },
      select: { id: true, slug: true },
    });
    dataset = created;
    action = 'created';
  }

  if (regionIds.length > 0) {
    await prisma.dataset.update({
      where: { id: dataset.id },
      data: { regions: { set: regionIds.map((id) => ({ id })) } },
    });
  }

  // Replace resources atomically. Reusing createMany keeps this O(1) round
  // trips instead of one create per resource like the old loop.
  if (input.resources.length > 0) {
    await prisma.datasetResource.deleteMany({ where: { datasetId: dataset.id } });
    await prisma.datasetResource.createMany({
      data: input.resources.map((r) => ({
        datasetId: dataset.id,
        name: r.name,
        slug: r.slug,
        url: r.url,
        filename: r.filename ?? null,
        mimeType: r.mimeType ?? null,
        format: r.format,
        sizeBytes: r.sizeBytes ?? null,
        isMainFile: r.isMainFile,
        excerptI18n: (r.excerptI18n ?? {}) as Prisma.InputJsonValue,
      })),
    });
  }

  return { ok: true, result: { id: dataset.id, slug: dataset.slug, action } };
}
