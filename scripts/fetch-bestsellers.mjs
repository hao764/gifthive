// 从亚马逊 Best Sellers 抓礼物类 ASIN
import { writeFileSync } from "node:fs";
import { randomUA, sleep } from "./update-products.mjs";

const CATEGORIES = [
  {
    url: "https://www.amazon.com/Best-Sellers-Home-Kitchen/zgbs/home-garden/",
    audience: ["for-her", "for-parents"],
    occasion: ["birthday", "holiday", "thanks"],
  },
  {
    url: "https://www.amazon.com/Best-Sellers-Beauty/zgbs/beauty/",
    audience: ["for-her", "for-parents"],
    occasion: ["birthday", "anniversary"],
  },
  {
    url: "https://www.amazon.com/Best-Sellers-Electronics-Accessories/zgbs/electronics-accessories/",
    audience: ["for-him", "for-teens"],
    occasion: ["birthday", "holiday"],
  },
  {
    url: "https://www.amazon.com/Best-Sellers-Toys-Games/zgbs/toys-and-games/",
    audience: ["for-kids", "for-teens"],
    occasion: ["birthday", "holiday"],
  },
  {
    url: "https://www.amazon.com/Best-Sellers-Office-Products/zgbs/office-products/",
    audience: ["for-him", "for-parents"],
    occasion: ["thanks", "holiday"],
  },
  {
    url: "https://www.amazon.com/Best-Sellers-Patio-Lawn-Garden/zgbs/lawn-and-garden/",
    audience: ["for-parents", "for-him"],
    occasion: ["birthday", "holiday"],
  },
  {
    url: "https://www.amazon.com/Best-Sellers-Pet-Supplies/zgbs/pet-supplies/",
    audience: ["for-her", "for-parents"],
    occasion: ["birthday", "thanks"],
  },
  {
    url: "https://www.amazon.com/Best-Sellers-Grocery-Gourmet-Food/zgbs/grocery/",
    audience: ["for-parents", "for-her"],
    occasion: ["thanks", "holiday"],
  },
];

function extractASINs(html) {
  const asins = new Set();
  // Best Sellers 页面中商品链接格式：/dp/ASIN 或 /product/ASIN
  const dpRegex = /\/dp\/([A-Z0-9]{10})/gi;
  let m;
  while ((m = dpRegex.exec(html)) !== null) {
    asins.add(m[1]);
  }
  const prodRegex = /\/product\/([A-Z0-9]{10})/gi;
  while ((m = prodRegex.exec(html)) !== null) {
    asins.add(m[1]);
  }
  return [...asins].slice(0, 50);
}

async function fetchCategory(cat, maxRetries = 2) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`抓取: ${cat.url}...`);
      const res = await fetch(cat.url, {
        headers: {
          "User-Agent": randomUA(),
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        redirect: "follow",
      });

      if (!res.ok) {
        console.log(`  HTTP ${res.status}`);
        if (attempt < maxRetries - 1) {
          await sleep(4000 + Math.random() * 3000);
          continue;
        }
        return [];
      }

      const html = await res.text();

      // 拦截检测
      if (
        html.includes("validateCaptcha") ||
        html.includes("captcha") ||
        html.length < 5000
      ) {
        console.log(`  ⚠ CAPTCHA 拦截 (尝试 ${attempt + 1}/${maxRetries})`);
        if (attempt < maxRetries - 1) {
          await sleep(6000 + Math.random() * 4000);
          continue;
        }
        return [];
      }

      const asins = extractASINs(html);
      console.log(`  ✓ 抓到 ${asins.length} 个 ASIN`);
      return asins.map((asin) => ({
        asin,
        audience: cat.audience,
        occasion: cat.occasion,
      }));
    } catch (err) {
      console.log(`  error: ${err.message}`);
      if (attempt < maxRetries - 1) {
        await sleep(4000 + Math.random() * 3000);
      }
    }
  }
  return [];
}

async function main() {
  const allProducts = [];
  const seenASINs = new Set();

  for (const cat of CATEGORIES) {
    const items = await fetchCategory(cat);
    for (const item of items) {
      if (!seenASINs.has(item.asin)) {
        seenASINs.add(item.asin);
        allProducts.push(item);
      }
    }
    // 分类之间间隔
    await sleep(3000 + Math.random() * 2000);
  }

  console.log(`\n总计: ${allProducts.length} 个去重后的 ASIN`);

  // 写入 asins.json
  const outPath = new URL("./asins.json", import.meta.url).pathname;
  writeFileSync(outPath, JSON.stringify(allProducts, null, 2));
  console.log(`已写入: ${outPath}`);

  // 统计
  const stats = {};
  for (const p of allProducts) {
    for (const a of p.audience) {
      stats[`audience:${a}`] = (stats[`audience:${a}`] || 0) + 1;
    }
    for (const o of p.occasion) {
      stats[`occasion:${o}`] = (stats[`occasion:${o}`] || 0) + 1;
    }
  }
  console.log("\n分布统计:");
  for (const [k, v] of Object.entries(stats)) {
    console.log(`  ${k}: ${v}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
