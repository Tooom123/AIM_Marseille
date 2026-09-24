/**
 * Stickers et GIFs. Tout est local : emoji pour les stickers, SVG animés
 * générés à la volée pour les « GIFs ». Aucun service externe, rien à charger.
 */

export type Sticker = { id: string; emoji: string; label: string };

export const STICKER_PACKS: { name: string; stickers: Sticker[] }[] = [
  {
    name: "Réactions",
    stickers: [
      { id: "bravo", emoji: "👏", label: "Bravo" },
      { id: "feu", emoji: "🔥", label: "Ça envoie" },
      { id: "coeur", emoji: "💖", label: "J'adore" },
      { id: "rire", emoji: "😂", label: "Trop drôle" },
      { id: "top", emoji: "💯", label: "Cent pour cent" },
      { id: "pouce", emoji: "👍", label: "D'accord" },
      { id: "yeux", emoji: "👀", label: "Je regarde" },
      { id: "reflechit", emoji: "🤔", label: "Je réfléchis" },
    ],
  },
  {
    name: "Épaulettes",
    stickers: [
      { id: "epaule", emoji: "💪", label: "Un coup d'épaule" },
      { id: "trinque", emoji: "🥂", label: "À l'apéro" },
      { id: "cafe", emoji: "☕", label: "On prend un café ?" },
      { id: "rdv", emoji: "📅", label: "Je note" },
      { id: "idee", emoji: "💡", label: "J'ai une idée" },
      { id: "deal", emoji: "🤝", label: "Marché conclu" },
      { id: "fusee", emoji: "🚀", label: "C'est parti" },
      { id: "soleil", emoji: "🌞", label: "Marseille" },
    ],
  },
  {
    name: "Humeurs",
    stickers: [
      { id: "debordee", emoji: "🥵", label: "Débordée" },
      { id: "fiere", emoji: "🤩", label: "Fière" },
      { id: "fatiguee", emoji: "😴", label: "Fatiguée" },
      { id: "merci", emoji: "🙏", label: "Merci" },
      { id: "stress", emoji: "😅", label: "Un peu de stress" },
      { id: "fete", emoji: "🎉", label: "On fête ça" },
      { id: "calin", emoji: "🫶", label: "Soutien" },
      { id: "vamos", emoji: "⚡", label: "Énergie" },
    ],
  },
];

export type Gif = { id: string; label: string; colors: [string, string]; kind: GifKind };
export type GifKind = "confetti" | "pulse" | "bounce" | "wave" | "spin" | "rain";

/** Petites animations vectorielles, jouées en boucle dans la conversation. */
export const GIFS: Gif[] = [
  { id: "bravo", label: "Bravo !", colors: ["#25C7D9", "#F6577C"], kind: "confetti" },
  { id: "coeur", label: "Coup de cœur", colors: ["#F6577C", "#FFB067"], kind: "pulse" },
  { id: "oui", label: "Carrément", colors: ["#3DBB6B", "#25C7D9"], kind: "bounce" },
  { id: "salut", label: "Coucou", colors: ["#FFD84D", "#F6577C"], kind: "wave" },
  { id: "gogo", label: "On fonce", colors: ["#8B5CF6", "#25C7D9"], kind: "spin" },
  { id: "merci", label: "Merci !", colors: ["#25C7D9", "#8FD694"], kind: "rain" },
];

export const GIFS_BY_ID = Object.fromEntries(GIFS.map((g) => [g.id, g]));

/**
 * Encodage dans le texte du message. Un message reste une chaîne : on préfixe
 * pour distinguer sticker et gif sans changer le modèle de données.
 */
export const STICKER_PREFIX = "::sticker:";
export const GIF_PREFIX = "::gif:";

export function encodeSticker(emoji: string) { return `${STICKER_PREFIX}${emoji}`; }
export function encodeGif(id: string) { return `${GIF_PREFIX}${id}`; }

export function decodeMessage(text: string):
  | { type: "text"; value: string }
  | { type: "sticker"; value: string }
  | { type: "gif"; value: Gif } {
  if (text.startsWith(STICKER_PREFIX)) {
    return { type: "sticker", value: text.slice(STICKER_PREFIX.length) };
  }
  if (text.startsWith(GIF_PREFIX)) {
    const gif = GIFS_BY_ID[text.slice(GIF_PREFIX.length)];
    if (gif) return { type: "gif", value: gif };
  }
  return { type: "text", value: text };
}
