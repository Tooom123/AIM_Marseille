"use client";

import { useMemo, useState } from "react";
import Avatar from "@/components/Avatar";
import Guard from "@/components/Guard";
import { Badge, Button, Card, Empty } from "@/components/ui";
import { EVENT_FORMAT_LABEL, daysUntil, formatDateLong, formatRange, relativeDay } from "@/lib/events";
import { MEMBERS_BY_ID } from "@/lib/members";
import { ME, useStore } from "@/lib/store";
import type { Epaulette } from "@/lib/types";

export default function Page() {
  return (
    <Guard>
      <Agenda />
    </Guard>
  );
}

function Agenda() {
  const { events, toggleAttendance, profile } = useStore();
  const [filter, setFilter] = useState<"all" | "mine">("all");

  const sorted = useMemo(
    () =>
      [...events]
        .filter((e) => daysUntil(e.date) >= 0)
        .filter((e) => (filter === "mine" ? e.attendees.includes(ME) : true))
        .sort((a, b) => +new Date(a.date) - +new Date(b.date)),
    [events, filter],
  );

  // Le pré-apéro d'intégration : on le met en avant s'il approche.
  const visio = sorted.find((e) => e.format === "visio");
  const isNewMember = profile.skills.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Agenda</h1>
          <p className="text-sm text-ink-soft">
            11 apéros par an, un workshop par mois, et les visios d&apos;intégration.
          </p>
        </div>
        <div className="flex gap-1 rounded-xl border border-line bg-surface p-1">
          {([["all", "Tout"], ["mine", "Mes inscriptions"]] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                filter === k ? "bg-turquoise/14 text-[#0E7C8C]" : "text-ink-soft hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Mise en avant du pré-apéro */}
      {visio && filter === "all" && isNewMember && <VisioHighlight event={visio} />}

      {sorted.length === 0 && (
        <Empty title="Rien dans cette vue.">
          Inscrivez-vous depuis la carte ou changez de filtre.
        </Empty>
      )}

      <div className="space-y-3">
        {sorted.map((e) => {
          const going = e.attendees.includes(ME);
          const full = e.attendees.length >= e.capacity;
          return (
            <Card key={e.id} className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Pastille date */}
              <div className="flex shrink-0 items-center gap-3 sm:w-28 sm:flex-col sm:items-center sm:gap-0">
                <div className="grid size-14 place-items-center rounded-2xl bg-cream">
                  <div className="text-center leading-none">
                    <div className="text-lg font-semibold">
                      {new Date(e.date).getDate()}
                    </div>
                    <div className="text-[10px] uppercase text-ink-soft">
                      {new Date(e.date).toLocaleDateString("fr-FR", { month: "short" })}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-ink-soft sm:mt-1.5">{relativeDay(e.date)}</span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={e.format === "apero" ? "rose" : e.format === "visio" ? "turquoise" : "neutral"}>
                    {EVENT_FORMAT_LABEL[e.format]}
                  </Badge>
                  {e.createdByUser && <Badge tone="ink">Créé par vous</Badge>}
                  {full && !going && <Badge>Complet</Badge>}
                </div>
                <h2 className="mt-1.5 font-semibold leading-snug">{e.title}</h2>
                <p className="text-sm text-ink-soft">
                  {formatDateLong(e.date)} · {formatRange(e.date, e.endDate)} · {e.place}
                </p>
                <p className="mt-1.5 text-sm">{e.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {e.attendees.slice(0, 6).map((id) => {
                      const m = MEMBERS_BY_ID[id];
                      return m ? (
                        <Avatar key={id} seed={id} first={m.firstName} last={m.lastName} size={24} ring />
                      ) : null;
                    })}
                  </div>
                  <span className="text-xs text-ink-soft">
                    {e.attendees.length} / {e.capacity} inscrites
                  </span>
                </div>
              </div>

              <Button
                variant={going ? "outline" : "primary"}
                onClick={() => toggleAttendance(e.id)}
                className="shrink-0"
              >
                {going ? "Inscrite ✓" : "Je participe"}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/** L'intégration des nouvelles : 30 min en visio avant le grand apéro. */
function VisioHighlight({ event }: { event: Epaulette }) {
  const { toggleAttendance } = useStore();
  const going = event.attendees.includes(ME);
  const others = event.attendees.filter((id) => id !== ME).map((id) => MEMBERS_BY_ID[id]).filter(Boolean);

  const agenda = [
    "5 min · Tour de table : votre métier en une phrase",
    "10 min · Ce que vous cherchez, ce que vous pouvez offrir",
    "10 min · Deux marraines répondent à vos questions",
    "5 min · Qui vous rencontrez en priorité à l'apéro",
  ];

  return (
    <Card className="border-turquoise/35 bg-gradient-to-br from-turquoise/8 to-transparent">
      <div className="flex flex-wrap items-start gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-turquoise text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5">
            <rect x="2" y="6" width="13" height="12" rx="2.5" />
            <path d="M15 11l6-3.5v9L15 13z" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <Badge tone="turquoise">Intégration · {relativeDay(event.date)}</Badge>
          <h2 className="mt-1.5 text-lg font-semibold leading-snug">{event.title}</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Trente minutes pour arriver à l&apos;apéro en connaissant déjà des visages.
            Personne ne reste seule devant le buffet.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Déroulé des 30 minutes
          </p>
          <ol className="space-y-1.5">
            {agenda.map((line) => (
              <li key={line} className="flex gap-2 text-sm">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-turquoise" />
                {line}
              </li>
            ))}
          </ol>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Qui sera là
          </p>
          <div className="flex flex-wrap gap-1.5">
            {others.map((m) => (
              <span key={m.id} className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs">
                <Avatar seed={m.id} first={m.firstName} last={m.lastName} size={18} />
                {m.firstName}
                {m.mentor && <span className="text-[#C22B52]">· marraine</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button variant={going ? "outline" : "primary"} onClick={() => toggleAttendance(event.id)}>
          {going ? "Inscrite ✓" : "Réserver ma place"}
        </Button>
        {going && (
          <a
            href={`https://meet.jit.si/EpaulettesPreApero-${event.id}`}
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="rose">Rejoindre la visio</Button>
          </a>
        )}
        <span className="text-xs text-ink-soft">Lien envoyé aussi par e-mail la veille.</span>
      </div>
    </Card>
  );
}
