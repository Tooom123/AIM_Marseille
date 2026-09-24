"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Avatar from "./Avatar";
import GifCard from "./GifCard";
import { Badge, Button, inputClass } from "./ui";
import { MEMBERS, MEMBERS_BY_ID } from "@/lib/members";
import { ME, useStore } from "@/lib/store";
import { DEMO_LINKEDIN } from "@/lib/links";
import {
  GIFS, STICKER_PACKS, decodeMessage, encodeGif, encodeSticker,
} from "@/lib/stickers";

export default function MessengerDock() {
  return (
    <Suspense fallback={null}>
      <Dock />
    </Suspense>
  );
}

function Dock() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const {
    conversations, sendMessage, markConversationRead, unreadCount, profile, ready,
    pendingConversation, clearPendingConversation,
  } = useStore();

  const [openState, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  /** Dernier `?avec=` traité : sert à ne réagir qu'au changement d'URL. */
  const handledRef = useRef<string | null>(null);
  const [draft, setDraft] = useState("");
  const [tray, setTray] = useState<"none" | "stickers" | "gifs">("none");
  const [search, setSearch] = useState("");
  const [composing, setComposing] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // `?avec=sonia` ouvre directement la bonne conversation, depuis n'importe où.
  // On le lit pendant le rendu plutôt que dans un effet : le volet s'ouvre du
  // premier coup, sans rendu intermédiaire.
  // Deux sources : l'URL (lien partagé) et l'état partagé (bouton dans l'app).
  const requested = pendingConversation ?? params.get("avec");
  const pendingOpen = !!(requested && MEMBERS_BY_ID[requested]);
  const open = openState || pendingOpen;

  useEffect(() => {
    if (!pendingOpen || handledRef.current === requested) return;
    handledRef.current = requested;
    setPicked(requested);
    setOpen(true);
    clearPendingConversation();
    // On retire le paramètre : sans cela, fermer puis rouvrir rejouerait l'ouverture.
    if (params.get("avec")) router.replace(pathname, { scroll: false });
  }, [pendingOpen, requested, router, pathname, params, clearPendingConversation]);

  const activeId = picked ?? (pendingOpen ? requested : null) ?? conversations[0]?.withId ?? null;
  const active = conversations.find((c) => c.withId === activeId) ?? null;
  const activeMember = activeId ? MEMBERS_BY_ID[activeId] : null;

  useEffect(() => {
    if (open && activeId) markConversationRead(activeId);
  }, [open, activeId, markConversationRead, active?.messages.length]);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: "end" });
  }, [open, activeId, active?.messages.length, tray]);

  const candidates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MEMBERS.filter((m) =>
      !q ? true : `${m.firstName} ${m.lastName} ${m.job}`.toLowerCase().includes(q),
    ).slice(0, 24);
  }, [search]);

  // Pas de messagerie tant que le profil n'existe pas (écran d'accueil).
  if (!ready || !profile.onboarded) return null;

  function send(text: string) {
    if (!activeId || !text.trim()) return;
    sendMessage(activeId, text);
    setDraft("");
    setTray("none");
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Fermer la messagerie" : "Ouvrir la messagerie"}
        className={`fixed z-50 flex size-14 items-center justify-center rounded-full bg-rose text-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ${
          open
            ? "right-4 top-4 rotate-90 sm:right-8 sm:top-auto sm:bottom-[calc(min(620px,88dvh)+2.5rem)]"
            : "bottom-20 right-4 md:bottom-6"
        }`}
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.9">
            <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-5A8 8 0 1 1 21 12z" strokeLinejoin="round" />
          </svg>
        )}
        {!open && unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid size-6 place-items-center rounded-full bg-ink text-xs font-bold ring-2 ring-bg">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Volet */}
      <div
        className={`fixed bottom-0 right-0 z-40 flex h-[min(620px,88dvh)] w-full flex-col overflow-hidden border-line bg-surface shadow-2xl transition-all duration-300 ease-out sm:bottom-6 sm:right-6 sm:w-[min(760px,calc(100vw-3rem))] sm:rounded-3xl sm:border ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-6 opacity-0"
        }`}
        aria-hidden={!open}
      >
        <header className="flex items-center gap-2 border-b border-line px-4 py-3">
          <h2 className="font-semibold">Messages</h2>
          {unreadCount > 0 && <Badge tone="rose">{unreadCount} non lus</Badge>}
          <button
            onClick={() => setComposing((c) => !c)}
            className="ml-auto rounded-lg px-2.5 py-1.5 text-sm font-medium text-[#0E7C8C] transition hover:bg-cream"
          >
            {composing ? "Annuler" : "Nouveau"}
          </button>
          <button
            onClick={() => setOpen(false)}
            aria-label="Fermer"
            className="rounded-lg px-2 py-1 text-ink-soft transition hover:bg-cream hover:text-ink sm:hidden"
          >
            ×
          </button>
        </header>

        {composing && (
          <div className="animate-fade-up border-b border-line bg-cream/40 p-3">
            <input
              className={inputClass}
              placeholder="Chercher une membre…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            <div className="mt-2 flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
              {candidates.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setPicked(m.id); setComposing(false); setSearch(""); }}
                  className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-2 py-1 text-sm transition hover:border-turquoise"
                >
                  <Avatar seed={m.id} first={m.firstName} last={m.lastName} size={20} />
                  {m.firstName} {m.lastName}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid min-h-0 flex-1 sm:grid-cols-[210px_1fr]">
          {/* Conversations */}
          <div className="hidden min-h-0 overflow-y-auto border-r border-line bg-bg/50 p-2 sm:block">
            {conversations.map((c) => {
              const m = MEMBERS_BY_ID[c.withId];
              if (!m) return null;
              const last = c.messages[c.messages.length - 1];
              const unread = c.messages.filter((x) => !x.read && x.from !== ME).length;
              const preview = last ? decodeMessage(last.text) : null;
              return (
                <button
                  key={c.withId}
                  onClick={() => setPicked(c.withId)}
                  className={`mb-1 flex w-full items-center gap-2 rounded-xl p-2 text-left transition ${
                    c.withId === activeId ? "bg-turquoise/12" : "hover:bg-cream"
                  }`}
                >
                  <Avatar seed={m.id} first={m.firstName} last={m.lastName} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.firstName}</p>
                    <p className="truncate text-xs text-ink-soft">
                      {preview?.type === "sticker" ? preview.value
                        : preview?.type === "gif" ? `GIF · ${preview.value.label}`
                        : last?.text}
                    </p>
                  </div>
                  {unread > 0 && (
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-rose text-[10px] font-bold text-white">
                      {unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Fil */}
          <div className="flex min-h-0 flex-col">
            {!activeMember ? (
              <div className="grid flex-1 place-items-center p-6 text-center text-sm text-ink-soft">
                Choisissez une conversation, ou écrivez à une nouvelle membre.
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 border-b border-line px-3 py-2">
                  <Avatar
                    seed={activeMember.id} first={activeMember.firstName}
                    last={activeMember.lastName} size={32}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {activeMember.firstName} {activeMember.lastName}
                    </p>
                    <p className="truncate text-xs text-ink-soft">{activeMember.job}</p>
                  </div>
                  {activeMember.linkedin && (
                    <a
                      href={DEMO_LINKEDIN}
                      target="_blank" rel="noreferrer"
                      className="rounded-lg border border-line px-2 py-1 text-xs text-ink-soft transition hover:border-turquoise hover:text-ink"
                    >
                      LinkedIn
                    </a>
                  )}
                </div>

                <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto bg-bg/40 p-3">
                  {(active?.messages ?? []).map((msg) => {
                    const mine = msg.from === ME;
                    const content = decodeMessage(msg.text);
                    return (
                      <div
                        key={msg.id}
                        className={`flex animate-fade-up gap-2 ${mine ? "justify-end" : ""}`}
                      >
                        {!mine && (
                          <Avatar
                            seed={activeMember.id} first={activeMember.firstName}
                            last={activeMember.lastName} size={24} className="self-end"
                          />
                        )}
                        {content.type === "sticker" ? (
                          <span className="text-5xl leading-none">{content.value}</span>
                        ) : content.type === "gif" ? (
                          <GifCard gif={content.value} size={160} />
                        ) : (
                          <div
                            className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${
                              mine
                                ? "rounded-br-sm bg-turquoise text-white"
                                : "rounded-bl-sm border border-line bg-surface"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{content.value}</p>
                            <p className={`mt-0.5 text-[10px] ${mine ? "text-white/70" : "text-ink-soft"}`}>
                              {new Date(msg.at).toLocaleString("fr-FR", {
                                day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                              })}
                            </p>
                          </div>
                        )}
                        {mine && (
                          <Avatar
                            seed={profile.avatarSeed} first={profile.firstName}
                            last={profile.lastName} photo={profile.photo}
                            config={profile.avatar} size={24} className="self-end"
                          />
                        )}
                      </div>
                    );
                  })}
                  {!active?.messages.length && (
                    <p className="py-6 text-center text-sm text-ink-soft">
                      Premier message à {activeMember.firstName}.
                    </p>
                  )}
                  <div ref={endRef} />
                </div>

                {/* Tiroir stickers / gifs */}
                {tray !== "none" && (
                  <div className="max-h-52 animate-fade-up overflow-y-auto border-t border-line bg-cream/40 p-3">
                    {tray === "stickers" ? (
                      STICKER_PACKS.map((pack) => (
                        <div key={pack.name} className="mb-3 last:mb-0">
                          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                            {pack.name}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {pack.stickers.map((s) => (
                              <button
                                key={s.id}
                                title={s.label}
                                onClick={() => send(encodeSticker(s.emoji))}
                                className="rounded-xl p-1.5 text-3xl transition hover:scale-125 hover:bg-surface"
                              >
                                {s.emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {GIFS.map((g) => (
                          <button
                            key={g.id}
                            onClick={() => send(encodeGif(g.id))}
                            className="overflow-hidden rounded-xl ring-line transition hover:ring-2 hover:ring-turquoise"
                          >
                            <GifCard gif={g} size={116} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-end gap-1.5 border-t border-line p-2.5">
                  <TrayButton
                    active={tray === "stickers"}
                    onClick={() => setTray((t) => (t === "stickers" ? "none" : "stickers"))}
                    label="Stickers"
                  >
                    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M9 10h.01M15 10h.01M8.5 14.5c1 1.4 5 1.4 6 0" strokeLinecap="round" />
                    </svg>
                  </TrayButton>
                  <TrayButton
                    active={tray === "gifs"}
                    onClick={() => setTray((t) => (t === "gifs" ? "none" : "gifs"))}
                    label="GIF"
                  >
                    <span className="text-xs font-bold">GIF</span>
                  </TrayButton>
                  <textarea
                    rows={1}
                    className={`${inputClass} max-h-28 min-h-10 flex-1 resize-none py-2`}
                    placeholder={`Écrire à ${activeMember.firstName}…`}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(draft); }
                    }}
                  />
                  <Button size="sm" onClick={() => send(draft)} disabled={!draft.trim()}>
                    Envoyer
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function TrayButton({
  children, active, onClick, label,
}: { children: React.ReactNode; active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid size-10 shrink-0 place-items-center rounded-xl border transition ${
        active
          ? "border-turquoise bg-turquoise/14 text-[#0E7C8C]"
          : "border-line bg-surface text-ink-soft hover:border-turquoise/50 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
