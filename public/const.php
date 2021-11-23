<?php

/**
 * Définition de constantes contenant les adresses
 * absolues des différents dossiers du projet
 */
define('__ROOT__', dirname(__DIR__));
define('__CONF__', __ROOT__ . '/conf');
define('__ROUTES__', __ROOT__ . '/routes');
define('__TEMPLATES__', __ROOT__ . '/templates');
define('SERVER_URL', filter_input(INPUT_ENV, 'SERVER_URL'));
