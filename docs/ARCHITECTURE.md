# Architecture cible

## Socle

- Application Laravel 12 unique, pages React rendues via Inertia.js, Vite pour les ressources.
- Authentification par session, autorisations Laravel côté serveur et espaces public, membre et administration.
- Un compte membre peut aussi avoir le rôle administrateur ou responsable habilité ; chaque personne garde un compte unique et son propre espace membre.
- Connexion par téléphone ou adresse e-mail, avec l'un ou l'autre contact requis. Un responsable habilité gère les rôles ; les changements sont motivés et journalisés.
- Pour les comptes sans e-mail, un administrateur peut générer un mot de passe temporaire à remettre directement au membre. Il doit être changé à la connexion suivante ; seule sa version chiffrée est conservée dans la session et l'action est journalisée.
- Les administrateurs et responsables disposent de `/administration/utilisateurs` pour créer un compte Administrateur. Le serveur génère un mot de passe provisoire affiché une seule fois, force son changement à la première connexion et journalise l'attribution initiale du rôle. Seul un responsable habilité peut ensuite modifier les rôles existants ou attribuer le rôle Responsable.
- MySQL pour le développement et la production, selon la décision du club. La base locale de développement se nomme `amis_de_foot`.
- SweetAlert2 pour les confirmations explicites ; la validation réelle des opérations reste sur le serveur.
- Système visuel documenté dans `DESIGN_SYSTEM.md` : Tailwind CSS 4, composants React/Radix, palette bleu nuit inspirée des grandes soirées de football, panneaux glassmorphism et Motion for React pour les transitions discrètes. Chaque écran doit être vérifié du mobile à l'ordinateur.
- Composant officiel DataTables React et extension Responsive pour les listes. Les grands jeux de données seront filtrés et paginés côté serveur.
- Justificatifs et reçus dans un stockage privé, accessibles après contrôle des droits.

## Domaines métier

1. Identité, membres, rôles et historique des statuts.
2. Adhésion distincte des cotisations.
3. Tarifs datés, obligations mensuelles et affectations des paiements.
4. Paiements manuels puis interface de prestataire en ligne.
5. Journal de caisse, comptes, dépenses, transferts et contre-écritures.
6. Retards, statistiques et exports.
7. Pages publiques et blog.

## Niveau 7 — Site public et publications

- `PublicSiteController` alimente l'accueil, la présentation, le contact, la liste des actualités et la lecture d'un article publié.
- `Article` conserve l'auteur, le titre, l'URL lisible, le résumé, le contenu, une galerie facultative limitée à trois photos, l'état brouillon/publié et la date de publication. La première photo sert de couverture dans les listes ; la page de lecture affiche toute la galerie dans un slider.
- Les images de couverture sont stockées sur le disque public dans `storage/app/public/articles` et servies par le lien `public/storage`.
- `ArticleController` et `ArticleRequest` réservent la rédaction et la publication au groupe de routes administrateur/responsable. Les brouillons et publications futures renvoient une page introuvable au public.
- Les routes publiques sont `/`, `/le-club`, `/actualites`, `/actualites/{slug}` et `/contact`. La gestion se trouve dans `/administration/actualites`.
- L'accueil affiche au plus trois publications récentes. Les pages utilisent le système visuel responsive commun et des métadonnées de page adaptées.

Un paiement confirmé, ses affectations et son écriture de caisse doivent être créés dans une transaction unique. Une référence externe ou manuelle unique empêche le double traitement. Les montants sont des entiers FCFA. Les rapports distinguent date d'encaissement et période couverte.

## Organisation prévue

`app/Domain` regroupera les règles métier, `app/Http` les contrôleurs et autorisations, `resources/js` les pages et composants React, `database` les migrations et données de test, `tests` les tests des règles critiques. Cette structure sera précisée au fur et à mesure des niveaux.
