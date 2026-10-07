import type { Metadata } from "next";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { Instrument_Serif, Inter, Manrope, Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";

import Providers from "@/components/Providers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_KEY,
  parseLocale,
  type Locale,
} from "@/lib/i18n/messages";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

/** Body UI: drop unused 500 face. Extra CJK cuts were slowing first paint on every route. */
const notoSansSc = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-sans-sc",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/** Create-ask display faces: defer preload; not needed for first chrome paint. */
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
  display: "swap",
  preload: false,
});

const notoSerifSc = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-noto-serif-sc",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Influence Engine Coach",
  description: "Influence Engine personal IP coach for Brand Warriors practice.",
};

/**
 * Root layout for Influence Engine Coach.
 * Manrope headlines + Noto Sans SC body; Instrument / Noto Serif for create ask.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialLocale: Locale =
    parseLocale(cookieStore.get(LOCALE_COOKIE_KEY)?.value) ?? DEFAULT_LOCALE;
  const htmlLang: string = initialLocale === "zh" ? "zh-Hans" : "en";
  const fontClasses: string = [
    manrope.variable,
    notoSansSc.variable,
    inter.variable,
    instrumentSerif.variable,
    notoSerifSc.variable,
  ].join(" ");

  return (
    <html lang={htmlLang} className={fontClasses}>
      <body>
        <Providers initialLocale={initialLocale}>{children}</Providers>
      </body>
    </html>
  );
}
