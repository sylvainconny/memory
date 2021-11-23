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
} catch (Throwable $err) {
  include __ROUTES__ . '/erreur.php';
  exit;
}

$head_title = 'Base de données initialisée';
?>

<!DOCTYPE html>
<html lang="fr">
<?php include __TEMPLATES__ . '/head.php'; ?>

<body>
  <section class="d-flex min-vh-100 justify-content-center align-items-center">
    <div class="alert alert-success">
      <h1>Initialisation</h1>
      <p>Base de données initialisée.</p>
    </div>
  </section>
</body>

</html>
