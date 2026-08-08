import RecipientCategoryPage from "@/components/RecipientCategoryPage";
import { getAudienceGiftsFallback } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { getSiteURL } from "@/lib/deepseek";

export const runtime = "edge";

export async function generateMetadata(): Promise<Metadata> {
  const base = getSiteURL().replace(/\/$/, "");
  const title = "Best Gifts For Friends In 2026 — Best Friend & Long-Distance Gift Ideas | GiftHive";
  const description = "Gifts that say 'I noticed' — great gifts for your best friend, small gifts for new friends, and long-distance gifts for people you miss. Thoughtful, never cringey.";
  const keywords = ["gifts for friends", "best friend gifts", "gifts for best friend", "small gifts for friends", "thoughtful gifts for friends", "long distance gifts", "christmas gifts for friends", "birthday gifts for best friend", "friend gift ideas", "going away gifts for friends", "housewarming gifts", "galentines gifts", "bff gifts"];
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: "/for-friends",
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
      url: `${base}/for-friends`,
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

export default async function ForFriendsPage() {
  const gifts = await getAudienceGiftsFallback("for-friends");
  const filters = ["All", ...Array.from(new Set(gifts.map((g) => g.category)))];

  return (
    <RecipientCategoryPage
      slug="for-friends"
      index={5}
      gifts={gifts}
      filters={filters}
      fromPrice="$24"
    />
  );
}
