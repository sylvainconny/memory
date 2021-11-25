<?php

/**
 * Définition de constantes contenant les adresses
 * absolues des différents dossiers du projet
 */
define('__ROOT__', dirname(__DIR__));
define('__CONF__', __ROOT__ . '/conf');
define('__CLASSES__', __ROOT__ . '/classes');
define('__ROUTES__', __ROOT__ . '/routes');
define('__TEMPLATES__', __ROOT__ . '/templates');
define('SERVER_URL', $_ENV['SERVER_URL']);
