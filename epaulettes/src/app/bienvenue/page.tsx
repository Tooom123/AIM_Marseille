"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import AvatarEditor from "@/components/AvatarEditor";
import { Logo } from "@/components/Shell";
import { Button, Field, TagInput, inputClass } from "@/components/ui";
import { DEFAULT_AVATAR, type AvatarConfig } from "@/lib/avatarOptions";
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
  { id: "avatar", q: "À quoi ressemblez-vous ?", sub: "Composez votre avatar, ou importez une photo." },
] as const;

export default function Bienvenue() {
  const router = useRouter();
  const { profile, saveProfile } = useStore();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(() => ({
    firstName: profile.firstName, lastName: profile.lastName,
    job: profile.job, company: profile.company,
    age: profile.age ? String(profile.age) : "",
    linkedin: profile.linkedin,
    neighborhood: profile.neighborhood || "Vieux-Port",
    skills: profile.skills, offers: profile.offers,
    needs: profile.needs, hobbies: profile.hobbies,
    bio: profile.bio, photo: profile.photo as string | undefined,
    avatar: profile.avatar ?? DEFAULT_AVATAR,
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

  function finish() {
    saveProfile({
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      job: draft.job.trim(),
      company: draft.company.trim(),
      age: draft.age ? Number(draft.age) : null,
      linkedin: draft.linkedin.trim(),
      neighborhood: draft.neighborhood,
      skills: draft.skills, offers: draft.offers, needs: draft.needs, hobbies: draft.hobbies,
      bio: draft.bio.trim(),
      photo: draft.photo,
      avatar: draft.avatar,
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
              <div className="space-y-4">
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
                  <Field label="Âge (facultatif)" hint="Vous pouvez laisser vide. Jamais affiché publiquement.">
                    <input
                      type="number" min={18} max={99}
                      className={inputClass}
                      value={draft.age}
                      onChange={(e) => setDraft((d) => ({ ...d, age: e.target.value }))}
                      placeholder="Laisser vide"
                    />
                  </Field>
                </div>
                <Field label="LinkedIn (facultatif)" hint="Les autres membres pourront vous y retrouver.">
                  <input
                    className={inputClass}
                    value={draft.linkedin}
                    onChange={(e) => setDraft((d) => ({ ...d, linkedin: e.target.value }))}
                    placeholder="linkedin.com/in/votre-profil"
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

            {current.id === "avatar" && (
              <div className="rounded-2xl border border-line bg-surface p-5">
                {draft.photo ? (
                  <div className="flex flex-col items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={draft.photo} alt="Votre photo"
                      className="size-40 rounded-full object-cover" />
                    <Button variant="outline" size="sm"
                      onClick={() => setDraft((d) => ({ ...d, photo: undefined }))}>
                      Composer un avatar à la place
                    </Button>
                  </div>
                ) : (
                  <AvatarEditor
                    config={draft.avatar}
                    onChange={(avatar: AvatarConfig) => setDraft((d) => ({ ...d, avatar }))}
                  />
                )}
                <div className="mt-5 border-t border-line pt-4 text-center">
                  <label className="cursor-pointer text-sm text-ink-soft underline decoration-dotted hover:text-ink">
                    ou importer une photo
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) onPhoto(f); }} />
                  </label>
                </div>
              </div>
            )}
          </div>

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
