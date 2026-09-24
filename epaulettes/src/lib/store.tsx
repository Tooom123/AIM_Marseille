"use client";

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from "react";
import { EVENTS } from "./events";
import type { Epaulette, HelpRequest, Invite, Profile } from "./types";

const KEY = "epaulettes.v1";

const EMPTY_PROFILE: Profile = {
  firstName: "", lastName: "", job: "", company: "", age: null,
  neighborhood: "", skills: [], offers: [], needs: [], hobbies: [],
  bio: "", avatarSeed: "epaulette", onboarded: false,
};

type State = {
  profile: Profile;
  events: Epaulette[];
  invites: Invite[];
  requests: HelpRequest[];
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
};

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
};

const StoreContext = createContext<Ctx | null>(null);

/** L'utilisatrice courante est "me" : elle n'est pas dans MEMBERS, elle s'ajoute via l'onboarding. */
export const ME = "me";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(INITIAL);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<State>;
        setState((s) => ({
          ...s,
          ...parsed,
          profile: { ...EMPTY_PROFILE, ...(parsed.profile ?? {}) },
          // Les événements de base viennent du code : on ne garde que ceux créés par l'utilisatrice.
          events: [...EVENTS, ...(parsed.events ?? []).filter((e) => e.createdByUser)],
        }));
      }
    } catch {
      // localStorage indisponible (navigation privée) : on reste sur l'état initial.
    }
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

  const value = useMemo<Ctx>(
    () => ({
      ...state, ready, saveProfile, resetAll, toggleAttendance,
      createEvent, addInvite, advanceInvite, addRequest, markConnected,
    }),
    [state, ready, saveProfile, resetAll, toggleAttendance, createEvent, addInvite, advanceInvite, addRequest, markConnected],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Ctx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore doit être utilisé dans un StoreProvider");
  return ctx;
}
