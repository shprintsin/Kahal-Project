import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Secular_One, Rubik } from "next/font/google";
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

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  variable: "--font-rubik",
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
