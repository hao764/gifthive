import ResultsClient from "./page.client";
import { fetchProducts, getRecommendedGiftsFallback } from "@/lib/supabase";
import { getAIGiftRecommendations, type AIGift } from "@/lib/deepseek";
import { productToGift } from "@/lib/data";

// Cloudflare Pages 需要 Edge Runtime
export const runtime = "edge";

export const metadata = {
  title: "Your Results — GiftHive",
  description:
    "Personalized gift picks based on your answers. Five things, ranked by how much they'll love them.",
};

const RECIPIENT_MAP: Record<string, string> = {
  him: "for-him",
  her: "for-her",
  kids: "for-kids",
  parents: "for-parents",
  friends: "for-friends",
};

const OCCASION_MAP: Record<string, string> = {
  birthday: "birthday",
  anniversary: "anniversary",
  holiday: "christmas",
  thanks: "thanks",
  apology: "birthday",
  "no-reason": "christmas",
};

type SearchParams = {
  recipient?: string;
  occasion?: string;
  budget?: string;
  interests?: string;
  personality?: string;
  closeness?: string;
};

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const quizAnswers: Record<string, string | undefined> = {
    recipient: searchParams?.recipient,
    occasion: searchParams?.occasion,
    budget: searchParams?.budget,
    interests: searchParams?.interests,
    personality: searchParams?.personality,
    closeness: searchParams?.closeness,
  };

  const audienceSlug = RECIPIENT_MAP[quizAnswers.recipient || ""];
  const occasionSlug = OCCASION_MAP[quizAnswers.occasion || ""];

  // 1. Fetch 30 candidate products from Supabase
  const { data: products } = await fetchProducts({
    audience: audienceSlug,
    occasion: occasionSlug,
    limit: 30,
  });

  let gifts: AIGift[] = [];
  let aiUsed = false;
  let totalCandidates = 0;

  if (products && products.length > 0) {
    const candidates = products.map(productToGift);
    totalCandidates = candidates.length;

    // 2. Try AI recommendation
    const aiResult = await getAIGiftRecommendations(quizAnswers, candidates);

    if (aiResult) {
      gifts = aiResult.picks;
      aiUsed = true;
      totalCandidates = aiResult.totalCandidates;
    } else {
      // 3. Fallback: take first 5 from candidates
      gifts = candidates.slice(0, 5);
    }
  } else {
    // 4. Ultimate fallback: hardcoded data
    const fallback = await getRecommendedGiftsFallback(audienceSlug as any, occasionSlug, 5);
    gifts = fallback;
  }

  return (
    <ResultsClient
      initialGifts={gifts}
      aiUsed={aiUsed}
      totalCandidates={totalCandidates}
    />
  );
}
