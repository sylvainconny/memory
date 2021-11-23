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
 * Exécution d'une requête simple sur la base de données
 * pour vérifier l'existance de la table temps_de_jeu
 */
try {
  $requeteTest = $pdo->prepare('SELECT * FROM temps_de_jeu LIMIT 0, 1');
  $requeteTest->execute();
} catch (PDOException $err) {
  /**
   * Si le code d'erreur est 42S02, c'est que la table
   * n'existe pas, on initialisera la table
   */
  if ($err->getCode() == '42S02') {
    include __TEMPLATES__ . '/init.php';
    exit;
  }
  /**
   * Sinon afficher la page d'erreur
   */
  include __TEMPLATES__ . '/erreur.php';
} catch (Throwable $err) {
  /**
   * si l'erreur ne vient pas de la base
   */
  include __TEMPLATES__ . '/erreur.php';
}


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
  case '/temps-de-jeu':
    include __ROUTES__ . '/temps-de-jeu.php';
    break;
  default:        // page inexistante
    include __ROUTES__ . '/404.php';
}
