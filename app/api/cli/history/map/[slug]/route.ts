import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateCli } from '../../../middleware';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const authError = authenticateCli(req);
  if (authError) return authError;

  try {
    const { slug } = await params;

    const deployments = await prisma.mapDeployment.findMany({
      where: { map: { slug } },
      orderBy: { deployedAt: 'desc' },
      take: 20,
      select: {
        version: true,
        changeLog: true,
        gitSha: true,
        deployedAt: true,
      },
    });

    return NextResponse.json(deployments);
  } catch (err) {
    console.error('History error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
