# Le Réseau des Épaulettes

Application de démonstration pour le hackathon AIM 2026 — « L'IA au service de l'égalité ».

Une web app unique pour le Réseau des Épaulettes : onboarding personnalisé, carte 3D
des événements, mises en relation justifiées, marrainage et intégration des nouvelles.

## Lancer

```bash
npm install
npm run dev        # http://localhost:3000
```

Aucune clé API, aucune base de données, aucun service externe à configurer.
Tout est mocké : les 22 profils membres sont synthétiques, et l'état de la session
est conservé dans le `localStorage` du navigateur.

## Parcours de démo (90 s)

1. **`/bienvenue`** — l'onboarding conversationnel. La dernière étape compose
   l'avatar (carnation, coupe, yeux, lunettes, accessoires…) ou importe une photo.
2. **`/accueil`** — les rencontres de la semaine, chacune avec sa justification et
   son message d'intro prêt à copier. Plus bas, taper un besoin dans « Demander un
   coup d'épaule » : les trois bonnes membres apparaissent pendant la frappe.
3. **`/carte`** — Marseille en relief, les événements et les membres par quartier.
   Cliquer un apéro affiche le placement de tables suggéré. « Créer un événement »
   le pose sur la carte en direct.
4. **`/agenda`** — le pré-apéro visio d'intégration, avec le déroulé des 30 minutes.
5. **`/reseau` → Carte des liens** — le graphe, les membres isolées en rose, et les
   priorités d'animation.
6. **`/messages`** — la messagerie interne. Le message d'intro d'une carte membre
   est modifiable puis envoyé, et ouvre la conversation.
7. **`/marrainage`** — envoyer une invitation génère un code ; faire avancer son statut
   fait monter le palier de remise.

Pour repartir de zéro : **Profil → Réinitialiser la démo**.

## Structure

```
src/
├── app/
│   ├── …                 # une page par écran (App Router)
│   └── api/calendrier/   # flux iCalendar auquel un agenda peut s'abonner
├── components/           # Shell, Map3D, NetworkGraph, AvatarEditor, CharacterAvatar…
└── lib/
    ├── members.ts        # 22 profils synthétiques géolocalisés
    ├── events.ts         # événements, ancrés sur la date du jour
    ├── matching.ts       # scoring, routage des demandes, placement de tables
    ├── avatarOptions.ts  # choix d'apparence et génération déterministe
    ├── ics.ts            # génération iCalendar
    └── store.tsx         # état applicatif + persistance localStorage
```

## Choix techniques

- **Next.js 16 + Tailwind 4** — un seul processus, aucun back-end à déployer.
- **MapLibre GL + tuiles CARTO/OSM** — carte 3D réelle, sans clé API. Le worker de
  MapLibre est servi depuis `public/maplibre/` : son chargement par défaut échoue
  avec le bundler, et la carte reste alors vide.
- **Graphe en canvas** — force-directed écrit à la main, pas de dépendance de plus.
- **Matching déterministe** — recouvrement de tokens entre besoins, offres et
  compétences, plus un bonus « pont » pour les liens modérément faibles. Aucun appel
  réseau : rien ne peut tomber en panne pendant le pitch.
- **Avatars en SVG** — aucun service externe, aucune image à charger. Une membre
  sans photo reçoit un personnage dérivé de son identifiant, jamais un trou dans l'UI.
- **Calendrier** — `webcal://` fait que l'agenda *s'abonne* au flux au lieu d'en
  télécharger une copie figée : un événement ajouté apparaît ensuite tout seul.

## Données

Les 22 profils, leurs relations et les événements sont **fictifs** et écrits à la main
dans `src/lib/`. Aucune donnée personnelle réelle n'est utilisée.
