# Déploiement staging sur o2switch

**État : déploiement staging et recette manuelle validés par le club le 16 octobre 2026.**

## Cible

- Héberger une copie de test sur `staging.<domaine-du-club>`.
- Garder le code hors du dossier public et faire pointer la racine web vers `app/public`.
- Utiliser une base MySQL vide, distincte de la base locale et de toute future base de production.
- Garder le staging protégé par mot de passe cPanel jusqu'à sa validation.

Le dépôt source est public à l'adresse `https://github.com/PAKPALI/amis-de-foot.git`, branche `main`.

## Prérequis à fournir ou vérifier

1. Le domaine parent doit être rattaché à l'hébergement o2switch et pointer vers ses serveurs DNS.
2. Confirmer le nom complet souhaité, par exemple `staging.exemple.com`.
3. Avoir accès au cPanel et activer l'accès SSH pour l'adresse IP qui se connectera. Ne pas transmettre le mot de passe cPanel dans le chat.
4. Créer dans cPanel une base MySQL et un utilisateur avec tous les droits sur cette base ; garder les identifiants dans le `.env` du serveur uniquement.

## Étapes d'installation

### 1. Créer le sous-domaine et son répertoire

Dans cPanel > Sous-domaines, ajouter `staging` sous le domaine parent. Créer ou choisir une racine des documents située sur le dossier `public` de Laravel :

`/home/<utilisateur_cpanel>/apps/amis-de-foot-staging/app/public`

Le dépôt complet sera cloné dans `/home/<utilisateur_cpanel>/apps/amis-de-foot-staging`; seul son sous-dossier `app/public` sera exposé par Apache. Laravel demande que le site soit servi depuis son dossier `public`, car servir la racine du projet pourrait exposer des fichiers privés.

Si cPanel ne permet pas de choisir cette racine, ne pas publier la racine Laravel dans `public_html` telle quelle : faire vérifier la configuration de la racine web avec le support o2switch avant de continuer.

### 2. Activer le HTTPS et protéger le staging

- Dans cPanel > Let's Encrypt SSL, générer le certificat du sous-domaine après propagation DNS.
- Dans cPanel > Confidentialité du répertoire, protéger le dossier public du sous-domaine par un utilisateur/mot de passe de test.
- Garder cette protection pendant la recette pour éviter l'indexation publique et les inscriptions non souhaitées.

### 3. Se connecter en SSH et cloner le dépôt

Autoriser l'adresse IP dans l'outil Autorisation SSH de cPanel, puis ouvrir Terminal cPanel ou se connecter en SSH.

```bash
mkdir -p "$HOME/apps"
cd "$HOME/apps"
git clone --branch main --depth 1 https://github.com/PAKPALI/amis-de-foot.git amis-de-foot-staging
cd "$HOME/apps/amis-de-foot-staging/app"
```

### 4. Vérifier PHP et installer Composer

Dans cPanel > Sélectionner une version de PHP, choisir PHP 8.3 et activer les extensions demandées par Composer. Le projet requiert `php ^8.2`; après l'installation, contrôler les prérequis avec :

```bash
php -v
composer --version
```

Installer les dépendances PHP de production :

```bash
composer install --no-dev --optimize-autoloader
composer check-platform-reqs --no-dev
```

Le club a confirmé le 15 octobre 2026 que l'installation Composer sans dépendances de développement a réussi sur le serveur. La version PHP affichée par le terminal reste à confirmer.

### 5. Préparer React et les ressources Vite

L'application est servie par Laravel/PHP ; Node.js sert uniquement à compiler les ressources React. Pour ce projet frontend, l'outil « Setup NodeJS App » n'est pas nécessaire. o2switch indique que Node/npm sont installés mais doivent être ajoutés au `PATH`. Le chemin Node 24 actuellement documenté est :

```bash
export PATH="$PATH:/opt/alt/alt-nodejs24/root/usr/bin/"
node -v
npm -v
```

Puis, depuis le dossier Laravel `app` :

```bash
cd ~/adf/amis-de-foot/app
npm ci
npm run build
test -f public/build/manifest.json && echo "Build React/Vite OK"
```

Ne pas lancer `npm run dev` sur l'hébergement.

Le club a confirmé le 15 octobre 2026 que Node `v24.21.0` et npm `11.19.0` fonctionnent après l'ajout du chemin au `PATH`, que `npm ci` a terminé sans vulnérabilité signalée, et que `npm run build` a généré `public/build/manifest.json`. La commande `cd ~/adf/amis-de-foot/app` n'a pas fonctionné car ce chemin n'existe pas sur le serveur ; les commandes suivantes ont été exécutées depuis le dossier `app` déjà ouvert. Confirmer son chemin réel avec `pwd` avant les prochaines commandes.

Avant toute commande `php artisan`, vérifier que le répertoire courant contient bien le fichier `artisan` et `composer.json`. Si la commande répond « Could not open input file: artisan », elle n'a pas modifié Laravel : retrouver le bon chemin avec :

```bash
pwd
ls -la
find "$HOME" -maxdepth 6 -type f -name artisan -print 2>/dev/null
```

Puis se placer manuellement dans le dossier parent du fichier `artisan` trouvé et vérifier :

```bash
cd /chemin/qui/contient/artisan
pwd
ls -l artisan composer.json
php artisan --version
```

Ne lancer `php artisan key:generate` qu'une fois dans la racine Laravel, après avoir créé le `.env` du staging.

Recherche réalisée par le club : un fichier a été trouvé à `/home2/sc4nlba7062/adf/app/artisan`, mais plusieurs projets Laravel existent dans son compte. Ce chemin n'est pas confirmé comme étant le dépôt `PAKPALI/amis-de-foot`. Le dossier `/home2/sc4nlba7062/amf/app` n'a ni `artisan` ni `composer.json`. Avant toute commande Laravel, vérifier le remote Git du dossier candidat et confirmer qu'il correspond au dépôt du club.

Le club a précisé que le dossier `amis-de-foot` cloné a été supprimé après extraction de ses fichiers. Les répertoires extraits ne sont donc pas encore identifiés avec certitude. Pour éviter toute confusion avec les autres applications du compte, le chemin recommandé pour la copie staging est désormais `~/apps/amis-de-foot-staging` : cloner à nouveau le dépôt public à cet emplacement et conserver cette copie comme référence.

```bash
cd ~
mkdir -p apps
git clone --branch main --depth 1 https://github.com/PAKPALI/amis-de-foot.git apps/amis-de-foot-staging
cd ~/apps/amis-de-foot-staging/app
pwd
ls -l artisan composer.json package.json
```

La dernière commande doit afficher les trois fichiers avant de lancer Composer ou Artisan. Si `apps/amis-de-foot-staging` existe déjà, inspecter son contenu au lieu de relancer le clonage.

### 6. Créer le `.env` de staging

Dans le dossier `app` :

```bash
cp .env.example .env
```

Renseigner le `.env` sur le serveur avec les valeurs du staging, notamment :

```dotenv
APP_NAME="Amis de foot - Staging"
APP_ENV=staging
APP_DEBUG=false
APP_URL=https://staging.<domaine-du-club>

DB_CONNECTION=mysql
DB_HOST=<hote_mysql_indique_par_cpanel>
DB_PORT=3306
DB_DATABASE=<base_staging>
DB_USERNAME=<utilisateur_mysql>
DB_PASSWORD=<mot_de_passe_mysql>

MAIL_MAILER=log
SESSION_SECURE_COOKIE=true
```

Garder les secrets uniquement dans ce `.env` non versionné. Utiliser une clé Laravel neuve pour ce serveur ; ne jamais recopier celle du poste local :

```bash
php artisan key:generate
```

### 7. Migrer une base vide et finaliser Laravel

Vérifier que la connexion vise bien la base staging, puis exécuter :

```bash
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan view:cache
```

Ne pas importer la base locale et ne pas lancer `migrate:fresh` ou `db:seed` sur l'hébergement. Le seeder actuel crée un compte de démonstration. Pour désigner le premier responsable, créer un compte de test par l'inscription puis utiliser l'identifiant affiché par la base :

```bash
php artisan amisdefoot:bootstrap-responsable <ID_DU_COMPTE_TEST>
```

Les dossiers `storage` et `bootstrap/cache` doivent être accessibles en écriture par l'utilisateur PHP. Contrôler avec `ls -ld storage bootstrap/cache` ; ajuster les permissions sans donner un accès global en écriture.

### 8. Recette staging

1. Ouvrir `https://staging.<domaine-du-club>` et vérifier la protection par mot de passe et le certificat HTTPS.
2. Vérifier que les ressources CSS et JavaScript chargent sans erreur.
3. Créer un compte de test, désigner le responsable initial, puis tester connexion, rôles et accès interdits.
4. Tester une demande d'adhésion, l'approbation et le refus, avec la base staging uniquement.
5. Vérifier les notifications dans `storage/logs/laravel.log` ; garder `MAIL_MAILER=log` tant qu'un essai d'e-mail réel n'est pas voulu.
6. Faire les tests mobile, tablette et ordinateur, puis transmettre le résultat au club pour validation manuelle.

## Mise à jour ultérieure du staging

Après un commit envoyé sur `main`, depuis le serveur :

```bash
cd "$HOME/apps/amis-de-foot-staging"
git pull --ff-only origin main
cd app
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan view:cache
```

Exécuter la migration avant de rouvrir le staging après une mise à jour. Ce processus est manuel ; aucun déploiement automatique n'est configuré.

## Dépannage — installation Composer avec PHP 8.2

Le premier clonage montré par le club a créé `~/adf/amis-de-foot`. Depuis `~/adf`, la commande `cd app` rejoint `~/adf/app`, pas le projet cloné. Utiliser explicitement :

```bash
cd ~/adf/amis-de-foot/app
pwd
php -v
```

Le verrou Composer contient Laravel Pint en dépendance de développement ; sa version verrouillée exige PHP 8.3. Pour le staging, ne pas installer les dépendances de développement :

```bash
composer install --no-dev --optimize-autoloader
composer check-platform-reqs --no-dev
```

Le projet et Laravel 12 acceptent PHP 8.2, mais PHP 8.3 reste recommandé et doit être sélectionné dans cPanel pour aligner CLI et site web. Ne pas lancer `composer update` : cela modifierait le verrou des dépendances.

## Sources techniques

- [Créer et gérer les sous-domaines sur o2switch](https://faq.o2switch.fr/cpanel/domaines/configuration-sous-domaine/)
- [Accès SSH sur un hébergement o2switch](https://faq.o2switch.fr/guides/webmastering/connexion-ssh/)
- [Hébergement PHP, Composer et racine publique](https://faq.o2switch.fr/guides/php/heberger-application-symfony/)
- [Configurer Node.js pour compiler les ressources front-end](https://faq.o2switch.fr/guides/nodejs/application-reactjs/)
- [Rendre les commandes Node et npm accessibles en SSH](https://faq.o2switch.fr/guides/nodejs/utiliser-binaire-nodejs-npm-yarn/)
- [Protéger un répertoire web par mot de passe](https://faq.o2switch.fr/cpanel/fichiers/protection-repertoire-web/)
- [Exigences et déploiement Laravel 12](https://laravel.com/framework/docs/12.x/deployment)
