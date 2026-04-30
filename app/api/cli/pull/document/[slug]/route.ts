import { NextRequest, NextResponse } from 'next/server';
import { authenticateCli } from '../../../middleware';
import prisma from '@/lib/prisma';

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
      translations: {
        select: { lang: true, markdown: true },
        orderBy: { lang: 'asc' },
      },
    },
  });
  if (!row) {
    return NextResponse.json({ ok: false, error: 'document not found' }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    result: {
      config: {
        type: 'document',
        slug: row.slug,
        status: row.status,
        source_lang: row.primaryLang,
        year: row.year,
        title: row.titleI18n,
        description: row.descriptionI18n,
        archive: row.archive,
        scans: row.scans,
        license: row.license,
      },
      translations: row.translations,
    },
  });
}
