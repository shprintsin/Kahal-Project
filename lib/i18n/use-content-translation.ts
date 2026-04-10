"use client";

import { useLocale } from "next-intl";
import { getContentTranslation } from "./content-translation";

export { getContentTranslation } from "./content-translation";

type I18nJson = Record<string, string> | null | undefined;

export function useContentTranslation() {
  const locale = useLocale();

  function ct(i18nJson: I18nJson, fallback?: string): string {
    return getContentTranslation(i18nJson, locale, fallback);
  }

  return { ct, langCode: locale };
}
