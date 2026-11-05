import { BOTTLES, DEVICES, FLAVOUR_ART, LIFESTYLE, flavourArt, px } from "./media";

/* ------------------------------------------------------------------ */
/* deterministic randomness so the shop looks identical on every load  */
/* ------------------------------------------------------------------ */
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = <T,>(rnd: () => number, arr: T[]) => arr[Math.floor(rnd() * arr.length) % arr.length];
const money = (n: number) => Math.max(49, Math.round(n / 10) * 10 - 1);
export const inr = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

export type Category =
  | "Disposables"
  | "Pod Kits"
  | "E-Liquids"
  | "Mods & Tanks"
  | "Zero Nicotine"
  | "Accessories";

export const CATEGORIES: Category[] = [
  "Disposables",
  "Pod Kits",
  "E-Liquids",
  "Mods & Tanks",
  "Zero Nicotine",
  "Accessories",
];

export const BRANDS = [
  "Elfbar", "Geek Bar", "Lost Mary", "Vozol", "SKE Crystal", "RAZ", "Oxbar",
  "Funky Republic", "Waka", "Airscream", "Smok", "Vaporesso", "Uwell", "Voopoo",
  "Nasty Juice", "Naked 100", "Dinner Lady", "IVG", "Salt Nic Co.", "Blu",
];

export const FLAVOURS = Object.keys(FLAVOUR_ART);

/** hardware lines, kept with the brands that actually make them */
const MODELS_BY: Record<string, string[]> = {
  Uwell: ["Caliburn G3", "Wenax M1", "Aegiro Pod"],
  Vaporesso: ["Xros 4 Nano", "Luxe Q2", "Gen Fit 40", "Zero V2"],
  Voopoo: ["Drag X2", "Vinci Pod Royal", "Argus P1"],
  Smok: ["Nord 5", "Novo 5", "Pulse AIO", "Fetch Pro"],
  Airscream: ["Rokkit Pod", "Mini Kit"],
  "Lost Mary": ["BM600 Kit", "Marypad"],
  Vozol: ["Gear Power", "Switch X"],
  Elfbar: ["ELFA Pro", "Mate 500"],
};
const KIT_BRANDS = Object.keys(MODELS_BY);
const MOD_SERIES = ["Vector", "Titan", "Forge", "Onyx", "Raptor", "Apex", "Nebula"];
const LIQUID_BRANDS = ["Nasty Juice", "Naked 100", "Dinner Lady", "IVG", "Salt Nic Co.", "Blu", "Elfbar", "Lost Mary"];

const ACCESSORIES = [
  "USB-C Fast Charge Cable 1.2m",
  "Mesh Replacement Coils · 5 pack",
  "Lanyard + Drip Tip Set",
  "Food-Grade Silicone Sleeve",
  "Empty Pod Cartridges · 2 pack",
  "18650 Cell 3000mAh · 2 pack",
  "Hard Shell Travel Case",
  "Coil Priming & Cleaning Kit",
];

export type Review = {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified: boolean;
  helpful: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: Category;
  flavour: string;
  nicotine: number;
  puffs: number;
  price: number;
  mrp: number;
  rating: number;
  reviewCount: number;
  stock: number;
  badge?: string;
  daysOld: number;
  views: number;
  colour: string;
  images: string[];
  blurb: string;
  specs: { k: string; v: string }[];
  tags: string[];
};

const RANGE: Record<Category, [number, number]> = {
  Disposables: [68, 0],
  "Pod Kits": [26, 68],
  "E-Liquids": [30, 94],
  "Mods & Tanks": [12, 124],
  "Zero Nicotine": [12, 136],
  Accessories: [8, 148],
};

function buildCatalogue(): Product[] {
  const out: Product[] = [];
  const total = Object.values(RANGE).reduce((s, [n]) => s + n, 0);

  for (let i = 0; i < total; i++) {
    const rnd = mulberry32(i * 7919 + 13);
    const category = (Object.keys(RANGE) as Category[]).find((c) => {
      const [, start] = RANGE[c];
      const [count] = RANGE[c];
      return i >= start && i < start + count;
    }) ?? "Disposables";

    const hardware = category === "Pod Kits" || category === "Mods & Tanks";
    const liquid = category === "E-Liquids" || category === "Zero Nicotine";
    const brand = hardware
      ? KIT_BRANDS[(i * 3 + 1) % KIT_BRANDS.length]
      : liquid
        ? LIQUID_BRANDS[(i * 5 + 2) % LIQUID_BRANDS.length]
        : BRANDS[(i * 7 + (category === "Accessories" ? 3 : 0)) % BRANDS.length];
    const flavour = FLAVOURS[(i * 13 + 5) % FLAVOURS.length];
    const model =
      category === "Mods & Tanks"
        ? `${MOD_SERIES[(i * 3 + 1) % MOD_SERIES.length]} ${[80, 100, 177, 200][i % 4]}W`
        : category === "Pod Kits"
          ? MODELS_BY[brand][(i * 2 + 1) % MODELS_BY[brand].length]
          : "";
    const colour = FLAVOUR_ART[flavour].hex;

    const puffs = [600, 1200, 2000, 4000, 6000, 8000, 10000, 15000][Math.floor(rnd() * 8)];
    const nicotine = category === "Zero Nicotine" ? 0 : pick(rnd, [2, 3, 5, 5, 6]);

    let name: string;
    let price: number;
    let images: string[];

    if (category === "Disposables") {
      name = `${brand} ${flavour} · ${puffs.toLocaleString()} Puffs`;
      price = money(299 + puffs * 0.085 + rnd() * 260);
      images = [
        px(DEVICES[i % DEVICES.length], 800, 800),
        px(flavourArt(flavour, 0), 800, 800),
        px(LIFESTYLE[(i + 3) % LIFESTYLE.length], 800, 800),
      ];
    } else if (category === "Pod Kits") {
      name = `${brand} ${model} Pod Kit`;
      price = money(1249 + rnd() * 2300);
      images = [
        px(DEVICES[(i + 4) % DEVICES.length], 800, 800),
        px(LIFESTYLE[(i + 1) % LIFESTYLE.length], 800, 800),
        px(flavourArt(flavour, 1), 800, 800),
      ];
    } else if (category === "E-Liquids") {
      name = `${brand} ${flavour} Salt Nic · 30ml`;
      price = money(329 + rnd() * 520);
      images = [
        px(BOTTLES[i % BOTTLES.length], 800, 800),
        px(flavourArt(flavour, 0), 800, 800),
        px(BOTTLES[(i + 3) % BOTTLES.length], 800, 800),
      ];
    } else if (category === "Mods & Tanks") {
      name = `${brand} ${model} Box Mod`;
      price = money(2399 + rnd() * 4600);
      images = [
        px(DEVICES[(i + 7) % DEVICES.length], 800, 800),
        px(DEVICES[(i + 2) % DEVICES.length], 800, 800),
        px(LIFESTYLE[(i + 5) % LIFESTYLE.length], 800, 800),
      ];
    } else if (category === "Zero Nicotine") {
      name = `${brand} ${flavour} · 0% Nicotine`;
      price = money(389 + rnd() * 520);
      images = [
        px(flavourArt(flavour, 0), 800, 800),
        px(DEVICES[(i + 5) % DEVICES.length], 800, 800),
        px(LIFESTYLE[(i + 6) % LIFESTYLE.length], 800, 800),
      ];
    } else {
      name = ACCESSORIES[i % ACCESSORIES.length];
      price = money(129 + rnd() * 780);
      images = [
        px(BOTTLES[(i + 5) % BOTTLES.length], 800, 800),
        px(DEVICES[(i + 6) % DEVICES.length], 800, 800),
        px(LIFESTYLE[(i + 2) % LIFESTYLE.length], 800, 800),
      ];
    }

    const mrp = money(price * (1.18 + rnd() * 0.45));
    const rating = Math.round((3.5 + rnd() * 1.5) * 10) / 10;
    const stockRoll = rnd();

    const badge =
      i % 9 === 0 ? "Bestseller" :
      i % 11 === 3 ? "New Drop" :
      i % 13 === 7 ? "Limited" :
      i % 17 === 5 ? "Staff Pick" : undefined;

    const slug =
      name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + (1000 + i);

    out.push({
      id: `V4U-${1000 + i}`,
      slug,
      name,
      brand,
      category,
      flavour: category === "Accessories" ? "N/A" : flavour,
      nicotine,
      puffs: category === "Disposables" || category === "Zero Nicotine" ? puffs : 0,
      price,
      mrp,
      rating: Math.min(5, rating),
      reviewCount: 14 + Math.floor(rnd() * 940),
      stock: stockRoll > 0.965 ? 0 : stockRoll > 0.88 ? 2 + Math.floor(rnd() * 6) : 18 + Math.floor(rnd() * 190),
      badge: stockRoll > 0.88 && !badge ? "Low Stock" : badge,
      daysOld: Math.floor(rnd() * 210),
      views: 40 + Math.floor(rnd() * 900),
      colour,
      images,
      blurb: BLURBS[category](brand, flavour, puffs, nicotine),
      specs: SPECS[category](brand, flavour, puffs, nicotine, model),
      tags: [category, brand, flavour].filter(Boolean),
    });
  }
  return out;
}

const BLURBS: Record<Category, (b: string, f: string, p: number, n: number) => string> = {
  Disposables: (b, f, p, n) =>
    `${b}'s ${f} draw, sealed and draw-activated — ${p.toLocaleString()} puffs of consistent flavour with a ${n}% salt-nic hit. No buttons, no refills, no mess.`,
  "Pod Kits": (b, _f, _p, _n) =>
    `The ${b} pod platform: USB-C fast charge, mesh coil head and a leak-guarded cartridge you can swap in two seconds.`,
  "E-Liquids": (b, f, _p, n) =>
    `${f} blended by ${b} at ${n}% nicotine salt — smooth on the throat, steeped for 14 days before bottling.`,
  "Mods & Tanks": (b, _f, _p, _n) =>
    `${b}'s regulated box mod with a full-colour readout, five safety cut-offs and rebuildable-friendly 510 threading.`,
  "Zero Nicotine": (b, f, p) =>
    `${f} with 0% nicotine — ${p.toLocaleString()} puffs of flavour only. Built by ${b} for people who want the ritual, not the chemical.`,
  Accessories: (_b, _f, _p, _n) =>
    `Genuine spare part, batch-tested and shipped in recycled packaging. Keep your kit running instead of binning it.`,
};

const SPECS: Record<Category, (b: string, f: string, p: number, n: number, m: string) => { k: string; v: string }[]> = {
  Disposables: (b, f, p, n) => [
    { k: "Brand", v: b }, { k: "Flavour", v: f },
    { k: "Puff count", v: `${p.toLocaleString()}` }, { k: "Nicotine", v: `${n}% salt nic` },
    { k: "Battery", v: "550 mAh · USB-C" }, { k: "Coil", v: "Mesh 1.0Ω" },
    { k: "E-liquid", v: "10 ml pre-filled" }, { k: "Origin", v: "Shenzhen, CN" },
  ],
  "Pod Kits": (b, f, _p, n, m) => [
    { k: "Brand", v: b }, { k: "Model", v: m }, { k: "Pod flavour", v: f },
    { k: "Nicotine range", v: `${n}% (refillable)` }, { k: "Battery", v: "900 mAh" },
    { k: "Charge", v: "USB-C · 45 min" }, { k: "Coil", v: "Mesh 0.8Ω / 1.2Ω" },
    { k: "Warranty", v: "90 days" },
  ],
  "E-Liquids": (b, f, p, n) => [
    { k: "Brand", v: b }, { k: "Flavour", v: f }, { k: "Volume", v: "30 ml" },
    { k: "Nicotine", v: `${n}% salt` }, { k: "VG / PG", v: `${p > 4000 ? "70 / 30" : "50 / 50"}` },
    { k: "Steep", v: "14 days" }, { k: "Bottle", v: "Child-resistant dropper" },
    { k: "Batch", v: "Lab-tested" },
  ],
  "Mods & Tanks": (b, f, _p, n, m) => [
    { k: "Brand", v: b }, { k: "Model", v: m }, { k: "Output", v: `${m.split(" ").pop() ?? "200W"} max` },
    { k: "Cells", v: "2 × 18650 (sold apart)" }, { k: "Tank", v: "5.5 ml bubble glass" },
    { k: "Coil", v: `${f === "N/A" ? "0.15Ω mesh" : "0.2Ω mesh"}` }, { k: "Display", v: '0.96" TFT' },
    { k: "Safety", v: `${n || 5} cut-offs` },
  ],
  "Zero Nicotine": (b, f, p, _n) => [
    { k: "Brand", v: b }, { k: "Flavour", v: f }, { k: "Nicotine", v: "0.00%" },
    { k: "Puff count", v: `${p.toLocaleString()}` }, { k: "Battery", v: "500 mAh" },
    { k: "Coil", v: "Mesh 1.2Ω" }, { k: "E-liquid", v: "8 ml" }, { k: "Origin", v: "Shenzhen, CN" },
  ],
  Accessories: (b) => [
    { k: "Fits", v: `${b} devices` }, { k: "Material", v: "Food-grade / anodised" },
    { k: "In the box", v: "1 unit + card" }, { k: "Warranty", v: "30 days" },
    { k: "Packaging", v: "Recycled board" }, { k: "SKU family", v: "V4U-ACC" },
  ],
};

/* ------------------------------------------------------------------ */
/* reviews                                                             */
/* ------------------------------------------------------------------ */
const REVIEWERS = [
  "Aarav M.", "Zoya K.", "Rohit S.", "Ishita B.", "Kabir D.", "Meera N.", "Dev P.",
  "Sanya R.", "Tanvi J.", "Imran Q.", "Nikhil V.", "Priya L.", "Farhan A.", "Ritika G.",
  "Aditya W.", "Sneha T.", "Yash C.", "Ananya H.", "Vikram E.", "Noor F.",
  "Marcus T.", "Elena V.", "Jae-won P.", "Tomas R.", "Aisha B.", "Leo D.",
];

const REVIEW_TITLES: Record<number, string[]> = {
  5: ["Exactly as described", "Second order already", "Flavour is unreal", "Best in this price band", "Zero leaks so far"],
  4: ["Solid, minor nitpick", "Good draw, average battery", "Tasty but sweet", "Worth the money", "Would buy again"],
  3: ["It's fine", "Middle of the road", "Okay for the price", "Mixed feelings"],
  2: ["Burnt after a week", "Weaker than expected", "Not my flavour"],
  1: ["Dead on arrival", "Never reached full charge"],
};

const REVIEW_BODY: Record<number, string[]> = {
  5: [
    "The {f} note lands clean on the inhale and stays consistent right to the last puff. Packaging was sealed, box was unmarked, delivery in two days.",
    "I've been through four {b} units and this is the best batch. Mesh coil does the heavy lifting — no dry hits at all.",
    "Genuinely impressed. Throat hit matches the {n}% on the label instead of overselling it like half these brands do.",
    "Ordered at 11pm, had it by Thursday. Coil still tastes like day one and I'm a heavy user.",
  ],
  4: [
    "Flavour is great, battery is average — I top it up once a day with the {n}% strength. Would still repurchase.",
    "{b} has improved a lot. Slight sweetness at the tail end of {f} but nothing that ruins it.",
    "Good kit. Docking one star because the pod seal took a few days to settle, then it was fine.",
  ],
  3: [
    "Perfectly okay. {f} tastes a little flatter than the description suggests, but the draw is smooth.",
    "Middle of the pack. Does the job, nothing memorable. Price is fair for what you get.",
  ],
  2: [
    "Coil started tasting burnt around 60% through. Support replaced it, so credit where due, but it was a hassle.",
    "Expected more from {b} at this price point. {f} is quite artificial.",
  ],
  1: [
    "Unit never held a charge past two hours. Refund processed quickly at least.",
    "Arrived with a cracked mouthpiece. One star for QC, five stars for the returns team.",
  ],
};

const cache = new Map<string, Review[]>();

export function reviewsFor(p: Product): Review[] {
  const hit = cache.get(p.id);
  if (hit) return hit;
  const count = 3 + Math.floor(mulberry32(p.id.length * 977 + p.price)() * 4);
  const list: Review[] = [];
  for (let i = 0; i < count; i++) {
    const rnd = mulberry32(p.price * 31 + i * 7919 + p.reviewCount);
    const r = p.rating >= 4.6 ? 5 : p.rating >= 4.1 ? (rnd() > 0.3 ? 5 : 4) : p.rating >= 3.7 ? Math.round(3 + rnd() * 2) : 2 + Math.round(rnd());
    const rating = Math.max(1, Math.min(5, r));
    const body = pick(rnd, REVIEW_BODY[rating])
      .replace("{f}", p.flavour === "N/A" ? "this" : p.flavour)
      .replace("{b}", p.brand)
      .replace("{n}", String(p.nicotine));
    list.push({
      id: `${p.id}-r${i}`,
      author: pick(rnd, REVIEWERS),
      rating,
      date: new Date(Date.now() - Math.floor(rnd() * 120) * 86400000).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      }),
      title: pick(rnd, REVIEW_TITLES[rating]),
      body,
      verified: rnd() > 0.18,
      helpful: Math.floor(rnd() * 96),
    });
  }
  cache.set(p.id, list);
  return list;
}

export function ratingSplit(p: Product) {
  const base = p.rating;
  const five = Math.round(((base - 2.6) / 2.4) * 88);
  const four = Math.max(2, Math.round((5 - Math.abs(base - 4.3)) * 3.2));
  const three = Math.max(1, Math.round((5 - base) * 2.4));
  const two = Math.max(0, Math.round((5 - base) * 1.1));
  const one = Math.max(0, Math.round((5 - base) * 0.7));
  const sum = five + four + three + two + one || 1;
  return [5, 4, 3, 2, 1].map((star, i) => ({
    star,
    pct: Math.round(([five, four, three, two, one][i] / sum) * 100),
  }));
}

/* ------------------------------------------------------------------ */
/* catalogue + collections                                             */
/* ------------------------------------------------------------------ */
export const PRODUCTS: Product[] = buildCatalogue();

export const bySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);

export function related(p: Product, n = 6) {
  const same = PRODUCTS.filter((x) => x.id !== p.id && x.category === p.category);
  const flavourMatch = same.filter((x) => x.flavour === p.flavour);
  const rest = same.filter((x) => x.flavour !== p.flavour);
  return [...flavourMatch, ...rest].slice(0, n);
}

export type Collection = {
  id: string;
  title: string;
  kicker: string;
  copy: string;
  image: string;
  query: Partial<{ category: Category; maxPrice: number; tag: string }>;
  accent: string;
};

export const COLLECTIONS: Collection[] = [
  {
    id: "disposable-drop",
    title: "The Disposable Drop",
    kicker: "68 devices",
    copy: "Draw-activated, pre-filled, gone in a fortnight. Twenty flavours across every puff count we stock.",
    image: px(19344605, 900, 1100),
    query: { category: "Disposables" },
    accent: "#0e5c43",
  },
  {
    id: "pod-lab",
    title: "Pod Kits & Mods",
    kicker: "Refillable",
    copy: "Mesh coils, USB-C fast charge, replaceable cartridges. The kit that stops you buying disposables forever.",
    image: px(5387722, 900, 1100),
    query: { category: "Pod Kits" },
    accent: "#ef4b23",
  },
  {
    id: "eliquid",
    title: "The E-Liquid Lab",
    kicker: "30 bottles",
    copy: "Salt nic at 2%, 3%, 5% and 6%. Steeped 14 days, batch-tested, child-resistant everything.",
    image: px(13870345, 900, 1100),
    query: { category: "E-Liquids" },
    accent: "#7a4fbf",
  },
  {
    id: "zero",
    title: "Zero Nicotine Club",
    kicker: "0.00% nic",
    copy: "All flavour, none of the chemical. The off-ramp our regulars actually use.",
    image: px(12018247, 900, 1100),
    query: { category: "Zero Nicotine" },
    accent: "#31b98a",
  },
  {
    id: "under999",
    title: "Everything Under ₹999",
    kicker: "Budget shelf",
    copy: "Small money, real stock. Disposables, bottles and spares that don't need a savings plan.",
    image: px(23319716, 900, 1100),
    query: { maxPrice: 999 },
    accent: "#f2b33d",
  },
  {
    id: "spares",
    title: "Coils, Pods & Spares",
    kicker: "Keep it running",
    copy: "Mesh coils, cartridges, cells, cases. Fix it instead of binning it.",
    image: px(17605539, 900, 1100),
    query: { category: "Accessories" },
    accent: "#5c6b63",
  },
];

export const TESTIMONIALS = [
  {
    quote:
      "Ordered a Crystal Bar at 11pm, it landed Thursday morning, sealed box, correct batch code. This is how it's supposed to work.",
    name: "Rohit S.",
    city: "Pune",
    rating: 5,
    bought: "SKE Crystal · Mango Frost",
  },
  {
    quote:
      "I came for disposables and left with a refillable pod kit because the chat agent talked me out of the worse purchase. Rare.",
    name: "Zoya K.",
    city: "Bengaluru",
    rating: 5,
    bought: "Uwell Caliburn G3",
  },
  {
    quote:
      "The 0% nicotine shelf is the reason I still shop here. Flavour without the thing I was trying to quit.",
    name: "Marcus T.",
    city: "Goa",
    rating: 4,
    bought: "Naked 100 · Lavender Air 0%",
  },
  {
    quote:
      "One coil arrived burnt. Photographed it, refund was in my account before the courier picked the parcel back up.",
    name: "Ishita B.",
    city: "Delhi NCR",
    rating: 5,
    bought: "Mesh Coils · 5 pack",
  },
];

export const RED_FLAGS = [
  {
    t: "Pay-first, no order page",
    d: "A real store creates an order record before money moves. This one asked for cash into a personal UPI handle with no invoice, no GST number, no order ID.",
  },
  {
    t: "Personal UPI ID for a 'company'",
    d: "8384062696@fam is a person, not a merchant. Registered businesses collect on a VPA tied to a current account or a payment gateway.",
  },
  {
    t: "Impossible catalogue depth",
    d: "156 SKUs, every brand, every flavour, all 'in stock' — a dropship front with photos scraped from stock libraries.",
  },
  {
    t: "No age verification that bites",
    d: "A self-declared 21+ popup is theatre. Legitimate nicotine sellers verify with ID and block under-age delivery at the courier.",
  },
  {
    t: "Urgency stacked on urgency",
    d: "Countdown timers, 'low stock', live-viewer counters. All fake, all designed to stop you reading the small print.",
  },
  {
    t: "No address, no helpline, no returns policy",
    d: "Nothing on the site could be used to find the seller again tomorrow morning.",
  },
];

export const FACTS = [
  { n: "21+", l: "legal purchase age in most Indian states" },
  { n: "1 in 5", l: "teen vape users show nicotine-dependence symptoms" },
  { n: "₹0", l: "was actually taken from you just now" },
  { n: "1930", l: "UPI fraud complaints filed every day in India" },
];
