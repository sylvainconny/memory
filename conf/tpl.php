<?php

use Twig\Loader\FilesystemLoader;
use Twig\Environment;

$twig = new Environment(
  new FilesystemLoader(__TEMPLATES__)
);
