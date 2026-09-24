"use client";

import { useMemo, useState } from "react";
import Avatar from "@/components/Avatar";
import Guard from "@/components/Guard";
import { Badge, Button, Card, Empty, Field, SectionTitle, Stat, inputClass } from "@/components/ui";
import { MEMBERS } from "@/lib/members";
import { ME, useStore } from "@/lib/store";
import type { Invite, InviteStatus } from "@/lib/types";

const STATUS: Record<InviteStatus, { label: string; tone: "neutral" | "turquoise" | "rose"; next?: string }> = {
  sent: { label: "Invitation envoyée", tone: "neutral", next: "Marquer comme acceptée" },
  accepted: { label: "Code accepté", tone: "turquoise", next: "Marquer comme inscrite" },
  joined: { label: "Membre du réseau", tone: "rose" },
};

/** Remise appliquée à la marraine, par palier. Simple, lisible, annonçable au pitch. */
function rewardFor(joined: number): { pct: number; label: string; nextAt: number | null } {
  if (joined >= 5) return { pct: 50, label: "Ambassadrice", nextAt: null };
  if (joined >= 3) return { pct: 30, label: "Marraine confirmée", nextAt: 5 };
  if (joined >= 1) return { pct: 15, label: "Marraine", nextAt: 3 };
  return { pct: 0, label: "Pas encore de filleule", nextAt: 1 };
}

export default function Page() {
  return (
    <Guard>
      <Marrainage />
    </Guard>
  );
}

function Marrainage() {
  const { invites, addInvite, advanceInvite, profile } = useStore();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [lastCode, setLastCode] = useState<string | null>(null);

  const joined = invites.filter((i) => i.status === "joined").length;
  const reward = rewardFor(joined);

  // Classement : les marraines fictives + vous, pour rendre la boucle tangible.
  const leaderboard = useMemo(() => {
    const mentors = MEMBERS.filter((m) => m.mentor).slice(0, 5).map((m, i) => ({
      id: m.id,
      name: `${m.firstName} ${m.lastName}`,
      count: 6 - i,
      isMe: false,
    }));
    return [...mentors, { id: ME, name: `${profile.firstName} ${profile.lastName}`, count: joined, isMe: true }]
      .sort((a, b) => b.count - a.count);
  }, [joined, profile.firstName, profile.lastName]);

  function send() {
    const invite = addInvite(firstName.trim(), email.trim());
    setLastCode(invite.code);
    setFirstName("");
    setEmail("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Marrainage</h1>
        <p className="text-sm text-ink-soft">
          Invitez une entrepreneuse. Si elle rejoint le réseau, vous obtenez une remise sur votre adhésion.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat value={invites.length} label="invitations envoyées" />
        <Stat value={invites.filter((i) => i.status !== "sent").length} label="codes acceptés" tone="turquoise" />
        <Stat value={joined} label="filleules inscrites" tone="rose" />
        <Stat value={`-${reward.pct} %`} label="sur votre adhésion" tone="rose" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        {/* Inviter */}
        <div className="space-y-5">
          <Card className="border-rose/25 bg-gradient-to-br from-rose/6 to-turquoise/6">
            <SectionTitle hint="Un code unique, valable une fois.">Inviter une entrepreneuse</SectionTitle>
            <div className="space-y-4">
              <Field label="Son prénom">
                <input className={inputClass} value={firstName}
                  onChange={(e) => setFirstName(e.target.value)} placeholder="Nadia" />
              </Field>
              <Field label="Son e-mail">
                <input type="email" className={inputClass} value={email}
                  onChange={(e) => setEmail(e.target.value)} placeholder="nadia@exemple.fr" />
              </Field>
              <Button variant="rose" full disabled={!firstName.trim() || !email.includes("@")} onClick={send}>
                Envoyer l&apos;invitation
              </Button>
            </div>

            {lastCode && (
              <div className="mt-4 animate-fade-up rounded-xl border border-turquoise/40 bg-surface p-4 text-center">
                <p className="text-xs uppercase tracking-wide text-ink-soft">Code généré</p>
                <p className="mt-1 font-mono text-xl font-semibold tracking-wider text-[#0E7C8C]">{lastCode}</p>
                <p className="mt-1.5 text-xs text-ink-soft">
                  Il donne 20 % sur sa première adhésion, et fait monter votre palier.
                </p>
              </div>
            )}
          </Card>

          {/* Paliers */}
          <Card>
            <SectionTitle hint="Votre remise augmente à chaque filleule qui reste.">Vos paliers</SectionTitle>
            <div className="space-y-2.5">
              {[
                { at: 1, pct: 15, label: "Marraine" },
                { at: 3, pct: 30, label: "Marraine confirmée" },
                { at: 5, pct: 50, label: "Ambassadrice" },
              ].map((tier) => {
                const reached = joined >= tier.at;
                return (
                  <div
                    key={tier.at}
                    className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                      reached ? "border-turquoise/40 bg-turquoise/8" : "border-line bg-bg"
                    }`}
                  >
                    <div className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                      reached ? "bg-turquoise text-white" : "bg-cream text-ink-soft"
                    }`}>
                      {reached ? "✓" : tier.at}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{tier.label}</p>
                      <p className="text-xs text-ink-soft">
                        {tier.at} filleule{tier.at > 1 ? "s" : ""} inscrite{tier.at > 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className={`text-sm font-semibold ${reached ? "text-[#C22B52]" : "text-ink-soft"}`}>
                      -{tier.pct} %
                    </span>
                  </div>
                );
              })}
            </div>
            {reward.nextAt && (
              <p className="mt-3 text-xs text-ink-soft">
                Encore {reward.nextAt - joined} filleule{reward.nextAt - joined > 1 ? "s" : ""} pour le palier suivant.
              </p>
            )}
          </Card>
        </div>

        {/* Suivi + classement */}
        <div className="space-y-5">
          <Card>
            <SectionTitle hint="Cliquez pour faire avancer le statut (démo).">Mes invitations</SectionTitle>
            {invites.length === 0 && <Empty title="Aucune invitation pour l'instant." />}
            <div className="space-y-2.5">
              {invites.map((i) => <InviteRow key={i.id} invite={i} onAdvance={() => advanceInvite(i.id)} />)}
            </div>
          </Card>

          <Card>
            <SectionTitle hint="Celles qui font grandir le réseau.">Classement des marraines</SectionTitle>
            <div className="space-y-1.5">
              {leaderboard.map((row, idx) => (
                <div
                  key={row.id}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                    row.isMe ? "bg-rose/8 ring-1 ring-rose/25" : ""
                  }`}
                >
                  <span className="w-5 text-sm font-semibold tabular-nums text-ink-soft">{idx + 1}</span>
                  <Avatar
                    seed={row.id}
                    first={row.name.split(" ")[0] || "É"}
                    last={row.name.split(" ")[1]}
                    photo={row.isMe ? profile.photo : undefined}
                    config={row.isMe ? profile.avatar : undefined}
                    size={30}
                  />
                  <span className={`min-w-0 flex-1 truncate text-sm ${row.isMe ? "font-semibold" : ""}`}>
                    {row.name} {row.isMe && <span className="text-ink-soft">(vous)</span>}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">{row.count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InviteRow({ invite, onAdvance }: { invite: Invite; onAdvance: () => void }) {
  const s = STATUS[invite.status];
  return (
    <div className="rounded-xl border border-line bg-bg p-3">
      <div className="flex items-center gap-3">
        <Avatar seed={invite.code} first={invite.firstName} size={34} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{invite.firstName}</p>
          <p className="truncate text-xs text-ink-soft">{invite.email}</p>
        </div>
        <Badge tone={s.tone}>{s.label}</Badge>
      </div>
      <div className="mt-2.5 flex items-center gap-2 pl-[46px]">
        <span className="font-mono text-xs text-ink-soft">{invite.code}</span>
        {s.next && (
          <Button size="sm" variant="ghost" className="ml-auto" onClick={onAdvance}>{s.next}</Button>
        )}
      </div>
    </div>
  );
}
