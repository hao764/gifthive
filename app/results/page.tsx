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

    // ————— 预算 → DB 层 price_range 映射 —————
    // Supabase 的 price_range 字段：cheap / mid / high
    // 在数据库查询时就过滤掉不匹配的，减少网络传输量
    const BUDGET_TO_PRICE_RANGE: Record<string, "cheap" | "mid" | "high"> = {
      "0-30": "cheap",
      "30-75": "cheap",
      "75-150": "mid",
      "150-400": "high",
      "400+": "high",
    };
    const budgetVal = quizAnswers.budget;
    const isBudgetCustom = budgetVal?.startsWith("custom:");
    const dbPriceRange = budgetVal && !isBudgetCustom
      ? BUDGET_TO_PRICE_RANGE[budgetVal]
      : budgetVal === "flexible"
        ? undefined
        : undefined;

    try {
      // 1. Fetch candidate products from Supabase（DB 层过滤：audience + occasion + price_range）
      const { data: products } = await fetchProducts({
        audience: hasAnyCustom ? undefined : (audienceSlug as any),
        occasion: hasAnyCustom ? undefined : occasionSlug,
        priceRange: dbPriceRange,
        limit: 200,
      });

      if (products && products.length > 0) {
        let mapped = products.map(productToGift) as AIGift[];

        // ————— 代码层精确预算过滤 —————
        // DB 层 price_range 是粗分类（cheap/mid/high），这里做精确价格区间过滤
        if (budgetVal && !isBudgetCustom && budgetVal !== "flexible") {
          mapped = mapped.filter((g) => {
            const p = g.price;
            switch (budgetVal) {
              case "0-30": return p < 30;
              case "30-75": return p >= 30 && p < 75;
              case "75-150": return p >= 75 && p < 150;
              case "150-400": return p >= 150 && p <= 400;
              case "400+": return p > 400;
              default: return true;
            }
          });
        }

        // ————— 代码层：兴趣标签匹配 —————
        // 用户选了 interests（tech/coffee/outdoor/reading/cooking/music）
        // 只保留 tags 至少匹配一个兴趣的商品；如果匹配数太少（<5）则放弃过滤
        const interestVal = quizAnswers.interests;
        if (interestVal && !interestVal.startsWith("custom:")) {
          // 兴趣关键词 → 商品 tags 里可能出现的匹配词
          const INTEREST_KEYWORDS: Record<string, string[]> = {
            tech: ["tech", "electronics", "gadget", "desk", "productivity"],
            coffee: ["coffee", "tea", "mug", "drink", "morning"],
            outdoor: ["outdoor", "camp", "sports", "active", "adventure"],
            reading: ["reading", "book", "notebook", "stationery"],
            cooking: ["cooking", "kitchen", "food", "pantry"],
            music: ["music", "vinyl", "audio", "record"],
          };
          const keywords = INTEREST_KEYWORDS[interestVal];
          if (keywords) {
            const filtered = mapped.filter((g) =>
              g.tags.some((tag) =>
                keywords.some((kw) => tag.toLowerCase().includes(kw))
              )
            );
            // 只在过滤后还有足够候选时才应用，否则保留全部让 AI 来选
            if (filtered.length >= 5) {
              mapped = filtered;
            }
          }
        }

        // ————— 代码层：礼物风格匹配 —————
        // 用户选了 giftStyle，按 category 做偏好过滤
        // 匹配数太少（<5）则放弃，保留全部让 AI 判断
        const styleVal = quizAnswers.giftStyle;
        if (styleVal && !styleVal.startsWith("custom:")) {
          const STYLE_CATEGORIES: Record<string, string[]> = {
            "practical-item": ["Daily", "Home", "Wear", "Stationery", "Desk"],
            "experience": ["Experience", "Outdoor", "Games"],
            "creative": ["Games", "Art", "Toys", "Crafts"],
            "classic": [], // classic = 不过滤，全部保留
          };
          const preferredCats = STYLE_CATEGORIES[styleVal];
          if (preferredCats && preferredCats.length > 0) {
            const filtered = mapped.filter((g) =>
              preferredCats.some((cat) =>
                g.category.toLowerCase().includes(cat.toLowerCase())
              )
            );
            if (filtered.length >= 5) {
              mapped = filtered;
            }
          }
        }

        totalCandidates = mapped.length;
        console.log(`[Filter] ${products.length} fetched → ${mapped.length} after filter (budget=${budgetVal}, interests=${interestVal}, style=${styleVal}) → AI`);

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
