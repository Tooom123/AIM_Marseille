"use client";

import CharacterAvatar from "./CharacterAvatar";
import { avatarFromSeed, type AvatarConfig } from "@/lib/avatarOptions";

export function initialsOf(first: string, last = ""): string {
  const a = first.trim()[0] ?? "É";
  const b = last.trim()[0] ?? "";
  return (a + b).toUpperCase();
}

/**
 * Avatar unifié. Par ordre de priorité :
 *  1. la photo importée,
 *  2. l'avatar personnalisé (`config`),
 *  3. un personnage dérivé de la graine — deux membres n'ont jamais le même.
 */
export default function Avatar({
  seed, first, last, photo, config, size = 44, className = "", ring = false,
}: {
  seed: string;
  first: string;
  last?: string;
  photo?: string;
  config?: AvatarConfig;
  size?: number;
  className?: string;
  ring?: boolean;
}) {
  const ringCls = ring ? "ring-2 ring-white" : "";

  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo}
        alt={`${first} ${last ?? ""}`.trim()}
        style={{ width: size, height: size }}
        className={`shrink-0 rounded-full object-cover ${ringCls} ${className}`}
      />
    );
  }

  return (
    <CharacterAvatar
      config={config ?? avatarFromSeed(seed)}
      size={size}
      className={`${ringCls} ${className}`}
    />
  );
}
