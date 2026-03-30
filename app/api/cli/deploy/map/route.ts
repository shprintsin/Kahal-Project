import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateCli } from '../../middleware';

export async function POST(req: NextRequest) {
  const authError = authenticateCli(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const {
      slug, title, description, status, config, metadata,
      layerSlugs, changeLog, gitSha, cliVersion,
      // Direct i18n fields (new CLI v2 — take precedence over metadata)
      titleI18n: directTitleI18n,
      descriptionI18n: directDescriptionI18n,
      codebookTextI18n,
      thumbnailId,
      summary,
      summaryI18n,
    } = body;

    if (!slug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }

    // Build the config JSON (basemap, center, zoom — NOT layers)
    const mapConfig = config ?? {};

    // Extract metadata fields
    const year = metadata?.year ?? null;
    // Direct i18n fields from CLI v2 take precedence over metadata-wrapped ones
    const titleI18n = directTitleI18n ?? metadata?.title ?? { en: title };
    const descriptionI18n = directDescriptionI18n ?? metadata?.description ?? { en: description ?? '' };
    // Primary title/description: prefer Hebrew, then English, then bare value
    const resolvedTitle = titleI18n?.he || titleI18n?.en || title;
    const resolvedDescription = descriptionI18n?.he || descriptionI18n?.en || description;

    const existing = await prisma.dataset.findUnique({ where: { slug } });

    let map;
    let action: string;

    // Auto-bump version: increment patch on update, start at 1.0.0 on create
    let nextVersion = '1.0.0';
    if (existing) {
      const current = existing.version ?? '1.0.0';
      const parts = current.split('.').map(Number);
      if (parts.length === 3 && parts.every((n) => !isNaN(n))) {
        parts[2] += 1;
        nextVersion = parts.join('.');
      } else {
        nextVersion = '1.0.1';
      }

      map = await prisma.dataset.update({
        where: { id: existing.id },
        data: {
          title: resolvedTitle ?? existing.title,
          titleI18n,
          description: resolvedDescription ?? existing.description,
          descriptionI18n,
          summary: summary ?? existing.summary,
          ...(summaryI18n ? { summaryI18n } : {}),
          ...(codebookTextI18n ? {
            codebookText: codebookTextI18n.he || codebookTextI18n.en || null,
            codebookTextI18n,
          } : {}),
          ...(thumbnailId ? { thumbnail: { connect: { id: thumbnailId } } } : {}),
          status: (status ?? existing.status) as any,
          config: mapConfig,
          year,
          version: nextVersion,
        },
      });
      action = 'updated';
    } else {
      map = await prisma.dataset.create({
        data: {
          slug,
          title: resolvedTitle ?? slug,
          titleI18n,
          description: resolvedDescription ?? '',
          descriptionI18n,
          summary: summary ?? '',
          ...(summaryI18n ? { summaryI18n } : {}),
          ...(codebookTextI18n ? {
            codebookText: codebookTextI18n.he || codebookTextI18n.en || null,
            codebookTextI18n,
          } : {}),
          ...(thumbnailId ? { thumbnail: { connect: { id: thumbnailId } } } : {}),
          status: (status ?? 'draft') as any,
          config: mapConfig,
          year,
          version: nextVersion,
        },
      });
      action = 'created';
    }

    // Create deployment record
    await prisma.datasetDeployment.create({
      data: {
        datasetId: map.id,
        version: nextVersion,
        changeLog: changeLog ?? null,
        gitSha: gitSha ?? null,
        cliVersion: cliVersion ?? null,
      },
    });

    // Recreate layer associations if layerSlugs provided
    if (layerSlugs && layerSlugs.length > 0) {
      // Delete existing associations
      await prisma.datasetLayerAssociation.deleteMany({ where: { datasetId: map.id } });

      // Create new associations
      for (let i = 0; i < layerSlugs.length; i++) {
        const layer = await prisma.layer.findUnique({ where: { slug: layerSlugs[i] } });
        if (!layer) {
          console.warn(`Layer "${layerSlugs[i]}" not found — skipping association`);
          continue;
        }
        await prisma.datasetLayerAssociation.create({
          data: {
            datasetId: map.id,
            layerId: layer.id,
            zIndex: i,
            isVisible: true,
            isVisibleByDefault: true,
          },
        });
      }
    }

    return NextResponse.json({
      action,
      map: { id: map.id, slug: map.slug },
    });
  } catch (err) {
    console.error('Deploy map error:', err);
    return NextResponse.json(
      { error: 'Internal server error', message: (err as Error).message },
      { status: 500 },
    );
  }
}
