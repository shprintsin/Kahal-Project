"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DirectionProvider } from '@radix-ui/react-direction';
import type { TranslationData } from './load-translations';

interface LanguageContextType {
  language: string;
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
  initialLanguage = 'he_default',
  initialTranslations 
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState(initialLanguage);
  const [translations, setTranslations] = useState<TranslationData>(initialTranslations);
  const [isRtl, setIsRtl] = useState(initialTranslations.isRtl);

  const setLanguage = useCallback(async (lang: string) => {
    try {
      // Fetch translations from API route
      const response = await fetch(`/api/translations?lang=${lang}`);
      if (!response.ok) {
        throw new Error('Failed to load translations');
      }
      
      const data: TranslationData = await response.json();
      
      setLanguageState(lang);
      setTranslations(data);
      setIsRtl(data.isRtl);
      
      // Save to cookie
      document.cookie = `language=${lang}; path=/; max-age=31536000`; // 1 year
      
      // Update document direction
      document.documentElement.dir = data.isRtl ? 'rtl' : 'ltr';
      document.documentElement.lang = lang.split('_')[0]; // e.g., 'he' from 'he_default'
    } catch (error) {
      console.error('Error changing language:', error);
    }
  }, []);

  // Translation helper function
  const t = useCallback((key: string, fallback?: string): string => {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Key not found
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Translation key not found: ${key}`);
        }
        return fallback || key;
      }
    }

    return typeof value === 'string' ? value : (fallback || key);
  }, [translations]);

  // Set initial document direction
  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language.split('_')[0];
  }, [isRtl, language]);

  const value: LanguageContextType = {
    language,
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
