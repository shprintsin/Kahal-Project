import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateCli } from '../../middleware';

export async function POST(req: NextRequest) {
  const authError = authenticateCli(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const {
      slug, name, description, summary, summaryI18n,
      type, status, geoJsonData,
      style, labels, popup, filter, hover,
      filename, dataCsvContent, changeLog,
    } = body;

    if (!slug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }

    // Map CLI type string to Prisma LayerType enum
    const layerTypeMap: Record<string, string> = {
      POINTS: 'POINTS',
      POLYGONS: 'POLYGONS',
      POLYLINES: 'POLYLINES',
      MULTI_POLYGONS: 'MULTI_POLYGONS',
      points: 'POINTS',
      point: 'POINTS',
      polygons: 'POLYGONS',
      polygon: 'POLYGONS',
      polylines: 'POLYLINES',
      polyline: 'POLYLINES',
    };
    const dbType = layerTypeMap[type] ?? 'POINTS';

    // Build the unified styleConfig wrapper. The viewer's buildLayerConfig
    // (app/[locale]/maps/[slug]/components/MapPreview.tsx) reads style/labels/
    // popup/filter/hover as siblings inside styleConfig and falls back to
    // treating styleConfig as a bare style for legacy records. Persist all of
    // them so renderer features like labels.filter and stroke_color_dict
    // survive the round-trip from CLI YAML -> DB -> viewer.
    const builtStyleConfig: Record<string, unknown> = {};
    if (style !== undefined) builtStyleConfig.style = style;
    if (labels !== undefined) builtStyleConfig.labels = labels;
    if (popup !== undefined) builtStyleConfig.popup = popup;
    if (filter !== undefined) builtStyleConfig.filter = filter;
    if (hover !== undefined) builtStyleConfig.hover = hover;
    const hasStyleFields = Object.keys(builtStyleConfig).length > 0;

    const existing = await prisma.layer.findUnique({ where: { slug } });

    let layer;
    let action: string;

    if (existing) {
      // Update existing layer
      layer = await prisma.layer.update({
        where: { id: existing.id },
        data: {
          name: name ?? existing.name,
          description: description ?? existing.description,
          summary: summary ?? existing.summary,
          ...(summaryI18n ? { summaryI18n } : {}),
          type: dbType as any,
          status: (status ?? existing.status) as any,
          geoJsonData: geoJsonData ?? existing.geoJsonData,
          styleConfig: hasStyleFields ? (builtStyleConfig as any) : (existing.styleConfig as any),
          sourceType: 'database' as any,
          ...(filename ? { filename } : {}),
          ...(dataCsvContent ? { downloadUrl: `data:text/csv;base64,${Buffer.from(dataCsvContent).toString('base64')}` } : {}),
        },
      });
      action = 'updated';
    } else {
      // Create new layer
      layer = await prisma.layer.create({
        data: {
          slug,
          name: name ?? slug,
          description: description ?? '',
          summary: summary ?? '',
          ...(summaryI18n ? { summaryI18n } : {}),
          type: dbType as any,
          status: (status ?? 'draft') as any,
          geoJsonData: geoJsonData ?? {},
          styleConfig: hasStyleFields ? (builtStyleConfig as any) : {},
          sourceType: 'database' as any,
          ...(filename ? { filename } : {}),
          ...(dataCsvContent ? { downloadUrl: `data:text/csv;base64,${Buffer.from(dataCsvContent).toString('base64')}` } : {}),
        },
      });
      action = 'created';
    }

    return NextResponse.json({
      action,
      layer: { id: layer.id, slug: layer.slug },
    });
  } catch (err) {
    console.error('Deploy layer error:', err);
    return NextResponse.json(
      { error: 'Internal server error', message: (err as Error).message },
      { status: 500 },
    );
  }
}
