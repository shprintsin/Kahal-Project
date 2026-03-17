type I18nJson = Record<string, string> | null | undefined;

export function getContentTranslation(
  i18nJson: I18nJson,
  langCode: string,
  fallback?: string
): string {
  if (!i18nJson || typeof i18nJson !== "object") {
    return fallback ?? "";
  }
  return i18nJson[langCode] ?? i18nJson["en"] ?? i18nJson["he"] ?? fallback ?? "";
}
