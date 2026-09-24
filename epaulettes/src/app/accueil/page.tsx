"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Avatar from "@/components/Avatar";
import Guard from "@/components/Guard";
import MemberCard from "@/components/MemberCard";
import { Badge, Button, Card, Empty, SectionTitle, Stat, inputClass } from "@/components/ui";
import { EVENT_FORMAT_LABEL, formatRange, relativeDay } from "@/lib/events";
import { MEMBERS, MEMBERS_BY_ID } from "@/lib/members";
import { matchesFor, routeHelpRequest } from "@/lib/matching";
import { GENERAL_CHAT_ID, ME, useStore } from "@/lib/store";

export default function Page() {
  return (
    <Guard>
      <Accueil />
    </Guard>
  );
}

function Accueil() {
  const {
    profile, events, requests, addRequest, toggleAttendance, invites,
    conversations, openConversation,
  } = useStore();

  const general = conversations.find((c) => c.withId === GENERAL_CHAT_ID);
  const generalUnread = general?.messages.filter((m) => !m.read && m.from !== ME).length ?? 0;
  const lastGeneral = general?.messages[general.messages.length - 1];
  const lastAuthor = lastGeneral ? MEMBERS_BY_ID[lastGeneral.from] : null;

  const matches = useMemo(
    () => matchesFor(
      {
        skills: profile.skills, offers: profile.offers, needs: profile.needs,
        hobbies: profile.hobbies, job: profile.job, neighborhood: profile.neighborhood,
      },
      ME,
      3,
    ),
    [profile],
  );

  const upcoming = useMemo(
    () => [...events]
      .filter((e) => new Date(e.date) > new Date())
      .sort((a, b) => +new Date(a.date) - +new Date(b.date))
      .slice(0, 3),
    [events],
  );

  const joinedCount = invites.filter((i) => i.status === "joined").length;

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <section className="flex flex-wrap items-center gap-4">
        <Avatar
          seed={profile.avatarSeed} first={profile.firstName} last={profile.lastName}
          photo={profile.photo} config={profile.avatar} size={60}
        />
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">
            Bonjour {profile.firstName}.
          </h1>
          <p className="text-sm text-ink-soft">
            {profile.job}{profile.company && ` · ${profile.company}`} · {profile.neighborhood}
          </p>
        </div>
        <Link href="/profil" className="ml-auto">
          <Button variant="outline" size="sm">Mon profil</Button>
        </Link>
      </section>

      <section className="stagger grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat value={MEMBERS.length + 1} label="membres du réseau" />
        <Stat value={upcoming.length} label="rendez-vous à venir" tone="turquoise" />
        <Stat value={matches.length} label="rencontres suggérées" tone="rose" />
        <Stat value={joinedCount} label="filleules arrivées" />
      </section>

      {/* Demande d'aide */}
      <HelpBox onSubmit={addRequest} />

      {/* Suggestions */}
      <section>
        <SectionTitle
          hint="Calculé sur vos besoins, vos compétences et la forme du réseau."
          action={<Link href="/reseau" className="text-sm font-medium text-[#0E7C8C] hover:underline">Tout voir</Link>}
        >
          Vos rencontres de la semaine
        </SectionTitle>
        <div className="stagger grid gap-3 lg:grid-cols-3">
          {matches.map((m) => <MemberCard key={m.member.id} match={m} />)}
        </div>
      </section>

      {/* Agenda */}
      <section>
        <SectionTitle
          hint="Cliquez pour vous inscrire."
          action={<Link href="/agenda" className="text-sm font-medium text-[#0E7C8C] hover:underline">Agenda complet</Link>}
        >
          Prochains rendez-vous
        </SectionTitle>
        <div className="stagger grid gap-3 md:grid-cols-3">
          {upcoming.map((e) => {
            const going = e.attendees.includes(ME);
            return (
              <Card key={e.id} className="flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Badge tone={e.format === "apero" ? "rose" : e.format === "visio" ? "turquoise" : "neutral"}>
                    {EVENT_FORMAT_LABEL[e.format]}
                  </Badge>
                  <span className="text-xs text-ink-soft">{relativeDay(e.date)}</span>
                </div>
                <h3 className="mt-2.5 font-semibold leading-snug">{e.title}</h3>
                <p className="mt-1 text-sm text-ink-soft">
                  {e.place} · {formatRange(e.date, e.endDate)}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {e.attendees.slice(0, 4).map((id) => {
                      const m = MEMBERS_BY_ID[id];
                      return m ? (
                        <Avatar key={id} seed={id} first={m.firstName} last={m.lastName} size={26} ring />
                      ) : null;
                    })}
                  </div>
                  <span className="text-xs text-ink-soft">{e.attendees.length} inscrites</span>
                </div>
                <Button
                  className="mt-4"
                  full
                  size="sm"
                  variant={going ? "outline" : "primary"}
                  onClick={() => toggleAttendance(e.id)}
                >
                  {going ? "Je suis inscrite ✓" : "Je participe"}
                </Button>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Salon commun */}
      {general && (
        <section>
          <SectionTitle hint="Le groupe du réseau, sans quitter l'application.">
            Le salon des Épaulettes
          </SectionTitle>
          <button
            onClick={() => openConversation(GENERAL_CHAT_ID)}
            className="flex w-full items-center gap-3 rounded-2xl border border-line bg-surface p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-turquoise hover:shadow-md"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-turquoise to-rose text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="size-6">
                <circle cx="9" cy="9" r="3" />
                <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" strokeLinecap="round" />
                <path d="M16 6.5a3 3 0 0 1 0 5.6M17.5 19c0-2.4-.9-4.2-2.4-5.2" strokeLinecap="round" />
              </svg>
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="font-semibold">Salon des Épaulettes</span>
                {generalUnread > 0 && <Badge tone="rose">{generalUnread} non lus</Badge>}
              </span>
              <span className="mt-0.5 block truncate text-sm text-ink-soft">
                {lastAuthor ? `${lastAuthor.firstName} : ` : ""}
                {lastGeneral?.text.startsWith("::") ? "a réagi" : lastGeneral?.text}
              </span>
            </span>
            <span className="shrink-0 text-sm font-medium text-[#0E7C8C]">Ouvrir</span>
          </button>
        </section>
      )}

      {/* Fil d'entraide */}
      <section>
        <SectionTitle hint="Les demandes routées vers les bonnes personnes, au lieu de se noyer dans WhatsApp.">
          Le fil d&apos;entraide
        </SectionTitle>
        <div className="space-y-3">
          {requests.length === 0 && <Empty title="Aucune demande en cours." />}
          {requests.map((r) => {
            const author = r.authorId === ME ? null : MEMBERS_BY_ID[r.authorId];
            return (
              <Card key={r.id}>
                <div className="flex items-start gap-3">
                  <Avatar
                    seed={r.authorId}
                    first={author?.firstName ?? profile.firstName}
                    last={author?.lastName ?? profile.lastName}
                    photo={author ? author.photo : profile.photo}
                    config={author ? undefined : profile.avatar}
                    size={38}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {author ? `${author.firstName} ${author.lastName}` : "Vous"}
                      <span className="font-normal text-ink-soft">
                        {author ? ` · ${author.job}` : ""}
                      </span>
                    </p>
                    <p className="mt-1">{r.text}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-ink-soft">Routée vers</span>
                      {r.routedTo.map((id) => {
                        const m = MEMBERS_BY_ID[id];
                        return m ? (
                          <span key={id} className="inline-flex items-center gap-1.5 rounded-full bg-cream px-2 py-1 text-xs">
                            <Avatar seed={id} first={m.firstName} last={m.lastName} size={18} />
                            {m.firstName}
                          </span>
                        ) : null;
                      })}
                    </div>
                    {r.answers.map((a, i) => {
                      const m = MEMBERS_BY_ID[a.memberId];
                      return (
                        <div key={i} className="mt-3 flex items-start gap-2.5 rounded-xl bg-turquoise/8 p-3">
                          {m && <Avatar seed={a.memberId} first={m.firstName} last={m.lastName} size={26} />}
                          <p className="text-sm">
                            <span className="font-medium">{m?.firstName} : </span>
                            {a.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function HelpBox({ onSubmit }: { onSubmit: (text: string, routedTo: string[]) => void }) {
  const [text, setText] = useState("");
  const routed = useMemo(() => (text.trim().length > 12 ? routeHelpRequest(text, ME) : []), [text]);

  return (
    <Card className="border-rose/25 bg-gradient-to-br from-rose/6 to-turquoise/6">
      <SectionTitle hint="Décrivez votre besoin. Le réseau trouve les trois bonnes personnes.">
        Demander un coup d&apos;épaule
      </SectionTitle>
      <textarea
        rows={2}
        className={inputClass}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Je cherche une développeuse pour reprendre un site WordPress, budget 4 000 €…"
      />
      {routed.length > 0 && (
        <div className="mt-3 animate-fade-up space-y-2">
          <p className="text-xs font-medium text-ink-soft">Ces membres seraient prévenues :</p>
          {routed.map(({ member, why }) => (
            <div key={member.id} className="flex items-start gap-2.5 rounded-xl bg-surface/80 p-2.5">
              <Avatar seed={member.id} first={member.firstName} last={member.lastName} size={30} />
              <div className="text-sm">
                <p className="font-medium">{member.firstName} {member.lastName}</p>
                <p className="text-xs text-ink-soft">{why}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <Button
        className="mt-4"
        variant="rose"
        disabled={routed.length === 0}
        onClick={() => {
          onSubmit(text, routed.map((r) => r.member.id));
          setText("");
        }}
      >
        Envoyer aux {routed.length || 3} membres
      </Button>
    </Card>
  );
}
