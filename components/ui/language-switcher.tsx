"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { locales, localeConfig } from "@/lib/i18n/config";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as any });
  };

  return (
    <div className="flex items-center gap-1">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
            locale === loc
              ? "bg-brand-primary text-white"
              : "text-brand-primary/70 hover:text-brand-primary hover:bg-brand-primary/10"
          }`}
          aria-label={localeConfig[loc].name}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
