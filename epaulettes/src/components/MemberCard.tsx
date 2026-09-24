"use client";

import { useState } from "react";
import Avatar from "./Avatar";
import { Badge, Button } from "./ui";
import type { MatchReason } from "@/lib/types";
import { useStore } from "@/lib/store";

const KIND_LABEL: Record<MatchReason["kind"], { text: string; tone: "turquoise" | "rose" | "neutral" }> = {
  complement: { text: "Complémentaire", tone: "turquoise" },
  bridge: { text: "Pont vers un autre cercle", tone: "rose" },
  affinity: { text: "Affinité", tone: "neutral" },
};

export default function MemberCard({ match }: { match: MatchReason }) {
  const { member, why, intro, kind } = match;
  const { connected, markConnected } = useStore();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const isConnected = connected.includes(member.id);
  const label = KIND_LABEL[kind];

  async function copyIntro() {
    try {
      await navigator.clipboard.writeText(intro);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
    markConnected(member.id);
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-line bg-surface p-4 transition hover:border-turquoise/40 hover:shadow-[0_4px_16px_rgb(18_51_58/.06)]">
      <div className="flex items-start gap-3">
        <Avatar seed={member.id} first={member.firstName} last={member.lastName} photo={member.photo} size={48} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{member.firstName} {member.lastName}</h3>
            {member.mentor && <Badge tone="rose">Marraine</Badge>}
            {member.isNewcomer && <Badge tone="turquoise">Nouvelle</Badge>}
          </div>
          <p className="text-sm text-ink-soft">
            {member.job} · {member.company}
          </p>
          <p className="mt-0.5 text-xs text-ink-soft">{member.neighborhood}</p>
        </div>
        <Badge tone={label.tone} className="hidden shrink-0 sm:inline-flex">{label.text}</Badge>
      </div>

      <div className="mt-3 rounded-xl bg-cream/70 px-3 py-2.5">
        <p className="text-sm">
          <span className="font-medium text-[#0E7C8C]">Pourquoi elle : </span>
          {why}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {member.skills.slice(0, 4).map((s) => (
          <span key={s} className="rounded-lg bg-cream px-2 py-1 text-xs text-ink-soft">{s}</span>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-2 pt-4">
        <Button size="sm" variant={isConnected ? "outline" : "primary"} onClick={() => setOpen((o) => !o)}>
          {isConnected ? "Message envoyé" : "Message d'intro prêt"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen((o) => !o)}>
          {open ? "Masquer" : "Voir"}
        </Button>
      </div>

      {open && (
        <div className="mt-3 animate-fade-up space-y-2.5">
          <div className="rounded-xl border border-line bg-bg p-3 text-sm leading-relaxed">{intro}</div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="rose" onClick={copyIntro}>
              {copied ? "Copié" : "Copier et envoyer"}
            </Button>
            <span className="text-xs text-ink-soft">Rédigé à partir de vos deux profils.</span>
          </div>
        </div>
      )}
    </div>
  );
}
