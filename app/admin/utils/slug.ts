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
 * @param name - The i18n object containing translations
 * @param fallback - Fallback value if no translation found
 * @returns The extracted name or fallback
 */
export function extractI18nName(name: any, fallback = ""): string {
  if (typeof name === "object" && name !== null) {
    return name.en || name.he || Object.values(name)[0] || fallback;
  }
  return fallback;
}
