<?php

$router->ajouterRoute('/', function ($_, Response $res) {
  $res->template('accueil.html.twig');
});
