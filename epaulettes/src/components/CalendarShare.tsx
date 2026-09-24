"use client";

import { useState, useSyncExternalStore } from "react";
import { Button } from "./ui";
import { downloadIcs, googleCalendarUrl, subscriptionUrl } from "@/lib/ics";
import type { Epaulette } from "@/lib/types";

/** Ajout d'un événement unique à un agenda. */
export function AddToCalendar({ event }: { event: Epaulette }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" onClick={() => downloadIcs([event], event.id)}>
        Ajouter à mon agenda
      </Button>
      <a href={googleCalendarUrl(event)} target="_blank" rel="noreferrer">
        <Button size="sm" variant="ghost">Google Agenda</Button>
      </a>
    </div>
  );
}

/**
 * Abonnement au calendrier du réseau. Un agenda abonné relit le flux, donc les
 * nouveaux événements arrivent tout seuls — contrairement à un .ics téléchargé,
 * qui est une copie figée.
 */
export function CalendarSubscribe({ events }: { events: Epaulette[] }) {
  // L'origine n'existe que côté navigateur : lue via useSyncExternalStore pour
  // que le rendu serveur et le client restent cohérents.
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
  );
  const [copied, setCopied] = useState<"all" | "mine" | null>(null);

  async function copy(kind: "all" | "mine") {
    const url = subscriptionUrl(origin, kind === "mine");
    try {
      await navigator.clipboard.writeText(url);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2500);
    } catch {
      // Presse-papiers refusé : on laisse l'utilisatrice copier depuis le champ.
    }
  }

  const allUrl = origin ? subscriptionUrl(origin, false) : "";

  return (
    <div className="rounded-2xl border border-turquoise/30 bg-turquoise/6 p-4">
      <p className="font-semibold">Synchroniser avec votre agenda</p>
      <p className="mt-0.5 text-sm text-ink-soft">
        Abonnez-vous une fois : les nouveaux événements du réseau apparaissent
        ensuite tout seuls dans votre calendrier.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => copy("all")}>
          {copied === "all" ? "Lien copié" : "Copier le lien d'abonnement"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => copy("mine")}>
          {copied === "mine" ? "Lien copié" : "Seulement mes inscriptions"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => downloadIcs(events, "epaulettes", "Les Épaulettes")}
        >
          Télécharger le .ics
        </Button>
      </div>

      <div className="mt-3 rounded-xl border border-line bg-surface px-3 py-2">
        <p className="mb-1 text-[10px] uppercase tracking-wide text-ink-soft">
          Lien d&apos;abonnement
        </p>
        <code className="block truncate text-xs text-ink-soft">{allUrl || "…"}</code>
      </div>

      <p className="mt-2 text-xs text-ink-soft">
        Google Agenda : « Autres agendas » → « À partir de l&apos;URL ».
        Apple Calendrier : « Fichier » → « Nouvel abonnement ».
      </p>
    </div>
  );
}
