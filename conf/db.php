<?php

define('DB_HOST', filter_input(INPUT_ENV, 'DB_HOST'));
define('DB_DATABASE', filter_input(INPUT_ENV, 'DB_DATABASE'));
define('DB_USER', filter_input(INPUT_ENV, 'DB_USER'));
define('DB_PASSWORD', filter_input(INPUT_ENV, 'DB_PASSWORD'));

$pdo = new PDO(
  'mysql:host=' . DB_HOST . ';dbname=' . DB_DATABASE,
  DB_USER,
  DB_PASSWORD,
  [PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8']
);
