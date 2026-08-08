import RecipientCategoryPage from "@/components/RecipientCategoryPage";
import { getAudienceGiftsFallback } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { getSiteURL } from "@/lib/deepseek";

export const runtime = "edge";

export async function generateMetadata(): Promise<Metadata> {
  const base = getSiteURL().replace(/\/$/, "");
  const title = "Best Gifts For Him In 2026 — Thoughtful Gifts Men Actually Want | GiftHive";
  const description = "Hand-picked gifts for him — unique gifts for boyfriends, husbands, dads, brothers, and best friends. Budget-friendly picks from $20 to premium, chosen by guys who actually use them.";
  const keywords = ["gifts for him", "best gifts for men", "boyfriend gift ideas", "gifts for boyfriend", "gifts for husband", "gifts for dad", "gifts for guys", "cool gifts for him", "unique gifts for men", "mens gift ideas", "anniversary gifts for him", "birthday gifts for boyfriend", "christmas gifts for men"];
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: "/for-him",
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
      url: `${base}/for-him`,
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

export default async function ForHimPage() {
  const gifts = await getAudienceGiftsFallback("for-him");
  const filters = ["All", ...Array.from(new Set(gifts.map((g) => g.category)))];

  return (
    <RecipientCategoryPage
      slug="for-him"
      index={1}
      gifts={gifts}
      filters={filters}
      fromPrice="$28"
    />
  );
}
