import RecipientCategoryPage from "@/components/RecipientCategoryPage";
import { getAudienceGiftsFallback } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { getSiteURL } from "@/lib/deepseek";

export const runtime = "edge";

export async function generateMetadata(): Promise<Metadata> {
  const base = getSiteURL().replace(/\/$/, "");
  const title = "Best Gifts For Her In 2026 — Meaningful & Thoughtful Gift Ideas | GiftHive";
  const description = "The most thoughtful gifts for her — from romantic anniversary gifts for girlfriends and wives to sentimental gifts for mom, sisters, and best friends. Hand-picked, not the catalog junk.";
  const keywords = ["gifts for her", "best gifts for women", "gift ideas for girlfriend", "anniversary gifts for her", "birthday gifts for her", "gifts for wife", "gifts for mom", "sentimental gifts for her", "unique gifts for women", "romantic gifts for her", "christmas gifts for her", "thoughtful gifts for her", "gifts for sister"];
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: "/for-her",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      url: `${base}/for-her`,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ForHerPage() {
  const gifts = await getAudienceGiftsFallback("for-her");
  const filters = ["All", ...Array.from(new Set(gifts.map((g) => g.category)))];

  return (
    <RecipientCategoryPage
      slug="for-her"
      index={2}
      gifts={gifts}
      filters={filters}
      fromPrice="$28"
    />
  );
}
