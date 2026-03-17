"use client";

import { useLanguage } from "./language-provider";
import { getContentTranslation } from "./content-translation";

export { getContentTranslation } from "./content-translation";

type I18nJson = Record<string, string> | null | undefined;

export function useContentTranslation() {
  const { language } = useLanguage();
  const langCode = language.split("_")[0] || "he";

  function ct(i18nJson: I18nJson, fallback?: string): string {
    return getContentTranslation(i18nJson, langCode, fallback);
  }

  return { ct, langCode };
}
