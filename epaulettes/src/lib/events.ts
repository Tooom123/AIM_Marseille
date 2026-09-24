import type { Epaulette } from "./types";

/** Date de référence de la démo : on ancre tout sur "aujourd'hui" pour que l'agenda reste crédible. */
export const TODAY = new Date();

function at(daysFromNow: number, hour: number, minutes = 0): string {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minutes, 0, 0);
  return d.toISOString();
}

function plus(iso: string, hours: number): string {
  const d = new Date(iso);
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

const aperoStart = at(4, 18, 30);
const workshopStart = at(11, 12, 30);
const visioStart = at(3, 18, 0);
const nextAperoStart = at(32, 18, 30);

export const EVENTS: Epaulette[] = [
  {
    id: "apero-oct",
    title: "Apéro des Épaulettes · Le Panier",
    format: "apero",
    date: aperoStart,
    endDate: plus(aperoStart, 3),
    place: "Rooftop La Caravelle",
    address: "34 quai du Port, 13002 Marseille",
    coords: [5.3706, 43.2944],
    capacity: 40,
    attendees: ["sonia", "leila", "claire", "fatima", "nadia", "ines", "amelie", "maya", "yasmine", "elodie", "nour"],
    host: "sonia",
    description:
      "L'apéro mensuel : 2 heures pour rencontrer six personnes utiles, pas pour collectionner des cartes de visite. Placement de tables suggéré par l'IA.",
  },
  {
    id: "workshop-ia",
    title: "Workshop en ligne · L'IA sans bullshit",
    format: "workshop",
    date: workshopStart,
    endDate: plus(workshopStart, 1),
    place: "En ligne",
    address: "Lien de visio envoyé la veille",
    coords: [5.3644, 43.3062],
    capacity: 100,
    attendees: ["yasmine", "fatima", "beatrice", "therese", "karine", "elodie", "helene"],
    host: "yasmine",
    description:
      "Une heure pour repartir avec deux automatisations applicables dès demain dans votre activité.",
  },
  {
    id: "pre-apero-visio",
    title: "Pré-apéro des nouvelles · visio d'intégration",
    format: "visio",
    date: visioStart,
    endDate: plus(visioStart, 1),
    place: "Visio (30 min)",
    address: "Salon en ligne privé",
    coords: [5.3740, 43.2951],
    capacity: 12,
    attendees: ["yasmine", "elodie", "nour", "juliette", "karine"],
    host: "karine",
    description:
      "Trente minutes entre nouvelles arrivantes et deux marraines, avant le grand apéro. On arrive en connaissant déjà trois visages.",
  },
  {
    id: "apero-nov",
    title: "Apéro des Épaulettes · Joliette",
    format: "apero",
    date: nextAperoStart,
    endDate: plus(nextAperoStart, 3),
    place: "Les Docks Village",
    address: "10 place de la Joliette, 13002 Marseille",
    coords: [5.3661, 43.3073],
    capacity: 40,
    attendees: ["rachida", "yasmine", "maud", "assia", "sophie"],
    host: "rachida",
    description: "Édition d'automne, côté Joliette. Focus financement et développement commercial.",
  },
];

export const EVENT_FORMAT_LABEL: Record<Epaulette["format"], string> = {
  apero: "Apéro",
  workshop: "Workshop",
  visio: "Visio",
};

export function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function formatRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export function daysUntil(iso: string): number {
  const d = new Date(iso); d.setHours(0, 0, 0, 0);
  const t = new Date(); t.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - t.getTime()) / 86400000);
}

export function relativeDay(iso: string): string {
  const n = daysUntil(iso);
  if (n === 0) return "aujourd'hui";
  if (n === 1) return "demain";
  if (n < 0) return `il y a ${-n} jours`;
  if (n < 7) return `dans ${n} jours`;
  if (n < 14) return "la semaine prochaine";
  return `dans ${Math.round(n / 7)} semaines`;
}
