# Jeu Memory

## Prérequis

Pour ce projet, il faut préalablement:

- installer et lancer [Docker Desktop](https://www.docker.com/products/docker-desktop)
- installer [composer](https://getcomposer.org/)
- installer [node](https://nodejs.org/)

## Installation

```bash
# Cloner le dépôt dans le dossier memory
git clone https://github.com/sylvainmrs/memory memory

# Se rendre dans le dossier memory
cd memory

# Installer les dépendances php du projet
composer install

# Se rendre dans le dossier du front
cd app

# Installer les dépendances javascript
npm i

#Compiler le front
npm run build

# Démarrer les serveurs php et mariadb avec docker [-d optionnel]
docker-compose up [-d]
```

## Initialisation

Au démarrage du conteneur, la base de données est vide, il faut l'initialiser en se rendant via le navigateur à l'adresse [localhost:8000/init](http://localhost:8000/init)

## Lancer le jeu

Pour lancer le jeu, il faut se rendre via le navigateur à l'adresse [localhost:8000](http://localhost:8000)

## Back

### Twig

Les différentes pages générées par le back php sont notamment écrites avec le moteur de template [twig](https://twig.symfony.com/) développé par [Symfony](https://symfony.com/). Un template permet d'écrire des pages html avec des scripts php, mais à la syntaxe simplifiée, ce qui rend le tout plus lisible. Il permet également de définir un fichier `layout.html.twig` par exemple, qui sera notre squelete HTML basique dans lequel on intégrera des _blocs_. Cela permet à d'autres fichiers twig de reprendre `layout.html.twig` en modifiant uniquement le contenu des blocs.

### Structure du projet

- `classes`
  - `Request.php` gère les requêtes au serveur
  - `Response.php` gère les réponses du serveur
  - `Router.php` gère l'affichage des différentes pages selon la route
  - `TempsDeJeu.php` gère la connexion à la table des temps de jeu en BDD
- `conf`
  - `db.php` initie la connexion à la base de données
  - `tpl.php` initie le moteur de templates
- `public` point d'entrée du serveur
  - `const.php` constantes, variables d'environnement...
  - `index.php` d'où toute la magie opère
- `routes` les différentes pages du projet
  - `accueil.php` charge la partie front du projet
  - `init.php` initialise la base de données
  - `temps-de-jeu.php` api pour que le front puisse accéder à la table des temps de jeu
- `templates`
  - `404.html.twig`
  - `accueil.html.twig`
  - `erreur.html.twig`
  - `init.html.twig`
  - `layout.html.twig`
- `vendor` dépendances
- `composer.json` liste des dépendances

## Front

### Svelte

Le front est une application basée sur [svelte](https://svelte.dev/), une librairie javascript basée sur les compostants comme React, mais n'utilise pas de DOM virtuel et compile le projet en simple javascript côté serveur, ce qui évite de charger toute la librairie dans le navigateur ou de donner tout le travail à ce dernier.

### Développement

Une fois compilé dans le dossier `dist`, le front est chargé avec une balise `<script>` dans le template twig `accueil.html.twig`.

Pour le compiler, il faut au préalable avoir installé [node](https://nodejs.org/).

```bash
# Se déplacer dans le dossier
cd app

# Compiler le front
npm run build

# Re-compiler automatiquement à chaque modification
npm run dev
```

### Structure du projet

- `dist` code compilé
- `public` image du projet
- `src` code source du projet
  - `components` composants
    - `Carte.svelte` carte à retourner
    - `Chrono.svelte` affichage du compteur de temps
    - `Fruit.svelte` image des fruits
    - `Icone.svelte` pour gérer les icones svg
    - `Menu.svelte` menu avec la liste des temps, le bouton de démarrage et les messages de fin de jeu
    - `Plateau.svelte` plateau de jeu regroupant plusieurs composants
  - `lib` librairies
    - `api.js` classe pour les appels à l'API (back php)
    - `fruits.js` constantes sur les images de fruit
    - `jeu.js` classe qui gère l'essentiel du jeu
  - `App.svelte` composant princiapl
  - `main.js` point d'entreée du script js une fois compilé
- `package.json` liste des dépendances et des scripts nodejs
- `rollup.config.js` configuration de la compilation

## Déployer

On déploiera cette application sur l'hébergeur [AlwaysData](https://www.alwaysdata.com/) qui a l'avantage d'offrir un accès SSH, npm et composer de préinstallé sur leurs machines et 100Mo de stockage gratuit, ce qui est largement suffisant.

Un exemple est disponible ici : [memory.alwaysdata.net](https://memory.alwaysdata.net/)

### Installation

Après avoir créé un compte et [configuré ses clés SSH](https://help.alwaysdata.com/fr/acc%C3%A8s-distant/ssh/utiliser-des-cl%C3%A9s-ssh/), on peut se connecter au serveur en SSH et y exécuter les commandes suivantes.

```bash
rm -r www/
git clone https://github.com/sylvainmrs/memory www
cd www
composer install
cd app
npm i
npm run build
```

### Base de données

Dans [l'administration d'AlwaysData](https://admin.alwaysdata.com/database/?type=mysql), créer une base de données pour y sauvegarder les temps de jeu, et récupérer les différentes informations nécessaires pour la partie suivante.

### Configuration

Dans la configuration du site, dans [l'administration d'AlwaysData](https://admin.alwaysdata.com/site/), il faut forcer le HTTPS dans l'onglet SSL et ajouter les variables d'environnnement suivantes (en remplaçant les valeurs entre crochets par les valeurs correspondant à votre site / base de données) :

```env
DB_HOST=mysql-[database-name].alwaysdata.net:3306
DB_DATABASE=[database-name]
DB_USER=[user]
DB_PASSWORD=[mot de passe]
SERVER_URL=https://[site].alwaysdata.net
NB_CARTES=14
TEMPS_TOTAL=200
```

NB: `NB_CARTES` et `TEMPS_TOTAL` correspondent respectivement au nombre de cartes (qui sera multiplié par deux pour obtenir les paires) et au temps pour finir le jeu.

### Mise à jour

Après connexion SSH au serveur, dans le dossier www, exécuter la commande `git pull`.
