import { MEMBERS, MEMBERS_BY_ID, buildAdjacency } from "./members";
import type { MatchReason, Member, Profile } from "./types";

const STOP = new Set(["de", "la", "le", "des", "du", "en", "et", "pour", "sur", "aux", "un", "une", "d"]);

function tokens(values: string[]): Set<string> {
  const out = new Set<string>();
  for (const v of values) {
    for (const w of v.toLowerCase().split(/[^a-zà-ÿ0-9+]+/)) {
      if (w.length > 2 && !STOP.has(w)) out.add(w);
    }
  }
  return out;
}

function overlap(a: Set<string>, b: Set<string>): number {
  let n = 0;
  for (const t of a) if (b.has(t)) n++;
  return n;
}

/** Intersection lisible, pour afficher les vrais mots partagés plutôt que des tokens. */
function sharedLabels(a: string[], b: string[]): string[] {
  const bt = tokens(b);
  return a.filter((label) => overlap(tokens([label]), bt) > 0);
}

export type ViewerProfile = Pick<Profile, "skills" | "offers" | "needs" | "hobbies" | "job" | "neighborhood">;

/**
 * Score de mise en relation. Trois familles, volontairement distinctes :
 *  - complement : ce qu'elle offre répond à un besoin déclaré (ou l'inverse)
 *  - bridge     : lien modérément faible — peu d'amies communes, donc contacts non redondants (Uzzi 2019)
 *  - affinity   : hobbies et quartier, la glace brisée
 */
export function matchesFor(
  viewer: ViewerProfile,
  viewerId: string | null,
  limit = 6,
): MatchReason[] {
  const adj = buildAdjacency();
  const myCircle = viewerId ? (adj.get(viewerId) ?? new Set<string>()) : new Set<string>();

  const myNeeds = tokens(viewer.needs);
  const myOffers = tokens([...viewer.offers, ...viewer.skills]);
  const myHobbies = tokens(viewer.hobbies);

  const scored = MEMBERS.filter((m) => m.id !== viewerId).map((m) => {
    const theirOffers = tokens([...m.offers, ...m.skills]);
    const theirNeeds = tokens(m.needs);
    const theirHobbies = tokens(m.hobbies);

    const sheHelpsMe = overlap(myNeeds, theirOffers);
    const iHelpHer = overlap(theirNeeds, myOffers);
    const affinity = overlap(myHobbies, theirHobbies);

    // Amies communes : beaucoup = information redondante, zéro = trop lointain.
    const theirCircle = adj.get(m.id) ?? new Set<string>();
    let mutual = 0;
    for (const f of theirCircle) if (myCircle.has(f)) mutual++;
    const alreadyKnown = myCircle.has(m.id);

    // Le pont idéal : une ou deux amies communes.
    const bridge = alreadyKnown ? 0 : mutual === 1 || mutual === 2 ? 3 : mutual === 0 ? 1 : 0;
    const sameArea = m.neighborhood === viewer.neighborhood ? 1 : 0;

    const score =
      sheHelpsMe * 4 + iHelpHer * 3 + bridge * 2.5 + affinity * 1.5 + sameArea - (alreadyKnown ? 5 : 0);

    const kind: MatchReason["kind"] =
      sheHelpsMe + iHelpHer > 0 ? "complement" : bridge >= 2 ? "bridge" : "affinity";

    const sharedHobbies = sharedLabels(m.hobbies, viewer.hobbies);
    const answeredNeed = sharedLabels(viewer.needs, [...m.offers, ...m.skills])[0];
    const herNeedIMeet = sharedLabels(m.needs, [...viewer.offers, ...viewer.skills])[0];

    return {
      member: m,
      score,
      kind,
      why: buildWhy({ m, answeredNeed, herNeedIMeet, mutual, alreadyKnown, sharedHobbies, kind }),
      intro: buildIntro(m, viewer, answeredNeed, herNeedIMeet, sharedHobbies),
      sharedHobbies,
    } satisfies MatchReason;
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

function buildWhy(args: {
  m: Member;
  answeredNeed?: string;
  herNeedIMeet?: string;
  mutual: number;
  alreadyKnown: boolean;
  sharedHobbies: string[];
  kind: MatchReason["kind"];
}): string {
  const { m, answeredNeed, herNeedIMeet, mutual, sharedHobbies, kind } = args;
  const bits: string[] = [];

  if (answeredNeed) bits.push(`elle couvre votre besoin « ${answeredNeed} »`);
  if (herNeedIMeet) bits.push(`vous répondez à son besoin « ${herNeedIMeet} »`);
  if (kind === "bridge" && !answeredNeed && !herNeedIMeet) {
    bits.push(
      mutual === 0
        ? `aucune amie commune : son carnet d'adresses ne recoupe pas le vôtre`
        : `${mutual} amie${mutual > 1 ? "s" : ""} commune${mutual > 1 ? "s" : ""} — assez pour être présentée, pas assez pour un réseau redondant`,
    );
  }
  if (sharedHobbies.length) bits.push(`vous partagez ${sharedHobbies.slice(0, 2).join(" et ")}`);
  if (!bits.length) bits.push(`profil complémentaire du vôtre (${m.job.toLowerCase()})`);

  const sentence = bits.slice(0, 2).join(", et ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
}

function buildIntro(
  m: Member,
  viewer: ViewerProfile,
  answeredNeed?: string,
  herNeedIMeet?: string,
  sharedHobbies: string[] = [],
): string {
  const opener = `Bonjour ${m.firstName},`;
  const me = `je suis ${viewer.job.toLowerCase()} et membre du Réseau des Épaulettes.`;
  let middle: string;
  if (answeredNeed) {
    middle = `Je cherche justement quelqu'un sur « ${answeredNeed} » et votre travail chez ${m.company} correspond exactement.`;
  } else if (herNeedIMeet) {
    middle = `J'ai vu que vous cherchiez « ${herNeedIMeet} » — c'est précisément ce que je fais au quotidien.`;
  } else {
    middle = `Nos activités se complètent et j'aimerais comprendre comment vous travaillez chez ${m.company}.`;
  }
  const closer = sharedHobbies.length
    ? `On pourrait en parler autour d'un café — et visiblement on partage ${sharedHobbies[0]}. Vous êtes au prochain apéro ?`
    : `Un café de 20 minutes la semaine prochaine, ça vous irait ? Je serai aussi au prochain apéro.`;
  return `${opener} ${me} ${middle} ${closer}`;
}

/** Routage d'une demande d'aide vers les 3 membres les plus à même de répondre. */
export function routeHelpRequest(text: string, authorId: string | null, limit = 3): MatchReason[] {
  const asked = tokens([text]);
  const scored = MEMBERS.filter((m) => m.id !== authorId)
    .map((m) => {
      const hit = overlap(asked, tokens([...m.skills, ...m.offers, m.job]));
      const matchedSkill = [...m.skills, ...m.offers].find(
        (s) => overlap(tokens([s]), asked) > 0,
      );
      return {
        member: m,
        score: hit,
        kind: "complement" as const,
        why: matchedSkill
          ? `Compétence « ${matchedSkill} » explicitement citée dans son profil.`
          : `${m.job} — profil proche de la demande.`,
        intro: `Bonjour ${m.firstName}, une membre du réseau a posté : « ${text.trim()} ». Vous êtes l'une des trois personnes les mieux placées pour répondre. Un message suffit.`,
        sharedHobbies: [],
      } satisfies MatchReason;
    })
    .filter((r) => r.score > 0);

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Mesure de "trou structurel" : une membre peu connectée est une priorité d'animation. */
export function networkHealth() {
  const adj = buildAdjacency();
  const isolated = MEMBERS.filter((m) => (adj.get(m.id)?.size ?? 0) === 0);
  const weak = MEMBERS.filter((m) => {
    const n = adj.get(m.id)?.size ?? 0;
    return n > 0 && n < 2;
  });
  const edges = [...adj.values()].reduce((a, s) => a + s.size, 0) / 2;
  const density = (2 * edges) / (MEMBERS.length * (MEMBERS.length - 1));
  return { isolated, weak, edges, density, adj };
}

/**
 * Placement de tables pour un apéro : on répartit les membres pour maximiser
 * les rencontres utiles — on évite d'asseoir ensemble celles qui se connaissent déjà.
 */
export function seatingPlan(attendeeIds: string[], perTable = 4) {
  const adj = buildAdjacency();
  const people = attendeeIds.map((id) => MEMBERS_BY_ID[id]).filter(Boolean);
  const tableCount = Math.max(1, Math.ceil(people.length / perTable));
  const tables: Member[][] = Array.from({ length: tableCount }, () => []);

  // Les moins connectées d'abord : ce sont elles qui ont le plus à gagner.
  const ordered = [...people].sort(
    (a, b) => (adj.get(a.id)?.size ?? 0) - (adj.get(b.id)?.size ?? 0),
  );

  for (const person of ordered) {
    let best = 0;
    let bestCost = Infinity;
    for (let i = 0; i < tables.length; i++) {
      const t = tables[i];
      if (t.length >= perTable && tables.some((x) => x.length < perTable)) continue;
      const known = t.filter((o) => adj.get(person.id)?.has(o.id)).length;
      const jobClash = t.filter((o) => o.job === person.job).length;
      const cost = known * 10 + jobClash * 4 + t.length;
      if (cost < bestCost) { bestCost = cost; best = i; }
    }
    tables[best].push(person);
  }

  return tables
    .filter((t) => t.length > 0)
    .map((members, i) => ({
      name: `Table ${i + 1}`,
      members,
      icebreaker: icebreakerFor(members),
    }));
}

function icebreakerFor(members: Member[]): string {
  const hobbies = [...new Set(members.flatMap((m) => m.hobbies))];
  const shared = hobbies.find((h) => members.filter((m) => m.hobbies.includes(h)).length > 1);
  if (shared) return `Qui a découvert ${shared} le plus récemment ?`;
  const jobs = members.map((m) => m.job.toLowerCase());
  return `Chacune explique le métier de sa voisine : ${jobs.slice(0, 2).join(" et ")}…`;
}
