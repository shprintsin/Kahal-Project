"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { isValidLocale, getDir, defaultLocale } from "@/lib/i18n/config";

export function HtmlDirSync() {
  const locale = useLocale();
  useEffect(() => {
    const loc = isValidLocale(locale) ? locale : defaultLocale;
    document.documentElement.lang = loc;
    document.documentElement.dir = getDir(loc);
  }, [locale]);
  return null;
}
