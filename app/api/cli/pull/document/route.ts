import { NextRequest, NextResponse } from 'next/server';
import { authenticateCli } from '../../middleware';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await authenticateCli(req);
  if (auth instanceof NextResponse) return auth;

  const rows = await prisma.documentV2.findMany({
    orderBy: { updatedAt: 'desc' },
    select: {
      slug: true,
      sourceLang: true,
      nameI18n: true,
      dateStart: true,
      status: true,
      updatedAt: true,
      _count: { select: { chapters: true } },
    },
  });

  return NextResponse.json({
    ok: true,
    result: rows.map((r) => ({
      slug: r.slug,
      sourceLang: r.sourceLang,
      nameI18n: r.nameI18n,
      dateStart: r.dateStart,
      status: r.status,
      updatedAt: r.updatedAt,
      chapterCount: r._count.chapters,
    })),
  });
}
