// 脚本：查询 Supabase 所有商品，用 fixImageUrl 验证配图，批量更新错误配图
// 运行方式：npx tsx scripts/fix-images.ts

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// 手动加载 .env.local
const envFile = readFileSync(".env.local", "utf-8");
for (const line of envFile.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.substring(0, eq).trim();
  const value = trimmed.substring(eq + 1).trim();
  if (!process.env[key]) {
    process.env[key] = value;
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============ 图片映射 ============
const U = "https://images.unsplash.com/";
const P = "?w=800&h=600&fit=crop&q=80";
const uImg = (id: string) => `${U}${id}${P}`;

const IMG = {
  coffee: uImg("photo-1495474472287-4d71bcdd2085"),
  keyboard: uImg("photo-1618384887929-16ec33fab9ef"),
  vinyl: uImg("photo-1602848597941-0d3d3a2c1241"),
  beer: uImg("photo-1571613316887-6f8d5cbf7ef7"),
  plant: uImg("photo-1485955900006-10f4d324d411"),
  wallet: uImg("photo-1627123424574-724758594e93"),
  candle: uImg("photo-1561212856-44e9bae482aa"),
  mug: uImg("photo-1514228742587-6b1558fcca3d"),
  tote: uImg("photo-1574365569389-a10d488ca3fb"),
  jewelry: uImg("photo-1601121141461-9d6647bca1ed"),
  toys: uImg("photo-1558877385-81a1c7e67d72"),
  books: uImg("photo-1512820790803-83ca734da794"),
  notebook: uImg("photo-1501618669935-18b6ecb13d6d"),
  tea: uImg("photo-1610478506025-8110cc8f1986"),
  food: uImg("photo-1497700003451-e1df943a194b"),
  game: uImg("photo-1629760946220-5693ee4c46ac"),
  art: uImg("photo-1554907984-15263bfd63bd"),
  clothing: uImg("photo-1620799140408-edc6dcb6d633"),
  skincare: uImg("photo-1556228578-8c89e6adf883"),
  chocolate: uImg("photo-1623660053975-cf75a8be0908"),
  gift: uImg("photo-1549465220-1a8b9238cd48"),
  honey: uImg("photo-1587049352851-8d4e89133924"),
  oil: uImg("photo-1474979266404-7eaacbcd87c5"),
  socks: uImg("photo-1615486364462-ef6363adbc18"),
  garden: uImg("photo-1416879595882-3373a0480b5b"),
  automotive: uImg("photo-1530124566582-a618bc2615dc"),
  electronics: uImg("photo-1518770660439-4636190af475"),
  kitchen: uImg("photo-1585771724684-38269d6639fd"),
  power: uImg("photo-1509391366360-2e959784a276"),
  appliance: uImg("photo-1556909114-f6e7ad7d3136"),
  outdoor: uImg("photo-1487049192591-759e21d14b0b"),
  pet: uImg("photo-1583337130417-3346a1be7dee"),
  sports: uImg("photo-1517649763962-0c623066013b"),
  default: uImg("photo-1514228742587-6b1558fcca3d"),
};

// 词边界匹配
const _WB = (kw: string) => new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
const has = (s: string, kw: string) => _WB(kw).test(s);

// ============ 改进的分类逻辑 ============
// 优先级顺序很重要：更具体的分类要在前面
function classifyProduct(name: string): { category: string; image: string } {
  const s = name.toLowerCase();

  // ---- 1. 办公 / 文具 / 书写工具 (优先于 jewelry，防止 "gold pen" 被误判) ----
  if (
    has(s, "pen") || has(s, "pencil") || has(s, "marker") ||
    has(s, "stationery") || has(s, "desk") || has(s, "notebook") ||
    has(s, "journal") || has(s, "planner") || has(s, "sticky note") ||
    has(s, "sticky note") || has(s, "post-it") || has(s, "binder") ||
    has(s, "clip") || has(s, "tape") && !has(s, "duct") ||
    has(s, "envelope") || has(s, "letter") || has(s, "scissors") && !has(s, "kitchen")
  )
    return { category: "office", image: IMG.notebook };

  // ---- 2. 阅读 / 书籍 ----
  if (
    has(s, "book") || has(s, "cookbook") || has(s, "novel") ||
    has(s, "reading") || has(s, "literature") || has(s, "bible")
  )
    return { category: "reading", image: IMG.books };

  // ---- 3. 工具 / 汽车 / 维修 ----
  if (
    has(s, "tire") || has(s, "inflator") || has(s, "automotive") ||
    has(s, "vehicle") || has(s, "garage") || has(s, "mechanic") ||
    has(s, "wrench") || has(s, "tool") || has(s, "drill") ||
    has(s, "socket") || has(s, "repair") || has(s, "compressor") ||
    has(s, "brake") || has(s, "car") || has(s, "truck") ||
    has(s, "ratchet") || has(s, "screwdriver") || has(s, "hammer") ||
    has(s, "plier") || has(s, "level") || has(s, "tape measure") ||
    (has(s, "cleaner") && has(s, "car")) ||
    (has(s, "magnetic") && has(s, "wristband"))
  )
    return { category: "automotive/tools", image: IMG.automotive };

  // ---- 4. 电子 / 数码 ----
  if (
    has(s, "bluetooth") || has(s, "tracker") || has(s, "speaker") ||
    has(s, "headphone") || has(s, "earbud") || has(s, "monitor") ||
    has(s, "mouse") || has(s, "charger") || has(s, "cable") ||
    has(s, "wireless") || has(s, "electronic") || has(s, "smart") ||
    has(s, "digital") || has(s, "camera") || has(s, "doorbell") ||
    (has(s, "lock") && !has(s, "jewelry")) ||
    has(s, "scale") || has(s, "sensor") || has(s, "purifier") ||
    has(s, "humidifier") || has(s, "diffuser") || has(s, "fan") ||
    has(s, "usb") || has(s, "adapter") || has(s, "hub") ||
    has(s, "plug") || has(s, "thermometer") || has(s, "heater") ||
    has(s, "massage gun") || has(s, "neck fan") ||
    (has(s, "power") && (has(s, "bank") || has(s, "station") || has(s, "pack")))
  )
    return { category: "electronics", image: IMG.electronics };

  // ---- 5. 厨房 / 食品 / 饮品 ----
  if (
    has(s, "blender") || has(s, "mixer") || has(s, "toaster") ||
    has(s, "kettle") || has(s, "frother") ||
    has(s, "kitchen") || has(s, "cooking") || has(s, "bake") ||
    has(s, "carafe") || has(s, "cake") || has(s, "mold") ||
    has(s, "juice") || has(s, "wine") || has(s, "coffee") ||
    has(s, "pour-over") || has(s, "bean") || has(s, "tea") ||
    has(s, "food") || has(s, "sauce") || has(s, "honey") ||
    has(s, "chocolate") || has(s, "pizza") || has(s, "snack") ||
    has(s, "candy") || has(s, "lollipop") || has(s, "brew") ||
    has(s, "espresso") || has(s, "utensil") || has(s, "cutting board") ||
    has(s, "pot") || has(s, "pan") || has(s, "grill") ||
    has(s, "grilling") || has(s, "skillet") || has(s, "cookware") ||
    has(s, "spork") || has(s, "frying") || has(s, "soup") ||
    (has(s, "lunch") && has(s, "box"))
  )
    return { category: "kitchen/food", image: IMG.kitchen };

  // ---- 6. 电源 / 充电 ----
  if (
    has(s, "solar") || has(s, "battery") ||
    has(s, "generator")
  )
    return { category: "power", image: IMG.power };

  // ---- 7. 家电 / 清洁 ----
  if (
    has(s, "vacuum") || has(s, "steamer") || has(s, "iron") ||
    has(s, "laundry") || has(s, "dishwasher") || has(s, "refrigerator") ||
    has(s, "freezer") || has(s, "ice") || has(s, "cooler") ||
    (has(s, "block") && !has(s, "kid") && !has(s, "wood") && !has(s, "building")) ||
    has(s, "electric") && has(s, "lunch")
  )
    return { category: "appliance", image: IMG.appliance };

  // ---- 8. 户外 / 运动 / 露营 ----
  if (
    has(s, "camping") || has(s, "tent") || has(s, "hiking") ||
    has(s, "backpack") || has(s, "fishing") || has(s, "hunter") ||
    has(s, "outdoor") || has(s, "sport") || has(s, "yoga") ||
    has(s, "fitness") || has(s, "workout") || has(s, "dumbbell") ||
    has(s, "runner") || has(s, "cycling") || (has(s, "bike") && !has(s, "kid")) ||
    has(s, "skate") || has(s, "golf") || has(s, "tennis") ||
    has(s, "basketball") || has(s, "soccer") ||
    has(s, "stove") || has(s, "camp") || has(s, "fire") ||
    has(s, "grate") || has(s, "barbecue") || has(s, "propane") ||
    has(s, "pocket rocket") || has(s, "headlamp") ||
    has(s, "flashlight") || has(s, "lantern") ||
    has(s, "marshmallow") || has(s, "smores") || has(s, "roasting") ||
    has(s, "backpacking") || has(s, "fire starter") ||
    (has(s, "chair") && (has(s, "camping") || has(s, "rocker") || has(s, "outdoor")))
  )
    return { category: "outdoor/sports", image: IMG.outdoor };

  // ---- 9. 宠物 ----
  if (
    has(s, "dog") || has(s, "cat") || has(s, "pet") ||
    has(s, "puppy") || has(s, "kitten") || has(s, "fish") ||
    has(s, "bird") || has(s, "aquarium")
  )
    return { category: "pet", image: IMG.pet };

  // ---- 10. 游戏 / 娱乐 ----
  if (
    has(s, "game") || (has(s, "board") && !has(s, "kitchen") && !has(s, "cutting")) ||
    has(s, "playing card") || has(s, "card game") ||
    (has(s, "puzzle") && !has(s, "kid")) ||
    has(s, "chess") || has(s, "dice") || has(s, "slot") ||
    has(s, "casino")
  )
    return { category: "games", image: IMG.game };

  // ---- 11. 玩具 / 儿童 ----
  if (
    has(s, "toy") || has(s, "kid") ||
    has(s, "plush") || has(s, "microscope") || has(s, "building") ||
    has(s, "lego") || has(s, "flash card") ||
    has(s, "bubble") || has(s, "paint") && has(s, "rock") ||
    has(s, "airplane") || has(s, "helicopter") ||
    has(s, "toddler") || has(s, "baby") ||
    has(s, "t-shirt") && has(s, "kid")
  )
    return { category: "toys", image: IMG.toys };

  // ---- 12. 服饰 / 穿戴 ----
  if (
    has(s, "scarf") || has(s, "robe") || has(s, "cardigan") ||
    has(s, "slipper") || has(s, "sock") || has(s, "wear") ||
    has(s, "blanket") || has(s, "shoe") || has(s, "boot") ||
    has(s, "jacket") || has(s, "shirt") || has(s, "dress") ||
    has(s, "pants") || has(s, "hat") || has(s, "glove") ||
    has(s, "beanie") || has(s, "clothing")
  )
    return { category: "clothing", image: IMG.clothing };

  // ---- 13. 美妆 / 个护 ----
  if (
    has(s, "cream") || has(s, "skincare") || has(s, "soap") ||
    has(s, "lotion") || has(s, "serum") || (has(s, "mask") && !has(s, "kid")) ||
    has(s, "shampoo") || has(s, "conditioner") || has(s, "lip") ||
    has(s, "makeup") || has(s, "cosmetic") || has(s, "beard") ||
    has(s, "shaving") || has(s, "shower") || has(s, "bath") ||
    has(s, "aromatherapy") || has(s, "steam") || has(s, "massage") ||
    has(s, "toilet") || has(s, "spray") && has(s, "poo-pourri")
  )
    return { category: "skincare/personal", image: IMG.skincare };

  // ---- 14. 珠宝 / 饰品 ----
  if (
    has(s, "necklace") || has(s, "jewelry") || has(s, "bracelet") ||
    (has(s, "ring") && !has(s, "bell") && !has(s, "spring") && !has(s, "ear")) ||
    has(s, "earring") || has(s, "pendant") || has(s, "chain") ||
    (has(s, "gold") && !has(s, "pen") && !has(s, "marker")) ||
    has(s, "silver") || has(s, "diamond") ||
    has(s, "jade") || has(s, "choker")
  )
    return { category: "jewelry", image: IMG.jewelry };

  // ---- 15. 家居 / 装饰 ----
  if (
    has(s, "plant") || has(s, "garden") || has(s, "herb") ||
    has(s, "home") || has(s, "decor") || has(s, "frame") ||
    has(s, "photo") || has(s, "vase") || has(s, "lamp") ||
    has(s, "light") || has(s, "mirror") || (has(s, "bed") && !has(s, "room")) ||
    has(s, "pillow") || has(s, "curtain") || has(s, "carpet") ||
    has(s, "rug") || has(s, "candle") || has(s, "tray") ||
    has(s, "stand") || has(s, "album") || has(s, "scrapbook") ||
    has(s, "drawer") || has(s, "organizer") || has(s, "broom") ||
    has(s, "dustpan") || has(s, "clean") && has(s, "towel")
  )
    return { category: "home/decor", image: IMG.default };

  // ---- 16. 音乐 / 音频 ----
  if (
    has(s, "vinyl") || has(s, "turntable") || has(s, "record") ||
    has(s, "music") || has(s, "guitar") || has(s, "piano") ||
    has(s, "drum") || has(s, "audio")
  )
    return { category: "music", image: IMG.vinyl };

  // ---- 17. 艺术 / 手工 ----
  if (
    has(s, "art") || has(s, "print") ||
    (has(s, "paint") && !has(s, "rock")) ||
    has(s, "canvas") || has(s, "craft") || has(s, "diy")
  )
    return { category: "art/craft", image: IMG.art };

  // ---- 18. 医疗 / 急救 ----
  if (
    has(s, "first aid") || has(s, "band-aid") || has(s, "bandage") ||
    has(s, "heal") || has(s, "wound")
  )
    return { category: "health/first-aid", image: IMG.appliance };

  // ---- 19. 能量饮料 / 啤酒 ----
  if (
    has(s, "beer") || has(s, "brew")
  )
    return { category: "beer", image: IMG.beer };

  return { category: "default", image: IMG.default };
}

// ========== 主逻辑 ==========
async function main() {
  console.log("🔍 从 Supabase 查询所有商品...");
  
  const { data, error } = await supabase
    .from("products")
    .select("id, name, image_url")
    .order("id", { ascending: true });

  if (error) {
    console.error("❌ 查询失败:", error.message);
    process.exit(1);
  }

  const products = data as any[];
  console.log(`📦 共查到 ${products.length} 个商品\n`);

  let needUpdate = 0;
  let alreadyCorrect = 0;
  let noImage = 0;

  // 分类统计
  const categoryStats: Record<string, number> = {};
  const updateList: { id: number; correctImage: string; currentImage: string; name: string; category: string }[] = [];

  for (const p of products) {
    const { category, image: correctImage } = classifyProduct(p.name);
    const currentImage = p.image_url || "";
    
    categoryStats[category] = (categoryStats[category] || 0) + 1;

    if (!currentImage || currentImage.trim() === "") {
      updateList.push({ id: p.id, correctImage, currentImage, name: p.name, category });
      needUpdate++;
    } else if (currentImage === correctImage) {
      alreadyCorrect++;
    } else {
      updateList.push({ id: p.id, correctImage, currentImage, name: p.name, category });
      needUpdate++;
    }
  }

  console.log(`📊 分类统计 (按商品名推断):`);
  for (const [cat, count] of Object.entries(categoryStats).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${cat}: ${count}`);
  }

  console.log(`\n📋 统计结果:`);
  console.log(`   图片已正确: ${alreadyCorrect}`);
  console.log(`   需要更新: ${needUpdate}`);

  // 打印前 20 个需要更新的商品
  if (updateList.length > 0) {
    console.log(`\n🔍 前 20 个待更新商品预览:`);
    for (let i = 0; i < Math.min(20, updateList.length); i++) {
      const u = updateList[i];
      console.log(`   ${u.id} [${u.category}] ${u.name.substring(0, 50)}`);
      console.log(`     旧: ${(u.currentImage || "(空)").substring(0, 60)}`);
      console.log(`     新: ${u.correctImage.substring(0, 60)}`);
    }
  }

  if (needUpdate === 0) {
    console.log("\n✅ 所有商品配图都是正确的！");
    process.exit(0);
  }

  // ============ 批量更新：使用 .update() 而不是 .upsert() ============
  console.log(`\n🔧 开始批量更新 ${updateList.length} 个商品...`);

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

  console.log(`\n🎉 完成！共更新了 ${totalUpdated} 个商品的配图。`);

  // 验证
  console.log("\n🔍 验证更新结果 (前 15 个):");
  const { data: verifyData } = await supabase
    .from("products")
    .select("id, name, image_url")
    .order("id", { ascending: true })
    .limit(15);

  let verifiedOk = 0;
  for (const p of (verifyData as any[])) {
    const { category, image } = classifyProduct(p.name);
    const match = p.image_url === image ? "✅" : "❌";
    if (p.image_url === image) verifiedOk++;
    console.log(`  ${match} ID=${p.id} [${category}] ${p.name.substring(0, 40)}`);
  }
  console.log(`\n  验证通过: ${verifiedOk} / 15`);
}

main().catch(err => {
  console.error("脚本执行失败:", err);
  process.exit(1);
});