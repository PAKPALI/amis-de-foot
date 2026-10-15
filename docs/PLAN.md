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
| 4 | Cotisations, périodes, paiement manuel et reçus | Affectations, doublons et reçus vérifiés |
| 5 | Retards, caisse et corrections | Soldes, retards et contre-écritures vérifiés |
| 6 | Statistiques, tableaux et exports | Filtres et totaux contrôlés |
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

## Niveau 4 — Cotisations : plan de préparation

**État : en attente de lancement à la demande du club.** Le club donnera les règles métier nécessaires à ce moment-là ; aucune implémentation ne commence avant cette décision.

Objectif : gérer les cotisations périodiques, leur paiement manuel et les reçus, avec un historique vérifiable.

1. Confirmer le montant de la cotisation et la période concernée (mensuelle, autre fréquence ou montant variable).
2. Fixer la première période due, le jour d'échéance et le délai de grâce.
3. Décider comment affecter un paiement partiel : le refuser ou le conserver comme crédit à affecter.
4. Définir les obligations et la date d'effet lorsqu'un membre est suspendu ou quitte le club.
5. Concevoir les écrans membre et administration pour voir les périodes dues, enregistrer/contrôler un paiement et produire un reçu.
6. Définir les règles empêchant les doublons, les corrections auditables et les droits d'accès.
7. Ajouter migrations, règles métier et tests couvrant les échéances, paiements, affectations, reçus et autorisations.
8. Appliquer le système UI/UX commun et contrôler clavier, mobile, tablette et ordinateur.
9. Mettre à jour `SUIVI.md`, vérifier automatiquement, fournir le protocole manuel et attendre la validation du club.

Les décisions des étapes 1 à 4 doivent être consignées dans `DECISIONS.md` avant de commencer l'implémentation dépendante.

Les règles métier marquées « à confirmer » dans `DECISIONS.md` doivent être décidées avant le niveau qui en dépend. Le calendrier et les priorités peuvent être révisés avec le club ; chaque changement est consigné dans `SUIVI.md`.
