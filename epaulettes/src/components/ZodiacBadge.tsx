"use client";

import {
  ELEMENT_COLOR, ZODIAC_ELEMENT, ZODIAC_SYMBOL, ZODIAC_TRAIT, type ZodiacSign,
} from "@/lib/zodiac";

export default function ZodiacBadge({
  sign, withTrait = false, size = "md",
}: {
  sign: ZodiacSign;
  withTrait?: boolean;
  size?: "sm" | "md";
}) {
  const color = ELEMENT_COLOR[ZODIAC_ELEMENT[sign]];
  const small = size === "sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${
        small ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      }`}
      style={{ borderColor: `${color}55`, background: `${color}18`, color: darken(color) }}
      title={`${sign} — ${ZODIAC_TRAIT[sign]}`}
    >
      <span aria-hidden className={small ? "text-sm leading-none" : "text-base leading-none"}>
        {ZODIAC_SYMBOL[sign]}
      </span>
      {sign}
      {withTrait && <span className="font-normal opacity-75">· {ZODIAC_TRAIT[sign]}</span>}
    </span>
  );
}

/** Le texte doit rester lisible sur le fond pâle du badge. */
function darken(hex: string) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) * 0.68);
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
}
