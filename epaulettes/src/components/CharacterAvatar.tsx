"use client";

import type { AvatarConfig } from "@/lib/avatarOptions";

/**
 * Avatar façon Mii : tout est dessiné en SVG à partir de la configuration.
 * Repère : boîte 100×100, visage centré autour de (50, 46).
 */
export default function CharacterAvatar({
  config, size = 96, className = "", rounded = true,
}: {
  config: AvatarConfig;
  size?: number;
  className?: string;
  rounded?: boolean;
}) {
  const c = config;
  const shade = darken(c.skin, 0.1);

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`${rounded ? "rounded-full" : ""} shrink-0 ${className}`}
      role="img"
      aria-label="Avatar"
    >
      <rect width="100" height="100" fill={c.background} />

      {/* Buste */}
      <path d="M50 74c-16 0-27 9-30 20 -1 4 -1 6 -1 6h62s0-2-1-6c-3-11-14-20-30-20z" fill={c.top} />
      <path d="M50 74c-4 0-7 4-7 9s3 8 7 8 7-3 7-8-3-9-7-9z" fill={lighten(c.top, 0.12)} />

      {/* Cou */}
      <path d="M43 62h14v13c0 3-3 5-7 5s-7-2-7-5z" fill={shade} />

      {/* Cheveux arrière */}
      <BackHair style={c.hairStyle} color={c.hairColor} />

      {/* Visage */}
      <Face shape={c.face} skin={c.skin} />

      {/* Oreilles */}
      <ellipse cx="26" cy="47" rx="4" ry="6" fill={c.skin} />
      <ellipse cx="74" cy="47" rx="4" ry="6" fill={c.skin} />

      {/* Taches de rousseur */}
      {c.freckles && (
        <g fill={darken(c.skin, 0.22)} opacity="0.75">
          {[[38, 50], [34, 53], [42, 53], [62, 50], [66, 53], [58, 53]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.1" />
          ))}
        </g>
      )}

      {/* Sourcils */}
      <Brows shape={c.brow} color={darken(c.hairColor, 0.12)} />

      {/* Yeux */}
      <Eyes shape={c.eyeShape} color={c.eyeColor} />

      {/* Bouche */}
      <Mouth shape={c.mouth} />

      {/* Cheveux avant */}
      <FrontHair style={c.hairStyle} color={c.hairColor} />

      {/* Lunettes */}
      <Glasses kind={c.glasses} />

      {/* Accessoires */}
      <Accessory kind={c.accessory} />
    </svg>
  );
}

function Face({ shape, skin }: { shape: AvatarConfig["face"]; skin: string }) {
  const paths: Record<AvatarConfig["face"], string> = {
    ovale: "M50 18c-14 0-23 11-23 26 0 16 10 28 23 28s23-12 23-28c0-15-9-26-23-26z",
    rond: "M50 18c-15 0-24 12-24 27s9 27 24 27 24-12 24-27-9-27-24-27z",
    carré: "M50 18c-14 0-23 10-23 24v12c0 12 10 18 23 18s23-6 23-18V42c0-14-9-24-23-24z",
    coeur: "M50 18c-15 0-24 11-24 25 0 17 13 29 24 29s24-12 24-29c0-14-9-25-24-25z",
  };
  return <path d={paths[shape]} fill={skin} />;
}

function Eyes({ shape, color }: { shape: AvatarConfig["eyeShape"]; color: string }) {
  const white = "#FFFFFF";
  const positions = [38, 62];

  return (
    <g>
      {positions.map((cx) => (
        <g key={cx}>
          {shape === "ronds" && (
            <>
              <circle cx={cx} cy="46" r="6" fill={white} />
              <circle cx={cx} cy="46" r="3.4" fill={color} />
              <circle cx={cx} cy="46" r="1.5" fill="#12333A" />
              <circle cx={cx - 1.4} cy="44.4" r="1.2" fill="#fff" />
            </>
          )}
          {shape === "amandes" && (
            <>
              <path d={`M${cx - 6.5} 46c2-4 11-4 13 0 -2 4.5-11 4.5-13 0z`} fill={white} />
              <circle cx={cx} cy="46" r="3.2" fill={color} />
              <circle cx={cx} cy="46" r="1.4" fill="#12333A" />
              <circle cx={cx - 1.2} cy="44.6" r="1.1" fill="#fff" />
            </>
          )}
          {shape === "fins" && (
            <>
              <path d={`M${cx - 6} 46c2-2.6 10-2.6 12 0 -2 3-10 3-12 0z`} fill={white} />
              <circle cx={cx} cy="46" r="2.6" fill={color} />
              <circle cx={cx} cy="46" r="1.2" fill="#12333A" />
            </>
          )}
          {shape === "grands" && (
            <>
              <ellipse cx={cx} cy="46" rx="7" ry="6.4" fill={white} />
              <circle cx={cx} cy="46.4" r="4" fill={color} />
              <circle cx={cx} cy="46.4" r="1.8" fill="#12333A" />
              <circle cx={cx - 1.6} cy="44.4" r="1.5" fill="#fff" />
            </>
          )}
        </g>
      ))}
    </g>
  );
}

function Brows({ shape, color }: { shape: AvatarConfig["brow"]; color: string }) {
  const paths: Record<AvatarConfig["brow"], [string, string]> = {
    droits: ["M32 37h12", "M56 37h12"],
    arqués: ["M32 38c3-4 9-4 12 0", "M56 38c3-4 9-4 12 0"],
    fins: ["M33 38c3-2.5 8-2.5 11 0", "M56 38c3-2.5 8-2.5 11 0"],
    épais: ["M32 37.5c3-4 9-4 12 0", "M56 37.5c3-4 9-4 12 0"],
  };
  const w = shape === "épais" ? 4 : shape === "fins" ? 1.8 : 2.8;
  const [l, r] = paths[shape];
  return (
    <g stroke={color} strokeWidth={w} strokeLinecap="round" fill="none">
      <path d={l} />
      <path d={r} />
    </g>
  );
}

function Mouth({ shape }: { shape: AvatarConfig["mouth"] }) {
  if (shape === "neutre") {
    return <path d="M44 60h12" stroke="#B5535F" strokeWidth="2.4" strokeLinecap="round" fill="none" />;
  }
  if (shape === "discret") {
    return <path d="M44 59c3 3 9 3 12 0" stroke="#B5535F" strokeWidth="2.4" strokeLinecap="round" fill="none" />;
  }
  if (shape === "large") {
    return (
      <g>
        <path d="M40 58c4 7 16 7 20 0z" fill="#B5535F" />
        <path d="M42 58.6h16c-1.6 1.3-14.4 1.3-16 0z" fill="#fff" />
      </g>
    );
  }
  return (
    <g>
      <path d="M42 58c3 5 13 5 16 0z" fill="#C25D6A" />
      <path d="M43.6 58.6h12.8c-1.2 1-11.6 1-12.8 0z" fill="#fff" />
    </g>
  );
}

function BackHair({ style, color }: { style: AvatarConfig["hairStyle"]; color: string }) {
  switch (style) {
    case "long":
      return <path d="M22 44c0-18 12-28 28-28s28 10 28 28v30c0 4-4 6-7 4 2-12 1-24-2-30-6 6-32 6-38 0-3 6-4 18-2 30-3 2-7 0-7-4z" fill={color} />;
    case "carré":
      return <path d="M23 44c0-17 12-27 27-27s27 10 27 27v18c0 3-3 5-6 4 1-10 0-20-2-25-6 5-32 5-38 0-2 5-3 15-2 25-3 1-6-1-6-4z" fill={color} />;
    case "bouclé":
      return (
        <g fill={color}>
          <circle cx="30" cy="34" r="12" /><circle cx="50" cy="26" r="14" />
          <circle cx="70" cy="34" r="12" /><circle cx="26" cy="50" r="10" />
          <circle cx="74" cy="50" r="10" />
        </g>
      );
    case "afro":
      return (
        <g fill={color}>
          <circle cx="50" cy="34" r="27" />
          <circle cx="28" cy="42" r="13" /><circle cx="72" cy="42" r="13" />
        </g>
      );
    case "tresses":
      return (
        <g fill={color}>
          <path d="M23 44c0-17 12-27 27-27s27 10 27 27v6c-6 4-48 4-54 0z" />
          <rect x="18" y="46" width="9" height="30" rx="4.5" />
          <rect x="73" y="46" width="9" height="30" rx="4.5" />
        </g>
      );
    case "queue":
      return (
        <g fill={color}>
          <path d="M23 44c0-17 12-27 27-27s27 10 27 27v4c-6 4-48 4-54 0z" />
          <path d="M74 40c8 2 12 12 10 22-1 6-5 10-9 9 4-10 4-22-1-31z" />
        </g>
      );
    case "chignon":
      return (
        <g fill={color}>
          <circle cx="50" cy="16" r="10" />
          <path d="M24 44c0-16 12-26 26-26s26 10 26 26v3c-6 4-46 4-52 0z" />
        </g>
      );
    case "voile":
      return <path d="M20 48c0-19 13-31 30-31s30 12 30 31v32H68c2-14 1-26-3-32-7 7-23 7-30 0-4 6-5 18-3 32H20z" fill={color} />;
    case "pixie":
      return <path d="M25 44c0-16 11-26 25-26s25 10 25 26v2c-6 3-44 3-50 0z" fill={color} />;
    default: // court
      return <path d="M25 44c0-16 11-26 25-26s25 10 25 26v1c-6 3-44 3-50 0z" fill={color} />;
  }
}

function FrontHair({ style, color }: { style: AvatarConfig["hairStyle"]; color: string }) {
  switch (style) {
    case "voile":
      return null;
    case "afro":
    case "bouclé":
      return <path d="M28 38c4-10 14-16 22-16s18 6 22 16c-6-6-38-6-44 0z" fill={color} />;
    case "pixie":
      return <path d="M27 40c2-12 11-19 23-19s21 7 23 19c-3-7-9-10-15-8-5 2-8 5-13 4-6-1-13 0-18 4z" fill={color} />;
    case "court":
      return <path d="M27 40c2-12 11-19 23-19s21 7 23 19c-4-8-14-11-23-11s-19 3-23 11z" fill={color} />;
    default:
      return <path d="M26 42c1-14 11-22 24-22s23 8 24 22c-5-9-10-13-18-13-6 0-9 3-14 6-5 3-10 3-16 7z" fill={color} />;
  }
}

function Glasses({ kind }: { kind: AvatarConfig["glasses"] }) {
  if (kind === "aucune") return null;
  const stroke = "#2B2B33";
  if (kind === "rondes") {
    return (
      <g fill="rgba(255,255,255,.18)" stroke={stroke} strokeWidth="2">
        <circle cx="38" cy="46" r="9" /><circle cx="62" cy="46" r="9" />
        <path d="M47 46h6" fill="none" />
      </g>
    );
  }
  if (kind === "carrées") {
    return (
      <g fill="rgba(255,255,255,.18)" stroke={stroke} strokeWidth="2">
        <rect x="29" y="39" width="18" height="14" rx="3" />
        <rect x="53" y="39" width="18" height="14" rx="3" />
        <path d="M47 46h6" fill="none" />
      </g>
    );
  }
  return (
    <g fill="none" stroke={stroke} strokeWidth="1.5">
      <rect x="30" y="41" width="16" height="10" rx="5" />
      <rect x="54" y="41" width="16" height="10" rx="5" />
      <path d="M46 46h8" />
    </g>
  );
}

function Accessory({ kind }: { kind: AvatarConfig["accessory"] }) {
  if (kind === "aucun") return null;
  if (kind === "boucles") {
    return (
      <g fill="#E8C05A">
        <circle cx="26" cy="54" r="2.6" /><circle cx="74" cy="54" r="2.6" />
      </g>
    );
  }
  if (kind === "créoles") {
    return (
      <g fill="none" stroke="#E8C05A" strokeWidth="2">
        <circle cx="26" cy="56" r="4.5" /><circle cx="74" cy="56" r="4.5" />
      </g>
    );
  }
  return (
    <g>
      <path d="M40 78c4 5 16 5 20 0" fill="none" stroke="#E8C05A" strokeWidth="2" />
      <circle cx="50" cy="81" r="2.8" fill="#F6577C" stroke="#E8C05A" strokeWidth="1" />
    </g>
  );
}

/* Utilitaires couleur : un avatar reste lisible si les nuances dérivent de la teinte choisie. */
function clamp(n: number) { return Math.max(0, Math.min(255, Math.round(n))); }

function parse(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function toHex([r, g, b]: [number, number, number]) {
  return `#${[r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("")}`;
}

export function darken(hex: string, amount: number) {
  const [r, g, b] = parse(hex);
  return toHex([r * (1 - amount), g * (1 - amount), b * (1 - amount)]);
}

export function lighten(hex: string, amount: number) {
  const [r, g, b] = parse(hex);
  return toHex([r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount]);
}
