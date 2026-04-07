import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  let dbConnected = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
  } catch {
    dbConnected = false;
  }

  return NextResponse.json(
    {
      ok: dbConnected,
      dbConnected,
      gitSha: process.env.GIT_SHA ?? 'unknown',
      version: process.env.npm_package_version ?? 'unknown',
      timestamp: new Date().toISOString(),
    },
    { status: dbConnected ? 200 : 503 },
  );
}
