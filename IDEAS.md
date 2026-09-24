# Idées — Le Réseau des Épaulettes

## L'idée de départ

Web app all-in-one pour centraliser les outils du réseau :

- onboarding ultra personnalisé — photo ou avatar, goûts, hobbies, âge, profession — pour matcher facilement
- un agenda
- une carte 3D de Marseille avec les événements visibles, et la possibilité d'en créer
- invitation marrainage avec code promo si acceptation
- avant l'apéro, une visio des nouvelles arrivantes pour une intégration optimisée

UI moderne, simple à prendre en main. Code couleur de l'entreprise :
`#25C7D9`, `#F2F3DC`, `#F6577C`.

## Ce qui a été ajouté

**Onboarding**
- Onboarding **conversationnel** plutôt que formulaire : l'Épaulette pose une question à la fois.
- **Avatar génératif** déterministe (initiales + dégradé de la charte) si pas de photo.
- **Aperçu en direct des rencontres** pendant l'onboarding : la preuve immédiate que remplir son profil sert.

**Matching — le cœur de valeur**
- Trois familles de suggestions : **complémentaire** (elle couvre votre besoin), **pont** (lien modérément faible, contacts non redondants), **affinité**.
- Chaque suggestion porte **une justification en une phrase** et **un message d'intro pré-rédigé**, prêt à copier.
- **Demandes d'aide** : une membre décrit son besoin, le système route vers les 3 bonnes personnes au lieu de le noyer dans WhatsApp.

**Événementiel**
- Sur la carte 3D : **les membres aussi**, en pastilles par quartier — le réseau devient visible.
- **Placement de tables suggéré** pour l'apéro : on évite d'asseoir ensemble celles qui se connaissent déjà, avec un brise-glace par table.
- **Pré-apéro visio** avec déroulé des 30 minutes et lien de salon.

**Marrainage**
- Codes uniques avec **suivi d'état** (envoyée → acceptée → inscrite).
- **Paliers de remise** (-15 % / -30 % / -50 %) et **classement des marraines**.

**Animation**
- **Carte des liens** : graphe du réseau, membres isolées en rose.
- **Priorités d'animation** : qui décroche, donc qui relancer — l'écran qui montre le ROI à l'association.

## Ajouts de la seconde passe

- **Avatar type Mii/Sims** : carnation, forme du visage, 10 coupes, couleurs de cheveux et d'yeux, sourcils, bouche, lunettes, accessoires, taches de rousseur, fond. Bouton « au hasard ». L'import photo reste possible, et modifiable depuis le profil.
- **Messagerie interne** avec compteur de non-lus ; le message d'intro d'une carte membre devient un vrai message envoyé.
- **Lien LinkedIn** sur le profil et sur les 22 membres.
- **Invitations à un événement** réservées à l'organisatrice ; chaque invitée reçoit un message.
- **Calendrier** : export `.ics`, lien Google Agenda, et surtout **abonnement `webcal://`** — l'agenda relit le flux, donc les nouveaux événements arrivent sans rien refaire.
- **Logo officiel** en header et favicon ; largeur de l'app portée à 1600 px.
- Âge rendu explicitement facultatif ; aperçu « personnes qui vous ressemblent » retiré de l'onboarding.

## Ajouts de la troisième passe

- **Carte colorée** (CARTO Voyager) et **survol animé** d'un événement à l'autre.
- **Graphe du réseau au centre d'une page unique** : avatars en guise de nœuds, vous au milieu, annuaire et suggestions réorganisés autour.
- **Chemin d'introduction** : cliquer sur une membre allume la chaîne « Vous → … → elle » et propose de demander à la première intermédiaire. « Priorités d'animation » retiré.
- **Messagerie en volet flottant** accessible partout, avec **stickers** et **GIFs animés** générés localement.
- **Animations globales** : cascade à l'apparition des grilles, élévation au survol, transitions par défaut, respect de `prefers-reduced-motion`.

## Pistes non faites

- Carte de visite publique partageable par membre (vecteur d'adoption via le WhatsApp existant).
- Digest hebdomadaire à poster dans le groupe WhatsApp existant.
- Vraie visio intégrée plutôt qu'un lien externe.
- Onglet « Coalitions » : répondre en groupement à des appels d'offres publics (voir CONTEXT.md).
