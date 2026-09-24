"use client";

import { Badge } from "./ui";
import { newcomerStatus } from "@/lib/newcomer";
import type { Member } from "@/lib/types";

/**
 * Badge « Nouvelle », visible jusqu'à la fin de la visio d'intégration.
 * Ne rend rien si la membre n'est plus nouvelle : les appelants n'ont donc
 * pas à tester quoi que ce soit.
 */
export default function NewcomerBadge({
  member, showCountdown = false,
}: {
  member: Pick<Member, "isNewcomer">;
  showCountdown?: boolean;
}) {
  const status = newcomerStatus(member);
  if (!status.isNew) return null;

  const title = status.event
    ? `Badge affiché jusqu'à la visio d'intégration du ${new Date(status.event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`
    : "Nouvelle dans le réseau";

  return (
    <span title={title}>
      <Badge tone="turquoise">
        Nouvelle
        {showCountdown && status.daysLeft > 0 && (
          <span className="font-normal opacity-70">
            · {status.daysLeft} j
          </span>
        )}
      </Badge>
    </span>
  );
}
