// TODO(A-6): fold this into the unified /api/cli/deploy action endpoint once
// uploads move to presigned URLs. Multipart form upload doesn't fit the JSON
// {action, data} envelope cleanly, so it stays as its own route for now.

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateCli } from '../../middleware';
import { uploadBuffer } from '@/utils/storage';

export async function POST(req: NextRequest) {
  const auth = await authenticateCli(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const slug = formData.get('slug') as string | null;

    if (!file || !slug) {
      return NextResponse.json(
        { error: 'file and slug are required' },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop() ?? 'png';
    const key = `thumbnail/${slug}_${Date.now()}.${ext}`;
    const publicUrl = await uploadBuffer(buffer, key);

    const media = await prisma.media.create({
      data: {
        filename: file.name,
        url: publicUrl,
        altTextI18n: {},
      },
    });

    return NextResponse.json({ mediaId: media.id, url: publicUrl });
  } catch (err) {
    console.error('Thumbnail upload error:', err);
    return NextResponse.json(
      { error: 'Internal server error', message: (err as Error).message },
      { status: 500 },
    );
  }
}
