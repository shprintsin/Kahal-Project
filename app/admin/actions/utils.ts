/**
 * Utility functions for server actions
 */

/**
 * Helper to get localized string field
 * Fallback to English, then first available key, then empty string
 */
export function getLocalizedField(
  primaryValue: string | null | undefined,
  i18nField: any,
  lang?: string
): string {
  if (lang && i18nField && typeof i18nField === "object") {
    // 1. Try requested language
    if (i18nField[lang]) return i18nField[lang];

    // 2. Try English
    if (i18nField["en"]) return i18nField["en"];
  }

  // 3. Return primary value (usually English/default)
  return primaryValue || "";
}
