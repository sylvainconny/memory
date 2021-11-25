<?php

use Twig\Loader\FilesystemLoader;
use Twig\Environment;

/**
 * Démarrage du moteur de template
 */
$twig = new Environment(
  new FilesystemLoader(__TEMPLATES__)
);
