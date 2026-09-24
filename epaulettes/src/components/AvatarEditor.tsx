"use client";

import { useState } from "react";
import CharacterAvatar from "./CharacterAvatar";
import { Button } from "./ui";
import {
  ACCESSORIES, BACKGROUNDS, BROW_SHAPES, EYE_COLORS, EYE_SHAPES, EYE_SIZES, FACE_SHAPES,
  FACE_WIDTHS, GLASSES, HAIR_COLORS, HAIR_STYLES, LIP_COLORS, MOUTH_SHAPES, NOSE_SHAPES,
  SKIN_TONES, TILTS, TOP_COLORS, TOP_STYLES,
  randomAvatar, type AvatarConfig,
} from "@/lib/avatarOptions";

type TabId = "visage" | "cheveux" | "traits" | "style";

const TABS: { id: TabId; label: string }[] = [
  { id: "visage", label: "Visage" },
  { id: "cheveux", label: "Cheveux" },
  { id: "traits", label: "Traits" },
  { id: "style", label: "Style" },
];

export default function AvatarEditor({
  config, onChange, compact = false,
}: {
  config: AvatarConfig;
  onChange: (c: AvatarConfig) => void;
  compact?: boolean;
}) {
  const [tab, setTab] = useState<TabId>("visage");
  const set = <K extends keyof AvatarConfig>(k: K, v: AvatarConfig[K]) =>
    onChange({ ...config, [k]: v });

  return (
    <div className={compact ? "space-y-4" : "grid gap-5 sm:grid-cols-[auto_1fr]"}>
      {/* Aperçu */}
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-3xl border border-line bg-surface p-3 shadow-sm">
          <CharacterAvatar config={config} size={compact ? 130 : 168} />
        </div>
        <Button size="sm" variant="outline" onClick={() => onChange(randomAvatar())}>
          Au hasard
        </Button>
      </div>

      {/* Contrôles */}
      <div className="min-w-0">
        <div className="mb-3 flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                tab === t.id ? "bg-turquoise/14 text-[#0E7C8C]" : "text-ink-soft hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {tab === "visage" && (
            <>
              <Swatches label="Carnation" colors={SKIN_TONES} value={config.skin}
                onPick={(v) => set("skin", v)} />
              <Chips label="Forme du visage" options={FACE_SHAPES} value={config.face}
                onPick={(v) => set("face", v)} />
              <Chips label="Largeur" options={FACE_WIDTHS} value={config.faceWidth}
                onPick={(v) => set("faceWidth", v)} />
              <Chips label="Inclinaison" options={TILTS} value={config.tilt}
                onPick={(v) => set("tilt", v)} />
              <Toggle label="Taches de rousseur" value={config.freckles}
                onToggle={() => set("freckles", !config.freckles)} />
              <Toggle label="Joues rosées" value={config.blush}
                onToggle={() => set("blush", !config.blush)} />
            </>
          )}

          {tab === "cheveux" && (
            <>
              <Chips label="Coupe" options={HAIR_STYLES} value={config.hairStyle}
                onPick={(v) => set("hairStyle", v)} />
              <Swatches label="Couleur" colors={HAIR_COLORS} value={config.hairColor}
                onPick={(v) => set("hairColor", v)} />
            </>
          )}

          {tab === "traits" && (
            <>
              <Chips label="Yeux" options={EYE_SHAPES} value={config.eyeShape}
                onPick={(v) => set("eyeShape", v)} />
              <Chips label="Taille des yeux" options={EYE_SIZES} value={config.eyeSize}
                onPick={(v) => set("eyeSize", v)} />
              <Swatches label="Couleur des yeux" colors={EYE_COLORS} value={config.eyeColor}
                onPick={(v) => set("eyeColor", v)} />
              <Chips label="Sourcils" options={BROW_SHAPES} value={config.brow}
                onPick={(v) => set("brow", v)} />
              <Chips label="Nez" options={NOSE_SHAPES} value={config.nose}
                onPick={(v) => set("nose", v)} />
              <Chips label="Bouche" options={MOUTH_SHAPES} value={config.mouth}
                onPick={(v) => set("mouth", v)} />
              <Swatches label="Lèvres" colors={LIP_COLORS} value={config.lips}
                onPick={(v) => set("lips", v)} />
            </>
          )}

          {tab === "style" && (
            <>
              <Chips label="Lunettes" options={GLASSES} value={config.glasses}
                onPick={(v) => set("glasses", v)} />
              <Chips label="Accessoires" options={ACCESSORIES} value={config.accessory}
                onPick={(v) => set("accessory", v)} />
              <Chips label="Tenue" options={TOP_STYLES} value={config.topStyle}
                onPick={(v) => set("topStyle", v)} />
              <Swatches label="Couleur du haut" colors={TOP_COLORS} value={config.top}
                onPick={(v) => set("top", v)} />
              <Swatches label="Fond" colors={BACKGROUNDS} value={config.background}
                onPick={(v) => set("background", v)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Swatches({
  label, colors, value, onPick,
}: { label: string; colors: readonly string[]; value: string; onPick: (c: string) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
      <div className="flex flex-wrap gap-2">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onPick(c)}
            style={{ background: c }}
            aria-label={c}
            className={`size-8 rounded-full border transition ${
              value === c
                ? "border-ink ring-2 ring-ink/25 ring-offset-2"
                : "border-black/10 hover:scale-110"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function Chips<T extends string>({
  label, options, value, onPick,
}: { label: string; options: readonly T[]; value: T; onPick: (v: T) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onPick(o)}
            className={`rounded-lg border px-2.5 py-1.5 text-sm capitalize transition ${
              value === o
                ? "border-turquoise bg-turquoise/14 font-medium text-[#0E7C8C]"
                : "border-line bg-surface text-ink-soft hover:border-turquoise/40 hover:text-ink"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function Toggle({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm transition hover:border-turquoise/40"
    >
      <span className="font-medium">{label}</span>
      <span className={`relative h-6 w-11 rounded-full transition ${value ? "bg-turquoise" : "bg-line"}`}>
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${
            value ? "left-[22px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}
