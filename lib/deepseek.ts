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

type ProviderName = "DEEPSEEK" | "GROQ" | "NVIDIA_NIM" | "GOOGLE_GEMINI" | "SILICONFLOW" | "DASHSCOPE" | "OPENROUTER" | "TOGETHER" | "OPENAI";

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
  /* ————— Groq 海外备线（重点！Cloudflare Pages 海外节点 → 美国 Groq LPU 机房延迟很低）—————
     · 免费额度：14,400 请求 / 天（约 600 次/小时），30 请求 / 分钟，永久免费每天重置
     · 不用绑卡，邮箱就能注册 https://console.groq.com/
     · 模型默认 Llama 3.3 70B，推理质量 ≈ GPT-4 下游任务，做 gift 推荐完全够
  */
  {
    name: "GROQ",
    apiKeyEnv: "GROQ_API_KEY",
    baseURL: "https://api.groq.com/openai/v1/chat/completions",
    defaultModel: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  },
  /* ————— NVIDIA NIM（海外备线 2，免费额度巨大，中国 IP 也能注册）—————
     · NVIDIA Developer Program：手机号验证即免费，100+ 模型可调用（DeepSeek V4 / Llama 4 / GLM-5）
     · 速率约 40 RPM / 账户，共享。海外节点 RTT 优秀
     · 控制台 https://build.nvidia.com ，key 前缀 nvapi-
  */
  {
    name: "NVIDIA_NIM",
    apiKeyEnv: "NVIDIA_NIM_API_KEY",
    baseURL: "https://integrate.api.nvidia.com/v1/chat/completions",
    // NOTE: deepseek-v4-flash/v4-pro EOL 2026-08-07; llama-4 models EOL 2026-07.
    // NVIDIA's own nemotron-3-super-120b-a12b is verified alive on 2026-08-08,
    // MoE 120B, reasoning quality good enough for gift ranking.
    defaultModel: process.env.NVIDIA_NIM_MODEL || "nvidia/nemotron-3-super-120b-a12b",
  },
  /* ————— Google AI Studio / Gemini（海外备线 3，用户最容易拿到，1500 次/天永久免费）—————
     · Google 账号直接登录 aistudio.google.com → Get API Key，不用绑卡
     · 免费额度：15 RPM / 1500 RPD（Gemini 2.5 Flash）
     · 用 Google 的 OpenAI 兼容网关：generativelanguage.googleapis.com/v1beta/openai
  */
  {
    name: "GOOGLE_GEMINI",
    apiKeyEnv: "GOOGLE_GEMINI_API_KEY",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    defaultModel: process.env.GOOGLE_GEMINI_MODEL || "gemini-2.5-flash",
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

/**
 * 根据请求来源国家/地区重排 provider 调用顺序，把最近机房的 provider 放前面，
 * 从根源上避免「海外节点调国内 API 超时」的尴尬 —— 先试成功率最高的。
 *
 * 映射关系：
 *   - 中国大陆 (CN)、香港 (HK)、澳门 (MO)、台湾 (TW)、新加坡 (SG)、
 *     马来西亚 (MY)、泰国 (TH)、越南 (VN)、印尼 (ID)、菲律宾 (PH)、
 *     日本 (JP)、韩国 (KR) → 先国内/亚太机房 provider：
 *     DEEPSEEK → SILICONFLOW → DASHSCOPE → GROQ → OPENROUTER → TOGETHER → OPENAI
 *   - 其他所有国家/地区（北美、欧洲、拉美、非洲、中东、大洋洲等）→ 先海外机房 provider：
 *     GROQ → TOGETHER → OPENROUTER → OPENAI → DEEPSEEK → SILICONFLOW → DASHSCOPE
 *   - geoHint 为空（没法判断）→ 保持原始顺序：DEEPSEEK → GROQ → SILICONFLOW → ...
 *
 * 调完「第一个机房组」所有 provider 都失败时，才会切去另一个机房组兜底，
 * 因此「CN 用户 → 国内 API 失败」的概率被压到非常低；反之海外用户 Groq 秒响应。
 */
function reorderByGeo(specs: ProviderSpec[], geoHint: string | undefined): ProviderSpec[] {
  if (specs.length === 0) return specs;
  const g = (geoHint || "").trim().toUpperCase();
  if (!g) return specs;

  const CN_GROUP: ProviderName[] = [
    "DEEPSEEK",
    "SILICONFLOW",
    "DASHSCOPE",
  ];
  const OVERSEAS_GROUP: ProviderName[] = [
    "GROQ",
    "NVIDIA_NIM",
    "GOOGLE_GEMINI",
    "TOGETHER",
    "OPENROUTER",
    "OPENAI",
  ];

  // 亚太/华语区优先 CN_GROUP
  const APAC_GEOS = new Set([
    "CN", "HK", "MO", "TW",
    "SG", "MY", "TH", "VN", "ID", "PH",
    "JP", "KR", "IN", "BD", "PK", "LK",
  ]);

  const firstGroup = APAC_GEOS.has(g) ? CN_GROUP : OVERSEAS_GROUP;
  const secondGroup = APAC_GEOS.has(g) ? OVERSEAS_GROUP : CN_GROUP;

  // 按 firstGroup 的顺序排，找不到 name 的放最后（理论上不会出现）
  const byName = new Map(specs.map((s) => [s.name, s]));
  const result: ProviderSpec[] = [];
  for (const n of firstGroup) {
    const p = byName.get(n);
    if (p) result.push(p);
  }
  for (const n of secondGroup) {
    const p = byName.get(n);
    if (p) result.push(p);
  }
  // 兜底：如果 future 新加入某个 provider 没进上面两组，按原始顺序塞进队尾
  for (const s of specs) {
    if (!result.find((r) => r.name === s.name)) result.push(s);
  }
  return result;
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
  /** 路由判定用的 Geo country code，用于验证 geo 路由确实生效 */
  geoHint?: string;
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

const AGE_MAP: Record<string, string> = {
  "under-18": "Under 18",
  "18-25": "18 – 25",
  "25-35": "25 – 35",
  "35-50": "35 – 50",
  "50-65": "50 – 65",
  "over-65": "Over 65",
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

const GIFT_STYLE_MAP: Record<string, string> = {
  "practical-item": "Practical item — something they'll use daily",
  experience: "Experience — a memory, not an object",
  creative: "Creative surprise — unexpected and fun",
  classic: "Classic & safe — can't go wrong",
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
  if (answers.age) {
    const c = getCustom(answers.age);
    lines.push(
      `- Recipient age: ${c ?? AGE_MAP[answers.age] ?? answers.age}`
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
  if (answers.giftStyle) {
    const c = getCustom(answers.giftStyle);
    lines.push(
      `- Gift style preference: ${c ?? GIFT_STYLE_MAP[answers.giftStyle] ?? answers.giftStyle}`
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
  candidates: Gift[],
  opts?: { geoHint?: string }
): Promise<AIResult | null> {
  if (!candidates || candidates.length === 0) return null;

  let providers = getEnabledProviders();
  if (providers.length === 0) {
    // 没有任何一个 provider 的 key 配置 → 直接跳过，安静返回 null
    // （本地 / 刚部署忘加 secret 的常态，绝不能 5xx）
    return null;
  }

  // Geo 智能路由：CN/亚太用户先打国内 API，海外用户先打美国/欧洲机房 API
  // 这样 Cloudflare Pages 海外 POP 不会去撞 api.deepseek.com 的跨境高延迟
  const geoHint = opts?.geoHint;
  providers = reorderByGeo(providers, geoHint);

  const userProfile = formatQuizAnswers(quizAnswers);
  const productCatalog = candidates.map((g) => ({
    id: g.id,
    name: g.name,
    price: g.price,
    description: g.tagline || g.name,
    category: g.category,
  }));

  const systemPrompt = [
    "你是专业礼品推荐师，严格根据提供的商品列表和用户需求筛选礼物。",
    "",
    "要求：",
    "1. 从商品列表中选出3-5件最匹配的礼物，按推荐优先级排序",
    "2. 每件商品附上1句话推荐理由，贴合用户需求",
    "3. 严格遵守用户预算，不得推荐超出预算的商品",
    "4. 只返回JSON格式，不要多余解释",
    "",
    "Return ONLY valid JSON matching this shape (no markdown, no preamble, no explanation outside JSON):",
    '{"picks":[{"product_id":"<catalog.id>","reason":"<1 sentence in the user\'s language>","match_score":<0-100 integer>}]}',
  ].join("\n");

  const userPrompt = [
    "【商品列表】",
    JSON.stringify(productCatalog, null, 2),
    "",
    "【用户需求】",
    userProfile,
    "",
    "只返回JSON格式，不要多余解释。Do not invent product_ids that are not in the catalog.",
  ].join("\n");

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
      `[AI] ${p.name} OK (geo=${geoHint || "unknown"}) — ${picks.length} picks from ${candidates.length} candidates in ≤${ms}ms`
    );
    return {
      picks,
      totalCandidates: candidates.length,
      used: true,
      provider: p.name,
      geoHint: geoHint || undefined,
    };
  }

  // 所有 provider 都失败 → 返回 null，上层走规则 fallback，还是不 5xx
  console.error(`[AI] ALL providers failed (tried: ${providers.map((p) => p.name).join(", ")}); returning null to fallback`);
  return null;
}
