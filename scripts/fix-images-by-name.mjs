/**
 * 给数据库 280 条商品按名称重新匹配最合适的 Unsplash 图片
 * 思路：每个规则是 [关键词数组, photoId]，按顺序匹配第一个命中的
 * 直接更新数据库 image_url，让前端不用再做运行时映射
 */
import { readFileSync } from "fs";

// 手动读 .env.local
const envText = readFileSync(".env.local", "utf8");
for (const line of envText.split("\n")) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const REST = `${URL}/rest/v1/products`;
const P = "?w=800&h=600&fit=crop&q=80";

// 所有 photo ID 都已实测可访问
const RULES = [
  // === 烤肉 / BBQ ===
  [["meat thermometer", "thermometer"], "photo-1620829299882-b596fe8fb84c"],
  [["whiskey", "whisky", "bourbon", "smoker kit"], "photo-1615887023544-3a566f29d822"],
  [["grill basket", "grilling", "grill accessories", "bbq", "barbecue grill", "portable grill", "gas one"], "photo-1553062407-98eeb64c6a62"],
  [["cutting board", "bamboo board"], "photo-1628006203055-b4aa5f6300f3"],
  [["fire starter", "fire color", "marshmallow", "smores", "fire pit"], "photo-1504280390367-361c6d9f38f4"],
  [["nuts gift", "snacks", "snack box", "popcorn", "tic tac"], "photo-1621939514649-280e2ee25f60"],
  [["biscotti", "cookies", "butter cookies", "cookie tin"], "photo-1499636136210-6f4ee915583e"],
  [["water", "fiji", "energy drink", "celsius"], "photo-1504280390367-361c6d9f38f4"],

  // === 男士护理 ===
  [["belt", "ratchet", "web belt"], "photo-1664286074176-5206ee5dc878"],
  [["deodorant", "comfort cream"], "photo-1601065732186-512e2ab8f856"],
  [["manicure", "nail clipper", "nail file", "grooming kit"], "photo-1690749138086-7422f71dc159"],
  [["beard", "mustache"], "photo-1577467014381-aa7c13dbf331"],
  [["back scratcher", "backpod", "posture", "back"], "photo-1504280390367-361c6d9f38f4"],
  [["perfume", "cologne", "fragrance", "eau de parfum"], "photo-1541643600914-78b084683601"],
  [["hand cream", "working hands", "lotion"], "photo-1601065732186-512e2ab8f856"],
  [["wipes", "flushable"], "photo-1504280390367-361c6d9f38f4"],

  // === 工具 / 户外 ===
  // 更具体的关键词放前面，避免被 magnetic / warmer 通用规则抢走
  [["hand warmer", "handwarmer", "heated glove"], "photo-1629760946220-5693ee4c46ac"],
  [["magnetic tool", "magnetic wristband", "magnetic pickup"], "photo-1504280390367-361c6d9f38f4"],
  [["magnetic", "wristband", "tool", "screwdriver"], "photo-1504280390367-361c6d9f38f4"],
  [["tire inflator", "air compressor", "air duster", "pump"], "photo-1504280390367-361c6d9f38f4"],
  [["boxing", "reflex ball", "punch"], "photo-1558877385-81a1c7e67d72"],
  [["sticker", "glow stick", "party favor", "bubble", "balloon"], "photo-1558877385-81a1c7e67d72"],
  [["smart plug", "bluetooth", "tracker", "tile mate"], "photo-1558002038-1055907df827"],
  [["digital frame", "picture frame", "photo frame"], "photo-1554907984-15263bfd63bd"],
  [["box cutter", "ceramic blade", "knife"], "photo-1504280390367-361c6d9f38f4"],
  [["stress ball", "fidget", "spinner", "squishy", "mochi"], "photo-1558877385-81a1c7e67d72"],
  [["3d pen", "3d print", "drawing pen", "lcd writing", "writing tablet", "drawing board"], "photo-1455390582262-044cdead277a"],
  [["lunch box", "lunch bag", "crock-pot electric lunch box", "electric lunch box"], "photo-1504280390367-361c6d9f38f4"],
  [["headlamp", "flashlight", "torch"], "photo-1504280390367-361c6d9f38f4"],
  [["first aid", "band-aid", "bandage"], "photo-1504280390367-361c6d9f38f4"],
  [["fan", "neck fan", "cooling"], "photo-1504280390367-361c6d9f38f4"],
  [["mosquito", "repellent", "bug"], "photo-1504280390367-361c6d9f38f4"],
  [["solar", "power bank", "charging"], "photo-1558002038-1055907df827"],
  [["water filter", "lifestraw"], "photo-1504280390367-361c6d9f38f4"],
  [["camping", "camp stove", "backpacking", "backpacking stove"], "photo-1504280390367-361c6d9f38f4"],
  [["cookware", "pot", "pan", "titanium", "spork", "kitchen utensil"], "photo-1504280390367-361c6d9f38f4"],
  [["ice pack", "cooler", "ice block"], "photo-1504280390367-361c6d9f38f4"],
  [["camping chair", "rocker", "booster", "portable seat"], "photo-1504280390367-361c6d9f38f4"],
  [["bullet blender", "blender", "frother", "milk frother"], "photo-1504280390367-361c6d9f38f4"],
  [["playing cards", "cards", "card game"], "photo-1629760946220-5693ee4c46ac"],
  [["car cleaning", "cleaning gel", "putty"], "photo-1504280390367-361c6d9f38f4"],
  [["toilet spray", "poo-pourri", "bathroom"], "photo-1504280390367-361c6d9f38f4"],
  [["magnet", "pyramid", "puzzle", "kanoodle"], "photo-1629760946220-5693ee4c46ac"],
  [["airplane", "launcher", "boomerang"], "photo-1558877385-81a1c7e67d72"],

  // === 蜡烛 / 香薰 / SPA ===
  [["candle warmer", "candle lamp", "warmer lamp"], "photo-1602848597941-0d3d3a2c1241"],
  [["candle", "scented", "aromatherapy", "spell chime"], "photo-1561212856-44e9bae482aa"],
  [["shower steamer", "aromatherapy", "shower bomb"], "photo-1561212856-44e9bae482aa"],
  [["spa", "bath bomb", "bath set", "lavender", "cherry blossom"], "photo-1556228720-195a672e8a03"],
  [["eye mask", "under eye", "eye patch"], "photo-1600998011831-1f4054095d2f"],
  [["body scrub", "scrub", "body care"], "photo-1601065732186-512e2ab8f856"],
  [["lip balm", "lip", "eos"], "photo-1601065732186-512e2ab8f856"],
  [["face mask", "jelly gel", "skincare", "clean towel", "facial towel", "burt's bee", "burts bee", "balance", "harmony"], "photo-1601065732186-512e2ab8f856"],

  // === 服饰 / 配件 ===
  [["slipper", "fuzzy", "memory foam"], "photo-1639401226901-362b0438d5b6"],
  [["blanket", "throw", "fuzzy"], "photo-1602891867080-1d56348202a3"],
  [["tumbler", "mug", "cup", "stanley", "owala", "travel cup"], "photo-1514228742587-6b1558fcca3d"],
  [["claw clip", "hair clip", "hair accessory"], "photo-1522335789203-aaa2f9c1df2a"],
  [["sock", "socks"], "photo-1615486364462-ef6363adbc18"],

  // === 珠宝 / 首饰 ===
  [["necklace", "pendant", "choker", "lariat", "cross necklace", "sterling silver", "cuban link", "silver chain", "gold chain", "chain men"], "photo-1601121141461-9d6647bca1ed"],
  [["earring", "hoop", "stud"], "photo-1601121141461-9d6647bca1ed"],
  [["bracelet", "beaded"], "photo-1601121141461-9d6647bca1ed"],
  [["ring tray", "jewelry dish", "jewelry tray", "trinket"], "photo-1601121141461-9d6647bca1ed"],

  // === 家居 / 装饰 ===
  [["olive oil", "oil sprayer", "oil bottle", "sprayer"], "photo-1474979266404-7eaacbcd87c5"],
  [["paper towel", "towel holder"], "photo-1504280390367-361c6d9f38f4"],
  [["wreath", "eucalyptus", "dried flower"], "photo-1485955900006-10f4d324d411"],
  [["fake plant", "artificial plant", "ivy", "hanging plant", "plant terrarium"], "photo-1485955900006-10f4d324d411"],
  [["vase", "carafe", "water carafe", "pitcher"], "photo-1485955900006-10f4d324d411"],
  [["wall art", "framed", "horse", "print"], "photo-1554907984-15263bfd63bd"],
  [["dinner plate", "plate", "dinnerware", "spice jar", "cake stand", "coaster", "ceramic"], "photo-1504280390367-361c6d9f38f4"],
  [["wood tray", "wood riser", "tray", "pedestal", "display stand", "tea box"], "photo-1504280390367-361c6d9f38f4"],
  [["drawer organizer", "drawer", "storage"], "photo-1504280390367-361c6d9f38f4"],
  [["broom", "dustpan", "cleaning"], "photo-1504280390367-361c6d9f38f4"],
  [["spray bottle", "mist bottle"], "photo-1504280390367-361c6d9f38f4"],
  [["tie dye", "dye kit"], "photo-1504280390367-361c6d9f38f4"],

  // === 玩具 / 儿童 ===
  [["lego", "botanical", "orchid", "bunny building", "creator"], "photo-1596461404969-9ae70f2830c1"],
  [["play-doh", "play doh", "kinetic sand", "clay", "modeling"], "photo-1558877385-81a1c7e67d72"],
  [["plushie", "plush", "stuffed animal", "soft toy"], "photo-1558877385-81a1c7e67d72"],
  [["board game", "candy land", "connect 4", "trouble"], "photo-1629760946220-5693ee4c46ac"],
  [["water table", "splash pond"], "photo-1558877385-81a1c7e67d72"],
  [["toy", "kid", "child", "dinosaur", "microscope", "flash card", "learning"], "photo-1596461404969-9ae70f2830c1"],
  [["building block", "magnet set", "magnet tile", "magnetic drawing"], "photo-1596461404969-9ae70f2830c1"],
  [["montessori", "wooden puzzle", "busy board", "wooden block"], "photo-1596461404969-9ae70f2830c1"],
  [["ring pop", "lollipop", "candy"], "photo-1621939514649-280e2ee25f60"],
  [["rice krispie", "treat", "candy", "snack bar"], "photo-1621939514649-280e2ee25f60"],

  // === 艺术 / 手工 ===
  [["rock painting", "art kit", "paint", "craft"], "photo-1554907984-15263bfd63bd"],
  [["toss and catch", "catch ball", "ball game", "ball"], "photo-1558877385-81a1c7e67d72"],

  // === 食品 / 饮品 ===
  [["coffee pod", "coffee pod", "k-cup", "crazy cup"], "photo-1495474472287-4d71bcdd2085"],
  [["coffee", "ground coffee", "starbucks", "cold brew", "espresso", "peru ground", "organic ground"], "photo-1447933601403-0c6688de566e"],
  [["tea", "lipton", "twinings", "taylors", "tiesta", "celestial", "bigelow", "tea forte", "herbal tea"], "photo-1610478506025-8110cc8f1986"],
  [["cold brew maker", "mason jar", "french press", "coffee maker", "toddy", "filter"], "photo-1495474472287-4d71bcdd2085"],

  // === 书 / 文具 ===
  [["book", "fill-in", "journal", "diary", "gratitude", "sketch", "scrapbook", "photo album", "notebook", "spiral", "bible"], "photo-1501618669935-18b6ecb13d6d"],
  [["bookmark", "leather heart"], "photo-1512820790803-83ca734da794"],
  [["pen", "ballpoint", "gel pen"], "photo-1455390582262-044cdead277a"],
  [["sticky note", "post-it", "note"], "photo-1501618669935-18b6ecb13d6d"],

  // === 兜底 ===
  [["gift basket", "gift set", "gift box", "burt's bee"], "photo-1549465220-1a8b9238cd48"],
  [["gift"], "photo-1549465220-1a8b9238cd48"],
];

function pickImage(name) {
  const s = name.toLowerCase();
  for (const [keywords, photoId] of RULES) {
    if (keywords.some((k) => s.includes(k))) {
      return `https://images.unsplash.com/${photoId}${P}`;
    }
  }
  return `https://images.unsplash.com/photo-1549465220-1a8b9238cd48${P}`;
}

async function main() {
  console.log("📄 拉取全部 280 条商品...");
  const all = [];
  let offset = 0;
  while (true) {
    const r = await fetch(`${REST}?select=id,name,image_url&limit=1000&offset=${offset}&order=id.asc`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
    });
    const rows = await r.json();
    if (!Array.isArray(rows) || rows.length === 0) break;
    all.push(...rows);
    if (rows.length < 1000) break;
    offset += 1000;
  }
  console.log(`   ${all.length} 条商品`);

  // 给每条商品算新图，跳过 URL 没变的
  const toUpdate = [];
  let unchanged = 0;
  for (const p of all) {
    const newUrl = pickImage(p.name);
    if (newUrl === p.image_url) {
      unchanged++;
    } else {
      toUpdate.push({ id: p.id, url: newUrl });
    }
  }
  console.log(`\n🎯 需要更新: ${toUpdate.length} 条, 已是最新: ${unchanged} 条`);

  // 批量 PATCH，按 id 单条更新
  let done = 0;
  for (const item of toUpdate) {
    const r = await fetch(`${REST}?id=eq.${item.id}`, {
      method: "PATCH",
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ image_url: item.url }),
    });
    if (!r.ok) {
      console.log(`❌ id=${item.id} 失败: ${r.status}`);
    }
    done++;
    if (done % 30 === 0) process.stdout.write(`\r   已更新 ${done}/${toUpdate.length}`);
  }
  console.log(`\n   完成 ${done} 条`);

  // 验证：抽 5 条看
  console.log("\n🔎 抽样验证前 5 条:");
  const r2 = await fetch(`${REST}?select=id,name,image_url&limit=5&order=id.asc`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  const sample = await r2.json();
  for (const p of sample) {
    console.log(`   id=${p.id} | ${p.name}`);
    console.log(`     url=${p.image_url.slice(0, 90)}`);
  }
}

main().catch((e) => {
  console.error("失败:", e);
  process.exit(1);
});
