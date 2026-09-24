"use client";

import {
  Map as MlMap, Marker, Popup, NavigationControl, setWorkerUrl,
  type LayerSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import { EVENT_FORMAT_LABEL, formatRange, relativeDay } from "@/lib/events";
import { MEMBERS } from "@/lib/members";
import type { Epaulette } from "@/lib/types";

/** Style vectoriel coloré, gratuit et sans clé (CARTO Voyager, données OSM). */
const STYLE_URL = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

const MARSEILLE: [number, number] = [5.3772, 43.2921];

// MapLibre charge son worker depuis un fichier séparé. Le bundler ne le sert pas
// de manière fiable, alors on le sert depuis /public : ça marche en dev comme en prod.
setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

export default function Map3D({
  events,
  showMembers,
  onSelect,
  selectedId,
}: {
  events: Epaulette[];
  showMembers: boolean;
  onSelect: (id: string) => void;
  selectedId: string | null;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MlMap | null>(null);
  const markers = useRef<Marker[]>([]);
  // Le callback est lu dans les écouteurs des marqueurs : on le garde à jour via un effet,
  // jamais pendant le rendu.
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // Initialisation : une seule fois.
  useEffect(() => {
    if (!container.current || map.current) return;

    const m = new MlMap({
      container: container.current,
      style: STYLE_URL,
      center: MARSEILLE,
      zoom: 12.4,
      pitch: 55,
      bearing: -18,
      canvasContextAttributes: { antialias: true },
      attributionControl: { compact: true },
    });
    map.current = m;

    m.addControl(new NavigationControl({ visualizePitch: true }), "top-right");

    m.on("load", () => {
      // Bâtiments extrudés : c'est ce qui donne le relief 3D.
      const layers: LayerSpecification[] = m.getStyle().layers ?? [];
      const firstSymbol = layers.find((l) => l.type === "symbol")?.id;

      // Le style Positron dessine déjà les bâtiments à plat : on les masque
      // pour ne garder que notre extrusion.
      for (const id of ["building", "building-top"]) {
        if (m.getLayer(id)) m.setLayoutProperty(id, "visibility", "none");
      }

      if (m.getSource("carto")) {
        m.addLayer(
          {
            id: "buildings-3d",
            type: "fill-extrusion",
            source: "carto",
            "source-layer": "building",
            minzoom: 12,
            paint: {
              // Dégradé de la charte : les immeubles hauts tirent vers le turquoise.
              "fill-extrusion-color": [
                "interpolate", ["linear"],
                ["coalesce", ["get", "render_height"], 10],
                0, "#F7E9D8",
                18, "#E8CDB4",
                45, "#A9D9DE",
                90, "#5FC4D2",
              ],
              "fill-extrusion-height": [
                "interpolate", ["linear"], ["zoom"],
                12, 0,
                12.6, ["*", ["coalesce", ["get", "render_height"], 12], 1.6],
              ],
              "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
              "fill-extrusion-opacity": 0.9,
            },
          },
          firstSymbol,
        );
      }

      // Rotation lente : la carte "vit" pendant le pitch.
      let raf = 0;
      let paused = false;
      const spin = () => {
        if (!paused && map.current) map.current.setBearing(map.current.getBearing() + 0.045);
        raf = requestAnimationFrame(spin);
      };
      raf = requestAnimationFrame(spin);
      const stop = () => { paused = true; };
      const start = () => { paused = false; };
      m.on("mousedown", stop);
      m.on("touchstart", stop);
      m.on("mouseup", start);
      m.on("touchend", start);
      m.once("remove", () => cancelAnimationFrame(raf));
    });

    return () => {
      m.remove();
      map.current = null;
    };
  }, []);

  // Marqueurs : reconstruits quand les données changent.
  useEffect(() => {
    const m = map.current;
    if (!m) return;

    markers.current.forEach((mk) => mk.remove());
    markers.current = [];

    if (showMembers) {
      for (const member of MEMBERS) {
        const el = document.createElement("div");
        el.className = "size-2.5 rounded-full bg-[#25C7D9] ring-2 ring-white/90 shadow";
        el.title = `${member.firstName} · ${member.job}`;
        markers.current.push(
          new Marker({ element: el, anchor: "center" })
            .setLngLat(member.coords)
            .addTo(m),
        );
      }
    }

    for (const ev of events) {
      const el = document.createElement("button");
      el.type = "button";
      const isSel = ev.id === selectedId;
      el.className = [
        "grid place-items-center rounded-full text-white font-bold shadow-lg transition-transform",
        isSel ? "size-11 ring-4 ring-white animate-ring" : "size-9 ring-2 ring-white hover:scale-110",
      ].join(" ");
      el.style.background =
        ev.format === "apero" ? "#F6577C" : ev.format === "visio" ? "#25C7D9" : "#12333A";
      el.style.cursor = "pointer";
      el.innerHTML = `<span style="font-size:13px">${ev.attendees.length}</span>`;
      el.setAttribute("aria-label", ev.title);
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectRef.current(ev.id);
      });

      const popup = new Popup({ offset: 22, closeButton: false, maxWidth: "260px" })
        .setHTML(`
          <div style="padding:12px 14px;font-family:inherit">
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#5A7178">
              ${EVENT_FORMAT_LABEL[ev.format]} · ${relativeDay(ev.date)}
            </div>
            <div style="font-weight:650;margin-top:3px;color:#12333A">${ev.title}</div>
            <div style="font-size:12px;color:#5A7178;margin-top:3px">
              ${ev.place} · ${formatRange(ev.date, ev.endDate)}
            </div>
          </div>
        `);

      markers.current.push(
        new Marker({ element: el, anchor: "center" })
          .setLngLat(ev.coords)
          .setPopup(popup)
          .addTo(m),
      );
    }
  }, [events, showMembers, selectedId]);

  // Transition vers l'événement sélectionné : `flyTo` prend de l'altitude puis
  // redescend, ce qui rend le déplacement lisible au lieu d'un saut sec.
  const hasFlown = useRef(false);

  useEffect(() => {
    const m = map.current;
    if (!m || !selectedId) return;
    const ev = events.find((e) => e.id === selectedId);
    if (!ev) return;

    const fly = () => {
      // Premier cadrage : on se pose sans animation, sinon la carte part de loin.
      if (!hasFlown.current) {
        hasFlown.current = true;
        m.jumpTo({ center: ev.coords, zoom: 14.6, pitch: 58 });
        return;
      }
      m.flyTo({
        center: ev.coords,
        zoom: 15.6,
        pitch: 60,
        bearing: m.getBearing() + 25,
        // `curve` et `speed` dessinent la parabole : on monte, on traverse, on se pose.
        curve: 1.5,
        speed: 0.9,
        essential: true,
      });
    };

    if (m.isStyleLoaded()) fly();
    else m.once("load", fly);
  }, [selectedId, events]);

  return <div ref={container} className="size-full" />;
}
