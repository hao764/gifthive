import RecipientCategoryPage from "@/components/RecipientCategoryPage";
import { getAudienceGiftsFallback } from "@/lib/supabase";

export const metadata = {
  title: "For Coworkers — GiftHive",
  description:
    "Thoughtful, never awkward — a small way to say 'thanks'. Coworker gifts that don't miss.",
};

export default async function ForCoworkersPage() {
  const gifts = await getAudienceGiftsFallback("for-coworkers");
  const filters = ["All", ...Array.from(new Set(gifts.map((g) => g.category)))];

  return (
    <RecipientCategoryPage
      heading="For Coworkers"
      label="For Coworkers"
      slug="for-coworkers"
      index={6}
      lede={
        <>
          Thoughtful,{" "}
          <span className="accent-italic text-ember-deep">never awkward</span>{" "}
          — a small way to say &quot;thanks&quot;. Coworker gifts that don&apos;t
          miss, and never cross the line.
        </>
      }
      marquee={[
        "FOR COWORKERS",
        "Team · Manager · Desk neighbor",
        "Thoughtful, never awkward",
        "A small way to say thanks",
      ]}
      rankedBy="how safe it is to give at work"
      gifts={gifts}
      filters={filters}
      fromPrice="$19"
    />
  );
}
