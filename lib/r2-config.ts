// R2 (Cloudflare) storage configuration

export const R2_CONFIG = {
  publicUrl: process.env.R2_PUBLIC_URL || "https://pub-c084dc5a07ad420f8f56f3973ac35898.r2.dev",
  bucket: process.env.R2_BUCKET || "kahal",
} as const;

/**
 * Construct a full URL for a file in R2 storage
 * @param path - The path to the file (e.g., "collections/Polltax/V42_1754/scans/V42_10_1L.png")
 * @returns Full URL to the file
 */
export function getR2Url(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${R2_CONFIG.publicUrl}/${cleanPath}`;
}

/**
 * Construct the path for a collection file
 * @param collectionId - Collection ID (e.g., "Polltax")
 * @param volumeId - Volume ID (e.g., "V42_1754")
 * @param fileType - File type directory (e.g., "scans" or "markdown")
 * @param fileName - File name (e.g., "V42_10_1L.png")
 * @returns Path to the file
 */
export function getCollectionFilePath(
  collectionId: string,
  volumeId: string,
  fileType: string,
  fileName: string
): string {
  return `collections/${collectionId}/${volumeId}/${fileType}/${fileName}`;
}

/**
 * Get the URL for a page's scan image
 * @param fileEntry - File entry from the database
 * @returns URL to the scan image
 */
export function getScanUrl(fileEntry: { url?: string; path?: string }): string {
  if (fileEntry.url) {
    return fileEntry.url;
  }
  if (fileEntry.path) {
    return getR2Url(fileEntry.path);
  }
  throw new Error('File entry has no URL or path');
}
