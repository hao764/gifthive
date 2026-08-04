import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 惰性初始化 —— 环境变量缺失时不会崩溃，查询时返回 null
let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  if (!_client) {
    _client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _client;
}

// 兼容旧代码的导出 —— 通过 getter 访问
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getClient();
    if (!client) return undefined;
    // @ts-expect-error — proxy 透传
    return client[prop];
  },
});

// ---------- 商品类型 ----------
export type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  affiliate_url: string;
  asin: string | null;
  audience_tags: string[];
  occasion_tags: string[];
  price_range: "cheap" | "mid" | "high";
  description: string;
  review_quote: string | null;
};

// ---------- 商品查询 ----------
type ProductFilter = {
  audience?: string; // 如 "for-him"
  occasion?: string; // 如 "birthday"
  priceRange?: "cheap" | "mid" | "high";
  limit?: number;
};

/**
 * 从 Supabase 查询商品
 * 用法：const { data, error } = await fetchProducts({ audience: "for-him", limit: 8 })
 */
export async function fetchProducts(filter: ProductFilter = {}) {
  const client = getClient();
  if (!client) {
    return { data: null, error: { message: "Supabase not configured" } as any };
  }
  let query = client
    .from("products")
    .select("*")
    .order("id", { ascending: true });

  if (filter.audience) {
    query = query.contains("audience_tags", [filter.audience]);
  }
  if (filter.occasion) {
    query = query.contains("occasion_tags", [filter.occasion]);
  }
  if (filter.priceRange) {
    query = query.eq("price_range", filter.priceRange);
  }
  if (filter.limit) {
    query = query.limit(filter.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Supabase 查询失败:", error.message);
    return { data: null, error };
  }
  return { data: data as Product[], error: null };
}

// ---------- 统一的 fallback 查询：Supabase 有数据就用 Supabase，没有就用 data.ts 里的硬编码 ----------
// 这样即使 Supabase 挂了/没配置好，网站也不会空白。
import {
  editorsPicks,
  recommendedGifts,
  forHimGifts,
  forHerGifts,
  forKidsGifts,
  forParentsGifts,
  forFriendsGifts,
  forCoworkersGifts,
  productToGift,
  type Gift,
} from "./data";

type AudienceSlug =
  | "for-him"
  | "for-her"
  | "for-kids"
  | "for-parents"
  | "for-friends"
  | "for-coworkers";

const audienceHardcodedMap: Record<AudienceSlug, Gift[]> = {
  "for-him": forHimGifts,
  "for-her": forHerGifts,
  "for-kids": forKidsGifts,
  "for-parents": forParentsGifts,
  "for-friends": forFriendsGifts,
  "for-coworkers": forCoworkersGifts,
};

/**
 * 取首页 Editor's Picks：Supabase 成功就用它，失败就回退到 data.ts
 */
export async function getEditorsPicksFallback(limit = 4): Promise<Gift[]> {
  const { data } = await fetchProducts({ limit });
  if (data && data.length > 0) {
    return data.map(productToGift);
  }
  return editorsPicks.slice(0, limit);
}

/**
 * 取测验结果推荐：Supabase 成功就用它，失败回退
 */
export async function getRecommendedGiftsFallback(
  audience?: AudienceSlug,
  occasion?: string,
  limit = 5
): Promise<Gift[]> {
  const filter: ProductFilter = { limit };
  if (audience) filter.audience = audience;
  if (occasion) filter.occasion = occasion;

  const { data } = await fetchProducts(filter);
  if (data && data.length > 0) {
    return data.map(productToGift);
  }
  if (audience && audienceHardcodedMap[audience]) {
    return audienceHardcodedMap[audience].slice(0, limit);
  }
  return recommendedGifts.slice(0, limit);
}

/**
 * 取人群分类页商品（for-him / for-her 等）：Supabase 优先，失败回退
 */
export async function getAudienceGiftsFallback(
  audience: AudienceSlug,
  limit = 24
): Promise<Gift[]> {
  const { data } = await fetchProducts({ audience, limit });
  if (data && data.length > 0) {
    return data.map(productToGift);
  }
  return audienceHardcodedMap[audience] ?? [];
}

/**
 * 统计礼物总库真实数量：Supabase count(*) 成功就用它，失败 fallback 到 10（最少也有 10 条硬编码）
 * 用于首页 Hero 展示，避免假数字
 */
export async function getTotalGiftsCountFallback(): Promise<number> {
  try {
    const client = getClient();
    if (!client) {
      const hardcodedTotal =
        Object.values(audienceHardcodedMap).reduce((acc, arr) => acc + arr.length, 0);
      return hardcodedTotal > 0 ? hardcodedTotal : 10;
    }
    const { count, error } = await client
      .from("products")
      .select("*", { count: "exact", head: true });
    if (!error && typeof count === "number") {
      return count;
    }
  } catch (_) {
    // ignore
  }
  const hardcodedTotal =
    Object.values(audienceHardcodedMap).reduce((acc, arr) => acc + arr.length, 0);
  return hardcodedTotal > 0 ? hardcodedTotal : 10;
}

// ---------- Hive Reveal 蜜语卡 ----------
export type Reveal = {
  id: string;
  sender_name: string | null;
  recipient_name: string | null;
  message: string;
  gift_name: string | null;
  gift_image: string | null;
  gift_price: number | null;
  quiz_url: string | null;
  created_at: string;
  revealed_at: string | null;
};

export type RevealInput = {
  sender_name?: string;
  recipient_name?: string;
  message: string;
  gift_name?: string;
  gift_image?: string;
  gift_price?: number;
  quiz_url?: string;
};

/**
 * 创建一张蜜语卡，返回带 id 的完整记录（用于生成分享链接）
 */
export async function createReveal(
  input: RevealInput
): Promise<Reveal | null> {
  try {
    const client = getClient();
    if (!client) return null;
    const { data, error } = await client
      .from("reveals")
      .insert({
        sender_name: input.sender_name || null,
        recipient_name: input.recipient_name || null,
        message: input.message,
        gift_name: input.gift_name || null,
        gift_image: input.gift_image || null,
        gift_price: input.gift_price || null,
        quiz_url: input.quiz_url || null,
      })
      .select()
      .single();
    if (error) {
      console.error("createReveal error:", error.message);
      return null;
    }
    return data as Reveal;
  } catch (err) {
    console.error("createReveal failed:", err);
    return null;
  }
}

/**
 * 按 id 查蜜语卡（收礼人打开链接时用）
 */
export async function getReveal(id: string): Promise<Reveal | null> {
  try {
    const client = getClient();
    if (!client) return null;
    const { data, error } = await client
      .from("reveals")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      console.error("getReveal error:", error.message);
      return null;
    }
    return data as Reveal;
  } catch (err) {
    console.error("getReveal failed:", err);
    return null;
  }
}

/**
 * 标记蜜语卡已被揭晓（写入 revealed_at 时间戳）
 */
export async function markRevealed(id: string): Promise<void> {
  try {
    const client = getClient();
    if (!client) return;
    await client
      .from("reveals")
      .update({ revealed_at: new Date().toISOString() })
      .eq("id", id);
  } catch {
    /* non-critical */
  }
}
