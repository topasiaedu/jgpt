import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Instrument_Serif, Inter, Manrope, Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";

import Providers from "@/components/Providers";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const notoSansSc = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-sc",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
  display: "swap",
});

const notoSerifSc = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-noto-serif-sc",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Influence Engine Coach",
  description: "Influence Engine personal IP coach for Brand Warriors practice.",
};

/**
 * Root layout for Influence Engine Coach.
 * Manrope headlines + Noto Sans SC body; Instrument / Noto Serif for create ask.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const fontClasses: string = [
    manrope.variable,
    notoSansSc.variable,
    inter.variable,
    instrumentSerif.variable,
    notoSerifSc.variable,
  ].join(" ");

  return (
    <html lang="zh-Hans" className={fontClasses}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
