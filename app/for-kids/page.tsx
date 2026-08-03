import RecipientCategoryPage from "@/components/RecipientCategoryPage";
import { getAudienceGiftsFallback } from "@/lib/supabase";

export const metadata = {
  title: "For Kids — GiftHive",
  description:
    "What makes them squeal — and what their parents nod at. Gifts kids come back to.",
};

export default async function ForKidsPage() {
  const gifts = await getAudienceGiftsFallback("for-kids");
  const filters = ["All", ...Array.from(new Set(gifts.map((g) => g.category)))];

  return (
    <RecipientCategoryPage
      heading="For Kids"
      label="For Kids"
      slug="for-kids"
      index={3}
      lede={
        <>
          What makes them squeal —{" "}
          <span className="accent-italic text-ember-deep">
            and what their parents nod at
          </span>
          . The toys they keep coming back to, not the ones that break by
          Tuesday.
        </>
      }
      marquee={[
        "FOR KIDS",
        "Under 12 · Toys · Books · Crafts",
        "What they keep coming back to",
        "Not the ones that break by Tuesday",
      ]}
      rankedBy="how long they'll play with it"
      gifts={gifts}
      filters={filters}
      fromPrice="$24"
    />
  );
}
