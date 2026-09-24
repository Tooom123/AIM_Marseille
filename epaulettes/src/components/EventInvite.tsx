"use client";

import { useMemo, useState } from "react";
import Avatar from "./Avatar";
import { Badge, Button, inputClass } from "./ui";
import { MEMBERS } from "@/lib/members";
import { matchesFor } from "@/lib/matching";
import { ME, useStore } from "@/lib/store";
import type { Epaulette } from "@/lib/types";

/**
 * Invitations à un événement. Réservé à l'organisatrice : c'est elle qui
 * décide qui rejoint sa table.
 */
export default function EventInvite({ event }: { event: Epaulette }) {
  const { inviteToEvent, sendMessage, profile } = useStore();
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [sent, setSent] = useState(0);

  // Suggestions : les membres les plus pertinentes pour l'organisatrice,
  // qui ne sont pas déjà inscrites.
  const suggested = useMemo(() => {
    const matches = matchesFor(
      {
        skills: profile.skills, offers: profile.offers, needs: profile.needs,
        hobbies: profile.hobbies, job: profile.job, neighborhood: profile.neighborhood,
      },
      ME,
      20,
    );
    return matches.map((m) => m.member).filter((m) => !event.attendees.includes(m.id)).slice(0, 6);
  }, [profile, event.attendees]);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return MEMBERS.filter(
      (m) =>
        !event.attendees.includes(m.id) &&
        `${m.firstName} ${m.lastName} ${m.job} ${m.neighborhood}`.toLowerCase().includes(q),
    ).slice(0, 8);
  }, [search, event.attendees]);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  function invite() {
    inviteToEvent(event.id, selected);
    // Chaque invitée reçoit un message : l'invitation ne se perd pas.
    const when = new Date(event.date).toLocaleDateString("fr-FR", {
      weekday: "long", day: "numeric", month: "long",
    });
    for (const id of selected) {
      sendMessage(
        id,
        `Je vous invite à « ${event.title} », ${when} à ${event.place}. J'ai pensé que ça vous intéresserait — vous y retrouverez plusieurs membres du réseau.`,
      );
    }
    setSent(selected.length);
    setSelected([]);
    setSearch("");
    setTimeout(() => setSent(0), 4000);
  }

  const pool = results.length > 0 ? results : suggested;

  return (
    <div className="rounded-2xl border border-rose/30 bg-rose/5 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="font-semibold">Inviter des membres</p>
          <p className="text-xs text-ink-soft">
            Vous organisez cet événement : vous pouvez convier qui vous voulez.
          </p>
        </div>
        <Badge tone="rose">Organisatrice</Badge>
      </div>

      <input
        className={inputClass}
        placeholder="Chercher une membre…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {pool.length > 0 && (
        <>
          <p className="mb-2 mt-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            {results.length > 0 ? "Résultats" : "Suggestions pour vous"}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {pool.map((m) => {
              const on = selected.includes(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => toggle(m.id)}
                  className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-sm transition ${
                    on
                      ? "border-rose bg-rose/12 font-medium text-[#C22B52]"
                      : "border-line bg-surface hover:border-rose/40"
                  }`}
                >
                  <Avatar seed={m.id} first={m.firstName} last={m.lastName} size={22} />
                  {m.firstName} {m.lastName}
                  {on && <span>✓</span>}
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button variant="rose" size="sm" disabled={selected.length === 0} onClick={invite}>
          Inviter {selected.length > 0 ? `(${selected.length})` : ""}
        </Button>
        {sent > 0 && (
          <span className="text-xs font-medium text-[#0E7C8C]">
            {sent} invitation{sent > 1 ? "s" : ""} envoyée{sent > 1 ? "s" : ""} par message.
          </span>
        )}
      </div>
    </div>
  );
}
