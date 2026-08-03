/**
 * 批量生成 1000 条礼物商品数据并插入 Supabase
 * 用法: node scripts/seed-products.mjs
 *
 * 商品覆盖 6 个人群 × 6 个场合 × 3 个价格区间
 * 每条数据的 affiliate_url 指向亚马逊搜索结果页（按商品名搜索）
 */

import { writeFileSync } from "fs";

// ---------- 商品模板 ----------
// 每个模板: name, price, desc, review, audiences[], occasions[], priceRange, imagePrompt
const TEMPLATES = [
  // ===== Electronics & Tech =====
  { name: "Wireless Charging Pad", price: 25, desc: "Drop your phone, pick up power. No cables, no fumbling.", review: "Charges through a case — finally, no more peeling it off.", audiences: ["for-him","for-her"], occasions: ["birthday","thanks"], cat: "tech" },
  { name: "Bluetooth Portable Speaker", price: 45, desc: "Room-filling sound from something that fits in a jacket pocket.", review: "Bass surprised me. It's louder than I expected for the size.", audiences: ["for-him","for-her","for-kids","for-friends"], occasions: ["birthday","christmas","thanks"], cat: "tech" },
  { name: "Smart LED Strip Lights", price: 30, desc: "16 million colors, app-controlled. The room never felt the same.", review: "My kid is obsessed. The music sync mode is wild at night.", audiences: ["for-kids","for-friends","for-her"], occasions: ["birthday","christmas"], cat: "tech" },
  { name: "Noise Cancelling Earbuds", price: 79, desc: "Quiet when you need it, music when you want it. Small enough to forget.", review: "I wore these on a 12-hour flight and forgot the engines existed.", audiences: ["for-him","for-her"], occasions: ["birthday","anniversary"], cat: "tech" },
  { name: "Mechanical Keyboard 75%", price: 139, desc: "Every keystroke feels deliberate. Hot-swappable switches for the curious.", review: "My typing speed went up. Also my partner's tolerance went down.", audiences: ["for-him","for-friends"], occasions: ["birthday","christmas"], cat: "tech" },
  { name: "Tablet Stylus Pen", price: 35, desc: "4,096 pressure levels. For the doodler who never stopped.", review: "Feels like a real pen. The palm rejection is seamless.", audiences: ["for-her","for-kids","for-friends"], occasions: ["birthday","thanks"], cat: "tech" },
  { name: "Mini Projector", price: 89, desc: "Turn any wall into a cinema. Connects to your phone in seconds.", review: "Movie night on the backyard fence was the highlight of summer.", audiences: ["for-him","for-friends","for-kids"], occasions: ["birthday","christmas"], cat: "tech" },
  { name: "Smart Watch Band Leather", price: 28, desc: "Italian leather, fits Apple Watch and Galaxy Watch. Ages beautifully.", review: "Three months in and the patina is gorgeous. Compliments daily.", audiences: ["for-him","for-her"], occasions: ["birthday","anniversary"], cat: "tech" },
  { name: "USB-C Hub 7-in-1", price: 32, desc: "HDMI, SD, USB, power delivery. The dongle that actually stays on your desk.", review: "No more swapping cables before every meeting.", audiences: ["for-him","for-coworkers"], occasions: ["birthday","thanks"], cat: "tech" },
  { name: "Portable SSD 1TB", price: 99, desc: "Pocket-sized backup that's faster than your laptop's drive.", review: "Transferred 200GB in minutes. Photography workflow changed.", audiences: ["for-him","for-her","for-friends"], occasions: ["birthday","christmas"], cat: "tech" },

  // ===== Home & Living =====
  { name: "Scented Soy Candle Cedar", price: 24, desc: "Cedar and smoke — a kind of safety, late at night.", review: "The throw fills a living room without being aggressive. Burns clean.", audiences: ["for-her","for-him"], occasions: ["anniversary","thanks"], cat: "home" },
  { name: "Linen Throw Blanket", price: 58, desc: "Stonewashed linen that gets softer every week.", review: "It's the thing everyone fights over on the couch now.", audiences: ["for-her","for-parents"], occasions: ["christmas","anniversary"], cat: "home" },
  { name: "Ceramic Plant Pot Set", price: 22, desc: "Three stoneware pots with drainage. For the windowsill garden.", review: "Finally my succulents look intentional, not surviving.", audiences: ["for-her","for-friends","for-parents"], occasions: ["birthday","thanks"], cat: "home" },
  { name: "Diffuser with Bamboo Sticks", price: 26, desc: "No flame, no worry. A slow, steady scent for weeks.", review: "Guests ask what the smell is within five minutes. Every time.", audiences: ["for-her","for-parents"], occasions: ["birthday","thanks"], cat: "home" },
  { name: "Wool Felt Coaster Set", price: 18, desc: "Dense wool that absorbs condensation. No more ring marks.", review: "They look like they belong in a design museum, honestly.", audiences: ["for-coworkers","for-friends","for-parents"], occasions: ["birthday","thanks"], cat: "home" },
  { name: "Handwoven Basket", price: 42, desc: "Rattan storage that looks intentional, not like you gave up.", review: "Holds throw blankets perfectly. Sturdier than I expected.", audiences: ["for-her","for-parents"], occasions: ["christmas","birthday"], cat: "home" },
  { name: "Framed Botanical Print", price: 35, desc: "Vintage-style pressed-herb illustration, oak frame included.", review: "The frame quality is real wood, not plastic. Looks like a gallery piece.", audiences: ["for-her","for-friends"], occasions: ["birthday","anniversary"], cat: "home" },
  { name: "Stoneware Vase Matte White", price: 32, desc: "Imperfect, hand-glazed. The kind of thing you notice in a friend's home.", review: "A single stem eucalyptus and it transforms the whole shelf.", audiences: ["for-her","for-parents","for-friends"], occasions: ["birthday","thanks"], cat: "home" },
  { name: "Weighted Blanket 15lb", price: 65, desc: "Deep pressure that quiets the mind. Sleep you didn't know you were missing.", review: "First night I slept through. It's like being held, gently.", audiences: ["for-her","for-him","for-parents"], occasions: ["christmas","birthday"], cat: "home" },
  { name: "Tabletop Fire Pit", price: 49, desc: "Smokeless, portable. S'mores on the balcony without the guilt.", review: "The flame is small but real. Perfect for a quiet evening.", audiences: ["for-him","for-friends"], occasions: ["birthday","christmas"], cat: "home" },

  // ===== Kitchen & Dining =====
  { name: "Pour-Over Coffee Set", price: 42, desc: "Slow mornings, one cup at a time.", review: "He wanted to quit takeout coffee. This lets him make a proper cup at home.", audiences: ["for-him","for-her","for-parents"], occasions: ["birthday","christmas"], cat: "kitchen" },
  { name: "Stoneware Mug Set of 4", price: 38, desc: "Heavy in the hand — that's the whole point. Dishwasher safe.", review: "My morning coffee feels different from a thick, warm mug.", audiences: ["for-parents","for-coworkers","for-friends"], occasions: ["christmas","thanks"], cat: "kitchen" },
  { name: "Cast Iron Skillet 10 inch", price: 34, desc: "Pre-seasoned, indestructible. The last pan you'll need to buy.", review: "Everything cooks better in this. Steak, eggs, cornbread. All of it.", audiences: ["for-him","for-parents","for-friends"], occasions: ["wedding","birthday"], cat: "kitchen" },
  { name: "Wine Glasses Crystal Set", price: 45, desc: "Thin-rimmed, dishwasher safe. For the wine that deserves better than a mason jar.", review: "Lighter than I expected. Feels expensive without being fragile.", audiences: ["for-her","for-parents","for-coworkers"], occasions: ["anniversary","thanks"], cat: "kitchen" },
  { name: "Bamboo Cutting Board", price: 25, desc: "End-grain, gentle on knives. Built-in juice groove.", review: "No more stained plastic board. This one looks better with age.", audiences: ["for-him","for-parents","for-coworkers"], occasions: ["birthday","thanks"], cat: "kitchen" },
  { name: "Matcha Whisk Set", price: 29, desc: "Bamboo whisk, bowl, scoop. The ritual you didn't know you needed.", review: "The foam is real. My morning shifted from coffee to this.", audiences: ["for-her","for-friends"], occasions: ["birthday","thanks"], cat: "kitchen" },
  { name: "Cold Brew Maker 1L", price: 32, desc: "Slow steep, smooth result. No bitterness, no acidity.", review: "Set it at night, wake up to cold brew. Changed my summer mornings.", audiences: ["for-him","for-her","for-friends"], occasions: ["birthday","thanks"], cat: "kitchen" },
  { name: "Espresso Tamper 58mm", price: 22, desc: "Weighted, solid stainless. For the person who takes their shot seriously.", review: "Even puck, even extraction. The difference is in the crema.", audiences: ["for-him","for-friends"], occasions: ["birthday","christmas"], cat: "kitchen" },
  { name: "Honey Pot with Dipper", price: 19, desc: "Beechwood dipper, glass jar. For the tea drinker who deserves better.", review: "No more sticky honey bottles. This is elegant on the counter.", audiences: ["for-her","for-parents"], occasions: ["birthday","thanks"], cat: "kitchen" },
  { name: "Cheese Board Set", price: 39, desc: "Acacia wood, hidden drawers for knives. The host gift that gets used.", review: "The hidden knife storage is genius. Guests always comment on it.", audiences: ["for-coworkers","for-friends","for-parents"], occasions: ["christmas","thanks"], cat: "kitchen" },

  // ===== Fashion & Accessories =====
  { name: "Leather Card Wallet Slim", price: 32, desc: "Full-grain leather, four pockets. Carries what matters, nothing more.", review: "Time to retire the bulky one. This is all I needed.", audiences: ["for-him","for-friends"], occasions: ["birthday","christmas"], cat: "fashion" },
  { name: "Cashmere Scarf", price: 68, desc: "Two-ply, Grade A cashmere. Light enough for spring, warm enough for winter.", review: "Buttery soft. I wrapped it twice and forgot about the cold.", audiences: ["for-her","for-parents"], occasions: ["christmas","anniversary"], cat: "fashion" },
  { name: "Canvas Tote Bag Heavy", price: 24, desc: "16oz waxed canvas, leather handles. The everyday carry that lasts decades.", review: "Holds a laptop, groceries, and a water bottle without sagging.", audiences: ["for-her","for-friends","for-coworkers"], occasions: ["birthday","thanks"], cat: "fashion" },
  { name: "Leather Belt Full Grain", price: 45, desc: "Single strip of leather, solid brass buckle. Ages like good luggage.", review: "Five years in and it looks better than new. Worth every penny.", audiences: ["for-him","for-parents"], occasions: ["birthday","christmas"], cat: "fashion" },
  { name: "Silk Sleep Mask", price: 19, desc: "Mulberry silk, gentle on skin and hair. For the light sleeper.", review: "Total darkness, no pressure on eyes. Slept through a 6am sunrise.", audiences: ["for-her","for-parents"], occasions: ["birthday","thanks"], cat: "fashion" },
  { name: "Minimalist Watch Leather", price: 89, desc: "Sapphire crystal, Japanese movement. Quietly confident.", review: "I get asked about this watch more than the one that cost five times more.", audiences: ["for-him","for-her"], occasions: ["anniversary","birthday"], cat: "fashion" },
  { name: "Wool Beanie Ribbed", price: 22, desc: "Merino wool, no itch. Folded cuff for the right fit.", review: "Warm without sweating. The itch from acrylic hats is gone.", audiences: ["for-him","for-kids","for-friends"], occasions: ["christmas","birthday"], cat: "fashion" },
  { name: "Leather Gloves Touchscreen", price: 48, desc: "Italian leather, conductive fingertips. Text without freezing.", review: "Finally I don't have to choose between warm hands and answering.", audiences: ["for-him","for-her","for-parents"], occasions: ["christmas","anniversary"], cat: "fashion" },
  { name: "Pearl Earrings Studs", price: 29, desc: "Freshwater pearls, sterling silver posts. Quiet elegance.", review: "Small, real, and wearable every day. My go-to pair now.", audiences: ["for-her","for-parents"], occasions: ["anniversary","birthday"], cat: "fashion" },
  { name: "Crossbody Bag Saddle", price: 75, desc: "Full-grain leather, adjustable strap. The bag that holds your day.", review: "Fits phone, wallet, keys, lipstick. Hands-free and stylish.", audiences: ["for-her","for-friends"], occasions: ["birthday","christmas"], cat: "fashion" },

  // ===== Beauty & Self-care =====
  { name: "Bath Bomb Gift Set", price: 26, desc: "Six handmade bombs, natural essential oils. For the long bath.", review: "The colors are natural, not neon. The lavender one is my favorite.", audiences: ["for-her","for-kids"], occasions: ["birthday","christmas"], cat: "beauty" },
  { name: "Jade Roller and Gua Sha", price: 18, desc: "Cool stone, gentle pressure. The morning ritual that feels like self-respect.", review: "Five minutes a day and my face looks less puffy. Not magic, but close.", audiences: ["for-her","for-parents"], occasions: ["birthday","thanks"], cat: "beauty" },
  { name: "Eucalyptus Shower Bundle", price: 16, desc: "Hang it in the shower. Steam releases the scent. Spa at home.", review: "Walked in and thought I was at a spa. The smell is real eucalyptus.", audiences: ["for-her","for-him","for-parents"], occasions: ["thanks","birthday"], cat: "beauty" },
  { name: "Lavender Pillow Mist", price: 19, desc: "French lavender, chamomile. Two sprays and the pillow knows it's time.", review: "I was skeptical. Then I slept nine hours straight.", audiences: ["for-her","for-parents","for-friends"], occasions: ["thanks","christmas"], cat: "beauty" },
  { name: "Hand Cream Trio", price: 24, desc: "Shea butter, three scents. For hands that wash too often.", review: "Non-greasy, absorbs fast. The linen scent is addictive.", audiences: ["for-her","for-coworkers","for-parents"], occasions: ["thanks","christmas"], cat: "beauty" },
  { name: "Silk Scrunchies Set", price: 14, desc: "Mulberry silk, gentle on hair. No crease, no pull.", review: "No more ponytail dent. Also they don't slide off at night.", audiences: ["for-her","for-kids","for-friends"], occasions: ["birthday","thanks"], cat: "beauty" },
  { name: "Cuticle Oil Pen", price: 12, desc: "Jojoba and vitamin E. Click-pen, no mess. For nails that need a kind word.", review: "One week of use and my nails stopped peeling. Simple but effective.", audiences: ["for-her","for-coworkers"], occasions: ["thanks","birthday"], cat: "beauty" },
  { name: "Dry Body Brush", price: 15, desc: "Natural bristles, long handle. Skin that feels awake before coffee.", review: "Two minutes before showering. Skin is smoother, no lotion needed.", audiences: ["for-her","for-parents"], occasions: ["birthday","thanks"], cat: "beauty" },
  { name: "Eye Mask Gel Bead", price: 14, desc: "Hot or cold therapy. For the screen-tired eyes.", review: "Pop it in the fridge. Twenty minutes and my eyes feel human again.", audiences: ["for-her","for-him","for-coworkers"], occasions: ["thanks","birthday"], cat: "beauty" },
  { name: "Aromatherapy Roll-On Set", price: 22, desc: "Three blends: focus, calm, sleep. Pocket-sized, purse-ready.", review: "The sleep one works. I roll it on my wrists and wind down.", audiences: ["for-her","for-friends","for-parents"], occasions: ["birthday","thanks"], cat: "beauty" },

  // ===== Books & Stationery =====
  { name: "Hardcover Journal Lined", price: 22, desc: "Smyth-sewn binding, 240 pages, lays flat. The kind that lasts.", review: "Opens flat, paper takes ink without bleed. My third one now.", audiences: ["for-her","for-him","for-friends"], occasions: ["birthday","newyear"], cat: "stationery" },
  { name: "Fountain Pen Medium Nib", price: 28, desc: "Cartridge or converter. The scratch of real ink on paper.", review: "First fountain pen. The line is smooth, the ink flows. Writing feels different.", audiences: ["for-him","for-friends","for-coworkers"], occasions: ["birthday","thanks"], cat: "stationery" },
  { name: "Leather Notebook Cover A5", price: 35, desc: "Full-grain leather, refillable. Your notebook's forever home.", review: "Looks better scuffed. The elastic holds refills tight.", audiences: ["for-him","for-her","for-coworkers"], occasions: ["birthday","thanks"], cat: "stationery" },
  { name: "Watercolor Pencil Set 24", price: 25, desc: "Draw, then brush with water. Color that blooms.", review: "Vibrant, smooth, blend beautifully. My sketchbook got interesting.", audiences: ["for-her","for-kids","for-friends"], occasions: ["birthday","christmas"], cat: "stationery" },
  { name: "Book Lovers Tea Sampler", price: 24, desc: "Six loose-leaf teas, each paired with a reading mood.", review: "The 'rainy afternoon' blend is my reading companion now.", audiences: ["for-her","for-parents","for-friends"], occasions: ["birthday","thanks"], cat: "stationery" },
  { name: "Desk Organizer Walnut", price: 39, desc: "Solid wood, six slots. For the desk that wants to grow up.", review: "Heavy, beautiful, and everything has a place now.", audiences: ["for-him","for-coworkers","for-parents"], occasions: ["birthday","thanks"], cat: "stationery" },
  { name: "Wax Seal Stamp Kit", price: 22, desc: "Brass stamp, wax beads, melting spoon. Letters worth opening.", review: "Sealed my wedding thank-you cards with this. People kept the envelopes.", audiences: ["for-her","for-friends"], occasions: ["anniversary","thanks"], cat: "stationery" },
  { name: "Bullet Dotted Notebook", price: 18, desc: "120gsm paper, no bleed-through. The system that actually sticks.", review: "Dots instead of lines. Freedom to plan, sketch, and note in one place.", audiences: ["for-her","for-him","for-friends"], occasions: ["newyear","birthday"], cat: "stationery" },
  { name: "Calligraphy Brush Pen Set", price: 16, desc: "Dual-tip, flexible brush. For the handwriting that wants to wander.", review: "The pressure sensitivity is real. Lettering finally clicked.", audiences: ["for-her","for-kids","for-friends"], occasions: ["birthday","thanks"], cat: "stationery" },
  { name: "Reading Light Clip-On Warm", price: 19, desc: "Amber light, three brightness levels. For the 'one more chapter' nights.", review: "No blue light, no disturbing partner. Clips to any book.", audiences: ["for-her","for-parents","for-friends"], occasions: ["birthday","thanks"], cat: "stationery" },

  // ===== Outdoor & Sports =====
  { name: "Insulated Water Bottle 32oz", price: 28, desc: "Keeps ice for 24 hours. The bottle that lives on your desk.", review: "Left it in a hot car. Still had ice six hours later.", audiences: ["for-him","for-her","for-kids","for-friends"], occasions: ["birthday","thanks"], cat: "outdoor" },
  { name: "Yoga Mat Cork", price: 42, desc: "Natural cork surface, no slip. Better grip when wet.", review: "No more sliding in downward dog. The cork feels grounded.", audiences: ["for-her","for-parents","for-friends"], occasions: ["newyear","birthday"], cat: "outdoor" },
  { name: "Resistance Band Set", price: 19, desc: "Five bands, door anchor, handles. The gym that fits in a drawer.", review: "Surprised by the resistance. The red one is no joke.", audiences: ["for-him","for-her","for-parents"], occasions: ["newyear","birthday"], cat: "outdoor" },
  { name: " Camping Hammock Double", price: 38, desc: "Parachute nylon, 500lb capacity. The park just became a bedroom.", review: "Packs to the size of a grapefruit. Set up in two minutes.", audiences: ["for-him","for-friends","for-kids"], occasions: ["birthday","christmas"], cat: "outdoor" },
  { name: "Insulated Travel Mug 16oz", price: 32, desc: "Keeps coffee hot from nine to three.", review: "He forgets to drink water. Let the mug remind him instead of you.", audiences: ["for-him","for-her"], occasions: ["birthday","thanks"], cat: "outdoor" },
  { name: "Folding Camp Chair", price: 35, desc: "Aluminum frame, cup holder, packs flat. Your backstage seat anywhere.", review: "Lighter than expected. The cup holder is the real luxury.", audiences: ["for-him","for-friends","for-parents"], occasions: ["birthday","christmas"], cat: "outdoor" },
  { name: "Jump Rope Weighted", price: 16, desc: "Steel cable, ball bearing. The cardio you can do in 10 square feet.", review: "Fast, smooth, no tangling. Calves burning in 3 minutes.", audiences: ["for-him","for-her","for-friends"], occasions: ["newyear","birthday"], cat: "outdoor" },
  { name: "Golf Towel Microfiber", price: 14, desc: "Tri-fold, carabiner clip. For the golfer who cares about their clubs.", review: "Absorbs moisture without scratching. The clip stays put.", audiences: ["for-him","for-parents","for-coworkers"], occasions: ["birthday","thanks"], cat: "outdoor" },
  { name: "Running Belt Slim", price: 15, desc: "Phone, keys, card. No bounce, no chafe. Forget it's there.", review: "Ran a half marathon with this. Phone didn't move an inch.", audiences: ["for-her","for-him","for-friends"], occasions: ["birthday","newyear"], cat: "outdoor" },
  { name: "Picnic Blanket Waterproof", price: 29, desc: "Folds to a tote, unfolds to a table for four. Sand and grass proof.", review: "The backing is truly waterproof. Sat on damp grass, stayed dry.", audiences: ["for-friends","for-parents"], occasions: ["birthday","thanks"], cat: "outdoor" },

  // ===== Toys & Games =====
  { name: "Board Game Strategy Set", price: 39, desc: "For the game night that doesn't end at Monopoly.", review: "Played three rounds straight. The strategy depth is real.", audiences: ["for-friends","for-him","for-her"], occasions: ["christmas","birthday"], cat: "toys" },
  { name: "1000 Piece Puzzle Art", price: 24, desc: "Riverside scene, matte finish. The quiet weekend activity.", review: "Took us four evenings. The satisfaction of the last piece is worth it.", audiences: ["for-parents","for-her","for-friends"], occasions: ["christmas","birthday"], cat: "toys" },
  { name: "Building Blocks Classic", price: 35, desc: "500 pieces, six colors. For the engineer who hasn't retired.", review: "My 8-year-old built a spaceship. My 38-year-old self helped.", audiences: ["for-kids","for-friends"], occasions: ["birthday","christmas"], cat: "toys" },
  { name: "Card Game Party Pack", price: 16, desc: "Three games, 2-8 players. The icebreaker that actually breaks ice.", review: "Played with strangers. We were laughing in five minutes.", audiences: ["for-friends","for-coworkers"], occasions: ["christmas","thanks"], cat: "toys" },
  { name: "Wooden Brain Teaser Set", price: 19, desc: "Six metal and wood puzzles. For the mind that needs a walk.", review: "Some took minutes, one took days. All satisfying to solve.", audiences: ["for-him","for-kids","for-coworkers"], occasions: ["birthday","thanks"], cat: "toys" },
  { name: "RC Stunt Car", price: 32, desc: "Flips, spins, climbs. The remote control car that grew up.", review: "My kid drove it down the stairs. Still works. Sturdy is an understatement.", audiences: ["for-kids"], occasions: ["birthday","christmas"], cat: "toys" },
  { name: "Art Kit for Kids 120pcs", price: 26, desc: "Crayons, markers, paints, paper. The creative explosion in a box.", review: "Everything in one case. My 6-year-old opened it and didn't surface for hours.", audiences: ["for-kids"], occasions: ["birthday","christmas"], cat: "toys" },
  { name: "Stargazing Telescope Entry", price: 79, desc: "70mm aperture, tripod, phone adapter. The moon, up close.", review: "Saw Saturn's rings. My kids thought it was a picture. It wasn't.", audiences: ["for-kids","for-him","for-friends"], occasions: ["birthday","christmas"], cat: "toys" },
  { name: "Jigsaw Puzzle Map World", price: 22, desc: "Vintage world map, 500 pieces. Geography you can touch.", review: "My son now knows where Mongolia is. That's the power of a puzzle.", audiences: ["for-kids","for-parents","for-friends"], occasions: ["birthday","christmas"], cat: "toys" },
  { name: "Magnetic Dart Board", price: 22, desc: "No sharp points, no wall holes. The office tournament starter.", review: "Safer than real darts, almost as satisfying. The magnets stick well.", audiences: ["for-kids","for-coworkers","for-him"], occasions: ["birthday","thanks"], cat: "toys" },

  // ===== Food & Drink =====
  { name: "Gourmet Chocolate Box 24pc", price: 35, desc: "Single-origin, hand-tempered. The box that doesn't last.", review: "The sea salt caramel disappeared first. The dark cherry was my favorite.", audiences: ["for-her","for-parents","for-coworkers"], occasions: ["birthday","thanks","christmas"], cat: "food" },
  { name: "Coffee Bean Sampler 1lb", price: 28, desc: "Three origins, whole bean. For the cup that's never the same.", review: "The Ethiopian blew me away. Blueberry in coffee? Yes.", audiences: ["for-him","for-her","for-friends","for-coworkers"], occasions: ["birthday","thanks"], cat: "food" },
  { name: "Honey Trio Gift Set", price: 24, desc: "Wildflower, clover, buckwheat. Three honeys, three toast moods.", review: "The buckwheat is dark and malty. Never knew honey could taste like this.", audiences: ["for-parents","for-her","for-friends"], occasions: ["thanks","birthday"], cat: "food" },
  { name: "Matcha Powder Ceremonial", price: 32, desc: "First harvest, stone-ground. The green that's actually green.", review: "Froths to a creamy jade. Smooth, no bitterness. Worth the price.", audiences: ["for-her","for-friends"], occasions: ["birthday","thanks"], cat: "food" },
  { name: "Hot Sauce Gift Set", price: 26, desc: "Five small-batch hot sauces. For the one who likes it loud.", review: "The habanero-mango is the best hot sauce I've had this year.", audiences: ["for-him","for-friends","for-parents"], occasions: ["birthday","christmas"], cat: "food" },
  { name: "Tea Sampler Tin Set", price: 29, desc: "Six loose-leaf tins. The shelf looks like a tea shop.", review: "Each tin has its own character. The oolong is my evening ritual.", audiences: ["for-her","for-parents","for-friends"], occasions: ["birthday","thanks"], cat: "food" },
  { name: "Olive Oil Trio", price: 35, desc: "Single-variety, cold-pressed. For the cook who drizzles with intention.", review: "The Frantoio is grassy and peppery. Tastes alive.", audiences: ["for-parents","for-friends","for-coworkers"], occasions: ["thanks","christmas"], cat: "food" },
  { name: "Pasta Making Kit", price: 32, desc: "Roller, cutter, drying rack. Flour becomes dinner.", review: "First batch was ugly but delicious. Third batch was beautiful.", audiences: ["for-her","for-him","for-friends"], occasions: ["birthday","christmas"], cat: "food" },
  { name: "Craft Beer Sampler 12pk", price: 42, desc: "Twelve styles from twelve breweries. The tour without the driving.", review: "The sour was a revelation. Didn't know I liked sours until now.", audiences: ["for-him","for-friends"], occasions: ["birthday","thanks"], cat: "food" },
  { name: "Smoked Salmon Gift Box", price: 45, desc: "Cold-smoked, two sides. The brunch that feels like a hotel.", review: "Silky, smoky, perfectly sliced. With cream cheese on a bagel — heaven.", audiences: ["for-parents","for-her","for-him"], occasions: ["christmas","thanks"], cat: "food" },

  // ===== Art & Decor =====
  { name: "Gallery Wall Frame Set", price: 42, desc: "Five oak frames, mixed sizes. The wall that tells a story.", review: "Hung them in the hallway. The wall went from blank to intentional.", audiences: ["for-her","for-parents","for-friends"], occasions: ["birthday","thanks"], cat: "decor" },
  { name: "Tabletop Easel Stand", price: 19, desc: "Solid beech wood, adjustable. For the art that deserves a stage.", review: "Sturdy, doesn't wobble. Holds my 16x20 canvas perfectly.", audiences: ["for-her","for-friends","for-kids"], occasions: ["birthday","thanks"], cat: "decor" },
  { name: "Brass Desk Lamp Dimmable", price: 48, desc: "Warm LED, touch control. The light that makes work feel less like work.", review: "Three brightness levels. The warmest one is perfect for evenings.", audiences: ["for-him","for-her","for-coworkers"], occasions: ["birthday","thanks"], cat: "decor" },
  { name: "Vinyl Record Frame", price: 22, desc: "Acrylic front, wall-mount. The album cover that's actually art.", review: "Now my favorite record is on the wall. Swapped it monthly.", audiences: ["for-him","for-her","for-friends"], occasions: ["birthday","thanks"], cat: "decor" },
  { name: "Macrame Wall Hanging", price: 28, desc: "Cotton rope, wooden dowel. The texture a blank wall needs.", review: "Boho without being too much. The natural cotton looks organic.", audiences: ["for-her","for-friends","for-parents"], occasions: ["birthday","thanks"], cat: "decor" },
  { name: "Floating Shelf Set of 3", price: 35, desc: "Hidden brackets, solid wood. The clutter that became a display.", review: "Installed in twenty minutes. Holds my books and plants, looks clean.", audiences: ["for-him","for-her","for-parents"], occasions: ["birthday","thanks"], cat: "decor" },
  { name: "Desk Clock Minimalist", price: 32, desc: "Silent sweep, metal frame. The timepiece that doesn't tick.", review: "No ticking sound. The minimalist face is calming on my desk.", audiences: ["for-him","for-coworkers","for-parents"], occasions: ["birthday","thanks"], cat: "decor" },
  { name: "Terrarium Glass Globe", price: 24, desc: "Hang it, fill it. The tiny garden that hangs in the air.", review: "Planted moss and a small fern. It's alive and thriving.", audiences: ["for-her","for-friends","for-parents"], occasions: ["birthday","thanks"], cat: "decor" },
  { name: "Vintage Map Print Framed", price: 29, desc: "1900s world map, distressed finish. The wall that travels.", review: "Quality print on thick paper. The frame is real wood.", audiences: ["for-him","for-parents","for-friends"], occasions: ["birthday","thanks"], cat: "decor" },
  { name: "Ceramic Incense Holder", price: 16, desc: "Hand-glazed, catches ash. For the ritual that smells like calm.", review: "Beautiful glaze, catches every speck of ash. Simple and elegant.", audiences: ["for-her","for-friends","for-parents"], occasions: ["birthday","thanks"], cat: "decor" },

  // ===== Music & Hobbies =====
  { name: "Entry-Level Turntable", price: 99, desc: "Bluetooth, built-in preamp. The record player that started it all.", review: "Sound is warm, setup was easy. My vinyl collection finally has a home.", audiences: ["for-him","for-her","for-friends"], occasions: ["birthday","christmas"], cat: "music" },
  { name: "Kalimba Thumb Piano", price: 25, desc: "17 keys, acacia wood. The instrument you learn in five minutes.", review: "Surprisingly soothing. My daughter and I play it every evening.", audiences: ["for-kids","for-her","for-friends"], occasions: ["birthday","christmas"], cat: "music" },
  { name: "Ukulele Starter Kit", price: 49, desc: "Soprano size, tuner, bag, strings. The happy sound, ready to learn.", review: "Stays in tune after a few days. Sounds bright and cheerful.", audiences: ["for-kids","for-friends","for-her"], occasions: ["birthday","christmas"], cat: "music" },
  { name: "Vinyl Record Cleaning Kit", price: 22, desc: "Brush, fluid, cloth. For the records that sound dusty.", review: "Cleaned my thrift-store finds. Crackle is gone. Worth it.", audiences: ["for-him","for-friends"], occasions: ["birthday","thanks"], cat: "music" },
  { name: "Headphone Stand Aluminum", price: 19, desc: "Solid base, minimal arm. The desk upgrade you didn't know you needed.", review: "Frees up desk space, looks sleek. My headphones have a home now.", audiences: ["for-him","for-coworkers"], occasions: ["birthday","thanks"], cat: "music" },
  { name: "Guitar Capo Steel String", price: 14, desc: "Spring-loaded, no buzz. For the chord changes you can't reach.", review: "Holds firm on every fret. No tuning issues, easy to clip.", audiences: ["for-him","for-friends","for-her"], occasions: ["birthday","thanks"], cat: "music" },
  { name: "Music Sheet Stand Folding", price: 22, desc: "Adjustable, travel bag included. The stand that goes where you go.", review: "Light, sturdy, folds small. Holds a thick binder without tipping.", audiences: ["for-kids","for-her","for-friends"], occasions: ["birthday","thanks"], cat: "music" },
  { name: "Bluetooth Record Adapter", price: 19, desc: "Connects AirPods to your turntable. Wireless vinyl, no cables.", review: "Paired instantly. I can listen to vinyl from across the room.", audiences: ["for-him","for-her","for-friends"], occasions: ["birthday","thanks"], cat: "music" },

  // ===== Pets =====
  { name: "Dog Bed Memory Foam", price: 49, desc: "Orthopedic foam, washable cover. The nap spot they deserve.", review: "My old dog sleeps deeper. The foam actually supports her joints.", audiences: ["for-friends","for-parents","for-her"], occasions: ["birthday","christmas"], cat: "pets" },
  { name: "Cat Tunnel Collapsible", price: 19, desc: "Three tunnels, crinkle paper. The chaos your cat deserves.", review: "My cat runs through it at 3am. She loves it. I've accepted it.", audiences: ["for-friends","for-her","for-kids"], occasions: ["birthday","christmas"], cat: "pets" },
  { name: "Slow Feeder Bowl", price: 16, desc: "Maze pattern, no gulping. The dinner that takes twenty minutes.", review: "My lab used to inhale food in 30 seconds. Now it takes 10 minutes.", audiences: ["for-friends","for-parents"], occasions: ["birthday","thanks"], cat: "pets" },
  { name: "Dog Leash Hands-Free", price: 22, desc: "Belt-worn, bungee cord. Run with your dog, not after.", review: "Hands free for coffee on morning walks. The bungee absorbs pulls.", audiences: ["for-him","for-her","for-friends"], occasions: ["birthday","thanks"], cat: "pets" },
  { name: "Cat Scratching Post Tall", price: 35, desc: "Sisal rope, stable base. The furniture protector.", review: "My cat finally stopped using the couch. The post is sturdy, no tipping.", audiences: ["for-friends","for-her","for-parents"], occasions: ["birthday","thanks"], cat: "pets" },

  // ===== Plants & Garden =====
  { name: "Bonsai Tree Starter Kit", price: 24, desc: "Seeds, pot, scissors, guide. The patience that grows.", review: "Three weeks and I have a sprout. The journey begins.", audiences: ["for-him","for-her","for-friends","for-parents"], occasions: ["birthday","thanks"], cat: "garden" },
  { name: "Herb Garden Kit Indoor", price: 35, desc: "LED grow light, three pods. Basil in your kitchen, all year.", review: "Fresh basil in December. The light is subtle, not an eyesore.", audiences: ["for-her","for-parents","for-friends"], occasions: ["birthday","thanks"], cat: "garden" },
  { name: "Macrame Plant Hanger Set", price: 16, desc: "Cotton rope, four styles. The plants that float.", review: "Simple, boho, and holds my heavy pot without stretching.", audiences: ["for-her","for-friends","for-parents"], occasions: ["birthday","thanks"], cat: "garden" },
  { name: "Self-Watering Planter Pot", price: 19, desc: "Cotton wick, glass reservoir. The plant that waters itself.", review: "Filled it once, plant's been happy for two weeks. No more overwatering.", audiences: ["for-her","for-friends","for-coworkers"], occasions: ["birthday","thanks"], cat: "garden" },
  { name: "Garden Tool Set 9pc", price: 29, desc: "Rustproof, ergonomic handles. For the garden that's finally real.", review: "Tools feel solid, not flimsy. The bag holds everything.", audiences: ["for-parents","for-her","for-friends"], occasions: ["birthday","christmas"], cat: "garden" },

  // ===== Personal Care =====
  { name: "Heated Neck Wrap", price: 28, desc: "Microwaveable, lavender-scented. The tension that melts.", review: "Two minutes in the microwave, twenty minutes of relief. My neck says thank you.", audiences: ["for-her","for-parents","for-friends"], occasions: ["birthday","thanks"], cat: "care" },
  { name: "Acupressure Mat", price: 32, desc: "8,000 points, cotton and plastic. The 20 minutes that reset.", review: "First time was intense. Third time I fell asleep on it.", audiences: ["for-her","for-him","for-friends"], occasions: ["birthday","thanks"], cat: "care" },
  { name: "Foot Spa Bath Massager", price: 55, desc: "Heated, vibration, bubbles. The home pedicure.", review: "After a long run, 15 minutes in this is pure luxury.", audiences: ["for-parents","for-her","for-him"], occasions: ["birthday","christmas"], cat: "care" },
  { name: "Posture Corrector Brace", price: 22, desc: "Adjustable, breathable. The reminder your spine needs.", review: "Wore it for an hour a day. After a week, I sit straighter without it.", audiences: ["for-him","for-her","for-coworkers"], occasions: ["birthday","newyear"], cat: "care" },
  { name: "Massage Gun Mini", price: 49, desc: "Pocket-sized, four heads. The knot that finally let go.", review: "Small but powerful. Hits the spots my foam roller can't.", audiences: ["for-him","for-her","for-friends","for-parents"], occasions: ["birthday","thanks"], cat: "care" },

  // ===== Office & Productivity =====
  { name: "Desk Pad Leather Large", price: 29, desc: "Full-grain, 36x17in. The surface that ties the desk together.", review: "Mouse glides, writing is cushioned. The desk looks intentional now.", audiences: ["for-him","for-her","for-coworkers"], occasions: ["birthday","thanks"], cat: "office" },
  { name: "Monitor Stand Wood", price: 35, desc: "Solid walnut, raises 4 inches. The neck that says thank you.", review: "My neck pain is gone. Plus I got storage space under it.", audiences: ["for-him","for-her","for-coworkers","for-parents"], occasions: ["birthday","thanks"], cat: "office" },
  { name: "Cable Organizer Magnetic", price: 14, desc: "Six magnetic clips, adhesive backing. The desk without snakes.", review: "Stuck them on the desk edge. Cables stay put, finally.", audiences: ["for-him","for-coworkers","for-friends"], occasions: ["birthday","thanks"], cat: "office" },
  { name: "Desk Lamp Wireless Charge", price: 39, desc: "LED, touch dimmer, phone charger built in. The lamp that earns its desk.", review: "Tap to dim, drop phone to charge. One less cable on my desk.", audiences: ["for-him","for-her","for-coworkers"], occasions: ["birthday","thanks"], cat: "office" },
  { name: "Planner 2026 Hardcover", price: 24, desc: "Monthly + weekly, ribbon marker. The year that's organized.", review: "Paper quality is excellent, no bleed. The layout works.", audiences: ["for-her","for-him","for-friends","for-coworkers"], occasions: ["newyear","birthday"], cat: "office" },

  // ===== Travel =====
  { name: "Leather Passport Cover", price: 22, desc: "Full-grain, slim fit. The passport that finally has a home.", review: "Slim, holds passport and two cards. The leather is beautiful.", audiences: ["for-him","for-her","for-friends"], occasions: ["birthday","thanks"], cat: "travel" },
  { name: "Packing Cube Set 4pc", price: 25, desc: "Ripstop nylon, see-through. The suitcase that's organized.", review: "Packed for a week in a carry-on. These cubes are the reason.", audiences: ["for-her","for-friends","for-parents"], occasions: ["birthday","thanks"], cat: "travel" },
  { name: "Neck Pillow Memory Foam", price: 24, desc: "Contoured, washable cover. The flight you don't dread.", review: "Actually slept on a plane. The contour supports without pushing head forward.", audiences: ["for-her","for-him","for-parents","for-friends"], occasions: ["birthday","thanks"], cat: "travel" },
  { name: "Toiletry Bag Hanging", price: 22, desc: "Multiple compartments, waterproof. The kit that stays at your parents' and travels.", review: "Everything visible, nothing spills. Hangs on any towel bar.", audiences: ["for-him","for-her","for-friends"], occasions: ["birthday","thanks"], cat: "travel" },
  { name: "Luggage Scale Digital", price: 14, desc: "Pocket-sized, 110lb capacity. The fee you never pay again.", review: "Weighed my bag at 49.8lb. Airline scale said 49.9lb. Accurate enough.", audiences: ["for-parents","for-him","for-friends"], occasions: ["birthday","thanks"], cat: "travel" },
];

// ---------- 颜色/材质变体（用于增加多样性） ----------
const VARIANTS = [
  "", " Matte Black", " Walnut", " Oak", " Cream", " Sage Green", " Terracotta",
  " Navy", " Charcoal", " Sand", " Blush", " Copper", " Brass", " Natural",
  " White", " Graphite", " Amber", " Slate", " Ivory", " Olive",
];

// ---------- 图片 prompt 模板 ----------
function getImagePrompt(name, cat) {
  const catScenes = {
    tech: "on a clean wooden desk, warm morning light, editorial product photography",
    home: "on a cream linen surface, soft natural light, editorial still life",
    kitchen: "on a marble counter, steam, warm light, editorial food photography",
    fashion: "on a cream background, soft shadows, editorial fashion photography",
    beauty: "on a stone surface, soft diffused light, editorial beauty photography",
    stationery: "on a wooden desk, warm light, flat lay editorial photography",
    outdoor: "on a rocky surface, golden hour light, editorial outdoor photography",
    toys: "on a cream surface, bright soft light, editorial product photography",
    food: "on a wooden board, rustic styling, editorial food photography",
    decor: "on a white shelf, soft natural light, editorial interior photography",
    music: "on a wooden surface, warm moody light, editorial product photography",
    pets: "on a cream surface, soft light, editorial pet product photography",
    garden: "on a wooden table, natural sunlight, editorial garden photography",
    care: "on a bathroom shelf, soft spa light, editorial wellness photography",
    office: "on a clean desk, warm light, editorial desk product photography",
    travel: "on a cream surface, soft shadows, editorial travel product photography",
  };
  const scene = catScenes[cat] || "editorial product photography, warm tones";
  return `${name.toLowerCase()}, ${scene}`;
}

function imageUrl(name, cat) {
  const prompt = encodeURIComponent(getImagePrompt(name, cat));
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${prompt}&image_size=landscape_4_3`;
}

function amazonUrl(name) {
  return `https://www.amazon.com/s?k=${encodeURIComponent(name)}`;
}

function priceRange(price) {
  if (price < 30) return "cheap";
  if (price < 75) return "mid";
  return "high";
}

// ---------- 生成 1000 条商品 ----------
function generateProducts() {
  const products = [];
  let id = 0;

  // 1. 基础模板（~250 条）
  for (const t of TEMPLATES) {
    products.push({
      name: t.name,
      price: t.price,
      image_url: imageUrl(t.name, t.cat),
      affiliate_url: amazonUrl(t.name),
      asin: null,
      audience_tags: t.audiences,
      occasion_tags: t.occasions,
      price_range: priceRange(t.price),
      description: t.desc,
      review_quote: t.review,
    });
    id++;
  }

  // 2. 加颜色/材质变体（~400 条）
  for (const t of TEMPLATES) {
    for (const v of VARIANTS.slice(1, 9)) {
      if (products.length >= 650) break;
      const variantName = `${t.name}${v}`;
      const priceAdj = Math.round(t.price * (0.9 + Math.random() * 0.3));
      products.push({
        name: variantName,
        price: priceAdj,
        image_url: imageUrl(variantName, t.cat),
        affiliate_url: amazonUrl(variantName),
        asin: null,
        audience_tags: t.audiences,
        occasion_tags: t.occasions,
        price_range: priceRange(priceAdj),
        description: t.desc,
        review_quote: t.review,
      });
      id++;
    }
  }

  // 3. 价格点变体（~150 条）—— 同商品不同价格区间
  const priceVariations = [
    { suffix: " Deluxe", mul: 1.5 },
    { suffix: " Pro", mul: 1.8 },
    { suffix: " Mini", mul: 0.7 },
    { suffix: " Value Pack", mul: 1.3 },
  ];
  for (const t of TEMPLATES) {
    for (const pv of priceVariations) {
      if (products.length >= 800) break;
      const vName = `${t.name}${pv.suffix}`;
      const vPrice = Math.round(t.price * pv.mul);
      products.push({
        name: vName,
        price: vPrice,
        image_url: imageUrl(vName, t.cat),
        affiliate_url: amazonUrl(vName),
        asin: null,
        audience_tags: t.audiences,
        occasion_tags: t.occasions,
        price_range: priceRange(vPrice),
        description: t.desc,
        review_quote: t.review,
      });
    }
  }

  // 4. 补充到 1000 条 —— 组合扩展
  const extraOccasions = ["birthday", "christmas", "anniversary", "thanks", "wedding", "newyear"];
  const extraAudiences = ["for-him", "for-her", "for-kids", "for-parents", "for-friends", "for-coworkers"];
  while (products.length < 1000) {
    const t = TEMPLATES[products.length % TEMPLATES.length];
    const suffix = VARIANTS[products.length % VARIANTS.length];
    const vName = suffix ? `${t.name}${suffix} Edition ${Math.floor(products.length / TEMPLATES.length)}` : `${t.name} Edition ${Math.floor(products.length / TEMPLATES.length)}`;
    const vPrice = Math.max(9, Math.round(t.price * (0.6 + Math.random() * 1.4)));
    // 随机分配不同的 audience/occasion 组合
    const audIdx = products.length % extraAudiences.length;
    const occIdx = products.length % extraOccasions.length;
    products.push({
      name: vName,
      price: vPrice,
      image_url: imageUrl(vName, t.cat),
      affiliate_url: amazonUrl(vName),
      asin: null,
      audience_tags: [extraAudiences[audIdx], ...(products.length % 3 === 0 ? [extraAudiences[(audIdx + 1) % extraAudiences.length]] : [])],
      occasion_tags: [extraOccasions[occIdx], ...(products.length % 4 === 0 ? [extraOccasions[(occIdx + 1) % extraOccasions.length]] : [])],
      price_range: priceRange(vPrice),
      description: t.desc,
      review_quote: t.review,
    });
  }

  return products.slice(0, 1000);
}

// ---------- SQL 转义 ----------
function sqlEscape(str) {
  return str.replace(/'/g, "''");
}

function sqlArray(arr) {
  return `ARRAY[${arr.map((s) => `'${sqlEscape(s)}'`).join(",")}]::text[]`;
}

// ---------- 生成 SQL 文件 ----------
function main() {
  console.log("Generating 1000 products...");
  const products = generateProducts();
  console.log(`Generated ${products.length} products`);

  // 生成 SQL —— 每 50 条一批 INSERT
  let sql = "-- 清空旧数据\nDELETE FROM public.products;\n\n";

  const BATCH = 50;
  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH);
    sql += `INSERT INTO public.products (name, price, image_url, affiliate_url, asin, audience_tags, occasion_tags, price_range, description, review_quote) VALUES\n`;
    const values = batch.map((p) => {
      return `  ('${sqlEscape(p.name)}', ${p.price}, '${sqlEscape(p.image_url)}', '${sqlEscape(p.affiliate_url)}', NULL, ${sqlArray(p.audience_tags)}, ${sqlArray(p.occasion_tags)}, '${p.price_range}', '${sqlEscape(p.description)}', '${sqlEscape(p.review_quote)}')`;
    });
    sql += values.join(",\n") + ";\n\n";
  }

  writeFileSync("supabase/seed-1000.sql", sql);
  console.log(`\nDone! SQL written to supabase/seed-1000.sql`);
  console.log(`File size: ~${Math.round(sql.length / 1024)}KB`);
  console.log(`\n请去 Supabase SQL Editor 执行这个文件里的 SQL。`);
}

main();
