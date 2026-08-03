import RecipientCategoryPage from "@/components/RecipientCategoryPage";
import { getAudienceGiftsFallback } from "@/lib/supabase";

export const metadata = {
  title: "For Him — GiftHive",
  description:
    "For fathers, partners, brothers — the ones who'd never ask. Gifts he'll actually use.",
};

export default async function ForHimPage() {
  const gifts = await getAudienceGiftsFallback("for-him");
  const filters = ["All", ...Array.from(new Set(gifts.map((g) => g.category)))];

  return (
    <RecipientCategoryPage
      heading="For Him"
      label="For Him"
      slug="for-him"
      index={1}
      lede={
        <>
          For fathers, partners, brothers —{" "}
          <span className="accent-italic text-ember-deep">
            the ones who&apos;d never ask
          </span>
          . Not the polite catalog stuff — what we&apos;d actually spend our
          own money on.
        </>
      }
      marquee={[
        "FOR HIM",
        "Fathers · Partners · Brothers · Friends",
        "Gifts he'll actually use",
        "Not the catalog stuff",
      ]}
      rankedBy="what he'd love"
      gifts={gifts}
      filters={filters}
      fromPrice="$28"
    />
  );
}
