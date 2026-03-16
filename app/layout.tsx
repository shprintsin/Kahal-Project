import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Secular_One } from "next/font/google";
import { auth } from "@/auth";
import { AdminToolbarProvider } from "@/components/ui/admin-toolbar";
import "./globals.css";

export const dynamic = "force-dynamic";

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
  title: "Kahal",
  description: "Digital Archive of Jewish Communities",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="he" dir="rtl">
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
