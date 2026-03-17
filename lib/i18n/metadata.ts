import type { Metadata } from 'next';

import { getTranslation, loadTranslations } from './load-translations';

export function createLocaleAlternates(pathname: string) {
  return {
    languages: {
      'he': `/he${pathname}`,
      'en': `/en${pathname}`,
      'pl': `/pl${pathname}`,
      'x-default': `/he${pathname}`,
    }
  };
}

export function createPageMetadata(locale: string, titleKey: string, pathname: string): Metadata {
  const translations = loadTranslations(locale);
  const siteName = getTranslation(translations, 'public.site.name');
  const pageTitle = getTranslation(translations, titleKey);
  return {
    title: `${pageTitle} | ${siteName}`,
    alternates: createLocaleAlternates(pathname),
  };
}
