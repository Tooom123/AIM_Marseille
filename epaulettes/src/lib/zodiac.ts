export const ZODIAC_SIGNS = [
  "Bélier", "Taureau", "Gémeaux", "Cancer", "Lion", "Vierge",
  "Balance", "Scorpion", "Sagittaire", "Capricorne", "Verseau", "Poissons",
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

/** Bornes de début de chaque signe : [mois (1-12), jour]. */
const BOUNDS: { sign: ZodiacSign; from: [number, number] }[] = [
  { sign: "Capricorne", from: [12, 22] },
  { sign: "Sagittaire", from: [11, 22] },
  { sign: "Scorpion", from: [10, 23] },
  { sign: "Balance", from: [9, 23] },
  { sign: "Vierge", from: [8, 23] },
  { sign: "Lion", from: [7, 23] },
  { sign: "Cancer", from: [6, 21] },
  { sign: "Gémeaux", from: [5, 21] },
  { sign: "Taureau", from: [4, 20] },
  { sign: "Bélier", from: [3, 21] },
  { sign: "Poissons", from: [2, 19] },
  { sign: "Verseau", from: [1, 20] },
];

/** Signe déduit d'une date (ISO `YYYY-MM-DD` ou `Date`). */
export function signFromDate(input: string | Date): ZodiacSign | null {
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return null;
  const m = d.getMonth() + 1;
  const day = d.getDate();
  for (const { sign, from } of BOUNDS) {
    if (m > from[0] || (m === from[0] && day >= from[1])) return sign;
  }
  // Avant le 20 janvier : on reste dans le Capricorne de l'année précédente.
  return "Capricorne";
}

export const ZODIAC_SYMBOL: Record<ZodiacSign, string> = {
  "Bélier": "♈", "Taureau": "♉", "Gémeaux": "♊", "Cancer": "♋",
  "Lion": "♌", "Vierge": "♍", "Balance": "♎", "Scorpion": "♏",
  "Sagittaire": "♐", "Capricorne": "♑", "Verseau": "♒", "Poissons": "♓",
};

/** Élément du signe : sert à colorer le badge. */
export const ZODIAC_ELEMENT: Record<ZodiacSign, "feu" | "terre" | "air" | "eau"> = {
  "Bélier": "feu", "Lion": "feu", "Sagittaire": "feu",
  "Taureau": "terre", "Vierge": "terre", "Capricorne": "terre",
  "Gémeaux": "air", "Balance": "air", "Verseau": "air",
  "Cancer": "eau", "Scorpion": "eau", "Poissons": "eau",
};

export const ELEMENT_COLOR: Record<"feu" | "terre" | "air" | "eau", string> = {
  feu: "#F6577C", terre: "#8C9B5A", air: "#25C7D9", eau: "#5B8DEF",
};

/** Deux ou trois mots, pour habiller une carte de profil sans se prendre au sérieux. */
export const ZODIAC_TRAIT: Record<ZodiacSign, string> = {
  "Bélier": "fonce d'abord", "Taureau": "tient la barre", "Gémeaux": "connaît tout le monde",
  "Cancer": "fédère les gens", "Lion": "prend la parole", "Vierge": "voit les détails",
  "Balance": "arrondit les angles", "Scorpion": "va au fond", "Sagittaire": "pense large",
  "Capricorne": "finit ce qu'elle commence", "Verseau": "propose l'idée d'après",
  "Poissons": "sent l'ambiance",
};
