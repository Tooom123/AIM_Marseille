"use client";

import { useState } from "react";
import Avatar from "./Avatar";
import { Badge, Button } from "./ui";
import NewcomerBadge from "./NewcomerBadge";
import ZodiacBadge from "./ZodiacBadge";
import type { MatchReason } from "@/lib/types";
import { useStore } from "@/lib/store";
import { DEMO_LINKEDIN } from "@/lib/links";

const KIND_LABEL: Record<MatchReason["kind"], { text: string; tone: "turquoise" | "rose" | "neutral" }> = {
  complement: { text: "Complémentaire", tone: "turquoise" },
  bridge: { text: "Pont vers un autre cercle", tone: "rose" },
  affinity: { text: "Affinité", tone: "neutral" },
};

export default function MemberCard({ match }: { match: MatchReason }) {
  const { member, why, intro, kind } = match;
  const { connected, sendMessage, openConversation } = useStore();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(intro);
  const isConnected = connected.includes(member.id);
  const label = KIND_LABEL[kind];

  /** Envoie le message d'intro et ouvre la conversation : le lien est vraiment créé. */
  function sendIntro() {
    sendMessage(member.id, text);
    openConversation(member.id);
    setOpen(false);
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-line bg-surface p-4 transition duration-200 hover:-translate-y-1 hover:border-turquoise/50 hover:shadow-[0_10px_28px_rgb(18_51_58/.10)]">
      <div className="flex items-start gap-3">
        <Avatar seed={member.id} first={member.firstName} last={member.lastName} photo={member.photo} size={48} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{member.firstName} {member.lastName}</h3>
            {member.mentor && <Badge tone="rose">Marraine</Badge>}
            <NewcomerBadge member={member} />
          </div>
          <p className="text-sm text-ink-soft">
            {member.job} · {member.company}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-ink-soft">{member.neighborhood}</span>
            {member.zodiac && <ZodiacBadge sign={member.zodiac} size="sm" />}
          </div>
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
          {isConnected ? "Déjà contactée" : "Message d'intro prêt"}
        </Button>
        {member.linkedin && (
          <a href={DEMO_LINKEDIN} target="_blank" rel="noreferrer"
            className="rounded-lg px-2 py-1 text-xs font-medium text-ink-soft transition hover:text-[#0E7C8C]">
            LinkedIn
          </a>
        )}
      </div>

      {open && (
        <div className="mt-3 animate-fade-up space-y-2.5">
          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full rounded-xl border border-line bg-bg p-3 text-sm leading-relaxed outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/20"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="rose" onClick={sendIntro} disabled={!text.trim()}>
              Envoyer le message
            </Button>
            <span className="text-xs text-ink-soft">
              Rédigé à partir de vos deux profils — modifiable.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
