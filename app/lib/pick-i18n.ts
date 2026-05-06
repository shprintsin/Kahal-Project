import { resolveI18nField } from "@/lib/i18n/fallback";
import type { Locale } from "@/i18n/routing";

/**
 * Convenience wrapper that always returns a string. Picks the best available
 * translation from a JSON i18n field for the given locale.
 */
export function pickI18n(
  json: unknown,
  locale: Locale,
  fallback = "",
): string {
  return (
    resolveI18nField<string>(
      json as Partial<Record<string, string>> | null | undefined,
      locale,
      fallback,
    ) ?? fallback
  );
}
