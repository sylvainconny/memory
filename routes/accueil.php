<?php

/**
 * Cette route affiche simplement le template accueil.html.twig
 */
$router->ajouterRoute('/', function ($_, Response $res) {
  $res->template('accueil.html.twig');
});
