import RecipientCategoryPage from "@/components/RecipientCategoryPage";
import { getAudienceGiftsFallback } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Category");
  return {
    title: `${t("forHim.heading")} — GiftHive`,
    description: t("forHim.heading"),
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
