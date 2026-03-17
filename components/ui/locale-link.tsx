"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-provider";
import { isValidLocale } from "@/lib/i18n/config";
import type { ComponentProps } from "react";

type LocaleLinkProps = ComponentProps<typeof Link>;

export function LocaleLink({ href, ...props }: LocaleLinkProps) {
  const { locale } = useLanguage();
  const hrefString = typeof href === "string" ? href : href.pathname || "";

  if (hrefString.startsWith("/admin") || hrefString.startsWith("/api") || hrefString.startsWith("/login") || hrefString.startsWith("http")) {
    return <Link href={href} {...props} />;
  }

  const segments = hrefString.split("/");
  if (segments.length > 1 && isValidLocale(segments[1])) {
    return <Link href={href} {...props} />;
  }

  const localizedHref = `/${locale}${hrefString.startsWith("/") ? hrefString : `/${hrefString}`}`;

  return <Link href={typeof href === "string" ? localizedHref : { ...href, pathname: localizedHref }} {...props} />;
}
