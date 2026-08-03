import { load } from "cheerio";
import { writeFileSync } from "fs";

// ── Supabase config ──
const SUPABASE_URL = "https://xfbqxsawfavhyqeybauy.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_g8P9wR63Dskyk9VZBqhWbQ_xzcnyl83";

// ── Amazon search config ──
const KEYWORDS = [
  { kw: "birthday gift for him",           audience: ["for-him"],       occasion: ["birthday"] },
  { kw: "anniversary gift for men",        audience: ["for-him"],       occasion: ["anniversary"] },
  { kw: "Christmas gift for men",          audience: ["for-him"],       occasion: ["christmas"] },
  { kw: "gift ideas for boyfriend",        audience: ["for-him"],       occasion: ["birthday"] },
  { kw: "birthday gift for her",           audience: ["for-her"],       occasion: ["birthday"] },
  { kw: "anniversary gift for women",      audience: ["for-her"],       occasion: ["anniversary"] },
  { kw: "Christmas gift for women",        audience: ["for-her"],       occasion: ["christmas"] },
  { kw: "gifts for kids birthday",         audience: ["for-kids"],      occasion: ["birthday"] },
  { kw: "gifts for teen girl",             audience: ["for-kids"],      occasion: ["birthday"] },
  { kw: "gifts for teen boy",              audience: ["for-kids"],      occasion: ["birthday"] },
  { kw: "gifts for mom",                   audience: ["for-parents"],   occasion: ["birthday"] },
  { kw: "gifts for dad",                   audience: ["for-parents"],   occasion: ["birthday"] },
  { kw: "gifts for friends birthday",      audience: ["for-friends"],   occasion: ["birthday"] },
  { kw: "thank you gift",                  audience: ["for-friends"],   occasion: ["thanks"] },
  { kw: "coworker gift",                   audience: ["for-coworkers"], occasion: ["birthday"] },
  { kw: "housewarming gift",               audience: ["for-friends"],   occasion: ["thanks"] },
  { kw: "wedding gift",                    audience: ["for-friends"],   occasion: ["wedding"] },
  { kw: "new year gift",                   audience: ["for-friends"],   occasion: ["newyear"] },
];

const AFFILIATE_TAG = "gifthive-20";
const MAX_PER_SEARCH = 20;
const seenAsins = new Set();
const allProducts = [];

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Accept":
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  "Upgrade-Insecure-Requests": "1",
};

async function fetchAmazonSearch(keyword) {
  const url = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;
  console.log(`  → Fetching: ${url}`);
  const res = await fetch(url, { headers: HEADERS, redirect: "follow" });
  if (!res.ok) {
    console.log(`  ✗ HTTP ${res.status}`);
    return null;
  }
  const html = await res.text();
  return html;
}

function extractProducts(html, audience, occasion) {
  const $ = load(html);
  const products = [];
  const cards = $('[data-component-type="s-search-result"]').toArray();
  console.log(`    Found ${cards.length} product cards`);

  for (const card of cards) {
    if (products.length >= MAX_PER_SEARCH) break;
    const $card = $(card);
    const asin = $card.attr("data-asin");
    if (!asin || asin.length < 5 || seenAsins.has(asin)) continue;

    // Product name
    const nameEl = $card.find("h2 a span").first() || $card.find("h2 span").first();
    const name = nameEl.text().trim();
    if (!name || name.length < 5) continue;

    // Price
    const priceEl = $card.find(".a-price .a-offscreen").first();
    let price = 0;
    if (priceEl.length) {
      const priceText = priceEl.text().replace(/[^0-9.]/g, "");
      price = parseFloat(priceText) || 0;
    }
    if (price < 1) continue;

    // Image
    const imgEl = $card.find("img.s-image").first();
    const image_url = imgEl.attr("src") || "";
    if (!image_url) continue;

    // Skip if already seen
    seenAsins.add(asin);

    const priceRange = price < 30 ? "cheap" : price <= 75 ? "mid" : "high";

    products.push({
      name: name.substring(0, 200),
      price: Math.round(price * 100) / 100,
      image_url,
      affiliate_url: `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`,
      asin,
      audience_tags: audience,
      occasion_tags: occasion,
      price_range: priceRange,
      description: name.substring(0, 120),
      review_quote: "",
    });
  }
  return products;
}

async function insertIntoSupabase(products) {
  const url = `${SUPABASE_URL}/rest/v1/products`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
    },
    body: JSON.stringify(products),
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error(`  ✗ Supabase insert failed: ${res.status} ${errText}`);
    return false;
  }
  const data = await res.json();
  console.log(`  ✓ Inserted ${data.length} products into Supabase`);
  return true;
}

async function main() {
  console.log("=== Amazon Product Scraper ===\n");
  let totalInserted = 0;

  for (const { kw, audience, occasion } of KEYWORDS) {
    console.log(`\nSearching: "${kw}"`);
    const html = await fetchAmazonSearch(kw);
    if (!html) {
      console.log("  ✗ Failed to fetch page, skipping");
      continue;
    }

    const products = extractProducts(html, audience, occasion);
    console.log(`  Extracted ${products.length} unique products`);

    if (products.length === 0) {
      console.log("  No products found, trying alternative selectors...");
      // Try parsing with a broader approach
      const $ = load(html);
      const allLinks = $('a[href*="/dp/"]').toArray();
      console.log(`  Found ${allLinks.length} product links`);
      // Sometimes Amazon returns a different HTML structure
      // Check if we got a CAPTCHA or block page
      if (html.includes("captcha") || html.includes("Type the characters")) {
        console.log("  ⚠ CAPTCHA detected - Amazon is blocking requests");
      }
      continue;
    }

    allProducts.push(...products);

    // Insert in batches of 10
    for (let i = 0; i < products.length; i += 10) {
      const batch = products.slice(i, i + 10);
      const success = await insertIntoSupabase(batch);
      if (success) totalInserted += batch.length;
    }

    // Rate limit - wait 2 seconds between searches
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`\n=== Done! Total inserted: ${totalInserted} products ===`);

  // Also save to file as backup
  writeFileSync(
    "/workspace/scripts/scraped-products.json",
    JSON.stringify(allProducts, null, 2)
  );
  console.log(`Backup saved to scripts/scraped-products.json (${allProducts.length} products)`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
