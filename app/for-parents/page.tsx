import RecipientCategoryPage from "@/components/RecipientCategoryPage";
import { getAudienceGiftsFallback } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Category");
  return {
    title: `${t("forParents.heading")} — GiftHive`,
    description: t("forParents.heading"),
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
