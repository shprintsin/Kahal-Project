import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateCli } from '../../middleware';

export async function POST(req: NextRequest) {
  const authError = authenticateCli(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { slug, name, description, summary, summaryI18n, type, status, geoJsonData, style, dataCsvContent, changeLog } = body;

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
      polygons: 'POLYGONS',
      polylines: 'POLYLINES',
    };
    const dbType = layerTypeMap[type] ?? 'POINTS';

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
          styleConfig: style ?? existing.styleConfig,
          sourceType: 'database' as any,
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
          styleConfig: style ?? {},
          sourceType: 'database' as any,
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
