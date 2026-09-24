"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Avatar from "@/components/Avatar";
import Guard from "@/components/Guard";
import NetworkGraph from "@/components/NetworkGraph";
import ZodiacBadge from "@/components/ZodiacBadge";
import { Badge, Button, Card, Empty, SectionTitle, Stat, inputClass } from "@/components/ui";
import { MEMBERS, MEMBERS_BY_ID, buildAdjacency } from "@/lib/members";
import { introPath, matchesFor, mutualFriends, networkHealth } from "@/lib/matching";
import { ME, useStore } from "@/lib/store";

export default function Page() {
  return (
    <Guard>
      <Reseau />
    </Guard>
  );
}

function Reseau() {
  const { profile } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const viewer = useMemo(
    () => ({
      skills: profile.skills, offers: profile.offers, needs: profile.needs,
      hobbies: profile.hobbies, job: profile.job, neighborhood: profile.neighborhood,
    }),
    [profile],
  );

  const matches = useMemo(() => matchesFor(viewer, ME, 6), [viewer]);
  const health = useMemo(() => networkHealth(), []);
  const adj = useMemo(() => buildAdjacency(), []);

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

  const selected = selectedId ? MEMBERS_BY_ID[selectedId] : null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Le réseau</h1>
        <p className="text-sm text-ink-soft">
          {MEMBERS.length + 1} membres. Cliquez sur un visage pour voir qui peut vous présenter.
        </p>
      </div>

      <div className="stagger grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat value={MEMBERS.length + 1} label="membres" />
        <Stat value={health.edges} label="liens déclarés" tone="turquoise" />
        <Stat value={`${Math.round(health.density * 100)} %`} label="densité du réseau" />
        <Stat value={matches.length} label="rencontres pour vous" tone="rose" />
      </div>

      {/* Le graphe au centre : c'est la pièce maîtresse de la page. */}
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card pad={false} className="h-[56vh] min-h-[400px] overflow-hidden xl:h-[68vh]">
          <NetworkGraph
            selectedId={selectedId}
            onSelect={setSelectedId}
            viewerId={ME}
            viewerAvatar={profile.avatar}
            viewerName={profile.firstName || "Vous"}
          />
        </Card>

        <div className="space-y-4">
          {selected ? (
            <IntroPanel memberId={selected.id} onClose={() => setSelectedId(null)} />
          ) : (
            <Card className="animate-fade-up">
              <SectionTitle hint="Chaque visage est une membre. Les traits sont les liens déclarés.">
                Comment lire le graphe
              </SectionTitle>
              <ul className="space-y-2 text-sm text-ink-soft">
                <li className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-turquoise" />
                  Survolez un visage pour isoler ses liens.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-rose" />
                  Cliquez : le chemin d&apos;introduction depuis votre profil s&apos;allume en rose.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-ink" />
                  Plus une membre a de liens, plus son cercle est grand.
                </li>
              </ul>
            </Card>
          )}

          {/* Rencontres suggérées, en colonne à côté du graphe */}
          <Card>
            <SectionTitle
              hint="Calculé sur vos besoins et la forme du réseau."
              action={
                <span className="text-xs text-ink-soft">
                  {matches.filter((m) => m.kind === "bridge").length} pont(s)
                </span>
              }
            >
              Pour vous
            </SectionTitle>
            <div className="space-y-2">
              {matches.slice(0, 4).map(({ member, why, kind }) => (
                <button
                  key={member.id}
                  onClick={() => setSelectedId(member.id)}
                  className="flex w-full items-start gap-2.5 rounded-xl border border-line bg-surface p-2.5 text-left transition hover:-translate-y-0.5 hover:border-turquoise hover:shadow-md"
                >
                  <Avatar seed={member.id} first={member.firstName} last={member.lastName} size={34} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {member.firstName} {member.lastName}
                      {kind === "bridge" && <Badge tone="rose" className="ml-1.5">pont</Badge>}
                    </p>
                    <p className="line-clamp-2 text-xs text-ink-soft">{why}</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Annuaire, sous le graphe */}
      <section>
        <SectionTitle hint="Cherchez un métier, une compétence, un quartier — puis cliquez pour la situer dans le graphe.">
          L&apos;annuaire
        </SectionTitle>
        <input
          className={`${inputClass} mb-3`}
          placeholder="Chercher…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {filtered.length === 0 && <Empty title="Aucun résultat." />}
        <div className="stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setSelectedId(m.id);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`rounded-2xl border bg-surface p-4 text-left transition duration-200 hover:-translate-y-1 hover:shadow-lg ${
                selectedId === m.id ? "border-turquoise ring-2 ring-turquoise/25" : "border-line hover:border-turquoise/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <Avatar seed={m.id} first={m.firstName} last={m.lastName} photo={m.photo} size={44} />
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{m.firstName} {m.lastName}</h3>
                  <p className="truncate text-sm text-ink-soft">{m.job}</p>
                  <p className="text-xs text-ink-soft">
                    {m.neighborhood} · {adj.get(m.id)?.size ?? 0} lien{(adj.get(m.id)?.size ?? 0) > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <p className="mt-2.5 line-clamp-2 text-sm text-ink-soft">{m.bio}</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {m.mentor && <Badge tone="rose">Marraine</Badge>}
                {m.isNewcomer && <Badge tone="turquoise">Nouvelle</Badge>}
                {m.zodiac && <ZodiacBadge sign={m.zodiac} size="sm" />}
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

/** Le panneau qui répond à « comment j'entre en contact avec elle ? ». */
function IntroPanel({ memberId, onClose }: { memberId: string; onClose: () => void }) {
  const member = MEMBERS_BY_ID[memberId];
  const path = useMemo(() => introPath(ME, memberId), [memberId]);
  const mutuals = useMemo(() => mutualFriends(ME, memberId), [memberId]);
  const adj = useMemo(() => buildAdjacency(), []);
  const connections = [...(adj.get(memberId) ?? [])].map((id) => MEMBERS_BY_ID[id]).filter(Boolean);

  // Le premier relais du chemin : la personne à qui demander l'introduction.
  const relay = path && path.length > 2 ? MEMBERS_BY_ID[path[1]] : null;

  return (
    <Card className="animate-fade-up border-turquoise/40">
      <div className="flex items-start gap-3">
        <Avatar seed={member.id} first={member.firstName} last={member.lastName} photo={member.photo} size={52} />
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">{member.firstName} {member.lastName}</h2>
          <p className="text-sm text-ink-soft">{member.job} · {member.company}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {member.mentor && <Badge tone="rose">Marraine</Badge>}
            {member.zodiac && <ZodiacBadge sign={member.zodiac} size="sm" />}
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="rounded-lg px-2 py-1 text-ink-soft transition hover:bg-cream hover:text-ink"
        >
          ×
        </button>
      </div>

      {/* Chemin d'introduction */}
      <div className="mt-4 rounded-xl bg-cream/70 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Comment la contacter
        </p>
        {!path ? (
          <p className="text-sm">
            Aucune amie commune pour l&apos;instant : écrivez-lui directement, en disant
            d&apos;où vous venez.
          </p>
        ) : path.length === 2 ? (
          <p className="text-sm">Vous êtes déjà connectées. Écrivez-lui directement.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-1">
              {path.map((id, i) => {
                const m = id === ME ? null : MEMBERS_BY_ID[id];
                return (
                  <span key={id} className="flex items-center gap-1">
                    {i > 0 && <span className="text-ink-soft">→</span>}
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-1 text-xs">
                      <Avatar
                        seed={id}
                        first={m?.firstName ?? "Vous"}
                        last={m?.lastName}
                        size={18}
                      />
                      {m ? m.firstName : "Vous"}
                    </span>
                  </span>
                );
              })}
            </div>
            {relay && (
              <p className="mt-2 text-sm">
                Demandez à <strong>{relay.firstName}</strong> de vous présenter —
                {path.length === 3 ? " elle la connaît directement." : " c'est le chemin le plus court."}
              </p>
            )}
          </>
        )}
      </div>

      {mutuals.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Vos amies communes
          </p>
          <div className="flex flex-wrap gap-1.5">
            {mutuals.map((id) => {
              const m = MEMBERS_BY_ID[id];
              return m ? (
                <span key={id} className="inline-flex items-center gap-1 rounded-full bg-turquoise/12 px-2 py-1 text-xs">
                  <Avatar seed={id} first={m.firstName} last={m.lastName} size={18} />
                  {m.firstName}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      <div className="mt-3">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Elle connaît ({connections.length})
        </p>
        <div className="flex flex-wrap gap-1.5">
          {connections.length === 0 && (
            <span className="text-xs text-ink-soft">Personne pour l&apos;instant — un profil à reconnecter.</span>
          )}
          {connections.map((m) => (
            <span key={m.id} className="inline-flex items-center gap-1 rounded-full bg-cream px-2 py-1 text-xs">
              <Avatar seed={m.id} first={m.firstName} last={m.lastName} size={18} />
              {m.firstName}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/messages?avec=${member.id}`}>
          <Button size="sm">Lui écrire</Button>
        </Link>
        {relay && (
          <Link href={`/messages?avec=${relay.id}`}>
            <Button size="sm" variant="rose">Demander à {relay.firstName}</Button>
          </Link>
        )}
        {member.linkedin && (
          <a href={`https://${member.linkedin}`} target="_blank" rel="noreferrer">
            <Button size="sm" variant="ghost">LinkedIn</Button>
          </a>
        )}
      </div>
    </Card>
  );
}
