import { getPublicUrl } from "@/utils/storage";

export function getStorageUrl(filePath: string): string {
  const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
  return getPublicUrl(cleanPath);
}

export function getCollectionFilePath(
  collectionId: string,
  volumeId: string,
  fileType: string,
  fileName: string
): string {
  return `collections/${collectionId}/${volumeId}/${fileType}/${fileName}`;
}

export function getScanUrl(fileEntry: { url?: string; path?: string }): string {
  if (fileEntry.url) {
    return fileEntry.url;
  }
  if (fileEntry.path) {
    return getStorageUrl(fileEntry.path);
  }
  throw new Error("File entry has no URL or path");
}
