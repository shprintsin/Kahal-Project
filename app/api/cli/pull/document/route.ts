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
      primaryLang: true,
      titleI18n: true,
      year: true,
      pageCount: true,
      headingCount: true,
      status: true,
      updatedAt: true,
      _count: { select: { translations: true } },
    },
  });

  return NextResponse.json({ ok: true, result: rows });
}
