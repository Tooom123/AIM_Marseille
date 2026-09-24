import { EVENTS } from "@/lib/events";
import { buildIcs } from "@/lib/ics";

/**
 * Flux iCalendar auquel un agenda peut s'abonner (webcal://).
 * Les agendas relisent l'URL périodiquement : un événement ajouté côté réseau
 * apparaît chez les membres abonnées sans qu'elles refassent quoi que ce soit.
 *
 * Démo : les événements viennent du module de données. En production, ils
 * viendraient de la base, et l'URL porterait un jeton par membre.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const onlyMine = searchParams.get("mes") === "1";

  const events = onlyMine
    ? EVENTS.filter((e) => e.attendees.includes("me"))
    : EVENTS;

  const ics = buildIcs(
    events,
    onlyMine ? "Mes Épaulettes" : "Les Épaulettes · Tous les événements",
  );

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="epaulettes.ics"',
      // Les agendas mettent en cache : on limite à une heure.
      "Cache-Control": "public, max-age=3600",
    },
  });
}
