import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateCli } from '../../middleware';

export async function POST(req: NextRequest) {
  const authError = authenticateCli(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const {
      slug, title, description, summary, summaryI18n,
      status, maturity, version,
      license, citationText, minYear, maxYear, isVisible,
      categorySlug, regionSlugs,
      titleI18n, descriptionI18n, codebookTextI18n, sourcesI18n,
      thumbnailId, resources, gitSha, cliVersion,
    } = body;

    if (!slug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }

    // Resolve title: prefer Hebrew, then English, then bare value
    const resolvedTitle = titleI18n?.he || titleI18n?.en || title || slug;
    const resolvedDescription = descriptionI18n?.he || descriptionI18n?.en || description || '';

    // Resolve category slug -> id
    let categoryId: string | undefined;
    if (categorySlug) {
      const cat = await prisma.category.findUnique({ where: { slug: categorySlug }, select: { id: true } });
      if (!cat) {
        return NextResponse.json({ error: `Category not found: ${categorySlug}` }, { status: 400 });
      }
      categoryId = cat.id;
    }

    // Resolve region slugs -> ids
    let regionIds: string[] = [];
    if (regionSlugs && regionSlugs.length > 0) {
      const regions = await prisma.region.findMany({
        where: { slug: { in: regionSlugs } },
        select: { id: true, slug: true },
      });
      const foundSlugs = new Set(regions.map((r: { slug: string }) => r.slug));
      const missing = regionSlugs.filter((s: string) => !foundSlugs.has(s));
      if (missing.length > 0) {
        return NextResponse.json({ error: `Region(s) not found: ${missing.join(', ')}` }, { status: 400 });
      }
      regionIds = regions.map((r: { id: string }) => r.id);
    }

    const existing = await prisma.dataset.findUnique({ where: { slug } });

    let dataset;
    let action: string;

    // Auto-bump version on update
    let nextVersion = version ?? '1.0.0';
    if (existing) {
      const current = existing.version ?? '1.0.0';
      const parts = current.split('.').map(Number);
      if (parts.length === 3 && parts.every((n: number) => !isNaN(n))) {
        parts[2] += 1;
        nextVersion = parts.join('.');
      }

      dataset = await prisma.dataset.update({
        where: { id: existing.id },
        data: {
          title: resolvedTitle,
          titleI18n: titleI18n ?? existing.titleI18n,
          description: resolvedDescription,
          descriptionI18n: descriptionI18n ?? existing.descriptionI18n,
          summary: summary ?? existing.summary,
          ...(summaryI18n ? { summaryI18n } : {}),
          ...(codebookTextI18n ? {
            codebookText: codebookTextI18n.he || codebookTextI18n.en || null,
            codebookTextI18n,
          } : {}),
          ...(sourcesI18n ? {
            sources: sourcesI18n.he || sourcesI18n.en || null,
            sourcesI18n,
          } : {}),
          ...(thumbnailId ? { thumbnail: { connect: { id: thumbnailId } } } : {}),
          ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
          status: (status ?? existing.status) as any,
          maturity: (maturity ?? existing.maturity) as any,
          version: nextVersion,
          license: license ?? existing.license,
          citationText: citationText ?? existing.citationText,
          minYear: minYear ?? existing.minYear,
          maxYear: maxYear ?? existing.maxYear,
          isVisible: isVisible ?? existing.isVisible,
        },
      });
      action = 'updated';
    } else {
      dataset = await prisma.dataset.create({
        data: {
          slug,
          title: resolvedTitle,
          titleI18n: titleI18n ?? {},
          description: resolvedDescription,
          descriptionI18n: descriptionI18n ?? {},
          summary: summary ?? '',
          ...(summaryI18n ? { summaryI18n } : {}),
          ...(codebookTextI18n ? {
            codebookText: codebookTextI18n.he || codebookTextI18n.en || null,
            codebookTextI18n,
          } : {}),
          ...(sourcesI18n ? {
            sources: sourcesI18n.he || sourcesI18n.en || null,
            sourcesI18n,
          } : {}),
          ...(thumbnailId ? { thumbnail: { connect: { id: thumbnailId } } } : {}),
          ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
          status: (status ?? 'draft') as any,
          maturity: (maturity ?? 'Provisional') as any,
          version: nextVersion,
          license: license ?? null,
          citationText: citationText ?? null,
          minYear: minYear ?? null,
          maxYear: maxYear ?? null,
          isVisible: isVisible ?? true,
        },
      });
      action = 'created';
    }

    // Set regions
    if (regionIds.length > 0) {
      await prisma.dataset.update({
        where: { id: dataset.id },
        data: { regions: { set: regionIds.map((id: string) => ({ id })) } },
      });
    }

    // Upsert resources
    if (resources && resources.length > 0) {
      // Delete existing resources for this dataset
      await prisma.datasetResource.deleteMany({ where: { datasetId: dataset.id } });

      for (const r of resources) {
        await prisma.datasetResource.create({
          data: {
            datasetId: dataset.id,
            name: r.name,
            slug: r.slug,
            url: r.url,
            filename: r.filename ?? null,
            mimeType: r.mimeType ?? null,
            format: (r.format ?? 'UNKNOWN') as any,
            sizeBytes: r.sizeBytes ?? null,
            isMainFile: r.isMainFile ?? false,
            excerptI18n: r.excerptI18n ?? {},
          },
        });
      }
    }

    return NextResponse.json({
      action,
      dataset: { id: dataset.id, slug: dataset.slug },
    });
  } catch (err) {
    console.error('Deploy dataset error:', err);
    return NextResponse.json(
      { error: 'Internal server error', message: (err as Error).message },
      { status: 500 },
    );
  }
}
