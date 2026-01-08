import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export interface TranslationData {
  lang: string;
  isRtl: boolean;
  [key: string]: any;
}

const translationsCache = new Map<string, TranslationData>();

export function loadTranslations(language: string = 'he_default'): TranslationData {
  // Check cache first
  if (translationsCache.has(language)) {
    return translationsCache.get(language)!;
  }

  try {
    const languagesDir = path.join(process.cwd(), 'languages');
    const filePath = path.join(languagesDir, `${language}.yml`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.warn(`Translation file not found: ${filePath}, falling back to he_default`);
      if (language !== 'he_default') {
        return loadTranslations('he_default');
      }
      throw new Error('Default translation file (he_default.yml) not found');
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(fileContents) as TranslationData;

    // Validate required fields
    if (!data.lang || typeof data.isRtl !== 'boolean') {
      throw new Error(`Invalid translation file format: ${filePath}`);
    }

    // Cache the translations
    translationsCache.set(language, data);

    return data;
  } catch (error) {
    console.error(`Error loading translations for ${language}:`, error);
    
    // If not already trying default, fall back to it
    if (language !== 'he_default') {
      return loadTranslations('he_default');
    }
    
    // Return minimal fallback
    return {
      lang: 'Hebrew',
      isRtl: true,
    };
  }
}

export function getAvailableLanguages(): string[] {
  try {
    const languagesDir = path.join(process.cwd(), 'languages');
    
    if (!fs.existsSync(languagesDir)) {
      return ['he_default'];
    }

    const files = fs.readdirSync(languagesDir);
    return files
      .filter(file => file.endsWith('.yml'))
      .map(file => file.replace('.yml', ''));
  } catch (error) {
    console.error('Error reading available languages:', error);
    return ['he_default'];
  }
}

// Helper function to get nested translation value
export function getTranslation(translations: TranslationData, key: string, fallback?: string): string {
  const keys = key.split('.');
  let value: any = translations;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Key not found, return fallback or key itself
      return fallback || key;
    }
  }

  return typeof value === 'string' ? value : (fallback || key);
}
