import RecipientCategoryPage from "@/components/RecipientCategoryPage";
import { getAudienceGiftsFallback } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { getSiteURL } from "@/lib/deepseek";

export const runtime = "edge";

export async function generateMetadata(): Promise<Metadata> {
  const base = getSiteURL().replace(/\/$/, "");
  const title = "Best Gifts For Coworkers In 2026 — Professional, Never Awkward | GiftHive";
  const description = "Coworker gifts that actually land — Secret Santa picks, thank-you gifts for teammates, desk accessories for your manager, and cheap-but-nice office gifts that don't cross the line.";
  const keywords = ["gifts for coworkers", "secret santa gifts", "gifts for manager", "gifts for team", "desk accessories", "office gifts", "thank you gifts for coworkers", "cheap gifts for coworkers", "work gifts", "going away gifts for coworker", "white elephant gifts", "coworker christmas gifts", "farewell gifts for coworkers"];
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: "/for-coworkers",
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
      url: `${base}/for-coworkers`,
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

export default async function ForCoworkersPage() {
  const gifts = await getAudienceGiftsFallback("for-coworkers");
  const filters = ["All", ...Array.from(new Set(gifts.map((g) => g.category)))];

  return (
    <RecipientCategoryPage
      slug="for-coworkers"
      index={6}
      gifts={gifts}
      filters={filters}
      fromPrice="$19"
    />
  );
}
