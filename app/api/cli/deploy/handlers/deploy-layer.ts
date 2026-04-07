import { z } from 'zod';
import { ContentStatus, LayerType, type Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import type { DeployHandlerResult } from './deploy-map';

// Frozen v2 layer deploy schema. Builds on @kahal/shared LayerInputSchema
// (lib/shared-schemas/layer-input.ts) but uses z.nativeEnum so the values
// stay locked to whatever Prisma actually accepts — no `as any` casts.
const LAYER_TYPE_ALIASES: Record<string, LayerType> = {
  POINTS: LayerType.POINTS,
  POLYGONS: LayerType.POLYGONS,
  POLYLINES: LayerType.POLYLINES,
  MULTI_POLYGONS: LayerType.MULTI_POLYGONS,
  RASTER: LayerType.RASTER,
  points: LayerType.POINTS,
  point: LayerType.POINTS,
  polygons: LayerType.POLYGONS,
  polygon: LayerType.POLYGONS,
  polylines: LayerType.POLYLINES,
  polyline: LayerType.POLYLINES,
};

const LayerTypeInput = z
  .union([z.nativeEnum(LayerType), z.string()])
  .transform((v) => LAYER_TYPE_ALIASES[v as string] ?? v)
  .pipe(z.nativeEnum(LayerType));

export const LayerDeployV2Schema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'slug must be lowercase alphanumeric with hyphens'),
  name: z.string().min(1),
  description: z.string().default(''),
  summary: z.string().optional(),
  summaryI18n: z.record(z.string(), z.string()).optional(),
  type: LayerTypeInput.default(LayerType.POINTS),
  status: z.nativeEnum(ContentStatus).default('draft'),
  geoJsonData: z.any().optional(),
  style: z.any().optional(),
  labels: z.any().optional(),
  popup: z.any().optional(),
  filter: z.any().optional(),
  hover: z.any().optional(),
  filename: z.string().optional(),
  dataCsvContent: z.string().optional(),
});
export type LayerDeployV2Input = z.infer<typeof LayerDeployV2Schema>;

function buildStyleConfig(input: LayerDeployV2Input): Prisma.InputJsonValue | null {
  // Mirrors the wrapper the viewer's MapPreview.buildLayerConfig expects:
  // style/labels/popup/filter/hover live as siblings inside styleConfig so
  // renderer features (labels.filter, stroke_color_dict, etc.) round-trip
  // from CLI YAML -> DB -> viewer intact.
  const out: Record<string, unknown> = {};
  if (input.style !== undefined) out.style = input.style;
  if (input.labels !== undefined) out.labels = input.labels;
  if (input.popup !== undefined) out.popup = input.popup;
  if (input.filter !== undefined) out.filter = input.filter;
  if (input.hover !== undefined) out.hover = input.hover;
  return Object.keys(out).length > 0 ? (out as Prisma.InputJsonValue) : null;
}

export async function deployLayer(
  body: unknown,
): Promise<DeployHandlerResult<{ id: string; slug: string; action: 'created' | 'updated' }>> {
  const parsed = LayerDeployV2Schema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Invalid layer deploy payload',
      issues: parsed.error.issues,
    };
  }
  const input = parsed.data;
  const styleConfig = buildStyleConfig(input);

  const existing = await prisma.layer.findUnique({ where: { slug: input.slug } });

  // Inline data CSV is encoded as a base64 data URL the same way the legacy
  // route did it — keeps the field-deployed CLI clients working.
  const downloadUrl = input.dataCsvContent
    ? `data:text/csv;base64,${Buffer.from(input.dataCsvContent).toString('base64')}`
    : undefined;

  let layer: { id: string; slug: string };
  let action: 'created' | 'updated';

  if (existing) {
    const updated = await prisma.layer.update({
      where: { id: existing.id },
      data: {
        name: input.name,
        description: input.description || existing.description,
        summary: input.summary ?? existing.summary,
        ...(input.summaryI18n
          ? { summaryI18n: input.summaryI18n as Prisma.InputJsonValue }
          : {}),
        type: input.type,
        status: input.status,
        geoJsonData: (input.geoJsonData ?? existing.geoJsonData) as Prisma.InputJsonValue,
        styleConfig: (styleConfig ?? existing.styleConfig) as Prisma.InputJsonValue,
        sourceType: 'database',
        ...(input.filename ? { filename: input.filename } : {}),
        ...(downloadUrl ? { downloadUrl } : {}),
      },
      select: { id: true, slug: true },
    });
    layer = updated;
    action = 'updated';
  } else {
    const created = await prisma.layer.create({
      data: {
        slug: input.slug,
        name: input.name,
        description: input.description,
        summary: input.summary ?? '',
        ...(input.summaryI18n
          ? { summaryI18n: input.summaryI18n as Prisma.InputJsonValue }
          : {}),
        type: input.type,
        status: input.status,
        geoJsonData: (input.geoJsonData ?? {}) as Prisma.InputJsonValue,
        styleConfig: (styleConfig ?? {}) as Prisma.InputJsonValue,
        sourceType: 'database',
        ...(input.filename ? { filename: input.filename } : {}),
        ...(downloadUrl ? { downloadUrl } : {}),
      },
      select: { id: true, slug: true },
    });
    layer = created;
    action = 'created';
  }

  return { ok: true, result: { id: layer.id, slug: layer.slug, action } };
}
