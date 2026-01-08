/**
 * Generate a consistent color from a string using hash function
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}

/**
 * Generate a harmonious color palette with N colors
 */
export function generatePalette(count: number, saturation = 70, lightness = 60): string[] {
  const colors: string[] = [];
  const goldenRatio = 0.618033988749895;
  let hue = Math.random();
  
  for (let i = 0; i < count; i++) {
    hue += goldenRatio;
    hue %= 1;
    colors.push(hslToHex(hue * 360, saturation, lightness));
  }
  
  return colors;
}

/**
 * Convert HSL to Hex color
 */
export function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Calculate luminance of a color
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  
  const [r, g, b] = rgb.map(val => {
    val /= 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Get contrasting text color (black or white) for a background color
 */
export function getContrastColor(backgroundColor: string): string {
  const luminance = getLuminance(backgroundColor);
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Convert hex color to RGB array
 */
export function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

/**
 * Generate color dictionary for unique values
 */
export function generateColorDict(values: string[]): Record<string, string> {
  const colorDict: Record<string, string> = {};
  
  if (values.length <= 10) {
    // Use harmonious palette for small sets
    const palette = generatePalette(values.length);
    values.forEach((value, index) => {
      colorDict[value] = palette[index];
    });
  } else {
    // Use hash-based colors for large sets
    values.forEach(value => {
      colorDict[value] = stringToColor(value);
    });
  }
  
  return colorDict;
}
