"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useRef, useState } from "react";
import Avatar from "@/components/Avatar";
import { AddToCalendar } from "@/components/CalendarShare";
import EventInvite from "@/components/EventInvite";
import Guard from "@/components/Guard";
import { Badge, Button, Card, Field, SectionTitle, inputClass } from "@/components/ui";
import { EVENT_FORMAT_LABEL, formatDateLong, formatRange, relativeDay } from "@/lib/events";
import { MEMBERS, MEMBERS_BY_ID } from "@/lib/members";
import { seatingPlan } from "@/lib/matching";
import { ME, useStore } from "@/lib/store";
import type { EventFormat } from "@/lib/types";

// WebGL : jamais rendu côté serveur.
const Map3D = dynamic(() => import("@/components/Map3D"), {
  ssr: false,
  loading: () => (
    <div className="grid size-full place-items-center bg-cream">
      <div className="size-7 animate-spin rounded-full border-2 border-line border-t-turquoise" />
    </div>
  ),
});

const PLACES: Record<string, [number, number]> = {
  "Vieux-Port": [5.374, 43.2951],
  "Le Panier": [5.3689, 43.2989],
  "Joliette": [5.3661, 43.3073],
  "Cours Julien": [5.383, 43.2925],
  "La Friche": [5.3843, 43.3114],
  "Prado": [5.3906, 43.2724],
};

export default function Page() {
  return (
    <Guard>
      <Carte />
    </Guard>
  );
}

function Carte() {
  const { events, toggleAttendance } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(events[0]?.id ?? null);
  const [showMembers, setShowMembers] = useState(true);
  const [creating, setCreating] = useState(false);
  const mapCardRef = useRef<HTMLDivElement>(null);

  /** Sélectionne un événement et s'assure que la carte est à l'écran pour voir le vol. */
  const select = useCallback((id: string) => {
    setSelectedId(id);
    // En dessous de lg la carte n'est pas collante : on la ramène en haut.
    if (window.innerWidth < 1024) {
      mapCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const selected = events.find((e) => e.id === selectedId) ?? null;
  const tables = useMemo(
    () => (selected && selected.format === "apero" ? seatingPlan(selected.attendees) : []),
    [selected],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Marseille en relief</h1>
          <p className="text-sm text-ink-soft">
            Les événements du réseau et, si vous voulez, les {MEMBERS.length} membres par quartier.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={showMembers ? "primary" : "outline"}
            onClick={() => setShowMembers((v) => !v)}
          >
            {showMembers ? "Membres affichées" : "Afficher les membres"}
          </Button>
          <Button size="sm" variant="rose" onClick={() => setCreating((v) => !v)}>
            {creating ? "Fermer" : "Créer un événement"}
          </Button>
        </div>
      </div>

      {creating && <CreateEventForm onDone={(id) => { setCreating(false); select(id); }} />}

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        {/*
          Sur grand écran la carte est collante : on peut descendre dans la liste
          des événements sans la perdre de vue. Sur mobile, on la ramène à
          l'écran à chaque sélection (voir `select`).
        */}
        <Card
          pad={false}
          className="h-[62vh] min-h-[420px] scroll-mt-20 overflow-hidden lg:sticky lg:top-20 lg:h-[calc(100dvh-7rem)]"
        >
          <div ref={mapCardRef} className="size-full">
          <Map3D
            events={events}
            showMembers={showMembers}
            selectedId={selectedId}
            onSelect={select}
          />
          </div>
        </Card>

        <div className="space-y-3">
          {/* Liste des événements */}
          <div className="space-y-2.5">
            {events.map((e) => {
              const active = e.id === selectedId;
              const going = e.attendees.includes(ME);
              return (
                <button
                  key={e.id}
                  onClick={() => select(e.id)}
                  className={`w-full rounded-2xl border p-3.5 text-left transition duration-200 hover:-translate-y-0.5 ${
                    active
                      ? "border-turquoise bg-turquoise/8 shadow-sm"
                      : "border-line bg-surface hover:border-turquoise/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge tone={e.format === "apero" ? "rose" : e.format === "visio" ? "turquoise" : "neutral"}>
                      {EVENT_FORMAT_LABEL[e.format]}
                    </Badge>
                    <span className="text-xs text-ink-soft">{relativeDay(e.date)}</span>
                  </div>
                  <p className="mt-2 font-semibold leading-snug">{e.title}</p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {e.place} · {formatRange(e.date, e.endDate)} · {e.attendees.length}/{e.capacity}
                  </p>
                  {going && <Badge tone="turquoise" className="mt-2">Vous participez</Badge>}
                </button>
              );
            })}
          </div>

          {/* Détail */}
          {selected && (
            <Card className="animate-fade-up">
              <p className="text-xs uppercase tracking-wide text-ink-soft">
                {formatDateLong(selected.date)} · {formatRange(selected.date, selected.endDate)}
              </p>
              <h2 className="mt-1 font-semibold">{selected.title}</h2>
              <p className="mt-1 text-sm text-ink-soft">{selected.address}</p>
              <p className="mt-2.5 text-sm">{selected.description}</p>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {selected.attendees.slice(0, 8).map((id) => {
                  const m = MEMBERS_BY_ID[id];
                  return m ? (
                    <span key={id} className="inline-flex items-center gap-1 rounded-full bg-cream px-2 py-1 text-xs">
                      <Avatar seed={id} first={m.firstName} last={m.lastName} size={18} />
                      {m.firstName}
                    </span>
                  ) : null;
                })}
                {selected.attendees.length > 8 && (
                  <span className="text-xs text-ink-soft">+{selected.attendees.length - 8}</span>
                )}
              </div>

              <Button
                className="mt-4"
                full
                variant={selected.attendees.includes(ME) ? "outline" : "primary"}
                onClick={() => toggleAttendance(selected.id)}
              >
                {selected.attendees.includes(ME) ? "Je suis inscrite ✓" : "Je participe"}
              </Button>

              <div className="mt-3 border-t border-line pt-3">
                <AddToCalendar event={selected} />
              </div>
            </Card>
          )}

          {/* L'organisatrice peut convier des membres. */}
          {selected?.host === ME && <EventInvite event={selected} />}

          {/* Placement de tables */}
          {tables.length > 0 && (
            <Card>
              <SectionTitle hint="On évite d'asseoir ensemble celles qui se connaissent déjà.">
                Placement suggéré
              </SectionTitle>
              <div className="space-y-2.5">
                {tables.map((t) => (
                  <div key={t.name} className="rounded-xl border border-line bg-bg p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#0E7C8C]">{t.name}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {t.members.map((m) => (
                        <span key={m.id} className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-1 text-xs">
                          <Avatar seed={m.id} first={m.firstName} last={m.lastName} size={16} />
                          {m.firstName}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-xs italic text-ink-soft">« {t.icebreaker} »</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateEventForm({ onDone }: { onDone: (id: string) => void }) {
  const { createEvent } = useStore();
  const [title, setTitle] = useState("");
  const [format, setFormat] = useState<EventFormat>("apero");
  const [place, setPlace] = useState("Vieux-Port");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(18, 30, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [description, setDescription] = useState("");

  function submit() {
    const start = new Date(date);
    const end = new Date(start);
    end.setHours(end.getHours() + (format === "visio" ? 1 : 3));
    const created = createEvent({
      title: title.trim() || "Nouvel événement",
      format,
      date: start.toISOString(),
      endDate: end.toISOString(),
      place,
      address: address.trim() || place,
      coords: PLACES[place] ?? [5.3772, 43.2921],
      capacity: format === "visio" ? 12 : 40,
      description: description.trim() || "Événement créé depuis l'application.",
    });
    onDone(created.id);
  }

  return (
    <Card className="animate-fade-up border-rose/30 bg-rose/4">
      <SectionTitle hint="Il apparaîtra immédiatement sur la carte et dans l'agenda.">
        Créer un événement
      </SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Titre">
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Petit-déjeuner des fondatrices" />
        </Field>
        <Field label="Format">
          <select className={inputClass} value={format} onChange={(e) => setFormat(e.target.value as EventFormat)}>
            <option value="apero">Apéro</option>
            <option value="workshop">Workshop</option>
            <option value="visio">Visio</option>
          </select>
        </Field>
        <Field label="Quartier">
          <select className={inputClass} value={place} onChange={(e) => setPlace(e.target.value)}>
            {Object.keys(PLACES).map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Date et heure">
          <input type="datetime-local" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Adresse">
          <input className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)}
            placeholder="12 rue Sainte, 13001" />
        </Field>
        <Field label="Description">
          <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Une heure, six personnes, un sujet." />
        </Field>
      </div>
      <Button className="mt-4" variant="rose" onClick={submit} disabled={!title.trim()}>
        Publier sur la carte
      </Button>
    </Card>
  );
}
