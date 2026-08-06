// 图片分类映射 —— 独立模块，确保在 Edge Runtime 中正常工作
const U = "https://images.unsplash.com/";
const P = "?w=800&h=600&fit=crop&q=80";
const uImg = (id: string) => `${U}${id}${P}`;

export const IMG = {
  automotive: uImg("photo-1486262715619-67b85e0b08d3"),
  baby:       uImg("photo-1522771930-78848d9293e8"),
  beer:       uImg("photo-1608270586620-248524c67de9"),
  clothing:   uImg("photo-1521572163474-6864f9cf17ab"),
  coffee:     uImg("photo-1495474472287-4d71bcdd2085"),
  default:    uImg("photo-1514228742587-6b1558fcca3d"),
  electronics:uImg("photo-1498049794561-7780e7231661"),
  games:      uImg("photo-1511512578047-dfb367046420"),
  health:     uImg("photo-1550572017-edd951b55104"),
  home:       uImg("photo-1556909114-f6e7ad7d3136"),
  jewelry:    uImg("photo-1515562141207-7a88fb7ce338"),
  kitchen:    uImg("photo-1556909172-54557c7e4fb7"),
  office:     uImg("photo-1456735190827-d1262f71b8a3"),
  outdoor:    uImg("photo-1504280390367-361c6d9f38f4"),
  personal:   uImg("photo-1596462502278-27bfdc403348"),
  reading:    uImg("photo-1512820790803-83ca734da794"),
  sports:     uImg("photo-1461896836934-ffe607ba8211"),
  toys:       uImg("photo-1558060370-d644479cb6f7"),
  wellness:   uImg("photo-1544367567-0f2fcb009e0b"),
};

// 词边界匹配：避免 "car" 匹配到 "carver" / "card" / "carpet" 等
const _WB = (kw: string) => new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
const has = (s: string, kw: string) => _WB(kw).test(s);

export function fixImageUrl(name: string, url: string): string {
  const s = (name + " " + (url ? decodeURIComponent(url) : "")).toLowerCase();

  // ---- 0. 办公 / 文具 / 书写工具 ----
  if (
    has(s, "pen") || has(s, "pencil") || has(s, "marker") ||
    has(s, "stationery") || has(s, "desk") || has(s, "notebook") ||
    has(s, "journal") || has(s, "planner") || has(s, "sticky note") ||
    has(s, "post-it") || has(s, "binder") ||
    has(s, "clip") || has(s, "tape") && !has(s, "duct") && !has(s, "masking") && !has(s, "electric") ||
    has(s, "envelope") || has(s, "letter") || has(s, "scissors") ||
    has(s, "gel pen") || has(s, "ballpoint") ||
    has(s, "highlighter") || has(s, "sharpie") ||
    has(s, "spiral notebook") ||
    has(s, "writing practice") ||
    has(s, "scrapbook") || has(s, "photo album") ||
    has(s, "bookmark") || has(s, "flash card")
  )
    return IMG.office;

  // ---- 1. 阅读 / 书籍 / 学习 ----
  if (
    has(s, "book") || has(s, "cookbook") || has(s, "novel") ||
    has(s, "reading") || has(s, "literature") || has(s, "bible")
  )
    return IMG.reading;

  // ---- 2. 汽车 / 工具 / 硬件 ----
  if (
    has(s, "car") || has(s, "auto") || has(s, "vehicle") ||
    has(s, "tire") || has(s, "tyre") || has(s, "wheel") ||
    has(s, "inflator") ||
    has(s, "automotive") || has(s, "mechanic") ||
    has(s, "garage") || has(s, "motorcycle") ||
    has(s, "tool") || has(s, "drill") || has(s, "hammer") ||
    has(s, "wrench") || has(s, "screwdriver") || has(s, "socket") ||
    has(s, "brake") || has(s, "oil filter") || has(s, "air filter") ||
    has(s, "spark plug") || has(s, "wiper") || has(s, "headlight") ||
    has(s, "additive") || has(s, "fluid") ||
    has(s, "box cutter") || has(s, "utility knife") ||
    has(s, "air duster") ||
    has(s, "magnetic wristband") || has(s, "wristband tool") ||
    has(s, "hand warmer")
  )
    return IMG.automotive;

  // ---- 3. 电子 / 数码 / 家电 ----
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
    has(s, "magnet") || has(s, "magnetic") ||
    has(s, "lcd writing tablet") ||
    has(s, "calculator") || has(s, "timer") ||
    has(s, "clock") || has(s, "alarm")
  )
    return IMG.electronics;

  // ---- 4. 厨房 / 食品 / 饮品 ----
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
    has(s, "biscotti") || has(s, "cracker") ||
    has(s, "roast") || has(s, "ground") ||
    has(s, "brew") || has(s, "brewing") ||
    has(s, "pastry") || has(s, "bakery") ||
    has(s, "cake") || has(s, "baking") ||
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
    return IMG.kitchen;

  // ---- 5. 户外 / 运动 / 露营 ----
  if (
    has(s, "outdoor") || has(s, "camping") || has(s, "hiking") ||
    has(s, "tent") || has(s, "torch") ||
    has(s, "hammock") || has(s, "beach") ||
    has(s, "fishing") || has(s, "boat") ||
    has(s, "golf") || has(s, "yoga") || has(s, "gym") ||
    has(s, "exercise") || has(s, "fitness") || has(s, "workout") ||
    has(s, "supplement") || has(s, "protein") ||
    has(s, "backpack") ||
    has(s, "boomerang") ||
    has(s, "punch balloon") ||
    has(s, "sunscreen") ||
    has(s, "water filter")
  )
    return IMG.outdoor;

  // ---- 6. 婴儿 / 儿童 ----
  if (
    has(s, "baby") || has(s, "newborn") ||
    has(s, "stroller") || has(s, "car seat") ||
    has(s, "diaper") || has(s, "pacifier") ||
    has(s, "high chair") || has(s, "crib") ||
    has(s, "onesie") || has(s, "bib")
  )
    return IMG.baby;

  // ---- 7. 玩具 / 游戏 ----
  if (
    has(s, "toy") || has(s, "game") || has(s, "puzzle") && !has(s, "jigsaw") ||
    has(s, "chess") || has(s, "card game") ||
    has(s, "doll") || has(s, "plush") ||
    has(s, "lego") || has(s, "building block") ||
    has(s, "coloring") || has(s, "crayon") ||
    has(s, "paint") && !has(s, "rock") ||
    has(s, "slime") || has(s, "putty") ||
    has(s, "play-doh") || has(s, "play doh") ||
    has(s, "fidget") || has(s, "spinner") || has(s, "squishy") ||
    has(s, "plushie") || has(s, "stuffed") ||
    has(s, "rain show") || has(s, "splash pond") ||
    has(s, "glow stick") || has(s, "balloon") ||
    has(s, "bubble wand") ||
    has(s, "airplane launcher") ||
    has(s, "tie dye") ||
    has(s, "playing card") ||
    has(s, "magnet tile") ||
    has(s, "dinosaur") ||
    has(s, "party favor")
  )
    return IMG.toys;

  // ---- 8. 护肤 / 个人护理 ----
  if (
    has(s, "skincare") || has(s, "moisturizer") || has(s, "serum") ||
    has(s, "cleanser") || has(s, "toner") ||
    has(s, "lotion") || has(s, "cream") ||
    has(s, "exfoliant") || has(s, "mask") ||
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
    return IMG.personal;

  // ---- 9. 医疗 / 健康 ----
  if (
    has(s, "first aid") || has(s, "band-aid") || has(s, "bandage") ||
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
    return IMG.health;

  // ---- 10. 珠宝 / 饰品 ----
  if (
    has(s, "jewel") || has(s, "jewelry") || has(s, "jewellery") ||
    has(s, "necklace") || has(s, "bracelet") ||
    has(s, "ring") && !has(s, "curtain") && !has(s, "doughnut") && !has(s, "onion") && !has(s, "pineapple") ||
    has(s, "earring") || has(s, "anklet") ||
    has(s, "pendant") || has(s, "medallion") ||
    has(s, "diamond") || has(s, "gold") && !has(s, "pen") && !has(s, "marker") ||
    has(s, "silver") || has(s, "platinum") ||
    has(s, "gem") || has(s, "pearl") ||
    has(s, "watch") && !has(s, "smart") ||
    has(s, "body chain")
  )
    return IMG.jewelry;

  // ---- 11. 家居 / 装饰 / DIY ----
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
    return IMG.home;

  // ---- 12. 服装 / 鞋子 / 配饰 ----
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
    return IMG.clothing;

  // ---- 13. 啤酒 / 酒精饮料 ----
  if (
    has(s, "beer") || has(s, "ale") || has(s, "lager") ||
    has(s, "whiskey") || has(s, "whisky") ||
    has(s, "vodka") || has(s, "tequila") ||
    has(s, "wine") || has(s, "champagne") ||
    has(s, "sake")
  )
    return IMG.beer;

  // ---- 14. 健康 / 健身 / 瑜伽 ----
  if (
    has(s, "wellness") || has(s, "meditation") ||
    has(s, "cortisol") || has(s, "magnesium") ||
    has(s, "vitamin") ||
    has(s, "protein") && has(s, "powder") ||
    has(s, "resveratrol") ||
    has(s, "adaptogen") || has(s, "l-theanine") ||
    has(s, "ashwagandha") ||
    has(s, "nootropic") || has(s, "smart drug")
  )
    return IMG.wellness;

  // ---- 兜底：永远返回默认图，不再透传错误的 URL ----
  return IMG.default;
}
