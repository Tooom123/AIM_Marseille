"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Avatar from "@/components/Avatar";
import { Logo } from "@/components/Shell";
import { Badge, Button, Field, TagInput, inputClass } from "@/components/ui";
import { matchesFor } from "@/lib/matching";
import { useStore } from "@/lib/store";
import {
  HOBBY_SUGGESTIONS, NEED_SUGGESTIONS, NEIGHBORHOODS, OFFER_SUGGESTIONS, SKILL_SUGGESTIONS,
} from "@/lib/vocab";

/** L'Épaulette pose une question à la fois : un formulaire déguisé en conversation. */
const STEPS = [
  { id: "identity", q: "Bonjour ! Comment vous appelez-vous ?", sub: "On commence par le plus simple." },
  { id: "job", q: "Qu'est-ce que vous faites ?", sub: "Votre métier, et l'entreprise si vous en avez une." },
  { id: "place", q: "Où êtes-vous basée ?", sub: "Pour vous proposer les rencontres proches de chez vous." },
  { id: "skills", q: "Sur quoi êtes-vous forte ?", sub: "Trois à cinq compétences suffisent." },
  { id: "needs", q: "Et qu'est-ce qui vous aiderait, là, maintenant ?", sub: "C'est la question qui fait tourner le réseau." },
  { id: "hobbies", q: "En dehors du travail ?", sub: "Ce sont ces détails qui brisent la glace à l'apéro." },
  { id: "photo", q: "Une photo ?", sub: "Facultatif — sinon on vous génère un avatar." },
] as const;

export default function Bienvenue() {
  const router = useRouter();
  const { profile, saveProfile } = useStore();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(() => ({
    firstName: profile.firstName, lastName: profile.lastName,
    job: profile.job, company: profile.company,
    age: profile.age ? String(profile.age) : "",
    neighborhood: profile.neighborhood || "Vieux-Port",
    skills: profile.skills, offers: profile.offers,
    needs: profile.needs, hobbies: profile.hobbies,
    bio: profile.bio, photo: profile.photo as string | undefined,
  }));

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const canAdvance = useMemo(() => {
    switch (current.id) {
      case "identity": return draft.firstName.trim().length > 1;
      case "job": return draft.job.trim().length > 1;
      case "place": return !!draft.neighborhood;
      case "skills": return draft.skills.length > 0;
      case "needs": return draft.needs.length > 0;
      case "hobbies": return draft.hobbies.length > 0;
      default: return true;
    }
  }, [current.id, draft]);

  // Aperçu en direct : la preuve que remplir le profil sert à quelque chose.
  const preview = useMemo(() => {
    if (draft.skills.length === 0 && draft.needs.length === 0) return [];
    return matchesFor(
      {
        skills: draft.skills, offers: draft.offers, needs: draft.needs,
        hobbies: draft.hobbies, job: draft.job || "membre", neighborhood: draft.neighborhood,
      },
      null,
      3,
    );
  }, [draft]);

  function finish() {
    saveProfile({
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      job: draft.job.trim(),
      company: draft.company.trim(),
      age: draft.age ? Number(draft.age) : null,
      neighborhood: draft.neighborhood,
      skills: draft.skills, offers: draft.offers, needs: draft.needs, hobbies: draft.hobbies,
      bio: draft.bio.trim(),
      photo: draft.photo,
      avatarSeed: `${draft.firstName}${draft.lastName}${draft.job}` || "epaulette",
      onboarded: true,
    });
    router.push("/accueil");
  }

  function onPhoto(file: File) {
    const reader = new FileReader();
    reader.onload = () => setDraft((d) => ({ ...d, photo: String(reader.result) }));
    reader.readAsDataURL(file);
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-cream to-bg">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8 flex items-center gap-2.5">
          <Logo />
          <span className="font-semibold tracking-tight">Les Épaulettes</span>
          <button
            onClick={finish}
            className="ml-auto text-xs text-ink-soft underline decoration-dotted hover:text-ink"
          >
            Passer pour la démo
          </button>
        </div>

        {/* Progression */}
        <div className="mb-8 flex gap-1.5">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < step ? "bg-turquoise" : i === step ? "bg-rose" : "bg-line"
              }`}
            />
          ))}
        </div>

        <div key={current.id} className="animate-fade-up">
          <div className="mb-6 flex gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-turquoise to-rose text-sm font-bold text-white">
              É
            </div>
            <div className="rounded-2xl rounded-tl-sm border border-line bg-surface px-4 py-3 shadow-sm">
              <p className="font-medium">{current.q}</p>
              <p className="mt-0.5 text-sm text-ink-soft">{current.sub}</p>
            </div>
          </div>

          <div className="space-y-4">
            {current.id === "identity" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Prénom">
                  <input
                    autoFocus
                    className={inputClass}
                    value={draft.firstName}
                    onChange={(e) => setDraft((d) => ({ ...d, firstName: e.target.value }))}
                    placeholder="Camille"
                  />
                </Field>
                <Field label="Nom">
                  <input
                    className={inputClass}
                    value={draft.lastName}
                    onChange={(e) => setDraft((d) => ({ ...d, lastName: e.target.value }))}
                    placeholder="Durand"
                  />
                </Field>
              </div>
            )}

            {current.id === "job" && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Métier">
                    <input
                      autoFocus
                      className={inputClass}
                      value={draft.job}
                      onChange={(e) => setDraft((d) => ({ ...d, job: e.target.value }))}
                      placeholder="Consultante en communication"
                    />
                  </Field>
                  <Field label="Entreprise" hint="Ou « Indépendante »">
                    <input
                      className={inputClass}
                      value={draft.company}
                      onChange={(e) => setDraft((d) => ({ ...d, company: e.target.value }))}
                      placeholder="Studio Durand"
                    />
                  </Field>
                </div>
                <Field label="En une phrase, votre activité" hint="C'est ce que les autres membres liront en premier.">
                  <textarea
                    rows={2}
                    className={inputClass}
                    value={draft.bio}
                    onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
                    placeholder="J'aide les PME à clarifier leur discours de marque."
                  />
                </Field>
              </div>
            )}

            {current.id === "place" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Quartier">
                  <select
                    className={inputClass}
                    value={draft.neighborhood}
                    onChange={(e) => setDraft((d) => ({ ...d, neighborhood: e.target.value }))}
                  >
                    {NEIGHBORHOODS.map((n) => <option key={n}>{n}</option>)}
                  </select>
                </Field>
                <Field label="Âge" hint="Facultatif, jamais affiché publiquement.">
                  <input
                    type="number" min={18} max={99}
                    className={inputClass}
                    value={draft.age}
                    onChange={(e) => setDraft((d) => ({ ...d, age: e.target.value }))}
                    placeholder="38"
                  />
                </Field>
              </div>
            )}

            {current.id === "skills" && (
              <div className="space-y-4">
                <Field label="Mes compétences">
                  <TagInput
                    value={draft.skills}
                    onChange={(skills) => setDraft((d) => ({ ...d, skills }))}
                    placeholder="Tapez puis Entrée…"
                    suggestions={SKILL_SUGGESTIONS}
                  />
                </Field>
                <Field label="Ce que je peux offrir au réseau" hint="Même un petit coup de main compte.">
                  <TagInput
                    value={draft.offers}
                    onChange={(offers) => setDraft((d) => ({ ...d, offers }))}
                    placeholder="Un audit de 30 min…"
                    suggestions={OFFER_SUGGESTIONS}
                  />
                </Field>
              </div>
            )}

            {current.id === "needs" && (
              <Field label="Mes besoins actuels">
                <TagInput
                  value={draft.needs}
                  onChange={(needs) => setDraft((d) => ({ ...d, needs }))}
                  placeholder="Trouver des clients…"
                  suggestions={NEED_SUGGESTIONS}
                />
              </Field>
            )}

            {current.id === "hobbies" && (
              <Field label="Mes centres d'intérêt">
                <TagInput
                  value={draft.hobbies}
                  onChange={(hobbies) => setDraft((d) => ({ ...d, hobbies }))}
                  placeholder="Randonnée…"
                  suggestions={HOBBY_SUGGESTIONS}
                />
              </Field>
            )}

            {current.id === "photo" && (
              <div className="flex flex-col items-center gap-5 rounded-2xl border border-line bg-surface p-8">
                <Avatar
                  seed={`${draft.firstName}${draft.lastName}${draft.job}`}
                  first={draft.firstName || "É"}
                  last={draft.lastName}
                  photo={draft.photo}
                  size={104}
                />
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <label className="cursor-pointer rounded-xl border border-line bg-surface px-4 py-2 text-sm font-medium transition hover:bg-cream">
                    Choisir une photo
                    <input
                      type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) onPhoto(f); }}
                    />
                  </label>
                  {draft.photo && (
                    <Button variant="ghost" size="sm" onClick={() => setDraft((d) => ({ ...d, photo: undefined }))}>
                      Utiliser l&apos;avatar généré
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Aperçu des mises en relation : le "aha" de l'onboarding */}
          {preview.length > 0 && step >= 3 && (
            <div className="mt-8 rounded-2xl border border-turquoise/30 bg-turquoise/6 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Badge tone="turquoise">Déjà {preview.length} rencontres pour vous</Badge>
              </div>
              <div className="space-y-2.5">
                {preview.map(({ member, why }) => (
                  <div key={member.id} className="flex items-start gap-3">
                    <Avatar seed={member.id} first={member.firstName} last={member.lastName} size={32} />
                    <div className="min-w-0 text-sm">
                      <p className="font-medium">
                        {member.firstName} {member.lastName}
                        <span className="font-normal text-ink-soft"> · {member.job}</span>
                      </p>
                      <p className="text-ink-soft">{why}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center gap-3">
            {step > 0 && (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>Retour</Button>
            )}
            <Button
              variant={isLast ? "rose" : "primary"}
              size="lg"
              disabled={!canAdvance}
              onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
              className="ml-auto"
            >
              {isLast ? "Entrer dans le réseau" : "Continuer"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
