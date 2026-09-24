import { EVENTS } from "./events";
import type { Epaulette, Member } from "./types";

/**
 * Le badge « Nouvelle » expire après la visio d'intégration : c'est ce
 * rendez-vous qui fait entrer une membre dans le réseau, pas son inscription.
 * Une fois la visio passée, elle est une membre comme les autres.
 *
 * Les dates d'inscription du jeu de démonstration sont figées dans le passé :
 * s'appuyer dessus marquerait tout le monde comme ancienne. On se cale donc
 * sur l'événement d'intégration à venir, qui est daté relativement à
 * aujourd'hui.
 */

/** La prochaine visio d'intégration, ou la dernière passée à défaut. */
export function integrationEvent(events: Epaulette[] = EVENTS): Epaulette | null {
  const visios = events
    .filter((e) => e.format === "visio")
    .sort((a, b) => +new Date(a.date) - +new Date(b.date));
  const upcoming = visios.find((e) => +new Date(e.date) > Date.now());
  return upcoming ?? visios[visios.length - 1] ?? null;
}

export type NewcomerStatus =
  | { isNew: false }
  | { isNew: true; daysLeft: number; event: Epaulette | null };

/**
 * Statut d'une membre. `daysLeft` est le nombre de jours avant que le badge
 * ne disparaisse, pour pouvoir l'afficher en infobulle.
 */
export function newcomerStatus(
  member: Pick<Member, "isNewcomer">,
  events: Epaulette[] = EVENTS,
): NewcomerStatus {
  if (!member.isNewcomer) return { isNew: false };

  const event = integrationEvent(events);
  if (!event) return { isNew: true, daysLeft: 0, event: null };

  const end = new Date(event.endDate).getTime();
  if (Date.now() > end) return { isNew: false };

  const daysLeft = Math.max(0, Math.ceil((end - Date.now()) / 86400000));
  return { isNew: true, daysLeft, event };
}

export function isNewcomerNow(member: Pick<Member, "isNewcomer">, events?: Epaulette[]): boolean {
  return newcomerStatus(member, events).isNew;
}
