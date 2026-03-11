/**
 * Generates a URL-friendly slug from a title if it contains only English characters, numbers, and common symbols.
 * Returns null if the title contains non-English characters (like Hebrew).
 */
export function generateSlugFromTitle(title: string): string | null {
  // Check if title contains only ASCII characters (English, numbers, symbols)
  // We allow basic punctuation but main check is avoiding Hebrew/other scripts
  const isEnglish = /^[\x00-\x7F]*$/.test(title);

  if (!isEnglish) {
    return null;
  }

  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word chars (except spaces and dashes)
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with dashes
    .replace(/^-+|-+$/g, ""); // Trim dashes
}
