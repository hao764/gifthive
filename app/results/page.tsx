import ResultsClient from "./page.client";
import { fetchProducts, getRecommendedGiftsFallback } from "@/lib/supabase";
import { getAIGiftRecommendations, type AIGift } from "@/lib/deepseek";
import { productToGift } from "@/lib/data";
import { getTranslations } from "next-intl/server";
import { headers as nextHeaders } from "next/headers";
import type { Metadata } from "next";

export const runtime = "edge";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Results");
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

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
  age?: string;
  occasion?: string;
  budget?: string;
  interests?: string;
  personality?: string;
  giftStyle?: string;
  closeness?: string;
};

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // 整个页面逻辑包一个大 try/catch → 任何意外都走 fallback，绝不抛 5xx
  try {
    // ————— Geo 智能路由：取 Cloudflare 注入的国家码 —————
    // Cloudflare Pages Edge Runtime 自动填：
    //   cf-ipcountry         ：2 位 ISO country code（推荐）
    //   x-geoip-country      ：备用，某些平台填的这个
    // 拿不到就传 undefined，内部保持默认顺序（先 DeepSeek 再 Groq 降级）
    let geoHint: string | undefined;
    try {
      const hdrs = nextHeaders();
      geoHint =
        hdrs.get("cf-ipcountry") ||
        hdrs.get("x-geoip-country") ||
        undefined;
      if (geoHint) geoHint = geoHint.trim().toUpperCase();
      // Cloudflare 某些异常场景用 XX / T1（Tor 等）当作未知，传空
      if (geoHint === "XX" || geoHint === "T1") geoHint = undefined;
    } catch (_) {
      // headers() 在非常罕见的环境会抛（比如本地 next dev 没有 Edge context），吞掉即可
    }

    const quizAnswers: Record<string, string | undefined> = {
      recipient: searchParams?.recipient,
      age: searchParams?.age,
      occasion: searchParams?.occasion,
      budget: searchParams?.budget,
      interests: searchParams?.interests,
      personality: searchParams?.personality,
      giftStyle: searchParams?.giftStyle,
      closeness: searchParams?.closeness,
    };

    // Detect custom answers (user typed their own description instead of picking a preset)
    const isCustom = (val?: string): boolean => val?.startsWith("custom:") ?? false;
    const hasAnyCustom = isCustom(quizAnswers.recipient) || isCustom(quizAnswers.occasion)
      || isCustom(quizAnswers.interests) || isCustom(quizAnswers.personality);

    const audienceSlug = RECIPIENT_MAP[quizAnswers.recipient || ""];
    const occasionSlug = OCCASION_MAP[quizAnswers.occasion || ""];

    let candidates: AIGift[] = [];
    let totalCandidates = 0;

    try {
      // 1. Fetch candidate products from Supabase
      // 拉取更大的候选池（200件），然后做本地预算预过滤，只把少量高匹配候选传给 AI
      // 这样大幅降低 AI 调用成本（token 数），同时保证推荐质量
      const { data: products } = await fetchProducts({
        audience: hasAnyCustom ? undefined : (audienceSlug as any),
        occasion: hasAnyCustom ? undefined : occasionSlug,
        limit: 200,
      });

      if (products && products.length > 0) {
        let mapped = products.map(productToGift) as AIGift[];

        // ————— 基础条件预过滤：预算 —————
        // 严格按用户选的预算区间过滤，超预算的直接剔除，不传给 AI
        const budgetVal = quizAnswers.budget;
        if (budgetVal && !budgetVal.startsWith("custom:")) {
          mapped = mapped.filter((g) => {
            const p = g.price;
            switch (budgetVal) {
              case "0-30": return p < 30;
              case "30-75": return p >= 30 && p < 75;
              case "75-150": return p >= 75 && p < 150;
              case "150-400": return p >= 150 && p <= 400;
              case "400+": return p > 400;
              case "flexible": return true; // 不过滤
              default: return true;
            }
          });
        }

        totalCandidates = mapped.length;

        // 2. Try AI recommendation
        let aiResult = null;
        try {
          aiResult = await getAIGiftRecommendations(quizAnswers, mapped, { geoHint });
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
