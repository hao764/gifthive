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
        limit: 1000,
      });

      if (products && products.length > 0) {
        let mapped = products.map(productToGift) as AIGift[];

        // ————— 第2层：硬过滤召回（代码层精确过滤）—————

        // 2a. 精确预算过滤
        const interestVal = quizAnswers.interests;
        const styleVal = quizAnswers.giftStyle;
        const applyBudgetFilter = (arr: AIGift[], budget: string): AIGift[] => {
          return arr.filter((g) => {
            const p = g.price;
            switch (budget) {
              case "0-30": return p < 30;
              case "30-75": return p >= 30 && p < 75;
              case "75-150": return p >= 75 && p < 150;
              case "150-400": return p >= 150 && p <= 400;
              case "400+": return p > 400;
              default: return true;
            }
          });
        };
        if (budgetVal && !isBudgetCustom && budgetVal !== "flexible") {
          mapped = applyBudgetFilter(mapped, budgetVal);
        }

        // 2b. 兴趣标签匹配
        const INTEREST_KEYWORDS: Record<string, string[]> = {
          tech: ["tech", "electronics", "gadget", "desk", "productivity"],
          coffee: ["coffee", "tea", "mug", "drink", "morning"],
          outdoor: ["outdoor", "camp", "sports", "active", "adventure"],
          reading: ["reading", "book", "notebook", "stationery"],
          cooking: ["cooking", "kitchen", "food", "pantry"],
          music: ["music", "vinyl", "audio", "record"],
        };
        const applyInterestFilter = (arr: AIGift[], interest: string): AIGift[] => {
          const kw = INTEREST_KEYWORDS[interest];
          if (!kw) return arr;
          return arr.filter((g) => g.tags.some((tag) => kw.some((k) => tag.toLowerCase().includes(k))));
        };
        if (interestVal && !interestVal.startsWith("custom:") && INTEREST_KEYWORDS[interestVal]) {
          const filtered = applyInterestFilter(mapped, interestVal);
          if (filtered.length >= 5) mapped = filtered;
        }

        // 2c. 礼物风格匹配（支持中文品类 + 英文旧品类）
        const STYLE_CATEGORIES: Record<string, string[]> = {
          "practical-item": ["数码配件", "家居生活", "文具文创", "饰品配饰", "Daily", "Home", "Wear", "Stationery", "Desk"],
          "experience": ["运动户外", "食品茶饮", "Experience", "Outdoor", "Games"],
          "creative": ["手工DIY", "毛绒玩具", "文具文创", "Games", "Art", "Toys", "Crafts"],
          "classic": [],
        };
        if (styleVal && !styleVal.startsWith("custom:") && STYLE_CATEGORIES[styleVal]?.length > 0) {
          const cats = STYLE_CATEGORIES[styleVal];
          const filtered = mapped.filter((g) => cats.some((c) => g.category.toLowerCase().includes(c.toLowerCase())));
          if (filtered.length >= 5) mapped = filtered;
        }

        // ————— 逐级放宽兜底：候选 < 8 时自动放宽条件 —————
        if (mapped.length < 8) {
          console.log(`[Fallback] Only ${mapped.length} after hard filter, relaxing...`);
          // 第1级放宽：去掉风格过滤
          let relaxed = products.map(productToGift) as AIGift[];
          if (budgetVal && !isBudgetCustom && budgetVal !== "flexible") {
            relaxed = applyBudgetFilter(relaxed, budgetVal);
          }
          if (interestVal && !interestVal.startsWith("custom:") && INTEREST_KEYWORDS[interestVal]) {
            const f = applyInterestFilter(relaxed, interestVal);
            if (f.length >= 5) relaxed = f;
          }
          if (relaxed.length >= 8) {
            mapped = relaxed;
          } else {
            // 第2级放宽：只保留预算过滤，去掉兴趣
            relaxed = products.map(productToGift) as AIGift[];
            if (budgetVal && !isBudgetCustom && budgetVal !== "flexible") {
              relaxed = applyBudgetFilter(relaxed, budgetVal);
            }
            if (relaxed.length >= 8) {
              mapped = relaxed;
            } else {
              // 第3级放宽：去掉所有过滤，用全部商品
              mapped = products.map(productToGift) as AIGift[];
            }
          }
          console.log(`[Fallback] After relax: ${mapped.length} candidates`);
        }

        // ————— 第3层：粗排打分（标签加权 + 价格贴合度）—————
        // 纯代码打分，不调 AI，取 Top 15-20 传给 AI 精排
        const budgetMidpoint = (() => {
          switch (budgetVal) {
            case "0-30": return 15;
            case "30-75": return 52;
            case "75-150": return 112;
            case "150-400": return 275;
            case "400+": return 500;
            default: return 100;
          }
        })();

        const scored = mapped.map((g) => {
          let score = 0;
          // 兴趣匹配：权重 1.5
          if (interestVal && !interestVal.startsWith("custom:")) {
            const kw = INTEREST_KEYWORDS[interestVal];
            if (kw && g.tags.some((t) => kw.some((k) => t.toLowerCase().includes(k)))) {
              score += 1.5;
            }
          }
          // 风格匹配：权重 1.5
          if (styleVal && !styleVal.startsWith("custom:")) {
            const cats = STYLE_CATEGORIES[styleVal];
            if (cats && cats.length > 0 && cats.some((c) => g.category.toLowerCase().includes(c.toLowerCase()))) {
              score += 1.5;
            }
          }
          // 价格贴合度：越接近预算中值分越高（0-1分）
          if (budgetVal && !isBudgetCustom && budgetVal !== "flexible") {
            const diff = Math.abs(g.price - budgetMidpoint);
            const maxRange = budgetVal === "400+" ? 500 : budgetMidpoint;
            score += Math.max(0, 1 - diff / maxRange);
          }
          // 场景匹配：tags 里包含场合关键词，权重 2
          if (occasionSlug) {
            if (g.tags.some((t) => t.toLowerCase().includes(occasionSlug.toLowerCase()))) {
              score += 2;
            }
          }
          // 关系匹配：tags 里包含受众关键词，权重 3
          if (audienceSlug) {
            if (g.tags.some((t) => t.toLowerCase().includes(audienceSlug.replace("for-", "")))) {
              score += 3;
            }
          }
          return { gift: g, score };
        });

        // 按分数降序排列，取 Top 20
        scored.sort((a, b) => b.score - a.score);
        const topCandidates = scored.slice(0, 20).map((s) => s.gift);

        totalCandidates = mapped.length;
        console.log(`[Pipeline] ${products.length} fetched → ${mapped.length} after filter → ${topCandidates.length} to AI (budget=${budgetVal}, interests=${interestVal}, style=${styleVal})`);

        // 4. Try AI recommendation — 只传 Top 20 精排后的候选给 AI
        let aiResult = null;
        try {
          aiResult = await getAIGiftRecommendations(quizAnswers, topCandidates, { geoHint });
        } catch (aiErr) {
          console.error("AI recommendation threw (caught):", aiErr);
          aiResult = null;
        }

        if (aiResult && aiResult.picks && aiResult.picks.length > 0) {
          candidates = aiResult.picks;
          totalCandidates = aiResult.totalCandidates || topCandidates.length;
        } else {
          // Fallback: take top 5 from scored candidates
          candidates = topCandidates.slice(0, 5);
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
