"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import CharacterAvatar from "./CharacterAvatar";
import { MEMBERS, MEMBERS_BY_ID, buildAdjacency } from "@/lib/members";
import { avatarFromSeed, type AvatarConfig } from "@/lib/avatarOptions";
import { introPath } from "@/lib/matching";

type Node = { id: string; x: number; y: number; vx: number; vy: number; deg: number };

/**
 * Graphe du réseau : qui connaît qui, et par qui passer pour être présentée.
 * Force-directed maison en canvas, avec les avatars en guise de nœuds.
 */
export default function NetworkGraph({
  selectedId,
  onSelect,
  viewerId,
  viewerAvatar,
  viewerName,
}: {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  viewerId: string;
  viewerAvatar: AvatarConfig;
  viewerName: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [images, setImages] = useState<Map<string, HTMLImageElement>>(new Map());

  // Les refs portent l'état lu par la boucle de dessin : elle doit rester
  // synchrone, alors que le state React sert à l'affichage HTML.
  const hoverRef = useRef<string | null>(null);
  const selectedRef = useRef<string | null>(selectedId);
  const imagesRef = useRef(images);
  const onSelectRef = useRef(onSelect);
  const drawRef = useRef<() => void>(() => {});

  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
  useEffect(() => { selectedRef.current = selectedId; drawRef.current(); }, [selectedId]);
  useEffect(() => { imagesRef.current = images; drawRef.current(); }, [images]);

  const adj = useMemo(() => buildAdjacency(), []);

  /** Le chemin d'introduction est surligné : c'est la réponse « passez par… ». */
  const path = useMemo(
    () => (selectedId && selectedId !== viewerId ? introPath(viewerId, selectedId) : null),
    [selectedId, viewerId],
  );
  const pathRef = useRef<string[] | null>(path);
  useEffect(() => { pathRef.current = path; drawRef.current(); }, [path]);

  // Les avatars sont du SVG : on les rastérise une fois pour les dessiner au canvas.
  useEffect(() => {
    let cancelled = false;
    const loaded = new Map<string, HTMLImageElement>();

    const entries: { id: string; config: AvatarConfig }[] = [
      ...MEMBERS.map((m) => ({ id: m.id, config: avatarFromSeed(m.id) })),
      { id: viewerId, config: viewerAvatar },
    ];

    Promise.all(
      entries.map(
        (m) =>
          new Promise<void>((resolve) => {
            const svg = renderToStaticMarkup(
              <CharacterAvatar config={m.config} size={96} rounded={false} />,
            );
            const img = new Image();
            img.onload = () => { loaded.set(m.id, img); resolve(); };
            img.onerror = () => resolve();
            img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
          }),
      ),
    ).then(() => {
      if (!cancelled) setImages(loaded);
    });

    return () => { cancelled = true; };
  }, [viewerId, viewerAvatar]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cv = canvas;
    const c2d = ctx;

    const edges: [string, string][] = [];
    const seen = new Set<string>();
    for (const [a, set] of adj) {
      for (const b of set) {
        const key = [a, b].sort().join("|");
        if (!seen.has(key)) { seen.add(key); edges.push([a, b]); }
      }
    }

    let width = cv.clientWidth;
    let height = cv.clientHeight;

    const ids = [...MEMBERS.map((m) => m.id), viewerId];
    const nodes: Node[] = ids.map((id, i) => {
      const angle = (i / ids.length) * Math.PI * 2;
      const isViewer = id === viewerId;
      return {
        id,
        // L'utilisatrice démarre au centre : c'est son point de vue.
        x: isViewer ? width / 2 : width / 2 + Math.cos(angle) * width * 0.26,
        y: isViewer ? height / 2 : height / 2 + Math.sin(angle) * height * 0.3,
        vx: 0, vy: 0,
        deg: adj.get(id)?.size ?? 0,
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
      draw();
    }

    const radiusOf = (n: Node) => (n.id === viewerId ? 23 : 15 + Math.min(n.deg, 5) * 1.9);

    function draw() {
      const hovered = hoverRef.current;
      const selected = selectedRef.current;
      const imgs = imagesRef.current;
      const activePath = pathRef.current;
      const focus = hovered ?? selected;
      const neighbors = focus ? adj.get(focus) : null;
      const pathSet = new Set(activePath ?? []);
      const pathEdges = new Set<string>();
      if (activePath) {
        for (let i = 0; i < activePath.length - 1; i++) {
          pathEdges.add([activePath[i], activePath[i + 1]].sort().join("|"));
        }
      }

      c2d.clearRect(0, 0, width, height);

      // Liens
      for (const [aId, bId] of edges) {
        const a = byId.get(aId), b = byId.get(bId);
        if (!a || !b) continue;
        const onPath = pathEdges.has([aId, bId].sort().join("|"));
        const touched = focus === aId || focus === bId;

        if (onPath) {
          c2d.strokeStyle = "#F6577C";
          c2d.lineWidth = 3.4;
        } else if (touched) {
          c2d.strokeStyle = "rgba(37,199,217,.85)";
          c2d.lineWidth = 2.4;
        } else {
          c2d.strokeStyle = focus ? "rgba(18,51,58,.12)" : "rgba(18,51,58,.22)";
          c2d.lineWidth = 1.3;
        }
        c2d.beginPath();
        c2d.moveTo(a.x, a.y);
        c2d.lineTo(b.x, b.y);
        c2d.stroke();
      }

      // Nœuds
      for (const n of nodes) {
        const isFocus = focus === n.id;
        const isNeighbor = neighbors?.has(n.id) ?? false;
        const onPath = pathSet.has(n.id);
        const dim = focus && !isFocus && !isNeighbor && !onPath;
        const r = radiusOf(n) + (isFocus ? 4 : onPath ? 2 : 0);

        c2d.globalAlpha = dim ? 0.3 : 1;

        const img = imgs.get(n.id);
        if (img) {
          c2d.save();
          c2d.beginPath();
          c2d.arc(n.x, n.y, r, 0, Math.PI * 2);
          c2d.closePath();
          c2d.clip();
          c2d.drawImage(img, n.x - r, n.y - r, r * 2, r * 2);
          c2d.restore();
        } else {
          c2d.fillStyle = "#25C7D9";
          c2d.beginPath();
          c2d.arc(n.x, n.y, r, 0, Math.PI * 2);
          c2d.fill();
        }

        // Anneau : rose sur le chemin d'introduction, turquoise au survol.
        const isViewer = n.id === viewerId;
        c2d.strokeStyle = isViewer ? "#12333A" : onPath ? "#F6577C" : isFocus ? "#25C7D9" : "#FFFFFF";
        c2d.lineWidth = isViewer ? 3.4 : onPath || isFocus ? 3.2 : 2.2;
        c2d.beginPath();
        c2d.arc(n.x, n.y, r, 0, Math.PI * 2);
        c2d.stroke();

        // Prénom sous l'avatar, seulement quand le graphe est lisible.
        if (!dim && (isFocus || onPath || isViewer || !focus)) {
          const label = isViewer ? viewerName : MEMBERS_BY_ID[n.id]?.firstName;
          if (label) {
            c2d.fillStyle = "#12333A";
            c2d.font = `${isViewer ? "700 10" : "600 9"}px ui-sans-serif, system-ui, sans-serif`;
            c2d.textAlign = "center";
            c2d.textBaseline = "top";
            c2d.fillText(label, n.x, n.y + r + 3);
          }
        }
        c2d.globalAlpha = 1;
      }
    }
    drawRef.current = draw;

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);

    let raf = 0;
    let tick = 0;

    function step() {
      tick++;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          let dx = b.x - a.x, dy = b.y - a.y;
          let d2 = dx * dx + dy * dy;
          if (d2 < 1) { d2 = 1; dx = Math.random() - 0.5; dy = Math.random() - 0.5; }
          const f = 3400 / d2;
          const d = Math.sqrt(d2);
          const fx = (dx / d) * f, fy = (dy / d) * f;
          a.vx -= fx; a.vy -= fy; b.vx += fx; b.vy += fy;
        }
      }
      for (const [aId, bId] of edges) {
        const a = byId.get(aId), b = byId.get(bId);
        if (!a || !b) continue;
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1;
        const f = (d - 100) * 0.012;
        const fx = (dx / d) * f, fy = (dy / d) * f;
        a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
      }
      for (const n of nodes) {
        n.vx += (width / 2 - n.x) * 0.006;
        n.vy += (height / 2 - n.y) * 0.006;
        n.vx *= 0.86; n.vy *= 0.86;
        n.x += n.vx; n.y += n.vy;
        const pad = radiusOf(n) + 14;
        n.x = Math.max(pad, Math.min(width - pad, n.x));
        n.y = Math.max(pad, Math.min(height - pad, n.y));
      }
      draw();
      if (tick < 700) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);

    function pick(clientX: number, clientY: number): string | null {
      const rect = cv.getBoundingClientRect();
      const x = clientX - rect.left, y = clientY - rect.top;
      let best: string | null = null;
      let bestD = Infinity;
      for (const n of nodes) {
        const d = Math.hypot(n.x - x, n.y - y);
        if (d < radiusOf(n) + 4 && d < bestD) { bestD = d; best = n.id; }
      }
      return best;
    }

    const onMove = (e: MouseEvent) => {
      const id = pick(e.clientX, e.clientY);
      if (id !== hoverRef.current) {
        hoverRef.current = id;
        setHover(id);
        draw();
      }
      cv.style.cursor = id ? "pointer" : "default";
    };
    const onLeave = () => { hoverRef.current = null; setHover(null); draw(); };
    const onClick = (e: MouseEvent) => {
      const id = pick(e.clientX, e.clientY);
      onSelectRef.current(id);
    };

    cv.addEventListener("mousemove", onMove);
    cv.addEventListener("mouseleave", onLeave);
    cv.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      cv.removeEventListener("mousemove", onMove);
      cv.removeEventListener("mouseleave", onLeave);
      cv.removeEventListener("click", onClick);
    };
  }, [adj, viewerId, viewerName]);

  const hovered = hover && hover !== viewerId ? MEMBERS_BY_ID[hover] : null;

  return (
    <div className="relative size-full bg-gradient-to-br from-cream/50 to-bg">
      <canvas ref={canvasRef} className="size-full" />
      {hovered && (
        <div className="pointer-events-none absolute bottom-3 left-3 animate-fade-up rounded-xl bg-surface/95 px-3 py-2 shadow-lg backdrop-blur">
          <p className="text-sm font-semibold">{hovered.firstName} {hovered.lastName}</p>
          <p className="text-xs text-ink-soft">
            {hovered.job} · {adj.get(hovered.id)?.size ?? 0} lien
            {(adj.get(hovered.id)?.size ?? 0) > 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
