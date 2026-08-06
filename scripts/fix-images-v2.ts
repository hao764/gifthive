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
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ======== 分类图片映射 ========
const IMG = {
  automotive: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80",
  baby: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600&q=80",
  beer: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=80",
  clothing: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
  coffee: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80",
  default: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80",
  electronics: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80",
  games: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&q=80",
  health: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=600&q=80",
  home: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
  jewelry: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80",
  kitchen: "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&q=80",
  office: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=600&q=80",
  outdoor: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80",
  personal: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80",
  reading: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80",
  sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80",
  toys: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&q=80",
  wellness: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
};

// 词边界匹配
const _WB = (kw: string) => new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
const has = (s: string, kw: string) => _WB(kw).test(s);

function classifyProduct(name: string) {
  const s = (name || "").toLowerCase();

  // ---- 1. 汽车/工具/硬件 ----
  if (
    has(s, "car") || has(s, "auto") || has(s, "vehicle") ||
    has(s, "tire") || has(s, "tyre") || has(s, "wheel") ||
    has(s, "inflator") || has(s, "pressure") && has(s, "tire") ||
    has(s, "automotive") || has(s, "mechanic") ||
    has(s, "garage") || has(s, "motorcycle") || has(s, "bike") && !has(s, "exercise") && !has(s, "stationary") && !has(s, "bounce") && !has(s, "balance") && !has(s, "mini") && !has(s, "pogo") && !has(s, "stunt") && !has(s, "scissor") ||
    has(s, "tool") || has(s, "drill") || has(s, "hammer") ||
    has(s, "wrench") || has(s, "screwdriver") || has(s, "socket") ||
    has(s, "brake") || has(s, "oil filter") || has(s, "air filter") ||
    has(s, "spark plug") || has(s, "wiper") || has(s, "headlight") ||
    has(s, "additive") || has(s, "fluid") ||
    has(s, "box cutter") || has(s, "utility knife") ||
    has(s, "air duster") ||
    has(s, "magnetic wristband") || has(s, "wristband tool") ||
    has(s, "hand warmer") || has(s, "warm") && has(s, "hand")
  )
    return { category: "automotive/tools", image: IMG.automotive };

  // ---- 2. 办公/文具 ----
  if (
    has(s, "pen") || has(s, "pencil") || has(s, "marker") ||
    has(s, "stationery") || has(s, "desk") || has(s, "notebook") ||
    has(s, "journal") || has(s, "planner") || has(s, "sticky note") ||
    has(s, "post-it") || has(s, "binder") || has(s, "paper") && has(s, "clip") ||
    has(s, "tape") && !has(s, "duct") && !has(s, "masking") && !has(s, "electric") ||
    has(s, "envelope") || has(s, "letter") || has(s, "scissors") ||
    has(s, "gel pen") || has(s, "ballpoint") ||
    has(s, "highlighter") || has(s, "sharpie") ||
    has(s, "spiral notebook") || has(s, "notebook") ||
    has(s, "writing practice") ||
    has(s, "scrapbook") || has(s, "photo album") ||
    has(s, "bookmark") || has(s, "flash card")
  )
    return { category: "office", image: IMG.office };

  // ---- 3. 阅读/书籍/学习 ----
  if (
    has(s, "book") || has(s, "bookmark") && !has(s, "leather heart") ||
    has(s, "novel") || has(s, "bible") ||
    has(s, "reading light") || has(s, "book light") ||
    has(s, "page") || has(s, "literature")
  )
    return { category: "reading", image: IMG.reading };

  // ---- 4. 电子产品 ----
  if (
    has(s, "earbud") || has(s, "earbuds") ||
    has(s, "headphone") || has(s, "headphones") ||
    has(s, "smart watch") || has(s, "smartwatch") ||
    has(s, "electronic") || has(s, "device") ||
    has(s, "thermometer") && !has(s, "meat") ||
    has(s, "flash drive") || has(s, "usb") ||
    has(s, "bluetooth") || has(s, "wireless") && !has(s, "earbud") && !has(s, "headphone") ||
    has(s, "speaker") || has(s, "charger") ||
    has(s, "cable") || has(s, "adapter") ||
    has(s, "monitor") || has(s, "keyboard") && !has(s, "piano") ||
    has(s, "mouse") || has(s, "webcam") ||
    has(s, "projector") || has(s, "camera") ||
    has(s, "phone") || has(s, "laptop") ||
    has(s, "tablet") || has(s, "drone") ||
    has(s, "vr") || has(s, "virtual reality") ||
    has(s, "console") || has(s, "gaming") ||
    has(s, "appliance") || has(s, "refrigerator") ||
    has(s, "freezer") || has(s, "dishwasher") ||
    has(s, "microwave") || has(s, "oven") && !has(s, "toaster") && !has(s, "pizza") && !has(s, "roaster") && !has(s, "smoker") && !has(s, "curing") ||
    has(s, "magnet") || has(s, "magnetic") || has(s, "magnetism") ||
    has(s, "lcd writing tablet") ||
    has(s, "calculator") || has(s, "timer") ||
    has(s, "clock") || has(s, "alarm")
  )
    return { category: "electronics/appliance", image: IMG.electronics };

  // ---- 5. 厨房/食品 ----
  if (
    has(s, "food") || has(s, "snack") ||
    has(s, "coffee") || has(s, "espresso") || has(s, "latte") ||
    has(s, "tea") || has(s, "herbal") ||
    has(s, "chocolate") || has(s, "cookie") ||
    has(s, "candy") || has(s, "sweet") ||
    has(s, "spice") || has(s, "seasoning") ||
    has(s, "sauce") || has(s, "olive oil") ||
    has(s, "kitchen") || has(s, "cook") ||
    has(s, "pot") || has(s, "pan") ||
    has(s, "fork") || has(s, "knife") ||
    has(s, "plate") || has(s, "bowl") ||
    has(s, "mug") || has(s, "cup") ||
    has(s, "blender") || has(s, "mixer") ||
    has(s, "toaster") || has(s, "kettle") ||
    has(s, "cookbook") || has(s, "recipe") ||
    has(s, "pepper") && !has(s, "spray") ||
    has(s, "salt") && !has(s, "pepper") && !has(s, "bath") && !has(s, "body") && !has(s, "foot") && !has(s, "hand") && !has(s, "hair") && !has(s, "scrub") && !has(s, "sugar") ||
    has(s, "biscotti") || has(s, "cracker") ||
    has(s, "roast") || has(s, "ground") ||
    has(s, "brew") || has(s, "brewing") ||
    has(s, "pastry") || has(s, "bakery") ||
    has(s, "cake") || has(s, "baking") ||
    has(s, "cookie") || has(s, "cookie") ||
    has(s, "tic tac") || has(s, "mint") && !has(s, "hair") && !has(s, "leaf") && !has(s, "scalp") && !has(s, "treatment") ||
    has(s, "nut") || has(s, "almond") ||
    has(s, "popcorn") || has(s, "rice krispies") ||
    has(s, "energy drink") ||
    has(s, "bottle") && !has(s, "wine") && !has(s, "whiskey") && !has(s, "oil") ||
    has(s, "cutting board") ||
    has(s, "smoker") || has(s, "cocktail") ||
    has(s, "coaster") ||
    has(s, "dinner plate") ||
    has(s, "tray") && !has(s, "jewelry") && !has(s, "perfume") ||
    has(s, "spice jar") ||
    has(s, "lunch bag")
  )
    return { category: "kitchen/food", image: IMG.kitchen };

  // ---- 6. 户外/运动 ----
  if (
    has(s, "outdoor") || has(s, "camping") || has(s, "hiking") ||
    has(s, "tent") || has(s, "torch") ||
    has(s, "hammock") || has(s, "beach") ||
    has(s, "fishing") || has(s, "boat") ||
    has(s, "golf") || has(s, "yoga") || has(s, "gym") ||
    has(s, "exercise") || has(s, "fitness") || has(s, "workout") ||
    has(s, "supplement") || has(s, "protein") ||
    has(s, "camping") || has(s, "camp") ||
    has(s, "explorer") || has(s, "adventure") ||
    has(s, "backpack") ||
    has(s, "boomerang") ||
    has(s, "punch balloon") ||
    has(s, "spray") && has(s, "sunscreen") ||
    has(s, "sunscreen") ||
    has(s, "water filter")
  )
    return { category: "outdoor/sports", image: IMG.outdoor };

  // ---- 7. 婴儿/儿童 ----
  if (
    has(s, "baby") || has(s, "newborn") ||
    has(s, "stroller") || has(s, "car seat") ||
    has(s, "diaper") || has(s, "pacifier") ||
    has(s, "high chair") || has(s, "crib") ||
    has(s, "onesie") || has(s, "bib")
  )
    return { category: "baby", image: IMG.baby };

  // ---- 8. 玩具/游戏 ----
  if (
    has(s, "toy") || has(s, "game") || has(s, "puzzle") ||
    has(s, "chess") || has(s, "card game") ||
    has(s, "doll") || has(s, "plush") ||
    has(s, "lego") || has(s, "building block") ||
    has(s, "coloring") || has(s, "crayon") ||
    has(s, "paint") || has(s, "craft") ||
    has(s, "slime") || has(s, "putty") ||
    has(s, "play-doh") || has(s, "play doh") ||
    has(s, "fidget") || has(s, "spinner") || has(s, "squishy") ||
    has(s, "plushie") || has(s, "stuffed") ||
    has(s, "rain show") || has(s, "splash pond") ||
    has(s, "glow stick") || has(s, "balloon") ||
    has(s, "bubble wand") ||
    has(s, "airplane launcher") ||
    has(s, "tie dye") ||
    has(s, "playing card") || has(s, "card") && !has(s, "business") && !has(s, "credit") && !has(s, "gift") ||
    has(s, "magnet tile") ||
    has(s, "dinosaur") ||
    has(s, "party favor") ||
    has(s, "punch balloon")
  )
    return { category: "toys/games", image: IMG.toys };

  // ---- 9. 护肤/个人护理 ----
  if (
    has(s, "skincare") || has(s, "moisturizer") || has(s, "serum") ||
    has(s, "cleanser") || has(s, "toner") ||
    has(s, "lotion") || has(s, "cream") ||
    has(s, "exfoliant") || has(s, "mask") ||
    has(s, "sunscreen") ||
    has(s, "makeup") || has(s, "cosmetic") ||
    has(s, "lip") || has(s, "mascara") ||
    has(s, "foundation") || has(s, "blush") ||
    has(s, "shampoo") || has(s, "conditioner") ||
    has(s, "brush") && !has(s, "paint") && !has(s, "broom") && !has(s, "pastry") ||
    has(s, "bath") || has(s, "body wash") ||
    has(s, "shower") || has(s, "soap") ||
    has(s, "tooth") || has(s, "dental") ||
    has(s, "shaver") || has(s, "shaving") ||
    has(s, "deodorant") || has(s, "antiperspirant") ||
    has(s, "towel") || has(s, "washcloth") ||
    has(s, "manicure") || has(s, "nail") ||
    has(s, "hair") || has(s, "styling") ||
    has(s, "perfume") || has(s, "parfum") || has(s, "cologne") ||
    has(s, "aftershave") ||
    has(s, "back scratcher") || has(s, "scratcher") ||
    has(s, "eye patch") || has(s, "under eye") ||
    has(s, "body scrub") ||
    has(s, "claw clip") ||
    has(s, "hair clip") ||
    has(s, "hair tie") ||
    has(s, "hair bow")
  )
    return { category: "skincare/personal care", image: IMG.personal };

  // ---- 10. 医疗/健康 ----
  if (
    has(s, "band") || has(s, "cast") ||
    has(s, "first aid") || has(s, "kit") ||
    has(s, "thermometer") && has(s, "forehead") ||
    has(s, "massage") || has(s, "pain relief") ||
    has(s, "heating pad") ||
    has(s, "blood pressure") ||
    has(s, "wheelchair") || has(s, "walker") ||
    has(s, "crutch") || has(s, "cane") ||
    has(s, "hospital") || has(s, "clinic") ||
    has(s, "pharmacy") || has(s, "medicine") ||
    has(s, "pain") || has(s, "relief") ||
    has(s, "posture") || has(s, "backpod") ||
    has(s, "stress ball")
  )
    return { category: "health/first-aid", image: IMG.health };

  // ---- 11. 珠宝/配饰 ----
  if (
    has(s, "jewel") || has(s, "jewelry") || has(s, "jewellery") ||
    has(s, "necklace") || has(s, "bracelet") ||
    has(s, "ring") && !has(s, "curtain") && !has(s, "doughnut") && !has(s, "onion") && !has(s, "pineapple") ||
    has(s, "earring") || has(s, "anklet") ||
    has(s, "pendant") || has(s, "medallion") ||
    has(s, "diamond") || has(s, "gold") ||
    has(s, "silver") || has(s, "platinum") ||
    has(s, "gem") || has(s, "pearl") ||
    has(s, "watch") && !has(s, "smart") ||
    has(s, "body chain")
  )
    return { category: "jewelry", image: IMG.jewelry };

  // ---- 12. 家居/装饰/DIY ----
  if (
    has(s, "home") || has(s, "decor") ||
    has(s, "curtain") || has(s, "blind") ||
    has(s, "rug") || has(s, "carpet") ||
    has(s, "bed") || has(s, "bedding") ||
    has(s, "sheet") || has(s, "pillow") ||
    has(s, "lamp") || has(s, "light") && !has(s, "candle") && !has(s, "reading") && !has(s, "night") ||
    has(s, "mirror") || has(s, "picture frame") ||
    has(s, "painting") || has(s, "wall art") ||
    has(s, "vase") || has(s, "urn") ||
    has(s, "candle") || has(s, "scented") ||
    has(s, "broom") || has(s, "dustpan") ||
    has(s, "spray bottle") ||
    has(s, "drawer organizer") ||
    has(s, "fake plant") || has(s, "eucalyptus") ||
    has(s, "terrarium") ||
    has(s, "riser") ||
    has(s, "candle warmer") ||
    has(s, "yankee candle") ||
    has(s, "wreath") ||
    has(s, "stems") ||
    has(s, "ivy")
  )
    return { category: "home/decor", image: IMG.home };

  // ---- 13. 服装/鞋子/配饰 ----
  if (
    has(s, "clothing") || has(s, "apparel") || has(s, "outfit") ||
    has(s, "shirt") || has(s, "pants") || has(s, "dress") ||
    has(s, "shoe") || has(s, "sneaker") ||
    has(s, "boot") || has(s, "heel") ||
    has(s, "jacket") || has(s, "coat") ||
    has(s, "hat") || has(s, "cap") ||
    has(s, "scarf") || has(s, "glove") ||
    has(s, "sock") ||
    has(s, "underwear") || has(s, "pajama") ||
    has(s, "silk") || has(s, "cashmere") ||
    has(s, "slipper") ||
    has(s, "tie") || has(s, "bow tie") ||
    has(s, "belt") || has(s, "wallet") ||
    has(s, "handbag") || has(s, "purse") ||
    has(s, "luggage") || has(s, "suitcase")
  )
    return { category: "clothing", image: IMG.clothing };

  // ---- 14. 啤酒/酒精饮料 ----
  if (
    has(s, "beer") || has(s, "ale") || has(s, "lager") ||
    has(s, "whiskey") || has(s, "whisky") ||
    has(s, "vodka") || has(s, "tequila") ||
    has(s, "wine") || has(s, "champagne") ||
    has(s, "sake") ||
    has(s, "cocktail") && has(s, "smoker")
  )
    return { category: "beer/alcohol", image: IMG.beer };

  // ---- 15. 健康/健身/瑜伽 ----
  if (
    has(s, "wellness") || has(s, "meditation") ||
    has(s, "cortisol") || has(s, "magnesium") ||
    has(s, "vitamin") || has(s, "supplement") && has(s, "wellness") ||
    has(s, "protein") && has(s, "powder") ||
    has(s, "resveratrol") ||
    has(s, "adaptogen") || has(s, "l-theanine") ||
    has(s, "ashwagandha") ||
    has(s, "nootropic") || has(s, "smart drug")
  )
    return { category: "wellness", image: IMG.wellness };

  // ---- 16. 游戏/桌游/卡牌 ----
  if (
    has(s, "game") || has(s, "board game") || has(s, "card game") ||
    has(s, "puzzle") && !has(s, "jigsaw") ||
    has(s, "dice") || has(s, "token") ||
    has(s, "meeple") ||
    has(s, "strategy") || has(s, "role-playing") ||
    has(s, "tabletop") || has(s, "boardgame")
  )
    return { category: "games", image: IMG.games };

  // ---- 兜底：用默认图，不再透传错误的 URL ----
  return { category: "default", image: IMG.default };
}

async function main() {
  console.log("🔍 从 Supabase 查询所有商品...\n");

  const { data, error } = await supabase.from("products").select("*").order("id");
  if (error) {
    console.error("❌ 查询失败:", error.message);
    process.exit(1);
  }

  const products = data as any[];
  console.log(`📦 共查到 ${products.length} 个商品\n`);

  // 统计分类
  const stats: Record<string, number> = {};
  const updateList: Array<{
    id: number;
    name: string;
    oldUrl: string;
    correctImage: string;
    category: string;
  }> = [];

  for (const p of products) {
    const { category, image } = classifyProduct(p.name);
    stats[category] = (stats[category] || 0) + 1;

    const currentUrl = p.image_url || "";
    const correctImage = image;

    if (currentUrl !== correctImage) {
      updateList.push({
        id: p.id,
        name: p.name,
        oldUrl: currentUrl,
        correctImage,
        category,
      });
    }
  }

  console.log("📊 分类统计:");
  for (const [cat, count] of Object.entries(stats).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${cat}: ${count}`);
  }

  console.log(`\n📋 统计结果:`);
  console.log(`   图片已正确: ${products.length - updateList.length}`);
  console.log(`   需要更新: ${updateList.length}`);

  if (updateList.length === 0) {
    console.log("\n✅ 所有商品配图都是正确的！");
    return;
  }

  // 批量更新
  console.log(`\n📝 开始更新 ${updateList.length} 个商品...`);

  const BATCH_SIZE = 50;
  let totalUpdated = 0;

  for (let i = 0; i < updateList.length; i += BATCH_SIZE) {
    const batch = updateList.slice(i, i + BATCH_SIZE);

    for (const item of batch) {
      const { data: updateData, error: updateError } = await supabase
        .from("products")
        .update({ image_url: item.correctImage })
        .eq("id", item.id)
        .select("id, name, image_url");

      if (updateError) {
        console.error(`  ❌ ID=${item.id} 更新失败:`, updateError.message);
      } else {
        totalUpdated++;
      }
    }

    console.log(`  ✅ 已处理 ${Math.min(i + BATCH_SIZE, updateList.length)} / ${updateList.length}`);
  }

  console.log(`\n🎉 完成！共更新 ${totalUpdated} 个商品配图`);

  // 抽查验证
  console.log("\n🔍 抽查验证 (前15个)...");
  const verifyIds = updateList.slice(0, 15).map((i) => i.id);
  const { data: verifyData } = await supabase
    .from("products")
    .select("id, name, image_url")
    .in("id", verifyIds);

  let ok = 0;
  if (verifyData) {
    for (const v of verifyData) {
      const expected = updateList.find((u) => u.id === v.id)?.correctImage;
      const match = v.image_url === expected;
      if (match) ok++;
      if (!match) {
        const { category } = classifyProduct(v.name);
        console.log(
          `  ${match ? "✅" : "❌"} ID=${v.id} ${v.name.substring(0, 38)}... → ${category} ${match ? "✓" : "✗"}`
        );
      }
    }
  }
  console.log(`\n✅ 抽查通过: ${ok}/${verifyIds.length}`);
}

main().catch(console.error);
