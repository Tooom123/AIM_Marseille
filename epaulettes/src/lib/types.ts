export type MemberId = string;

export type Member = {
  id: MemberId;
  firstName: string;
  lastName: string;
  job: string;
  company: string;
  age: number;
  neighborhood: string;
  coords: [number, number]; // [lng, lat]
  joinedAt: string;
  photo?: string;
  skills: string[];
  offers: string[];
  needs: string[];
  hobbies: string[];
  bio: string;
  /** Membres qu'elle connaît déjà — sert au graphe et au score "pont". */
  knows: MemberId[];
  isNewcomer?: boolean;
  mentor?: boolean;
};

export type EventFormat = "apero" | "workshop" | "visio";

export type Epaulette = {
  id: string;
  title: string;
  format: EventFormat;
  date: string; // ISO
  endDate: string;
  place: string;
  address: string;
  coords: [number, number];
  capacity: number;
  attendees: MemberId[];
  host: MemberId;
  description: string;
  createdByUser?: boolean;
};

export type MatchReason = {
  member: Member;
  score: number;
  kind: "bridge" | "complement" | "affinity";
  why: string;
  intro: string;
  sharedHobbies: string[];
};

export type InviteStatus = "sent" | "accepted" | "joined";

export type Invite = {
  id: string;
  code: string;
  firstName: string;
  email: string;
  status: InviteStatus;
  sentAt: string;
  marraine: MemberId;
};

export type HelpRequest = {
  id: string;
  authorId: MemberId;
  text: string;
  createdAt: string;
  routedTo: MemberId[];
  answers: { memberId: MemberId; text: string; at: string }[];
};

export type Profile = {
  firstName: string;
  lastName: string;
  job: string;
  company: string;
  age: number | null;
  neighborhood: string;
  skills: string[];
  offers: string[];
  needs: string[];
  hobbies: string[];
  bio: string;
  photo?: string;
  avatarSeed: string;
  onboarded: boolean;
};
