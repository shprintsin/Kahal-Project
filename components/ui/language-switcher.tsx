"use client";

import { useLanguage } from "@/lib/i18n/language-provider";
import { locales, localeConfig } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/config";

export function LanguageSwitcher() {
  const { locale, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => setLanguage(loc)}
          className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
            locale === loc
              ? "bg-white/20 text-white"
              : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
          aria-label={localeConfig[loc].name}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
