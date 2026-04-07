import type { Metadata } from "next";
import { Heebo, Secular_One } from "next/font/google";
import { auth } from "@/auth";
import { AdminToolbarProvider } from "@/components/ui/admin-toolbar";
import { cookies } from "next/headers";
import { isValidLocale, defaultLocale, getDir } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/config";
import "./globals.css";

const heebo = Heebo({
  subsets: ["latin", "hebrew"],
  variable: "--font-heebo",
});

const secular = Secular_One({
  weight: "400",
  subsets: ["latin", "hebrew"],
  variable: "--font-secular",
});

export const metadata: Metadata = {
  title: "ShtetlAtlas",
  description: "Digital Archive of Jewish Communities",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const locale: Locale = localeCookie && isValidLocale(localeCookie) ? localeCookie : defaultLocale;
  const dir = getDir(locale);

  return (
    <html lang={locale} dir={dir}>
      <body
        className={`${heebo.variable} ${secular.variable} font-sans antialiased bg-gray-50`}
      >
        <AdminToolbarProvider user={session?.user ?? null}>
          {children}
        </AdminToolbarProvider>
      </body>
    </html>
  );
}
