import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Manrope, Noto_Sans_SC } from "next/font/google";

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

export const metadata: Metadata = {
  title: "Influence Engine Coach",
  description: "Influence Engine personal IP coach for Brand Warriors practice.",
};

/**
 * Root layout for Influence Engine Coach.
 * Manrope headlines + Noto Sans SC body; Inter as EN fallback.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="zh-Hans" className={`${manrope.variable} ${notoSansSc.variable} ${inter.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
