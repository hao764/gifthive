import RecipientCategoryPage from "@/components/RecipientCategoryPage";
import { getAudienceGiftsFallback } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Category");
  return {
    title: `${t("forCoworkers.heading")} — GiftHive`,
    description: t("forCoworkers.heading"),
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
