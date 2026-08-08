// Sample data — replace with a real data source later.
import type { Product } from "./supabase";
import { fixImageUrl } from "./images";

// 亚马逊联盟 ID 占位符 —— 拿到真实 ID 后改这一处即可
export const AFFILIATE_TAG = "gifthive08-20";

// ---------- Unsplash image helper ----------
const U = "https://images.unsplash.com/";
const P = "?w=800&h=600&fit=crop&q=80";
const uImg = (id: string) => `${U}${id}${P}`;

// Category → Unsplash photo mapping
const IMG = {
  coffee:    uImg("photo-1495474472287-4d71bcdd2085"),
  keyboard:  uImg("photo-1618384887929-16ec33fab9ef"),
  vinyl:     uImg("photo-1602848597941-0d3d3a2c1241"),
  beer:      uImg("photo-1608270586620-248524c67de9"),
  plant:     uImg("photo-1485955900006-10f4d324d411"),
  wallet:    uImg("photo-1627123424574-724758594e93"),
  candle:    uImg("photo-1561212856-44e9bae482aa"),
  mug:       uImg("photo-1514228742587-6b1558fcca3d"),
  tote:      uImg("photo-1574365569389-a10d488ca3fb"),
  jewelry:   uImg("photo-1515562141207-7a88fb7ce338"),
  toys:      uImg("photo-1558060370-d644479cb6f7"),
  books:     uImg("photo-1512820790803-83ca734da794"),
  notebook:  uImg("photo-1456735190827-d1262f71b8a3"),
  tea:       uImg("photo-1610478506025-8110cc8f1986"),
  food:      uImg("photo-1497700003451-e1df943a194b"),
  game:      uImg("photo-1511512578047-dfb367046420"),
  art:       uImg("photo-1554907984-15263bfd63bd"),
  clothing:  uImg("photo-1521572163474-6864f9cf17ab"),
  skincare:  uImg("photo-1596462502278-27bfdc403348"),
  chocolate: uImg("photo-1623660053975-cf75a8be0908"),
  gift:      uImg("photo-1549465220-1a8b9238cd48"),
  honey:     uImg("photo-1587049352851-8d4e89133924"),
  oil:       uImg("photo-1474979266404-7eaacbcd87c5"),
  socks:     uImg("photo-1615486364462-ef6363adbc18"),
  garden:    uImg("photo-1416879595882-3373a0480b5b"),
  automotive: uImg("photo-1486262715619-67b85e0b08d3"),
  electronics: uImg("photo-1498049794561-7780e7231661"),
  kitchen:    uImg("photo-1556909172-54557c7e4fb7"),
  power:      uImg("photo-1509391366360-2e959784a276"),
  appliance:  uImg("photo-1556909114-f6e7ad7d3136"),
  outdoor:    uImg("photo-1504280390367-361c6d9f38f4"),
  pet:        uImg("photo-1583337130417-3346a1be7dee"),
  sports:     uImg("photo-1461896836934-ffe607ba8211"),
  health:     uImg("photo-1550572017-edd951b55104"),
  home:       uImg("photo-1556909114-f6e7ad7d3136"),
  office:     uImg("photo-1456735190827-d1262f71b8a3"),
  personal:   uImg("photo-1596462502278-27bfdc403348"),
  wellness:   uImg("photo-1544367567-0f2fcb009e0b"),
  baby:       uImg("photo-1522771930-78848d9293e8"),
  reading:    uImg("photo-1512820790803-83ca734da794"),
  default:    uImg("photo-1514228742587-6b1558fcca3d"),
};

// fixImageUrl 已移至 lib/images.ts，通过 import 引入

export type Recipient = {
  slug: string;
  label: string;
  heading: string;
  description: string;
  image: string;
};

export type Gift = {
  id: string;
  name: string;
  tagline: string;
  price: number;
  currency: string;
  image: string;
  category: string;
  tags: string[];
  match: number; // 0-100
  reason: string;
  shop: string;
  // 可选：直接指定亚马逊商品链接（精确商品）；不填则按 name 跳亚马逊搜索
  amazonUrl?: string;
};

/**
 * 生成亚马逊联盟链接：
 * - 若 gift.amazonUrl 已指定 → 用它，并强制把 tag 替换成我们的真实联盟 ID
 *   （数据库里的 affiliate_url 可能自带占位 tag，如 GIFTHIVE-20，必须覆盖）
 * - 否则 → fallback 到按商品名的搜索结果页 + tag
 */
export function getAmazonUrl(gift: Gift): string {
  if (gift.amazonUrl) {
    // 强制使用我们的真实联盟 tag：已带 tag 的替换，没带的补上
    const withOurTag = /[?&]tag=/i.test(gift.amazonUrl)
      ? gift.amazonUrl.replace(/([?&])tag=[^&]*/i, `$1tag=${AFFILIATE_TAG}`)
      : `${gift.amazonUrl}${gift.amazonUrl.includes("?") ? "&" : "?"}tag=${AFFILIATE_TAG}`;
    return withOurTag;
  }
  return `https://www.amazon.com/s?k=${encodeURIComponent(gift.name)}&tag=${AFFILIATE_TAG}`;
}

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  image: string;
  /** Markdown-friendly 正文，按段落分（每段一个字符串） */
  body: string[];
  /** 文末嵌入的商品（联盟外链），可空 */
  relatedGifts?: Gift[];
};

export type QuizOption = {
  value: string;
  label: string;
  description?: string;
};

export type QuizQuestion = {
  id: number;
  key: string;
  title: string;
  subtitle: string;
  options: QuizOption[];
};

// ---------- Recipients ----------
export const recipients: Recipient[] = [
  {
    slug: "for-him",
    label: "For Him",
    heading: "For Him",
    description:
      "For fathers, partners, brothers — the ones who'd never ask. Things he'll actually use, not the polite catalog stuff.",
    image: IMG.wallet,
  },
  {
    slug: "for-her",
    label: "For Her",
    heading: "For Her",
    description:
      "From a small piece of jewelry to a quiet bouquet. Gifts that won't gather dust.",
    image: IMG.jewelry,
  },
  {
    slug: "for-kids",
    label: "For Kids",
    heading: "For Kids",
    description: "What makes them squeal — and what their parents nod at.",
    image: IMG.toys,
  },
  {
    slug: "for-parents",
    label: "For Parents",
    heading: "For Parents",
    description: "They'll say 'don't bother' — and quietly hope you do anyway.",
    image: IMG.tea,
  },
  {
    slug: "for-friends",
    label: "For Friends",
    heading: "For Friends",
    description: "For the person you think of, without needing a reason.",
    image: IMG.mug,
  },
  {
    slug: "for-coworkers",
    label: "For Coworkers",
    heading: "For Coworkers",
    description: "Thoughtful, never awkward — a small way to say 'thanks'.",
    image: IMG.plant,
  },
];

// ---------- Editor's picks (homepage) ----------
export const editorsPicks: Gift[] = [
  {
    id: "ep-01",
    name: "Pour-Over Coffee Set",
    tagline: "Slow mornings, one cup at a time.",
    price: 42,
    currency: "$",
    image: IMG.coffee,
    category: "Home",
    tags: ["Coffee", "Morning Ritual", "Home"],
    match: 94,
    reason:
      "He said he wanted to quit takeout coffee. This lets him make a proper cup at home.",
    shop: "Blue Bottle",
  },
  {
    id: "ep-02",
    name: "Wool-Blend Wrap",
    tagline: "The thing you throw on and forget you're wearing.",
    price: 68,
    currency: "$",
    image: IMG.clothing,
    category: "Wear",
    tags: ["Cozy", "Layering", "Wear"],
    match: 88,
    reason:
      "The office AC is always too cold. Something to wrap up in says it without words.",
    shop: "MUJI",
  },
  {
    id: "ep-03",
    name: "Cedar & Smoke Candle",
    tagline: "Bring a whole forest evening home.",
    price: 32,
    currency: "$",
    image: IMG.candle,
    category: "Home",
    tags: ["Scent", "Unwind", "Home"],
    match: 91,
    reason:
      "For the one who works late — the smell of cedar is a kind of safety.",
    shop: "Boy Smells",
  },
  {
    id: "ep-04",
    name: "Leather Card Wallet",
    tagline: "A small piece of grown-up, in your pocket.",
    price: 52,
    currency: "$",
    image: IMG.wallet,
    category: "Wear",
    tags: ["Leather", "Everyday", "Wear"],
    match: 86,
    reason:
      "He's still carrying that bulky wallet. Time for something lighter.",
    shop: "Bellroy",
  },
];

// ---------- Finder results (5 picks) ----------
export const recommendedGifts: Gift[] = [
  {
    id: "rg-01",
    name: "75% Mechanical Keyboard",
    tagline: "Every word he types gets a little smoother.",
    price: 139,
    currency: "$",
    image: IMG.keyboard,
    category: "Tech",
    tags: ["Tech", "Productivity", "Desk"],
    match: 96,
    reason:
      "He's on a keyboard six hours a day. A good one will remind him of you every time he types.",
    shop: "Keychron",
  },
  {
    id: "rg-02",
    name: "Entry-Level Turntable",
    tagline: "Give 'loves music' a shape.",
    price: 199,
    currency: "$",
    image: IMG.vinyl,
    category: "Audio",
    tags: ["Music", "Analog", "Home"],
    match: 92,
    reason:
      "He collects playlists seriously. Give the music a place to live out loud.",
    shop: "Audio-Technica",
  },
  {
    id: "rg-03",
    name: "Craft Beer Starter Box",
    tagline: "Six bottles, six new ways to do the weekend.",
    price: 54,
    currency: "$",
    image: IMG.beer,
    category: "Drink",
    tags: ["Beer", "Weekend", "Try"],
    match: 89,
    reason:
      "He kept saying he'd try craft beer and never did. You do it for him.",
    shop: "Boxed Cat",
  },
  {
    id: "rg-04",
    name: "Wool Knit Cardigan",
    tagline: "The thing he grabs on the way out, all winter.",
    price: 98,
    currency: "$",
    image: IMG.clothing,
    category: "Wear",
    tags: ["Cozy", "Winter", "Wear"],
    match: 84,
    reason:
      "He's not picky about clothes, but a soft cardigan he'll actually wear.",
    shop: "Uniqlo U",
  },
  {
    id: "rg-05",
    name: "Desk Plant in Ceramic Pot",
    tagline: "A small piece of living green, where he works.",
    price: 28,
    currency: "$",
    image: IMG.plant,
    category: "Home",
    tags: ["Plant", "Desk", "Home"],
    match: 81,
    reason:
      "Studies say a living thing on the desk lowers stress, a little. Worth it for a little.",
    shop: "The Sill",
  },
];

// ---------- For Him category ----------
export const forHimGifts: Gift[] = [
  {
    id: "fh-01",
    name: "75% Mechanical Keyboard",
    tagline: "Every word he types gets a little smoother.",
    price: 139,
    currency: "$",
    image: IMG.keyboard,
    category: "Tech",
    tags: ["Tech", "Productivity", "Desk"],
    match: 96,
    reason:
      "He's on a keyboard six hours a day. A good one will remind him of you.",
    shop: "Keychron",
  },
  {
    id: "fh-02",
    name: "Entry-Level Turntable",
    tagline: "Give 'loves music' a shape.",
    price: 199,
    currency: "$",
    image: IMG.vinyl,
    category: "Audio",
    tags: ["Music", "Analog", "Home"],
    match: 92,
    reason: "He collects playlists seriously. Give the music a place to live.",
    shop: "Audio-Technica",
  },
  {
    id: "fh-03",
    name: "Pour-Over Coffee Set",
    tagline: "Slow mornings, one cup at a time.",
    price: 42,
    currency: "$",
    image: IMG.coffee,
    category: "Home",
    tags: ["Coffee", "Morning Ritual", "Home"],
    match: 94,
    reason: "He wanted to quit takeout coffee. This makes a proper cup at home.",
    shop: "Blue Bottle",
  },
  {
    id: "fh-04",
    name: "Cedar & Smoke Candle",
    tagline: "Bring a whole forest evening home.",
    price: 32,
    currency: "$",
    image: IMG.candle,
    category: "Home",
    tags: ["Scent", "Unwind", "Home"],
    match: 91,
    reason: "For the one who works late — the smell of cedar is a kind of safety.",
    shop: "Boy Smells",
  },
  {
    id: "fh-05",
    name: "Insulated Travel Mug, 16oz",
    tagline: "Keeps coffee hot from nine to three.",
    price: 38,
    currency: "$",
    image: IMG.mug,
    category: "Daily",
    tags: ["Commute", "Everyday", "Home"],
    match: 90,
    reason: "He forgets to drink water — let the mug remind him instead of you.",
    shop: "Kinto",
  },
  {
    id: "fh-06",
    name: "Canvas Tote",
    tagline: "To the gym, the market, the park.",
    price: 34,
    currency: "$",
    image: IMG.tote,
    category: "Wear",
    tags: ["Everyday", "Carry", "Wear"],
    match: 83,
    reason: "He needs a bag that doesn't try too hard. Canvas is the answer.",
    shop: "Topologie",
  },
  {
    id: "fh-07",
    name: "Leather Card Wallet",
    tagline: "A small piece of grown-up, in your pocket.",
    price: 52,
    currency: "$",
    image: IMG.wallet,
    category: "Wear",
    tags: ["Leather", "Everyday", "Wear"],
    match: 86,
    reason: "He's still carrying that bulky wallet. Time for something lighter.",
    shop: "Bellroy",
  },
  {
    id: "fh-08",
    name: "Massage Gun",
    tagline: "The ten minutes after a workout, he'll thank you.",
    price: 89,
    currency: "$",
    image: IMG.default,
    category: "Sports",
    tags: ["Recovery", "Health", "Gear"],
    match: 87,
    reason: "He runs or lifts every week. This is the upgrade he won't buy himself.",
    shop: "Hyperice",
  },
];

// ---------- For Her category ----------
const herImg = (p: string): string => {
  const s = p.toLowerCase();
  if (s.includes("necklace") || s.includes("jewelry")) return IMG.jewelry;
  if (s.includes("pillow") || s.includes("silk")) return IMG.default;
  if (s.includes("candle")) return IMG.candle;
  if (s.includes("journal") || s.includes("book")) return IMG.notebook;
  if (s.includes("robe") || s.includes("linen")) return IMG.clothing;
  if (s.includes("cream") || s.includes("hand")) return IMG.skincare;
  return IMG.default;
};

export const forHerGifts: Gift[] = [
  {
    id: "fher-01",
    name: "Gold Initial Necklace",
    tagline: "Her initial, close to her collarbone.",
    price: 78,
    currency: "$",
    image: herImg(
      "a delicate gold initial necklace on a cream linen background, soft editorial product photography, warm light"
    ),
    category: "Jewelry",
    tags: ["Jewelry", "Everyday", "Wear"],
    match: 95,
    reason:
      "Personal without being loud — she'll wear it every day and think of you.",
    shop: "Mejuri",
  },
  {
    id: "fher-02",
    name: "Silk Pillowcase",
    tagline: "The small luxury she won't buy herself.",
    price: 45,
    currency: "$",
    image: herImg(
      "a folded silk pillowcase in soft blush pink on cream linen, editorial product photography, soft shadows"
    ),
    category: "Home",
    tags: ["Self-care", "Bedroom", "Home"],
    match: 90,
    reason: "Better hair, better skin, a tiny upgrade that feels indulgent.",
    shop: "Slip",
  },
  {
    id: "fher-03",
    name: "Hand-Poured Soy Candle",
    tagline: "Fig and cedar — warm, never sweet.",
    price: 32,
    currency: "$",
    image: herImg(
      "a hand-poured soy candle in an amber glass jar on a stone surface, warm editorial product photography"
    ),
    category: "Home",
    tags: ["Scent", "Unwind", "Home"],
    match: 88,
    reason: "She lights one every evening. A good one earns its place.",
    shop: "Boy Smells",
  },
  {
    id: "fher-04",
    name: "Linen Robe",
    tagline: "Slow Sunday mornings, sorted.",
    price: 96,
    currency: "$",
    image: herImg(
      "a folded linen robe in oatmeal color on cream linen, soft editorial product photography"
    ),
    category: "Wear",
    tags: ["Cozy", "Lounge", "Wear"],
    match: 86,
    reason: "Not the fluffy kind — the grown-up kind she'll actually reach for.",
    shop: "Tekla",
  },
  {
    id: "fher-05",
    name: "Botanical Hand Cream Set",
    tagline: "Three scents for three moods.",
    price: 38,
    currency: "$",
    image: herImg(
      "a set of three botanical hand cream tubes arranged on a cream surface, editorial product photography, soft light"
    ),
    category: "Self-care",
    tags: ["Skincare", "Everyday", "Self-care"],
    match: 84,
    reason: "Her hands are always dry. A small thing she uses constantly.",
    shop: "Aesop",
  },
  {
    id: "fher-06",
    name: "Hardcover Journal",
    tagline: "For the lists she keeps making.",
    price: 28,
    currency: "$",
    image: herImg(
      "a hardcover linen-bound journal in sage green on a cream desk with a fountain pen, editorial product photography"
    ),
    category: "Stationery",
    tags: ["Writing", "Everyday", "Stationery"],
    match: 81,
    reason: "She's mentioned wanting to write more. Give her the place to do it.",
    shop: "Appointed",
  },
];

// ---------- For Kids category ----------
const kidsImg = (p: string): string => {
  const s = p.toLowerCase();
  if (s.includes("book")) return IMG.books;
  return IMG.toys;
};

export const forKidsGifts: Gift[] = [
  {
    id: "fk-01",
    name: "Wooden Building Blocks, 100pc",
    tagline: "The toy that outlasts every other toy.",
    price: 52,
    currency: "$",
    image: kidsImg(
      "a set of colorful wooden building blocks scattered on a soft rug, warm natural light, editorial product photography"
    ),
    category: "Toys",
    tags: ["Open-play", "Wooden", "Toys"],
    match: 94,
    reason:
      "No batteries, no sound — and the one they keep coming back to for years.",
    shop: "Grimm's",
  },
  {
    id: "fk-02",
    name: "Picture Book Bundle",
    tagline: "Five stories, read aloud a hundred times.",
    price: 42,
    currency: "$",
    image: kidsImg(
      "a stack of five colorful children's picture books on a wooden floor, warm editorial photography"
    ),
    category: "Books",
    tags: ["Reading", "Bedtime", "Books"],
    match: 91,
    reason: "Reading together is the gift — the books are the excuse.",
    shop: "Bookshop.org",
  },
  {
    id: "fk-03",
    name: "Beginner Balance Bike",
    tagline: "Two wheels, no pedals, lots of confidence.",
    price: 89,
    currency: "$",
    image: kidsImg(
      "a small wooden balance bike on a park path in warm afternoon light, editorial product photography"
    ),
    category: "Outdoor",
    tags: ["Active", "Outdoor", "Gear"],
    match: 87,
    reason: "The bridge from wobble to pedals. They'll remember who gave it.",
    shop: "Banwood",
  },
  {
    id: "fk-04",
    name: "Washable Marker Set",
    tagline: "Walls safe. Creativity not.",
    price: 24,
    currency: "$",
    image: kidsImg(
      "a set of washable markers in bright colors arranged on a craft table, editorial product photography, soft light"
    ),
    category: "Crafts",
    tags: ["Creative", "Indoor", "Crafts"],
    match: 83,
    reason: "They draw every day. Parents will silently thank you for washable.",
    shop: "Crayola",
  },
  {
    id: "fk-05",
    name: "Plush Comfort Bunny",
    tagline: "The one that becomes theirs.",
    price: 32,
    currency: "$",
    image: kidsImg(
      "a soft plush bunny in cream color on a child's bed with a knit blanket, warm editorial photography"
    ),
    category: "Soft",
    tags: ["Comfort", "Bedtime", "Soft"],
    match: 80,
    reason: "Every kid picks one comfort object. This can be it.",
    shop: "Jellycat",
  },
  {
    id: "fk-06",
    name: "Beginner Microscope",
    tagline: "A leaf, a hair, a crumb — suddenly interesting.",
    price: 48,
    currency: "$",
    image: kidsImg(
      "a child's beginner microscope on a wooden desk with slides, warm editorial product photography"
    ),
    category: "STEM",
    tags: ["Curious", "STEM", "Learning"],
    match: 78,
    reason: "Curiosity is the gift. This points it at the world.",
    shop: "GeoSafari",
  },
];

// ---------- For Parents category ----------
const parentsImg = (p: string): string => {
  const s = p.toLowerCase();
  if (s.includes("tea")) return IMG.tea;
  if (s.includes("cookbook") || s.includes("cooking")) return IMG.food;
  if (s.includes("slipper")) return IMG.clothing;
  if (s.includes("herb") || s.includes("garden")) return IMG.plant;
  if (s.includes("photo frame") || s.includes("blanket")) return IMG.default;
  return IMG.default;
};

export const forParentsGifts: Gift[] = [
  {
    id: "fp-01",
    name: "Premium Tea Sampler",
    tagline: "Twelve quiet mornings, in a box.",
    price: 46,
    currency: "$",
    image: parentsImg(
      "a wooden tea box with assorted loose leaf tea tins on a linen tablecloth, warm editorial product photography"
    ),
    category: "Home",
    tags: ["Tea", "Morning", "Home"],
    match: 93,
    reason: "They have one slow morning a week. Make it taste like something.",
    shop: "Smith Teamaker",
  },
  {
    id: "fp-02",
    name: "Digital Photo Frame, 10in",
    tagline: "All the photos you keep meaning to send.",
    price: 129,
    currency: "$",
    image: parentsImg(
      "a modern digital photo frame on a side table showing family photos, warm editorial product photography"
    ),
    category: "Tech",
    tags: ["Family", "Memories", "Tech"],
    match: 90,
    reason: "Email photos in, they show up on the mantel. No app required.",
    shop: "Aura",
  },
  {
    id: "fp-03",
    name: "Weighted Blanket",
    tagline: "A heavier kind of comfort.",
    price: 89,
    currency: "$",
    image: parentsImg(
      "a folded weighted blanket in soft grey on a made bed, warm editorial product photography"
    ),
    category: "Home",
    tags: ["Comfort", "Sleep", "Home"],
    match: 85,
    reason: "They won't admit they sleep poorly. This helps, quietly.",
    shop: "Bearaby",
  },
  {
    id: "fp-04",
    name: "Cookbook: Weeknight Table",
    tagline: "Recipes they'll actually cook.",
    price: 35,
    currency: "$",
    image: parentsImg(
      "a hardcover cookbook on a kitchen counter with fresh vegetables, warm editorial product photography"
    ),
    category: "Books",
    tags: ["Cooking", "Kitchen", "Books"],
    match: 82,
    reason: "They cook every night. A new book breaks the rotation.",
    shop: "Phaidon",
  },
  {
    id: "fp-05",
    name: "Matching House Slippers",
    tagline: "His and hers, but tasteful.",
    price: 68,
    currency: "$",
    image: parentsImg(
      "a pair of matching wool house slippers on a wooden floor, warm editorial product photography, soft light"
    ),
    category: "Wear",
    tags: ["Cozy", "Home", "Wear"],
    match: 79,
    reason: "They'll say it's silly. Then they'll never take them off.",
    shop: "Giesswein",
  },
  {
    id: "fp-06",
    name: "Indoor Herb Garden Kit",
    tagline: "Basil on the windowsill, all winter.",
    price: 54,
    currency: "$",
    image: parentsImg(
      "an indoor herb garden kit with small pots of basil and mint on a sunny windowsill, editorial product photography"
    ),
    category: "Home",
    tags: ["Garden", "Kitchen", "Home"],
    match: 76,
    reason: "Fresh herbs in January. A small ongoing gift.",
    shop: "Click & Grow",
  },
];

// ---------- For Friends category ----------
const friendsImg = (p: string): string => {
  const s = p.toLowerCase();
  if (s.includes("coffee")) return IMG.coffee;
  if (s.includes("vinyl") || s.includes("record")) return IMG.vinyl;
  if (s.includes("board game") || s.includes("game")) return IMG.game;
  if (s.includes("hot sauce") || s.includes("sauce")) return IMG.food;
  if (s.includes("art") || s.includes("print")) return IMG.art;
  if (s.includes("mug") || s.includes("camp")) return IMG.mug;
  return IMG.default;
};

export const forFriendsGifts: Gift[] = [
  {
    id: "ff-01",
    name: "Specialty Coffee Beans, 3 Bag",
    tagline: "Three origins, three new opinions.",
    price: 42,
    currency: "$",
    image: friendsImg(
      "three bags of specialty coffee beans on a wooden table, warm editorial product photography, soft light"
    ),
    category: "Drink",
    tags: ["Coffee", "Try", "Drink"],
    match: 90,
    reason: "They take coffee seriously. Three new bags to argue about.",
    shop: "Onyx",
  },
  {
    id: "ff-02",
    name: "Vinyl Record, Curated",
    tagline: "An album you think they'd love.",
    price: 28,
    currency: "$",
    image: friendsImg(
      "a vinyl record in its sleeve on a wooden table next to a turntable, warm editorial product photography"
    ),
    category: "Music",
    tags: ["Music", "Analog", "Home"],
    match: 87,
    reason: "Picking the record is the gift. The record is the bonus.",
    shop: "Local Shop",
  },
  {
    id: "ff-03",
    name: "Board Game, Co-op",
    tagline: "You lose together. You win together.",
    price: 48,
    currency: "$",
    image: friendsImg(
      "an open board game with cards and pieces on a wooden table, warm editorial product photography"
    ),
    category: "Games",
    tags: ["Game Night", "Social", "Games"],
    match: 84,
    reason: "A reason to invite them over. That's the real gift.",
    shop: "Asmodee",
  },
  {
    id: "ff-04",
    name: "Hot Sauce Trio",
    tagline: "Three bottles, three warnings.",
    price: 32,
    currency: "$",
    image: friendsImg(
      "three bottles of artisanal hot sauce in a row on a dark surface, warm editorial product photography"
    ),
    category: "Food",
    tags: ["Foodie", "Spicy", "Food"],
    match: 80,
    reason: "For the friend who puts hot sauce on everything. They exist.",
    shop: "Small Axe",
  },
  {
    id: "ff-05",
    name: "Screenprint Art Print",
    tagline: "A wall, finally not blank.",
    price: 45,
    currency: "$",
    image: friendsImg(
      "a framed screenprint art print leaning against a wall, warm editorial product photography"
    ),
    category: "Art",
    tags: ["Decor", "Art", "Home"],
    match: 77,
    reason: "They just moved. The walls are still bare. You noticed.",
    shop: "20x200",
  },
  {
    id: "ff-06",
    name: "Camp Mug, Enamel",
    tagline: "For the trips you keep planning.",
    price: 24,
    currency: "$",
    image: friendsImg(
      "a blue enamel camp mug on a wooden picnic table outdoors, warm editorial product photography"
    ),
    category: "Outdoor",
    tags: ["Outdoors", "Coffee", "Outdoor"],
    match: 75,
    reason: "Inside joke, made physical. Coffee tastes better from this one.",
    shop: "Frost River",
  },
];

// ---------- For Coworkers category ----------
const coworkersImg = (p: string): string => {
  const s = p.toLowerCase();
  if (s.includes("notebook")) return IMG.notebook;
  if (s.includes("plant")) return IMG.plant;
  if (s.includes("chocolate")) return IMG.chocolate;
  if (s.includes("tumbler") || s.includes("mug")) return IMG.mug;
  if (s.includes("leather") || s.includes("cable") || s.includes("wallet")) return IMG.wallet;
  if (s.includes("cream")) return IMG.skincare;
  return IMG.default;
};

export const forCoworkersGifts: Gift[] = [
  {
    id: "fc-01",
    name: "Premium Notebooks, 3pk",
    tagline: "For the meeting that never ends.",
    price: 28,
    currency: "$",
    image: coworkersImg(
      "a stack of three premium notebooks in neutral colors on a clean office desk, editorial product photography"
    ),
    category: "Stationery",
    tags: ["Desk", "Everyday", "Stationery"],
    match: 89,
    reason: "Safe, useful, never awkward. The coworker gift template.",
    shop: "Muji",
  },
  {
    id: "fc-02",
    name: "Desk Plant in Concrete Pot",
    tagline: "A living thing, no watering required (almost).",
    price: 32,
    currency: "$",
    image: coworkersImg(
      "a small desk plant in a concrete pot on a minimal office desk, warm editorial product photography"
    ),
    category: "Home",
    tags: ["Desk", "Plant", "Home"],
    match: 85,
    reason: "Studies say a plant on the desk lowers stress. Worth a try.",
    shop: "The Sill",
  },
  {
    id: "fc-03",
    name: "Specialty Chocolate Bar Set",
    tagline: "Three bars, three origins.",
    price: 24,
    currency: "$",
    image: coworkersImg(
      "three specialty chocolate bars in wrappers arranged on a cream surface, editorial product photography, soft light"
    ),
    category: "Food",
    tags: ["Food", "Sweet", "Food"],
    match: 82,
    reason: "Universally safe, genuinely good. The desk-drawer currency.",
    shop: "Tony's",
  },
  {
    id: "fc-04",
    name: "Insulated Coffee Tumbler",
    tagline: "The 3pm refill, kept warm.",
    price: 35,
    currency: "$",
    image: coworkersImg(
      "an insulated stainless steel coffee tumbler in matte white on an office desk, editorial product photography"
    ),
    category: "Daily",
    tags: ["Coffee", "Desk", "Daily"],
    match: 80,
    reason: "Conference room coffee is bad. This makes it survivable.",
    shop: "Kinto",
  },
  {
    id: "fc-05",
    name: "Leather Cable Organizer",
    tagline: "The drawer, finally tidy.",
    price: 22,
    currency: "$",
    image: coworkersImg(
      "a small leather cable organizer roll on a clean desk with charging cables, editorial product photography"
    ),
    category: "Desk",
    tags: ["Desk", "Organize", "Desk"],
    match: 76,
    reason: "Their bag is a tangle of cables. This quietly fixes it.",
    shop: "Bellroy",
  },
  {
    id: "fc-06",
    name: "Hand Cream, Office Size",
    tagline: "AC dry air, quietly fixed.",
    price: 19,
    currency: "$",
    image: coworkersImg(
      "a tube of hand cream on a clean office desk next to a laptop, editorial product photography, soft light"
    ),
    category: "Self-care",
    tags: ["Self-care", "Desk", "Self-care"],
    match: 73,
    reason: "Offices are dry. They'll use it, then thank you, then ask the brand.",
    shop: "Aesop",
  },
];

// ---------- Journal articles ----------
export const articles: Article[] = [
  {
    slug: "anniversary-no-cliche",
    title: "Anniversary Gifts That Aren't Flowers",
    excerpt:
      "We broke 'romantic but not cliché' into three rules you can actually use, with twelve options that won't miss.",
    category: "Gift Guides",
    readTime: "7 min read",
    image: IMG.gift,
    body: [
      "Flowers die in a week. Chocolates last even less. And after the third year together, another teddy bear starts to feel like you stopped trying. So we sat down and asked a harder question: what actually feels romantic in 2026, without tipping into the obvious?",
      "Here are the three rules we landed on. They're not new — but they're easy to forget in the panic of the week before an anniversary.",
      "Rule one: give something they'd never buy themselves. Romantic, in our experience, lives in that narrow gap between 'I want it' and 'I'd never spend money on it for me.' That's where most of the good anniversary gifts actually sit.",
      "Rule two: the gift should outlast the day. If it's gone by Tuesday, it was a gesture — not a gift. A gesture is fine, but it's not what this list is for. Look for things that will still be on the desk, or in the cupboard, or on the wrist, six months from now.",
      "Rule three: a story beats a price tag. The $28 thing that reminds them of the café you went to on your second date will beat the $400 thing every single time. Money doesn't buy the look they get on their face when they understand why you picked it.",
      "Below are three things we'd actually give — and yes, a couple of them you can buy on Amazon. We've linked them as affiliate picks, because full disclosure matters more than pretending we don't make a living.",
    ],
    relatedGifts: [
      {
        id: "art-01-a",
        name: "Engraved Minimalist Bracelet",
        tagline: "Their initials, your call — quietly, on the wrist.",
        price: 34,
        currency: "$",
        image: IMG.jewelry,
        category: "Wear",
        tags: ["Jewelry", "Personal", "Wear"],
        match: 93,
        reason: "Engraving turns a $34 bracelet into something only you could have given.",
        shop: "Engraved Studio",
      },
      {
        id: "art-01-b",
        name: "Two-Cup Pour-Over Set",
        tagline: "Because the slow mornings together are the point.",
        price: 42,
        currency: "$",
        image: IMG.coffee,
        category: "Home",
        tags: ["Coffee", "Mornings", "Home"],
        match: 88,
        reason: "The gift is really the ten minutes you spend making coffee together.",
        shop: "Blue Bottle",
      },
      {
        id: "art-01-c",
        name: "Letterpress Memory Book",
        tagline: "Half photo album, half blank page — for what's next.",
        price: 58,
        currency: "$",
        image: IMG.art,
        category: "Paper",
        tags: ["Memory", "Keepsake", "Paper"],
        match: 85,
        reason: "The thing that lasts longer than any other gift on this list.",
        shop: "Paper Source",
      },
    ],
  },
  {
    slug: "budget-under-40",
    title: "8 Gifts Under $40 That Still Feel Considered",
    excerpt:
      "Budget is no excuse. Every item here we actually bought, opened, and lived with for a week.",
    category: "Budget Lists",
    readTime: "9 min read",
    image: IMG.gift,
    body: [
      "There's a particular kind of disappointment that comes from receiving a $40 gift that obviously cost $40. You know the look — the half-smile, the 'oh, that's nice,' the box that goes into a drawer the moment you leave. We've all given one. We're done giving them.",
      "The trick isn't to spend more. The trick is to spend on things that don't feel cheap, even when they are. Below is what we've learned, after buying and living with a pile of sub-$40 items over the last month.",
      "First: avoid 'gift sets.' Anything pre-packaged as a gift set — a tin with a bow, a basket, a 'kit' — is signalling that it's a gift. That signalling is exactly what cheapens it. A single good $24 item beats a $40 gift basket every time.",
      "Second: buy the small version of a real thing. A travel-size bottle of the actual whiskey someone drinks is better than a $40 bottle of 'gift whiskey' nobody wants. A small jar of the actual honey they put on their yogurt beats a gourmet gift basket of three honeys you've never heard of.",
      "Third: weight matters. A $20 ceramic mug feels like a $40 gift because it's heavy in the hand. A $40 plastic gadget feels like a $12 gift because it isn't. When in doubt, pick the thing that has some mass to it.",
      "Here are three of our favorites from this round — all under $40, all things we'd happily give to someone we actually like.",
    ],
    relatedGifts: [
      {
        id: "art-02-a",
        name: "Stoneware Coffee Mug, 12oz",
        tagline: "Heavy in the hand. That's the whole point.",
        price: 24,
        currency: "$",
        image: IMG.mug,
        category: "Home",
        tags: ["Coffee", "Heavy", "Home"],
        match: 90,
        reason: "Weight does the work. $24 feels like $40 in the hand.",
        shop: "East Fork",
      },
      {
        id: "art-02-b",
        name: "Small-Batch Hot Honey, 4oz",
        tagline: "The thing they'll put on everything for a month.",
        price: 14,
        currency: "$",
        image: IMG.honey,
        category: "Pantry",
        tags: ["Food", "Small Batch", "Pantry"],
        match: 82,
        reason: "The small version of the real thing, not a gift-basket version.",
        shop: "Mike's Hot Honey",
      },
      {
        id: "art-02-c",
        name: "Linen Tea Towel, Set of 2",
        tagline: "The kind of thing that gets more beautiful as it ages.",
        price: 22,
        currency: "$",
        image: IMG.default,
        category: "Home",
        tags: ["Kitchen", "Linen", "Home"],
        match: 78,
        reason: "A useful gift that quietly elevates a kitchen drawer.",
        shop: "Misool",
      },
    ],
  },
  {
    slug: "for-the-one-who-has-everything",
    title: "For the Person Who Has Everything",
    excerpt:
      "They really do have it all — so maybe the gift shouldn't be a thing at all.",
    category: "Ideas",
    readTime: "6 min read",
    image: IMG.gift,
    body: [
      "There's a particular person — you have one in your life — who genuinely doesn't need anything. They buy what they want when they want it. Their shelves are full. Their kitchen is full. Their wardrobe is, if anything, too full. Giving them a 'thing' feels like adding to a problem.",
      "Here's the reframe we keep coming back to: when someone has everything, give them an experience, a memory, or a small everyday upgrade they wouldn't have thought to buy for themselves.",
      "Experiences work because they don't take up shelf space. A dinner reservation at the place they've been meaning to try. A membership to the botanical garden they walk past every weekend. A bottle of the wine you shared once, with a note saying where you'll drink it together.",
      "Upgrades work because the 'good enough' version of an everyday object is rarely the version someone treats themselves to. The nice olive oil. The good socks. A fresh pair of the razor blades they've been putting off replacing. None of these are exciting — and that's exactly why they work.",
      "What doesn't work, in our experience: 'novelty.' The funny mug, the personalized socks, the customized bobblehead. These read as 'I gave up.' They're for the giver, not the receiver.",
      "Below are three small upgrades we keep coming back to for the person who already has everything. None of them will change their life — but all of them will quietly improve a Tuesday.",
    ],
    relatedGifts: [
      {
        id: "art-03-a",
        name: "Single-Origin Olive Oil, 250ml",
        tagline: "The good one. For the table, not the pan.",
        price: 28,
        currency: "$",
        image: IMG.oil,
        category: "Pantry",
        tags: ["Food", "Upgrade", "Pantry"],
        match: 87,
        reason: "The upgrade they'd never buy for themselves — that's the whole point.",
        shop: "Brightland",
      },
      {
        id: "art-03-b",
        name: "Merino Wool Socks, 3-Pair",
        tagline: "The everyday object they didn't know could be this good.",
        price: 26,
        currency: "$",
        image: IMG.socks,
        category: "Wear",
        tags: ["Everyday", "Upgrade", "Wear"],
        match: 80,
        reason: "The exact opposite of a novelty gift — quietly better every morning.",
        shop: "Darn Tough",
      },
      {
        id: "art-03-c",
        name: "Botanical Garden Day Pass",
        tagline: "An afternoon, not an object. Sometimes that's the answer.",
        price: 20,
        currency: "$",
        image: IMG.garden,
        category: "Experience",
        tags: ["Experience", "Memory", "Outing"],
        match: 92,
        reason: "An experience takes up zero shelf space — perfect for the person who has everything.",
        shop: "Local Garden",
      },
    ],
  },
];

// ---------- Quiz: 8 questions ----------
export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    key: "recipient",
    title: "Who is this gift for?",
    subtitle: "Tell us who it's for first — it sets everything that comes after.",
    options: [
      { value: "him", label: "Him", description: "Partner · Father · Brother" },
      { value: "her", label: "Her", description: "Partner · Mother · Sister" },
      { value: "kids", label: "Kids", description: "Under 12" },
      { value: "parents", label: "Parents", description: "Both of them" },
      { value: "friends", label: "Friends", description: "Close friend" },
      { value: "other", label: "Someone else", description: "Custom" },
    ],
  },
  {
    id: 2,
    key: "age",
    title: "How old are they?",
    subtitle: "Age narrows the field — a 25-year-old and a 55-year-old are worlds apart.",
    options: [
      { value: "under-18", label: "Under 18" },
      { value: "18-25", label: "18 – 25" },
      { value: "25-35", label: "25 – 35" },
      { value: "35-50", label: "35 – 50" },
      { value: "50-65", label: "50 – 65" },
      { value: "over-65", label: "Over 65" },
    ],
  },
  {
    id: 3,
    key: "occasion",
    title: "What's the occasion?",
    subtitle: "Occasion changes what 'right' even means.",
    options: [
      { value: "birthday", label: "Birthday" },
      { value: "anniversary", label: "Anniversary" },
      { value: "holiday", label: "Holiday" },
      { value: "thanks", label: "Thank you" },
      { value: "apology", label: "An apology" },
      { value: "no-reason", label: "Just because" },
    ],
  },
  {
    id: 4,
    key: "budget",
    title: "What's your budget?",
    subtitle: "A range is fine — we'll find the best within it.",
    options: [
      { value: "0-30", label: "Under $30" },
      { value: "30-75", label: "$30 – $75" },
      { value: "75-150", label: "$75 – $150" },
      { value: "150-400", label: "$150 – $400" },
      { value: "400+", label: "Over $400" },
      { value: "flexible", label: "Flexible — show me" },
    ],
  },
  {
    id: 5,
    key: "interests",
    title: "What do they love?",
    subtitle: "Pick all that fit — the more you choose, the sharper it gets.",
    options: [
      { value: "tech", label: "Tech" },
      { value: "coffee", label: "Coffee & Tea" },
      { value: "outdoor", label: "Outdoors" },
      { value: "reading", label: "Reading" },
      { value: "cooking", label: "Cooking" },
      { value: "music", label: "Music" },
    ],
  },
  {
    id: 6,
    key: "personality",
    title: "Their personality?",
    subtitle: "This decides practical versus romantic.",
    options: [
      { value: "practical", label: "Practical", description: "Reads three reviews first" },
      { value: "romantic", label: "Romantic", description: "Loves the gesture" },
      { value: "minimal", label: "Minimalist", description: "Less is more" },
      { value: "playful", label: "Playful", description: "Can't resist new things" },
    ],
  },
  {
    id: 7,
    key: "giftStyle",
    title: "What style of gift?",
    subtitle: "A physical thing, an experience, or a surprise — you decide the direction.",
    options: [
      { value: "practical-item", label: "Practical item", description: "Something they'll use daily" },
      { value: "experience", label: "Experience", description: "A memory, not an object" },
      { value: "creative", label: "Creative surprise", description: "Unexpected and fun" },
      { value: "classic", label: "Classic & safe", description: "Can't go wrong" },
    ],
  },
  {
    id: 8,
    key: "closeness",
    title: "How close are you?",
    subtitle: "Last one — closeness sets the weight of the gift.",
    options: [
      { value: "partner", label: "Partner" },
      { value: "family", label: "Family" },
      { value: "close-friend", label: "Close friend" },
      { value: "colleague", label: "Colleague" },
      { value: "acquaintance", label: "Acquaintance" },
      { value: "client", label: "Client" },
    ],
  },
];

export const formatPrice = (price: number, currency: string = "$") =>
  `${currency}${price.toLocaleString("en-US")}`;

// ---------- Supabase Product → Gift 适配器 ----------
// Supabase 表里的 Product 字段名和 GiftCard 用的 Gift 不一样，这里做一层转换，
// 让 GiftCard 不用改代码就能直接吃 Supabase 的数据。
//
// review_quote 列现在存的是 JSON metadata：{category, gender, style_tags, avoid_tags}
// 如果解析失败（旧数据格式），fallback 到 price_range → Budget/Mid-Range/Premium
export function productToGift(p: Product): Gift {
  // 尝试解析 review_quote 里的 JSON metadata
  let metadata: { category?: string; gender?: string; style_tags?: string[]; avoid_tags?: string[] } | null = null;
  let reviewQuote = p.review_quote ?? "";
  try {
    const parsed = JSON.parse(reviewQuote);
    if (parsed && typeof parsed === "object" && parsed.category) {
      metadata = parsed;
      reviewQuote = ""; // metadata 不是真正的 review，清空
    }
  } catch {
    // 不是 JSON，保持原样作为 review_quote
  }

  // category：优先用 metadata 里的真实品类，fallback 到 price_range
  const category = metadata?.category
    || (p.price_range === "cheap" ? "Budget" : p.price_range === "mid" ? "Mid-Range" : "Premium");

  return {
    id: `sb-${p.id}`,
    name: p.name,
    tagline: p.description,
    price: Number(p.price),
    currency: "$",
    image: fixImageUrl(p.name, p.image_url),
    category,
    tags: [...p.audience_tags, ...p.occasion_tags],
    match: 0,
    reason: reviewQuote,
    shop: "Amazon",
    amazonUrl: p.affiliate_url || undefined,
  };
}
