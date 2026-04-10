import type { Metadata } from "next";

import { ContactForm } from "@/app/components/contact/ContactForm";
import { getSiteShellData } from "@/app/lib/get-navigation";
import { SiteMain, SiteShell } from "@/components/ui/site-shell";
import { locales } from "@/lib/i18n/config";
import { getTranslations } from "next-intl/server";
import { createPageMetadata } from "@/lib/i18n/metadata";

export const dynamic = "force-static";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return createPageMetadata(locale, "public.contact.title", "/contact");
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [shellData, t] = await Promise.all([
    getSiteShellData(locale),
    getTranslations({ locale }),
  ]);

  const title = t("public.contact.title");
  const intro = t("public.contact.intro");

  return (
    <SiteShell {...shellData} bg="bg-white" locale={locale}>
      <SiteMain>
        <div className="w-full lg:w-8/12 mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 font-display text-foreground border-b pb-4">
            {title}
          </h1>
          {intro && (
            <p className="text-sm sm:text-base text-muted-foreground mb-8">
              {intro}
            </p>
          )}
          <ContactForm />
        </div>
      </SiteMain>
    </SiteShell>
  );
}
