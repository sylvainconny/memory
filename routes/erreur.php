<?php

/**
 * Page d'erreur
 */
// si l'erreur existe
if (isset($err) and !empty($err)) {
  // afficher l'erreur
  echo "<p>{$err->getMessage()}: {$err->getMessage()}</p>";
}
exit;
