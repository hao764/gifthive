import RecipientCategoryPage from "@/components/RecipientCategoryPage";
import { getAudienceGiftsFallback } from "@/lib/supabase";

export const metadata = {
  title: "For Her — GiftHive",
  description:
    "For mothers, partners, sisters — gifts that won't gather dust. Thoughtful, not generic.",
};

export default async function ForHerPage() {
  const gifts = await getAudienceGiftsFallback("for-her");
  const filters = ["All", ...Array.from(new Set(gifts.map((g) => g.category)))];

  return (
    <RecipientCategoryPage
      heading="For Her"
      label="For Her"
      slug="for-her"
      index={2}
      lede={
        <>
          For mothers, partners, sisters —{" "}
          <span className="accent-italic text-ember-deep">
            the ones who notice the small things
          </span>
          . Not the safe catalog picks — what she&apos;d actually keep, use,
          and remember.
        </>
      }
      marquee={[
        "FOR HER",
        "Mothers · Partners · Sisters · Friends",
        "Gifts that won't gather dust",
        "Thoughtful, not generic",
      ]}
      rankedBy="what she'd love"
      gifts={gifts}
      filters={filters}
      fromPrice="$28"
    />
  );
}
