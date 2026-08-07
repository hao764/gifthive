import RecipientCategoryPage from "@/components/RecipientCategoryPage";
import { getAudienceGiftsFallback } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export const runtime = "edge";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Category");
  return {
    title: `${t("forFriends.heading")} — GiftHive`,
    description: t("forFriends.heading"),
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
