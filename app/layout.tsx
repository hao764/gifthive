import type { Metadata, Viewport } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { defaultLocale, locales } from "@/i18n/config";
import { getSiteURL } from "@/lib/deepseek";

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

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: defaultLocale, namespace: "Nav" });
  const siteUrl = getSiteURL().replace(/\/$/, "");

  // SEO 文案（英文优先 —— 海外流量主战场）
  const title =
    "GiftHive — Gift Finder & Gift Ideas for Everyone You Love";
  const description =
    "Find thoughtful, hand-picked gift ideas for him, her, parents, kids, friends & coworkers. " +
    "Take the 6-question Gift Finder quiz and get personalized gift recommendations chosen by people who actually held them.";
  const keywords = [
    "gift ideas",
    "gift finder",
    "gift guide",
    "personalized gifts",
    "best gifts for him",
    "best gifts for her",
    "birthday gifts",
    "anniversary gifts",
    "christmas gifts",
    "unique gifts",
    "thoughtful gifts",
    "GiftHive",
  ];

  return {
    // ——— metadataBase：所有相对路径（OG 图片、canonical、sitemap）都按这个算 ———
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | GiftHive — Gift Finder & Gift Ideas`,
    },
    description,
    keywords,
    authors: [{ name: "GiftHive", url: siteUrl }],
    creator: "GiftHive",
    publisher: "GiftHive",
    category: "Shopping / Gift Guides",
    classification: "Gift Finder",
    applicationName: "GiftHive",
    generator: "Next.js",

    // ——— canonical：避免重复内容权重分散 ———
    alternates: {
      canonical: "/",
      languages: {
        en: "/en",
        zh: "/zh",
        ja: "/ja",
        es: "/es",
        de: "/de",
        "x-default": "/",
      },
    },

    // ——— OpenGraph（Facebook / LinkedIn / iMessage 卡片）———
    openGraph: {
      type: "website",
      url: siteUrl,
      siteName: "GiftHive",
      title,
      description,
      locale: "en_US",
      images: [
        {
          url: "/og-default.svg",
          width: 1200,
          height: 630,
          alt: "GiftHive — Find the right gift, without the guessing",
        },
      ],
    },

    // ——— Twitter / X 卡片 ———
    twitter: {
      card: "summary_large_image",
      site: "@gifthive",
      creator: "@gifthive",
      title,
      description,
      images: ["/og-default.svg"],
    },

    // ——— 图标 ———
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
      apple: "/favicon.svg",
    },

    // ——— 常见 Rich Result 元字段 ———
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    abstract: description,
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFF6EC" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1613" },
  ],
  width: "device-width",
  initialScale: 1,
};

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
  const siteUrl = getSiteURL().replace(/\/$/, "");

  // ——— WebSite JSON-LD（Google 用来做 Sitelinks 搜索框 + 站点理解）———
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: "GiftHive",
    alternateName: "Gift Hive",
    description:
      "Find thoughtful, hand-picked gift ideas for him, her, parents, kids, friends & coworkers.",
    inLanguage: "en",
    publisher: {
      "@type": "Organization",
      name: "GiftHive",
      url: siteUrl,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/for-him?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html
      lang={validLocale}
      className={`${playfair.variable} ${sourceSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
      </head>
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
