<?php

require_once __DIR__ . '/const.php';
require_once __CONF__ . '/db.php';

$route = filter_input(INPUT_SERVER, 'REQUEST_URI');

switch ($route) {
  case '/':
    echo 'Hello World';
    break;
  case '/init':
    include __ROUTES__ . '/init.php';
    break;
  default:
    header('HTTP/1.0 404 Not Found');
    exit;
}
