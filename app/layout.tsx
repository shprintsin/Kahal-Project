import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Secular_One } from "next/font/google";
import { auth } from "@/auth";
import { AdminToolbarProvider } from "@/components/ui/admin-toolbar";
import { cookies } from "next/headers";
import { isValidLocale, defaultLocale, getDir } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const secular = Secular_One({
  weight: "400",
  subsets: ["latin"],
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${secular.variable} font-sans antialiased bg-gray-50`}
      >
        <AdminToolbarProvider user={session?.user ?? null}>
          {children}
        </AdminToolbarProvider>
      </body>
    </html>
  );
}
