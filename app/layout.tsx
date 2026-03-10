import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Secular_One, Rubik } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const secular = Secular_One({
  weight: "400",
  subsets: ["latin", "hebrew"],
  variable: "--font-secular",
  display: "swap",
});

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  variable: "--font-rubik",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kahal",
  description: "Digital Archive of Jewish Communities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${secular.variable} ${rubik.variable} font-sans antialiased bg-gray-50`}
      >
        {children}
      </body>
    </html>
  );
}
