import type { Epaulette } from "./types";

/** Horodatage ICS en UTC : 20260924T163000Z */
function icsDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Les longues lignes doivent être repliées à 75 octets (RFC 5545). */
function fold(line: string): string {
  if (line.length <= 73) return line;
  const chunks: string[] = [];
  let rest = line;
  chunks.push(rest.slice(0, 73));
  rest = rest.slice(73);
  while (rest.length > 72) {
    chunks.push(" " + rest.slice(0, 72));
    rest = rest.slice(72);
  }
  if (rest) chunks.push(" " + rest);
  return chunks.join("\r\n");
}

function esc(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function vevent(e: Epaulette): string[] {
  return [
    "BEGIN:VEVENT",
    `UID:${e.id}@epaulettes.app`,
    `DTSTAMP:${icsDate(new Date().toISOString())}`,
    `DTSTART:${icsDate(e.date)}`,
    `DTEND:${icsDate(e.endDate)}`,
    fold(`SUMMARY:${esc(e.title)}`),
    fold(`DESCRIPTION:${esc(e.description)}`),
    fold(`LOCATION:${esc(`${e.place}, ${e.address}`)}`),
    "STATUS:CONFIRMED",
    // Rappel une heure avant : c'est ce qui fait qu'on vient vraiment.
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    fold(`DESCRIPTION:${esc(e.title)}`),
    "END:VALARM",
    "END:VEVENT",
  ];
}

/** Calendrier ICS pour un ou plusieurs événements. */
export function buildIcs(events: Epaulette[], calendarName = "Les Épaulettes"): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Les Épaulettes//Réseau//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    fold(`X-WR-CALNAME:${esc(calendarName)}`),
    "X-WR-TIMEZONE:Europe/Paris",
    // Rafraîchissement : les agendas qui s'abonnent relisent le flux.
    "REFRESH-INTERVAL;VALUE=DURATION:PT12H",
    "X-PUBLISHED-TTL:PT12H",
    ...events.flatMap(vevent),
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Déclenche le téléchargement d'un .ics côté navigateur. */
export function downloadIcs(events: Epaulette[], filename: string, calendarName?: string) {
  const blob = new Blob([buildIcs(events, calendarName)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // On laisse le temps au téléchargement de démarrer avant de révoquer l'URL.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Lien Google Agenda : ajout en un clic, sans fichier. */
export function googleCalendarUrl(e: Epaulette): string {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${icsDate(e.date)}/${icsDate(e.endDate)}`,
    details: e.description,
    location: `${e.place}, ${e.address}`,
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}

/**
 * URL d'abonnement au calendrier du réseau. Le flux est servi par /api/calendrier,
 * et `webcal://` fait que l'agenda s'y abonne au lieu de télécharger une copie figée.
 */
export function subscriptionUrl(origin: string, onlyMine: boolean): string {
  const host = origin.replace(/^https?:\/\//, "");
  return `webcal://${host}/api/calendrier${onlyMine ? "?mes=1" : ""}`;
}
