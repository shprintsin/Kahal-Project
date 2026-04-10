import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export function createLocaleAlternates(pathname: string) {
  return {
    languages: {
      'he': `/he${pathname}`,
      'en': `/en${pathname}`,
      'x-default': `/he${pathname}`,
    }
  };
}

export async function createPageMetadata(locale: string, titleKey: string, pathname: string): Promise<Metadata> {
  const t = await getTranslations({ locale });
  const siteName = t('public.site.name');
  const pageTitle = t(titleKey as any);
  return {
    title: `${pageTitle} | ${siteName}`,
    alternates: createLocaleAlternates(pathname),
  };
}
