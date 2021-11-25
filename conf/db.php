<?php

/**
 * Définition des informations de connexion à la base de données
 * via les variables d'environnement ici renseignées dans le
 * fichier docker-compose.yaml
 */
define('DB_HOST', filter_input(INPUT_ENV, 'DB_HOST'));
define('DB_DATABASE', filter_input(INPUT_ENV, 'DB_DATABASE'));
define('DB_USER', filter_input(INPUT_ENV, 'DB_USER'));
define('DB_PASSWORD', filter_input(INPUT_ENV, 'DB_PASSWORD'));

/**
 * Instanciation d'une variable $pdo contenant la connexion
 * à la base de données. En incluant ce fichier dans d'autres
 * scripts php, on pourra accéder à cette variable et donc à la
 * base de données.
 */
try {
  $pdo = new PDO(
    'mysql:host=' . DB_HOST . ';dbname=' . DB_DATABASE,
    DB_USER,
    DB_PASSWORD,
    [PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8']
  );
} catch (Throwable $err) {
  echo $err->getMessage();
  die;
}
