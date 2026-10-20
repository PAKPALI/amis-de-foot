# Décisions à confirmer avec le club

Ces sujets viennent du cahier des charges. Les lignes marquées « Décidé » ont été confirmées par le club ; les autres attendent la décision indiquée avant le niveau concerné.

| Sujet | Décision attendue | Avant niveau |
| --- | --- | --- |
| Adhésion | **Décidé :** 1 000 FCFA payés une seule fois. Un administrateur confirme le règlement et approuve le membre sur la base de sa vérification. Cette confirmation est historisée ; le paiement reste distinct des cotisations. | 3 |
| Notifications d'adhésion | **Décidé :** les administrateurs et responsables ayant un e-mail sont avertis d'une nouvelle demande ; le membre ayant un e-mail est averti de l'approbation ou du refus, avec le motif en cas de refus. Sans adresse, aucune notification n'est envoyée. | 3 |
| Calendrier | **Décidé :** cotisation de 1 000 FCFA par mois. La première cotisation est due le mois suivant l'approbation de l'adhésion. Le membre choisit le nombre de mois dans un formulaire ; le système affiche les mois consécutifs et le total avant validation. Les périodes sont créées uniquement lors de cette validation. Aucune échéance, aucun délai de grâce et aucune pénalité automatique. Une période impayée reste affichée comme impayée. | 4 |
| Cotisations partielles | **Décidé :** paiement partiel refusé. Un paiement peut couvrir une ou plusieurs périodes mensuelles du même membre ; son montant doit être exactement la somme des mois sélectionnés (par exemple février + mars = 2 000 FCFA). | 4 |
| Suspension et départ | **Décidé :** le compte est désactivé dès la suspension ou le départ et ne peut plus se connecter. Les règles de conservation des dettes antérieures ne sont pas nécessaires au niveau 4, car aucune échéance ni pénalité n'est appliquée. | 4 |
| Accès | **Décidé :** connexion par téléphone ou par e-mail ; au moins un contact doit être renseigné | 2 |
| Récupération | **Décidé :** pour un compte sans e-mail, un administrateur réinitialise l'accès ; l'utilisateur change le mot de passe temporaire à sa prochaine connexion | 2 |
| Administration | **Décidé :** seul le responsable habilité attribue ou retire les rôles ; le premier responsable est désigné par une commande d'installation | 2 |
| Contrôle des opérations personnelles des admins | **Décidé :** seul le responsable saisit et approuve les dépenses ; un administrateur ne peut pas les enregistrer ou les approuver lui-même. | 5 |
| Caisse | **Décidé :** une caisse unique en FCFA. Le responsable est seul habilité à saisir et approuver les dépenses. Le solde initial sera enregistré comme mouvement d'ouverture à la mise en service ; le montant reste à renseigner. | 5 |
| Solde insuffisant et corrections | **Décidé :** une dépense qui ferait passer la caisse sous zéro est refusée. Une opération validée se corrige par contre-écriture conservée dans l'historique, jamais par modification ou suppression silencieuse. | 5 |
| Reprise | Historiques fiables, date et solde initial | 8 |
| Paiement en ligne | Prestataire, canaux, frais, reversements et remboursements | 9 |
| Exploitation | Fuseau du club, hébergement, domaine, sauvegarde et conservation | 8 |
| Statistiques | **Décidé :** demandes d'adhésion, cotisations réglées/à régler, recettes, dépenses et solde de caisse. Les tableaux doivent permettre un intervalle de dates libre et des filtres par membre, statut et catégorie financière. | 6 |
| Accès aux statistiques | **Décidé :** administrateurs et responsables voient les chiffres globaux ; chaque membre voit ses propres statistiques seulement. Les exports suivent les mêmes droits. | 6 |
| Exports | **Décidé :** formats Excel et PDF. | 6 |
| Site public et blog | **Décidé :** accueil, présentation du club, actualités et contact sont publics. Les administrateurs et responsables créent, modifient, publient ou retirent les articles. Chaque article accepte jusqu'à trois photos facultatives, affichées en slider ; la première sert de couverture. Seuls les articles publiés sont publics. En attendant les coordonnées officielles, la page contact renvoie vers l'inscription, la connexion et l'espace membre sans publier de donnée personnelle. | 7 |

## Précisions de calcul retenues au niveau 6

- « À régler » désigne les mois depuis le mois qui suit l'adhésion approuvée jusqu'au mois courant, sans échéance ni pénalité. Les mois futurs ne sont pas considérés impayés. Les comptes désactivés ne génèrent plus de nouveaux mois à régler dans le rapport ; l'historique des périodes enregistrées reste visible.
- Le filtre de dates prend la date de création pour les demandes, le mois concerné pour les cotisations et la date du mouvement pour la caisse. Le solde de caisse reste le solde courant global même si un filtre est appliqué.
- Les chiffres de caisse excluent le solde d'ouverture et les reçus historiques qui n'affectent pas le solde. Une correction remplace l'opération d'origine dans les totaux, tout en conservant les deux écritures dans le journal d'audit.

