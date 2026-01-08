/**
 * Generate a URL-friendly slug from text
 * @param text - The text to convert to a slug
 * @param includeUnicode - Whether to include Hebrew and Cyrillic characters
 * @returns URL-friendly slug
 */
export function generateSlug(text: string, includeUnicode = false): string {
  const pattern = includeUnicode 
    ? /[^a-z0-9\u0590-\u05FF\u0400-\u04FF]+/g  // Include Hebrew and Cyrillic
    : /[^a-z0-9]+/g;
    
  return text
    .toLowerCase()
    .replace(pattern, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Extract a name from an i18n object, trying multiple languages
 * @param nameI18n - The i18n object containing translations
 * @param fallback - Fallback value if no translation found
 * @returns The extracted name or fallback
 */
export function extractI18nName(nameI18n: any, fallback = ""): string {
  if (typeof nameI18n === "object" && nameI18n !== null) {
    return nameI18n.en || nameI18n.he || nameI18n.pl || Object.values(nameI18n)[0] || fallback;
  }
  return fallback;
}
