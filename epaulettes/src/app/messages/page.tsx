"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Avatar from "@/components/Avatar";
import Guard from "@/components/Guard";
import { Badge, Button, Empty, inputClass } from "@/components/ui";
import { MEMBERS, MEMBERS_BY_ID } from "@/lib/members";
import { ME, useStore } from "@/lib/store";
import type { Conversation } from "@/lib/types";

export default function Page() {
  return (
    <Guard>
      <Suspense fallback={null}>
        <Messagerie />
      </Suspense>
    </Guard>
  );
}

function Messagerie() {
  const params = useSearchParams();
  const { conversations, sendMessage, markConversationRead, profile } = useStore();
  const [picked, setPicked] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [composing, setComposing] = useState(false);
  const [search, setSearch] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  // La conversation affichée : le choix explicite l'emporte, sinon ?avec=sonia
  // (depuis une carte membre), sinon la plus récente. Dérivé, donc pas d'effet.
  const requested = params.get("avec");
  const activeId =
    picked ?? (requested && MEMBERS_BY_ID[requested] ? requested : conversations[0]?.withId ?? null);
  const setActiveId = setPicked;

  const active = conversations.find((c) => c.withId === activeId) ?? null;
  const activeMember = activeId ? MEMBERS_BY_ID[activeId] : null;

  useEffect(() => {
    if (activeId) markConversationRead(activeId);
  }, [activeId, markConversationRead, active?.messages.length]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [activeId, active?.messages.length]);

  const candidates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MEMBERS.filter((m) =>
      !q ? true : `${m.firstName} ${m.lastName} ${m.job}`.toLowerCase().includes(q),
    ).slice(0, 30);
  }, [search]);

  function send() {
    if (!activeId || !draft.trim()) return;
    sendMessage(activeId, draft);
    setDraft("");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
          <p className="text-sm text-ink-soft">
            Les échanges restent dans le réseau, sans quitter l&apos;application.
          </p>
        </div>
        <Button variant="rose" size="sm" onClick={() => setComposing((c) => !c)}>
          {composing ? "Fermer" : "Nouveau message"}
        </Button>
      </div>

      {composing && (
        <div className="animate-fade-up rounded-2xl border border-rose/30 bg-rose/5 p-4">
          <input
            className={inputClass}
            placeholder="Chercher une membre…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="mt-3 flex max-h-56 flex-wrap gap-2 overflow-y-auto">
            {candidates.map((m) => (
              <button
                key={m.id}
                onClick={() => { setActiveId(m.id); setComposing(false); setSearch(""); }}
                className="flex items-center gap-2 rounded-xl border border-line bg-surface px-2.5 py-1.5 text-sm transition hover:border-turquoise"
              >
                <Avatar seed={m.id} first={m.firstName} last={m.lastName} size={24} />
                <span className="font-medium">{m.firstName} {m.lastName}</span>
                <span className="text-xs text-ink-soft">{m.job}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[330px_1fr]">
        {/* Liste des conversations */}
        <div className="space-y-2">
          {conversations.length === 0 && (
            <Empty title="Aucune conversation.">
              Ouvrez « Nouveau message » pour écrire à une membre.
            </Empty>
          )}
          {conversations.map((c) => (
            <ConversationRow
              key={c.withId}
              conversation={c}
              active={c.withId === activeId}
              onClick={() => setActiveId(c.withId)}
            />
          ))}
        </div>

        {/* Fil actif */}
        <div className="flex min-h-[60vh] flex-col overflow-hidden rounded-2xl border border-line bg-surface">
          {!activeMember ? (
            <div className="grid flex-1 place-items-center p-8 text-center text-sm text-ink-soft">
              Choisissez une conversation, ou écrivez à une nouvelle membre.
            </div>
          ) : (
            <>
              <header className="flex items-center gap-3 border-b border-line px-4 py-3">
                <Avatar
                  seed={activeMember.id} first={activeMember.firstName}
                  last={activeMember.lastName} photo={activeMember.photo} size={40}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {activeMember.firstName} {activeMember.lastName}
                  </p>
                  <p className="truncate text-xs text-ink-soft">
                    {activeMember.job} · {activeMember.neighborhood}
                  </p>
                </div>
                {activeMember.linkedin && (
                  <a
                    href={`https://${activeMember.linkedin}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink-soft transition hover:border-turquoise hover:text-ink"
                  >
                    LinkedIn
                  </a>
                )}
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto bg-bg/60 p-4">
                {(active?.messages ?? []).map((m) => {
                  const mine = m.from === ME;
                  return (
                    <div key={m.id} className={`flex gap-2 ${mine ? "justify-end" : ""}`}>
                      {!mine && (
                        <Avatar
                          seed={activeMember.id} first={activeMember.firstName}
                          last={activeMember.lastName} size={28} className="self-end"
                        />
                      )}
                      <div
                        className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm ${
                          mine
                            ? "rounded-br-sm bg-turquoise text-white"
                            : "rounded-bl-sm border border-line bg-surface"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.text}</p>
                        <p className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-ink-soft"}`}>
                          {new Date(m.at).toLocaleString("fr-FR", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {mine && (
                        <Avatar
                          seed={profile.avatarSeed} first={profile.firstName} last={profile.lastName}
                          photo={profile.photo} config={profile.avatar} size={28} className="self-end"
                        />
                      )}
                    </div>
                  );
                })}
                {!active?.messages.length && (
                  <p className="py-8 text-center text-sm text-ink-soft">
                    Premier message à {activeMember.firstName}. Dites pourquoi vous écrivez.
                  </p>
                )}
                <div ref={endRef} />
              </div>

              <div className="flex items-end gap-2 border-t border-line p-3">
                <textarea
                  rows={1}
                  className={`${inputClass} max-h-32 min-h-11 resize-y`}
                  placeholder={`Écrire à ${activeMember.firstName}…`}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                  }}
                />
                <Button onClick={send} disabled={!draft.trim()}>Envoyer</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ConversationRow({
  conversation, active, onClick,
}: { conversation: Conversation; active: boolean; onClick: () => void }) {
  const m = MEMBERS_BY_ID[conversation.withId];
  if (!m) return null;
  const last = conversation.messages[conversation.messages.length - 1];
  const unread = conversation.messages.filter((x) => !x.read && x.from !== ME).length;

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition ${
        active ? "border-turquoise bg-turquoise/8" : "border-line bg-surface hover:border-turquoise/40"
      }`}
    >
      <Avatar seed={m.id} first={m.firstName} last={m.lastName} photo={m.photo} size={40} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold">{m.firstName} {m.lastName}</p>
          {unread > 0 && <Badge tone="rose">{unread}</Badge>}
        </div>
        <p className="truncate text-xs text-ink-soft">
          {last?.from === ME ? "Vous : " : ""}{last?.text}
        </p>
      </div>
    </button>
  );
}
