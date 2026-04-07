import { redirect } from "next/navigation";
import { isValidLocale, locales, defaultLocale, getDir } from "@/lib/i18n/config";
import { loadTranslations } from "@/lib/i18n/load-translations";
import { LanguageProvider } from "@/lib/i18n/language-provider";
import { DownloadTermsProvider } from "@/components/ui/download-terms-provider";
import type { Locale } from "@/lib/i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    redirect(`/${defaultLocale}`);
  }

  const translations = loadTranslations(locale);

  return (
    <LanguageProvider initialLanguage={locale} initialTranslations={translations}>
      <DownloadTermsProvider>
        {children}
      </DownloadTermsProvider>
    </LanguageProvider>
  );
}
