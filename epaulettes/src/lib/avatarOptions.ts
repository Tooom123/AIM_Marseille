/** Choix d'apparence pour l'avatar personnalisable. Tout est rendu en SVG, sans image. */

export const SKIN_TONES = [
  "#F7D9C4", "#F1C39B", "#E0AC7E", "#C68642", "#A9683F", "#7A4B28", "#5A3620",
];

export const HAIR_COLORS = [
  "#2B2118", "#4A2F1B", "#7A4B28", "#A9683F", "#C89B54", "#E3C88A",
  "#B0453A", "#D96A4E", "#9B9B9B", "#E8E4DF", "#25C7D9", "#F6577C", "#7C4DFF",
];

export const EYE_COLORS = ["#4A3728", "#6B4423", "#2E5A4B", "#3A6B8C", "#5A5A6E", "#1F1F1F"];

export const HAIR_STYLES = [
  "court", "carré", "long", "bouclé", "chignon", "afro", "tresses", "queue", "pixie", "voile",
] as const;

export const EYE_SHAPES = ["ronds", "amandes", "fins", "grands"] as const;
export const BROW_SHAPES = ["droits", "arqués", "fins", "épais"] as const;
export const MOUTH_SHAPES = ["sourire", "discret", "large", "neutre"] as const;
export const FACE_SHAPES = ["ovale", "rond", "carré", "coeur"] as const;
export const GLASSES = ["aucune", "rondes", "carrées", "fines"] as const;
export const ACCESSORIES = ["aucun", "boucles", "créoles", "collier"] as const;

export const BACKGROUNDS = [
  "#25C7D9", "#F6577C", "#F2F3DC", "#12333A", "#4ED8C0", "#FFA36C", "#B9A7E6",
];

export const TOP_COLORS = ["#25C7D9", "#F6577C", "#12333A", "#F2F3DC", "#E8A33D", "#6C7A89"];

export type AvatarConfig = {
  skin: string;
  hairColor: string;
  hairStyle: (typeof HAIR_STYLES)[number];
  eyeColor: string;
  eyeShape: (typeof EYE_SHAPES)[number];
  brow: (typeof BROW_SHAPES)[number];
  mouth: (typeof MOUTH_SHAPES)[number];
  face: (typeof FACE_SHAPES)[number];
  glasses: (typeof GLASSES)[number];
  accessory: (typeof ACCESSORIES)[number];
  background: string;
  top: string;
  freckles: boolean;
};

export const DEFAULT_AVATAR: AvatarConfig = {
  skin: SKIN_TONES[1],
  hairColor: HAIR_COLORS[1],
  hairStyle: "long",
  eyeColor: EYE_COLORS[0],
  eyeShape: "amandes",
  brow: "arqués",
  mouth: "sourire",
  face: "ovale",
  glasses: "aucune",
  accessory: "aucun",
  background: BACKGROUNDS[0],
  top: TOP_COLORS[0],
  freckles: false,
};

/** Avatar pseudo-aléatoire mais déterministe, dérivé d'une graine. */
export function avatarFromSeed(seed: string): AvatarConfig {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Un générateur par trait : sans cela, des graines voisines donnent des
  // avatars quasi identiques.
  const rnd = (salt: number) => {
    let x = (h ^ Math.imul(salt + 1, 2654435761)) >>> 0;
    x ^= x << 13; x >>>= 0;
    x ^= x >> 17;
    x ^= x << 5; x >>>= 0;
    return x;
  };
  const pick = <T,>(arr: readonly T[], salt: number): T => arr[rnd(salt) % arr.length];

  return {
    skin: pick(SKIN_TONES, 1),
    hairColor: pick(HAIR_COLORS, 2),
    hairStyle: pick(HAIR_STYLES, 3),
    eyeColor: pick(EYE_COLORS, 4),
    eyeShape: pick(EYE_SHAPES, 5),
    brow: pick(BROW_SHAPES, 6),
    mouth: pick(MOUTH_SHAPES, 7),
    face: pick(FACE_SHAPES, 8),
    glasses: rnd(90) % 4 === 0 ? pick(GLASSES.filter((g) => g !== "aucune"), 9) : "aucune",
    accessory: rnd(100) % 3 === 0 ? pick(ACCESSORIES.filter((a) => a !== "aucun"), 10) : "aucun",
    background: pick(BACKGROUNDS, 11),
    top: pick(TOP_COLORS, 12),
    freckles: rnd(110) % 5 === 0,
  };
}

export function randomAvatar(): AvatarConfig {
  return avatarFromSeed(Math.random().toString(36).slice(2));
}
