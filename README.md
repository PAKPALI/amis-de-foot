# Amis de foot

Application de gestion du club, développée avec Laravel 12, React et Inertia.js.

Le périmètre fonctionnel provient du cahier des charges fourni par le club. Le travail avance par niveaux : chaque niveau donne lieu à un rapport, à un test manuel par le club et à une validation explicite avant le suivant.

## Suivi

- [Plan et règles de progression](docs/PLAN.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Système UI/UX](docs/DESIGN_SYSTEM.md)
- [Journal des niveaux](docs/SUIVI.md)
- [Décisions à confirmer](docs/DECISIONS.md)
- [Procédure staging o2switch](docs/O2SWITCH_STAGING.md)

## État actuel

Les niveaux 1, 2 et 3 sont validés par le club. Le niveau 3 couvre les demandes d'adhésion, leur approbation ou refus, l'historique et les notifications par e-mail lorsque les destinataires ont une adresse. Le niveau 4 (cotisations) est reporté à la demande du club ; ses règles métier seront définies lors de son lancement. Le code applicatif est dans [`app/`](app/).

## Démarrage local

Prérequis : PHP 8.3, Composer, Node.js et MySQL. Créer une base `amis_de_foot` en `utf8mb4`, copier `app/.env.example` vers `app/.env`, puis ajuster les identifiants MySQL locaux. Ne jamais versionner `app/.env`.

Ouvrir le dossier `C:\ADF` dans VS Code. Dans un terminal PowerShell, faire la préparation initiale une seule fois :

```powershell
cd C:\ADF\app
composer install
npm install
php artisan key:generate
php artisan migrate
```

Si le terminal VS Code est **Git Bash** (invite telle que `MINGW64 /c/ADF`), les chemins Windows s'écrivent avec des slashs. Depuis la racine `/c/ADF`, entrer dans le dossier Laravel avec :

```bash
cd /c/ADF/app
```

Ou, si le terminal est déjà dans `/c/ADF` :

```bash
cd app
```

Vérifier que MySQL est démarré dans Laragon et que les identifiants de `app/.env` correspondent à votre installation. La base `amis_de_foot` doit exister.

Pour chaque session de travail, ouvrir deux terminaux intégrés VS Code dans `C:\ADF\app` :

Terminal 1 — serveur Laravel :

```powershell
cd C:\ADF\app
php artisan serve --host=127.0.0.1 --port=7777
```

Terminal 2 — ressources React/Vite :

```powershell
cd C:\ADF\app
npm run dev
```

Dans Git Bash, les commandes équivalentes sont `cd /c/ADF/app` puis `php artisan serve --host=127.0.0.1 --port=7777` dans le premier terminal, et `cd /c/ADF/app` puis `npm run dev` dans le second. Confirmer le dossier courant avec `pwd`; `npm run dev` doit être lancé dans `/c/ADF/app`, où se trouve `package.json`.

Garder les deux terminaux ouverts, puis ouvrir `http://127.0.0.1:7777/` dans le navigateur. Arrêter chaque serveur avec `Ctrl+C` dans son terminal.

Pour un lancement sans serveur Vite, exécuter d'abord `npm run build`, puis démarrer seulement Laravel avec `php artisan serve --host=127.0.0.1 --port=7777`.

Sur le poste actuel, les dépendances, la base MySQL et les migrations des niveaux 1 à 3 sont déjà en place. Le transport de courriel `log` est utilisé en développement : les messages apparaissent dans `app/storage/logs/laravel.log`. Pour une livraison dans de vraies boîtes, renseigner les paramètres SMTP dans `app/.env` sans les versionner, puis exécuter `php artisan config:clear`. Le protocole d'essai du niveau 3 est dans [le journal de suivi](docs/SUIVI.md).
