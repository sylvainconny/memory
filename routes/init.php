<?php

/**
 * Création de la table qui enregistrera les temps de jeu
 */

try {
  $pdo->exec("CREATE TABLE IF NOT EXISTS temps_de_jeu (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    temps_realise INT NOT NULL,
    date_partie TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP 
  ) CHARACTER SET utf8 COLLATE utf8_general_ci");
  echo 'Base de données initialisée';
} catch (Exception $err) {
  include __ROUTES__ . '/erreur.php';
}
exit;
