import RecipientCategoryPage from "@/components/RecipientCategoryPage";
import { getAudienceGiftsFallback } from "@/lib/supabase";

export const metadata = {
  title: "For Friends — GiftHive",
  description:
    "For the person you think of, without needing a reason. Gifts that say you noticed.",
};

export default async function ForFriendsPage() {
  const gifts = await getAudienceGiftsFallback("for-friends");
  const filters = ["All", ...Array.from(new Set(gifts.map((g) => g.category)))];

  return (
    <RecipientCategoryPage
      heading="For Friends"
      label="For Friends"
      slug="for-friends"
      index={5}
      lede={
        <>
          For the person you think of,{" "}
          <span className="accent-italic text-ember-deep">
            without needing a reason
          </span>
          . Gifts that say &quot;I noticed&quot; — without saying too much.
        </>
      }
      marquee={[
        "FOR FRIENDS",
        "Close · New · Old · Far away",
        "Gifts that say you noticed",
        "Without saying too much",
      ]}
      rankedBy="the story behind it"
      gifts={gifts}
      filters={filters}
      fromPrice="$24"
    />
  );
}
