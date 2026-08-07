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
  // 整个页面逻辑包一个大 try/catch → 任何意外都走 fallback，绝不抛 5xx
  try {
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

    let candidates: AIGift[] = [];
    let totalCandidates = 0;

    try {
      // 1. Fetch 30 candidate products from Supabase
      const { data: products } = await fetchProducts({
        audience: audienceSlug as any,
        occasion: occasionSlug,
        limit: 30,
      });

      if (products && products.length > 0) {
        const mapped = products.map(productToGift) as AIGift[];
        totalCandidates = mapped.length;

        // 2. Try AI recommendation
        let aiResult = null;
        try {
          aiResult = await getAIGiftRecommendations(quizAnswers, mapped);
        } catch (aiErr) {
          console.error("AI recommendation threw (caught):", aiErr);
          aiResult = null;
        }

        if (aiResult && aiResult.picks && aiResult.picks.length > 0) {
          candidates = aiResult.picks;
          totalCandidates = aiResult.totalCandidates || mapped.length;
        } else {
          // 3. Fallback: take first 5 from candidates
          candidates = mapped.slice(0, 5);
        }
      }
    } catch (dbErr) {
      console.error("fetchProducts in ResultsPage threw (falling back):", dbErr);
      candidates = [];
    }

    // 4. 如果上面都没拿到数据 → Ultimate fallback: hardcoded data
    if (candidates.length === 0) {
      try {
        const fallback = await getRecommendedGiftsFallback(
          audienceSlug as any,
          occasionSlug,
          5
        );
        candidates = fallback as AIGift[];
      } catch (fbErr) {
        console.error("Even fallback threw:", fbErr);
        candidates = [];
      }
    }

    const aiUsed = candidates.some((c) => typeof c.aiMatchScore === "number");

    return (
      <ResultsClient
        initialGifts={candidates}
        aiUsed={aiUsed}
        totalCandidates={totalCandidates}
      />
    );
  } catch (topErr) {
    // 最后一道防线：任何异常 → 返回空结果页（HTTP 200），绝不 5xx
    console.error("ResultsPage top-level error (rendering empty):", topErr);
    return (
      <ResultsClient
        initialGifts={[]}
        aiUsed={false}
        totalCandidates={0}
      />
    );
  }
}
