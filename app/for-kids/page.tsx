import RecipientCategoryPage from "@/components/RecipientCategoryPage";
import { getAudienceGiftsFallback } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Category");
  return {
    title: `${t("forKids.heading")} — GiftHive`,
    description: t("forKids.heading"),
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
