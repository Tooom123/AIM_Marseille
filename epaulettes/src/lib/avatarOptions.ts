/**
 * Choix d'apparence pour l'avatar. Tout est dessiné en SVG, façon croquis :
 * contours noirs irréguliers, aplats légèrement décalés.
 */

export const SKIN_TONES = [
  "#FFE0C4", "#F8CBA0", "#E8AE7C", "#CE8C55", "#A96B3C", "#7E4B29", "#59341C",
];

export const HAIR_COLORS = [
  "#2A1F1A", "#4B2E1E", "#7B4A2A", "#A9713F", "#C9974B", "#E6CC8A",
  "#B23B2E", "#E2703A", "#8E8E93", "#EDEAE4", "#25C7D9", "#F6577C", "#8B5CF6", "#3DBB6B",
];

export const EYE_COLORS = ["#3A2A1C", "#6B4423", "#2E7D5B", "#3A78B5", "#5F6470", "#141414"];

/** Coupes volontairement contrastées : on doit distinguer deux avatars d'un coup d'œil. */
export const HAIR_STYLES = [
  "buzz", "court", "frange", "carré", "long", "bouclé", "afro",
  "chignon", "couettes", "tresses", "crête", "undercut", "voile", "chapeau",
] as const;

export const EYE_SHAPES = ["points", "ronds", "amandes", "endormis", "étoiles", "rieurs"] as const;
export const BROW_SHAPES = ["fins", "droits", "arqués", "broussailleux", "surpris"] as const;
export const MOUTH_SHAPES = ["sourire", "grand", "petit", "moue", "surprise", "langue", "sourire dents"] as const;
export const FACE_SHAPES = ["ovale", "rond", "carré", "coeur", "long", "poire"] as const;
export const NOSE_SHAPES = ["petit", "bouton", "long", "retroussé", "aucun"] as const;
export const GLASSES = ["aucune", "rondes", "carrées", "chat", "soleil"] as const;
export const ACCESSORIES = [
  "aucun", "boucles", "créoles", "piercing", "grain de beauté", "bandeau", "collier", "foulard",
] as const;

/** Largeur du visage : c'est ce qui distingue le plus deux silhouettes. */
export const FACE_WIDTHS = ["étroit", "normal", "large"] as const;
export const EYE_SIZES = ["petits", "normaux", "grands"] as const;
export const TILTS = ["à gauche", "droit", "à droite"] as const;
export const TOP_STYLES = ["col rond", "col V", "chemise", "col roulé", "blazer", "écharpe"] as const;
export const LIP_COLORS = ["#B0414F", "#D94A6A", "#C97B6A", "#8E3A4A", "#E8919F", "#7A4A3A"];

export const BACKGROUNDS = [
  "#25C7D9", "#F6577C", "#F2F3DC", "#12333A", "#4ED8C0",
  "#FFB067", "#B9A7E6", "#FFD84D", "#8FD694",
];

export const TOP_COLORS = [
  "#25C7D9", "#F6577C", "#12333A", "#F2F3DC", "#E8A33D", "#6C7A89", "#8B5CF6", "#3DBB6B",
];

export type AvatarConfig = {
  skin: string;
  hairColor: string;
  hairStyle: (typeof HAIR_STYLES)[number];
  eyeColor: string;
  eyeShape: (typeof EYE_SHAPES)[number];
  brow: (typeof BROW_SHAPES)[number];
  mouth: (typeof MOUTH_SHAPES)[number];
  face: (typeof FACE_SHAPES)[number];
  nose: (typeof NOSE_SHAPES)[number];
  glasses: (typeof GLASSES)[number];
  accessory: (typeof ACCESSORIES)[number];
  background: string;
  top: string;
  freckles: boolean;
  blush: boolean;
  faceWidth: (typeof FACE_WIDTHS)[number];
  eyeSize: (typeof EYE_SIZES)[number];
  tilt: (typeof TILTS)[number];
  topStyle: (typeof TOP_STYLES)[number];
  lips: string;
};

export const DEFAULT_AVATAR: AvatarConfig = {
  skin: SKIN_TONES[1],
  hairColor: HAIR_COLORS[1],
  hairStyle: "long",
  eyeColor: EYE_COLORS[0],
  eyeShape: "ronds",
  brow: "arqués",
  mouth: "sourire",
  face: "ovale",
  nose: "bouton",
  glasses: "aucune",
  accessory: "aucun",
  background: BACKGROUNDS[0],
  top: TOP_COLORS[0],
  freckles: false,
  blush: true,
  faceWidth: "normal",
  eyeSize: "normaux",
  tilt: "droit",
  topStyle: "col rond",
  lips: LIP_COLORS[0],
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
    nose: pick(NOSE_SHAPES, 13),
    glasses: rnd(90) % 4 === 0 ? pick(GLASSES.filter((g) => g !== "aucune"), 9) : "aucune",
    accessory: rnd(100) % 3 === 0 ? pick(ACCESSORIES.filter((a) => a !== "aucun"), 10) : "aucun",
    background: pick(BACKGROUNDS, 11),
    top: pick(TOP_COLORS, 12),
    freckles: rnd(110) % 5 === 0,
    blush: rnd(120) % 3 !== 0,
    faceWidth: pick(FACE_WIDTHS, 14),
    eyeSize: pick(EYE_SIZES, 15),
    // Une tête sur deux est légèrement penchée : ça suffit à animer une grille.
    tilt: rnd(130) % 2 === 0 ? "droit" : pick(["à gauche", "à droite"] as const, 16),
    topStyle: pick(TOP_STYLES, 17),
    lips: pick(LIP_COLORS, 18),
  };
}

export function randomAvatar(): AvatarConfig {
  return avatarFromSeed(Math.random().toString(36).slice(2));
}

/**
 * Nettoie une configuration venue du stockage : un profil enregistré avant un
 * changement d'options porte des valeurs qui n'existent plus. On remplace
 * chaque valeur inconnue par celle par défaut.
 */
export function sanitizeAvatar(raw: Partial<AvatarConfig> | undefined | null): AvatarConfig {
  const c = { ...DEFAULT_AVATAR, ...(raw ?? {}) };
  const keep = <T,>(value: T, allowed: readonly T[], fallback: T): T =>
    allowed.includes(value) ? value : fallback;

  return {
    ...c,
    skin: keep(c.skin, SKIN_TONES, DEFAULT_AVATAR.skin),
    hairColor: keep(c.hairColor, HAIR_COLORS, DEFAULT_AVATAR.hairColor),
    hairStyle: keep(c.hairStyle, HAIR_STYLES, DEFAULT_AVATAR.hairStyle),
    eyeColor: keep(c.eyeColor, EYE_COLORS, DEFAULT_AVATAR.eyeColor),
    eyeShape: keep(c.eyeShape, EYE_SHAPES, DEFAULT_AVATAR.eyeShape),
    brow: keep(c.brow, BROW_SHAPES, DEFAULT_AVATAR.brow),
    mouth: keep(c.mouth, MOUTH_SHAPES, DEFAULT_AVATAR.mouth),
    face: keep(c.face, FACE_SHAPES, DEFAULT_AVATAR.face),
    nose: keep(c.nose, NOSE_SHAPES, DEFAULT_AVATAR.nose),
    glasses: keep(c.glasses, GLASSES, DEFAULT_AVATAR.glasses),
    accessory: keep(c.accessory, ACCESSORIES, DEFAULT_AVATAR.accessory),
    background: keep(c.background, BACKGROUNDS, DEFAULT_AVATAR.background),
    top: keep(c.top, TOP_COLORS, DEFAULT_AVATAR.top),
    freckles: typeof c.freckles === "boolean" ? c.freckles : DEFAULT_AVATAR.freckles,
    blush: typeof c.blush === "boolean" ? c.blush : DEFAULT_AVATAR.blush,
    faceWidth: keep(c.faceWidth, FACE_WIDTHS, DEFAULT_AVATAR.faceWidth),
    eyeSize: keep(c.eyeSize, EYE_SIZES, DEFAULT_AVATAR.eyeSize),
    tilt: keep(c.tilt, TILTS, DEFAULT_AVATAR.tilt),
    topStyle: keep(c.topStyle, TOP_STYLES, DEFAULT_AVATAR.topStyle),
    lips: keep(c.lips, LIP_COLORS, DEFAULT_AVATAR.lips),
  };
}
