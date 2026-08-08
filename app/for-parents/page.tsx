import RecipientCategoryPage from "@/components/RecipientCategoryPage";
import { getAudienceGiftsFallback } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { getSiteURL } from "@/lib/deepseek";

export const runtime = "edge";

export async function generateMetadata(): Promise<Metadata> {
  const base = getSiteURL().replace(/\/$/, "");
  const title = "Best Gifts For Parents In 2026 — Mom, Dad, & Both Together | GiftHive";
  const description = "Gifts parents will actually love — not the mug. Heartfelt gift ideas for mom, practical presents for dad, and couples gifts they can use together for birthdays, anniversaries, and Christmas.";
  const keywords = ["gifts for parents", "gifts for mom", "gifts for dad", "best gifts for parents", "christmas gifts for parents", "anniversary gifts for parents", "sentimental gifts for mom", "practical gifts for dad", "couples gifts", "gifts for both parents", "birthday gift for mom", "birthday gift for dad", "family gifts"];
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: "/for-parents",
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
      url: `${base}/for-parents`,
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

export default async function ForParentsPage() {
  const gifts = await getAudienceGiftsFallback("for-parents");
  const filters = ["All", ...Array.from(new Set(gifts.map((g) => g.category)))];

  return (
    <RecipientCategoryPage
      slug="for-parents"
      index={4}
      gifts={gifts}
      filters={filters}
      fromPrice="$35"
    />
  );
}
