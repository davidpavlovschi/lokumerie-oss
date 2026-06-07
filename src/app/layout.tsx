import type { Metadata } from "next";
import { Fredoka, Nunito, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { cookies } from "next/headers";
import "./globals.css";
import { validateEnv } from "@/lib/env";

validateEnv();

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lokumerie",
  description: "A self-hosted private package registry for team AI know-how.",
  metadataBase: new URL(appUrl),
  openGraph: {
    title: "Lokumerie",
    description: "A self-hosted private package registry for team AI know-how.",
    siteName: "Lokumerie",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lokumerie",
    description: "A self-hosted private package registry for team AI know-how.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const cookieStore = await cookies();
  const raw = cookieStore.get("theme")?.value || "miel-dark";
  const parts = raw.split("-");
  const theme = parts[0] || "miel";
  const mode = parts[1] || "dark";
  const contrast = parts[2] || "default";

  return (
    <html lang={locale} data-theme={theme} data-mode={mode} data-contrast={contrast}>
      <body
        className={`${fredoka.variable} ${nunito.variable} ${jetbrains.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
