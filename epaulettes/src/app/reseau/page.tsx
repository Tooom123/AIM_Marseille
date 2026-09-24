"use client";

import { useMemo, useState } from "react";
import Avatar from "@/components/Avatar";
import Guard from "@/components/Guard";
import MemberCard from "@/components/MemberCard";
import ZodiacBadge from "@/components/ZodiacBadge";
import NetworkGraph from "@/components/NetworkGraph";
import { Badge, Card, Empty, SectionTitle, Stat, inputClass } from "@/components/ui";
import { MEMBERS } from "@/lib/members";
import { matchesFor, networkHealth } from "@/lib/matching";
import { ME, useStore } from "@/lib/store";

export default function Page() {
  return (
    <Guard>
      <Reseau />
    </Guard>
  );
}

type Tab = "matches" | "annuaire" | "graphe";

function Reseau() {
  const { profile } = useStore();
  const [tab, setTab] = useState<Tab>("matches");
  const [query, setQuery] = useState("");

  const viewer = useMemo(
    () => ({
      skills: profile.skills, offers: profile.offers, needs: profile.needs,
      hobbies: profile.hobbies, job: profile.job, neighborhood: profile.neighborhood,
    }),
    [profile],
  );

  const matches = useMemo(() => matchesFor(viewer, ME, 9), [viewer]);
  const health = useMemo(() => networkHealth(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MEMBERS;
    return MEMBERS.filter((m) =>
      [m.firstName, m.lastName, m.job, m.company, m.neighborhood, ...m.skills, ...m.offers, ...m.hobbies]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Le réseau</h1>
        <p className="text-sm text-ink-soft">
          {MEMBERS.length + 1} membres. L&apos;annuaire ne sert à rien si personne ne sait qui chercher —
          alors on vous le dit.
        </p>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1">
        {([
          ["matches", "Pour vous"],
          ["annuaire", "Annuaire"],
          ["graphe", "Carte des liens"],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
              tab === k ? "bg-turquoise/14 text-[#0E7C8C]" : "text-ink-soft hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "matches" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Stat value={matches.filter((m) => m.kind === "complement").length} label="complémentaires" tone="turquoise" />
            <Stat value={matches.filter((m) => m.kind === "bridge").length} label="ponts vers d'autres cercles" tone="rose" />
            <Stat value={matches.filter((m) => m.kind === "affinity").length} label="affinités" />
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {matches.map((m) => <MemberCard key={m.member.id} match={m} />)}
          </div>
        </div>
      )}

      {tab === "annuaire" && (
        <div className="space-y-4">
          <input
            className={inputClass}
            placeholder="Chercher un métier, une compétence, un quartier…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {filtered.length === 0 && <Empty title="Aucun résultat." />}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => (
              <Card key={m.id}>
                <div className="flex items-start gap-3">
                  <Avatar seed={m.id} first={m.firstName} last={m.lastName} photo={m.photo} size={44} />
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{m.firstName} {m.lastName}</h3>
                    <p className="truncate text-sm text-ink-soft">{m.job}</p>
                    <p className="text-xs text-ink-soft">{m.neighborhood}</p>
                  </div>
                </div>
                <p className="mt-2.5 line-clamp-2 text-sm text-ink-soft">{m.bio}</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {m.mentor && <Badge tone="rose">Marraine</Badge>}
                  {m.isNewcomer && <Badge tone="turquoise">Nouvelle</Badge>}
                  {m.zodiac && <ZodiacBadge sign={m.zodiac} size="sm" />}
                  {m.skills.slice(0, 2).map((s) => (
                    <span key={s} className="rounded-lg bg-cream px-2 py-0.5 text-xs text-ink-soft">{s}</span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === "graphe" && (
        <div className="space-y-4">
          <Card pad={false} className="h-[58vh] min-h-[380px] overflow-hidden">
            <NetworkGraph />
          </Card>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat value={health.edges} label="liens déclarés" />
            <Stat value={`${Math.round(health.density * 100)} %`} label="densité du réseau" tone="turquoise" />
            <Stat value={health.isolated.length + health.weak.length} label="membres à reconnecter" tone="rose" />
          </div>
          <Card>
            <SectionTitle hint="Ce sont les membres qui décrochent. Une invitation ciblée vaut mieux qu'un message dans le groupe.">
              Priorités d&apos;animation
            </SectionTitle>
            <div className="flex flex-wrap gap-2">
              {[...health.isolated, ...health.weak].map((m) => (
                <span key={m.id} className="inline-flex items-center gap-2 rounded-full border border-rose/30 bg-rose/6 px-2.5 py-1 text-xs">
                  <Avatar seed={m.id} first={m.firstName} last={m.lastName} size={20} />
                  {m.firstName} {m.lastName}
                  <span className="text-ink-soft">
                    · {health.adj.get(m.id)?.size ?? 0} lien{(health.adj.get(m.id)?.size ?? 0) > 1 ? "s" : ""}
                  </span>
                </span>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
