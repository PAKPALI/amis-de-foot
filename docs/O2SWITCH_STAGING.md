# Déploiement staging sur o2switch

**État : procédure préparée ; sous-domaine, accès cPanel et base staging à renseigner par le club.** Aucun changement n'a été appliqué sur l'hébergement.

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

### 5. Préparer React et les ressources Vite

L'application est servie par Laravel/PHP ; Node.js sert uniquement à compiler les ressources React. Activer dans cPanel l'environnement Node pris en charge, exécuter la commande `source ...` fournie par cPanel, puis :

```bash
npm ci
npm run build
```

Ne pas lancer `npm run dev` sur l'hébergement.

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

## Sources techniques

- [Créer et gérer les sous-domaines sur o2switch](https://faq.o2switch.fr/cpanel/domaines/configuration-sous-domaine/)
- [Accès SSH sur un hébergement o2switch](https://faq.o2switch.fr/guides/webmastering/connexion-ssh/)
- [Hébergement PHP, Composer et racine publique](https://faq.o2switch.fr/guides/php/heberger-application-symfony/)
- [Configurer Node.js pour compiler les ressources front-end](https://faq.o2switch.fr/guides/nodejs/application-reactjs/)
- [Protéger un répertoire web par mot de passe](https://faq.o2switch.fr/cpanel/fichiers/protection-repertoire-web/)
- [Exigences et déploiement Laravel 12](https://laravel.com/framework/docs/12.x/deployment)
