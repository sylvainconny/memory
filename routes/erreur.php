<?php

/**
 * Page d'erreur
 */
// si l'erreur existe
if (isset($err) and !empty($err)) {
  // afficher l'erreur
  $message_erreur = $err->getMessage();
  $code_erreur = $err->getCode();
} else {
  $message_erreur = "Pas d'erreur";
  $code_erreur = 0;
}
include __TEMPLATES__ . '/erreur.php';
exit;
