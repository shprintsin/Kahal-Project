import { NextRequest, NextResponse } from 'next/server';
import { authenticateCli } from '../../../middleware';
import { uploadBuffer } from '@/utils/storage';

const MIME_TO_FORMAT: Record<string, string> = {
  'text/csv': 'CSV',
  'application/json': 'JSON',
  'application/pdf': 'PDF',
  'text/plain': 'TXT',
  'text/html': 'HTML',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/zip': 'ZIP',
  'image/png': 'PNG',
  'image/jpeg': 'JPG',
  'image/tiff': 'TIFF',
};

const EXT_TO_FORMAT: Record<string, string> = {
  csv: 'CSV', json: 'JSON', pdf: 'PDF', txt: 'TXT', html: 'HTML',
  xlsx: 'XLSX', xls: 'XLS', docx: 'DOCX', zip: 'ZIP',
  png: 'PNG', jpg: 'JPG', jpeg: 'JPG', tiff: 'TIFF', tif: 'TIFF',
};

function detectFormat(filename: string, mimeType: string): string {
  if (MIME_TO_FORMAT[mimeType]) return MIME_TO_FORMAT[mimeType];
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return EXT_TO_FORMAT[ext] ?? 'UNKNOWN';
}

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
    const cleanFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `datasets/${slug}/${Date.now()}_${cleanFilename}`;

    const publicUrl = await uploadBuffer(buffer, key);
    const format = detectFormat(file.name, file.type);

    return NextResponse.json({
      url: publicUrl,
      filename: file.name,
      mimeType: file.type,
      sizeBytes: buffer.length,
      format,
    });
  } catch (err) {
    console.error('Resource upload error:', err);
    return NextResponse.json(
      { error: 'Internal server error', message: (err as Error).message },
      { status: 500 },
    );
  }
}
