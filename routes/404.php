<?php

/**
 * On change le header pour indiquer au navigateur
 * qu'il s'agit d'une erreur 404, que la page
 * recherchée n'existe pas.
 */
header('HTTP/1.0 404 Not Found');

/**
 * Pour finir on interrompt
 * l'exécution du script php.
 */
exit;
