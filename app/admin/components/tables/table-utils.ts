import React from "react";

export interface LanguageOption {
  code: string;
  label: string;
  flag: string;
}

export const DEFAULT_LANGUAGES: LanguageOption[] = [
  { code: "he", label: "Hebrew", flag: "HE" },
  { code: "en", label: "English", flag: "EN" },
];

export function getI18nText(
  value: unknown,
  fallbackText = "Untitled",
  order: string[] = ["en", "he"]
): string {
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    for (const key of order) {
      const v = obj[key];
      if (v && typeof v === "string") return v;
    }
    const first = Object.values(value)[0];
    if (typeof first === "string" && first.length > 0) return first;
  }
  if (typeof value === "string" && value.length > 0) return value;
  return fallbackText;
}

// Helpers to keep table column definitions concise and reusable.
export const i18nTextCell = (value: unknown, fallback?: string) => getI18nText(value, fallback);

export const codeCell = (text: string | number | null | undefined) =>
  React.createElement("code", { className: "text-sm" }, text ?? "-");

export const mutedCell = (text: string | number | null | undefined) =>
  React.createElement("span", { className: "text-sm text-muted-foreground" }, text ?? "-");

export const badgeCell = (
  content: React.ReactNode,
  variant: "default" | "secondary" | "outline" = "outline"
) => {
  const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
  const variantClass =
    variant === "default"
      ? "bg-primary text-primary-foreground"
      : variant === "secondary"
      ? "bg-muted text-foreground"
      : "border border-border text-muted-foreground";
  return React.createElement("span", { className: `${base} ${variantClass}` }, content);
};

export const rightActions = (children: React.ReactNode) =>
  React.createElement("div", { className: "flex justify-end gap-2" }, children);

export function buildI18nColumns(langs: LanguageOption[], labelPrefix: string, width = "w-[20%]") {
  return langs.map((lang) => ({
    key: lang.code,
    label: `${labelPrefix} (${lang.flag})`,
    width,
    placeholder: lang.label,
    dir: lang.code === "he" ? "rtl" : "ltr",
    align: lang.code === "he" ? "right" : "left",
  }));
}

export function flattenI18n<T>(item: T, field: string, langs: LanguageOption[]) {
  const obj = item as Record<string, unknown>;
  return {
    ...item,
    ...langs.reduce<Record<string, string>>((acc, lang) => {
      const fieldValue = obj[field] as Record<string, string> | undefined;
      acc[lang.code] = fieldValue?.[lang.code] || "";
      return acc;
    }, {}),
  };
}

export function unflattenI18n(values: Record<string, unknown>, field: string, langs: LanguageOption[]) {
  return {
    ...values,
    [field]: langs.reduce<Record<string, string>>((acc, lang) => {
      acc[lang.code] = (values[lang.code] as string) || "";
      return acc;
    }, {}),
  };
}
