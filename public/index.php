<?php

/**
 * Grâce au .htaccess, toutes les requêtes sur localhost:8080
 * sont redirigées vers ce fichier
 */

// inclusion des constantes du projet
require_once __DIR__ . '/const.php';
// inclusion de $pdo
require_once __CONF__ . '/db.php';

/**
 * $route contient le chemin de l'URL, soit
 * tout ce qu'il y a après http://localhost:8080
 */
$route = filter_input(INPUT_SERVER, 'REQUEST_URI');

/**
 * Selon la route, on affichera un contenu différent
 */
switch ($route) {
  case '/':       // accueil
    echo 'Hello World';
    break;
  case '/init':   // initialisation de la base de données
    include __ROUTES__ . '/init.php';
    break;
  default:        // page inexistante
    include __ROUTES__ . '/404.php';
}
