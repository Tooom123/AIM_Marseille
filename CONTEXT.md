# Context.md — Hackathon AIM 2026 · Équipe « Le Réseau des Épaulettes 2 »

> Fichier de contexte pour Claude Code. Il résume les recherches et décisions prises en amont. Lis-le entièrement avant de proposer du code.

---

## 1. Le cadre

- **Événement :** Hackathon « L'IA au service de l'égalité », organisé par **Les Épaulettes** avec **La Tribune**, pendant le salon **AIM 2026** (Artificial Intelligence Marseille, 4ᵉ édition).
- **Lieu et date :** CEPAC / Orange Vélodrome, Marseille, **jeudi 24 septembre 2026**.
- **Déroulé :**

  | Heure | Étape |
  |---|---|
  | 08h30 | Accueil |
  | 09h00 | Kick-off |
  | 09h20 | Début du travail |
  | **16h00** | **Pitchs devant l'association référente** |
  | 17h00 | Remise des prix |
  | 17h20 | Networking |

  → environ **6h40 de développement**.
- **Équipe (3 personnes) :**
  - **Tom** : IA, agents et back-end ; EPITA IA & Data Science, AI Engineer, systèmes agentiques.
  - **Hazim** : compétences inconnues ; rôle par défaut front ou données.
  - **Adeline** : compétences inconnues ; rôle par défaut produit, personas et pitch.
- **Accompagnement :** une consultante IA suit l'équipe toute la journée.
- **Non publiés :** les critères du jury et les prix. Le jury sera probablement l'équipe des Épaulettes elle-même, qui récompensera un outil qu'elle pourrait **réellement adopter**.

## 2. Le défi

> « Comment faire du Réseau des Épaulettes un réseau qui connecte vraiment, au-delà des événements, pour que chaque membre y trouve entraide et opportunités ? »

**Les Épaulettes**
- Entreprise à mission marseillaise créée en 2019 par **Célisiane Rosius**.
- Alison Payne (DG, référente IA), Sarah (animation du réseau), Médina (marketing, IA et automatisation).
- Organisme de formation Qualiopi : Mentoring Digital avec matching mentore/mentorée, formation « Devenir Consultante IA ».

**Le Réseau (l'offre d'adhésion)**
- Destiné aux entrepreneuses et cadres de Marseille.
- 11 apéros mensuels par an et un workshop en ligne par mois.
- Un **groupe WhatsApp privé** et un **annuaire des membres**.
- Outils utilisés : Eventbrite, Tally, Notion, Teachizy.

**Diagnostic (déduit de leur offre publique, à confirmer)**
- Les outils sont passifs : une demande se noie dans le fil WhatsApp, et l'annuaire ne sert qu'à qui sait déjà qui chercher.
- Le lien entre membres dépend des animatrices.
- La règle 90-9-1 s'applique : la plupart des membres lisent sans jamais contribuer.
- 70 à 90 % de l'aide au travail répond à une **demande explicite** (Wayne Baker).
- Les liens *modérément faibles* sont ceux qui créent le plus d'opportunités (Rajkumar et al., *Science* 2022).

**Inconnues à demander à l'association à 9h20**
- Nombre de membres et nombre de membres actives.
- Usage réel du groupe WhatsApp.
- Outil utilisé pour l'annuaire.
- Ce qui a déjà été tenté.
- Ce qui leur ferait dire « on l'adopte ».

## 3. Décision : construire « Épaulette Coalitions »

**Pitch en une ligne :** un radar lit en direct les **vrais appels d'offres publics des Bouches-du-Rhône (BOAMP)**. Les **agents IA personnels des membres négocient entre eux** pour former un **groupement momentané d'entreprises (GME)** capable d'y répondre. Une **Épaulette vocale** demande ensuite son accord à chaque membre, puis le système génère la convention de groupement et le message d'introduction.

**Pourquoi ce choix plutôt qu'un simple matching**
- Le réseau ne se contente plus de créer du lien : il génère du **chiffre d'affaires**.
- Le projet s'appuie sur des **données publiques réelles**, avec un moment multi-agents spectaculaire et un argument « égalité » solide.
- Un acheteur public ne peut pas interdire la cotraitance.
- Les capacités d'un groupement sont appréciées globalement : aucune membre n'a besoin de tout savoir faire seule.

**Idées annexes intégrées au projet**
- **Carte des Ponts :** graphe du réseau et détection des trous structurels (Burt), affichés en fond d'écran.
- **Agents A2A :** la brique de négociation, réutilisable plus tard pour un mode « entraide ».
- **Allô Épaulette :** la couche voix.

**Réservé à la feuille de route (dernier slide)**
- **Chief of Staff IA** pour l'animatrice.
- Répétition face à des financeurs simulés.
- Véritable intégration WhatsApp.

**Anciennes idées, plus simples, en repli si tout déraille**
- « L'Épaule » : demande, matching sémantique, top 3 justifié, intro rédigée, relance à J+7.
- Café hebdomadaire façon Donut.
- Annuaire vivant avec onboarding conversationnel.
- Tableau de bord pour l'animatrice.

## 4. Architecture cible

```
BOAMP API ──► /radar ──► extraction LLM (JSON) ──► besoins structurés
                                                     │
profils membres (JSON + embeddings + Agent Cards) ───┤
                                                     ▼
                                         /coalition : set cover glouton
                                         + complémentarité + bonus "pont"
                                                     ▼
                                /negotiate (SSE) : agents par membre
                                propose / counter / accept / reject
                                ≤ 6 tours + agent médiateur neutre
                                                     ▼
                     voix Realtime (WebRTC navigateur) : confirm_participation()
                                                     ▼
                       génération : convention de GME (brouillon DC1), répartition des lots,
                       message d'intro dans un fil « type WhatsApp »
```

**Pipeline**
1. **Ingestion :** avis BOAMP du département 13, 30 derniers jours, filtrés sur les **codes CPV de services** (conseil, formation, communication, événementiel, numérique). Il faut exclure le BTP. Mettre les résultats en cache dans un JSON dès le matin.
2. **Extraction :** LLM en sortie structurée → `{competences[], lots[], budget_estime, deadline, criteres, cpv}`.
3. **Profils :** 15 à 25 membres **fictives** et réalistes (graphiste, juriste, formatrice, développeuse web, traiteur, consultante RSE…). Chaque profil contient : `skills`, `offers`, `needs`, `constraints` (disponibilités, lots refusés), `rates` et une Agent Card.
4. **Coalition :** couverture des compétences requises, score de complémentarité, bonus pour les membres peu connectées entre elles (« ponts », cf. Uzzi 2019) → 2 à 3 coalitions candidates.
5. **Négociation :** orchestrateur maison, **sans framework lourd**.
   - Un prompt système par agent, construit à partir du profil.
   - Messages typés, contraintes dures vérifiées **en code** et non dans le prompt.
   - Température basse, 6 tours maximum.
   - Un médiateur tranche et veille à l'équité.
   - Chaque message est diffusé en streaming SSE.
6. **Consentement :** agent vocal avec l'outil `confirm_participation(member_id, conditions)` ; le statut passe au vert dans l'interface.
7. **Livrables :** convention de groupement en Markdown puis PDF, avec mandataire, lots et répartition, plus un message d'intro.

**Format « A2A-lite »** (le vocabulaire A2A est suffisant, pas besoin du SDK)

```json
// Agent Card
{ "id": "sonia", "name": "Agent de Sonia", "skills": ["identité visuelle","print"],
  "constraints": {"available_from": "2026-11-01", "max_days": 15}, "rate_day_eur": 450 }

// Message
{ "from": "sonia", "to": "leila", "type": "propose|counter|accept|reject",
  "payload": {"role": "mandataire", "lots": [1], "share_pct": 40}, "rationale": "..." }
```

## 5. Stack

| Couche | Choix | Remarque |
|---|---|---|
| Back-end | Python + FastAPI | Endpoints `/radar`, `/coalition`, `/negotiate` (SSE), `/session` (jeton éphémère Realtime) |
| LLM | Mistral (Large ou Medium), sortie JSON | Argument souveraineté. Clé de repli Claude ou OpenAI derrière une **unique fonction `llm()`** |
| Voix | OpenAI `gpt-realtime` en WebRTC depuis le navigateur | Chemin le plus court avec function calling. Pipeline Voxtral cité au pitch comme cible souveraine |
| Embeddings | Mistral embeddings + cosinus NumPy | Pas de base vectorielle nécessaire pour la démo |
| Stockage | SQLite ou JSON en mémoire | Pas de Supabase si ça prend plus de 45 min |
| Graphe | NetworkX (`constraint`, `effective_size`) côté serveur ; react-force-graph ou Cytoscape.js côté front | |
| Front-end | Vite ou Next.js + React + Tailwind | 3 écrans : **Radar**, **Arène** (fil type WhatsApp + graphe), **Coalition et documents** |
| Déploiement | En local sur le laptop, avec un tunnel ngrok ou Cloudflare | Ne pas dépendre du Wi-Fi du stade |

**Arborescence suggérée**

```
epaulette-coalitions/
├── backend/
│   ├── main.py            # FastAPI, routes
│   ├── llm.py             # wrapper unique (Mistral + fallback)
│   ├── boamp.py           # ingestion + cache
│   ├── extract.py         # avis -> besoins JSON
│   ├── coalition.py       # scoring / set cover / graphe
│   ├── negotiation.py     # orchestrateur agents + médiateur (SSE)
│   ├── voice.py           # session éphémère Realtime + tools
│   ├── documents.py       # convention GME, intro
│   └── data/ members.json, boamp_cache.json, replays/
└── frontend/  (Radar, Arena, Coalition)
```

## 6. Données ouvertes

**API BOAMP (DILA)** : gratuite, sans clé, mise à jour 2 fois par jour.
- Point d'entrée : `https://boamp-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/boamp/records`
- Champs utiles : `code_departement`, `dateparution`, `objet`, `nomacheteur`, `datelimitereponse`, `nature_categorise_libelle` (« Avis de marché »), `type_marche`, `descripteur_code` (CPV), `url_avis`, `donnees` (JSON complet).
- ⚠️ Schéma **non testé en direct** : le vérifier à 9h30 via `.../catalog/datasets/boamp`.
- ⚠️ Le paramètre `q` est ignoré en v2.1 : filtrer avec `where`, ou `refine=code_departement:"13"` en repli.
- ⚠️ `code_departement` est une chaîne : écrire `"13"` avec guillemets.
- ⚠️ Maximum 100 lignes par appel.

**Autres sources**
- **API Recherche d'entreprises (DINUM)** : sans clé, avec limitation de débit (erreur 429). Sert à enrichir les profils avec le SIREN et le code NAF.
- **aides-entreprises.fr** : API avec authentification ; un export existe sur data.gouv.fr.
- **les-aides.fr (CCI)** : API gratuite, compte requis.
- **Dispositif phare à faire remonter :** la **Garantie ÉGALITÉ Femmes** de France Active garantit jusqu'à 80 % d'un prêt bancaire, plafonnée à 50 000 €, sans caution personnelle, pour un prêt de 7 ans maximum.

## 7. Chiffres pour le pitch « égalité »

- **Levées de fonds (baromètre SISTA x BCG, 2025) :** en France, les équipes 100 % féminines représentent **9 %** des startups et captent **1 %** des fonds levés. À stade égal, elles lèvent **4,2 fois moins** qu'une équipe masculine.
- **Accès au crédit :** d'après l'OCDE, en France, les hommes ont 1,6 fois plus de chances d'obtenir un financement. Le taux de rejet de crédit est de 4,3 % pour les femmes contre 2,3 % pour les hommes (Délégation aux droits des femmes de l'Assemblée nationale, 2021).
- **Région PACA :** les femmes font **32,0 %** des créations d'entreprise (Infogreffe 2025) et 49 % des personnes financées par l'Adie PACA.
- **Réseaux :** les femmes qui réussissent ont un cercle intime féminin **dont chaque membre ouvre sur des contacts non redondants** (Yang, Chawla & Uzzi, *PNAS* 2019).
- **Project Deal (Anthropic, 2026) :** 69 agents ont conclu 186 transactions. Les personnes représentées par un modèle plus fort obtenaient de meilleurs accords, sans que les autres s'en aperçoivent. **Notre réponse : même modèle, mêmes règles, médiateur neutre et dernier mot humain pour chaque membre, adhésion solidaire comprise.**
- **Marché :** Boardy, un « superconnecteur » vocal, a levé 8 M$ en seed (janvier 2025). Ses statistiques d'usage viennent de sources secondaires : les citer avec précaution.

## 8. Plan de la journée

| Créneau | Tom | Hazim | Adeline | Jalon |
|---|---|---|---|---|
| 9h20–9h40 | Choix du scénario, test des clés API | idem | Questions à l'association | Décision figée |
| 9h40–10h30 | BOAMP 13 + CPV, 5 avis, extraction JSON | Squelette du front, 3 écrans | 20 profils membres + Agent Cards | Données réelles à l'écran |
| 10h30–12h00 | Scoring + orchestrateur de négociation SSE | Arène : bulles en streaming + graphe | Scénario de démo mot à mot | **Négociation de bout en bout en texte à 12h** |
| 12h30–14h00 | Voix Realtime + `confirm_participation` | Écran coalition + génération de la convention | Deck de 6 slides + chiffres | **Démo v1 complète à 14h** |
| 14h00–15h00 | Robustesse : cache, **mode replay**, erreurs | Finitions UI, graphe | Pitch répété deux fois | |
| 15h00 | **Gel du code**, vidéo de secours de 90 s | | Répétition avec la démo | |
| 15h55 | Prêts | | | Pitch à 16h |

**Règle de coupe :** si la négociation ne fonctionne pas de bout en bout à 12h, on **abandonne la voix** et on concentre tout sur l'arène.

## 9. Pièges à éviter

1. **Pas de vrai WhatsApp.** Éligibilité aux appels, politique Meta sur les « AI Providers » depuis le 15/01/2026, numéro de test limité à 5 destinataires : on imite l'interface.
2. **Voix dans un stade.** Micro-casque, seuil VAD relevé ou push-to-talk, test sur place vers 13h.
3. **Négociations qui bouclent ou hallucinent.** JSON schema strict, 6 tours maximum, contraintes vérifiées en code, médiateur.
4. **Latence.** Streamer chaque message, négocier les paires en parallèle, pré-calculer l'extraction des 5 avis.
5. **Clés API.** Tout tester à 9h30, avoir une clé de secours et un plafond de dépense.
6. **Données personnelles.** Uniquement des profils synthétiques, présentés comme tels.

**Plans B, dans l'ordre**
1. Mode replay : les négociations réussies sont sauvegardées en JSON puis rejouées avec le même streaming.
2. Voix en panne : même flux en chat texte.
3. Réseau en panne : tout tourne en local sur le cache BOAMP.
4. Laptop en panne : vidéo sur un téléphone et deck en PDF.

## 10. Scénario de démo (90 s)

1. « Voici un vrai avis publié cette semaine par une collectivité des Bouches-du-Rhône. » → il se transforme en fiche de besoins.
2. Trois portraits s'allument sur le graphe. La négociation défile : « L'agent de Sonia propose d'être mandataire… l'agent de Leïla refuse le lot 2 avant novembre… le médiateur rééquilibre la répartition. »
3. Le laptop « sonne ». L'Épaulette vocale parle à Sonia, jouée par Adeline, qui accepte avec une condition. Le statut passe au vert.
4. La convention de groupement apparaît.

## 11. Trame du pitch (4 min)

1. **Accroche (30 s) :** 9 % des startups, 1 % des fonds levés. En PACA, une entreprise sur trois est créée par une femme. Ce qui manque, ce n'est pas le talent, c'est l'accès.
2. **Insight (40 s) :** Uzzi 2019. Les Épaulettes ont le cercle ; il manque la machine qui transforme ce cercle en opportunités.
3. **Démo en direct (120 s).**
4. **Équité (30 s) :** Project Deal, et le même agent pour toutes.
5. **Adoption (30 s) :**
   - un digest hebdomadaire dans le WhatsApp existant ;
   - un atelier « Répondre en groupement » ;
   - la suite : radar des aides, voix au téléphone, Chief of Staff IA.

   Phrase finale : *« Les apéros créent la confiance. Épaulette Coalitions la transforme en chiffre d'affaires. »*

## 12. Éthique et RGPD

- Consentement explicite et révocable, minimisation des données, AIPD avant tout déploiement réel.
- Un agent **n'engage jamais** sa membre : double opt-in humain obligatoire.
- Transparence : l'utilisatrice doit savoir qu'elle parle à une IA (AI Act, art. 50).
- Les documents générés sont des **brouillons** à relire.
- Hébergement en Europe ; Mistral renforce cet argument.

## 13. Consignes pour Claude Code

- Priorité à une **démo fiable** plutôt qu'à une architecture propre. Rien ne doit bloquer le chemin critique : radar → coalition → négociation → documents.
- Commencer par le back-end et les données de démo (`members.json`, cache BOAMP), puis le streaming SSE, puis le front.
- Chaque appel LLM passe par `llm()` : retries, timeout, fallback de fournisseur, validation JSON.
- Enregistrer chaque négociation réussie dans `data/replays/` et prévoir un flag `REPLAY=1`.
- Variables d'environnement : `MISTRAL_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` (repli), `REPLAY`.
- Code et commentaires en anglais, interface en français.