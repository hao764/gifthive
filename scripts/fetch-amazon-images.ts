/**
 * 从亚马逊商品页抓取真实商品图（og:image），批量更新数据库 image_url
 * 用法：npx tsx scripts/fetch-amazon-images.ts
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

// 加载 .env.local
const envFile = readFileSync(join(process.cwd(), ".env.local"), "utf-8");
for (const line of envFile.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.substring(0, eq).trim();
  const value = trimmed.substring(eq + 1).trim();
  if (!process.env[key]) process.env[key] = value;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey);

const USER_AGENTS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
];

function extractAsin(url: string): string | null {
  const m1 = url.match(/\/dp\/([A-Z0-9]{10})/i);
  if (m1) return m1[1];
  const m2 = url.match(/\/gp\/product\/([A-Z0-9]{10})/i);
  if (m2) return m2[1];
  const m3 = url.match(/\/product\/([A-Z0-9]{10})/i);
  if (m3) return m3[1];
  return null;
}

async function fetchAmazonImage(asin: string): Promise<string | null> {
  const url = `https://www.amazon.com/dp/${asin}`;
  const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

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
      console.log(`  HTTP ${res.status}`);
      return null;
    }

    const html = await res.text();

    // 1. og:image
    const ogMatch = html.match(
      /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i
    );
    if (ogMatch) return ogMatch[1].replace(/&amp;/g, "&");

    // 2. landingImage src
    const landingMatch = html.match(
      /id=["']landingImage["'][^>]*\s+src=["']([^"']+)["']/i
    );
    if (landingMatch) return landingMatch[1].replace(/&amp;/g, "&");

    // 3. data-old-hires
    const hiresMatch = html.match(/data-old-hires=["']([^"']+)["']/i);
    if (hiresMatch) return hiresMatch[1].replace(/&amp;/g, "&");

    // 4. imgTagWrapperId 里的 img
    const wrapperMatch = html.match(
      /imgTagWrapperId[^>]*>[\s\S]*?<img[^>]*src=["']([^"']+)["']/i
    );
    if (wrapperMatch) return wrapperMatch[1].replace(/&amp;/g, "&");

    // 5. colorImage / main image
    const mainMatch = html.match(
      /["']colorImage["']\s*:\s*\{[^}]*["']hiRes["']\s*:\s*["']([^"']+)["']/i
    );
    if (mainMatch) return mainMatch[1];

    console.log(`  og:image not found in HTML (${html.length} chars)`);
    return null;
  } catch (err: any) {
    console.log(`  fetch error: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log("=== 亚马逊真实商品图抓取 ===\n");
  console.log("查询所有商品...");

  const { data, error } = await supabase
    .from("products")
    .select("id, name, asin, affiliate_url, image_url")
    .order("id");
  if (error) {
    console.error("查询失败:", error.message);
    process.exit(1);
  }

  const products = data as any[];
  console.log(`共 ${products.length} 个商品\n`);

  let updated = 0;
  let failed = 0;
  let skipped = 0;
  let alreadyReal = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];

    // 如果已经是亚马逊真实图，跳过
    if (p.image_url && /m\.media-amazon\.com/i.test(p.image_url)) {
      alreadyReal++;
      continue;
    }

    // 提取 ASIN
    let asin = p.asin;
    if (!asin && p.affiliate_url) {
      asin = extractAsin(p.affiliate_url);
    }

    if (!asin) {
      console.log(
        `[${i + 1}/${products.length}] 跳过 ${p.name.substring(0, 40)}... (无 ASIN)`
      );
      skipped++;
      continue;
    }

    process.stdout.write(
      `[${i + 1}/${products.length}] ${asin} ${p.name.substring(0, 40)}... `
    );

    const imageUrl = await fetchAmazonImage(asin);

    if (imageUrl) {
      const { error: updateError } = await supabase
        .from("products")
        .update({ image_url: imageUrl })
        .eq("id", p.id);

      if (updateError) {
        console.log(`更新失败: ${updateError.message}`);
        failed++;
      } else {
        console.log(`OK ${imageUrl.substring(0, 70)}`);
        updated++;
      }
    } else {
      console.log("未获取到图片");
      failed++;
    }

    // 延迟防反爬（1.5-3秒随机）
    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1500));
  }

  console.log("\n=== 完成 ===");
  console.log(`已有真实图: ${alreadyReal}`);
  console.log(`本次更新: ${updated}`);
  console.log(`跳过(无ASIN): ${skipped}`);
  console.log(`失败: ${failed}`);
}

main().catch(console.error);
