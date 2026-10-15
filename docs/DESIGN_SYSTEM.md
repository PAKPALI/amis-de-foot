# Système UI/UX — Amis de foot

## Direction visuelle

Ambiance de grande soirée de football : bleu nuit, bleu électrique, lumière froide et détails argentés. L'identité du club reste originale ; aucun logo ou marque de compétition externe n'est reproduit.

Le glassmorphisme sert à hiérarchiser les zones importantes : fond profond ou doux, panneaux translucides, bordures lumineuses fines, flou modéré et ombres légères. La lisibilité des textes et des formulaires prime sur l'effet visuel.

## Outils retenus

- Tailwind CSS 4 pour la mise en page responsive et les styles.
- Composants React du kit existant, fondés sur Radix UI, pour les formulaires et la navigation accessibles.
- [Motion for React](https://motion.dev/docs/react-installation) pour les apparitions courtes. Le composant `Reveal` centralise leur durée et respecte la préférence de [réduction des animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion).
- Lucide pour les icônes, SweetAlert2 avec `ClubAlert` pour les confirmations, et DataTables Responsive pour les listes administratives volumineuses. La file des adhésions utilise déjà le tableau avec libellés français et détails adaptés au mobile.

## Tokens et composants à réutiliser

| Élément | Emplacement / usage |
| --- | --- |
| Couleurs, rayons, thèmes clair/sombre | `app/resources/css/app.css` : variables `:root` et `.dark` |
| Fond de scène bleu nuit | Classe `adf-scene` pour accueil, authentification et en-têtes majeurs |
| Panneau vitré clair ou sombre | `adf-glass` et `adf-glass-dark` |
| Carte de travail | `adf-soft-panel` pour l'espace connecté |
| Marque du club | `Brand` et `AppLogoIcon` dans `app/resources/js/components/` |
| Animation d'entrée | `Reveal` dans `app/resources/js/components/ui/` |
| Confirmation | `ClubAlert` dans `app/resources/js/lib/` |
| Actions et saisie | `Button` et `Input` dans `app/resources/js/components/ui/` |
| Menu de l'espace connecté | `AppSidebar` regroupe les liens membre et administration ; les modules pas encore livrés sont affichés « À venir » sans lien actif. Sur téléphone, le menu s'ouvre dans un panneau depuis le bouton « Menu ». |
| Navigation flottante | `AppSidebarHeader`, `AppSidebar` et les classes `adf-floating-topbar`, `adf-sidebar-panel`, `adf-chrome-orbit` forment deux panneaux vitrés distincts. |

Palette indicative : bleu nuit `#070e28`, bleu de scène `#0a1b47`, bleu d'action clair `#61a9f8` en thème sombre, bleu d'action profond en thème clair, blanc froid et bleu glacé pour les surfaces. Les couleurs opérationnelles (succès, erreur) gardent un sens constant.

## Navigation de l'espace connecté

La barre supérieure et le menu latéral sont deux cartes arrondies et translucides, séparées du bord de l'écran et l'une de l'autre. Sur ordinateur, le menu conserve son mode réduit ; sur mobile, il s'ouvre dans un panneau flottant avec une marge visible. La barre supérieure garde l'accès au profil, un raccourci de bascule clair/sombre et le bouton du menu.

Une bordure lumineuse bleue parcourt chaque carte en boucle : 12 secondes pour la barre, 17 secondes en sens inverse pour le menu. La lumière reste fine pour préserver la lecture. La règle globale `prefers-reduced-motion: reduce` arrête ces animations. Tout nouvel écran connecté doit conserver les espacements de cette structure.

## Règles pour chaque nouvel écran

1. Commencer par le contenu et l'action principale ; conserver une seule action primaire par section.
2. Réutiliser les tokens et composants ci-dessus. Les messages et confirmations passent par `ClubAlert`.
3. Prévoir dès la maquette les largeurs de 320, 390, 768 et 1280 pixels CSS. Éviter le défilement horizontal ; les colonnes deviennent des cartes empilées en mobile.
4. Vérifier la taille des cibles tactiles, le focus clavier, les libellés et les contrastes dans les deux thèmes.
5. Limiter les animations aux apparitions et aux retours d'action brefs. Le mouvement décoratif s'arrête avec `prefers-reduced-motion: reduce`.
6. Pour DataTables, prévoir une lecture mobile utile des colonnes et des actions, puis filtrage et pagination côté serveur quand les données grossissent.
7. Éviter les données fictives présentées comme réelles. Les fonctions non livrées portent clairement la mention « À venir ».
8. Les libellés des boutons d'action sont blancs ; choisir un fond assez sombre pour garder un contraste lisible dans les deux thèmes.

## Vérification actuelle

Accueil, inscription et connexion inspectés visuellement sur mobile, tablette et ordinateur. Un contrôle des débordements horizontaux a été effectué sur les trois pages à 320, 390, 768 et 1280 pixels CSS : aucun débordement. Les espaces connectés utilisent des cartes qui passent d'une colonne à trois selon la largeur. La navigation flottante a été inspectée sur ordinateur, en mode réduit et sur mobile avec le panneau ouvert. Son nouvel habillage attend le contrôle visuel du club.

## Fond des pages d'authentification

Le fond des pages de connexion et d'inscription utilise une photographie de Lionel Messi et Cristiano Ronaldo prise par Fanny Schertzer pendant Portugal–Argentine en 2011. La photo est hébergée par Wikimedia Commons sous licence [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) ; le crédit et les modifications (recadrage et assombrissement) sont affichés sous le formulaire. L'image est chargée depuis Wikimedia Commons, donc nécessite une connexion Internet. Un voile bleu conserve le contraste ; la carte du formulaire et les champs restent translucides pour laisser voir la photo. Un lent mouvement vertical anime le fond. Le cadrage s'adapte aux écrans étroits et l'animation s'arrête avec `prefers-reduced-motion`.

## Accueil immersif — 15 octobre 2026

La page publique adopte une direction « soirée au stade » : bleu nuit, lumière glacée, titres affirmés, navigation vitrée et composition aérée. La scène de terrain en perspective est dessinée en SVG/CSS local ; elle ne dépend ni d'une photo distante ni d'une nouvelle bibliothèque.

- Le ballon, les faisceaux et les passes suggèrent le mouvement. Le bouton Pause/Reprendre contrôle les animations CSS ; la préférence système de réduction des mouvements reste prioritaire.
- Trois boutons permettent de découvrir le collectif, la passion et l'esprit sportif. Ils sont utilisables au clavier, annoncent leur sélection et mettent à jour une région de contenu accessible.
- Les cartes distinguent l'espace personnel disponible des actualités et cotisations à venir. Les illustrations sont décoratives, sans chiffres présentés comme des données réelles.
- Sur mobile, la scène passe sous le titre, les cartes s'empilent et les boutons des valeurs restent accessibles.
- Les styles de cette page sont préfixés `adf-home`, `adf-stadium`, `adf-universe` et `adf-ecosystem` dans `app/resources/css/app.css`. La page React est `app/resources/js/pages/welcome.tsx`.
