export const locales = ["he", "en", "pl"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "he";
export const fallbackLocale: Locale = "en";

export const localeConfig: Record<Locale, { name: string; nativeName: string; dir: "rtl" | "ltr"; dateLocale: string }> = {
  he: { name: "Hebrew", nativeName: "עברית", dir: "rtl", dateLocale: "he-IL" },
  en: { name: "English", nativeName: "English", dir: "ltr", dateLocale: "en-US" },
  pl: { name: "Polish", nativeName: "Polski", dir: "ltr", dateLocale: "pl-PL" },
};

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function isRtl(locale: Locale): boolean {
  return localeConfig[locale].dir === "rtl";
}

export function getDir(locale: Locale): "rtl" | "ltr" {
  return localeConfig[locale].dir;
}

export function getDateLocale(locale: Locale): string {
  return localeConfig[locale].dateLocale;
}
