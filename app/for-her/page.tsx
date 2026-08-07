import RecipientCategoryPage from "@/components/RecipientCategoryPage";
import { getAudienceGiftsFallback } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export const runtime = "edge";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Category");
  return {
    title: `${t("forHer.heading")} — GiftHive`,
    description: t("forHer.heading"),
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
