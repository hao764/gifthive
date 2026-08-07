import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { defaultLocale, locales } from "@/i18n/config";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export async function generateMetadata() {
  const t = await getTranslations({ locale: defaultLocale, namespace: "Nav" });
  return {
    title: "GiftHive — Find the right gift, without the guessing",
    description:
      "GiftHive helps you find a gift for someone who matters. Answer six questions, get five picks chosen by people who actually held them.",
    keywords: ["gift ideas", "gift finder", "gift guide", "GiftHive"],
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
      apple: "/favicon.svg",
    },
  } as Metadata;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || defaultLocale;
  const validLocale = (locales as readonly string[]).includes(locale)
    ? locale
    : defaultLocale;

  const messages = await getMessages();

  return (
    <html
      lang={validLocale}
      className={`${playfair.variable} ${sourceSans.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-cream text-ink">
        <NextIntlClientProvider messages={messages} locale={validLocale}>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
