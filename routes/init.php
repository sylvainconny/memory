<?php

/**
 * Création de la table qui enregistrera les temps de jeu
 */

require_once __CLASSES__ . '/TempsDeJeu.php';

// pdo et router sont des variables globales
$router->ajouterRoute('/init', function ($_, Response $res) use ($pdo) {
  try {
    $tempsDeJeu = new TempsDeJeu($pdo);
    $tempsDeJeu->creerTable();
    $res->template('init.html.twig');
  } catch (Throwable $err) {
    $res->error($err, false);
  }
});
