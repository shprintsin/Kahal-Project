import { redirect } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { isValidLocale, locales, defaultLocale } from "@/lib/i18n/config";
import { DownloadTermsProvider } from "@/components/ui/download-terms-provider";
import { HtmlDirSync } from "@/components/html-dir-sync";

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

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <HtmlDirSync />
      <DownloadTermsProvider>
        {children}
      </DownloadTermsProvider>
    </NextIntlClientProvider>
  );
}
