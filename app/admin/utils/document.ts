import { MarkdownFile } from "@/types/document";

/**
 * Generate a URL-safe slug from a title
 */
export function generateDocumentSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Sort markdown files by numeric prefix and process them
 * Example: ['0003.md', '0001.md', '0002.md'] -> sorted as [0001, 0002, 0003]
 */
export function sortMarkdownFiles(files: MarkdownFile[]): MarkdownFile[] {
  return files.sort((a, b) => {
    // Extract numeric prefix from filename
    const extractNumber = (filename: string): number => {
      const match = filename.match(/^(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    };

    const numA = extractNumber(a.name);
    const numB = extractNumber(b.name);

    return numA - numB;
  });
}
