# Niveau 8 — Fiche de reprise des données

**Statut : préparation du plan uniquement. Aucun import de données réelles n'a été exécuté.**

Cette fiche sert à recenser les sources et à définir le rapprochement avant de concevoir ou lancer un import. Ne pas ajouter les fichiers sources, noms, numéros de téléphone, mots de passe, justificatifs ou secrets dans Git ni dans cette documentation. Les fichiers contenant des données personnelles seront transmis et conservés par un canal privé approuvé par le club.

## 1. Inventaire des sources à compléter

| Source | Format/emplacement privé | Période couverte | Responsable de la source | Dernière mise à jour | Fiabilité/limites | À reprendre ? |
| --- | --- | --- | --- | --- | --- | --- |
| Liste des membres | À renseigner | À renseigner | À renseigner | À renseigner | À renseigner | À décider |
| Registre des adhésions | À renseigner | À renseigner | À renseigner | À renseigner | À renseigner | À décider |
| Registre des cotisations | À renseigner | À renseigner | À renseigner | À renseigner | À renseigner | À décider |
| Recettes et dépenses | À renseigner | À renseigner | À renseigner | À renseigner | À renseigner | À décider |
| Justificatifs/reçus | À renseigner | À renseigner | À renseigner | À renseigner | À renseigner | À décider |
| Autre application/base | À renseigner | À renseigner | À renseigner | À renseigner | À renseigner | À décider |

Ne fournir au départ qu'une copie anonymisée si des colonnes ou règles de conversion doivent être étudiées. Les fichiers originaux doivent rester inchangés et conservés en lecture seule.

## 2. Périmètre métier à décider

- Membres : comptes actifs seulement ou aussi suspendus/partis ; quels contacts sont à jour ; identifiant unique de rapprochement.
- Adhésions : toutes les demandes ou seulement les approuvées ; preuve et date de paiement ; cas de dispense/validation administrative.
- Cotisations : années/mois concernés ; montants ; paiements confirmés versus déclarations en attente ; reçus déjà émis.
- Caisse : recettes et dépenses à reprendre ou seulement le solde d'ouverture ; date exacte du solde ; traitement des écritures corrigées et doublons.
- Fichiers : justificatifs à rattacher, format et date ; aucune donnée sans propriétaire ne sera exposée sur le site public.
- Archives : données à garder hors application pour consultation historique, sans import opérationnel.

| Question | Décision du club |
| --- | --- |
| Sources disponibles et périodes couvertes | À renseigner |
| Entités à importer | À renseigner |
| Profondeur d'historique souhaitée | À renseigner |
| Historique fiable et preuves disponibles ? | À renseigner |
| Date de coupure | À renseigner |
| Responsable qui certifie le rapprochement | À renseigner |
| Solde réel de caisse à la coupure (FCFA) | À renseigner |
| Qui approuve l'essai à blanc et les écarts ? | À renseigner |

## 3. Rapprochement et import à blanc

Avant tout import, établir une correspondance champ source → champ application, une règle de normalisation, une clé de rapprochement et les règles d'arbitrage des doublons. Produire un rapport de prévisualisation sans écrire dans la base avec :

- lignes lues, acceptées, rejetées et en doublon, par fichier et entité ;
- champs obligatoires manquants et valeurs hors format ;
- personnes susceptibles d'être le même membre ;
- totaux d'adhésions et cotisations par période ;
- total des recettes/dépenses et calcul du solde attendu, séparant le solde d'ouverture ;
- fichiers sans correspondance et opérations sans preuve suffisante.

Le responsable confirme les règles et résout les écarts. Chaque import doit être reproductible et idempotent (rejouer le même lot ne crée pas de doublons). Le journal garde l'identifiant du lot et la référence non sensible de la source ; il ne copie pas de secret.

## 4. Sauvegarde et restauration — critères de recette

À convenir avec le club avant automatisation :

| Paramètre | Décision |
| --- | --- |
| Fréquence des sauvegardes | À confirmer |
| Durée de conservation | À confirmer |
| Emplacement chiffré séparé de l'hébergement | À confirmer |
| Personnes autorisées à lire/restaurer | À confirmer |
| Responsable de surveillance et de restauration | À confirmer |
| Durée maximale acceptable pour restaurer | À confirmer |

Chaque sauvegarde planifiée comprend une exportation cohérente de MySQL et les fichiers téléversés indispensables. Les clés et secrets nécessaires à une reprise sont protégés séparément et ne sont jamais versionnés. La sauvegarde avant import et mise à jour doit être identifiée et horodatée.

Une restauration de recette se fait dans une base et un répertoire isolés, sans écraser le staging actif ni une production. La recette consigne l'origine de l'archive, les empreintes/intégrité disponibles, l'heure et la durée, les vérifications fonctionnelles, les nombres d'enregistrements et les écarts. La restauration n'est validée qu'après connexion, lecture des fichiers et rapprochement de données contrôlés.

## 5. Ordre des opérations proposé

1. Valider le plan du niveau 8 et compléter les décisions de périmètre et de sauvegarde.
2. Recevoir une copie source anonymisée pour définir et faire approuver le mapping.
3. Implémenter un outil contrôlé de prévisualisation/import et son journal d'exécution, sans lancer sur données réelles.
4. Vérifier une sauvegarde/restauration isolée et faire un import à blanc sur staging.
5. Comparer les totaux et échantillons avec les sources ; résoudre et faire approuver tous les écarts.
6. Répéter l'import sur une base staging préparée avec une sauvegarde préalable ; recette manuelle des parcours membre, finance, rapports, rôles et responsive.
7. Remettre le rapport et attendre l'approbation explicite du club. Une future bascule de production demandera une validation distincte, une fenêtre de gel et un plan de retour arrière.

## 6. Résultat et validation attendus

Le niveau 8 peut être déclaré validé lorsque le club a approuvé le périmètre, le rapprochement sans écart inexpliqué, la recette fonctionnelle et une restauration réellement exécutée en environnement isolé. Jusqu'à cette validation, le staging existant reste la cible de recette et aucune mise en production ou import réel n'est présumé.
