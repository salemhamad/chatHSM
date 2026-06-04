"use client";

import { Inter, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { useI18nStore } from "../stores/i18nStore";
import { useEffect, useState } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const arabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { activeLanguage, direction, initI18n, isInitialized } = useI18nStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initI18n();
  }, [initI18n]);

  const fontStyle = activeLanguage === 'ar' || direction === 'rtl'
    ? 'var(--font-arabic), sans-serif'
    : 'var(--font-inter), sans-serif';

  return (
    <html lang={activeLanguage} dir={direction} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <meta name="description" content="ChatHSM - Private & Secure Advanced AI Assistant" />
        <meta name="theme-color" content="#06b6d4" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <title>ChatHSM - AI Assistant</title>
      </head>
      <body
        className={`${inter.variable} ${arabic.variable} font-sans antialiased text-foreground min-h-[100dvh] flex flex-col`}
        style={{ fontFamily: fontStyle }}
      >
        {mounted && isInitialized ? children : <div className="flex-1 bg-[#0a0a0f]"></div>}
      </body>
    </html>
  );
}
