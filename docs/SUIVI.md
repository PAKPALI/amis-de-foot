# Journal de suivi

## Niveau 1 — Socle et documentation

**État : terminé et validé par le club le 15 octobre 2026.**

### Plan

1. Examiner le dossier et les outils présents.
2. Installer le squelette Laravel 12 avec React/Inertia et les bibliothèques demandées.
3. Vérifier les versions, la compilation et le démarrage local.
4. Décrire le test manuel et attendre la validation du club.

### Travail effectué

- Dossier initial vide ; PHP 8.3.33, Composer 2.4.1 et Node 22.23.2 disponibles.
- Architecture et plan de progression consignés dans `docs/`.
- Le club a choisi MySQL pendant le niveau 1 ; l'architecture et la configuration locale ont été adaptées.
- Kit React officiel `v1.0.1` installé avec Laravel `12.70.0` et Inertia.js. Le kit courant installait Laravel 13 ; la version compatible Laravel 12 a donc été fixée explicitement.
- SweetAlert2 `11.26.25`, DataTables React `2.0.0`, DataTables `3.1.4` et Responsive `4.1.1` installés. Leur utilisation dans les écrans commencera aux niveaux concernés.
- Base MySQL locale `amis_de_foot` créée, configuration `.env` et `.env.example` adaptée, migrations initiales appliquées. Le fichier SQLite créé par le kit a été retiré.
- Dépôt Git initialisé dans `C:\ADF`.

### Vérifications et rapport

- `npm run build` : réussi après mise à jour des dépendances.
- `php artisan test` : 26 tests réussis, 63 assertions (tests du kit, pas encore de règles métier du club).
- `npm audit fix` : mises à jour compatibles appliquées ; audit final à 0 vulnérabilité.
- `php artisan migrate:status` : trois migrations initiales exécutées sur MySQL.
- Réponse HTTP `200` et page Inertia présente sur `http://127.0.0.1:8000/` lors du contrôle technique.
- Le club a confirmé avoir lancé et consulté la page d'accueil sur `http://127.0.0.1:7777/`.

### Test manuel du club

1. Ouvrir `http://127.0.0.1:7777/` sur le poste de développement.
2. Vérifier que la page d'accueil du kit Laravel s'affiche sans erreur, avec les liens de connexion et d'inscription.
3. Réduire la largeur de la fenêtre ou utiliser l'affichage mobile du navigateur et vérifier que la page reste lisible.
4. Le club a confirmé le niveau 1 après cette vérification ; le socle est clos.

L'inscription et les règles propres aux membres d'Amis de foot seront traitées aux niveaux suivants ; la page actuelle est le socle technique.

### Validation

Validé par le club le 15 octobre 2026 après inspection de la page sur `http://127.0.0.1:7777/`.

## Niveau 2 — Comptes et accès

**État : implémenté et validé par le club le 15 octobre 2026.**

### Plan

1. Cartographier l'authentification existante et confirmer les rôles côté serveur.
2. Faire valider l'identifiant de connexion et les règles d'attribution des rôles.
3. Adapter les comptes pour le téléphone/e-mail, les routes protégées et les vues React.
4. Ajouter les espaces membre/administration, la gestion contrôlée des rôles et la récupération administrateur.
5. Vérifier l'inscription, la connexion, l'isolation des droits et les parcours de récupération.
6. Mettre à jour ce rapport et attendre le test manuel du club.

### Travail effectué

- La page du socle a été vérifiée manuellement par le club ; niveau 1 clos.
- Authentification actuelle du kit inspectée : e-mail obligatoire, inscription et connexion par e-mail, tableau de bord protégé.
- Le club a choisi la connexion par téléphone ou e-mail.
- Le club a choisi une réinitialisation par un administrateur pour les comptes sans e-mail.
- Les rôles sont membre, administrateur et responsable habilité. Le responsable attribue les rôles ; la première désignation est faite depuis la console d'installation.
- Les comptes peuvent être créés avec téléphone seul ou e-mail seul. Le mot de passe temporaire exige un changement lors de la prochaine connexion.
- L'espace personnel est accessible à tout compte connecté ; `/administration` est réservé aux rôles administrateur et responsable.
- La page de gestion des rôles est ouverte à l'administration pour la réinitialisation d'accès, tandis que les changements de rôle sont réservés au responsable. Les opérations sont journalisées avec auteur, horodatage et motif.
- À la demande du club pendant le test du niveau 2, un système UI/UX commun a été ajouté : bleu nuit et lumière de stade, surfaces vitrées, marque Amis de foot, boutons et champs harmonisés, animations discrètes avec Motion for React, confirmations SweetAlert2 habillées et navigation de l'espace connecté adaptée aux rôles.
- La page d'accueil du kit a été remplacée par une page de club. Les pages d'authentification, les deux tableaux de bord, la gestion des rôles et les paramètres du compte reprennent la même identité. Les fonctions des niveaux suivants sont signalées « À venir ».
- Les paramètres et le menu du compte ont été francisés ; le contact du menu affiche le téléphone lorsqu'un membre ne possède pas d'e-mail.
- Les règles de réutilisation et les contrôles responsive sont décrits dans `docs/DESIGN_SYSTEM.md`.
- Le fond de connexion et d'inscription affiche une photographie de Messi et Cristiano Ronaldo publiée par Fanny Schertzer sur Wikimedia Commons (CC BY 3.0). La carte et les champs sont translucides pour voir l'image à travers ; le cadrage est adapté au mobile, le mouvement lent respecte `prefers-reduced-motion`, et le crédit avec licence est visible sous le formulaire. La photo est chargée en ligne depuis Wikimedia Commons.

### Vérifications et rapport

- PHPUnit direct, base SQLite en mémoire : 33 tests réussis, 93 assertions, dont connexion e-mail/téléphone, refus d'accès par rôle, audit de rôle et réinitialisation avec changement obligatoire.
- `npx tsc --noEmit` : réussi après correction des types des formulaires Inertia.
- `npm run build` : réussi après les changements du niveau 2.
- `npx eslint` sur les fichiers React modifiés : réussi.
- `npm install motion` : dépendance d'animation ajoutée, audit npm à 0 vulnérabilité.
- Accueil, inscription et connexion inspectés visuellement du mobile à l'ordinateur. Contrôle de débordement horizontal sur ces trois pages à 320, 390, 768 et 1280 pixels CSS : aucun débordement. Le libellé du mot de passe a été réorganisé pour les petits mobiles.
- Dernier ajustement du fond d'authentification : `npm run build` réussi ; la connexion a été inspectée à 391 pixels CSS sur mobile. Les deux visages restent visibles à travers la carte et les champs, sans débordement horizontal ni erreur console.
- `php artisan migrate --force` : migrations des champs de contact, rôles, audit et réinitialisation appliquées à MySQL.
- `php artisan route:list --path=administration` : routes de gestion enregistrées ; la commande `amisdefoot:bootstrap-responsable` est disponible.
- Dans l'environnement de vérification actuel, `php artisan test` s'arrête car PHP signale `vendor/autoload.php` comme illisible. Les mêmes 33 tests ont été exécutés avec PHPUnit directement, en forçant SQLite en mémoire ; aucune donnée MySQL du club n'a été utilisée.
- Incident signalé lors du test manuel : l'inscription renvoyait `419 PAGE EXPIRED`, y compris depuis un nouvel onglet. Le formulaire Inertia envoyait ses requêtes en comptant sur le cookie XSRF automatique d'Axios. Le jeton Laravel est maintenant aussi rendu dans la balise `meta csrf-token` et transmis avec l'en-tête `X-CSRF-TOKEN`.
- Vérification du correctif : une inscription de diagnostic avec des données factices et un mot de passe volontairement trop court a renvoyé l'erreur de validation attendue (« au moins 8 caractères »), sans 419 et sans créer de compte. L'onglet de diagnostic a été fermé.
- Test réel demandé par le club : un compte fictif sans e-mail a été créé depuis le formulaire du navigateur sur le port 7777. L'application a accepté l'inscription, connecté le membre et affiché « Mon espace ». Le compte de test et sa session ont ensuite été supprimés de MySQL ; vérification après suppression : aucun utilisateur avec le téléphone de test et aucune session liée au compte. Aucun compte ni aucune coordonnée du club n'ont été modifiés.
- À la suite de son inscription réelle, le club a demandé que le nouveau membre se connecte lui-même depuis l'interface. Le contrôleur ne connecte plus automatiquement le compte créé ; il redirige vers `/login` avec une confirmation. L'écran de connexion affiche déjà le message de statut.
- `vendor/bin/phpunit tests/Feature/Auth/RegistrationTest.php` : réussi après le changement, 3 tests et 11 assertions. Les tests confirment la création, la redirection vers la connexion, le message de confirmation et l'absence de session authentifiée, pour e-mail et téléphone seul.
- `npx tsc --noEmit` : réussi ; `npm run build` : réussi (2 425 modules transformés).
- Ajustement UI demandé sur la connexion : le lien « Mot de passe oublié ? » est maintenant aligné à droite du libellé du mot de passe quand l'espace le permet, et passe à la ligne sans débordement sur les écrans étroits. Contrôlé à 320, 390 et 1 280 px : pas de débordement horizontal ; `npm run build` réussi.
- Les retours d'erreur Inertia du serveur sont centralisés dans SweetAlert2 : erreurs de validation regroupées dans une alerte, réponses HTTP (dont 401, 403, 404, 419, 429 et 5xx) et erreurs de connexion avec messages adaptés en français. Les champs gardent aussi leurs erreurs de validation sous le formulaire.
- Test navigateur réel sur `/register` avec une donnée de diagnostic et un mot de passe volontairement trop court : l'alerte SweetAlert2 a affiché le retour de validation serveur, sans créer de compte. L'onglet de test sera refermé après le contrôle ; la page de connexion d'origine est conservée.
- `npx tsc --noEmit` : réussi après l'ajout du gestionnaire centralisé ; `npm run build` : réussi (2 426 modules transformés).
- `npx tsc --noEmit` : réussi après le correctif CSRF.
- `npm run build` : réussi après le correctif CSRF (2 425 modules transformés).
- Le formulaire d'authentification est une carte vitrée plus transparente, et les champs sont translucides pour laisser voir la photo. Le cadrage de l'image et le contraste du voile sont adaptés aux mobiles.
- Dans l'espace connecté, le menu latéral est organisé en « Espace membre » et, pour les responsables/administrateurs, « Gestion du club ». Les modules des niveaux suivants apparaissent « À venir » sans lien vers des pages inexistantes. Sur mobile, le bouton « Menu » ouvre le panneau.

### Test manuel du club

1. Ouvrir l'accueil, l'inscription et la connexion sur ordinateur puis en réduisant la fenêtre jusqu'au mobile. Vérifier que la photo des deux joueurs se voit à travers la carte et les champs translucides, que le crédit est présent, que les boutons/champs/textes restent lisibles sans défilement horizontal et que l'animation reste discrète. Vérifier aussi le comportement avec la réduction des animations activée.
2. Dans l'espace connecté, ouvrir le menu latéral sur ordinateur. Vérifier les liens actifs et les fonctions marquées « À venir » ; sur mobile, ouvrir le bouton « Menu » et parcourir les mêmes sections.
3. Sur `http://127.0.0.1:7777/register`, créer un compte de test avec un téléphone seul. Vérifier l'arrivée sur `/login` et le message de confirmation, puis se connecter avec ce compte et vérifier l'arrivée dans « Mon espace ».
4. Se déconnecter et se reconnecter avec ce téléphone et le mot de passe ; vérifier que l'adresse e-mail n'est pas nécessaire.
5. Tenter d'ouvrir `http://127.0.0.1:7777/administration` avec ce compte membre : l'accès doit être refusé.
6. Pour contrôler l'espace d'administration, enregistrer un second compte de test. Dans MySQL Workbench ou phpMyAdmin, exécuter `SELECT id, name, phone, email, role FROM users;` sur la base `amis_de_foot`, puis depuis `app/`, exécuter une fois `php artisan amisdefoot:bootstrap-responsable ID` (remplacer `ID` par celui du compte choisi). La première désignation est réservée à la console de confiance.
7. Se reconnecter avec ce compte et vérifier l'accès à l'administration, à l'espace membre, à la gestion des rôles et à la réinitialisation d'accès. Les changements de rôle demandent un motif. Contrôler aussi l'affichage mobile de ces écrans.
8. Réinitialiser le mot de passe d'un compte de test, relever le mot de passe provisoire présenté une seule fois, se connecter avec celui-ci et vérifier que l'application impose le changement du mot de passe avant l'accès à l'espace.
9. Communiquer « niveau 2 validé » ou décrire l'erreur constatée.
10. Vérifier un retour serveur en provoquant une erreur de validation ; SweetAlert2 doit afficher les messages reçus du serveur. Les erreurs HTTP et d'indisponibilité du serveur doivent également présenter un message explicite.

**Reprise après le correctif 419 et changement du parcours :** le test réel initial de création d'un compte fictif est passé et ce compte a été supprimé. Le comportement a ensuite été modifié à la demande du club ; le scénario attendu est maintenant inscription → connexion manuelle → espace membre. Le club a validé le niveau 2 le 15 octobre 2026.

### Décisions du niveau 3 — Adhésion

- Le club a demandé un test réel d'inscription, puis a demandé de continuer après sa réussite. Le scénario d'inscription avec téléphone seul a été exécuté ; l'espace membre s'est affiché et le compte temporaire a été supprimé de MySQL avec sa session.
- Le plan détaillé du niveau 3 est dans `docs/PLAN.md`.
- Le club a fixé le montant de l'adhésion à 1 000 FCFA, payable une seule fois.
- Un administrateur vérifie le règlement, le confirme et approuve le membre. L'acteur et l'horodatage sont historisés.
- Ces décisions sont consignées dans `docs/DECISIONS.md` ; le niveau 3 est en cours d'implémentation.

### Validation

Le club a confirmé « niveau 2 valider » le 15 octobre 2026 après le protocole de test manuel. Le niveau 2 est clos. Les décisions nécessaires au niveau 3 ont été données le même jour ; son implémentation est en cours.

## Niveau 3 — Adhésions

**État : implémenté et validé manuellement par le club le 15 octobre 2026.**

### Décisions du club

- Montant : 1 000 FCFA, dû une seule fois.
- L'administrateur peut confirmer le règlement après vérification et approuver le membre. L'auteur et l'horodatage sont conservés.
- Une demande refusée comporte un motif ; le membre peut en déposer une nouvelle, sans perdre l'historique précédent.

### Travail effectué

- Deux tables ajoutées : `memberships` (demande, montant et état de paiement/approbation) et `membership_events` (historique append-only des actions, acteur et horodatage). Une seule adhésion existe par compte membre.
- Le membre peut déposer une demande, consulter son état, signaler le règlement et lire le motif d'un refus. Une demande refusée peut être soumise à nouveau.
- L'administration peut consulter la file avec DataTables Responsive, confirmer le paiement et approuver, ou refuser avec un motif obligatoire.
- L'approbation directe depuis l'état « en attente de paiement » permet à l'administrateur de confirmer une réception faite en personne. Cette action ne produit pas encore d'écriture de caisse ; la saisie financière complète appartient au niveau 4.
- Navigation membre et administration reliée aux nouveaux écrans, avec SweetAlert2 pour les confirmations sensibles.
- Montant centralisé dans `config/club.php` avec valeur par défaut 1 000 FCFA et documenté dans `.env.example`.

### Vérifications et rapport

- Tests métier du niveau 3 sur SQLite en mémoire : 6 tests réussis, 70 assertions après l'ajout des notifications. Couverture : dépôt et signalement de paiement, notifications aux administrateurs/responsables avec e-mail, décisions par e-mail au membre, approbation et audit administrateur, refus avec motif, nouvelle demande sans effacer l'historique, interdiction des doublons et contrôle des rôles.
- `npx tsc --noEmit` : réussi.
- ESLint ciblé sur les composants React modifiés : réussi.
- `npm run build` : réussi (2 435 modules transformés).
- `php artisan route:list --path=adhesion` : six routes membre et administration enregistrées.
- `php artisan migrate --force` : les deux migrations du niveau 3 appliquées à la base MySQL locale `amis_de_foot` ; tables créées sans modifier les comptes existants.
- Parcours sans demande contrôlé dans le navigateur : écran membre avec montant et bouton de demande ; écran administration avec état vide et DataTables configuré pour les demandes.

### Test manuel demandé au club

1. Avec un compte membre de test, ouvrir `http://127.0.0.1:7777/mon-adhesion` et déposer une demande. Vérifier « En attente du règlement » et le montant de 1 000 FCFA.
2. Signaler le paiement uniquement après l'avoir réellement remis à un administrateur ; vérifier l'état « Paiement à vérifier » côté membre.
3. Avec le compte administrateur, ouvrir `http://127.0.0.1:7777/administration/adhesions`. Vérifier que le membre apparaît et que la liste s'adapte à la largeur de l'écran.
4. Après vérification réelle du règlement, confirmer et approuver. Vérifier l'état « Membre approuvé » et l'acteur/date dans l'historique du membre.
5. Avec un second compte de test, déposer une demande puis la refuser avec un motif. Vérifier que le motif apparaît côté membre, puis déposer une nouvelle demande et confirmer que l'historique précédent reste présent.
6. Vérifier qu'un membre ne peut pas ouvrir `/administration/adhesions` et qu'un compte approuvé ne peut pas créer une deuxième adhésion.
7. Le club a refait le parcours après remise à zéro de son adhésion et a confirmé que le test est concluant le 15 octobre 2026.

Le niveau 4 complétera la confirmation d'adhésion par le journal financier, les références et les justificatifs des paiements. Son plan est prêt ; les règles de cotisation restent à décider.

## Ajustement transversal — Navigation flottante (15 octobre 2026)

**État : livré pour test manuel du club.** Cet ajustement visuel ne change pas la validation du niveau 2 ni les règles d'adhésion désormais fixées.

### Plan

1. Détacher visuellement le menu latéral et la barre supérieure, avec des marges et des cartes vitrées arrondies.
2. Ajouter une lumière bleue discrète qui tourne autour des deux panneaux et respecter la réduction des animations.
3. Contrôler les états ordinateur, menu réduit et panneau mobile, puis vérifier les outils de compilation.
4. Soumettre l'habillage au test manuel du club avant de poursuivre.

### Travail effectué et vérifications

- Menu et barre supérieure transformés en panneaux flottants distincts. La navigation active, la marque et l'accès au profil ont été adaptés à cette disposition.
- Bordure lumineuse animée autour des deux panneaux ; mouvement arrêté lorsque le système demande moins d'animations.
- Panneau mobile également décollé des bords de l'écran ; marque contrôlée dans le menu réduit.
- Inspection visuelle effectuée sur ordinateur, en menu réduit et sur mobile avec le panneau ouvert.
- `npx tsc --noEmit`, `npx eslint` sur les composants modifiés et `npm run build` : réussis.
- Règles réutilisables décrites dans `docs/DESIGN_SYSTEM.md`.

### Test manuel demandé au club

1. Ouvrir `http://127.0.0.1:7777/mon-espace` sur ordinateur : vérifier que la barre supérieure et le menu ont une marge visible entre eux et avec les bords, et que les deux lumières tournent discrètement.
2. Réduire puis rouvrir le menu latéral : vérifier que la marque et les liens restent utilisables.
3. En largeur mobile, ouvrir le menu : vérifier le panneau arrondi et décollé du bord, la lisibilité et la fermeture du menu.
4. Si possible, activer la préférence système de réduction des animations et vérifier que la lumière cesse de tourner.

**Validation : en attente du retour visuel du club.**

## Ajustement — Navigation sans rechargement complet (15 octobre 2026)

**État : correction implémentée et contrôlée dans le navigateur.**

### Plan

1. Identifier les interactions internes qui quittent la navigation Inertia.
2. Convertir les liens internes de fil d'Ariane en liens Inertia avec préchargement.
3. Contrôler les types et le lint, puis tester la navigation dans le navigateur.

### Constat et travail effectué

- La majorité des interfaces utilisent déjà `Link` d'Inertia. Les liens parents du fil d'Ariane étaient toutefois des liens HTML classiques : cliquer dessus rechargeait tout le document.
- Les fils d'Ariane utilisent maintenant `Link` avec préchargement. Inertia récupère les données et le composant de destination avant de remplacer l'interface ; l'écran courant reste affiché pendant l'attente.
- La barre de progression et la courte animation d'apparition restent visibles comme retours de navigation ; elles ne signifient pas un rechargement complet.

### Vérification

- `npx tsc --noEmit` et ESLint ciblé : réussis.
- Clic sur le fil d'Ariane « Administration » : l'URL et le contenu ont changé, et le menu latéral est resté monté. La navigation Inertia fonctionne sans rechargement complet.

## Ajustement — Actions d'adhésion visibles sur mobile (15 octobre 2026)

**État : correctif vérifié, niveau 3 toujours en attente de validation manuelle.**

### Plan

1. Inspecter la file d'adhésions à la largeur utilisée dans le navigateur.
2. Corriger l'affichage des actions de décision dans la vue étroite.
3. Vérifier que les actions de confirmation et de refus sont accessibles sur mobile et compiler le projet.
4. Demander au club de contrôler l'écran avant de valider le niveau 3.

### Constat et travail effectué

- Sur petit écran, DataTables Responsive déplaçait la colonne « Décision » dans une ligne de détails et affichait le composant React sous la forme `[object HTMLDivElement]`. Les boutons n'étaient donc pas utilisables depuis cette vue.
- Ajout d'une carte par demande sur mobile et tablette, avec contact, montant, dates, état et actions directement visibles. Le tableau DataTables reste destiné aux grands écrans.
- Le bouton d'approbation porte maintenant le libellé « Confirmer » ; la fenêtre SweetAlert2 rappelle que l'administrateur doit avoir vérifié le règlement.
- Vérifications : `npm run build` réussi (2 435 modules transformés) et ESLint ciblé réussi.
- Rechargement et inspection dans le navigateur mobile : la carte affiche les boutons « Confirmer » et « Refuser » directement, sans déplier une ligne. Les boutons n'ont pas été activés ; aucun paiement ni refus n'a été enregistré.

### Test manuel demandé au club

1. Recharger `/administration/adhesions` sur téléphone ou dans une fenêtre étroite et vérifier que la carte de chaque demande présente « Confirmer » et « Refuser ».
2. Ouvrir « Confirmer » sans valider la fenêtre, et vérifier le texte d'avertissement. Ne confirmer qu'après vérification réelle du paiement.

**Validation du niveau 3 : toujours en attente du club.**

## Préparation d'un nouvel essai d'adhésion (15 octobre 2026)

**État : nettoyage ciblé effectué à la demande du club ; compte conservé pour le nouvel essai.**

### Action et vérification

- Le compte membre de test avait une adhésion approuvée de 1 000 FCFA et deux événements : dépôt de la demande, puis confirmation du paiement et approbation.
- Dans une transaction MySQL, seule cette ligne d'adhésion et les deux événements rattachés ont été supprimés. Le compte utilisateur a été conservé.
- Vérification après transaction : compte toujours présent, 0 adhésion pour ce compte, 0 événement rattaché à l'ancienne adhésion.
- Le script temporaire employé pour le nettoyage a été supprimé après exécution.

### Reprise du test manuel

1. Actualiser `/mon-adhesion` dans le navigateur. En cas d'écran inchangé, se déconnecter puis se reconnecter.
2. Vérifier que la page propose de déposer une demande d'adhésion.
3. Refaire le parcours de demande, puis tester le retour SweetAlert2 et la lisibilité de l'état après approbation.
4. Communiquer le résultat observé avant de poursuivre le niveau 3.

**Validation du niveau 3 : toujours en attente du club.**

## Ajustement niveau 3 — Retour de décision et lisibilité après approbation

**État : correctif implémenté et contrôlé ; validation manuelle du niveau 3 toujours requise.**

### Plan

1. Contrôler l'état approuvé sur la page membre et le parcours Confirmer côté administration.
2. Ajouter un retour SweetAlert2 visible après approbation réussie ; garder les erreurs serveur et réseau dans les alertes d'erreur globales existantes.
3. Renforcer le contraste de l'état approuvé et rendre la date de confirmation immédiatement repérable en clair/sombre.
4. Compiler, vérifier TypeScript et lint, puis demander au club le test manuel sur une demande réelle de test.

### Travail effectué

- L'action « Confirmer » affiche désormais une alerte SweetAlert2 de succès qui confirme le paiement et l'approbation. En cas d'erreur, le gestionnaire global SweetAlert2 présente déjà les erreurs de validation, HTTP et connexion.
- Le refus affiche aussi une alerte de succès et indique qu'un courriel sera envoyé au membre si une adresse est renseignée.
- Sur « Mon adhésion », l'approbation apparaît dans un panneau vert à contraste renforcé, en thème clair comme sombre. Le statut actif et la date de confirmation disposent maintenant de lignes visuelles distinctes.
- La page ouverte sur `/mon-adhesion` indiquait le membre déjà approuvé ; aucun statut ni paiement n'a été modifié pendant le contrôle.

### Vérifications

- `npm run build` : réussi, 2 435 modules transformés.
- `npx tsc --noEmit --pretty false` et ESLint ciblé sur les deux pages : réussis.
- Après actualisation de `/mon-adhesion`, l'arbre d'accessibilité du navigateur confirme un titre « Adhésion approuvée », l'état actif, le montant et une date de confirmation séparée.
- Aucune approbation réelle n'a été déclenchée pendant ce contrôle. Le clic reste à vérifier sur une demande de test après vérification effective du règlement.

### Test manuel demandé

1. Sur l'administration, confirmer une demande de test après vérification du règlement ; l'alerte doit annoncer le succès.
2. Si l'action échoue, vérifier que SweetAlert2 affiche le message serveur correspondant.
3. Ouvrir `/mon-adhesion` avec ce membre et vérifier le panneau vert, le statut actif et la date de confirmation en thèmes clair et sombre.

**Validation du correctif et du niveau 3 : en attente du club.**

## Ajustement transversal — Contraste des boutons et étape d'adhésion (15 octobre 2026)

**État : corrigé, en attente de vérification manuelle du club.**

### Plan

1. Examiner la page « Mon adhésion » dans le navigateur et repérer pourquoi l'étape 1 semble absente.
2. Renforcer le contraste du texte de l'étape et appliquer des libellés blancs aux boutons réutilisables et SweetAlert2.
3. Vérifier les styles compilés et revoir l'écran dans le navigateur.
4. Demander au club de confirmer visuellement avant la suite du niveau 3.

### Travail effectué et vérifications

- L'étape 1 était rendue, mais son texte secondaire utilisait une couleur trop pâle sur le fond ambre clair. Le titre et le texte d'aide utilisent maintenant des teintes foncées à fort contraste.
- Les boutons React partagés affichent maintenant un texte blanc et des fonds assez foncés pour distinguer les variantes. Les boutons d'annulation SweetAlert2 suivent également cette règle.
- `npm run build` : réussi, les 2 435 modules sont transformés. `npx eslint` sur les deux composants concernés : réussi.
- Après rechargement de la page mobile dans le navigateur, l'étape 1 est lisible, le bouton d'action a un libellé blanc et les deux boutons SweetAlert2 ont un texte blanc lisible. La fenêtre de confirmation a été refermée sans signaler de paiement.

### Test manuel demandé au club

1. Actualiser `http://127.0.0.1:7777/mon-adhesion` et vérifier que le texte de l'étape 1 est lisible sur le panneau clair.
2. Vérifier que « J’ai réglé l’adhésion » et les autres boutons d'action affichent un libellé blanc.
3. Ouvrir la confirmation puis vérifier que « Annuler » et le bouton de confirmation ont tous deux un texte blanc lisible.

**Validation : en attente du retour visuel du club.**

## Ajustement transversal — Accueil football immersif (15 octobre 2026)

**État : livré, en attente de validation visuelle manuelle.**

### Plan et réalisation

1. Examiner l'accueil et conserver l'identité bleu nuit du club.
2. Recomposer l'accueil autour d'un terrain lumineux en perspective, de textes plus affirmés et d'une navigation vitrée.
3. Ajouter l'exploration interactive des valeurs, une présentation des services et une commande de pause des animations.
4. Vérifier le navigateur, les petites largeurs, les interactions et la compilation ; documenter la livraison.

### Rapport de vérification

- Accueil observé directement dans le navigateur du projet sur le port 7777 ; contrôles visuels de la scène, des valeurs et des cartes.
- Sélection « La passion » vérifiée au clic ; « L’esprit sportif » activé avec Entrée et contenu attendu affiché.
- Pause vérifiée dans le navigateur : état `data-paused=true` et animation calculée `paused`, puis reprise.
- Aucun débordement horizontal mesuré aux largeurs CSS effectives 320, 426, 520, 1024 et 1706 px. Le navigateur applique un facteur de zoom aux tailles demandées ; ces valeurs sont les largeurs réellement observées. Affichage habituel restauré après contrôle.
- `npm run build` réussi : 2 435 modules transformés.
- Le contrôle TypeScript global signale sept erreurs `responsivePriority` dans `resources/js/pages/admin/memberships.tsx` (lignes 185 à 197 lors du contrôle). Aucune erreur signalée pour le nouvel accueil ; la vérification globale reste à résoudre pour la page d'adhésions.
- Aucune nouvelle dépendance ni modification des données métier.

### Test manuel demandé

1. Parcourir l'accueil sur ordinateur et téléphone, vérifier titres, lisibilité, terrain et cartes.
2. Cliquer les trois valeurs du club, puis tester Pause/Reprendre.
3. Vérifier les accès à l'espace personnel (ou à l'inscription/connexion hors session).
4. Confirmer l'habillage ou indiquer les ajustements souhaités avant de poursuivre, conformément à la règle de validation manuelle du club.

Contrôle complémentaire : ESLint sur le nouvel accueil réussi. Aperçu enregistré dans docs/captures/accueil-immersif.jpg.

## Ajustement — Raccourci clair/sombre dans la barre supérieure (15 octobre 2026)

**État : implémenté, en attente de vérification manuelle du club.**

### Plan

1. Repérer la barre supérieure commune à l'espace membre et à l'administration.
2. Ajouter une commande près du profil pour passer directement du thème clair au thème sombre et inversement.
3. Reprendre le réglage mémorisé et le thème système, puis vérifier l'accessibilité, les deux thèmes et la compilation.
4. Faire vérifier le bouton par le club avant de clore cet ajustement.

### Travail effectué

- Un bouton icône soleil/lune est ajouté à côté du profil dans `AppSidebarHeader`, donc disponible sur les pages connectées.
- Un clic applique immédiatement l'autre thème et enregistre la préférence via le réglage existant. Si le thème « Système » est actif, l'icône et le sens du basculement suivent le thème réellement affiché.
- Le contrôle possède un libellé accessible et un style adapté aux thèmes clair et sombre.
- La page Paramètres > Apparence conserve ses choix Clair, Sombre et Système.

### Vérifications

- `npm run build` : réussi, 2 435 modules transformés.
- ESLint ciblé sur `app-sidebar-header.tsx` : réussi.
- `npx tsc --noEmit --pretty false` : réussi.
- Dans le navigateur sur `/settings/profile`, l'arbre d'accessibilité confirme le bouton dans la barre supérieure, à côté du lien de profil. Le libellé annonce correctement « Activer le mode clair » lorsque le thème sombre est actif.
- Le bouton n'a pas encore été activé pendant le contrôle ; le basculement visuel et le rendu mobile restent à confirmer par le club.

### Test manuel demandé

1. Dans la barre supérieure, cliquer sur l'icône soleil/lune et vérifier que toute l'interface bascule immédiatement.
2. Recliquer pour revenir au thème précédent, puis changer de page et vérifier que le choix est conservé.
3. Vérifier sur mobile que l'icône reste visible à côté de l'avatar et peut être activée facilement.

**Validation de cet ajustement : en attente du club.**

## Ajustement niveau 3 — Notifications par e-mail d'adhésion (15 octobre 2026)

**État : implémenté et couvert par tests ; essai de livraison en boîte réelle à effectuer après configuration SMTP. Le niveau 3 reste en attente de validation manuelle.**

### Plan

1. Repérer les transitions enregistrées lors d'une nouvelle demande, d'une approbation et d'un refus.
2. Avertir les administrateurs et responsables qui ont un e-mail quand une demande est déposée ou redéposée.
3. Avertir le membre qui a un e-mail après approbation ou refus ; inclure le motif en cas de refus.
4. Ignorer les destinataires sans adresse et empêcher une panne mail d'annuler l'opération d'adhésion.
5. Tester les destinataires et contenus avec le faux transport Laravel, puis demander un essai manuel du mailer SMTP configuré.

### Travail réalisé

- Deux notifications Laravel envoient les nouveaux e-mails : `MembershipRequestSubmitted` et `MembershipDecisionNotification`.
- À chaque création ou nouvelle soumission, les rôles Administrateur et Responsable sont ciblés s'ils ont un e-mail non vide. Les autres rôles ne sont pas notifiés.
- À l'approbation ou au refus, le membre est notifié s'il a une adresse ; le message de refus contient le motif.
- Les messages partent après la transaction métier. Une erreur du transport est consignée dans les journaux et ne rétablit pas une demande déjà confirmée ou refusée.
- Les notifications sont synchrones et ne nécessitent pas de worker de file d'attente.
- Le `.env.example` et le README précisent que `MAIL_MAILER=log` écrit le courriel dans `app/storage/logs/laravel.log`. La livraison réelle nécessite la configuration SMTP dans le `.env` local, jamais versionné.
- La décision est également consignée dans `docs/DECISIONS.md` et le plan du niveau 3 dans `docs/PLAN.md`.

### Vérifications

- PHPUnit sur le parcours d'adhésion : 6 tests réussis, 70 assertions, avec le transport notification simulé. Cela vérifie les destinataires à adresse présente/absente, les deux rôles d'administration, l'approbation, le motif du refus et le comportement d'un membre sans e-mail.
- PHP lint : réussi pour les deux contrôleurs, les deux notifications et le test.
- Le lanceur PHPUnit standard ne peut pas lire `vendor/autoload.php` selon `is_readable()` sur ce poste, bien que PHP puisse l'inclure. Le test a réussi en chargeant Composer avec `auto_prepend_file`, sans lire `phpunit.xml`, et en imposant SQLite mémoire pour éviter toute écriture MySQL.
- Aucun message n'a été expédié vers une boîte réelle pendant les tests.

### Test manuel demandé au club

1. Pour tester la réception réelle, définir les paramètres SMTP de votre fournisseur dans `app/.env` (serveur, port, chiffrement, identifiant, mot de passe et expéditeur), puis lancer `php artisan config:clear`. Ne pas partager ni versionner ces secrets.
2. Avec `MAIL_MAILER=log`, vérifier le contenu généré dans `app/storage/logs/laravel.log` ; avec SMTP, vérifier la boîte de réception et les courriers indésirables.
3. Déposer une demande depuis un compte membre et vérifier qu'elle avertit chaque administrateur/responsable ayant une adresse, mais aucun destinataire sans adresse.
4. Confirmer une demande de test et vérifier le courriel reçu par le membre ; tester aussi un refus et vérifier le motif dans son message.
5. Communiquer « niveau 3 validé » si le parcours d'adhésion et les notifications conviennent, ou préciser à quelle étape le comportement diffère.

**Validation du niveau 3 : toujours en attente du club.**

## Validation manuelle du niveau 3 et préparation du niveau 4 (15 octobre 2026)

**État : niveau 3 validé par le club ; niveau 4 reporté à la demande du club.**

### Validation du club

- Après la remise à zéro ciblée de son adhésion, le club a refait le test et indiqué que « tout est bon ».
- Le parcours d'adhésion est accepté ; cela clôt le niveau 3 conformément au protocole de progression.
- La réception des e-mails par une boîte réelle n'a pas été rapportée comme testée. Le code et les tests avec transport simulé sont documentés dans la section « Notifications par e-mail d'adhésion » ; la livraison SMTP reste à contrôler lorsqu'un SMTP sera configuré.

### Prochaine étape : niveau 4 — Cotisations

Le plan préparatoire figure dans `docs/PLAN.md`. Le club indique qu'il ne lance pas encore le niveau 4 et fournira les règles métier lorsqu'il décidera de le démarrer : montant/période, échéance et délai de grâce, traitement des paiements partiels, et obligations après suspension ou départ.

**État du niveau 4 : en attente de lancement par le club ; aucune implémentation commencée.**

## Préparation de la publication GitHub (15 octobre 2026)

**État : commit local prêt ; dépôt distant et push en attente de la connexion GitHub.**

- Le club a demandé la création/publication d'un dépôt public nommé `amis-de-foot`.
- Le dépôt local n'avait pas de commit ni de remote ; un premier commit a été créé sur `main` (`fcf7e46`).
- Avant le commit, le nom du compte de test a été retiré du journal. Les fichiers `.env`, journaux, `vendor`, `node_modules` et base locale sont ignorés et absents du commit.
- Aucun dépôt GitHub n'a encore été créé et aucun code n'a encore été envoyé à GitHub. Il faut connecter le compte GitHub pour créer le dépôt et pousser `main`.
