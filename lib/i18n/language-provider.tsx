"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { DirectionProvider } from '@radix-ui/react-direction';
import { usePathname } from 'next/navigation';
import { isValidLocale, locales, defaultLocale } from './config';
import type { TranslationData } from './load-translations';

interface LanguageContextType {
  language: string;
  locale: string;
  translations: TranslationData;
  isRtl: boolean;
  setLanguage: (lang: string) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

interface LanguageProviderProps {
  children: React.ReactNode;
  initialLanguage?: string;
  initialTranslations: TranslationData;
}

export function LanguageProvider({
  children,
  initialLanguage = 'he',
  initialTranslations,
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState(initialLanguage);
  const [translations, setTranslations] = useState<TranslationData>(initialTranslations);
  const [isRtl, setIsRtl] = useState(initialTranslations.isRtl);
  const pathname = usePathname();

  const locale = language.split("_")[0] || defaultLocale;

  const setLanguage = useCallback((lang: string) => {
    const newLocale = lang.split("_")[0] || defaultLocale;
    if (!isValidLocale(newLocale)) return;

    const segments = pathname.split('/');
    if (segments.length > 1 && isValidLocale(segments[1])) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    const newPath = segments.join('/') || `/${newLocale}`;
    window.location.href = newPath;
  }, [pathname]);

  const t = useCallback((key: string, fallback?: string): string => {
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
  }, [translations]);

  const value: LanguageContextType = {
    language,
    locale,
    translations,
    isRtl,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      <DirectionProvider dir={isRtl ? 'rtl' : 'ltr'}>
        {children}
      </DirectionProvider>
    </LanguageContext.Provider>
  );
}
