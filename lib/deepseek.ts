import type { Gift } from "./data";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

export type AIGift = Gift & {
  aiReason?: string;
  aiMatchScore?: number;
};

export type AIResult = {
  picks: AIGift[];
  totalCandidates: number;
  used: boolean;
};

const BUDGET_MAP: Record<string, string> = {
  "0-30": "Under $30",
  "30-75": "$30 – $75",
  "75-150": "$75 – $150",
  "150-400": "$150 – $400",
  "400+": "Over $400",
  flexible: "Flexible (any budget)",
};

const RECIPIENT_MAP: Record<string, string> = {
  him: "a man",
  her: "a woman",
  kids: "a child / teen",
  parents: "a parent",
  friends: "a friend",
  other: "someone",
};

const OCCASION_MAP: Record<string, string> = {
  birthday: "Birthday",
  anniversary: "Anniversary",
  holiday: "Holiday / Christmas",
  thanks: "Thank you",
  apology: "Apology",
  "no-reason": "Just because",
};

const INTERESTS_MAP: Record<string, string> = {
  tech: "Tech & gadgets",
  coffee: "Coffee & tea",
  outdoor: "Outdoors & adventure",
  reading: "Reading & books",
  cooking: "Cooking & food",
  music: "Music",
};

const PERSONALITY_MAP: Record<string, string> = {
  practical: "Practical — values usefulness",
  romantic: "Romantic — loves sentiment",
  minimal: "Minimalist — less is more",
  playful: "Playful — fun & quirky",
};

const CLOSENESS_MAP: Record<string, string> = {
  partner: "Partner (very close)",
  family: "Family member",
  "close-friend": "Close friend",
  colleague: "Colleague",
  acquaintance: "Acquaintance",
  client: "Client",
};

function formatQuizAnswers(answers: Record<string, string | undefined>): string {
  const lines: string[] = [];
  if (answers.recipient)
    lines.push(`- Gift recipient: ${RECIPIENT_MAP[answers.recipient] ?? answers.recipient}`);
  if (answers.occasion)
    lines.push(`- Occasion: ${OCCASION_MAP[answers.occasion] ?? answers.occasion}`);
  if (answers.budget)
    lines.push(`- Budget: ${BUDGET_MAP[answers.budget] ?? answers.budget}`);
  if (answers.interests)
    lines.push(`- Interests: ${INTERESTS_MAP[answers.interests] ?? answers.interests}`);
  if (answers.personality)
    lines.push(`- Personality: ${PERSONALITY_MAP[answers.personality] ?? answers.personality}`);
  if (answers.closeness)
    lines.push(`- Relationship closeness: ${CLOSENESS_MAP[answers.closeness] ?? answers.closeness}`);
  return lines.join("\n");
}

export async function getAIGiftRecommendations(
  quizAnswers: Record<string, string | undefined>,
  candidates: Gift[]
): Promise<AIResult | null> {
  if (!DEEPSEEK_API_KEY || candidates.length === 0) {
    return null;
  }

  try {
    const userProfile = formatQuizAnswers(quizAnswers);
    const productCatalog = candidates.map((g) => ({
      id: g.id,
      name: g.name,
      price: g.price,
      description: g.tagline || g.name,
      category: g.category,
    }));

    const systemPrompt = `You are an expert gift curator. Given a user's gift-giving profile and a catalog of real Amazon products, pick the 5 best-matching gifts. For each pick, write a personalized 1-2 sentence reason explaining WHY this specific gift fits THIS specific person. Be specific — reference their interests, personality, or relationship. Give a match score 0-100. Return ONLY valid JSON, no markdown.`;

    const userPrompt = `User's gift-giving profile:
${userProfile}

Available products (pick the best 5):
${JSON.stringify(productCatalog, null, 2)}

Return ONLY this JSON format:
{"picks":[{"product_id":"<id>","reason":"<1-2 sentence personalized reason>","match_score":<0-100>}]}`;

    // ----- 关键修复：Edge Runtime 兼容的超时控制 -----
    // 部分 Cloudflare / Vercel Edge Runtime 不支持 AbortSignal.timeout()，
    // 直接用会抛 TypeError → 导致整页 5xx。这里手写 controller + setTimeout。
    let timeoutTimer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | undefined;
    try {
      if (typeof AbortController !== "undefined") {
        controller = new AbortController();
        const ms = 8000;
        timeoutTimer = setTimeout(() => {
          try { controller?.abort(); } catch (_) { /* noop */ }
        }, ms);
      }
    } catch (_) {
      controller = undefined;
      timeoutTimer = undefined;
    }

    try {
      const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 1200,
          response_format: { type: "json_object" },
        }),
        signal: controller?.signal,
      });

      if (!response.ok) {
        // 把 HTTP 错误静默吞掉，上层走 fallback
        console.error("DeepSeek API error:", response.status);
        return null;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) return null;

      const parsed = JSON.parse(content);
      if (!parsed.picks || !Array.isArray(parsed.picks)) return null;

      const picks: AIGift[] = [];
      for (const pick of parsed.picks.slice(0, 5)) {
        const gift = candidates.find((g) => g.id === pick.product_id);
        if (gift) {
          picks.push({
            ...gift,
            reason: pick.reason || gift.reason,
            match: typeof pick.match_score === "number" ? pick.match_score : 0,
            aiReason: pick.reason || "",
            aiMatchScore: typeof pick.match_score === "number" ? pick.match_score : 0,
          });
        }
      }

      if (picks.length === 0) return null;

      return {
        picks,
        totalCandidates: candidates.length,
        used: true,
      };
    } finally {
      if (timeoutTimer) clearTimeout(timeoutTimer);
    }
  } catch (err) {
    // 任何异常（包括网络、超时、解析、AbortError）
    // 一律返回 null，让上层走 fallback，绝不抛 5xx
    console.error("DeepSeek API call failed:", err);
    return null;
  }
}
