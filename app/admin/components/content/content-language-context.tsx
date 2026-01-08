"use client";

import * as React from "react";
import type { ContentLanguage, TranslatableContent } from "@/app/admin/types/content-system.types";

/**
 * ContentLanguageContext - React context for i18n language state management
 * Holds translations for all languages and manages current language view
 */

interface ContentLanguageContextValue {
  /** Current active language */
  currentLanguage: ContentLanguage;
  /** Set the current language */
  setLanguage: (lang: ContentLanguage) => void;
  /** All translations keyed by language */
  translations: Record<ContentLanguage, Record<string, unknown>>;
  /** Update translations for a specific language */
  setTranslations: (lang: ContentLanguage, data: Record<string, unknown>) => void;
  /** Get a translated value with fallback */
  getTranslation: <T>(key: string, fallback?: T) => T | undefined;
  /** Update a single field in current language */
  updateField: (key: string, value: unknown) => void;
}

const ContentLanguageContext = React.createContext<ContentLanguageContextValue | null>(null);

interface ContentLanguageProviderProps {
  children: React.ReactNode;
  defaultLanguage?: ContentLanguage;
  initialTranslations?: Partial<Record<ContentLanguage, Record<string, unknown>>>;
}

export function ContentLanguageProvider({
  children,
  defaultLanguage = "en",
  initialTranslations = {},
}: ContentLanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = React.useState<ContentLanguage>(defaultLanguage);
  const [translations, setTranslationsState] = React.useState<
    Record<ContentLanguage, Record<string, unknown>>
  >({
    en: initialTranslations.en ?? {},
    pl: initialTranslations.pl ?? {},
    he: initialTranslations.he ?? {},
  });

  const setLanguage = React.useCallback((lang: ContentLanguage) => {
    setCurrentLanguage(lang);
  }, []);

  const setTranslations = React.useCallback(
    (lang: ContentLanguage, data: Record<string, unknown>) => {
      setTranslationsState((prev) => ({
        ...prev,
        [lang]: { ...prev[lang], ...data },
      }));
    },
    []
  );

  const getTranslation = React.useCallback(
    <T,>(key: string, fallback?: T): T | undefined => {
      const langData = translations[currentLanguage];
      if (langData && key in langData) {
        return langData[key] as T;
      }
      // Fallback to English
      if (currentLanguage !== "en" && translations.en && key in translations.en) {
        return translations.en[key] as T;
      }
      return fallback;
    },
    [currentLanguage, translations]
  );

  const updateField = React.useCallback(
    (key: string, value: unknown) => {
      setTranslationsState((prev) => ({
        ...prev,
        [currentLanguage]: {
          ...prev[currentLanguage],
          [key]: value,
        },
      }));
    },
    [currentLanguage]
  );

  const value = React.useMemo(
    () => ({
      currentLanguage,
      setLanguage,
      translations,
      setTranslations,
      getTranslation,
      updateField,
    }),
    [currentLanguage, setLanguage, translations, setTranslations, getTranslation, updateField]
  );

  return (
    <ContentLanguageContext.Provider value={value}>
      {children}
    </ContentLanguageContext.Provider>
  );
}

/**
 * Hook to access the content language context
 */
export function useContentLanguage() {
  const context = React.useContext(ContentLanguageContext);
  if (!context) {
    throw new Error("useContentLanguage must be used within ContentLanguageProvider");
  }
  return context;
}

/**
 * Hook to get a translatable field value
 */
export function useTranslatableField<T = string>(key: string, fallback?: T) {
  const { getTranslation, updateField, currentLanguage } = useContentLanguage();

  const value = getTranslation<T>(key, fallback);

  const setValue = React.useCallback(
    (newValue: T) => {
      updateField(key, newValue);
    },
    [key, updateField]
  );

  return [value, setValue, currentLanguage] as const;
}
