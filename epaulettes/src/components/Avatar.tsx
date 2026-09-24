"use client";

/** Avatar déterministe : dégradé de la charte + initiales. Aucune dépendance, jamais de trou dans l'UI. */
const GRADIENTS: [string, string][] = [
  ["#25C7D9", "#0E8FA3"],
  ["#F6577C", "#C92F55"],
  ["#25C7D9", "#F6577C"],
  ["#F6577C", "#FFA36C"],
  ["#4ED8C0", "#25C7D9"],
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function initialsOf(first: string, last = ""): string {
  const a = first.trim()[0] ?? "É";
  const b = last.trim()[0] ?? "";
  return (a + b).toUpperCase();
}

export default function Avatar({
  seed, first, last, photo, size = 44, className = "", ring = false,
}: {
  seed: string; first: string; last?: string; photo?: string;
  size?: number; className?: string; ring?: boolean;
}) {
  const [from, to] = GRADIENTS[hash(seed) % GRADIENTS.length];
  const style: React.CSSProperties = { width: size, height: size };

  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo}
        alt={`${first} ${last ?? ""}`.trim()}
        style={style}
        className={`shrink-0 rounded-full object-cover ${ring ? "ring-2 ring-white" : ""} ${className}`}
      />
    );
  }

  return (
    <div
      style={{ ...style, background: `linear-gradient(135deg, ${from}, ${to})` }}
      className={`shrink-0 grid place-items-center rounded-full font-semibold text-white select-none ${ring ? "ring-2 ring-white" : ""} ${className}`}
      aria-hidden
    >
      <span style={{ fontSize: size * 0.38 }}>{initialsOf(first, last)}</span>
    </div>
  );
}
