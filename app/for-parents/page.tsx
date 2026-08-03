import RecipientCategoryPage from "@/components/RecipientCategoryPage";
import { getAudienceGiftsFallback } from "@/lib/supabase";

export const metadata = {
  title: "For Parents — GiftHive",
  description:
    "They'll say 'don't bother' — and quietly hope you do anyway. Gifts for the people who raised you.",
};

export default async function ForParentsPage() {
  const gifts = await getAudienceGiftsFallback("for-parents");
  const filters = ["All", ...Array.from(new Set(gifts.map((g) => g.category)))];

  return (
    <RecipientCategoryPage
      heading="For Parents"
      label="For Parents"
      slug="for-parents"
      index={4}
      lede={
        <>
          They&apos;ll say &quot;don&apos;t bother&quot; —{" "}
          <span className="accent-italic text-ember-deep">
            and quietly hope you do anyway
          </span>
          . The people who raised you deserve more than a gift card.
        </>
      }
      marquee={[
        "FOR PARENTS",
        "Mom · Dad · Both of them",
        "They'll say don't bother — do it anyway",
        "More than a gift card",
      ]}
      rankedBy="what they'd never buy themselves"
      gifts={gifts}
      filters={filters}
      fromPrice="$35"
    />
  );
}
