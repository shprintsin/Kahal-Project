"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ContentLanguage, LanguageConfig } from "@/app/admin/types/content-system.types";

/**
 * LanguageToggle - Segmented control for i18n language switching
 * Displays as [ 🇺🇸 EN | 🇵🇱 PL ] buttons
 */

interface LanguageToggleProps {
  languages?: LanguageConfig[];
  value: ContentLanguage;
  onChange: (lang: ContentLanguage) => void;
  size?: "sm" | "md" | "lg";
}

const defaultLanguages: LanguageConfig[] = [
  { code: "en", label: "EN", flag: "🇺🇸" },
  { code: "pl", label: "PL", flag: "🇵🇱" },
];

const sizeStyles = {
  sm: "px-2 py-1 text-xs gap-1",
  md: "px-3 py-1.5 text-sm gap-1.5",
  lg: "px-4 py-2 text-base gap-2",
} as const;

export function LanguageToggle({
  languages = defaultLanguages,
  value,
  onChange,
  size = "md",
}: LanguageToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center bg-muted/50 p-0.5",
        "transition-colors duration-200"
      )}
      role="radiogroup"
      aria-label="Language selection"
    >
      {languages.map((lang, index) => (
        <React.Fragment key={lang.code}>
          {index > 0 && (
            <span className="w-px h-4 bg-border" aria-hidden="true" />
          )}
          <button
            type="button"
            role="radio"
            aria-checked={value === lang.code}
            onClick={() => onChange(lang.code)}
            className={cn(
              "inline-flex items-center font-medium transition-all duration-200",
              sizeStyles[size],
              value === lang.code
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <span aria-hidden="true">{lang.flag}</span>
            <span>{lang.label}</span>
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}
