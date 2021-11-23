<?php

/**
 * Grâce au .htaccess, toutes les requêtes sur localhost:8080
 * sont redirigées vers ce fichier
 */

// inclusion des constantes du projet
require_once __DIR__ . '/const.php';
// inclusion des librairies composer
require_once __ROOT__ . '/vendor/autoload.php';
// inclusion de $pdo
require_once __CONF__ . '/db.php';
// inclusion de $twig
require_once __CONF__ . '/tpl.php';
// classes
require_once __CLASSES__ . '/Router.php';
require_once __CLASSES__ . '/Request.php';
require_once __CLASSES__ . '/Response.php';

/**
 * $route contient le chemin de l'URL, soit
 * tout ce qu'il y a après http://localhost:8080
 */
$router = new Router();

/**
 * Chargement des routes
 */
require_once __ROUTES__ . '/accueil.php';
require_once __ROUTES__ . '/init.php';
require_once __ROUTES__ . '/temps-de-jeu.php';

$router->demarrer(
  new Request(),
  new Response($twig)
);
