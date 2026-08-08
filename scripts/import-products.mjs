/**
 * GiftHive 商品导入脚本（无需 SQL 迁移版）
 *
 * 策略：把新字段存到现有列里，不改表结构
 * - audience_tags: 人群 slug + 商品标签（tech/coffee/outdoor 等）
 * - review_quote: JSON 字符串 {category, gender, style_tags, avoid_tags}
 * - description: 商品名
 * - occasion_tags: 场景英文 slug
 *
 * 用法：node scripts/import-products.mjs
 */

import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

// ————— 加载 .env.local —————
const env = readFileSync(".env.local", "utf8");
for (const line of env.split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.+)/);
  if (m) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ 缺少环境变量");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ————— 映射表 —————

// target_relation + gender → audience_tags
function relationToAudience(relation, gender) {
  switch (relation) {
    case "父母":
    case "长辈":
      return ["for-parents"];
    case "伴侣":
      if (gender === "男") return ["for-him"];
      if (gender === "女") return ["for-her"];
      return ["for-him", "for-her"];
    case "朋友":
      return ["for-friends"];
    case "同事":
      return ["for-coworkers"];
    case "孩子":
      return ["for-kids"];
    default:
      return [];
  }
}

// occasion → 英文 slug
const OCCASION_MAP = {
  生日: "birthday",
  情人节: "valentine",
  母亲节: "mothers-day",
  父亲节: "fathers-day",
  新年: "new-year",
  乔迁: "housewarming",
  毕业: "graduation",
  年会: "corporate",
  纪念日: "anniversary",
  感恩节: "thanksgiving",
};

// category → product_tags（用于兴趣匹配）
const CATEGORY_TO_PRODUCT_TAGS = {
  数码配件: ["tech", "electronics", "gadget", "desk"],
  家居生活: ["home", "decor", "lifestyle"],
  美妆护肤: ["beauty", "skincare"],
  食品茶饮: ["food", "coffee", "tea", "gourmet"],
  文具文创: ["stationery", "reading", "creative"],
  运动户外: ["outdoor", "sports", "active", "fitness"],
  饰品配饰: ["jewelry", "accessories", "fashion"],
  毛绒玩具: ["toys", "plush", "cute"],
  香薰蜡烛: ["scent", "candle", "home", "relax"],
  手工DIY: ["crafts", "diy", "creative"],
};

// price → price_range
function getPriceRange(price) {
  if (price < 100) return "cheap";
  if (price < 500) return "mid";
  return "high";
}

// ————— 主流程 —————

async function main() {
  // 1. 读取商品数据
  const data = JSON.parse(
    readFileSync("scripts/gift-products-data.json", "utf8")
  );
  console.log(`📦 读取 ${data.length} 个商品`);

  // 2. 映射为 Supabase 格式（使用现有列）
  const products = data.map((p) => {
    const audienceTags = Array.from(
      new Set(
        p.target_relation.flatMap((r) => relationToAudience(r, p.gender))
      )
    );
    const occasionTags = p.occasion
      .map((o) => OCCASION_MAP[o])
      .filter(Boolean);
    const productTags = CATEGORY_TO_PRODUCT_TAGS[p.category] || [];

    // 把商品标签也加到 audience_tags 里，这样 productToGift 的 tags 就能用于兴趣匹配
    const allAudienceTags = [...audienceTags, ...productTags];

    // 把新字段存到 review_quote 里（JSON 字符串）
    const metadata = JSON.stringify({
      category: p.category,
      gender: p.gender,
      style_tags: p.style_tags,
      avoid_tags: p.avoid_tags,
    });

    return {
      name: p.product_name,
      price: p.price,
      image_url: p.image_url,
      affiliate_url: `https://www.amazon.com/s?k=${encodeURIComponent(p.product_name)}&tag=gifthive08-20`,
      asin: null,
      audience_tags: allAudienceTags,
      occasion_tags: occasionTags,
      price_range: getPriceRange(p.price),
      description: p.product_name,
      review_quote: metadata,
    };
  });

  // 3. 批量插入（每批 50 条）
  const BATCH = 50;
  let inserted = 0;

  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH);
    const { error } = await sb.from("products").insert(batch);
    if (error) {
      console.error(`❌ 批次 ${Math.floor(i / BATCH) + 1} 失败:`, error.message);
      // 逐条插入失败的批次
      for (const p of batch) {
        const { error: e2 } = await sb.from("products").insert([p]);
        if (e2) {
          console.error(`  ❌ "${p.name}" 失败:`, e2.message);
        } else {
          inserted++;
        }
      }
    } else {
      inserted += batch.length;
      console.log(`✅ 批次 ${Math.floor(i / BATCH) + 1}: +${batch.length}（累计 ${inserted}）`);
    }
  }

  console.log(`\n📦 新商品插入完成: ${inserted} / ${products.length}`);

  // 4. 更新现有商品（给旧商品补 product_tags 到 audience_tags）
  console.log("\n🔧 开始更新现有商品标签...");

  const { data: existing, error: fetchErr } = await sb
    .from("products")
    .select("id, name, audience_tags, occasion_tags, price_range, review_quote")
    .limit(500);

  if (fetchErr) {
    console.error("❌ 查询现有商品失败:", fetchErr.message);
  } else if (existing) {
    // 只更新没有 product_tags 的旧商品（review_quote 不是 JSON 的）
    const oldProducts = existing.filter((p) => {
      try {
        JSON.parse(p.review_quote || "");
        return false; // 已经是 JSON，跳过
      } catch {
        return true; // 不是 JSON，需要更新
      }
    });

    console.log(`📋 发现 ${oldProducts.length} 个旧商品需要补标签`);

    // 关键词 → category + product_tags
    const KEYWORD_RULES = [
      { keywords: ["headphone", "earphone", "speaker", "keyboard", "mouse", "charger", "cable", "usb", "bluetooth", "inflator", "tire", "air", "battery", "power", "electronic", "device", "gadget", "smart", "ring", "tracker", "adapter"], category: "数码配件", tags: ["tech", "electronics", "gadget"] },
      { keywords: ["mug", "cup", "pillow", "blanket", "plant", "frame", "lamp", "vase", "towel", "coaster", "doormat", "kitchen", "cooker", "brewer", "grinder", "thermometer", "home", "house", "decor"], category: "家居生活", tags: ["home", "decor"] },
      { keywords: ["cream", "serum", "mask", "lip", "skin", "beauty", "cosmetic", "lotion", "perfume", "fragrance", "bath", "soap", "scrub", "nail"], category: "美妆护肤", tags: ["beauty", "skincare"] },
      { keywords: ["coffee", "tea", "chocolate", "honey", "snack", "food", "wine", "beer", "whiskey", "sauce", "oil", "treat", "candy", "gourmet", "tasting", "flavor"], category: "食品茶饮", tags: ["food", "coffee", "gourmet"] },
      { keywords: ["notebook", "journal", "pen", "book", "diary", "stationery", "pencil", "desk", "calendar", "planner", "sticker"], category: "文具文创", tags: ["stationery", "reading"] },
      { keywords: ["yoga", "bottle", "fitness", "bike", "ball", "gym", "sport", "outdoor", "camp", "hike", "running", "massage", "recovery", "active", "water"], category: "运动户外", tags: ["outdoor", "sports", "active"] },
      { keywords: ["necklace", "bracelet", "ring", "earring", "wallet", "watch", "bag", "scarf", "jewelry", "chain", "leather", "card", "key", "lanyard"], category: "饰品配饰", tags: ["jewelry", "accessories"] },
      { keywords: ["plush", "stuffed", "toy", "bear", "bunny", "doll", "animal", "soft"], category: "毛绒玩具", tags: ["toys", "plush"] },
      { keywords: ["candle", "diffuser", "incense", "aroma", "scent", "wax", "flame", "wick"], category: "香薰蜡烛", tags: ["scent", "candle"] },
      { keywords: ["kit", "diy", "craft", "paint", "draw", "art", "puzzle", "game", "board", "card", "print", "poster"], category: "手工DIY", tags: ["crafts", "creative"] },
    ];

    function inferCategory(name) {
      const lower = (name || "").toLowerCase();
      for (const rule of KEYWORD_RULES) {
        if (rule.keywords.some((k) => lower.includes(k))) {
          return { category: rule.category, product_tags: rule.tags };
        }
      }
      return { category: "家居生活", product_tags: ["home", "lifestyle"] };
    }

    function inferGender(audienceTags) {
      if (!audienceTags || audienceTags.length === 0) return "通用";
      const hasHim = audienceTags.includes("for-him");
      const hasHer = audienceTags.includes("for-her");
      if (hasHim && !hasHer) return "男";
      if (hasHer && !hasHim) return "女";
      return "通用";
    }

    let updated = 0;
    for (const p of oldProducts) {
      const { category, product_tags } = inferCategory(p.name);
      const gender = inferGender(p.audience_tags);

      // 把 product_tags 加到 audience_tags 里（去重）
      const existingTags = p.audience_tags || [];
      const newTags = [...new Set([...existingTags, ...product_tags])];

      // review_quote 存 JSON metadata
      const metadata = JSON.stringify({
        category,
        gender,
        style_tags: [],
        avoid_tags: [],
      });

      const { error } = await sb
        .from("products")
        .update({
          audience_tags: newTags,
          review_quote: metadata,
        })
        .eq("id", p.id);

      if (error) {
        console.error(`  ❌ id=${p.id} "${p.name}" 失败:`, error.message);
      } else {
        updated++;
      }

      if (updated % 50 === 0 && updated > 0) {
        console.log(`  📝 进度: ${updated} / ${oldProducts.length}`);
      }
    }
    console.log(`✅ 旧商品标签更新完成: ${updated} / ${oldProducts.length}`);
  }

  // 5. 验证
  const { count } = await sb
    .from("products")
    .select("*", { count: "exact", head: true });
  console.log(`\n📊 最终商品总数: ${count}`);

  // 检查有多少商品有 product_tags
  const { data: sample } = await sb
    .from("products")
    .select("id, name, audience_tags, review_quote")
    .limit(3);
  if (sample) {
    console.log("\n📋 样本验证:");
    for (const p of sample) {
      let meta = null;
      try { meta = JSON.parse(p.review_quote || ""); } catch {}
      console.log(`  #${p.id} ${p.name}`);
      console.log(`    audience_tags: ${JSON.stringify(p.audience_tags)}`);
      console.log(`    metadata: ${JSON.stringify(meta)}`);
    }
  }

  console.log("\n✅ 全部完成！");
}

main().catch((err) => {
  console.error("💥 错误:", err);
  process.exit(1);
});
