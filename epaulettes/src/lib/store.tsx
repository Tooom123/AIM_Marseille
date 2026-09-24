"use client";

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from "react";
import { DEFAULT_AVATAR } from "./avatarOptions";
import { EVENTS } from "./events";
import type { Conversation, Epaulette, HelpRequest, Invite, Profile } from "./types";

const KEY = "epaulettes.v1";

/** L'utilisatrice courante est "me" : elle n'est pas dans MEMBERS, elle s'ajoute via l'onboarding. */
export const ME = "me";

const EMPTY_PROFILE: Profile = {
  firstName: "", lastName: "", job: "", company: "", age: null, linkedin: "",
  neighborhood: "", skills: [], offers: [], needs: [], hobbies: [],
  bio: "", avatarSeed: "epaulette", avatar: DEFAULT_AVATAR, onboarded: false,
};

type State = {
  profile: Profile;
  events: Epaulette[];
  invites: Invite[];
  requests: HelpRequest[];
  conversations: Conversation[];
  /** Mises en relation déjà lancées, pour afficher un état "contactée". */
  connected: string[];
};

const INITIAL: State = {
  profile: EMPTY_PROFILE,
  events: EVENTS,
  invites: [
    {
      id: "inv-1", code: "EPAULE-7F3K", firstName: "Sarah", email: "sarah@exemple.fr",
      status: "joined", sentAt: new Date(Date.now() - 12 * 864e5).toISOString(), marraine: "me",
    },
    {
      id: "inv-2", code: "EPAULE-B29X", firstName: "Lucie", email: "lucie@exemple.fr",
      status: "accepted", sentAt: new Date(Date.now() - 4 * 864e5).toISOString(), marraine: "me",
    },
  ],
  requests: [
    {
      id: "req-1", authorId: "maud",
      text: "Je cherche un packaging écoconçu pour une gamme de 3 produits, livrable en 6 semaines.",
      createdAt: new Date(Date.now() - 2 * 36e5).toISOString(),
      routedTo: ["sonia", "claire", "sophie"],
      answers: [{ memberId: "sonia", text: "Je peux te montrer deux fournisseurs carton recyclé à Aubagne.", at: new Date(Date.now() - 36e5).toISOString() }],
    },
  ],
  connected: [],
  conversations: [
    {
      withId: "sonia",
      messages: [
        { id: "m1", from: "sonia", at: hoursAgo(26),  read: true,
          text: "Bonjour ! On s'est croisées au dernier apéro. Vous cherchiez une identité visuelle ?" },
        { id: "m2", from: ME, at: hoursAgo(25), read: true,
          text: "Oui, exactement. J'aimerais bien voir votre travail." },
        { id: "m3", from: "sonia", at: hoursAgo(3), read: false,
          text: "Je vous envoie trois cas clients cette semaine. On se cale un café mardi ?" },
      ],
    },
    {
      withId: "therese",
      messages: [
        { id: "m4", from: "therese", at: hoursAgo(50), read: false,
          text: "J'ai vu que vous cherchiez à structurer une offre de formation. Je suis passée par la certification Qualiopi l'an dernier, je peux vous faire gagner des semaines." },
      ],
    },
  ],
};

/** Horodatage relatif, pour que la démo paraisse vivante quel que soit le jour. */
function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 36e5).toISOString();
}

type Ctx = State & {
  ready: boolean;
  saveProfile: (p: Partial<Profile>) => void;
  resetAll: () => void;
  toggleAttendance: (eventId: string) => void;
  createEvent: (e: Omit<Epaulette, "id" | "attendees" | "host" | "createdByUser">) => Epaulette;
  addInvite: (firstName: string, email: string) => Invite;
  advanceInvite: (id: string) => void;
  addRequest: (text: string, routedTo: string[]) => HelpRequest;
  markConnected: (memberId: string) => void;
  sendMessage: (toId: string, text: string) => void;
  markConversationRead: (withId: string) => void;
  unreadCount: number;
};

const StoreContext = createContext<Ctx | null>(null);

/** Lecture du stockage local. Tolère un stockage absent, bloqué ou corrompu. */
function loadState(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return INITIAL;
    const parsed = JSON.parse(raw) as Partial<State>;
    return {
      ...INITIAL,
      ...parsed,
      profile: {
        ...EMPTY_PROFILE,
        ...(parsed.profile ?? {}),
        avatar: { ...DEFAULT_AVATAR, ...(parsed.profile?.avatar ?? {}) },
      },
      // Les événements de base viennent du code : on ne garde que ceux créés par l'utilisatrice.
      events: [...EVENTS, ...(parsed.events ?? []).filter((e) => e.createdByUser)],
    };
  } catch {
    // localStorage indisponible (navigation privée) ou JSON invalide.
    return INITIAL;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Hydratation : lue une seule fois, paresseusement. Le rendu serveur part
  // toujours de INITIAL, et `ready` empêche l'affichage avant la lecture du
  // stockage — sans quoi React signalerait une divergence d'hydratation.
  const [state, setState] = useState<State>(INITIAL);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Une seule passe, au montage : on synchronise l'état React avec le
    // stockage du navigateur (système externe), donc pas de cascade de rendus.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(loadState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // quota ou stockage bloqué : l'app continue de fonctionner en mémoire.
    }
  }, [state, ready]);

  const saveProfile = useCallback((p: Partial<Profile>) => {
    setState((s) => ({ ...s, profile: { ...s.profile, ...p } }));
  }, []);

  const resetAll = useCallback(() => {
    try { localStorage.removeItem(KEY); } catch {}
    setState(INITIAL);
  }, []);

  const toggleAttendance = useCallback((eventId: string) => {
    setState((s) => ({
      ...s,
      events: s.events.map((e) =>
        e.id !== eventId
          ? e
          : {
              ...e,
              attendees: e.attendees.includes(ME)
                ? e.attendees.filter((a) => a !== ME)
                : [...e.attendees, ME],
            },
      ),
    }));
  }, []);

  const createEvent = useCallback(
    (e: Omit<Epaulette, "id" | "attendees" | "host" | "createdByUser">) => {
      const created: Epaulette = {
        ...e,
        id: `user-${Date.now()}`,
        attendees: [ME],
        host: ME,
        createdByUser: true,
      };
      setState((s) => ({ ...s, events: [...s.events, created] }));
      return created;
    },
    [],
  );

  const addInvite = useCallback((firstName: string, email: string) => {
    const code = `EPAULE-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const invite: Invite = {
      id: `inv-${Date.now()}`, code, firstName, email,
      status: "sent", sentAt: new Date().toISOString(), marraine: ME,
    };
    setState((s) => ({ ...s, invites: [invite, ...s.invites] }));
    return invite;
  }, []);

  const advanceInvite = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      invites: s.invites.map((i) =>
        i.id !== id ? i : { ...i, status: i.status === "sent" ? "accepted" : "joined" },
      ),
    }));
  }, []);

  const addRequest = useCallback((text: string, routedTo: string[]) => {
    const req: HelpRequest = {
      id: `req-${Date.now()}`, authorId: ME, text,
      createdAt: new Date().toISOString(), routedTo, answers: [],
    };
    setState((s) => ({ ...s, requests: [req, ...s.requests] }));
    return req;
  }, []);

  const markConnected = useCallback((memberId: string) => {
    setState((s) =>
      s.connected.includes(memberId) ? s : { ...s, connected: [...s.connected, memberId] },
    );
  }, []);

  const sendMessage = useCallback((toId: string, text: string) => {
    const msg = {
      id: `msg-${Date.now()}`, from: ME, text: text.trim(),
      at: new Date().toISOString(), read: true,
    };
    setState((s) => {
      const existing = s.conversations.find((c) => c.withId === toId);
      const conversations = existing
        ? s.conversations.map((c) =>
            c.withId === toId ? { ...c, messages: [...c.messages, msg] } : c,
          )
        : [...s.conversations, { withId: toId, messages: [msg] }];
      // La conversation la plus récente remonte en tête.
      return {
        ...s,
        conversations: [...conversations].sort((a, b) => lastAt(b) - lastAt(a)),
        connected: s.connected.includes(toId) ? s.connected : [...s.connected, toId],
      };
    });
  }, []);

  const markConversationRead = useCallback((withId: string) => {
    setState((s) => ({
      ...s,
      conversations: s.conversations.map((c) =>
        c.withId !== withId
          ? c
          : { ...c, messages: c.messages.map((m) => (m.read ? m : { ...m, read: true })) },
      ),
    }));
  }, []);

  const unreadCount = state.conversations.reduce(
    (n, c) => n + c.messages.filter((m) => !m.read && m.from !== ME).length,
    0,
  );

  const value = useMemo<Ctx>(
    () => ({
      ...state, ready, saveProfile, resetAll, toggleAttendance,
      createEvent, addInvite, advanceInvite, addRequest, markConnected,
      sendMessage, markConversationRead, unreadCount,
    }),
    [state, ready, saveProfile, resetAll, toggleAttendance, createEvent, addInvite,
     advanceInvite, addRequest, markConnected, sendMessage, markConversationRead, unreadCount],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function lastAt(c: Conversation): number {
  const last = c.messages[c.messages.length - 1];
  return last ? +new Date(last.at) : 0;
}

export function useStore(): Ctx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore doit être utilisé dans un StoreProvider");
  return ctx;
}
