import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateCli } from '../../../middleware';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const auth = await authenticateCli(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { slug } = await params;

    const deployments = await prisma.datasetDeployment.findMany({
      where: { dataset: { slug } },
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
