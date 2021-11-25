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

### Projet

- **dist** dossier contenant le code compilé
- **public** contient les images du projet
- **src**
  - **components**
    - **Carte.svelte**
    - **Chrono.svelte**
    - **Fruit.svelte**
    - **Icone.svelte**
    - **Menu.svelte**
    - **Plateau.svelte**
  - **lib**
    - **api.js**
    - **fruits.js**
    - **jeu.js**
  - **App.svelte**
  - **main.js**
- **package.json**
- **rollup.config.js**
