// Real photography, served from Pexels' CDN at the sizes we actually render.
export const px = (id: number, w = 800, h = 800) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;

/** Device / pack shots */
export const DEVICES = [
  19344605, 23319711, 17962164, 17962166, 17962165, 17962161, 17962162, 23319716, 5387722, 13749583,
];

/** Vapour + lifestyle */
export const LIFESTYLE = [
  3545426, 10168764, 1005486, 16671499, 39311714, 11186419, 9694694, 9665183,
];

/** Bottles */
export const BOTTLES = [
  13870345, 13870346, 17605539, 31968682, 35667405, 35667393, 35667391, 23319716,
];

/** Flavour art, keyed by flavour slug */
export const FLAVOUR_ART: Record<string, { hex: string; art: number[] }> = {
  "Blue Razz Ice": { hex: "#3f63d8", art: [2539517, 39398905] },
  "Watermelon Chill": { hex: "#e0455c", art: [7676949, 6138075] },
  "Mango Frost": { hex: "#ef9b23", art: [7543554, 31968682] },
  "Grape Storm": { hex: "#7a4fbf", art: [9996338, 5923050] },
  "Strawberry Kiwi": { hex: "#dd3557", art: [7676959, 2064359] },
  "Mint Mojito": { hex: "#31b98a", art: [12018247, 8679539] },
  "Cola Cube": { hex: "#8a4b2a", art: [9665183, 11186419] },
  "Peach Iced Tea": { hex: "#ec8a55", art: [1141626, 2698886] },
  "Lychee Frost": { hex: "#e6c9ae", art: [5256472, 8268996] },
  "Banana Ice": { hex: "#e9c53f", art: [6422053, 8682527] },
  "Cherry Bomb": { hex: "#bf2138", art: [39228940, 4179287] },
  "Pineapple Twist": { hex: "#e5b620", art: [7676956, 5256495] },
  "Bubblegum Cloud": { hex: "#ee7bad", art: [6138075, 9694694] },
  "Cool Menthol": { hex: "#5fc9de", art: [38441767, 39398905] },
  "Lemon Sherbet": { hex: "#e8cd3a", art: [7676956, 12018247] },
  "Guava Splash": { hex: "#ef6f86", art: [2064359, 35667393] },
  "Raspberry Punch": { hex: "#ac2450", art: [33651543, 39228940] },
  "Vanilla Custard": { hex: "#dcc093", art: [13870346, 17605539] },
  "Coffee Cream": { hex: "#8a5c3a", art: [35667391, 9665183] },
  "Blueberry Muffin": { hex: "#5968bd", art: [5923050, 2539517] },
};

export const HERO = {
  collageA: px(19344605, 900, 1200),
  collageB: px(17962166, 800, 800),
  collageC: px(3545426, 900, 700),
  neonSign: px(15410593, 1200, 800),
  shelf: px(23319716, 1200, 900),
  bottles: px(13870345, 1200, 900),
  mint: px(12018247, 1000, 1000),
  smoke: px(6138075, 1400, 900),
  studio: px(16671499, 1000, 1200),
  mod: px(5387722, 1000, 1000),
};

export const flavourArt = (flavour: string, i: number) =>
  (FLAVOUR_ART[flavour] ?? FLAVOUR_ART["Cool Menthol"]).art[i % 2];
