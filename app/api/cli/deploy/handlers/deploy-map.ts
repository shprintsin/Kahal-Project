import { z } from 'zod';
import { ContentStatus, type Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

// ── Result envelope ────────────────────────────────────────────────
export type DeployHandlerOk<T> = { ok: true; result: T };
export type DeployHandlerErr = {
  ok: false;
  error: string;
  issues?: z.ZodIssue[];
};
export type DeployHandlerResult<T> = DeployHandlerOk<T> | DeployHandlerErr;

// ── Frozen v2 body schema ──────────────────────────────────────────
// v2 requires titleI18n; the v1 fallbacks (directTitleI18n ?? metadata?.title
// ?? title) that the old route accepted are intentionally gone.
const I18nRecord = z.record(z.string(), z.string()).optional();

export const MapDeployV2Schema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'slug must be lowercase alphanumeric with hyphens'),
  titleI18n: z.record(z.string(), z.string()).refine(
    (v) => Object.keys(v).length > 0,
    { message: 'titleI18n must have at least one locale entry' },
  ),
  descriptionI18n: I18nRecord,
  summaryI18n: I18nRecord,
  codebookTextI18n: I18nRecord,
  summary: z.string().optional(),
  status: z.nativeEnum(ContentStatus).default('draft'),
  config: z.any().optional(),
  layerSlugs: z.array(z.string()).default([]),
  thumbnailId: z.string().optional(),
  year: z.number().int().optional(),
  changeLog: z.string().optional(),
  gitSha: z.string().optional(),
  cliVersion: z.string().optional(),
});
export type MapDeployV2Input = z.infer<typeof MapDeployV2Schema>;

// ── Helpers ────────────────────────────────────────────────────────
function bumpPatchVersion(current: string | null | undefined): string {
  const v = current ?? '1.0.0';
  const parts = v.split('.').map(Number);
  if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
    parts[2] += 1;
    return parts.join('.');
  }
  return '1.0.1';
}

function pickPrimary(i18n: Record<string, string> | undefined, fallback = ''): string {
  if (!i18n) return fallback;
  return i18n.he || i18n.en || Object.values(i18n)[0] || fallback;
}

// ── Handler ────────────────────────────────────────────────────────
export async function deployMap(
  body: unknown,
): Promise<DeployHandlerResult<{ id: string; slug: string; action: 'created' | 'updated' }>> {
  const parsed = MapDeployV2Schema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Invalid map deploy payload',
      issues: parsed.error.issues,
    };
  }
  const input = parsed.data;
  const {
    slug,
    titleI18n,
    descriptionI18n,
    summary,
    summaryI18n,
    codebookTextI18n,
    status,
    config,
    layerSlugs,
    thumbnailId,
    year,
    changeLog,
    gitSha,
    cliVersion,
  } = input;

  const resolvedTitle = pickPrimary(titleI18n, slug);
  const resolvedDescription = pickPrimary(descriptionI18n, '');
  const mapConfig = (config ?? {}) as Prisma.InputJsonValue;

  const existing = await prisma.dataset.findUnique({ where: { slug } });
  const nextVersion = bumpPatchVersion(existing?.version);

  let map: { id: string; slug: string };
  let action: 'created' | 'updated';

  if (existing) {
    const updated = await prisma.dataset.update({
      where: { id: existing.id },
      data: {
        title: resolvedTitle,
        titleI18n: titleI18n as Prisma.InputJsonValue,
        description: resolvedDescription || existing.description,
        descriptionI18n: (descriptionI18n ?? existing.descriptionI18n) as Prisma.InputJsonValue,
        summary: summary ?? existing.summary,
        ...(summaryI18n ? { summaryI18n: summaryI18n as Prisma.InputJsonValue } : {}),
        ...(codebookTextI18n
          ? {
              codebookText: pickPrimary(codebookTextI18n) || null,
              codebookTextI18n: codebookTextI18n as Prisma.InputJsonValue,
            }
          : {}),
        ...(thumbnailId ? { thumbnail: { connect: { id: thumbnailId } } } : {}),
        status,
        config: mapConfig,
        year: year ?? existing.year,
        version: nextVersion,
      },
      select: { id: true, slug: true },
    });
    map = updated;
    action = 'updated';
  } else {
    const created = await prisma.dataset.create({
      data: {
        slug,
        title: resolvedTitle,
        titleI18n: titleI18n as Prisma.InputJsonValue,
        description: resolvedDescription,
        descriptionI18n: (descriptionI18n ?? {}) as Prisma.InputJsonValue,
        summary: summary ?? '',
        ...(summaryI18n ? { summaryI18n: summaryI18n as Prisma.InputJsonValue } : {}),
        ...(codebookTextI18n
          ? {
              codebookText: pickPrimary(codebookTextI18n) || null,
              codebookTextI18n: codebookTextI18n as Prisma.InputJsonValue,
            }
          : {}),
        ...(thumbnailId ? { thumbnail: { connect: { id: thumbnailId } } } : {}),
        status,
        config: mapConfig,
        year: year ?? null,
        version: nextVersion,
      },
      select: { id: true, slug: true },
    });
    map = created;
    action = 'created';
  }

  await prisma.datasetDeployment.create({
    data: {
      datasetId: map.id,
      version: nextVersion,
      changeLog: changeLog ?? null,
      gitSha: gitSha ?? null,
      cliVersion: cliVersion ?? null,
    },
  });

  // Recreate layer associations in one batched query (no N+1).
  if (layerSlugs.length > 0) {
    const layers = await prisma.layer.findMany({
      where: { slug: { in: layerSlugs } },
      select: { id: true, slug: true },
    });
    const layersBySlug = new Map(layers.map((l) => [l.slug, l]));

    const missing = layerSlugs.filter((s) => !layersBySlug.has(s));
    for (const m of missing) {
      console.warn(`[deploy-map] layer "${m}" not found — skipping association`);
    }

    await prisma.datasetLayerAssociation.deleteMany({ where: { datasetId: map.id } });

    const associations = layerSlugs.flatMap((slug, i) => {
      const layer = layersBySlug.get(slug);
      if (!layer) return [];
      return [
        {
          datasetId: map.id,
          layerId: layer.id,
          zIndex: i,
          isVisible: true,
          isVisibleByDefault: true,
        },
      ];
    });

    if (associations.length > 0) {
      await prisma.datasetLayerAssociation.createMany({ data: associations });
    }
  }

  return { ok: true, result: { id: map.id, slug: map.slug, action } };
}
