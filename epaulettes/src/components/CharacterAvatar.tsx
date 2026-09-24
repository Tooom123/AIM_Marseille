"use client";

import type { AvatarConfig } from "@/lib/avatarOptions";

/**
 * Avatar dessiné à la main, façon croquis : contours noirs d'épaisseur
 * irrégulière, aplats de couleur qui débordent légèrement du trait.
 * Repère : boîte 100×100, visage centré autour de (50, 45).
 */

const INK = "#1A1A1A";

/** Épaisseurs de trait : varier donne l'impression d'un feutre, pas d'un vecteur. */
const W = { thick: 2.6, mid: 2.1, thin: 1.6 };

export default function CharacterAvatar({
  config, size = 96, className = "", rounded = true,
}: {
  config: AvatarConfig;
  size?: number;
  className?: string;
  rounded?: boolean;
}) {
  const c = config;

  return (
    <svg
      // Indispensable quand le SVG est sérialisé en data URI (graphe en canvas) :
      // sans namespace, le navigateur refuse de le charger comme image.
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`${rounded ? "rounded-full" : ""} shrink-0 ${className}`}
      role="img"
      aria-label="Avatar"
    >
      <rect width="100" height="100" fill={c.background} />

      <g
        stroke={INK}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      >
        <Body top={c.top} />
        <BackHair style={c.hairStyle} color={c.hairColor} />
        <Head shape={c.face} skin={c.skin} />
        <Ears skin={c.skin} hidden={c.hairStyle === "voile"} />
        {c.blush && <Blush shape={c.face} />}
        {c.freckles && <Freckles />}
        <Brows shape={c.brow} color={c.hairColor} />
        <Eyes shape={c.eyeShape} color={c.eyeColor} />
        <Nose shape={c.nose} />
        <Mouth shape={c.mouth} />
        <FrontHair style={c.hairStyle} color={c.hairColor} />
        <Glasses kind={c.glasses} />
        <Accessory kind={c.accessory} />
      </g>
    </svg>
  );
}

/* ---------- Corps ---------- */

function Body({ top }: { top: string }) {
  return (
    <g>
      {/* Cou */}
      <path d="M44 63c0 5 .3 8 .3 10h11.4c0-2 .3-5 .3-10z" fill="#00000018" stroke="none" />
      {/* Épaules, tracé un peu tremblant */}
      <path
        d="M50 72c-13 .4-23 7-26.5 17.5C22.2 93 21.8 97 21.6 100h56.8c-.2-3-.7-7-1.9-10.5C73 79 63 72.4 50 72z"
        fill={top}
        strokeWidth={W.thick}
      />
      {/* Encolure */}
      <path d="M42 74.5c2.6 3.4 5 4.8 8 4.8s5.4-1.4 8-4.8" fill="none" strokeWidth={W.thin} />
    </g>
  );
}

/* ---------- Tête ---------- */

const HEAD_PATHS: Record<AvatarConfig["face"], string> = {
  // Contours volontairement asymétriques : un visage parfait fait "vectoriel".
  // La tête reste plus étroite que la chevelure, sinon elle la recouvre.
  ovale: "M50 19c-12.4 0-19.8 9-19.8 21.8 0 14 8.4 24.2 19.8 24.2s19.8-10.4 19.8-24.4C69.8 27.8 62.2 19 50 19z",
  rond: "M50 19.5c-13.2 0-21.2 9.4-21.2 22.4S37.2 65 50 65s21.2-9.8 21.2-22.8S63.2 19.5 50 19.5z",
  carré: "M50 19c-12 0-19.6 8-19.6 19.4v10.4C30.4 60 38.6 65 50 65s19.6-5.2 19.6-16V38.4C69.6 27 62 19 50 19z",
  coeur: "M50 19c-13.2 0-21 8.6-21 20.8 0 15.4 11.6 25.2 21 25.2s21-10 21-25.4C71 27.4 63 19 50 19z",
  long: "M50 18c-11 0-18.4 8.2-18.4 21 0 16.8 8.2 28 18.4 28s18.4-11.4 18.4-28.2C68.4 26 61 18 50 18z",
  poire: "M50 19c-11.2 0-18.4 7.4-18.4 18.6 0 15 6.8 27.8 18.4 27.8s18.4-13 18.4-28C68.4 26 61.2 19 50 19z",
};

function Head({ shape, skin }: { shape: AvatarConfig["face"]; skin: string }) {
  return <path d={HEAD_PATHS[shape] ?? HEAD_PATHS.ovale} fill={skin} strokeWidth={W.thick} />;
}

function Ears({ skin, hidden }: { skin: string; hidden: boolean }) {
  if (hidden) return null;
  return (
    <g fill={skin} strokeWidth={W.mid}>
      <path d="M30.6 41.6c-3.4-.6-5.2 1.4-5 4.2.2 2.8 2.4 4.6 5.2 4.2z" />
      <path d="M69.4 41.6c3.4-.6 5.2 1.4 5 4.2-.2 2.8-2.4 4.6-5.2 4.2z" />
    </g>
  );
}

function Blush({ shape }: { shape: AvatarConfig["face"] }) {
  const y = shape === "long" ? 52 : 50;
  return (
    <g fill="#F6577C" opacity="0.32" stroke="none">
      <ellipse cx="36" cy={y} rx="5" ry="3" />
      <ellipse cx="64" cy={y} rx="5" ry="3" />
    </g>
  );
}

function Freckles() {
  return (
    <g fill={INK} opacity="0.4" stroke="none">
      {[[36, 48], [38.8, 50.2], [33.4, 51], [64, 48], [61.2, 50.2], [66.6, 51]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="0.9" />
      ))}
    </g>
  );
}

/* ---------- Yeux ---------- */

function Eyes({ shape, color }: { shape: AvatarConfig["eyeShape"]; color: string }) {
  const L = 42.2, R = 57.8, Y = 43.5;

  if (shape === "points") {
    return (
      <g fill={INK} stroke="none">
        <circle cx={L} cy={Y} r="3.2" />
        <circle cx={R} cy={Y} r="3.2" />
        <circle cx={L - 1.1} cy={Y - 1.1} r="1.1" fill="#fff" />
        <circle cx={R - 1.1} cy={Y - 1.1} r="1.1" fill="#fff" />
      </g>
    );
  }

  if (shape === "endormis") {
    return (
      <g fill="none" strokeWidth={W.mid}>
        <path d={`M${L - 5.5} ${Y}c2 3.4 9 3.4 11 0`} />
        <path d={`M${R - 5.5} ${Y}c2 3.4 9 3.4 11 0`} />
      </g>
    );
  }

  if (shape === "rieurs") {
    return (
      <g fill="none" strokeWidth={W.mid}>
        <path d={`M${L - 5.5} ${Y + 1.5}c2-4 9-4 11 0`} />
        <path d={`M${R - 5.5} ${Y + 1.5}c2-4 9-4 11 0`} />
      </g>
    );
  }

  if (shape === "étoiles") {
    const star = (cx: number) =>
      `M${cx} ${Y - 5.6}l1.7 3.6 3.9.5-2.9 2.7.8 3.9L${cx} ${Y + 3.3}l-3.5 1.8.8-3.9-2.9-2.7 3.9-.5z`;
    return (
      <g fill={color} strokeWidth={W.thin}>
        <path d={star(L)} />
        <path d={star(R)} />
      </g>
    );
  }

  if (shape === "amandes") {
    return (
      <g strokeWidth={W.mid}>
        <path d={`M${L - 7} ${Y}c2.2-4.6 11.8-4.6 14 0 -2.2 4.8-11.8 4.8-14 0z`} fill="#fff" />
        <path d={`M${R - 7} ${Y}c2.2-4.6 11.8-4.6 14 0 -2.2 4.8-11.8 4.8-14 0z`} fill="#fff" />
        <g stroke="none">
          <circle cx={L} cy={Y} r="3.1" fill={color} />
          <circle cx={R} cy={Y} r="3.1" fill={color} />
          <circle cx={L} cy={Y} r="1.4" fill={INK} />
          <circle cx={R} cy={Y} r="1.4" fill={INK} />
          <circle cx={L - 1.2} cy={Y - 1.4} r="1" fill="#fff" />
          <circle cx={R - 1.2} cy={Y - 1.4} r="1" fill="#fff" />
        </g>
      </g>
    );
  }

  // ronds
  return (
    <g strokeWidth={W.mid}>
      <circle cx={L} cy={Y} r="6.2" fill="#fff" />
      <circle cx={R} cy={Y} r="6.2" fill="#fff" />
      <g stroke="none">
        <circle cx={L} cy={Y + 0.4} r="3.4" fill={color} />
        <circle cx={R} cy={Y + 0.4} r="3.4" fill={color} />
        <circle cx={L} cy={Y + 0.4} r="1.6" fill={INK} />
        <circle cx={R} cy={Y + 0.4} r="1.6" fill={INK} />
        <circle cx={L - 1.5} cy={Y - 1.4} r="1.3" fill="#fff" />
        <circle cx={R - 1.5} cy={Y - 1.4} r="1.3" fill="#fff" />
      </g>
    </g>
  );
}

/* ---------- Sourcils ---------- */

function Brows({ shape, color }: { shape: AvatarConfig["brow"]; color: string }) {
  const stroke = darken(color, 0.25);
  const defs: Record<AvatarConfig["brow"], { d: [string, string]; w: number }> = {
    fins: { d: ["M37 35.6c2.6-2 7.2-2.2 9.8-.4", "M53.2 35.2c2.6-1.8 7.2-1.6 9.8.4"], w: 1.7 },
    droits: { d: ["M37 35h9.8", "M53.2 35h9.8"], w: 2.6 },
    arqués: { d: ["M36.8 36c2.6-4 7.4-4.2 10-.6", "M53.2 35.4c2.6-3.6 7.4-3.4 10 .6"], w: 2.6 },
    broussailleux: { d: ["M36.4 35.8c3-3.6 7.8-3.8 10.8-.4", "M52.8 35.4c3-3.4 7.8-3.2 10.8.4"], w: 4.2 },
    surpris: { d: ["M37 32.6c2.6-3.2 7.4-3.4 10-.4", "M53.2 32.2c2.6-3 7.4-2.8 10 .4"], w: 2.4 },
  };
  const { d, w } = defs[shape] ?? defs.arqués;
  return (
    <g fill="none" stroke={stroke} strokeWidth={w}>
      <path d={d[0]} />
      <path d={d[1]} />
    </g>
  );
}

/* ---------- Nez ---------- */

function Nose({ shape }: { shape: AvatarConfig["nose"] }) {
  if (shape === "aucun") return null;
  if (shape === "bouton") {
    return <circle cx="50" cy="53" r="2" fill="#00000022" strokeWidth={W.thin} />;
  }
  if (shape === "long") {
    return <path d="M49.4 46.5c-.4 4.6-1.6 7-2.4 8.4 1.2 1 3.4 1 5 0" fill="none" strokeWidth={W.thin} />;
  }
  if (shape === "retroussé") {
    return <path d="M47.6 53.6c1.4 1.8 3.6 1.8 5 .2" fill="none" strokeWidth={W.mid} />;
  }
  return <path d="M49 50.4c-.6 2.4-1 3.4-1.4 4.2 1 .8 2.6.8 3.6.2" fill="none" strokeWidth={W.thin} />;
}

/* ---------- Bouche ---------- */

function Mouth({ shape }: { shape: AvatarConfig["mouth"] }) {
  switch (shape) {
    case "grand":
      return (
        <g strokeWidth={W.mid}>
          <path d="M39.5 57.5c2.6 7.6 18.4 7.6 21 0z" fill="#B0414F" />
          <path d="M41.6 58.4h16.8c-.8 1.4-16 1.4-16.8 0z" fill="#fff" stroke="none" />
        </g>
      );
    case "petit":
      return <path d="M46.4 59c2.2 2.2 5 2.2 7.2 0" fill="none" strokeWidth={W.mid} />;
    case "moue":
      return <path d="M45.6 60.6c2.6-2.6 6.2-2.6 8.8 0" fill="none" strokeWidth={W.mid} />;
    case "surprise":
      return <ellipse cx="50" cy="59.4" rx="4" ry="5" fill="#B0414F" strokeWidth={W.mid} />;
    case "langue":
      return (
        <g strokeWidth={W.mid}>
          <path d="M42 57.6c2.4 6.4 13.6 6.4 16 0z" fill="#B0414F" />
          <path d="M46.6 62.4c0 3.4 6.8 3.4 6.8 0 0-1.4-1.6-2-3.4-2s-3.4.6-3.4 2z" fill="#F0808F" />
        </g>
      );
    case "sourire dents":
      return (
        <g strokeWidth={W.mid}>
          <path d="M41.6 57.4c2.4 6.8 14.4 6.8 16.8 0z" fill="#fff" />
          <path d="M41.6 57.4h16.8" fill="none" strokeWidth={W.thin} />
          <path d="M50 57.4v4.6" fill="none" strokeWidth={W.thin} />
        </g>
      );
    default: // sourire
      return <path d="M43.4 57.8c3.4 4.6 9.8 4.6 13.2 0" fill="none" strokeWidth={W.mid} />;
  }
}

/* ---------- Cheveux ---------- */

function BackHair({ style, color }: { style: AvatarConfig["hairStyle"]; color: string }) {
  const sw = W.thick;
  switch (style) {
    case "long":
      return (
        <path
          d="M21 46c-.8-21 12-35 29-35s29.8 14 29 35c-.6 15-.8 27-2.2 40h-11c3-17 2-31-1-39.6-7.6 7-23.4 7-30.8 0C31 55 30 69 33 86H22.2C20.8 73 20.6 61 21 46z"
          fill={color}
          strokeWidth={sw}
        />
      );
    case "carré":
      return (
        <path
          d="M22 45c0-20 12-34 28-34s28 14 28 34v24h-11c2-13 1.4-24-1.4-31-7 6.6-26.2 6.6-33.2 0C29.6 45 29 56 31 69H22z"
          fill={color}
          strokeWidth={sw}
        />
      );
    case "bouclé":
      return (
        <g fill={color} strokeWidth={sw}>
          <circle cx="28" cy="30" r="14" />
          <circle cx="50" cy="19" r="15.5" />
          <circle cx="72" cy="30" r="14" />
          <circle cx="22" cy="47" r="11.5" />
          <circle cx="78" cy="47" r="11.5" />
          <circle cx="26" cy="60" r="8.5" />
          <circle cx="74" cy="60" r="8.5" />
        </g>
      );
    case "afro":
      return (
        <g fill={color} strokeWidth={sw}>
          <circle cx="50" cy="30" r="30" />
          <circle cx="23" cy="42" r="14.5" />
          <circle cx="77" cy="42" r="14.5" />
        </g>
      );
    case "tresses":
      return (
        <g fill={color} strokeWidth={sw}>
          <path d="M22 45c0-19.5 12.5-34 28-34s28 14.5 28 34v6c-7 5-49 5-56 0z" />
          <path d="M17 50c-3.4 0-5.2 2.8-5 6.4l2 27c.2 3.4 2.2 5.2 5 5.2s4.8-2 4.8-5.4l-1.6-27.6c-.2-3.4-2-5.6-5.2-5.6z" />
          <path d="M83 50c3.4 0 5.2 2.8 5 6.4l-2 27c-.2 3.4-2.2 5.2-5 5.2s-4.8-2-4.8-5.4l1.6-27.6c.2-3.4 2-5.6 5.2-5.6z" />
        </g>
      );
    case "couettes":
      return (
        <g fill={color} strokeWidth={sw}>
          <path d="M22.5 45c0-19.5 12.5-34 27.5-34s27.5 14.5 27.5 34v5c-7 5-48 5-55 0z" />
          <circle cx="15" cy="50" r="11.5" />
          <circle cx="85" cy="50" r="11.5" />
        </g>
      );
    case "chignon":
      return (
        <g fill={color} strokeWidth={sw}>
          <circle cx="50" cy="9" r="11.5" />
          <path d="M23 45c0-19 12-34 27-34s27 15 27 34v4c-7 5-47 5-54 0z" />
        </g>
      );
    case "crête":
      return (
        <g fill={color} strokeWidth={sw}>
          {/* Crête haute et franche : c'est elle qui doit sauter aux yeux. */}
          <path d="M38 24c2-12 5.4-20 12-24 6.6 4 10 12 12 24 1.6 9 2 15 1.6 19-8.4-4-18.8-4-27.2 0-.4-4 0-10 1.6-19z" />
          <path d="M26 46c.4-8 3-14.6 7-19.4 1 6 1.6 12.4 1.6 19.4zM74 46c-.4-8-3-14.6-7-19.4-1 6-1.6 12.4-1.6 19.4z" />
        </g>
      );
    case "undercut":
      return (
        <g fill={color} strokeWidth={sw}>
          <path d="M25 42c0-18 11.6-31 25-31s25 13 25 31v3c-7 3.4-43 3.4-50 0z" />
          <path d="M75 44c5.4 2.6 8.6 9 8 17-2.6-6.6-5.2-11.4-8-14z" />
        </g>
      );
    case "voile":
      return (
        <path
          d="M18 48c0-21.5 14-37 32-37s32 15.5 32 37c0 19-1 33-2 52H68c3-18 2-34-2.6-42.6-8 7.6-22.8 7.6-30.8 0C30 63 29 82 32 100H20c-1-19-2-33-2-52z"
          fill={color}
          strokeWidth={sw}
        />
      );
    case "chapeau":
      return (
        <g strokeWidth={sw}>
          {/* Cheveux visibles sous le bord */}
          <path d="M26 46c0-14 10.8-24 24-24s24 10 24 24v1c-7 3-41 3-48 0z" fill={color} />
          {/* Calotte puis bord large */}
          <path d="M30 32c0-11 9-19 20-19s20 8 20 19v3H30z" fill={darken(color, 0.35)} />
          <path d="M13 35c0-3.2 4.6-5.4 11-5.4h52c6.4 0 11 2.2 11 5.4s-4.6 5.6-11 5.6H24c-6.4 0-11-2.4-11-5.6z" fill={darken(color, 0.35)} />
        </g>
      );
    case "buzz":
      // Coupe très courte : le crâne se devine, la ligne est basse et nette.
      return <path d="M27 45c0-15.5 10.4-26 23-26s23 10.5 23 26v.6c-6.4 2.4-39.6 2.4-46 0z" fill={color} strokeWidth={sw} />;
    case "frange":
      return <path d="M24 45c0-18.5 11.6-33 26-33s26 14.5 26 33v4c-7 4.4-45 4.4-52 0z" fill={color} strokeWidth={sw} />;
    default: // court
      return <path d="M24.5 45c0-17.5 11.4-30 25.5-30s25.5 12.5 25.5 30v2.5c-7 3.4-44 3.4-51 0z" fill={color} strokeWidth={sw} />;
  }
}

function FrontHair({ style, color }: { style: AvatarConfig["hairStyle"]; color: string }) {
  const sw = W.mid;
  switch (style) {
    case "voile":
    case "chapeau":
    case "buzz":
    case "crête":
      return null;
    case "afro":
    case "bouclé":
      return <path d="M27 36c4.4-12 13.6-19 23-19s18.6 7 23 19c-7.6-7-38.4-7-46 0z" fill={color} strokeWidth={sw} />;
    case "frange":
      // Frange droite qui couvre le front jusqu'aux sourcils.
      return (
        <path
          d="M24.5 41c0-17 11.4-29 25.5-29s25.5 12 25.5 29c-2.4-5.6-5-9.4-7.8-11.4.8 4.4.6 8-.4 10.6-2.6-5.6-5.8-9.2-9.6-11 .8 4.2.6 7.6-.6 10.2-3-5.6-7-9.2-12.6-10.6-5.6 1.4-9.6 5-12.6 10.6-1.2-2.6-1.4-6-.6-10.2-3.8 1.8-7 5.4-9.6 11-1-2.6-1.2-6.2-.4-10.6-2.8 2-5.4 5.8-7.8 11.4z"
          fill={color}
          strokeWidth={sw}
        />
      );
    case "undercut":
      return <path d="M25 42c1.2-17 11.6-27.4 25-27.4 5.8 0 10.8 2 14.6 5.6-7.2 1.6-11.4 4.4-15 8.4-4 4.4-12.4 7.6-24.6 13.4z" fill={color} strokeWidth={sw} />;
    case "couettes":
    case "chignon":
      return <path d="M24 42c1-17.4 11.8-28.4 26-28.4S75 24.6 76 42c-5-11-10.6-16-19.4-16-4.2 0-7.2 1.8-10.4 4-4.8 3.6-12.6 4.6-22.2 12z" fill={color} strokeWidth={sw} />;
    case "court":
      return <path d="M25.5 42c1.8-15 11.8-24.6 24.5-24.6S72.7 27 74.5 42c-5-10-15.4-14-24.5-14s-19.5 4-24.5 14z" fill={color} strokeWidth={sw} />;
    default: // long, carré, tresses
      return <path d="M23 43c1-17.4 12-28.4 27-28.4S76 25.6 77 43c-5.6-12-11.6-17.4-20.6-17.4-6.6 0-10.2 3.6-15.6 7.2C35.4 36.4 29.6 36.6 23 43z" fill={color} strokeWidth={sw} />;
  }
}

/* ---------- Lunettes et accessoires ---------- */

function Glasses({ kind }: { kind: AvatarConfig["glasses"] }) {
  if (kind === "aucune") return null;

  if (kind === "rondes") {
    return (
      <g fill="#FFFFFF" fillOpacity="0.22" strokeWidth={W.mid}>
        <circle cx="38" cy="45" r="9.4" />
        <circle cx="62" cy="45" r="9.4" />
        <path d="M47.4 44.6h5.2" fill="none" />
        <path d="M28.6 43.4 24 41.4M71.4 43.4 76 41.4" fill="none" strokeWidth={W.thin} />
      </g>
    );
  }
  if (kind === "carrées") {
    return (
      <g fill="#FFFFFF" fillOpacity="0.22" strokeWidth={W.mid}>
        <path d="M28.4 38.6h19.2v12.8H28.4zM52.4 38.6h19.2v12.8H52.4z" />
        <path d="M47.6 44.6h4.8" fill="none" />
        <path d="M28.4 40.4 24 38.6M71.6 40.4 76 38.6" fill="none" strokeWidth={W.thin} />
      </g>
    );
  }
  if (kind === "chat") {
    return (
      <g fill="#FFFFFF" fillOpacity="0.22" strokeWidth={W.mid}>
        <path d="M28 40c0-2.4 3-3.4 9.6-3.4 6 0 9.4 1.6 9.4 5.6 0 4.6-3.6 8-9.6 8-6.4 0-9.4-3.4-9.4-10.2z" />
        <path d="M72 40c0-2.4-3-3.4-9.6-3.4-6 0-9.4 1.6-9.4 5.6 0 4.6 3.6 8 9.6 8 6.4 0 9.4-3.4 9.4-10.2z" />
        <path d="M47 42.4h6" fill="none" />
      </g>
    );
  }
  // soleil
  return (
    <g strokeWidth={W.mid}>
      <path d="M27.6 38.6h20v6.6c0 4.4-3.4 7-8.8 7s-11.2-2.6-11.2-7z" fill={INK} />
      <path d="M72.4 38.6h-20v6.6c0 4.4 3.4 7 8.8 7s11.2-2.6 11.2-7z" fill={INK} />
      <path d="M47.6 40.4h4.8" fill="none" />
    </g>
  );
}

function Accessory({ kind }: { kind: AvatarConfig["accessory"] }) {
  if (kind === "aucun") return null;

  if (kind === "boucles") {
    return (
      <g fill="#E8C05A" strokeWidth={W.thin}>
        <circle cx="23.5" cy="53" r="2.8" />
        <circle cx="76.5" cy="53" r="2.8" />
      </g>
    );
  }
  if (kind === "créoles") {
    return (
      <g fill="none" stroke="#E8C05A" strokeWidth="2.4">
        <circle cx="23.5" cy="55.5" r="5" />
        <circle cx="76.5" cy="55.5" r="5" />
      </g>
    );
  }
  if (kind === "piercing") {
    return <circle cx="45" cy="56.5" r="1.6" fill="#E8C05A" strokeWidth="1.2" />;
  }
  // grain de beauté
  return <circle cx="60.5" cy="62" r="1.5" fill={INK} stroke="none" />;
}

/* ---------- Utilitaires couleur ---------- */

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
