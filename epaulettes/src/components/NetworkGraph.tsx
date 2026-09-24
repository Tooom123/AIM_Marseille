"use client";

import { useEffect, useRef, useState } from "react";
import { MEMBERS, buildAdjacency } from "@/lib/members";
import { initialsOf } from "./Avatar";

type Node = { id: string; x: number; y: number; vx: number; vy: number; deg: number; label: string };

/**
 * Graphe du réseau en canvas : force-directed maison, sans dépendance.
 * Les membres peu connectées sont colorées en rose — ce sont les trous à combler.
 */
export default function NetworkGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // `hoverRef` pilote le dessin (lecture synchrone dans la boucle canvas),
  // `hover` ne sert qu'à l'infobulle React.
  const [hover, setHover] = useState<string | null>(null);
  const hoverRef = useRef<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Références non nulles, pour que le narrowing survive dans les closures.
    const cv = canvas;
    const c2d = ctx;

    const adj = buildAdjacency();
    const edges: [string, string][] = [];
    const seen = new Set<string>();
    for (const [a, set] of adj) {
      for (const b of set) {
        const key = [a, b].sort().join("|");
        if (!seen.has(key)) { seen.add(key); edges.push([a, b]); }
      }
    }

    let width = canvas.clientWidth;
    let height = canvas.clientHeight;

    const nodes: Node[] = MEMBERS.map((m, i) => {
      const angle = (i / MEMBERS.length) * Math.PI * 2;
      return {
        id: m.id,
        x: width / 2 + Math.cos(angle) * width * 0.28,
        y: height / 2 + Math.sin(angle) * height * 0.32,
        vx: 0, vy: 0,
        deg: adj.get(m.id)?.size ?? 0,
        label: `${m.firstName} · ${m.job}`,
      };
    });
    const byId = new Map(nodes.map((n) => [n.id, n]));

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = cv.clientWidth;
      height = cv.clientHeight;
      cv.width = width * dpr;
      cv.height = height * dpr;
      c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);

    let raf = 0;
    let tick = 0;

    function step() {
      tick++;
      // Répulsion (O(n²) : 22 nœuds, c'est gratuit)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          let dx = b.x - a.x, dy = b.y - a.y;
          let d2 = dx * dx + dy * dy;
          if (d2 < 1) { d2 = 1; dx = Math.random() - 0.5; dy = Math.random() - 0.5; }
          const f = 2600 / d2;
          const d = Math.sqrt(d2);
          const fx = (dx / d) * f, fy = (dy / d) * f;
          a.vx -= fx; a.vy -= fy; b.vx += fx; b.vy += fy;
        }
      }
      // Attraction sur les liens
      for (const [aId, bId] of edges) {
        const a = byId.get(aId), b = byId.get(bId);
        if (!a || !b) continue;
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1;
        const f = (d - 95) * 0.012;
        const fx = (dx / d) * f, fy = (dy / d) * f;
        a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
      }
      // Recentrage + amortissement
      for (const n of nodes) {
        n.vx += (width / 2 - n.x) * 0.0022;
        n.vy += (height / 2 - n.y) * 0.0022;
        n.vx *= 0.86; n.vy *= 0.86;
        n.x += n.vx; n.y += n.vy;
        const pad = 34;
        n.x = Math.max(pad, Math.min(width - pad, n.x));
        n.y = Math.max(pad, Math.min(height - pad, n.y));
      }
      draw();
      // On laisse le layout se stabiliser puis on économise le CPU.
      if (tick < 600) raf = requestAnimationFrame(step);
    }

    function draw() {
      const c = c2d;
      c.clearRect(0, 0, width, height);
      const hoveredId = hoverRef.current;
      const hoveredNeighbors = hoveredId ? adj.get(hoveredId) : null;

      // Liens
      for (const [aId, bId] of edges) {
        const a = byId.get(aId), b = byId.get(bId);
        if (!a || !b) continue;
        const touched = hoveredId === aId || hoveredId === bId;
        c.strokeStyle = touched ? "rgba(246,87,124,.55)" : "rgba(18,51,58,.13)";
        c.lineWidth = touched ? 2 : 1;
        c.beginPath();
        c.moveTo(a.x, a.y);
        c.lineTo(b.x, b.y);
        c.stroke();
      }

      // Nœuds
      for (const n of nodes) {
        const isHover = hoveredId === n.id;
        const isNeighbor = hoveredNeighbors?.has(n.id) ?? false;
        const weak = n.deg < 2;
        const r = 12 + Math.min(n.deg, 5) * 2.2 + (isHover ? 4 : 0);

        c.globalAlpha = hoveredId && !isHover && !isNeighbor ? 0.35 : 1;
        c.fillStyle = weak ? "#F6577C" : "#25C7D9";
        c.beginPath();
        c.arc(n.x, n.y, r, 0, Math.PI * 2);
        c.fill();

        c.strokeStyle = "#fff";
        c.lineWidth = 2;
        c.stroke();

        c.fillStyle = "#fff";
        c.font = `600 ${Math.round(r * 0.78)}px ui-sans-serif, system-ui, sans-serif`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        const m = MEMBERS.find((x) => x.id === n.id)!;
        c.fillText(initialsOf(m.firstName, m.lastName), n.x, n.y + 0.5);
        c.globalAlpha = 1;
      }
    }

    raf = requestAnimationFrame(step);

    function pick(clientX: number, clientY: number): string | null {
      const rect = cv.getBoundingClientRect();
      const x = clientX - rect.left, y = clientY - rect.top;
      let best: string | null = null;
      let bestD = 24;
      for (const n of nodes) {
        const d = Math.hypot(n.x - x, n.y - y);
        if (d < bestD) { bestD = d; best = n.id; }
      }
      return best;
    }

    const onMove = (e: MouseEvent) => {
      const id = pick(e.clientX, e.clientY);
      if (id !== hoverRef.current) {
        setHover(id);
        hoverRef.current = id;
        draw();
      }
      cv.style.cursor = id ? "pointer" : "default";
    };
    const onLeave = () => { setHover(null); hoverRef.current = null; draw(); };

    cv.addEventListener("mousemove", onMove);
    cv.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      cv.removeEventListener("mousemove", onMove);
      cv.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const hovered = hover ? MEMBERS.find((m) => m.id === hover) : null;

  return (
    <div className="relative size-full bg-gradient-to-br from-cream/60 to-bg">
      <canvas ref={canvasRef} className="size-full" />
      <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-1.5 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/90 px-2.5 py-1 shadow-sm backdrop-blur">
          <span className="size-2.5 rounded-full bg-turquoise" /> bien connectée
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/90 px-2.5 py-1 shadow-sm backdrop-blur">
          <span className="size-2.5 rounded-full bg-rose" /> à reconnecter
        </span>
      </div>
      {hovered && (
        <div className="pointer-events-none absolute bottom-4 left-4 right-4 rounded-xl bg-surface/95 px-3.5 py-2.5 shadow-lg backdrop-blur">
          <p className="text-sm font-semibold">{hovered.firstName} {hovered.lastName}</p>
          <p className="text-xs text-ink-soft">{hovered.job} · {hovered.neighborhood}</p>
        </div>
      )}
    </div>
  );
}
