export function getOptimizedImageUrl(
  originalUrl: string,
  options: {
    width?: number;
    quality?: number;
  } = {}
): string {
  if (!originalUrl) return '';

  const { width = 200, quality = 75 } = options;

  const params = new URLSearchParams({
    url: originalUrl,
    w: width.toString(),
    q: quality.toString(),
  });

  return `/_next/image?${params.toString()}`;
}

export const ImagePresets = {
  thumbnail: { width: 200, quality: 75 },
  preview: { width: 600, quality: 85 },
  fullscreen: { width: 1200, quality: 90 },
} as const;
