"use client";

import type { Gif } from "@/lib/stickers";

/** « GIF » maison : une animation SVG en boucle, sans fichier ni service externe. */
export default function GifCard({ gif, size = 150 }: { gif: Gif; size?: number }) {
  const [a, b] = gif.colors;
  const id = `g-${gif.id}`;

  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{ width: size, height: size * 0.72 }}
    >
      <svg viewBox="0 0 100 72" width={size} height={size * 0.72} role="img" aria-label={gif.label}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={a} />
            <stop offset="100%" stopColor={b} />
          </linearGradient>
        </defs>
        <rect width="100" height="72" fill={`url(#${id})`} />

        {gif.kind === "confetti" && <Confetti />}
        {gif.kind === "pulse" && <Pulse />}
        {gif.kind === "bounce" && <Bounce />}
        {gif.kind === "wave" && <Wave />}
        {gif.kind === "spin" && <Spin />}
        {gif.kind === "rain" && <Rain />}

        <text
          x="50" y="63" textAnchor="middle"
          fontSize="10" fontWeight="700" fill="#fff"
          style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,.25)", strokeWidth: 2.5 }}
        >
          {gif.label}
        </text>
      </svg>
    </div>
  );
}

function Confetti() {
  const bits = [12, 26, 40, 54, 68, 82];
  return (
    <g>
      {bits.map((x, i) => (
        <rect key={x} x={x} y="-8" width="4.5" height="7" rx="1" fill="#fff" opacity="0.9"
          transform={`rotate(${i * 35} ${x} 0)`}>
          <animate attributeName="y" from="-8" to="60" dur={`${1.1 + i * 0.16}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;1;0" dur={`${1.1 + i * 0.16}s`} repeatCount="indefinite" />
        </rect>
      ))}
    </g>
  );
}

function Pulse() {
  return (
    <g>
      {[0, 0.4, 0.8].map((delay) => (
        <circle key={delay} cx="50" cy="30" r="8" fill="none" stroke="#fff" strokeWidth="2.5">
          <animate attributeName="r" from="8" to="30" dur="1.6s" begin={`${delay}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.9" to="0" dur="1.6s" begin={`${delay}s`} repeatCount="indefinite" />
        </circle>
      ))}
      <path d="M50 38c-9-6-14-11-14-16a7 7 0 0 1 14-3 7 7 0 0 1 14 3c0 5-5 10-14 16z" fill="#fff">
        <animateTransform attributeName="transform" type="scale" values="1;1.16;1"
          dur="0.9s" repeatCount="indefinite" additive="sum" />
      </path>
    </g>
  );
}

function Bounce() {
  return (
    <g>
      {[32, 50, 68].map((x, i) => (
        <circle key={x} cx={x} cy="30" r="6.5" fill="#fff">
          <animate attributeName="cy" values="30;16;30" dur="0.75s"
            begin={`${i * 0.13}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </g>
  );
}

function Wave() {
  return (
    <g>
      <path d="M44 42c0-3 2-5 4-9 1.6-3.2 1-7 3-8s3.4 1 3 4c-.6 4-1.4 6-1 6s2.4-4 4-7 3.6-2.6 4-1c.4 1.4-2 6-2 7s2-3 3.4-4 3-.4 2.6 1.6c-.4 2-4 9-6 12-2.6 4-6 6-10 5s-5-4-5-6.6z"
        fill="#fff">
        <animateTransform attributeName="transform" type="rotate"
          values="-16 50 44; 16 50 44; -16 50 44" dur="1s" repeatCount="indefinite" />
      </path>
    </g>
  );
}

function Spin() {
  return (
    <g>
      <g>
        <animateTransform attributeName="transform" type="rotate"
          from="0 50 30" to="360 50 30" dur="2.4s" repeatCount="indefinite" />
        {[0, 72, 144, 216, 288].map((deg) => (
          <circle key={deg} cx="50" cy="12" r="4" fill="#fff" opacity="0.92"
            transform={`rotate(${deg} 50 30)`} />
        ))}
      </g>
      <circle cx="50" cy="30" r="6" fill="#fff" />
    </g>
  );
}

function Rain() {
  const xs = [16, 30, 44, 58, 72, 86];
  return (
    <g>
      {xs.map((x, i) => (
        <path key={x} d={`M${x} -6 l3 5 -6 0 z`} fill="#fff" opacity="0.9">
          <animate attributeName="transform" attributeType="XML" type="translate"
            values="0 0; 0 58" dur={`${0.9 + i * 0.13}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;1;0" dur={`${0.9 + i * 0.13}s`} repeatCount="indefinite" />
        </path>
      ))}
      <circle cx="50" cy="26" r="9" fill="#fff" opacity="0.95" />
    </g>
  );
}
