import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Jeff IP test",
  description: "Stakeholder chat for testing Jeff teaching IP alignment.",
};

/**
 * Root layout for the Jeff IP test webapp.
 * Uses system fonts so local/dev does not depend on Google Fonts fetch.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
