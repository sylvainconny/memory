<?php

/**
 * Création de la table qui enregistrera les temps de jeu
 */

require_once __CLASSES__ . '/TempsDeJeu.php';

try {
  $tempsDeJeu = new TempsDeJeu($pdo);
  $tempsDeJeu->creerTable();
} catch (Throwable $err) {
  include __TEMPLATES__ . '/erreur.php';
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
