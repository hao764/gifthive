import type { Gift } from "./data";

/* ===========================================================================
 * AI Provider Router — 多供应商自动降级
 *
 * 优先级（有 key 就启用，按顺序调用，前一个失败立刻切下一个，都没 key
 * 就直接 return null 让上层走规则 fallback，绝不会抛到 5xx）：
 *
 *   1) DEEPSEEK        https://api.deepseek.com/v1/chat/completions
 *                       — 国内便宜好用，默认首选
 *   2) OPENROUTER       https://openrouter.ai/api/v1/chat/completions
 *                       — 海外聚合，一个 key 调几十家模型（推荐做首选备线）
 *   3) TOGETHER         https://api.together.xyz/v1/chat/completions
 *                       — 海外老牌，稳定便宜
 *   4) OPENAI (官方)    https://api.openai.com/v1/chat/completions
 *                       — 兜底，GPT-4o-mini 稳定得很
 *
 * 所有供应商都是 OpenAI chat completions 兼容格式，因此请求/响应解析
 * 走同一套代码，只在 baseURL / 默认模型 / headers 上有微小差异。
 *
 * 新增/替换 provider 只需要在 PROVIDER_SPECS 里加一条就行。
 * ========================================================================= */

type ProviderName = "DEEPSEEK" | "SILICONFLOW" | "DASHSCOPE" | "OPENROUTER" | "TOGETHER" | "OPENAI";

type ProviderSpec = {
  name: ProviderName;
  /** 哪个 env var 存在就启用这个 provider */
  apiKeyEnv: string;
  baseURL: string;
  /** 该 provider 默认模型（用户可以用 *_MODEL 覆盖） */
  defaultModel: string;
  /** 额外 header，比如 OpenRouter 要传 HTTP-Referer / X-Title 做排名 */
  extraHeaders?: Record<string, string>;
};

/**
 * 默认站点 URL。用户绑自定义域名后，把 NEXT_PUBLIC_SITE_URL 加到
 * Pages secrets/GitHub secrets 里覆盖即可；没配置就用 pages.dev 默认
 * 域名，保证 OpenRouter HTTP-Referer、canonical、sitemap 等不会空。
 */
const DEFAULT_SITE_URL = "https://gifthive.pages.dev";

/** SEO / metadata 里要用到的 siteURL，统一走这里（兜底 pages.dev） */
export function getSiteURL(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
}

const PROVIDER_SPECS: ProviderSpec[] = [
  {
    name: "DEEPSEEK",
    apiKeyEnv: "DEEPSEEK_API_KEY",
    baseURL: "https://api.deepseek.com/v1/chat/completions",
    defaultModel: process.env.DEEPSEEK_MODEL || "deepseek-chat",
  },
  {
    name: "SILICONFLOW",
    apiKeyEnv: "SILICONFLOW_API_KEY",
    baseURL: "https://api.siliconflow.cn/v1/chat/completions",
    defaultModel: process.env.SILICONFLOW_MODEL || "deepseek-ai/DeepSeek-V3",
  },
  {
    name: "DASHSCOPE",
    apiKeyEnv: "DASHSCOPE_API_KEY",
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    defaultModel: process.env.DASHSCOPE_MODEL || "qwen-plus",
  },
  {
    name: "OPENROUTER",
    apiKeyEnv: "OPENROUTER_API_KEY",
    baseURL: "https://openrouter.ai/api/v1/chat/completions",
    defaultModel: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
    extraHeaders: {
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL,
      "X-Title": "GiftHive — Gift Finder",
    },
  },
  {
    name: "TOGETHER",
    apiKeyEnv: "TOGETHER_API_KEY",
    baseURL: "https://api.together.xyz/v1/chat/completions",
    defaultModel: process.env.TOGETHER_MODEL || "meta-llama/Llama-3.3-70B-Instruct-Turbo",
  },
  {
    name: "OPENAI",
    apiKeyEnv: "OPENAI_API_KEY",
    baseURL: "https://api.openai.com/v1/chat/completions",
    defaultModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  },
];

/** 算出当前可用的 provider 顺序（有 key 的才启用） */
function getEnabledProviders(): ProviderSpec[] {
  const out: ProviderSpec[] = [];
  for (const p of PROVIDER_SPECS) {
    const key = (process.env as Record<string, string | undefined>)[p.apiKeyEnv];
    if (key && key.trim().length > 0) out.push(p);
  }
  return out;
}

export type AIGift = Gift & {
  aiReason?: string;
  aiMatchScore?: number;
  /** 旧字段兼容，老代码里可能还在写 reason/match */
  reason?: string;
  match?: number;
};

export type AIResult = {
  picks: AIGift[];
  totalCandidates: number;
  used: boolean;
  /** 这次实际上是哪一个 provider 出的结果（方便日志定位） */
  provider?: ProviderName;
};

/* -------------------- 题目答案 → 英文 User Profile -------------------- */
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
  const getCustom = (val?: string): string | null => {
    if (val && val.startsWith("custom:")) return val.slice(7);
    return null;
  };
  if (answers.recipient) {
    const c = getCustom(answers.recipient);
    lines.push(
      `- Gift recipient: ${c ?? RECIPIENT_MAP[answers.recipient] ?? answers.recipient}`
    );
  }
  if (answers.occasion) {
    const c = getCustom(answers.occasion);
    lines.push(
      `- Occasion: ${c ?? OCCASION_MAP[answers.occasion] ?? answers.occasion}`
    );
  }
  if (answers.budget) {
    const c = getCustom(answers.budget);
    lines.push(`- Budget: ${c ?? BUDGET_MAP[answers.budget] ?? answers.budget}`);
  }
  if (answers.interests) {
    const c = getCustom(answers.interests);
    lines.push(
      `- Interests: ${c ?? INTERESTS_MAP[answers.interests] ?? answers.interests}`
    );
  }
  if (answers.personality) {
    const c = getCustom(answers.personality);
    lines.push(
      `- Personality: ${c ?? PERSONALITY_MAP[answers.personality] ?? answers.personality}`
    );
  }
  if (answers.closeness) {
    const c = getCustom(answers.closeness);
    lines.push(
      `- Relationship closeness: ${
        c ?? CLOSENESS_MAP[answers.closeness] ?? answers.closeness
      }`
    );
  }
  return lines.join("\n");
}

/* -------------------- Edge 兼容的超时控制器 -------------------- */
/**
 * Cloudflare Pages Edge Runtime 里 AbortSignal.timeout() 经常不支持（或
 * 直接抛 TypeError）。我们手写 controller + setTimeout，保证任何环境都
 * 能在固定 ms 后 abort fetch。
 */
function makeTimeoutSignal(ms: number): { signal?: AbortSignal; clear: () => void } {
  try {
    if (typeof AbortController === "undefined") return { clear: () => {} };
    const ctrl = new AbortController();
    const timer = setTimeout(() => {
      try { ctrl.abort(); } catch (_) { /* noop */ }
    }, ms);
    return {
      signal: ctrl.signal,
      clear: () => clearTimeout(timer),
    };
  } catch (_) {
    return { clear: () => {} };
  }
}

/* -------------------- 模型输出 JSON 解析（容错） -------------------- */
/**
 * 模型偶尔会在 JSON 外面再包一层 ```json ... ```，或者输出多余逗号、
 * 末尾有废话。这里做宽松解析，能解析就解析，解析不出来再返回 undefined。
 */
function looseParseJSON<T = unknown>(raw: string): T | undefined {
  let s = raw.trim();
  // 去掉 ```json / ``` 包裹
  const fence = s.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  if (fence) s = fence[1].trim();
  // 尝试直接解析
  try { return JSON.parse(s) as T; } catch (_) { /* continue */ }
  // 取第一个 { 到最后一个 } 之间的内容，再试一次
  const firstL = s.indexOf("{");
  const lastR = s.lastIndexOf("}");
  if (firstL >= 0 && lastR > firstL) {
    try { return JSON.parse(s.slice(firstL, lastR + 1)) as T; } catch (_) { /* continue */ }
  }
  // 取第一个 [ 到最后一个 ]（极端情况）
  const firstBL = s.indexOf("[");
  const lastBR = s.lastIndexOf("]");
  if (firstBL >= 0 && lastBR > firstBL) {
    try { return JSON.parse(s.slice(firstBL, lastBR + 1)) as T; } catch (_) { /* continue */ }
  }
  return undefined;
}

/* -------------------- 单个 provider 调用 -------------------- */
type RawPick = { product_id: string; reason?: string; match_score?: number };
type RawResponse = { picks: RawPick[] };

async function callOneProvider(
  provider: ProviderSpec,
  payload: {
    system: string;
    user: string;
    outputMaxTokens: number;
  },
  timeoutMs: number
): Promise<{ ok: true; picks: RawPick[] } | { ok: false; err: unknown }> {
  const apiKey = (process.env as Record<string, string | undefined>)[provider.apiKeyEnv];
  if (!apiKey) return { ok: false, err: `missing env ${provider.apiKeyEnv}` };

  const { signal, clear } = makeTimeoutSignal(timeoutMs);
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...(provider.extraHeaders || {}),
    };

    const resp = await fetch(provider.baseURL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: provider.defaultModel,
        messages: [
          { role: "system", content: payload.system },
          { role: "user", content: payload.user },
        ],
        temperature: 0.7,
        max_tokens: payload.outputMaxTokens,
        // response_format=json_object 不是所有提供商都支持，只给确定支持的两家发
        ...(provider.name === "DEEPSEEK" || provider.name === "OPENAI"
          ? { response_format: { type: "json_object" as const } }
          : {}),
      }),
      signal,
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      return {
        ok: false,
        err: `HTTP ${resp.status} ${resp.statusText} — ${text.slice(0, 240)}`,
      };
    }

    const json = await resp.json().catch(() => undefined as any);
    const content: string | undefined =
      json?.choices?.[0]?.message?.content ??
      json?.choices?.[0]?.text ??
      undefined;

    if (!content) return { ok: false, err: "no content in response" };

    const parsed = looseParseJSON<RawResponse>(content);
    if (!parsed || !parsed.picks || !Array.isArray(parsed.picks)) {
      return { ok: false, err: `bad JSON shape in content: ${content.slice(0, 120)}` };
    }
    return { ok: true, picks: parsed.picks };
  } catch (err) {
    return { ok: false, err };
  } finally {
    clear();
  }
}

/* -------------------- 导出的主函数 -------------------- */
export async function getAIGiftRecommendations(
  quizAnswers: Record<string, string | undefined>,
  candidates: Gift[]
): Promise<AIResult | null> {
  if (!candidates || candidates.length === 0) return null;

  const providers = getEnabledProviders();
  if (providers.length === 0) {
    // 没有任何一个 provider 的 key 配置 → 直接跳过，安静返回 null
    // （本地 / 刚部署忘加 secret 的常态，绝不能 5xx）
    return null;
  }

  const userProfile = formatQuizAnswers(quizAnswers);
  const productCatalog = candidates.map((g) => ({
    id: g.id,
    name: g.name,
    price: g.price,
    description: g.tagline || g.name,
    category: g.category,
  }));

  const systemPrompt = [
    "You are an expert gift curator. Given a user's gift-giving profile and a catalog of real products,",
    "pick the BEST 5 gifts that fit them. The user may provide custom descriptions instead of preset categories —",
    "treat custom descriptions as the MOST accurate expression of their intent and prioritize them over presets.",
    "",
    "For each pick, write a personalized 1-2 sentence reason explaining WHY this specific gift fits THIS specific person.",
    "Be specific: reference their interests, personality, occasion, relationship, or budget constraints.",
    "",
    "Return ONLY valid JSON matching this shape (no markdown, no preamble, no explanation outside JSON):",
    '{"picks":[{"product_id":"<catalog.id>","reason":"<personalized 1-2 sentences>","match_score":<0-100 integer>}]}',
  ].join(" ");

  // 英文用户 → 英文写 reason；中文/日文 → 仍然用英文写 reason（因为商品都是 Amazon 英文，
  // 海外用户占绝大多数；UI 侧如果要 i18n 可以以后再做 reason 翻译）。这里故意强制英文。
  const userPrompt = `User's gift-giving profile:\n${userProfile}\n\nAvailable products (pick exactly the best 5, fewer only if the catalog is very small):\n${JSON.stringify(
    productCatalog,
    null,
    2
  )}\n\nReturn ONLY JSON as specified above. Do not invent product_ids that are not in the catalog.`;

  // 每个 provider 的超时时间递减：第一个给宽一点，后面快切
  const timeouts = [10_000, 7_000, 6_000, 5_000];

  for (let i = 0; i < providers.length; i++) {
    const p = providers[i];
    const ms = timeouts[i] ?? 5_000;
    const res = await callOneProvider(
      p,
      { system: systemPrompt, user: userPrompt, outputMaxTokens: 1400 },
      ms
    );

    if (!res.ok) {
      // 结构化日志：[AI] provider=X error=...
      // 但绝不抛出，直接试下一个 provider
      const msg = res.err instanceof Error ? res.err.message : String(res.err);
      console.error(`[AI] ${p.name} failed (${ms}ms timeout): ${msg}`);
      continue;
    }

    const picks: AIGift[] = [];
    for (const raw of res.picks.slice(0, 5)) {
      const gift = candidates.find((g) => g.id === raw.product_id);
      if (!gift) continue;
      const score = typeof raw.match_score === "number" ? raw.match_score : 0;
      picks.push({
        ...gift,
        aiReason: raw.reason ?? gift.reason ?? "",
        aiMatchScore: score,
        reason: raw.reason ?? gift.reason,
        match: score,
      });
    }

    if (picks.length === 0) {
      console.warn(`[AI] ${p.name} returned 0 valid picks (${res.picks.length} raw) → try next provider`);
      continue;
    }

    // 成功路径
    console.log(
      `[AI] ${p.name} OK — ${picks.length} picks from ${candidates.length} candidates in ≤${ms}ms`
    );
    return {
      picks,
      totalCandidates: candidates.length,
      used: true,
      provider: p.name,
    };
  }

  // 所有 provider 都失败 → 返回 null，上层走规则 fallback，还是不 5xx
  console.error(`[AI] ALL providers failed (tried: ${providers.map((p) => p.name).join(", ")}); returning null to fallback`);
  return null;
}
