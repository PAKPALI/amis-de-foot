# Plan de réalisation

## Règle de progression

Pour chaque niveau : planifier, implémenter, vérifier automatiquement, mettre à jour la documentation, fournir un rapport et un protocole de test manuel. Le niveau suivant ne commence qu'après validation explicite du test manuel par le club. Les corrections du niveau en cours restent possibles avant cette validation.

Le système visuel de `DESIGN_SYSTEM.md` s'applique à tous les niveaux. Chaque écran est contrôlé au clavier et aux largeurs mobile, tablette et ordinateur avant sa remise au club.

## Niveaux

| Niveau | Objectif | Critère de sortie manuel |
| --- | --- | --- |
| 1 | Installer Laravel 12, React/Inertia, SweetAlert2 et DataTables responsive ; documenter et lancer le socle | **Validé par le club le 15 octobre 2026.** |
| 2 | Valider les parcours et créer comptes, authentification, rôles et espaces | **Validé par le club le 15 octobre 2026.** |
| 3 | Adhésions et approbation | **Validé par le club le 15 octobre 2026** |
| 4 | Cotisations, périodes, paiement manuel et reçus | **Validé par le club le 20 octobre 2026.** |
| 5 | Caisse et corrections financières | **Validé par le club le 20 octobre 2026.** |
| 6 | Statistiques, tableaux et exports | **Validé par le club le 20 octobre 2026.** |
| 7 | Site public et blog | Publication et navigation mobile vérifiées |
| 8 | Reprise des données, sauvegarde/restauration et recette | Rapprochement et restauration validés |
| 9 | Paiement en ligne, après choix du prestataire | Tests du prestataire et rapprochement validés |

## Niveau 3 — Adhésion : plan détaillé

**État : implémenté et validé par le club le 15 octobre 2026.** Le club a fixé l'adhésion à 1 000 FCFA une seule fois ; un administrateur confirme le règlement et approuve le membre après vérification.

1. Fixer le montant en FCFA, le caractère unique ou renouvelable et les dérogations possibles.
2. Définir les états d'une demande (à instruire, acceptée, refusée) et les règles de modification ou de nouvelle demande.
3. Concevoir le parcours membre pour déposer et suivre une demande, avec messages de validation clairs.
4. Concevoir l'écran d'administration pour examiner, accepter ou refuser une demande et conserver l'auteur, la date et le motif.
5. Appliquer les contrôles d'accès côté serveur et empêcher les doublons selon les règles validées.
6. Ajouter les migrations, règles métier et tests d'accès, de transitions d'état et de doublons.
7. Adapter les écrans au système UI/UX commun et vérifier téléphone, tablette, ordinateur et clavier.
8. Notifier par e-mail les administrateurs/responsables à la création et le membre après la décision, lorsque les destinataires ont une adresse.
9. Mettre à jour `SUIVI.md`, lancer les contrôles, fournir le rapport et faire valider le parcours manuellement. Validation reçue le 15 octobre 2026 ; le niveau 4 peut être préparé après décision de ses règles métier.

## Niveau 4 — Cotisations

**État : implémenté et validé manuellement par le club le 20 octobre 2026.**

Objectif : gérer les cotisations périodiques, leur paiement manuel et les reçus, avec un historique vérifiable.

1. Calculer les mois cotisables à partir du mois suivant l'approbation de l'adhésion, sans créer de périodes à l'avance. Les mois non réglés n'ont pas d'échéance ni de pénalité.
2. Ajouter les paiements groupés et reçus avec auteur et dates. À validation, créer les périodes choisies et bloquer tout doublon ou paiement partiel.
3. Créer l'écran membre pour choisir le nombre de mois, prévisualiser les mois ordonnés et le total, puis signaler le paiement ; afficher l'historique et les reçus consultables/imprimables.
4. Créer l'écran administration pour confirmer un signalement ou choisir directement un membre et un nombre de mois, prévisualiser le total, enregistrer le paiement et produire son reçu.
5. Ajouter les statuts de compte « suspendu » et « parti », les actions réservées à l'administration et un middleware qui bloque immédiatement la connexion de ces comptes. Aucune nouvelle cotisation ne peut être créée après la désactivation.
6. Définir les règles empêchant les doublons, les corrections auditables et les droits d'accès.
7. Ajouter migrations, règles métier et tests couvrant le calcul des mois, paiements, reçus, désactivation et autorisations.
8. Appliquer le système UI/UX commun et contrôler clavier, mobile, tablette et ordinateur.
9. Mettre à jour `SUIVI.md`, vérifier automatiquement, fournir le protocole manuel et attendre la validation du club.

Les décisions des étapes 1 à 4 sont consignées dans `DECISIONS.md`. Le membre choisit le nombre de mois à cotiser ; le système prévisualise les mois et le montant. Les périodes ne sont créées qu'à la validation. Le reçu détaillé est consultable et imprimable. Le club a confirmé que les parcours fonctionnent.

## Niveau 5 — Caisse et corrections : plan réalisé

**État : implémenté et validé manuellement par le club le 20 octobre 2026.** Le niveau 4 ne fixe pas d'échéance : les cotisations non réglées restent des soldes dus sans retard ni pénalité automatique.

Objectif : suivre les entrées et sorties de fonds du club avec un solde explicable, des autorisations claires et un historique de corrections.

1. Mettre en place une caisse unique en FCFA et un mouvement d'ouverture permettant au responsable de saisir le solde réellement présent au démarrage et sa date de référence.
2. Réserver au responsable la saisie et l'approbation des dépenses ; les administrateurs ne peuvent pas les enregistrer ou les approuver eux-mêmes. Cette règle s'applique aussi aux dépenses concernant un administrateur.
3. Enregistrer les entrées et sorties avec montant, date, motif, auteur et justificatif éventuel. Intégrer les règlements d'adhésion et de cotisation sans double comptage.
4. Refuser toute dépense qui rendrait le solde négatif.
5. Conserver chaque mouvement validé. Toute correction passe par une contre-écriture et une nouvelle écriture, toutes deux avec auteur, date et motif.
6. Créer les écrans de caisse pour consulter le solde, filtrer les mouvements, enregistrer les opérations permises et consulter les justificatifs.
7. Vérifier les droits, le calcul du solde, les mouvements liés aux adhésions/cotisations, le refus de solde insuffisant et l'historique des corrections.
8. Mettre à jour `SUIVI.md`, exécuter les vérifications, fournir un test manuel et attendre sa validation avant le niveau suivant.

Le montant de caisse à l'ouverture reste à renseigner par le responsable lors de la mise en service. Les règlements historiques sont conservés pour consultation, sans les additionner au solde de départ faute d'historique des dépenses passées. Le club a validé le plan manuel du niveau 5 le 20 octobre 2026.

## Niveau 6 — Statistiques, tableaux et exports : mise en œuvre

**État : implémenté et validé manuellement par le club le 20 octobre 2026.** Le club a confirmé « c'est bon » après les vérifications en navigateur du calendrier et des filtres.

1. Créer un tableau de bord global pour administrateurs et responsables avec demandes d'adhésion, cotisations réglées/à régler, recettes, dépenses et solde actuel de la caisse.
2. Ajouter un intervalle de dates libre et des filtres par membre, statut et catégorie financière. Les sommes de recettes et dépenses suivent l'intervalle ; le solde actuel reste clairement identifié comme le solde à ce jour.
3. Créer des statistiques personnelles pour chaque membre : état de son adhésion, nombre et montant de cotisations réglées/à régler et accès à ses reçus. Le membre ne peut consulter que ses propres données.
4. Ajouter des tableaux responsive avec recherche, tri et pagination, ainsi que des exports Excel et PDF qui reprennent les filtres et le périmètre de données autorisé pour le rôle connecté.
5. Calculer les totaux depuis les demandes, périodes de cotisation et le journal de caisse, sans modifier les écritures ni compter deux fois les paiements liés.
6. Appliquer les droits d'accès côté serveur : vue globale et exports globaux pour administrateurs/responsables ; vue et exports personnels uniquement pour chaque membre.
7. Contrôler les autorisations, les totaux sur plusieurs intervalles, les filtres, les exports Excel/PDF et les vues ordinateur, tablette, mobile et clavier.
8. Mettre à jour `SUIVI.md`, effectuer les vérifications automatiques, fournir un protocole de test manuel et attendre sa validation avant le niveau suivant.

Le club a choisi les indicateurs du tableau de bord, les dates libres, les filtres par membre/statut/catégorie, les exports Excel/PDF et l'accès global pour administrateurs/responsables avec une vue personnelle pour les membres. Les exports des membres seront limités à leurs propres données.

Les règles métier marquées « à confirmer » dans `DECISIONS.md` doivent être décidées avant le niveau qui en dépend. Le calendrier et les priorités peuvent être révisés avec le club ; chaque changement est consigné dans `SUIVI.md`.

## Niveau 7 — Site public et blog : mise en œuvre

**État : plan validé et implémentation terminée le 20 octobre 2026 ; test manuel du club attendu.**

Objectif : présenter le club aux visiteurs sans connexion et publier ses actualités, tout en conservant les espaces privés et les permissions existantes.

1. Définir les pages publiques : accueil, présentation du club, informations d'adhésion, actualités/blog, contact et connexion/inscription.
2. Définir le contenu à afficher : nom, histoire, lieu et horaires, contacts, photos/logo, tarifs et consignes d'adhésion. Ne publier aucune donnée personnelle de membre sans validation.
3. Créer les articles d'actualité : titre, résumé, contenu, image éventuelle, auteur, date, brouillon/publié et URL lisible ; seules les publications publiées sont visibles publiquement.
4. Réserver la création, la modification et la publication des articles aux rôles choisis par le club, avec contrôle des droits côté serveur.
5. Relier les appels à l'action publics aux formulaires existants d'inscription et de connexion, sans modifier les règles d'adhésion ni les frais.
6. Appliquer l'identité visuelle du club et assurer l'affichage responsive, l'accessibilité clavier, les métadonnées de partage et les titres de page.
7. Ajouter migration, validations et autorisations pour les articles, leurs statuts de publication, l'accès public et les redirections d'authentification.
8. Vérifier la navigation visiteur et la gestion d'articles sur mobile, tablette et ordinateur ; mettre à jour la documentation, fournir le rapport et le test manuel.

Le club a validé le plan puis demandé l'implémentation. Les administrateurs et responsables peuvent gérer les publications. Les coordonnées officielles n'ayant pas été fournies, la page contact oriente vers l'inscription, la connexion et l'espace personnel sans inventer de contact. Le niveau 8 reste bloqué jusqu'à la validation manuelle du niveau 7.

