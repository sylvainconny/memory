# Jeu Memory

## Prérequis

Pour ce projet, il faut préalablement:

- installer et lancer [Docker Desktop](https://www.docker.com/products/docker-desktop)
- installer [composer](https://getcomposer.org/)

## Installation

```bash
# Cloner le dépôt dans le dossier memory
git clone https://github.com/sylvainmrs/memory memory
# Se rendre dans le dossier memory
cd memory
# Installer les dépendances php du projet
composer install
# Démarrer les serveurs php et mariadb avec docker [-d optionnel]
docker-compose up [-d]
```

## Initialisation

Au démarrage du conteneur, la base de données est vide, il faut l'initialiser en se rendant via le navigateur à l'adresse [localhost:8000/init](http://localhost:8000/init)

## Lancer le jeu

Pour lancer le jeu, il faut se rendre via le navigateur à l'adresse [localhost:8000](http://localhost:8000)
