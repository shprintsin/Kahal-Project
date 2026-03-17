import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export interface TranslationData {
  lang: string;
  isRtl: boolean;
  [key: string]: any;
}

const translationsCache = new Map<string, TranslationData>();

const LANGUAGE_ALIASES: Record<string, string> = {
  he_default: "he",
};

function resolveLanguageAlias(language: string): string {
  return LANGUAGE_ALIASES[language] || language;
}

export function loadTranslations(language: string = 'he'): TranslationData {
  const resolved = resolveLanguageAlias(language);

  if (translationsCache.has(resolved)) {
    return translationsCache.get(resolved)!;
  }

  try {
    const languagesDir = path.join(process.cwd(), 'languages');
    const filePath = path.join(languagesDir, `${resolved}.yml`);

    if (!fs.existsSync(filePath)) {
      console.warn(`Translation file not found: ${filePath}, falling back to he`);
      if (resolved !== 'he') {
        return loadTranslations('he');
      }
      throw new Error('Default translation file (he.yml) not found');
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(fileContents) as TranslationData;

    if (!data.lang || typeof data.isRtl !== 'boolean') {
      throw new Error(`Invalid translation file format: ${filePath}`);
    }

    translationsCache.set(resolved, data);

    return data;
  } catch (error) {
    console.error(`Error loading translations for ${resolved}:`, error);

    if (resolved !== 'he') {
      return loadTranslations('he');
    }

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
      return ['he'];
    }

    const files = fs.readdirSync(languagesDir);
    return files
      .filter(file => file.endsWith('.yml'))
      .map(file => file.replace('.yml', ''));
  } catch (error) {
    console.error('Error reading available languages:', error);
    return ['he'];
  }
}

export function getTranslation(translations: TranslationData, key: string, fallback?: string): string {
  const keys = key.split('.');
  let value: any = translations;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return fallback || key;
    }
  }

  return typeof value === 'string' ? value : (fallback || key);
}
