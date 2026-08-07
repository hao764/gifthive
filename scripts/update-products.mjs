/**
 * 半自动商品更新脚本
 *
 * 流程：
 *   1. 读取 scripts/asins.json 里的 ASIN 清单
 *   2. 逐个抓取亚马逊商品详情页，提取标题、价格、图片
 *   3. 调用 DeepSeek API 自动生成"推荐理由"和"描述"
 *   4. Upsert 到 Supabase products 表（按 ASIN 判断存在性）
 *
 * 用法：
 *   node scripts/update-products.mjs            # 更新全部
 *   node scripts/update-products.mjs --dry-run  # 只抓取和生成，不写入数据库
 *
 * 需要 .env.local 里有：
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   DEEPSEEK_API_KEY
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ── 加载 .env.local ──
const envText = readFileSync(join(ROOT, ".env.local"), "utf8");
for (const line of envText.split("\n")) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/);
  if (m && !process.env[m[1]]) {
    process.env[m[1]] = m[2];
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const AFFILIATE_TAG = "gifthive08-20";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ 缺少 Supabase 环境变量");
  process.exit(1);
}

const DRY_RUN = process.argv.includes("--dry-run");
const REST = `${SUPABASE_URL}/rest/v1/products`;

const USER_AGENTS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
];

export function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── 1. 抓取亚马逊商品详情页（带重试）──
async function fetchAmazonProduct(asin, maxRetries = 3) {
  const url = `https://www.amazon.com/dp/${asin}`;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const ua = randomUA();

    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": ua,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          "Upgrade-Insecure-Requests": "1",
        },
        redirect: "follow",
      });

      if (!res.ok) {
        console.log(`    HTTP ${res.status} (尝试 ${attempt + 1}/${maxRetries})`);
        if (attempt < maxRetries - 1) {
          await sleep(5000 + Math.random() * 3000);
          continue;
        }
        return null;
      }

      const html = await res.text();

      // 检测 CAPTCHA / 反爬拦截
      if (
        html.includes("validateCaptcha") ||
        html.includes("captcha") ||
        html.includes("Type the characters") ||
        html.length < 5000
      ) {
        console.log(`    ⚠ CAPTCHA/反爬拦截 (尝试 ${attempt + 1}/${maxRetries})`);
        if (attempt < maxRetries - 1) {
          await sleep(5000 + Math.random() * 5000);
          continue;
        }
        return null;
      }

      // 标题
      let title = "";
      const titleMatch = html.match(/<span[^>]*id=["']productTitle["'][^>]*>([\s\S]*?)<\/span>/i);
      if (titleMatch) {
        title = titleMatch[1].replace(/<[^>]*>/g, "").trim();
      }

      // 价格 — 优先取主售价（apex-pricetopay），避免匹配到配件/运费价格
      let price = 0;
      let currency = "USD";
      // 1. apex-pricetopay-value > a-offscreen（主售价，最准确）
      const apexPriceMatches = [...html.matchAll(/class=["'][^"']*apex-pricetopay[^"']*["'][^>]*>[\s\S]*?<span[^>]*class=["'][^"']*a-offscreen[^"']*["'][^>]*>\s*([A-Z]{0,3}\s?\$?[\d,.]+)/gi)];
      if (apexPriceMatches.length > 0) {
        const raw = apexPriceMatches[0][1].trim();
        const currMatch = raw.match(/^([A-Z]{3})\s*/);
        if (currMatch) currency = currMatch[1];
        price = parseFloat(raw.replace(/[^0-9.]/g, "")) || 0;
      }
      // 2. 任意 a-price > a-offscreen
      if (price === 0) {
        const priceMatches = [...html.matchAll(/class=["'][^"']*a-price[^"']*["'][^>]*>[\s\S]*?<span[^>]*class=["'][^"']*a-offscreen[^"']*["'][^>]*>\s*([A-Z]{0,3}\s?\$?[\d,.]+)/gi)];
        if (priceMatches.length > 0) {
          const raw = priceMatches[0][1].trim();
          const currMatch = raw.match(/^([A-Z]{3})\s*/);
          if (currMatch) currency = currMatch[1];
          price = parseFloat(raw.replace(/[^0-9.]/g, "")) || 0;
        }
      }
      // 3. apexPriceToPay
      if (price === 0) {
        const apexMatch = html.match(/class=["'][^"']*apexPriceToPay[^"']*["'][^>]*>[\s\S]*?([A-Z]{0,3}\s?\$?[\d,.]+)/i);
        if (apexMatch) {
          const raw = apexMatch[1].trim();
          const currMatch = raw.match(/^([A-Z]{3})\s*/);
          if (currMatch) currency = currMatch[1];
          price = parseFloat(raw.replace(/[^0-9.]/g, "")) || 0;
        }
      }
      // 4. a-color-price
      if (price === 0) {
        const colorMatch = html.match(/class=["'][^"']*a-color-price[^"']*["'][^>]*>\s*([A-Z]{0,3}\s?\$?[\d,.]+)/i);
        if (colorMatch) {
          const raw = colorMatch[1].trim();
          const currMatch = raw.match(/^([A-Z]{3})\s*/);
          if (currMatch) currency = currMatch[1];
          price = parseFloat(raw.replace(/[^0-9.]/g, "")) || 0;
        }
      }
      // 5. data-a-price 属性
      if (price === 0) {
        const dataAttrMatch = html.match(/data-a-price=["']([\d.]+)/i);
        if (dataAttrMatch) price = parseFloat(dataAttrMatch[1]) || 0;
      }
      // 6. JSON 嵌入的 price
      if (price === 0) {
        const jsonPriceMatch = html.match(/["']price_amount["']\s*:\s*([\d.]+)/i) ||
          html.match(/["']price["']\s*:\s*\{[^}]*["']amount["']\s*:\s*([\d.]+)/i) ||
          html.match(/["']price["']\s*:\s*["']?\$?([\d.,]+)/i);
        if (jsonPriceMatch) {
          price = parseFloat(jsonPriceMatch[1].replace(/[^0-9.]/g, "")) || 0;
        }
      }

      // CNY → USD 粗略换算（亚马逊对中国 IP 返回人民币价格）
      if (price > 0 && currency === "CNY") {
        const CNY_TO_USD = 0.14;
        const usdPrice = Math.round(price * CNY_TO_USD * 100) / 100;
        console.log(`    价格换算: CNY${price} → $${usdPrice}`);
        price = usdPrice;
      }

      // 图片 — 多重备选
      let image = "";
      const ogMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
      if (ogMatch) {
        image = ogMatch[1].replace(/&amp;/g, "&");
      }
      if (!image) {
        const landingMatch = html.match(/id=["']landingImage["'][^>]*\s+src=["']([^"']+)["']/i);
        if (landingMatch) image = landingMatch[1].replace(/&amp;/g, "&");
      }
      if (!image) {
        const hiresMatch = html.match(/data-old-hires=["']([^"']+)["']/i);
        if (hiresMatch) image = hiresMatch[1].replace(/&amp;/g, "&");
      }
      if (!image) {
        const wrapperMatch = html.match(/imgTagWrapperId[^>]*>[\s\S]*?<img[^>]*src=["']([^"']+)["']/i);
        if (wrapperMatch) image = wrapperMatch[1].replace(/&amp;/g, "&");
      }
      if (!image) {
        const dynMatch = html.match(/data-a-dynamic-image=["'](\{[^"']+)["']/i);
        if (dynMatch) {
          const urls = dynMatch[1].split('","').map((s) => s.replace(/\\"/g, '"'));
          if (urls.length > 0) image = urls[0].replace(/&amp;/g, "&");
        }
      }

      // 品牌名
      let brand = "";
      const brandMatch = html.match(/<a[^>]*id=["']bylineInfo["'][^>]*>([^<]+)/i);
      if (brandMatch) brand = brandMatch[1].trim();

      if (!title) {
        console.log("    无法提取标题");
        return null;
      }

      return {
        name: title.substring(0, 200),
        price: Math.round(price * 100) / 100,
        image_url: image,
        brand,
      };
    } catch (err) {
      console.log(`    fetch error: ${err.message} (尝试 ${attempt + 1}/${maxRetries})`);
      if (attempt < maxRetries - 1) {
        await sleep(5000 + Math.random() * 3000);
        continue;
      }
      return null;
    }
  }
  return null;
}

// ── 2. DeepSeek 生成配文 ──
async function generateCopywrite(name, brand, audience, occasion) {
  if (!DEEPSEEK_API_KEY) {
    console.log("    (无 DEEPSEEK_API_KEY，跳过配文生成)");
    return { description: name.substring(0, 120), review_quote: "" };
  }

  const audienceLabel = {
    "for-him": "a man",
    "for-her": "a woman",
    "for-kids": "a child or teen",
    "for-parents": "a parent",
    "for-friends": "a friend",
    "for-coworkers": "a coworker",
  }[audience?.[0]] || "someone";

  const occasionLabel = {
    birthday: "birthday",
    anniversary: "anniversary",
    holiday: "holiday",
    thanks: "thank you",
    wedding: "wedding",
  }[occasion?.[0]] || "any occasion";

  const systemPrompt =
    "You are a gift curator for GiftHive. Write concise, warm, specific product copy. Return ONLY valid JSON, no markdown.";

  const userPrompt = `Product: ${name}
Brand: ${brand || "Unknown"}
Intended for: ${audienceLabel}
Occasion: ${occasionLabel}

Write two fields:
1. "description": one short sentence (max 120 chars) describing the product's appeal
2. "review_quote": one sentence (max 150 chars) explaining why it's a good gift for this person/occasion

Return ONLY this JSON:
{"description":"<...>","review_quote":"<...>"}`;

  try {
    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
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
        max_tokens: 300,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      console.log(`    DeepSeek error: ${res.status}`);
      return { description: name.substring(0, 120), review_quote: "" };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return { description: name.substring(0, 120), review_quote: "" };

    const parsed = JSON.parse(content);
    return {
      description: (parsed.description || "").substring(0, 200),
      review_quote: (parsed.review_quote || "").substring(0, 200),
    };
  } catch (err) {
    console.log(`    DeepSeek failed: ${err.message}`);
    return { description: name.substring(0, 120), review_quote: "" };
  }
}

// ── 2b. DeepSeek 推断价格区间（当爬虫没抓到价格时）──
async function guessPriceRange(name, brand) {
  if (!DEEPSEEK_API_KEY) {
    return { range: "mid", estimate: 0 };
  }

  try {
    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "You estimate Amazon product prices. Return ONLY valid JSON, no markdown.",
          },
          {
            role: "user",
            content: `Product: ${name}\nBrand: ${brand || "Unknown"}\n\nEstimate the typical Amazon selling price in USD.\nReturn ONLY this JSON:\n{"estimate":<number>,"range":"<cheap|mid|high>"}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 100,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) return { range: "mid", estimate: 0 };

    const data = await res.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
    const estimate = typeof parsed.estimate === "number" ? parsed.estimate : 0;
    const range =
      parsed.range === "cheap" || parsed.range === "mid" || parsed.range === "high"
        ? parsed.range
        : estimate < 30
          ? "cheap"
          : estimate <= 75
            ? "mid"
            : "high";
    return { range, estimate: Math.round(estimate * 100) / 100 };
  } catch {
    return { range: "mid", estimate: 0 };
  }
}

// ── 3. 写入 Supabase（upsert by ASIN）──
async function upsertProduct(product) {
  // 先查是否已存在
  const queryUrl = `${REST}?asin=eq.${product.asin}&select=id`;
  const checkRes = await fetch(queryUrl, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });

  let existingId = null;
  if (checkRes.ok) {
    const rows = await checkRes.json();
    if (Array.isArray(rows) && rows.length > 0) {
      existingId = rows[0].id;
    }
  }

  if (existingId) {
    // UPDATE
    const res = await fetch(`${REST}?id=eq.${existingId}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(product),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`UPDATE failed: ${res.status} ${txt}`);
    }
    return "updated";
  } else {
    // INSERT
    const res = await fetch(REST, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(product),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`INSERT failed: ${res.status} ${txt}`);
    }
    return "inserted";
  }
}

// ── 主流程 ──
async function main() {
  console.log("=== 半自动商品更新 ===\n");
  if (DRY_RUN) console.log("⚠ DRY RUN 模式 — 不写入数据库\n");

  // 读取 ASIN 清单
  const asinsJson = JSON.parse(
    readFileSync(join(__dirname, "asins.json"), "utf8")
  );
  console.log(`📋 读取到 ${asinsJson.length} 个 ASIN\n`);

  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < asinsJson.length; i++) {
    const item = asinsJson[i];
    const { asin, audience, occasion } = item;

    console.log(`[${i + 1}/${asinsJson.length}] ${asin}`);

    // 1. 抓取亚马逊商品数据
    console.log("  → 抓取亚马逊...");
    const amazonData = await fetchAmazonProduct(asin);

    if (!amazonData) {
      console.log("  ✗ 抓取失败，跳过\n");
      failed++;
      await sleep(3000 + Math.random() * 2000);
      continue;
    }

    console.log(
      `  ✓ ${amazonData.name.substring(0, 50)}... | $${amazonData.price} | img: ${amazonData.image_url ? "✓" : "✗"}`
    );

    // 2. DeepSeek 生成配文
    console.log("  → 生成配文...");
    const copy = await generateCopywrite(
      amazonData.name,
      amazonData.brand,
      audience,
      occasion
    );
    console.log(`  ✓ desc: ${copy.description.substring(0, 50)}...`);
    console.log(`  ✓ reason: ${copy.review_quote.substring(0, 50)}...`);

    // 3. 组装商品数据 — 价格优先级：手动填写 > 抓取 > AI 估算
    let finalPrice = amazonData.price;
    let priceRange;
    let priceSource = "";

    if (item.price && item.price > 0) {
      // 手动填写的价格，最准确
      finalPrice = item.price;
      priceSource = "手动";
      priceRange = finalPrice < 30 ? "cheap" : finalPrice <= 75 ? "mid" : "high";
      console.log(`  ✓ 价格: $${finalPrice} (${priceRange}) [来自 asins.json]`);
    } else if (finalPrice > 0) {
      // 抓取到的真实价格
      priceSource = "抓取";
      priceRange = finalPrice < 30 ? "cheap" : finalPrice <= 75 ? "mid" : "high";
      console.log(`  ✓ 价格: $${finalPrice} (${priceRange}) [抓取]`);
    } else {
      // 价格未抓到，用 DeepSeek 推断价格区间
      console.log("  → 价格未抓到，AI 推断...");
      const guess = await guessPriceRange(amazonData.name, amazonData.brand);
      priceRange = guess.range;
      priceSource = "AI估算";
      if (guess.estimate > 0) {
        finalPrice = guess.estimate;
        console.log(`  ✓ 价格: ~$${finalPrice} (${priceRange}) [AI 估算]`);
      } else {
        finalPrice = 0;
        console.log(`  ✓ 区间: ${priceRange}（无具体价格）`);
      }
    }

    const product = {
      name: amazonData.name,
      price: finalPrice,
      image_url: amazonData.image_url || "",
      affiliate_url: `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`,
      asin,
      audience_tags: audience,
      occasion_tags: occasion,
      price_range: priceRange,
      description: copy.description,
      review_quote: copy.review_quote,
    };

    // 4. 写入数据库
    if (DRY_RUN) {
      console.log("  (dry-run) 跳过数据库写入\n");
      success++;
    } else {
      try {
        const action = await upsertProduct(product);
        console.log(`  ✓ 数据库 ${action}\n`);
        success++;
      } catch (err) {
        console.log(`  ✗ 数据库写入失败: ${err.message}\n`);
        failed++;
      }
    }

    // 防反爬延迟
    if (i < asinsJson.length - 1) {
      const delay = 3000 + Math.random() * 3000;
      process.stdout.write(`  等待 ${Math.round(delay / 1000)}s...`);
      await sleep(delay);
      console.log("\r" + " ".repeat(40) + "\r");
    }
  }

  console.log("=== 完成 ===");
  console.log(`成功: ${success} | 失败: ${failed} | 跳过: ${skipped}`);
  console.log(`总计: ${asinsJson.length}`);
}

main().catch((err) => {
  console.error("\n❌ 致命错误:", err.message);
  process.exit(1);
});
