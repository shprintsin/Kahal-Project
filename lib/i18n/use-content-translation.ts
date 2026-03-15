"use client";

import { useLanguage } from "./language-provider";

type I18nJson = Record<string, string> | null | undefined;

function resolveLanguageCode(language: string): string {
  const code = language.split("_")[0];
  return code || "he";
}

export function useContentTranslation() {
  const { language } = useLanguage();
  const langCode = resolveLanguageCode(language);

  function ct(i18nJson: I18nJson, fallback?: string): string {
    if (!i18nJson || typeof i18nJson !== "object") {
      return fallback ?? "";
    }
    return i18nJson[langCode] ?? i18nJson["he"] ?? i18nJson["en"] ?? fallback ?? "";
  }

  return { ct, langCode };
}

export function getContentTranslation(
  i18nJson: I18nJson,
  langCode: string,
  fallback?: string
): string {
  if (!i18nJson || typeof i18nJson !== "object") {
    return fallback ?? "";
  }
  return i18nJson[langCode] ?? i18nJson["he"] ?? i18nJson["en"] ?? fallback ?? "";
}
