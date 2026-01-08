import { NextRequest, NextResponse } from 'next/server';
import { loadTranslations } from '@/lib/i18n/load-translations';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lang = searchParams.get('lang') || 'he_default';

  try {
    const translations = loadTranslations(lang);
    return NextResponse.json(translations);
  } catch (error) {
    console.error('Error loading translations:', error);
    return NextResponse.json(
      { error: 'Failed to load translations' },
      { status: 500 }
    );
  }
}
