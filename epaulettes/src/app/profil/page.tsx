"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Avatar from "@/components/Avatar";
import Guard from "@/components/Guard";
import { Badge, Button, Card, Field, SectionTitle, TagInput, inputClass } from "@/components/ui";
import { ME, useStore } from "@/lib/store";
import {
  HOBBY_SUGGESTIONS, NEED_SUGGESTIONS, NEIGHBORHOODS, OFFER_SUGGESTIONS, SKILL_SUGGESTIONS,
} from "@/lib/vocab";

export default function Page() {
  return (
    <Guard>
      <Profil />
    </Guard>
  );
}

function Profil() {
  const { profile, saveProfile, resetAll, events } = useStore();
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  const myEvents = events.filter((e) => e.attendees.includes(ME));

  function update<K extends keyof typeof profile>(key: K, value: (typeof profile)[K]) {
    saveProfile({ [key]: value });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function onPhoto(file: File) {
    const reader = new FileReader();
    reader.onload = () => update("photo", String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mon profil</h1>
          <p className="text-sm text-ink-soft">
            Plus il est précis, plus les mises en relation sont justes.
          </p>
        </div>
        {saved && <Badge tone="turquoise">Enregistré</Badge>}
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        {/* Carte de visite */}
        <div className="space-y-4">
          <Card className="text-center">
            <div className="flex justify-center">
              <Avatar
                seed={profile.avatarSeed} first={profile.firstName} last={profile.lastName}
                photo={profile.photo} config={profile.avatar} size={96}
              />
            </div>
            <h2 className="mt-3 text-lg font-semibold">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-sm text-ink-soft">{profile.job}</p>
            {profile.company && <p className="text-sm text-ink-soft">{profile.company}</p>}
            <p className="mt-1 text-xs text-ink-soft">{profile.neighborhood}</p>
            {profile.bio && <p className="mt-3 text-sm">{profile.bio}</p>}

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <label className="cursor-pointer rounded-xl border border-line bg-surface px-3 py-1.5 text-sm transition hover:bg-cream">
                Changer la photo
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) onPhoto(f); }} />
              </label>
              {profile.photo && (
                <Button size="sm" variant="ghost" onClick={() => update("photo", undefined)}>
                  Avatar généré
                </Button>
              )}
            </div>
          </Card>

          <Card>
            <SectionTitle>Mes rendez-vous</SectionTitle>
            {myEvents.length === 0 ? (
              <p className="text-sm text-ink-soft">Aucune inscription pour l&apos;instant.</p>
            ) : (
              <ul className="space-y-2">
                {myEvents.map((e) => (
                  <li key={e.id} className="text-sm">
                    <span className="font-medium">{e.title}</span>
                    <span className="block text-xs text-ink-soft">
                      {new Date(e.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="border-rose/25">
            <SectionTitle hint="Efface le profil et les données locales de démonstration.">
              Réinitialiser la démo
            </SectionTitle>
            <Button
              variant="outline"
              full
              onClick={() => { resetAll(); router.push("/bienvenue"); }}
            >
              Repartir de zéro
            </Button>
          </Card>
        </div>

        {/* Édition */}
        <div className="space-y-5">
          <Card>
            <SectionTitle>Identité</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Prénom">
                <input className={inputClass} value={profile.firstName}
                  onChange={(e) => update("firstName", e.target.value)} />
              </Field>
              <Field label="Nom">
                <input className={inputClass} value={profile.lastName}
                  onChange={(e) => update("lastName", e.target.value)} />
              </Field>
              <Field label="Métier">
                <input className={inputClass} value={profile.job}
                  onChange={(e) => update("job", e.target.value)} />
              </Field>
              <Field label="Entreprise">
                <input className={inputClass} value={profile.company}
                  onChange={(e) => update("company", e.target.value)} />
              </Field>
              <Field label="Quartier">
                <select className={inputClass} value={profile.neighborhood}
                  onChange={(e) => update("neighborhood", e.target.value)}>
                  {NEIGHBORHOODS.map((n) => <option key={n}>{n}</option>)}
                </select>
              </Field>
              <Field label="Âge" hint="Jamais affiché publiquement.">
                <input type="number" className={inputClass} value={profile.age ?? ""}
                  onChange={(e) => update("age", e.target.value ? Number(e.target.value) : null)} />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Mon activité en une phrase">
                <textarea rows={2} className={inputClass} value={profile.bio}
                  onChange={(e) => update("bio", e.target.value)} />
              </Field>
            </div>
          </Card>

          <Card>
            <SectionTitle hint="Ce sont ces listes qui alimentent le moteur de mise en relation.">
              Compétences et besoins
            </SectionTitle>
            <div className="space-y-4">
              <Field label="Mes compétences">
                <TagInput value={profile.skills} onChange={(v) => update("skills", v)}
                  suggestions={SKILL_SUGGESTIONS} placeholder="Ajouter…" />
              </Field>
              <Field label="Ce que je peux offrir">
                <TagInput value={profile.offers} onChange={(v) => update("offers", v)}
                  suggestions={OFFER_SUGGESTIONS} placeholder="Ajouter…" />
              </Field>
              <Field label="Mes besoins actuels">
                <TagInput value={profile.needs} onChange={(v) => update("needs", v)}
                  suggestions={NEED_SUGGESTIONS} placeholder="Ajouter…" />
              </Field>
              <Field label="Mes centres d'intérêt">
                <TagInput value={profile.hobbies} onChange={(v) => update("hobbies", v)}
                  suggestions={HOBBY_SUGGESTIONS} placeholder="Ajouter…" />
              </Field>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
