import type { Locale } from '@/i18n/routing';

export const FALLBACK_CHAIN: Record<Locale, readonly Locale[]> = {
  he: ['he', 'en'],
  en: ['en', 'he'],
} as const;

/**
 * Resolve a {he?, en?} or legacy {he?, en?, pl?} JSON field in
 * fallback order for the given locale. Returns the first non-empty value.
 * Ignores any legacy `pl` key silently.
 */
export function resolveI18nField<T = string>(
  json: Partial<Record<string, T>> | null | undefined,
  locale: Locale,
  fallback?: T,
): T | undefined {
  if (!json || typeof json !== 'object') return fallback;
  for (const lang of FALLBACK_CHAIN[locale]) {
    const v = json[lang];
    if (v != null && v !== '') return v;
  }
  return fallback;
}
