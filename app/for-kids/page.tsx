import RecipientCategoryPage from "@/components/RecipientCategoryPage";
import { getAudienceGiftsFallback } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { getSiteURL } from "@/lib/deepseek";

export const runtime = "edge";

export async function generateMetadata(): Promise<Metadata> {
  const base = getSiteURL().replace(/\/$/, "");
  const title = "Best Gifts For Kids In 2026 — Fun, Educational & Kid-Approved | GiftHive";
  const description = "Gifts kids actually want — educational toys, creative craft kits, STEM projects, and outdoor adventure gear for toddlers, boys & girls ages 3–12. Parent-approved, durable, no cheap junk.";
  const keywords = ["gifts for kids", "best toys for kids", "gifts for boys", "gifts for girls", "educational gifts for kids", "stem gifts for kids", "gifts for toddlers", "christmas gifts for kids", "birthday gifts for kids", "kids gift ideas", "creative gifts for kids", "toys for 5 year old", "toys for 8 year old"];
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: "/for-kids",
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
      url: `${base}/for-kids`,
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

export default async function ForKidsPage() {
  const gifts = await getAudienceGiftsFallback("for-kids");
  const filters = ["All", ...Array.from(new Set(gifts.map((g) => g.category)))];

  return (
    <RecipientCategoryPage
      slug="for-kids"
      index={3}
      gifts={gifts}
      filters={filters}
      fromPrice="$24"
    />
  );
}
